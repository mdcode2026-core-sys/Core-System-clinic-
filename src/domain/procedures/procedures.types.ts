"use client";

/**
 * PJ Stage 3 — Clinic Service Catalog Types
 * Canonical procedure/service definition for tenant-owned catalog.
 */

export interface ClinicProcedure {
  id: string;
  tenant_id: string;
  procedure_code: string | null;
  procedure_name: string;
  procedure_name_ar: string | null;
  category: string | null;
  specialty: string | null;
  service_type: string | null;
  provider_type: string | null;
  standard_duration_minutes: number;
  buffer_time_minutes: number;
  base_price_subunits: number;
  tax_included: boolean;
  tax_rate_percent: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClinicProcedureInsert {
  tenant_id: string;
  procedure_code?: string | null;
  procedure_name: string;
  procedure_name_ar?: string | null;
  category?: string | null;
  specialty?: string | null;
  service_type?: string | null;
  provider_type?: string | null;
  standard_duration_minutes?: number;
  buffer_time_minutes?: number;
  base_price_subunits?: number;
  tax_included?: boolean;
  tax_rate_percent?: number;
  display_order?: number;
  is_active?: boolean;
}

export interface ClinicProcedureUpdate {
  procedure_code?: string | null;
  procedure_name?: string;
  procedure_name_ar?: string | null;
  category?: string | null;
  specialty?: string | null;
  service_type?: string | null;
  provider_type?: string | null;
  standard_duration_minutes?: number;
  buffer_time_minutes?: number;
  base_price_subunits?: number;
  tax_included?: boolean;
  tax_rate_percent?: number;
  display_order?: number;
  is_active?: boolean;
}

export interface ProcedureActionResult {
  success: boolean;
  error: string | null;
  data?: ClinicProcedure;
}

/** Stage 3 initial specialties */
export const SPECIALTY_OPTIONS = [
  { value: "dentistry", label: "طب الأسنان", labelEn: "Dentistry" },
  { value: "aesthetic_medicine", label: "الطب التجميلي", labelEn: "Aesthetic Medicine" },
  { value: "dermatology", label: "الجلدية", labelEn: "Dermatology / Skin" },
] as const;

export type SpecialtyValue = typeof SPECIALTY_OPTIONS[number]["value"];

export const SERVICE_TYPE_OPTIONS = [
  { value: "procedure", label: "إجراء" },
  { value: "consultation", label: "استشارة" },
  { value: "package", label: "باقة" },
] as const;

export const PROVIDER_TYPE_OPTIONS = [
  { value: "doctor", label: "طبيب" },
  { value: "nurse", label: "ممرض" },
  { value: "therapist", label: "معالج" },
  { value: "any", label: "أي مقدم خدمة" },
] as const;
