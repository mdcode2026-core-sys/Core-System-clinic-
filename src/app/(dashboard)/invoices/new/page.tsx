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
