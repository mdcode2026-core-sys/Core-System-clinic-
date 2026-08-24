import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getMessages, type Locale } from "@/core/i18n/messages";
import { ReportsShell } from "@/features/reports/reports-shell";

export default async function ReportsPage() {
  const supabase = await createClient(); const { data: { user }, error: authError } = await supabase.auth.getUser(); if (authError || !user) redirect("/login"); const { data: clinicUsers } = await supabase.from("clinic_users").select("tenant_id").eq("auth_user_id", user.id).limit(1); const tenantId = clinicUsers?.[0]?.tenant_id; if (!tenantId) redirect("/"); const perms = await getEffectivePermissions(user.id, tenantId); if (!perms.includes("reports:read")) redirect("/");
  const cookieStore = await cookies(); const raw = cookieStore.get("core-system-locale")?.value; const locale: Locale = raw === "en" ? "en" : "ar"; const t = getMessages(locale).reports;
  return <div className="mx-auto max-w-6xl p-4 md:p-6" dir={locale === "ar" ? "rtl" : "ltr"}><h1 className="mb-6 text-2xl font-bold">{t.title}</h1><ReportsShell /></div>;
}
