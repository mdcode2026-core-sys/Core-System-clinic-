// src/domain/queue/queue.engine.ts
// Queue Engine: ordering, priority, flow and duration-aware ETA.

import { EnrichedSession, SessionStatus, VisitPriority, QueueLane } from "./queue.types";

export interface EngineResult { success: boolean; sessions: EnrichedSession[]; errors: string[]; }
export interface QueueRule { name: string; apply: (sessions: EnrichedSession[]) => EnrichedSession[]; }

const prioritySortRule: QueueRule = { name: "priority_sort", apply: (sessions) => [...sessions].sort((a, b) => { const priorityA = a.priority ?? VisitPriority.NORMAL; const priorityB = b.priority ?? VisitPriority.NORMAL; if (priorityB !== priorityA) return priorityB - priorityA; return new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); }) };
const laneIsolationRule: QueueRule = { name: "lane_isolation", apply: (sessions) => sessions.filter((s) => !(s.lane === QueueLane.DOCTOR && !s.doctor_id)) };
export const defaultQueueRules: QueueRule[] = [laneIsolationRule, prioritySortRule];

export class QueueEngine {
  private rules: QueueRule[];
  constructor(rules: QueueRule[] = defaultQueueRules) { this.rules = rules; }
  processQueue(sessions: EnrichedSession[]): EngineResult {
    const errors: string[] = []; let processed = [...sessions];
    for (const rule of this.rules) { try { const beforeCount = processed.length; processed = rule.apply(processed); if (processed.length < beforeCount) errors.push(`Rule '${rule.name}' filtered ${beforeCount - processed.length} sessions`); } catch (err) { errors.push(`Rule '${rule.name}' failed: ${err}`); } }
    processed = processed.map((session, index) => ({ ...session, queue_position: index + 1 }));
    return { success: errors.length === 0, sessions: processed, errors };
  }
  validateTransition(currentStatus: SessionStatus, newStatus: SessionStatus): { valid: boolean; reason?: string } {
    const allowedTransitions: Record<SessionStatus, SessionStatus[]> = {
      waiting: ["in_consultation", "no_show", "cancelled"],
      in_consultation: ["pending_close", "cancelled"],
      pending_close: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
      no_show: [],
    };
    const allowed = allowedTransitions[currentStatus] || [];
    return allowed.includes(newStatus) ? { valid: true } : { valid: false, reason: `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowed.join(", ") || "none"}` };
  }

  /**
   * ETA uses the stored procedure/session duration, includes remaining time for an active
   * consultation, and can optionally constrain the calculation to a room.
   * The 30-minute constant is only a last-resort fallback for legacy records with no duration data.
   */
  calculateEstimatedWait(queue: EnrichedSession[], targetDoctorId?: string, targetRoomId?: string): number {
    const durationOf = (session: EnrichedSession) => {
      const value = Number(session.estimated_duration_minutes ?? session.session_duration_minutes ?? 30);
      return Number.isFinite(value) && value > 0 ? value : 30;
    };
    const waiting = queue
      .filter((s) => s.session_status === "waiting")
      .filter((s) => !targetDoctorId || s.doctor_id === targetDoctorId)
      .filter((s) => !targetRoomId || s.room_id === targetRoomId)
      .sort((a, b) => (a.queue_position ?? Number.MAX_SAFE_INTEGER) - (b.queue_position ?? Number.MAX_SAFE_INTEGER));
    const active = queue
      .filter((s) => s.session_status === "in_consultation")
      .filter((s) => !targetDoctorId || s.doctor_id === targetDoctorId)
      .filter((s) => !targetRoomId || s.room_id === targetRoomId);
    const activeRemaining = active.reduce((sum, session) => {
      if (!session.session_started_at) return sum + durationOf(session);
      const elapsed = Math.max(0, (Date.now() - new Date(session.session_started_at).getTime()) / 60000);
      return sum + Math.max(0, durationOf(session) - elapsed);
    }, 0);
    return Math.max(0, Math.round(activeRemaining + waiting.reduce((sum, session) => sum + durationOf(session), 0)));
  }
}

export const queueEngine = new QueueEngine();
