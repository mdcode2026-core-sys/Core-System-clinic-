"use client";

import { useEffect, useMemo, useState } from "react";
import { useTenantId } from "@/core/auth/useTenantId";
import { useI18n } from "@/core/i18n/I18nProvider";
import { usePermissionsCatalog } from "@/domain/roles/roles.queries";
import { useDirectPermissions } from "@/domain/direct-permissions/directPermissions.queries";
import { useUserPermissionOverrides } from "@/domain/overrides/overrides.queries";
import { createClinicUser, updateClinicUser } from "@/domain/users/users.actions";
import { sendUserActivationEmail } from "./sendUserActivationEmail";
import type { ClinicUserWithRole, UserWorkspace } from "@/domain/users/users.types";
import type { Role } from "@/domain/roles/roles.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Check, KeyRound, Loader2, Mail, Minus, Plus, Save, ShieldCheck, X } from "lucide-react";

const workspaces: Array<{ value: UserWorkspace; en: string; ar: string }> = [
  { value: "operation", en: "Operational", ar: "تشغيلي" },
  { value: "clinical", en: "Clinical", ar: "سريري" },
  { value: "administration", en: "Administration", ar: "إداري" },
];
type AccessState = "default" | "granted" | "revoked";
type ActivationMode = "email" | "direct";
type Props = { user?: ClinicUserWithRole | null; roles: Role[]; onClose: () => void; onSaved: (result: { activationLink?: string; emailSent?: boolean }) => void; onError: (message: string | null) => void };

