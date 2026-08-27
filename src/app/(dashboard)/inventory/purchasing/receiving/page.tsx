import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { listPurchaseOrders } from "@/domain/financial-resources/financial-resources.queries";
import { ReceivingForm } from "@/features/financial-resources/receiving-form";
import type { Locale } from "@/core/i18n/messages";

export default async function ReceivingPage() {
  const raw = (await cookies()).get("core-system-locale")?.value;
  const locale: Locale = raw === "ar" ? "ar" : "en";
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  const { data: clinicUser } = await supabase.from("clinic_users").select("tenant_id, is_active").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser?.is_active) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, clinicUser.tenant_id);
  if (!permissions.includes("purchasing:read")) redirect("/inventory");
  const result = await listPurchaseOrders();
  const orders = result.success ? result.data.map((o) => ({ id: o.id, order_number: o.order_number, status: o.status, supplier: o.supplier, items: (o.items ?? []).map((i) => ({ id: i.id, inventory_item_id: i.inventory_item_id, quantity_ordered: i.quantity_ordered, quantity_received: i.quantity_received })) })) : [];
  return <div className="space-y-4 p-6" dir={locale === "ar" ? "rtl" : "ltr"}><h1 className="text-2xl font-bold">{locale === "ar" ? "استلام المشتريات" : "Purchase Receiving"}</h1><ReceivingForm orders={orders} locale={locale} /></div>;
}
