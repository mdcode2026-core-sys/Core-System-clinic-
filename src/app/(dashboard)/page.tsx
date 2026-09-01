import Link from "next/link";
import { CalendarDays, Bell, MessageCircle, ListChecks, BriefcaseBusiness } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { getAssignedWorkspace, workspaceRoute } from "@/core/workspace/currentWorkspace";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const assignedWorkspace = await getAssignedWorkspace(user.id);
  const tenantResult = await supabase.from("clinic_users").select("tenant_id").eq("auth_user_id", user.id).maybeSingle();
  const tenantId = tenantResult.data?.tenant_id;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  let appointmentsToday = 0;
  if (tenantId) {
    const { count } = await supabase
      .from("master_agenda_events")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("scheduled_start", start.toISOString())
      .lt("scheduled_start", end.toISOString())
      .not("status", "in", "(cancelled,no_show)");
    appointmentsToday = count ?? 0;
  }

  const cards = [
    { icon: CalendarDays, title: "Today's appointments", titleAr: "مواعيد اليوم", value: String(appointmentsToday), description: "General daily appointment context.", descriptionAr: "معلومات عامة عن مواعيد اليوم." },
    { icon: Bell, title: "Reminders", titleAr: "التذكيرات", value: "—", description: "Reminders will appear here as their approved domain surfaces are connected.", descriptionAr: "ستظهر التذكيرات هنا عند ربط مصادرها المعتمدة." },
    { icon: MessageCircle, title: "Communications", titleAr: "الاتصالات", value: "—", description: "Internal communications and patient communications context.", descriptionAr: "سياق الاتصالات الداخلية واتصالات المرضى." },
    { icon: ListChecks, title: "Work Center", titleAr: "مركز العمل", value: "—", description: "General work notifications and assigned work context.", descriptionAr: "التنبيهات العامة وسياق الأعمال المسندة." },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6" dir="auto">
      <div>
        <p className="text-sm font-medium text-muted-foreground">ClinicSaaS™</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Home</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Your general daily clinic overview. Daily execution belongs in your assigned Workspace.</p>
      </div>

      <section aria-label="General daily information" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return <article key={card.title} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-lg bg-muted p-2"><Icon className="h-5 w-5" /></div><div className="min-w-0"><h2 className="font-semibold">{card.title}</h2><p className="text-xs text-muted-foreground">{card.titleAr}</p></div></div><p className="mt-5 text-3xl font-bold">{card.value}</p><p className="mt-1 text-sm text-muted-foreground">{card.description}</p><p className="mt-1 text-xs text-muted-foreground">{card.descriptionAr}</p></article>;
        })}
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="flex items-center gap-2"><BriefcaseBusiness className="h-5 w-5" /><h2 className="text-lg font-semibold">My Workspace</h2></div><p className="mt-1 text-sm text-muted-foreground">Open your assigned daily working environment.</p></div>
          {assignedWorkspace ? <Link href={workspaceRoute(assignedWorkspace)} className="inline-flex min-h-10 items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Open Workspace</Link> : <span className="text-sm text-muted-foreground">Workspace assignment required</span>}
        </div>
      </section>
    </div>
  );
}
