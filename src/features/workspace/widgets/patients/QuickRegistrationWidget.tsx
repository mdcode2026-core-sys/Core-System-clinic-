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
  const [form, setForm] = useState({ full_name: "", phone: "", gender: "male" as "male" | "female", date_of_birth: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) { toast.error(t.clinicNotSelected); return; }
    if (!form.full_name || !form.phone) { toast.error(t.required); return; }
    setIsSubmitting(true);
    try {
      const nameParts = form.full_name.trim().split(/\s+/);
      const first_name = nameParts.shift() || "";
      const last_name = nameParts.join(" ") || first_name;
      await createPatientFromObject({ first_name, last_name, phone_primary: form.phone, gender: form.gender, date_of_birth: form.date_of_birth || undefined, tenant_id: tenantId });
      toast.success(t.success);
      setSubmitted(true);
      setForm({ full_name: "", phone: "", gender: "male", date_of_birth: "" });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error("[QuickRegistrationWidget] registration failed", err);
      toast.error(t.failure);
    } finally { setIsSubmitting(false); }
  };

  return <div className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>
    {submitted ? <div className="flex flex-col items-center gap-2 py-6 text-green-600"><CheckCircle className="h-10 w-10" /><p className="text-sm font-medium">{t.successShort}</p></div> : <form onSubmit={handleSubmit} className="space-y-3">
      <div><label className="block text-xs font-medium text-gray-600">{t.fullName}</label><input type="text" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder={t.fullNamePlaceholder} required /></div>
      <div><label className="block text-xs font-medium text-gray-600">{t.phone}</label><input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder={t.phonePlaceholder} required /></div>
      <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium text-gray-600">{t.gender}</label><select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as "male" | "female" }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"><option value="male">{t.male}</option><option value="female">{t.female}</option></select></div><div><label className="block text-xs font-medium text-gray-600">{t.dateOfBirth}</label><input type="date" value={form.date_of_birth} onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div></div>
      <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"><UserPlus className="h-4 w-4" />{isSubmitting ? t.submitting : t.submit}</button>
    </form>}
  </div>;
}

export default QuickRegistrationWidget;
