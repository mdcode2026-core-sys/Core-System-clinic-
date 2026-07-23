// ============================================================
// src/app/(dashboard)/invoices/page.tsx
// Phase 5 — Invoice List Page (Server Component)
// ============================================================

import { InvoiceList } from "../../../features/invoicing/invoice-list";
import { listInvoices } from "../../../domain/invoicing/invoicing.queries";

export default async function InvoicesPage() {
  const result = await listInvoices();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">الفواتير</h1>
      <InvoiceList 
        initialData={result.success ? result.data : []} 
        initialError={result.success ? null : result.error} 
      />
    </div>
  );
}
