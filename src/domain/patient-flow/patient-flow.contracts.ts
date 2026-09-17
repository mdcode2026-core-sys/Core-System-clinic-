export type VisitFinality =
  | "open"
  | "completed"
  | "cancelled"
  | "no_show";

export type ClinicalWorkSessionStatus =
  | "active"
  | "finished"
  | "held"
  | "transferred"
  | "cancelled";

export type PatientFlowQueuePresence = "no_active_entry" | "waiting";

export type OperationalDisposition =
  | "active"
  | "reassignment_eligible"
  | "escalated"
  | "closed_for_operation";

export type AdministrativeDisposition = "open" | "closed";

export type ClinicalWorkSessionOutcome =
  | "finish"
  | "hold"
  | "transfer"
  | "cancelled";

export type PatientFlowEventType =
  | "visit_arrived"
  | "entered_waiting"
  | "queue_reordered"
  | "clinical_work_started"
  | "clinical_work_finished"
  | "clinical_work_held"
  | "clinical_work_transferred"
  | "operational_handoff"
  | "operational_reassignment"
  | "carry_forward"
  | "operational_closed"
  | "administrative_closed"
  | "administrative_reopened"
  | "cancelled"
  | "no_show";

export type PatientFlowCommandName =
  | "arriveVisit"
  | "enterWaiting"
  | "reorderQueue"
  | "startClinicalWork"
  | "finishClinicalWork"
  | "holdVisit"
  | "resumeHeldVisit"
  | "transferVisit"
  | "handoffOperationalWork"
  | "reassignOperationalWork"
  | "carryForwardVisit"
  | "closeOperationalWork"
  | "closeVisitAdministratively"
  | "reopenVisitAdministratively"
  | "cancelVisit"
  | "markNoShow";

export type PatientFlowNextDisposition =
  | "operational_handoff"
  | "waiting"
  | "hold"
  | "transfer"
  | "admin_review";

export interface PatientFlowContext {
  tenantId: string;
  visitId: string;
  workSessionId?: string | null;
  queueEntryId?: string | null;
}

export interface FinishClinicalWorkResult extends PatientFlowContext {
  outcome: "finished";
  nextDisposition: PatientFlowNextDisposition;
  workItemId?: string | null;
}

export interface PatientFlowCommandResult extends PatientFlowContext {
  command: PatientFlowCommandName;
  success: boolean;
  eventId?: string | null;
  errorCode?: string;
}

/**
 * Transitional representation retained while the legacy Visit/session model
 * is migrated to the canonical multi-dimensional Patient Flow model.
 */
export interface LegacyVisitStatusCompatibility {
  legacySessionStatus:
    | "waiting"
    | "in_consultation"
    | "pending_close"
    | "completed"
    | "cancelled"
    | "no_show";
  visitFinality: VisitFinality;
  queuePresence: PatientFlowQueuePresence;
  clinicalWorkSessionStatus: ClinicalWorkSessionStatus | null;
}

export const PATIENT_FLOW_EVENT_TYPES: readonly PatientFlowEventType[] = [
  "visit_arrived",
  "entered_waiting",
  "queue_reordered",
  "clinical_work_started",
  "clinical_work_finished",
  "clinical_work_held",
  "clinical_work_transferred",
  "operational_handoff",
  "operational_reassignment",
  "carry_forward",
  "operational_closed",
  "administrative_closed",
  "administrative_reopened",
  "cancelled",
  "no_show",
] as const;
