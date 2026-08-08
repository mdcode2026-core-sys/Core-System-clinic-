"use client";

import { useState } from "react";
import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { createAgendaEvent } from "@/domain/agenda/agenda.actions";
import { useDoctors, useRooms, useProcedures } from "@/domain/agenda/agenda.queries";
import { useTenantId } from "@/core/auth/useTenantId";
import { toast } from "sonner";
import { CalendarPlus, CheckCircle } from "lucide-react";

export function QuickAppointmentWidget(_props: WidgetComponentProps) {
  const { tenantId } = useTenantId();

  const { data: doctors = [] } = useDoctors();
  const { data: rooms = [] } = useRooms();
  const { data: procedures = [] } = useProcedures();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    room_id: "",
    procedure_id: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      toast.error("لم يتم تحديد العيادة");
      return;
    }
    if (!form.patient_id || !form.doctor_id || !form.start_time) {
      toast.error("المريض والطبيب ووقت البدء مطلوبون");
      return;
    }

    setIsSubmitting(true);
    try {
      await createAgendaEvent({
        patient_id: form.patient_id,
        doctor_id: form.doctor_id,
        room_id: form.room_id || undefined,
        procedure_id: form.procedure_id || undefined,
        start_time: new Date(form.start_time).toISOString(),
        end_time: form.end_time ? new Date(form.end_time).toISOString() : undefined,
        notes: form.notes || undefined,
        tenant_id: tenantId,
      });
      toast.success("تم إنشاء الموعد بنجاح");
      setSubmitted(true);
      setForm({
        patient_id: "",
        doctor_id: "",
        room_id: "",
        procedure_id: "",
        start_time: "",
        end_time: "",
        notes: "",
      });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل إنشاء الموعد");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {submitted ? (
        <div className="flex flex-col items-center gap-2 py-6 text-green-600">
          <CheckCircle className="h-10 w-10" />
          <p className="text-sm font-medium">تم إنشاء الموعد بنجاح</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">المريض (ID) *</label>
              <input
                type="text"
                value={form.patient_id}
                onChange={(e) => setForm((f) => ({ ...f, patient_id: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="معرف المريض"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">الطبيب *</label>
              <select
                value={form.doctor_id}
                onChange={(e) => setForm((f) => ({ ...f, doctor_id: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">اختر طبيباً</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">الغرفة</label>
              <select
                value={form.room_id}
                onChange={(e) => setForm((f) => ({ ...f, room_id: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">اختر غرفة</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">الإجراء</label>
              <select
                value={form.procedure_id}
                onChange={(e) => setForm((f) => ({ ...f, procedure_id: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">اختر إجراءً</option>
                {procedures.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">وقت البدء *</label>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">وقت الانتهاء</label>
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600">ملاحظات</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
              placeholder="ملاحظات إضافية..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <CalendarPlus className="h-4 w-4" />
            {isSubmitting ? "جاري الحفظ..." : "إنشاء الموعد"}
          </button>
        </form>
      )}
    </div>
  );
}

export default QuickAppointmentWidget;
