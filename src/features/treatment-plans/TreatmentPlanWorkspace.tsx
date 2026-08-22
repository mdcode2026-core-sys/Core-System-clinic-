"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Plus, RefreshCw, ArrowRight, CheckCircle2, Link2 } from "lucide-react";
import { addTreatmentPlanItem, createTreatmentPlan, getTreatmentPlans, linkVisitToTreatmentPlan, updateTreatmentPlan, updateTreatmentPlanItem } from "@/domain/treatment-plan/treatment-plan.actions";
import type { TreatmentPlanRecord } from "@/domain/treatment-plan/treatment-plan.types";

const statusLabels: Record<string, string> = { draft: "مسودة", active: "نشطة", on_hold: "موقوفة", completed: "مكتملة", cancelled: "ملغاة" };
const itemStatusLabels: Record<string, string> = { planned: "مخطط", scheduled: "مجدول", in_progress: "قيد التنفيذ", completed: "مكتمل", skipped: "متجاوز", cancelled: "ملغى" };

export function TreatmentPlanWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get("patientId") || undefined;
  const sourceVisitId = searchParams.get("visitId");
  const [plans, setPlans] = useState<TreatmentPlanRecord[]>([]);
  const [selected, setSelected] = useState<TreatmentPlanRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [goals, setGoals] = useState("");
  const [itemTitle, setItemTitle] = useState("");
  const [itemDescription, setItemDescription] = useState("");

  const refresh = async (selectId?: string) => {
    setLoading(true); setError(null);
    try {
      const next = await getTreatmentPlans(patientId);
      setPlans(next);
      setSelected(selectId ? next.find((p) => p.id === selectId) ?? null : selected ? next.find((p) => p.id === selected.id) ?? null : next[0] ?? null);
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر تحميل الخطط العلاجية"); }
    finally { setLoading(false); }
  };

  useEffect(() => { void refresh(); }, [patientId]);

  const run = async (fn: () => Promise<unknown>, selectId?: string) => {
    setError(null);
    try { await fn(); await refresh(selectId); }
    catch (e) { setError(e instanceof Error ? e.message : "تعذر تنفيذ العملية"); }
  };

  const create = async () => {
    if (!patientId) { setError("يجب تحديد المريض لإنشاء خطة علاجية"); return; }
    await run(async () => {
      const id = await createTreatmentPlan({ patientId, sourceVisitId, title, diagnosisSummary: diagnosis, goals });
      setTitle(""); setDiagnosis(""); setGoals(""); setShowCreate(false);
      await refresh(id);
    });
  };

  const addItem = async () => {
    if (!selected || !itemTitle.trim()) return;
    await run(() => addTreatmentPlanItem({ treatmentPlanId: selected.id, title: itemTitle, description: itemDescription }), selected.id);
    setItemTitle(""); setItemDescription("");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-3xl font-bold">مساحة خطط العلاج</h1><p className="mt-1 text-muted-foreground">خطة علاجية خاصة بالمريض تمتد عبر الوقت والأنشطة والزيارات الفعلية</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className="ml-2 h-4 w-4" /> تحديث</Button>{patientId && <Button onClick={() => setShowCreate(true)}><Plus className="ml-2 h-4 w-4" /> خطة علاج جديدة</Button>}</div>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {showCreate && <Card><CardHeader><CardTitle>إنشاء خطة علاج</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2"><input className="rounded-md border p-3" placeholder="عنوان الخطة" value={title} onChange={(e) => setTitle(e.target.value)} /><input className="rounded-md border p-3" placeholder="ملخص التشخيص" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} /><textarea className="min-h-24 rounded-md border p-3 md:col-span-2" placeholder="الأهداف العلاجية" value={goals} onChange={(e) => setGoals(e.target.value)} /><div className="flex gap-2 md:col-span-2"><Button onClick={() => void create()} disabled={!title.trim()}>إنشاء</Button><Button variant="outline" onClick={() => setShowCreate(false)}>إلغاء</Button></div></CardContent></Card>}
      {!patientId && <Card><CardContent className="p-8 text-center text-muted-foreground">افتح هذه المساحة من سياق مريض لإنشاء أو إدارة خطة علاجية.</CardContent></Card>}

      {patientId && <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card><CardHeader><CardTitle>الخطط ({plans.length})</CardTitle></CardHeader><CardContent className="space-y-2">{plans.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد خطة علاجية لهذا المريض.</p> : plans.map((plan) => <button key={plan.id} onClick={() => setSelected(plan)} className={`w-full rounded-lg border p-3 text-right ${selected?.id === plan.id ? "border-primary bg-primary/5" : ""}`}><div className="font-medium">{plan.title}</div><Badge className="mt-2">{statusLabels[plan.status]}</Badge></button>)}</CardContent></Card>
        {selected ? <div className="space-y-4">
          <Card><CardHeader><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><CardTitle>{selected.title}</CardTitle><div className="flex gap-2"><Badge>{statusLabels[selected.status]}</Badge>{selected.status === "draft" && <Button size="sm" onClick={() => void run(() => updateTreatmentPlan(selected.id, { status: "active" }), selected.id)}>تفعيل</Button>}{selected.status === "active" && <Button size="sm" variant="outline" onClick={() => void run(() => updateTreatmentPlan(selected.id, { status: "completed" }), selected.id)}><CheckCircle2 className="ml-2 h-4 w-4" /> إكمال الخطة</Button>}</div></div></CardHeader><CardContent className="space-y-3 text-sm"><div><span className="text-muted-foreground">المريض: </span>{selected.patient_name || "مريض"}</div>{selected.diagnosis_summary && <div><span className="text-muted-foreground">التشخيص: </span>{selected.diagnosis_summary}</div>}{selected.goals && <div><span className="text-muted-foreground">الأهداف: </span>{selected.goals}</div>}<div className="text-muted-foreground">الزيارات المرتبطة فعلياً: {selected.visits.length}</div></CardContent></Card>
          <Card><CardHeader><CardTitle>الأنشطة المخططة ({selected.items.length})</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"><input className="rounded-md border p-3" placeholder="اسم النشاط / الجلسة" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} /><input className="rounded-md border p-3" placeholder="وصف مختصر" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} /><Button onClick={() => void addItem()} disabled={!itemTitle.trim()}><Plus className="ml-2 h-4 w-4" /> إضافة</Button></div>{selected.items.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">لا توجد أنشطة مخططة بعد.</p> : selected.items.map((item) => { const linked = selected.visits.some((v) => v.treatment_plan_item_id === item.id); return <div key={item.id} className="rounded-lg border p-3"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><span className="font-medium">{item.sequence_no}. {item.title}</span>{item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}</div><div className="flex items-center gap-2"><select className="rounded-md border p-2 text-sm" value={item.status} onChange={(e) => void run(() => updateTreatmentPlanItem(item.id, { status: e.target.value as any }), selected.id)}>{Object.entries(itemStatusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>{sourceVisitId && !linked && <Button size="sm" variant="outline" onClick={() => void run(() => linkVisitToTreatmentPlan(selected.id, sourceVisitId, item.id), selected.id)}><Link2 className="ml-2 h-4 w-4" /> ربط الزيارة</Button>}</div></div></div>; })}</CardContent></Card>
          {sourceVisitId && !selected.visits.some((v) => v.visit_id === sourceVisitId) && <Button variant="outline" onClick={() => void run(() => linkVisitToTreatmentPlan(selected.id, sourceVisitId), selected.id)}>ربط الزيارة الحالية بالخطة</Button>}
          <Button variant="ghost" onClick={() => router.push("/clinical")}><ArrowRight className="ml-2 h-4 w-4" /> العودة لمساحة العمل السريرية</Button>
        </div> : <Card><CardContent className="p-8 text-center text-muted-foreground">اختر خطة علاجية لعرض الأنشطة.</CardContent></Card>}
      </div>}
    </div>
  );
}
