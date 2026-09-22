"use client";

import { useState } from "react";
import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { createPatientFromObject } from "@/domain/patients/patients.actions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useI18n } from "@/core/i18n/I18nProvider";
import { toast } from "sonner";
import { UserPlus, CheckCircle } from "lucide-react";

export function QuickRegistrationWidget(_props: WidgetComponentProps) {
  const { tenantId } = useTenantId();
  const { locale, workspace: w } = useI18n();
  const t = w.quickRegistration;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    father_name: "",
    family_name: "",
    phone: "",
    gender: "male" as "male" | "female" | "other",
    date_of_birth: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) { toast.error(t.clinicNotSelected); return; }
    if (!form.first_name || !form.father_name || !form.family_name || !form.phone || !form.date_of_birth) {
      toast.error(t.required);
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createPatientFromObject({
        tenant_id: tenantId,
        first_name: form.first_name,
        last_name: form.family_name,
        father_name: form.father_name,
        family_name: form.family_name,
        phone_primary: form.phone,
        gender: form.gender,
        date_of_birth: form.date_of_birth,
      });
      if (result.error === "PATIENT_REVIEW_REQUIRED") {
        toast.error("Possible existing patient found. Review required.");
        return;
      }
      if (result.error) { toast.error(t.failure); return; }
      toast.success(t.success);
      setSubmitted(true);
      setForm({ first_name: "", father_name: "", family_name: "", phone: "", gender: "male", date_of_birth: "" });
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      toast.error(t.failure);
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return <div className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>
    {submitted ? <div className="flex flex-col items-center gap-2 py-6 text-green-600"><CheckCircle className="h-10 w-10" /><p className="text-sm font-medium">{t.successShort}</p></div> :
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="First name" required />
          <input value={form.father_name} onChange={(e) => set("father_name", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Father name" required />
        </div>
        <input value={form.family_name} onChange={(e) => set("family_name", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Family name" required />
        <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder={t.phone} required />
        <div className="grid grid-cols-2 gap-3">
          <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="male">{t.male}</option><option value="female">{t.female}</option><option value="other">{t.other}</option>
          </select>
          <input type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
        </div>
        <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          <UserPlus className="h-4 w-4" />{isSubmitting ? t.submitting : t.submit}
        </button>
      </form>}
  </div>;
}

export default QuickRegistrationWidget;
