import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { FinancialResourcesCenter, type FinancialPlanSummary, type InsuranceSummary, type PatientSummary } from "@/features/financial-resources/financial-resources-center";
import type { Locale } from "@/core/i18n/messages";

export default async function BillingFinancialPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("core-system-locale")?.value;
  const locale: Locale = raw === "ar" ? "ar" : "en";
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("invoices:read")) redirect("/invoices");
  const [tenantResult, patientsResult, plansResult, insuranceResult] = await Promise.all([
    supabase.from("master_tenants").select("currency").eq("id", tenantId).maybeSingle(),
    supabase.from("clinic_patients").select("id, first_name, last_name, phone_primary").eq("tenant_id", tenantId).is("deleted_at", null).order("first_name").limit(500),
    supabase.from("financial_plans").select("id, patient_id, total_amount_subunits, patient_responsibility_subunits, insurance_covered_subunits, status, installments:financial_installments(id, installment_no, due_date, amount_subunits, amount_paid_subunits, status)").eq("tenant_id", tenantId).order("created_at", { ascending: false }),
    supabase.from("patient_insurance_profiles").select("id, patient_id, payer_name, policy_number, member_number, claim_ready, status, reconciliation_status").eq("tenant_id", tenantId).order("created_at", { ascending: false }),
  ]);
  const patients: PatientSummary[] = (patientsResult.data ?? []).map((p) => ({ id: p.id, first_name: p.first_name, last_name: p.last_name, phone_primary: p.phone_primary }));
  const plans: FinancialPlanSummary[] = (plansResult.data ?? []).map((p) => ({ id: p.id, patient_id: p.patient_id, total_amount_subunits: p.total_amount_subunits, patient_responsibility_subunits: p.patient_responsibility_subunits, insurance_covered_subunits: p.insurance_covered_subunits, status: p.status, installments: (p.installments ?? []).map((i) => ({ id: i.id, installment_no: i.installment_no, due_date: i.due_date, amount_subunits: i.amount_subunits, amount_paid_subunits: i.amount_paid_subunits, status: i.status })) }));
  const insurance: InsuranceSummary[] = (insuranceResult.data ?? []).map((x) => ({ id: x.id, patient_id: x.patient_id, payer_name: x.payer_name, policy_number: x.policy_number, member_number: x.member_number, claim_ready: x.claim_ready, status: x.status, reconciliation_status: x.reconciliation_status }));
  return <div className="space-y-4 p-6" dir={locale === "ar" ? "rtl" : "ltr"}><h1 className="text-2xl font-bold">{locale === "ar" ? "الخطط المالية والأقساط والتأمين" : "Financial Plans, Installments & Insurance"}</h1><FinancialResourcesCenter surface="billing" locale={locale} patients={patients} plans={plans} insurance={insurance} suppliers={[]} purchaseOrders={[]} inventoryItems={[]} permissions={permissions} currency={tenantResult.data?.currency ?? "USD"} /></div>;
}
