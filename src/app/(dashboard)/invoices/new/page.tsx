// ============================================================
// src/app/(dashboard)/invoices/new/page.tsx
// Phase 5 — New Invoice Page
// ============================================================

import { InvoiceForm } from "@/features/invoicing/invoice-form";

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <InvoiceForm />
    </div>
  );
}
