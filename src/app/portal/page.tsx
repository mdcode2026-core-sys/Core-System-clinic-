import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEntitlement, hasCapability } from "@/core/entitlements/entitlementEngine";

export default async function PatientPortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/activate");

  const { data: identity } = await supabase.from("patient_identities").select("id,status").eq("auth_user_id", user.id).maybeSingle();
  if (!identity || identity.status !== "active") {
    return <main className="mx-auto max-w-lg p-6"><h1 className="text-2xl font-semibold">Patient Portal</h1><p className="mt-2 text-sm text-muted-foreground">Your patient portal identity is not active yet.</p></main>;
  }

  const { data: relationship } = await supabase.from("patient_clinic_relationships").select("tenant_id,clinic_patient_id,status").eq("patient_identity_id", identity.id).eq("status", "active").limit(1).maybeSingle();
  if (!relationship) {
    return <main className="mx-auto max-w-lg p-6"><h1 className="text-2xl font-semibold">Patient Portal</h1><p className="mt-2 text-sm text-muted-foreground">No active clinic relationship is available for this account.</p></main>;
  }

  const portalEnabled = await hasEntitlement(relationship.tenant_id, "patient_portal");
  if (!portalEnabled || !(await hasCapability(relationship.tenant_id, "patient_portal.access"))) {
    return <main className="mx-auto max-w-lg p-6"><h1 className="text-2xl font-semibold">Patient Portal</h1><p className="mt-2 text-sm text-muted-foreground">Patient Portal is not currently enabled for this clinic.</p></main>;
  }

  const { data: patient } = await supabase.from("clinic_patients").select("first_name,last_name,first_name_ar,last_name_ar,email,phone_primary,date_of_birth,gender,file_number").eq("id", relationship.clinic_patient_id).maybeSingle();
  if (!patient) return <main className="mx-auto max-w-lg p-6"><h1 className="text-2xl font-semibold">Patient Portal</h1><p className="mt-2 text-sm text-muted-foreground">Patient record could not be loaded.</p></main>;

  return (
    <main className="min-h-screen bg-muted/20 p-6" dir="auto">
      <div className="mx-auto max-w-4xl">
        <header className="rounded-2xl border bg-background p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">CORE SYSTEM</p>
          <h1 className="mt-1 text-3xl font-semibold">Patient Portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">Secure access to your information with this clinic.</p>
        </header>

        <section className="mt-6 rounded-2xl border bg-background p-6 shadow-sm">
          <h2 className="text-xl font-semibold">My profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><span className="text-xs text-muted-foreground">Name</span><p className="font-medium">{patient.first_name} {patient.last_name}</p></div>
            <div><span className="text-xs text-muted-foreground">File number</span><p className="font-medium">{patient.file_number ?? "—"}</p></div>
            <div><span className="text-xs text-muted-foreground">Email</span><p className="font-medium">{patient.email ?? "—"}</p></div>
            <div><span className="text-xs text-muted-foreground">Phone</span><p className="font-medium">{patient.phone_primary}</p></div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-background p-6 shadow-sm"><h2 className="font-semibold">Appointments</h2><p className="mt-2 text-sm text-muted-foreground">Your permitted appointments will appear here.</p></div>
          <div className="rounded-2xl border bg-background p-6 shadow-sm"><h2 className="font-semibold">Medical files</h2><p className="mt-2 text-sm text-muted-foreground">Released medical files will appear here when enabled and authorized.</p></div>
        </section>
      </div>
    </main>
  );
}
