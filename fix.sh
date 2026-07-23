cat > src/app/\(dashboard\)/invoices/page.tsx << 'EOF'
import { InvoiceList } from "../../../features/invoicing/invoice-list";
import { listInvoices } from "../../../domain/invoicing/invoicing.queries";
export default async function InvoicesPage() {
  const result = await listInvoices();
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">الفواتير</h1>
      <InvoiceList initialData={result.success ? result.data : []} initialError={result.success ? null : result.error} />
    </div>
  );
}
EOF
cat > src/app/\(dashboard\)/invoices/new/page.tsx << 'EOF'
import { InvoiceForm } from "../../../../features/invoicing/invoice-form";
import { getPatientsList, getClinicProcedures, getUninvoicedSessions } from "../../../../domain/invoicing/invoicing.queries";
export default async function NewInvoicePage() {
  const [patientsRes, proceduresRes, sessionsRes] = await Promise.all([
    getPatientsList(), getClinicProcedures(), getUninvoicedSessions(),
  ]);
  return (
    <div className="p-6">
      <InvoiceForm 
        initialPatients={patientsRes.success ? patientsRes.data : []}
        initialProcedures={proceduresRes.success ? proceduresRes.data : []}
        initialSessions={sessionsRes.success ? sessionsRes.data : []}
        initialPatientsError={patientsRes.success ? null : patientsRes.error}
        initialProceduresError={proceduresRes.success ? null : proceduresRes.error}
        initialSessionsError={sessionsRes.success ? null : sessionsRes.error}
      />
    </div>
  );
}
EOF
cat > src/app/\(dashboard\)/invoices/\[id\]/page.tsx << 'EOF'
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
EOF
