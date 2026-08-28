import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const views = [
  { key: "operations", permission: "patient_flow:operations", href: "/patient-flow/operations", ar: "التشغيل", en: "Operations", descriptionAr: "حركة المريض والاستقبال والتوجيه والإغلاق التشغيلي.", descriptionEn: "Patient movement, reception, routing and operational completion." },
  { key: "clinical", permission: "patient_flow:clinical", href: "/patient-flow/clinical", ar: "المعاينة السريرية", en: "Clinical", descriptionAr: "الرؤية السريرية وتسليم المريض وإعادته للإغلاق التشغيلي.", descriptionEn: "Clinical movement, provider handoff and return to operational completion." },
  { key: "administrative", permission: "patient_flow:administrative", href: "/patient-flow/administrative", ar: "الإدارة", en: "Administrative", descriptionAr: "الرؤية الكاملة لمسار المرضى والتدخل الإداري المصرح به.", descriptionEn: "Full patient-path visibility with authorized administrative intervention." },
] as const;

const pageCopy = {
  ar: { title: "رحلة المريض", description: "اختر واجهة رحلة المريض المفعلة لك." },
  en: { title: "Patient Flow", description: "Choose an explicitly enabled Patient Flow view." },
} as const;

export default async function PatientFlowPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  const available = views.filter((view) => permissions.includes(view.permission));
  if (available.length === 0) redirect("/");
  const copy = pageCopy.ar;
  return (
    <div className="mx-auto max-w-5xl space-y-6" dir="auto">
      <div><h1 className="text-3xl font-bold">{copy.title}</h1><p className="mt-1 text-muted-foreground">{copy.description}</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        {available.map((view) => <Link key={view.key} href={view.href} className="block">
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md"><CardHeader><CardTitle>{view.ar} / {view.en}</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{view.descriptionAr}<br />{view.descriptionEn}</CardContent></Card>
        </Link>)}
      </div>
    </div>
  );
}
