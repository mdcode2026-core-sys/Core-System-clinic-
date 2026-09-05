import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { InsuranceClaimsOperations } from "@/features/financial-resources/insurance-claims-operations";
import type { Locale } from "@/core/i18n/messages";
export default async function InsurancePage(){
 const db=await createClient();const{data:{user}}=await db.auth.getUser();if(!user)redirect("/login");const tenantId=await resolveTenantId(user.id);if(!tenantId)redirect("/login");const permissions=await getEffectivePermissions(user.id,tenantId);if(!permissions.includes("insurance:read"))redirect("/");const c=await cookies();const locale:Locale=c.get("core-system-locale")?.value==="ar"?"ar":"en";
 const [patients,profiles,invoices,claims]=await Promise.all([
  db.from("clinic_patients").select("id,first_name,last_name").eq("tenant_id",tenantId).is("deleted_at",null).order("first_name").limit(1000),
  db.from("patient_insurance_profiles").select("id,patient_id,payer_name,policy_number,member_number").eq("tenant_id",tenantId).is("deleted_at",null).order("created_at",{ascending:false}).limit(1000),
  db.from("clinic_invoices").select("id,invoice_number,patient_id,amount_due_subunits").eq("tenant_id",tenantId).order("invoice_date",{ascending:false}).limit(500),
  db.from("insurance_claims").select("id,patient_id,insurance_profile_id,invoice_id,claim_reference,amount_claimed_subunits,amount_reconciled_subunits,status").eq("tenant_id",tenantId).is("deleted_at",null).order("created_at",{ascending:false}).limit(500)
 ]);
 return <div className="p-4 sm:p-6 lg:p-8"><InsuranceClaimsOperations locale={locale} currency="JOD" patients={patients.data??[]} profiles={profiles.data??[]} invoices={invoices.data??[]} claims={claims.data??[]}/></div>;
}
