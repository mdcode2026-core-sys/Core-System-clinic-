import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getFinancialResourcesMessages } from "@/core/i18n/financialResourcesMessages";
import { getPatientFinancialPlan, getPatientInsuranceProfiles, listPurchaseOrders, listSuppliers } from "@/domain/financial-resources/financial-resources.queries";
import { FinancialResourcesCenter } from "@/features/financial-resources/financial-resources-center";
import type { Locale } from "@/core/i18n/messages";

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
  const [{ data: tenant }, { data: patients }, planResult, insuranceResult, supplierResult, purchaseResult, { data: inventoryItems }] = await Promise.all([
    supabase.from("master_tenants").select("currency").eq("id", tenantId).maybeSingle(),
    supabase.from("clinic_patients").select("id, first_name, last_name, phone_primary").eq("tenant_id", tenantId).is("deleted_at", null).order("first_name").limit(500),
    permissions.includes("invoices:read") && patients?.length ? getPatientFinancialPlan(patients[0].id) : Promise.resolve({ success: true as const, data: [] }),
    permissions.includes("insurance:read") && patients?.length ? getPatientInsuranceProfiles(patients[0].id) : Promise.resolve({ success: true as const, data: [] }),
    permissions.includes("purchasing:read") ? listSuppliers() : Promise.resolve({ success: true as const, data: [] }),
    permissions.includes("purchasing:read") ? listPurchaseOrders() : Promise.resolve({ success: true as const, data: [] }),
    permissions.includes("inventory:read") ? supabase.from("inventory_items").select("id, name, current_stock, unit").eq("tenant_id", tenantId).eq("is_active", true).is("deleted_at", null).order("name").limit(500) : Promise.resolve({ data: [] }),
  ]);

  const plans = planResult.success && patients?.[0] ? planResult.data : [];
  const insurance = insuranceResult.success && patients?.[0] ? insuranceResult.data : [];

  return <div className="space-y-4 p-4 sm:p-6 lg:p-8" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1><p className="mt-1 text-sm text-muted-foreground">{t.description}</p></div>
    <FinancialResourcesCenter locale={locale} patients={patients ?? []} plans={plans as never} insurance={insurance as never} suppliers={supplierResult.success ? supplierResult.data as never : []} purchaseOrders={purchaseResult.success ? purchaseResult.data as never : []} inventoryItems={inventoryItems ?? []} permissions={permissions} currency={tenant?.currency ?? "USD"} />
  </div>;
}
