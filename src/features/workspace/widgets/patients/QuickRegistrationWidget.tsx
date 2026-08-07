// src/features/workspace/widgets/patients/QuickRegistrationWidget.tsx
// Widget: quick-registration — "Quick Registration" (name fixed by §13)
// Category: Interactive | Layer: 2
// Thin wrapper around existing patient-form.tsx — zero new business logic.

"use client";

import { useState } from "react";
import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { createPatientFromObject } from "@/domain/patients/patients.actions";
import { useAuth } from "@/lib/supabase/useAuth";
import { toast } from "sonner";
import { UserPlus, CheckCircle } from "lucide-react";

export function QuickRegistrationWidget(_props: WidgetComponentProps) {
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    gender: "male" as "male" | "female",
    date_of_birth: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      toast.error("لم يتم تحديد العيادة");
      return;
    }
    if (!form.full_name || !form.phone) {
      toast.error("الاسم ورقم الهاتف مطلوبان");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPatientFromObject({
        full_name: form.full_name,
        phone: form.phone,
        gender: form.gender,
        date_of_birth: form.date_of_birth || undefined,
        tenant_id: tenantId,
      });
      toast.success("تم تسجيل المريض بنجاح");
      setSubmitted(true);
      setForm({ full_name: "", phone: "", gender: "male", date_of_birth: "" });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل التسجيل");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {submitted ? (
        <div className="flex flex-col items-center gap-2 py-6 text-green-600">
          <CheckCircle className="h-10 w-10" />
          <p className="text-sm font-medium">تم التسجيل بنجاح</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">الاسم الكامل *</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="اسم المريض"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">رقم الهاتف *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="05xxxxxxxx"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">الجنس</label>
              <select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as "male" | "female" }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">تاريخ الميلاد</label>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {isSubmitting ? "جاري التسجيل..." : "تسجيل المريض"}
          </button>
        </form>
      )}
    </div>
  );
}

export default QuickRegistrationWidget;
