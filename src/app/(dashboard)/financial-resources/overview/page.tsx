import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getFinancialResourcesMessages } from "@/core/i18n/financialResourcesMessages";
import type { Locale } from "@/core/i18n/messages";

export default async function FinancialResourcesOverviewPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  const canRead = permissions.includes("invoices:read") || permissions.includes("insurance:read") || permissions.includes("purchasing:read") || permissions.includes("inventory:read");
  if (!canRead) redirect("/");
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get("core-system-locale")?.value === "ar" ? "ar" : "en";
  const t = getFinancialResourcesMessages(locale);
  const [plans, insurance, suppliers, purchases, invoices, inventory] = await Promise.all([
    permissions.includes("invoices:read") ? supabase.from("financial_plans").select("id, status, installments:financial_installments(id, status)").eq("tenant_id", tenantId) : Promise.resolve({ data: [] }),
    permissions.includes("insurance:read") ? supabase.from("patient_insurance_profiles").select("id, status, claim_ready").eq("tenant_id", tenantId) : Promise.resolve({ data: [] }),
    permissions.includes("purchasing:read") ? supabase.from("suppliers").select("id, status").eq("tenant_id", tenantId) : Promise.resolve({ data: [] }),
    permissions.includes("purchasing:read") ? supabase.from("purchase_orders").select("id, status").eq("tenant_id", tenantId) : Promise.resolve({ data: [] }),
    permissions.includes("invoices:read") ? supabase.from("clinic_invoices").select("id, invoice_status, amount_due_subunits").eq("tenant_id", tenantId) : Promise.resolve({ data: [] }),
    permissions.includes("inventory:read") ? supabase.from("inventory_items").select("id, current_stock, is_active").eq("tenant_id", tenantId).is("deleted_at", null) : Promise.resolve({ data: [] }),
  ]);
  const overdueInvoices = (invoices.data ?? []).filter((x: { invoice_status?: string }) => String(x.invoice_status).toLowerCase() === "overdue").length;
  const openPlans = (plans.data ?? []).filter((x: { status?: string }) => !["completed", "closed", "cancelled"].includes(String(x.status).toLowerCase())).length;
  const openInstallments = (plans.data ?? []).reduce((n: number, p: { installments?: { status?: string }[] }) => n + (p.installments ?? []).filter((i: { status?: string }) => !["paid", "completed"].includes(String(i.status).toLowerCase())).length, 0);
  const activeInsurance = (insurance.data ?? []).filter((x: { status?: string }) => String(x.status).toLowerCase() !== "inactive").length;
  const pendingClaims = (insurance.data ?? []).filter((x: { claim_ready?: boolean }) => x.claim_ready).length;
  const activeSuppliers = (suppliers.data ?? []).filter((x: { status?: string }) => String(x.status).toLowerCase() !== "inactive").length;
  const openPurchases = (purchases.data ?? []).filter((x: { status?: string }) => !["received", "closed", "cancelled"].includes(String(x.status).toLowerCase())).length;
  const lowStock = (inventory.data ?? []).filter((x: { current_stock?: number; is_active?: boolean }) => x.is_active !== false && Number(x.current_stock ?? 0) <= 0).length;
  const cards = [
    { label: t.financialPlans, value: openPlans, detail: `${t.installments}: ${openInstallments}` },
    { label: t.insurance, value: activeInsurance, detail: `${t.claimReady}: ${pendingClaims}` },
    { label: t.suppliers, value: activeSuppliers, detail: t.purchasing },
    { label: t.purchasing, value: openPurchases, detail: `${t.invoice}: ${overdueInvoices}` },
    { label: t.invoices, value: overdueInvoices, detail: t.viewInvoices },
    { label: t.inventory, value: lowStock, detail: t.viewInventory },
  ];
  return <div className="space-y-6" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1><p className="mt-1 text-sm text-muted-foreground">{t.description}</p></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => <div key={card.label} className="rounded-lg border bg-white p-5"><p className="text-sm text-muted-foreground">{card.label}</p><p className="mt-2 text-3xl font-bold">{card.value}</p><p className="mt-1 text-sm text-muted-foreground">{card.detail}</p></div>)}
    </div>
  </div>;
}