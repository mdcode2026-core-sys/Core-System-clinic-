"use client";

import { useState } from "react";
import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { createAgendaEvent } from "@/domain/agenda/agenda.actions";
import { useDoctors, useRooms, useProcedures } from "@/domain/agenda/agenda.queries";
import { useTenantId } from "@/core/auth/useTenantId";
import { useI18n } from "@/core/i18n/I18nProvider";
import { toast } from "sonner";
import { CalendarPlus, CheckCircle } from "lucide-react";

export function QuickAppointmentWidget(_props: WidgetComponentProps) {
  const { tenantId, userId } = useTenantId();
  const { locale, workspace: w } = useI18n();
  const t = w.quickAppointment;
  const { data: doctors = [] } = useDoctors(tenantId);
  const { data: rooms = [] } = useRooms(tenantId);
  const { data: procedures = [] } = useProcedures(tenantId);
  const [isSubmitting, setIsSubmitting] = useState(false); const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ patient_id: "", doctor_id: "", room_id: "", procedure_id: "", start_time: "", end_time: "", notes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !userId) { toast.error(t.clinicNotSelected); return; }
    if (!form.patient_id || !form.doctor_id || !form.start_time) { toast.error(t.required); return; }
    setIsSubmitting(true);
    try {
      const fd = new FormData(); fd.set("tenant_id", tenantId); fd.set("patient_id", form.patient_id); fd.set("doctor_id", form.doctor_id); if (form.room_id) fd.set("room_id", form.room_id); if (form.procedure_id) fd.set("procedure_id", form.procedure_id); fd.set("scheduled_start", new Date(form.start_time).toISOString()); fd.set("scheduled_end", form.end_time ? new Date(form.end_time).toISOString() : new Date(form.start_time).toISOString()); fd.set("created_by", userId);
      const result = await createAgendaEvent(fd); if (result?.error) throw new Error(result.error);
      toast.success(t.success); setSubmitted(true); setForm({ patient_id: "", doctor_id: "", room_id: "", procedure_id: "", start_time: "", end_time: "", notes: "" }); setTimeout(() => setSubmitted(false), 3000);
    } catch (err) { console.error("[QuickAppointmentWidget] appointment creation failed", err); toast.error(t.failure); }
    finally { setIsSubmitting(false); }
  };

  return <div className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>{submitted ? <div className="flex flex-col items-center gap-2 py-6 text-green-600"><CheckCircle className="h-10 w-10" /><p className="text-sm font-medium">{t.successShort}</p></div> : <form onSubmit={handleSubmit} className="space-y-3">
    <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium text-gray-600">{t.patient}</label><input type="text" value={form.patient_id} onChange={(e) => setForm((f) => ({ ...f, patient_id: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder={t.patientPlaceholder} required /></div><div><label className="block text-xs font-medium text-gray-600">{t.doctor}</label><select value={form.doctor_id} onChange={(e) => setForm((f) => ({ ...f, doctor_id: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required><option value="">{t.chooseDoctor}</option>{doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}</select></div></div>
    <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium text-gray-600">{t.room}</label><select value={form.room_id} onChange={(e) => setForm((f) => ({ ...f, room_id: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"><option value="">{t.chooseRoom}</option>{rooms.map((r) => <option key={r.id} value={r.id}>{r.room_name}</option>)}</select></div><div><label className="block text-xs font-medium text-gray-600">{t.procedure}</label><select value={form.procedure_id} onChange={(e) => setForm((f) => ({ ...f, procedure_id: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"><option value="">{t.chooseProcedure}</option>{procedures.map((p) => <option key={p.id} value={p.id}>{p.procedure_name}</option>)}</select></div></div>
    <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium text-gray-600">{t.start}</label><input type="datetime-local" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required /></div><div><label className="block text-xs font-medium text-gray-600">{t.end}</label><input type="datetime-local" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div></div>
    <div><label className="block text-xs font-medium text-gray-600">{t.notes}</label><textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" rows={2} placeholder={t.notesPlaceholder} /></div>
    <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"><CalendarPlus className="h-4 w-4" />{isSubmitting ? t.saving : t.submit}</button>
  </form>}</div>;
}

export default QuickAppointmentWidget;
