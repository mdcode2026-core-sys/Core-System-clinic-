import { notFound } from "next/navigation";
import { InvoiceDetail } from "../../../../features/invoicing/invoice-detail";
import { getInvoiceWithDetails } from "../../../../domain/invoicing/invoicing.actions";
interface Props { params: Promise<{ id: string }>; }
export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getInvoiceWithDetails(id);
  if (!result.success) notFound();
  return <div className="p-6"><InvoiceDetail invoice={result.data} /></div>;
}
