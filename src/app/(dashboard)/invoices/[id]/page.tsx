// ============================================================
// src/app/(dashboard)/invoices/[id]/page.tsx
// Phase 5 — Invoice Detail Page
// ============================================================

import { notFound } from "next/navigation";
import { InvoiceDetail } from "../../../features/invoicing/invoice-detail";
import { getInvoiceWithDetails } from "../../../domain/invoicing/invoicing.actions";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const result = await getInvoiceWithDetails(id);

  if (!result.success) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <InvoiceDetail invoice={result.data} />
    </div>
  );
}
