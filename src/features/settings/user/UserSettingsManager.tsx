"use client";

import { useState } from "react";
import { createClient } from "@/infrastructure/supabase/client";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useTenantId } from "@/core/auth/useTenantId";
import { useClinicUser } from "@/domain/users/users.queries";
import { requestOwnEmailChange } from "@/domain/users/users.actions";
import { useUserSettings } from "@/domain/user-settings/userSettings.queries";
import { saveUserSettings } from "@/domain/user-settings/userSettings.actions";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Loader2, Mail, Save } from "lucide-react";

export function UserSettingsManager() {
  const { locale } = useI18n(); const { userId, tenantId } = useTenantId(); const { data, isLoading } = useUserSettings(userId, tenantId); const { data: clinicUser } = useClinicUser(userId, tenantId); const [collapsed, setCollapsed] = useState(false); const [collapsedDirty, setCollapsedDirty] = useState(false); const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false); const [newEmail, setNewEmail] = useState(""); const [emailBusy, setEmailBusy] = useState(false); const [emailMessage, setEmailMessage] = useState<string | null>(null); const ar = locale === "ar"; const effectiveCollapsed = collapsedDirty ? collapsed : !!data?.sidebar_collapsed;
  if (isLoading) return <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  const save = async () => { setSaving(true); setSaved(false); const result = await saveUserSettings({ locale, sidebar_collapsed: effectiveCollapsed }); setSaving(false); setSaved(result.success); };
  async function startEmailChange(email: string) { setEmailBusy(true); setEmailMessage(null); const request = await requestOwnEmailChange(email); if (!request.success) { setEmailBusy(false); setEmailMessage(request.error || "Email change request failed."); return; } const supabase = createClient(); const { error } = await supabase.auth.updateUser({ email: email.trim().toLowerCase() }); setEmailBusy(false); setEmailMessage(error ? error.message : (ar ? "تم إرسال رسالة التحقق إلى البريد الجديد." : "Verification email sent to the new address.")); }
  return <div className="max-w-xl space-y-6" dir={ar ? "rtl" : "ltr"}>
    <div><h2 className="text-xl font-semibold">{ar ? "إعداداتي" : "My Settings"}</h2><p className="text-sm text-muted-foreground">{ar ? "تفضيلات العرض وهوية الحساب. تغيير البريد يتم عبر تحقق Auth ويحافظ على هوية المستخدم نفسها." : "Display preferences and account identity. Email changes use Auth verification and preserve the same user identity."}</p></div>
    {clinicUser?.role === "clinic_admin" && <div className="rounded-md border p-4 space-y-4"><div><p className="font-medium flex items-center gap-2"><Mail className="h-4 w-4" />{ar ? "البريد الإلكتروني للحساب الرئيسي" : "Primary account email"}</p><p className="text-sm text-muted-foreground mt-1">{ar ? "هذا هو المسار المخصص لتغيير بريد Clinic Admin، وليس إدارة المستخدمين." : "This is the dedicated Clinic Admin email-change path, outside User Management."}</p></div><div className="space-y-2"><Label htmlFor="account-email">{ar ? "البريد الحالي" : "Current email"}</Label><Input id="account-email" value={clinicUser.email ?? ""} disabled /></div><div className="space-y-2"><Label htmlFor="new-account-email">{ar ? "البريد الجديد" : "New email"}</Label><Input id="new-account-email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="name@example.com" /></div><Button onClick={() => void startEmailChange(newEmail)} disabled={emailBusy || !newEmail.trim()}>{emailBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}{ar ? "إرسال طلب التحقق" : "Send verification"}</Button>{emailMessage && <p className="text-sm text-muted-foreground">{emailMessage}</p>}</div>}
    {clinicUser?.pending_email && <div className="rounded-md border border-amber-200 bg-amber-50 p-4 space-y-3"><p className="font-medium">{ar ? `بريد جديد بانتظار التحقق: ${clinicUser.pending_email}` : `New email pending verification: ${clinicUser.pending_email}`}</p><p className="text-sm text-muted-foreground">{ar ? "يجب على صاحب الحساب إكمال التحقق من البريد الجديد. يمكنك إعادة إرسال رسالة التحقق." : "The account owner must verify the new address. You can resend the verification email."}</p><Button variant="outline" disabled={emailBusy} onClick={() => void startEmailChange(clinicUser.pending_email!)}>{emailBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}{ar ? "إعادة إرسال التحقق" : "Resend verification"}</Button></div>}
    <div className="flex items-center justify-between rounded-md border p-4"><div><p className="font-medium">{ar ? "طي الشريط الجانبي" : "Collapse sidebar"}</p><p className="text-sm text-muted-foreground">{ar ? "تفضيل عرض فقط ولا يغير الصلاحيات أو مساحة العمل." : "Display preference only; it does not change permissions or Workspace."}</p></div><Switch checked={effectiveCollapsed} onCheckedChange={(value) => { setCollapsed(value); setCollapsedDirty(true); }} /></div>
    <div className="flex items-center gap-3"><Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{ar ? "حفظ" : "Save"}</Button>{saved && <span className="text-sm text-muted-foreground">{ar ? "تم الحفظ" : "Saved"}</span>}</div>
  </div>;
}
