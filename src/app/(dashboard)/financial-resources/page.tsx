import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getFinancialResourcesMessages } from "@/core/i18n/financialResourcesMessages";
import { listPurchaseOrders, listSuppliers } from "@/domain/financial-resources/financial-resources.queries";
import { FinancialResourcesCenter, type FinancialPlanSummary, type InsuranceSummary, type InventoryItemSummary, type PatientSummary, type PurchaseOrderSummary, type SupplierSummary } from "@/features/financial-resources/financial-resources-center";
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

  const [tenantResult, patientsResult, plansResult, insuranceResult, supplierResult, purchaseResult, inventoryResult] = await Promise.all([
    supabase.from("master_tenants").select("currency").eq("id", tenantId).maybeSingle(),
    supabase.from("clinic_patients").select("id, first_name, last_name, phone_primary").eq("tenant_id", tenantId).is("deleted_at", null).order("first_name").limit(500),
    permissions.includes("invoices:read") ? supabase.from("financial_plans").select("id, patient_id, total_amount_subunits, patient_responsibility_subunits, insurance_covered_subunits, status, installments:financial_installments(id, installment_no, due_date, amount_subunits, amount_paid_subunits, status)").eq("tenant_id", tenantId).order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
    permissions.includes("insurance:read") ? supabase.from("patient_insurance_profiles").select("id, patient_id, payer_name, policy_number, member_number, claim_ready, status, reconciliation_status").eq("tenant_id", tenantId).order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
    permissions.includes("purchasing:read") ? listSuppliers() : Promise.resolve({ success: true as const, data: [] }),
    permissions.includes("purchasing:read") ? listPurchaseOrders() : Promise.resolve({ success: true as const, data: [] }),
    permissions.includes("inventory:read") ? supabase.from("inventory_items").select("id, name, current_stock, unit").eq("tenant_id", tenantId).eq("is_active", true).is("deleted_at", null).order("name").limit(500) : Promise.resolve({ data: [], error: null }),
  ]);

  const patients: PatientSummary[] = (patientsResult.data ?? []).map((p) => ({ id: p.id, first_name: p.first_name, last_name: p.last_name, phone_primary: p.phone_primary }));
  const plans: FinancialPlanSummary[] = (plansResult.data ?? []).map((p) => ({ id: p.id, patient_id: p.patient_id, total_amount_subunits: p.total_amount_subunits, patient_responsibility_subunits: p.patient_responsibility_subunits, insurance_covered_subunits: p.insurance_covered_subunits, status: p.status, installments: (p.installments ?? []).map((i) => ({ id: i.id, installment_no: i.installment_no, due_date: i.due_date, amount_subunits: i.amount_subunits, amount_paid_subunits: i.amount_paid_subunits, status: i.status })) }));
  const insurance: InsuranceSummary[] = (insuranceResult.data ?? []).map((x) => ({ id: x.id, patient_id: x.patient_id, payer_name: x.payer_name, policy_number: x.policy_number, member_number: x.member_number, claim_ready: x.claim_ready, status: x.status, reconciliation_status: x.reconciliation_status }));
  const suppliers: SupplierSummary[] = supplierResult.success ? supplierResult.data.map((s) => ({ id: s.id, name: s.name, phone: s.phone, email: s.email })) : [];
  const purchaseOrders: PurchaseOrderSummary[] = purchaseResult.success ? purchaseResult.data.map((o) => ({ id: o.id, order_number: o.order_number, order_date: o.order_date, status: o.status, total_subunits: o.total_subunits, supplier: o.supplier })) : [];
  const inventoryItems: InventoryItemSummary[] = (inventoryResult.data ?? []).map((i) => ({ id: i.id, name: i.name, current_stock: i.current_stock, unit: i.unit }));

  return <div className="space-y-4 p-4 sm:p-6 lg:p-8" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1><p className="mt-1 text-sm text-muted-foreground">{t.description}</p></div>
    <FinancialResourcesCenter locale={locale} patients={patients} plans={plans} insurance={insurance} suppliers={suppliers} purchaseOrders={purchaseOrders} inventoryItems={inventoryItems} permissions={permissions} currency={tenantResult.data?.currency ?? "USD"} />
  </div>;
}
