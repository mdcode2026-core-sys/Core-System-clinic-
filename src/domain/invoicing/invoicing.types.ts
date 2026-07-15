export interface Invoice {
  id: string;
  tenant_id: string;
  session_id: string;
  patient_id: string;
  invoice_date: string;
  subtotal_subunits: number;
  total_subunits: number;
  amount_paid_subunits: number;
  invoice_status: "draft" | "issued" | "paid" | "partial" | "cancelled" | "refunded";
  created_at: string;
}

export interface InvoiceInsert {
  tenant_id: string;
  session_id: string;
  patient_id: string;
  subtotal_subunits: number;
  total_subunits: number;
  invoice_status?: "draft" | "issued" | "paid" | "partial" | "cancelled" | "refunded";
}
