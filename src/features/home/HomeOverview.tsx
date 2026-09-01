"use client";

import Link from "next/link";
import { CalendarDays, Bell, MessageCircle, ListChecks, BriefcaseBusiness } from "lucide-react";
import { useI18n } from "@/core/i18n/I18nProvider";

export function HomeOverview({ appointmentsToday, workspaceHref }: { appointmentsToday: number; workspaceHref: string | null }) {
  const { locale } = useI18n();
  const ar = locale === "ar";
  const cards = [
    { icon: CalendarDays, title: ar ? "مواعيد اليوم" : "Today's appointments", value: String(appointmentsToday), description: ar ? "معلومات عامة عن مواعيد اليوم." : "General daily appointment context." },
    { icon: Bell, title: ar ? "التذكيرات" : "Reminders", value: "—", description: ar ? "التذكيرات العامة تظهر هنا عند توفر مصدرها." : "General reminders appear here when their source is connected." },
    { icon: MessageCircle, title: ar ? "الاتصالات" : "Communications", value: "—", description: ar ? "سياق الاتصالات الداخلية واتصالات المرضى." : "Internal and patient communications context." },
    { icon: ListChecks, title: ar ? "مركز العمل" : "Work Center", value: "—", description: ar ? "التنبيهات العامة وسياق الأعمال المسندة." : "General work notifications and assigned-work context." },
  ];

  return <div className="mx-auto w-full max-w-6xl space-y-6" dir={ar ? "rtl" : "ltr"}>
    <div><p className="text-sm font-medium text-muted-foreground">ClinicSaaS™</p><h1 className="mt-1 text-3xl font-bold tracking-tight">{ar ? "الرئيسية" : "Home"}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{ar ? "نظرة عامة على العمل اليومي. التنفيذ اليومي يكون داخل مساحة العمل المخصصة لك." : "Your general daily clinic overview. Daily execution belongs in your assigned Workspace."}</p></div>
    <section aria-label={ar ? "المعلومات العامة اليومية" : "General daily information"} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => { const Icon = card.icon; return <article key={card.title} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-lg bg-muted p-2"><Icon className="h-5 w-5" /></div><h2 className="font-semibold">{card.title}</h2></div><p className="mt-5 text-3xl font-bold">{card.value}</p><p className="mt-1 text-sm text-muted-foreground">{card.description}</p></article>; })}
    </section>
    <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><BriefcaseBusiness className="h-5 w-5" /><h2 className="text-lg font-semibold">{ar ? "مساحة عملي" : "My Workspace"}</h2></div><p className="mt-1 text-sm text-muted-foreground">{ar ? "افتح بيئة العمل اليومية المخصصة لك." : "Open your assigned daily working environment."}</p></div>{workspaceHref ? <Link href={workspaceHref} className="inline-flex min-h-10 items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">{ar ? "فتح مساحة العمل" : "Open Workspace"}</Link> : <span className="text-sm text-muted-foreground">{ar ? "لم يتم تحديد مساحة عمل" : "Workspace assignment required"}</span>}</div></section>
  </div>;
}
