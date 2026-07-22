// ============================================================
// src/app/(dashboard)/invoices/page.tsx
// Phase 5 — Invoices List Page
// ============================================================

import { InvoiceList } from "../../features/invoicing/invoice-list";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <InvoiceList />
    </div>
  );
}
