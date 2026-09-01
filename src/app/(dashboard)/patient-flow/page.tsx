import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { isClinicAdminUser } from "@/core/permissions/permissionEngine";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const views = [
  { key: "operations", href: "/patient-flow/operations", ar: "التشغيل", en: "Operational", descriptionAr: "رؤية ومراقبة الحركة التشغيلية للمريض.", descriptionEn: "Operational patient-flow visibility and monitoring." },
  { key: "clinical", href: "/patient-flow/clinical", ar: "المعاينة السريرية", en: "Clinical", descriptionAr: "رؤية وتسليم الجزء السريري من مسار المريض.", descriptionEn: "Clinical patient-flow visibility and handoff." },
  { key: "administrative", href: "/patient-flow/administrative", ar: "الإدارة", en: "Administration", descriptionAr: "رؤية المسار الكامل والتدخل الإداري عند الحاجة.", descriptionEn: "Full patient-flow visibility and administrative intervention." },
] as const;

export default async function PatientFlowPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  if (!(await isClinicAdminUser(user.id, tenantId))) redirect("/");

  const cookieStore = await cookies();
  const locale = cookieStore.get("core-system-locale")?.value === "ar" ? "ar" : "en";
  return <div className="mx-auto max-w-5xl space-y-6" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div><h1 className="text-3xl font-bold">{locale === "ar" ? "Patient Flow" : "Patient Flow"}</h1><p className="mt-1 text-muted-foreground">{locale === "ar" ? "وحدة عمل خلفية للإدارة والتحقق من سير مسار المريض الداخلي." : "Background workflow console for administration and validation of the internal patient flow."}</p></div>
    <div className="grid gap-4 md:grid-cols-3">{views.map((view) => <Link key={view.key} href={view.href} className="block"><Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md"><CardHeader><CardTitle>{locale === "ar" ? view.ar : view.en}</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{locale === "ar" ? view.descriptionAr : view.descriptionEn}</CardContent></Card></Link>)}</div>
  </div>;
}
