import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getMessages, type Locale } from "@/core/i18n/messages";
import { InventoryList } from "@/features/inventory/inventory-list";

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");
  const { data: clinicUser } = await supabase.from("clinic_users").select("tenant_id").eq("auth_user_id", user.id).limit(1).maybeSingle();
  if (!clinicUser?.tenant_id) redirect("/login");
  const perms = await getEffectivePermissions(user.id, clinicUser.tenant_id);
  if (!perms.includes("inventory:read")) redirect("/");
  const cookieStore = await cookies();
  const raw = cookieStore.get("core-system-locale")?.value;
  const locale: Locale = raw === "en" ? "en" : "ar";
  const t = getMessages(locale).inventory;
  return <div className="space-y-6 p-4 sm:p-6 lg:p-8" dir={locale === "ar" ? "rtl" : "ltr"}><div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1></div><InventoryList tenantId={clinicUser.tenant_id} /></div>;
}
