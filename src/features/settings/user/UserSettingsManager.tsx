"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useTenantId } from "@/core/auth/useTenantId";
import { useUserSettings } from "@/domain/user-settings/userSettings.queries";
import { isCurrentUserClinicAdmin, saveUserSettings } from "@/domain/user-settings/userSettings.actions";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Loader2, Save } from "lucide-react";

export function UserSettingsManager() {
  const { locale } = useI18n();
  const { userId, tenantId } = useTenantId();
  const { data, isLoading } = useUserSettings(userId, tenantId);
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedDirty, setCollapsedDirty] = useState(false);
  const [showPatientFlow, setShowPatientFlow] = useState(true);
  const [patientFlowDirty, setPatientFlowDirty] = useState(false);
  const [clinicAdmin, setClinicAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const ar = locale === "ar";
  const effectiveCollapsed = collapsedDirty ? collapsed : !!data?.sidebar_collapsed;
  const storedShowPatientFlow = data?.preferences && typeof data.preferences === "object" && !Array.isArray(data.preferences) ? (data.preferences as Record<string, unknown>).show_patient_flow : undefined;
  const effectiveShowPatientFlow = patientFlowDirty ? showPatientFlow : storedShowPatientFlow !== false;

  useEffect(() => { let active = true; void isCurrentUserClinicAdmin().then((value) => { if (active) setClinicAdmin(value); }); return () => { active = false; }; }, []);

  if (isLoading) return <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const existingPreferences = data?.preferences && typeof data.preferences === "object" && !Array.isArray(data.preferences) ? data.preferences as Record<string, unknown> : {};
    const result = await saveUserSettings({ locale, sidebar_collapsed: effectiveCollapsed, ...(clinicAdmin && patientFlowDirty ? { preferences: { ...existingPreferences, show_patient_flow: effectiveShowPatientFlow } } : {}) });
    setSaving(false);
    setSaved(result.success);
  };

  return <div className="max-w-xl space-y-6" dir={ar ? "rtl" : "ltr"}>
    <div><h2 className="text-xl font-semibold">{ar ? "إعداداتي" : "My Settings"}</h2><p className="text-sm text-muted-foreground">{ar ? "مساحة العمل يحددها Clinic Admin. هذه الصفحة مخصصة لتفضيلات الحساب الشخصية." : "Your Workspace is assigned by the Clinic Admin. This page contains personal account preferences."}</p></div>
    <div className="flex items-center justify-between rounded-md border p-4"><div><p className="font-medium">{ar ? "طي الشريط الجانبي" : "Collapse sidebar"}</p><p className="text-sm text-muted-foreground">{ar ? "تفضيل عرض فقط ولا يغير الصلاحيات أو مساحة العمل." : "Display preference only; it does not change permissions or Workspace."}</p></div><Switch checked={effectiveCollapsed} onCheckedChange={(value) => { setCollapsed(value); setCollapsedDirty(true); }} /></div>
    {clinicAdmin && <div className="flex items-center justify-between rounded-md border p-4"><div><p className="font-medium">{ar ? "إظهار Patient Flow" : "Show Patient Flow"}</p><p className="text-sm text-muted-foreground">{ar ? "لـClinic Admin فقط: إظهار أو إخفاء وحدة الـworkflow الخلفية المستخدمة للمراقبة والتحقق." : "Clinic Admin only: show or hide the background workflow console used for monitoring and validation."}</p></div><Switch checked={effectiveShowPatientFlow} onCheckedChange={(value) => { setShowPatientFlow(value); setPatientFlowDirty(true); }} /></div>}
    <div className="flex items-center gap-3"><Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{ar ? "حفظ" : "Save"}</Button>{saved && <span className="text-sm text-muted-foreground">{ar ? "تم الحفظ" : "Saved"}</span>}</div>
  </div>;
}
