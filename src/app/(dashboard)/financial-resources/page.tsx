import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getFinancialResourcesMessages } from "@/core/i18n/financialResourcesMessages";
import { listPurchaseOrders, listSuppliers } from "@/domain/financial-resources/financial-resources.queries";
import { FinancialResourcesCenter } from "@/features/financial-resources/financial-resources-center";
import type { Locale } from "@/core/i18n/messages";
import type { Permission } from "@/core/permissions/types";

export default async function FinancialResourcesPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  const canReadAny = permissions.includes("invoices:read") || permissions.includes("insurance:read") || permissions.includes("purchasing:read");
  if (!canReadAny) redirect("/");

  const cookieStore = await cookies();
  const rawLocale = cookieStore.get("core-system-locale")?.value;
  const locale: Locale = rawLocale === "ar" ? "ar" : "en";
  const t = getFinancialResourcesMessages(locale);

  const [tenantResult, patientsResult, plansResult, insuranceResult, supplierResult, purchaseResult, inventoryResult] = await Promise.all([
    supabase.from("master_tenants").select("currency").eq("id", tenantId).maybeSingle(),
    supabase.from("clinic_patients").select("id, first_name, last_name, phone_primary").eq("tenant_id", tenantId).is("deleted_at", null).order("first_name").limit(500),
    permissions.includes("invoices:read") ? supabase.from("financial_plans").select("id, patient_id, total_amount_subunits, patient_responsibility_subunits, insurance_covered_subunits, status, installments:financial_installments(id, installment_no, due_date, amount_subunits, amount_paid_subunits, status)").eq("tenant_id", tenantId).order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
    permissions.includes("insurance:read") ? supabase.from("patient_insurance_profiles").select("id, patient_id, payer_name, policy_number, member_number, claim_ready, status, reconciliation_status").eq("tenant_id", tenantId).order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
    permissions.includes("purchasing:read") ? listSuppliers() : Promise.resolve({ success: true as const, data: [] }),
    permissions.includes("purchasing:read") ? listPurchaseOrders() : Promise.resolve({ success: true as const, data: [] }),
    permissions.includes("inventory:read") ? supabase.from("inventory_items").select("id, name, current_stock, unit").eq("tenant_id", tenantId).eq("is_active", true).is("deleted_at", null).order("name").limit(500) : Promise.resolve({ data: [], error: null }),
  ]);

  return <div className="space-y-4 p-4 sm:p-6 lg:p-8" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1><p className="mt-1 text-sm text-muted-foreground">{t.description}</p></div>
    <FinancialResourcesCenter locale={locale} patients={patientsResult.data ?? []} plans={(plansResult.data ?? []) as never} insurance={(insuranceResult.data ?? []) as never} suppliers={supplierResult.success ? supplierResult.data as never : []} purchaseOrders={purchaseResult.success ? purchaseResult.data as never : []} inventoryItems={inventoryResult.data ?? []} permissions={permissions as Permission[]} currency={tenantResult.data?.currency ?? "USD"} />
  </div>;
}