export function UserConfigurationForm({ user, roles, onClose, onSaved, onError }: Props) {
  const { locale } = useI18n();
  const { tenantId } = useTenantId();
  const { data: catalog = [], isLoading: catalogLoading } = usePermissionsCatalog();
  const { data: direct = [], isLoading: directLoading } = useDirectPermissions(user?.id ?? null, tenantId);
  const { data: overrides = [], isLoading: overridesLoading } = useUserPermissionOverrides(user?.id ?? null, tenantId);
  const ar = locale === "ar";
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [roleId, setRoleId] = useState(user?.role_id ?? "");
  const [workspace, setWorkspace] = useState<UserWorkspace>((user?.role_workspace as UserWorkspace) || "operation");
  const [access, setAccess] = useState<Record<string, AccessState>>({});
  const [activationMode, setActivationMode] = useState<ActivationMode>("email");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [sendingActivation, setSendingActivation] = useState(false);
  const isProtected = Boolean(user?.role === "clinic_admin");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFullName(user?.full_name ?? "");
      setEmail(user?.email ?? "");
      setPhone(user?.phone ?? "");
      setRoleId(user?.role_id ?? "");
      setWorkspace((user?.role_workspace as UserWorkspace) || "operation");
      setActivationMode("email");
      setPassword("");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (!user || directLoading || overridesLoading) return;
    const next: Record<string, AccessState> = {};
    for (const row of direct as any[]) if (row.granted) next[row.permission_id] = "granted";
    for (const row of overrides as any[]) if (!row.granted && !next[row.permission_id]) next[row.permission_id] = "revoked";
    const timer = window.setTimeout(() => setAccess(next), 0);
    return () => window.clearTimeout(timer);
  }, [user, direct, overrides, directLoading, overridesLoading]);

  const selectedRole = useMemo(() => roles.find(role => role.id === roleId), [roles, roleId]);
  const groupedCatalog = useMemo(() => catalog.reduce<Record<string, typeof catalog>>((groups, permission) => {
    (groups[permission.resource] ??= []).push(permission);
    return groups;
  }, {}), [catalog]);

  function togglePermission(id: string) {
    setAccess(current => ({ ...current, [id]: current[id] === "granted" ? "revoked" : current[id] === "revoked" ? "default" : "granted" }));
  }

  async function sendActivation() {
    if (!user || isProtected) return;
    onError(null);
    setSendingActivation(true);
    const result = await sendUserActivationEmail(user.id);
    setSendingActivation(false);
    if (!result.success) onError(result.error);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    onError(null);
    if (!roleId || !workspace || !fullName.trim() || !email.trim()) return;
    if (activationMode === "direct" && !password.trim()) {
      onError("PASSWORD_REQUIRED");
      return;
    }
    setSaving(true);
    const directPermissionIds = Object.entries(access).filter(([, state]) => state === "granted").map(([id]) => id);
    const revokedPermissionIds = Object.entries(access).filter(([, state]) => state === "revoked").map(([id]) => id);
    const activation = activationMode === "direct" ? { directActivation: true as const, password } : {};
    const result = user
      ? await updateClinicUser({ id: user.id, full_name: fullName, email, phone, role_id: roleId, workspace, directPermissionIds, revokedPermissionIds, ...activation })
      : await createClinicUser({ full_name: fullName, email, phone, role_id: roleId, workspace, directPermissionIds, revokedPermissionIds, ...activation });
    setSaving(false);
    if (!result.success) { onError(result.error); return; }
    setPassword("");
    onSaved({ activationLink: result.activationLink, emailSent: result.emailSent });
  }

  const activationSection = <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-4 w-4" />{ar ? "4. إعداد التفعيل" : "4. Activation configuration"}</CardTitle></CardHeader><CardContent className="space-y-5">
    <p className="text-sm text-muted-foreground">{ar ? "حدد طريقة إنشاء/تفعيل حساب الدخول بعد اكتمال جميع إعدادات المستخدم. هذا القسم هو آخر إعداد قبل الحفظ." : "Choose the account activation method after all user configuration is complete. This is the final configuration section before Save."}</p>
    <div className="grid gap-3 md:grid-cols-2">
      <button type="button" disabled={isProtected} onClick={() => { setActivationMode("email"); setPassword(""); }} className={`rounded-lg border p-4 text-start transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${activationMode === "email" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
        <div className="flex items-center gap-3"><Mail className="h-5 w-5 shrink-0" /><div><p className="font-semibold">{ar ? "التفعيل عبر البريد" : "Email activation"}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{ar ? "إرسال دعوة التفعيل، ويحدد الموظف كلمة المرور بنفسه." : "Send the activation invitation; the employee chooses their password."}</p></div></div>
      </button>
      <button type="button" disabled={isProtected} onClick={() => setActivationMode("direct")} className={`rounded-lg border p-4 text-start transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${activationMode === "direct" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
        <div className="flex items-center gap-3"><KeyRound className="h-5 w-5 shrink-0" /><div><p className="font-semibold">{ar ? "التفعيل المباشر" : "Direct activation"}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{ar ? "ينشئ المسؤول حساب الدخول مباشرة ويحدد كلمة المرور." : "Create the login account directly and set its password."}</p></div></div>
      </button>
    </div>
    {activationMode === "direct" && <div className="space-y-2 rounded-lg border p-4"><Label htmlFor="user-direct-password">{ar ? "كلمة مرور الحساب" : "Account password"}</Label><Input id="user-direct-password" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} autoComplete="new-password" required /><p className="text-xs text-muted-foreground">{ar ? "تُرسل كلمة المرور مباشرة إلى نظام المصادقة ولا تُحفظ في بيانات المستخدم أو السجلات." : "The password is sent directly to the authentication system and is not stored in user data or logs."}</p></div>}
    {user && !isProtected && (user.account_status === "pending" || user.account_status === "active") && <div className="rounded-lg border bg-muted/30 p-4"><div className="mb-2 flex items-center gap-2"><Mail className="h-4 w-4" /><p className="text-sm font-medium">{ar ? "إجراء بريد التفعيل الحالي" : "Existing email activation action"}</p></div><p className="mb-3 text-sm text-muted-foreground">{user.account_status === "pending" ? (ar ? "يمكنك إعادة إرسال دعوة التفعيل دون تغيير بقية إعدادات المستخدم." : "You can resend the activation invitation without changing the rest of the user configuration.") : (ar ? "يمكن إرسال مسار إعداد كلمة المرور للبريد للحساب النشط دون تغيير حالة الحساب." : "You can send the password setup email flow without changing the account state.")}</p><Button type="button" variant="outline" disabled={sendingActivation} onClick={() => void sendActivation()}>{sendingActivation ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Mail className="me-2 h-4 w-4" />}{sendingActivation ? (ar ? "جاري الإرسال..." : "Sending...") : (user.account_status === "pending" ? (ar ? "إعادة إرسال دعوة التفعيل" : "Resend activation invitation") : (ar ? "إرسال بريد إعداد كلمة المرور" : "Send password setup email"))}</Button></div>}
  </CardContent></Card>;

  return <form onSubmit={save} className="space-y-6" dir={ar ? "rtl" : "ltr"}>
    <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">{user ? (ar ? "تعديل المستخدم" : "Edit user") : (ar ? "إعداد مستخدم جديد" : "Configure new user")}</h2><p className="mt-1 text-sm text-muted-foreground">{ar ? "إعداد الهوية والدور ومساحة العمل والصلاحيات، ثم تحديد طريقة التفعيل في نهاية النموذج." : "Configure identity, role, workspace and access, then choose the activation method at the end of the form."}</p></div><Button type="button" variant="ghost" size="sm" onClick={onClose}><X className="me-1 h-4 w-4" />{ar ? "إلغاء" : "Cancel"}</Button></div>

    <Card><CardHeader><CardTitle className="text-base">{ar ? "1. البيانات الأساسية" : "1. Basic information"}</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="user-full-name">{ar ? "الاسم الكامل" : "Full name"}</Label><Input id="user-full-name" value={fullName} onChange={e => setFullName(e.target.value)} required disabled={isProtected} /></div><div className="space-y-2"><Label htmlFor="user-email">{ar ? "البريد الإلكتروني" : "Email"}</Label><Input id="user-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isProtected} />{user?.pending_email && <p className="text-xs text-amber-700">{ar ? `البريد الجديد بانتظار تحقق الموظف: ${user.pending_email}` : `Pending verification: ${user.pending_email}`}</p>}</div><div className="space-y-2"><Label htmlFor="user-phone">{ar ? "رقم الهاتف" : "Phone"}</Label><Input id="user-phone" value={phone} onChange={e => setPhone(e.target.value)} disabled={isProtected} /></div></CardContent></Card>

    <Card><CardHeader><CardTitle className="text-base">{ar ? "2. الدور ومساحة العمل" : "2. Role & workspace"}</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>{ar ? "الدور" : "Role"}</Label><Select value={roleId} onValueChange={value => { setRoleId(value); const role = roles.find(item => item.id === value); if (role?.workspace) setWorkspace(role.workspace); }} disabled={isProtected}><SelectTrigger><SelectValue placeholder={ar ? "اختر الدور" : "Choose role"} /></SelectTrigger><SelectContent>{roles.filter(role => role.role_key !== "super_admin" && role.role_key !== "clinic_admin").map(role => <SelectItem key={role.id} value={role.id}>{ar ? role.role_name_ar || role.role_name : role.role_name}</SelectItem>)}</SelectContent></Select>{selectedRole?.workspace && <p className="text-xs text-muted-foreground">{ar ? `المساحة المقترحة: ${selectedRole.workspace}` : `Suggested workspace: ${selectedRole.workspace}`}</p>}</div><div className="space-y-2"><Label>{ar ? "مساحة العمل" : "Workspace"}</Label><Select value={workspace} onValueChange={value => setWorkspace(value as UserWorkspace)} disabled={isProtected}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{workspaces.map(item => <SelectItem key={item.value} value={item.value}>{ar ? item.ar : item.en}</SelectItem>)}</SelectContent></Select></div></CardContent></Card>

    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" />{ar ? "3. الصلاحيات والاستثناءات" : "3. Permissions & exceptions"}</CardTitle></CardHeader><CardContent className="space-y-5"><p className="text-sm text-muted-foreground">{ar ? "الوضع الافتراضي يأتي من الدور، والمنح المباشرة والاستثناءات الصريحة تُحفظ مع المستخدم." : "The role provides default access; direct grants and explicit exceptions are saved with the user."}</p>{catalogLoading || (user && (directLoading || overridesLoading)) ? <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{ar ? "جاري تحميل الصلاحيات..." : "Loading access catalog..."}</div> : <div className="max-h-[420px] space-y-4 overflow-y-auto pe-1">{Object.entries(groupedCatalog).map(([resource, permissions]) => <div key={resource} className="rounded-lg border p-3"><div className="mb-2 flex items-center justify-between"><span className="font-medium">{resource}</span><Badge variant="outline">{permissions.length}</Badge></div><div className="grid gap-2 md:grid-cols-2">{permissions.map(permission => { const state = access[permission.id] ?? "default"; return <button key={permission.id} type="button" disabled={isProtected} onClick={() => togglePermission(permission.id)} className={`flex items-center gap-2 rounded-md border p-2 text-start disabled:cursor-not-allowed disabled:opacity-60 ${state === "granted" ? "border-green-300 bg-green-50" : state === "revoked" ? "border-red-300 bg-red-50" : "hover:bg-muted/50"}`}>{state === "granted" ? <Plus className="h-4 w-4" /> : state === "revoked" ? <Minus className="h-4 w-4" /> : <Check className="h-4 w-4 opacity-30" />}<span className="text-sm">{permission.permission_name || permission.action}</span><span className="ms-auto text-xs text-muted-foreground">{isProtected ? (ar ? "محمي" : "Protected") : state}</span></button>; })}</div></div>)}</div>}</CardContent></Card>

    {user?.account_status && <div className="rounded-lg border bg-muted/30 p-4 text-sm"><span className="font-medium">{ar ? "حالة دورة الحساب: " : "Account lifecycle: "}</span>{user.account_status === "pending" ? (ar ? "بانتظار التفعيل" : "Pending invitation") : user.account_status === "active" ? (ar ? "نشط" : "Active") : (ar ? "غير نشط" : "Inactive")}</div>}
    {isProtected && <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">{ar ? "حساب Clinic Admin محمي ولا يمكن تعديل دوره أو صلاحياته أو حالته من إدارة المستخدمين." : "The Clinic Admin account is protected. Its role, permissions and account state cannot be modified from user management."}</div>}

    {activationSection}
    <Separator /><div className="flex items-center justify-end gap-3"><Button type="button" variant="outline" onClick={onClose}>{ar ? "إلغاء" : "Cancel"}</Button><Button type="submit" disabled={saving || !roleId || !workspace || !fullName.trim() || !email.trim() || isProtected}>{saving ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}{saving ? (ar ? "جاري الحفظ..." : "Saving...") : (ar ? "حفظ إعدادات المستخدم" : "Save user configuration")}</Button></div>
  </form>;
}
