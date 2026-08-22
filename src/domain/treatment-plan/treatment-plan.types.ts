export type TreatmentPlanStatus = "draft" | "active" | "on_hold" | "completed" | "cancelled";
export type TreatmentPlanItemStatus = "planned" | "scheduled" | "in_progress" | "completed" | "skipped" | "cancelled";

export interface TreatmentPlanItem {
  id: string;
  treatment_plan_id: string;
  procedure_id: string | null;
  procedure_name: string | null;
  title: string;
  description: string | null;
  sequence_no: number;
  planned_date: string | null;
  quantity: number;
  status: TreatmentPlanItemStatus;
  completed_at: string | null;
  notes: string | null;
}

export interface TreatmentPlanVisitLink {
  id: string;
  treatment_plan_item_id: string | null;
  visit_id: string;
  linked_at: string;
}

export interface TreatmentPlanRecord {
  id: string;
  patient_id: string;
  patient_name: string | null;
  source_visit_id: string | null;
  title: string;
  diagnosis_summary: string | null;
  goals: string | null;
  status: TreatmentPlanStatus;
  start_date: string | null;
  target_end_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  items: TreatmentPlanItem[];
  visits: TreatmentPlanVisitLink[];
}

export interface CreateTreatmentPlanInput {
  patientId: string;
  sourceVisitId?: string | null;
  title: string;
  diagnosisSummary?: string;
  goals?: string;
  startDate?: string | null;
  targetEndDate?: string | null;
}

export interface AddTreatmentPlanItemInput {
  treatmentPlanId: string;
  title: string;
  description?: string;
  procedureId?: string | null;
  plannedDate?: string | null;
  quantity?: number;
  notes?: string;
}
