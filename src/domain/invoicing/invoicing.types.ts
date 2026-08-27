import type { Database } from "@/infrastructure/supabase/database.types";

export type InvoiceStatus = "draft" | "issued" | "paid" | "partial" | "cancelled" | "refunded";
export type PaymentMethod = "cash" | "card" | "bank_transfer" | "insurance" | "online" | "other";
export type PaymentTerms = "cash" | "credit" | "installment";

export interface Invoice {
  id: string;
  tenant_id: string;
  session_id: string;
  patient_id: string;
  invoice_number: string | null;
  invoice_date: string;
  invoice_status: InvoiceStatus;
  payment_terms: PaymentTerms | null;
  notes: string | null;
  issued_at: string | null;
  subtotal_subunits: number;
  tax_subunits: number;
  discount_subunits: number;
  total_subunits: number;
  amount_paid_subunits: number;
  amount_due_subunits: number | null;
  payment_method: string | null;
  collected_by: string | null;
  discount_approved_by: string | null;
  discount_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  tenant_id: string;
  invoice_id: string;
  procedure_id: string | null;
  description: string | null;
  description_ar: string | null;
  quantity: number;
  unit_price_subunits: number;
  discount_subunits: number;
  tax_subunits: number;
  tax_rate_percent: number | null;
  line_total_subunits: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface InvoicePayment {
  id: string;
  tenant_id: string;
  invoice_id: string;
  financial_plan_id: string | null;
  installment_id: string | null;
  amount_subunits: number;
  payment_method: PaymentMethod;
  payment_reference: string | null;
  transaction_id: string | null;
  notes: string | null;
  collected_by: string | null;
  payment_date: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
  payments: InvoicePayment[];
  patient?: { id: string; first_name: string; last_name: string; phone_primary: string };
  session?: { id: string; session_status: string; session_started_at: string | null };
}

export interface PatientOption { id: string; first_name: string; last_name: string; phone_primary: string | null; }
export interface ProcedureOption { id: string; procedure_name: string; base_price_subunits: number; tax_rate_percent: number | null; tax_included: boolean | null; }
export interface SessionOption { id: string; patient?: { id: string; first_name: string; last_name: string; phone_primary: string | null } | null; session_started_at: string; }

export interface CreateInvoiceFromSessionInput { session_id: string; }
export interface CreateManualInvoiceInput {
  patient_id: string;
  session_id?: string | null;
  invoice_date?: string;
  payment_terms?: PaymentTerms;
  notes?: string | null;
  items: { procedure_id?: string | null; description: string; quantity: number; unit_price_subunits: number; discount_amount_subunits?: number; discount_percent?: number | null; discount_reason?: string | null; tax_rate_percent?: number | null }[];
}
export interface IssueInvoiceInput { invoice_id: string; }
export interface RecordPaymentInput { invoice_id: string; amount_subunits: number; payment_method: PaymentMethod; reference_number?: string | null; notes?: string | null; installment_id?: string | null; }
export interface ApplyDiscountInput { invoice_id: string; discount_amount_subunits?: number; discount_percent?: number; discount_reason: string; }
export interface CancelInvoiceInput { invoice_id: string; reason: string; }

export type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };
export interface InvoiceListFilters { patient_id?: string; status?: InvoiceStatus; date_from?: string; date_to?: string; session_id?: string; }
export interface InvoiceListItem { id: string; invoice_number: string | null; invoice_date: string; invoice_status: InvoiceStatus; patient_name: string; total_subunits: number; amount_paid_subunits: number; amount_due_subunits: number | null; item_count: number; }
export interface InvoiceCalculation { subtotal: number; discount: number; tax: number; total: number; }
export interface LineItemCalculation { unitPrice: number; quantity: number; discountAmount: number; discountPercent: number | null; taxRate: number | null; taxAmount: number; lineTotal: number; }
export interface InvoiceFormState { patient_id: string; session_id: string | null; payment_terms: PaymentTerms; notes: string; items: InvoiceFormItem[]; }
export interface InvoiceFormItem { tempId: string; procedure_id: string | null; description: string; quantity: number; unit_price_subunits: number; discount_amount_subunits: number; discount_percent: number | null; discount_reason: string | null; tax_rate_percent: number | null; tax_included: boolean; }
export interface CanEditInvoiceResult { canEdit: boolean; reason: string | null; }
void (null as unknown as Database);
