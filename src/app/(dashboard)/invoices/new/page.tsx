import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { InvoiceForm } from "@/features/invoicing/invoice-form";
import { getPatientsList, getClinicProcedures, getUninvoicedSessions } from "@/domain/invoicing/invoicing.queries";

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: clinicUser } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!clinicUser?.tenant_id) {
    redirect("/login");
  }

  const permissions = await getEffectivePermissions(user.id, clinicUser.tenant_id);

  if (!permissions.includes("invoices:create")) {
    redirect("/invoices");
  }

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
