// src/domain/queue/queue.queries.ts
// Phase 4 — Queue Management Module
// Supabase queries with tenant isolation — SERVER ACTIONS ONLY

"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { QueueSession, EnrichedSession, QueueStats, QueueFilters, SessionStatus } from "./queue.types";

// ── Helper: حساب وقت الانتظار بالدقائق ───────────────────
function computeWaitTimeMinutes(createdAt: string): number {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.floor(diff / 60000);
}

// ── Helper: نطاق اليوم ────────────────────────────────────
function getTodayRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

// ── Helper: قراءة tenantId من JWT ─────────────────────────
async function getTenantId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  const tenantId = user.user_metadata?.tenant_id as string | undefined;
  if (!tenantId) throw new Error("No tenant assigned");
  
  return tenantId;
}

// ── 1. جلب الطابور (الزيارات المُغنّاة) ───────────────────
export async function getQueue(filters?: QueueFilters): Promise<EnrichedSession[]> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { start, end } = getTodayRange();

  let query = supabase
    .from("clinic_visit_sessions")
    .select(`
      *,
      clinic_patients(first_name, last_name, phone_primary, file_number),
      clinic_users!clinic_visit_sessions_doctor_id_fkey(full_name),
      clinic_rooms(name)
    `)
    .eq("tenant_id", tenantId)
    .gte("created_at", start)
    .lt("created_at", end)
    .order("created_at", { ascending: true });

  // تطبيق الفلاتر
  if (filters?.status?.length) {
    query = query.in("session_status", filters.status);
  }
  if (filters?.doctor_id) {
    query = query.eq("doctor_id", filters.doctor_id);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Queue fetch failed: ${error.message}`);

  // تغني البيانات
  return (data || []).map((session: any) => ({
    ...session,
    patient_name: session.clinic_patients
      ? `${session.clinic_patients.first_name} ${session.clinic_patients.last_name}`
      : undefined,
    patient_phone: session.clinic_patients?.phone_primary,
    patient_file_number: session.clinic_patients?.file_number,
    doctor_name: session.clinic_users?.full_name,
    room_name: session.clinic_rooms?.name,
    wait_time_minutes: computeWaitTimeMinutes(session.created_at),
  })) as EnrichedSession[];
}

// ── 2. جلب إحصائيات الطابور ──────────────────────────────
export async function getQueueStats(): Promise<QueueStats> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { start, end } = getTodayRange();

  const { data, error } = await supabase
    .from("clinic_visit_sessions")
    .select("session_status, created_at")
    .eq("tenant_id", tenantId)
    .gte("created_at", start)
    .lt("created_at", end);

  if (error) throw new Error(`Stats fetch failed: ${error.message}`);

  const sessions = data || [];
  const waiting = sessions.filter((s: any) => s.session_status === "waiting");
  const inConsultation = sessions.filter((s: any) => s.session_status === "in_consultation");
  const completed = sessions.filter((s: any) => s.session_status === "completed");
  const noShows = sessions.filter((s: any) => s.session_status === "no_show");

  const waitTimes = waiting.map((s: any) => computeWaitTimeMinutes(s.created_at));
  const avgWait = waitTimes.length > 0
    ? Math.round(waitTimes.reduce((a: number, b: number) => a + b, 0) / waitTimes.length)
    : 0;
  const longestWait = waitTimes.length > 0 ? Math.max(...waitTimes) : 0;

  return {
    total_waiting: waiting.length,
    total_in_consultation: inConsultation.length,
    total_completed_today: completed.length,
    total_no_show_today: noShows.length,
    avg_wait_time_minutes: avgWait,
    longest_wait_minutes: longestWait,
  };
}

// ── 3. جلب زيارة واحدة ───────────────────────────────────
export async function getSessionById(sessionId: string): Promise<EnrichedSession | null> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data, error } = await supabase
    .from("clinic_visit_sessions")
    .select(`
      *,
      clinic_patients(first_name, last_name, phone_primary, file_number),
      clinic_users!clinic_visit_sessions_doctor_id_fkey(full_name),
      clinic_rooms(name)
    `)
    .eq("id", sessionId)
    .eq("tenant_id", tenantId)
    .single();

  if (error) return null;

  return {
    ...data,
    patient_name: data.clinic_patients
      ? `${data.clinic_patients.first_name} ${data.clinic_patients.last_name}`
      : undefined,
    patient_phone: data.clinic_patients?.phone_primary,
    patient_file_number: data.clinic_patients?.file_number,
    doctor_name: data.clinic_users?.full_name,
    room_name: data.clinic_rooms?.name,
    wait_time_minutes: computeWaitTimeMinutes(data.created_at),
  } as EnrichedSession;
}

// ── 4. جلب الأطباء النشطين ───────────────────────────────
export async function getActiveDoctors(): Promise<{ id: string; full_name: string; specialization: string | null }[]> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data, error } = await supabase
    .from("clinic_users")
    .select("id, full_name, specialization")
    .eq("tenant_id", tenantId)
    .eq("role", "doctor")
    .eq("is_active", true)
    .order("full_name");

  if (error) throw new Error(`Doctor fetch failed: ${error.message}`);
  return data || [];
}

// ── 5. جلب الغرف المتاحة ─────────────────────────────────
export async function getAvailableRooms(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data, error } = await supabase
    .from("clinic_rooms")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(`Room fetch failed: ${error.message}`);
  return data || [];
}
