// ============================================================
// src/domain/invoicing/invoicing.types.ts
// Phase 5 — Invoicing Module Types
// ============================================================

import type { Database } from "@/infrastructure/supabase/database.types";

// -----------------------------------------------------------
// Database Table Types (Extracted from database.types.ts)
// -----------------------------------------------------------





// -----------------------------------------------------------
// Enums
// -----------------------------------------------------------

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "paid"
  | "partial"
  | "cancelled"
  | "refunded";

export type PaymentMethod =
  | "cash"
  | "credit_card"
  | "bank_transfer"
  | "insurance"
  | "other";

export type PaymentTerms = "cash" | "credit" | "installment";

// -----------------------------------------------------------
// Domain Types
// -----------------------------------------------------------

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
  quantity: number;
  unit_price_subunits: number;
  original_unit_price_subunits: number;
  discount_amount_subunits: number;
  discount_percent: number | null;
  discount_reason: string | null;
  tax_rate_percent: number | null;
  tax_amount_subunits: number;
  line_total_subunits: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface InvoicePayment {
  id: string;
  tenant_id: string;
  invoice_id: string;
  amount_subunits: number;
  payment_method: PaymentMethod;
  paid_at: string;
  reference_number: string | null;
  notes: string | null;
  received_by: string | null;
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------------------
// Invoice with Related Data (for UI display)
// -----------------------------------------------------------

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
  payments: InvoicePayment[];
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    phone_primary: string;
  };
  session?: {
    id: string;
    session_status: string;
    session_started_at: string | null;
  };
}

// -----------------------------------------------------------
// Server Action Input Types
// -----------------------------------------------------------

export interface CreateInvoiceFromSessionInput {
  session_id: string;
  tenant_id: string;
}

export interface CreateManualInvoiceInput {
  tenant_id: string;
  patient_id: string;
  session_id?: string | null;
  invoice_date?: string;
  payment_terms?: PaymentTerms;
  notes?: string | null;
  items: {
    procedure_id?: string | null;
    description: string;
    quantity: number;
    unit_price_subunits: number;
    discount_amount_subunits?: number;
    discount_percent?: number | null;
    discount_reason?: string | null;
    tax_rate_percent?: number | null;
  }[];
}

export interface IssueInvoiceInput {
  invoice_id: string;
}

export interface RecordPaymentInput {
  invoice_id: string;
  amount_subunits: number;
  payment_method: PaymentMethod;
  reference_number?: string | null;
  notes?: string | null;
}

export interface ApplyDiscountInput {
  invoice_id: string;
  discount_amount_subunits?: number;
  discount_percent?: number;
  discount_reason: string;
}

export interface CancelInvoiceInput {
  invoice_id: string;
  reason: string;
}

// -----------------------------------------------------------
// Server Action Result Types
// -----------------------------------------------------------

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// -----------------------------------------------------------
// Query Filter Types
// -----------------------------------------------------------

export interface InvoiceListFilters {
  patient_id?: string;
  status?: InvoiceStatus;
  date_from?: string;
  date_to?: string;
  session_id?: string;
}

export interface InvoiceListItem {
  id: string;
  invoice_number: string | null;
  invoice_date: string;
  invoice_status: InvoiceStatus;
  patient_name: string;
  total_subunits: number;
  amount_paid_subunits: number;
  amount_due_subunits: number | null;
  item_count: number;
}

// -----------------------------------------------------------
// Calculator Types
// -----------------------------------------------------------

export interface InvoiceCalculation {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export interface LineItemCalculation {
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  discountPercent: number | null;
  taxRate: number | null;
  taxAmount: number;
  lineTotal: number;
}

// -----------------------------------------------------------
// UI State Types
// -----------------------------------------------------------

export interface InvoiceFormState {
  patient_id: string;
  session_id: string | null;
  payment_terms: PaymentTerms;
  notes: string;
  items: InvoiceFormItem[];
}

export interface InvoiceFormItem {
  tempId: string;
  procedure_id: string | null;
  description: string;
  quantity: number;
  unit_price_subunits: number;
  discount_amount_subunits: number;
  discount_percent: number | null;
  discount_reason: string | null;
  tax_rate_percent: number | null;
  tax_included: boolean;
}

// -----------------------------------------------------------
// Permission Check Types
// -----------------------------------------------------------

export interface CanEditInvoiceResult {
  canEdit: boolean;
  reason: string | null;
}

// -----------------------------------------------------------
// Re-export for convenience
// -----------------------------------------------------------

export type {
  InvoiceRow,
  InvoiceInsert,
  InvoiceUpdate,
  InvoiceItemRow,
  InvoiceItemInsert,
  InvoiceItemUpdate,
  InvoicePaymentRow,
  InvoicePaymentInsert,
  InvoicePaymentUpdate,
  ProcedureRow,
};
