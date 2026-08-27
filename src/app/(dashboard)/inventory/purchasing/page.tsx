import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { FinancialResourcesCenter, type InventoryItemSummary, type PurchaseOrderSummary, type SupplierSummary } from "@/features/financial-resources/financial-resources-center";
import { listPurchaseOrders, listSuppliers } from "@/domain/financial-resources/financial-resources.queries";
import type { Locale } from "@/core/i18n/messages";

export default async function InventoryPurchasingPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("core-system-locale")?.value;
  const locale: Locale = raw === "ar" ? "ar" : "en";
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  const { data: clinicUser } = await supabase.from("clinic_users").select("tenant_id, is_active").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser?.is_active) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, clinicUser.tenant_id);
  if (!permissions.includes("inventory:read") && !permissions.includes("purchasing:read")) redirect("/inventory");
  const [suppliersResult, purchaseResult, inventoryResult] = await Promise.all([
    permissions.includes("purchasing:read") ? listSuppliers() : Promise.resolve({ success: true as const, data: [] }),
    permissions.includes("purchasing:read") ? listPurchaseOrders() : Promise.resolve({ success: true as const, data: [] }),
    permissions.includes("inventory:read") ? supabase.from("inventory_items").select("id, name, current_stock, unit").eq("tenant_id", clinicUser.tenant_id).eq("is_active", true).is("deleted_at", null).order("name").limit(500) : Promise.resolve({ data: [], error: null }),
  ]);
  const suppliers: SupplierSummary[] = suppliersResult.success ? suppliersResult.data.map((s) => ({ id: s.id, name: s.name, phone: s.phone, email: s.email })) : [];
  const purchaseOrders: PurchaseOrderSummary[] = purchaseResult.success ? purchaseResult.data.map((o) => ({ id: o.id, order_number: o.order_number, order_date: o.order_date, status: o.status, total_subunits: o.total_subunits, supplier: o.supplier })) : [];
  const inventoryItems: InventoryItemSummary[] = (inventoryResult.data ?? []).map((i) => ({ id: i.id, name: i.name, current_stock: i.current_stock, unit: i.unit }));
  return <div className="space-y-4 p-6" dir={locale === "ar" ? "rtl" : "ltr"}><h1 className="text-2xl font-bold">{locale === "ar" ? "الموردون والمشتريات والاستلام" : "Suppliers, Purchasing & Receiving"}</h1><FinancialResourcesCenter surface="inventory" locale={locale} patients={[]} plans={[]} insurance={[]} suppliers={suppliers} purchaseOrders={purchaseOrders} inventoryItems={inventoryItems} permissions={permissions} currency="USD" /></div>;
}
