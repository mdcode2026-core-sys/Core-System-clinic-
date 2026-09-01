"use client";

import { useEffect, useMemo, useState } from "react";
import { useTenantId } from "@/core/auth/useTenantId";
import { useI18n } from "@/core/i18n/I18nProvider";
import { usePermissionsCatalog } from "@/domain/roles/roles.queries";
import { useDirectPermissions } from "@/domain/direct-permissions/directPermissions.queries";
import { useUserPermissionOverrides } from "@/domain/overrides/overrides.queries";
import { createClinicUser, updateClinicUser } from "@/domain/users/users.actions";
import type { ClinicUserWithRole, UserWorkspace } from "@/domain/users/users.types";
import type { Role } from "@/domain/roles/roles.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Check, KeyRound, Loader2, Minus, Plus, Save, ShieldCheck, X } from "lucide-react";

const workspaces: Array<{ value: UserWorkspace; en: string; ar: string }> = [
  { value: "operation", en: "Operational", ar: "تشغيلي" },
  { value: "clinical", en: "Clinical", ar: "سريري" },
  { value: "administration", en: "Administration", ar: "إداري" },
];

type AccessState = "default" | "granted" | "revoked";

type Props = {
  user?: ClinicUserWithRole | null;
  roles: Role[];
  onClose: () => void;
  onSaved: (result: { activationLink?: string; emailSent?: boolean }) => void;
  onError: (message: string | null) => void;
};

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user?.full_name ?? "");
    setEmail(user?.email ?? "");
    setPhone(user?.phone ?? "");
    setRoleId(user?.role_id ?? "");
    setWorkspace((user?.role_workspace as UserWorkspace) || "operation");
  }, [user]);

  useEffect(() => {
    if (!user || directLoading || overridesLoading) return;
    const next: Record<string, AccessState> = {};
    for (const row of direct as any[]) if (row.granted) next[row.permission_id] = "granted";
    for (const row of overrides) if (!row.granted && !next[row.permission_id]) next[row.permission_id] = "revoked";
    setAccess(next);
  }, [user, direct, overrides, directLoading, overridesLoading]);

  const selectedRole = useMemo(() => roles.find(role => role.id === roleId), [roles, roleId]);
  const groupedCatalog = useMemo(() => catalog.reduce<Record<string, typeof catalog>>((groups, permission) => {
    (groups[permission.resource] ??= []).push(permission);
    return groups;
  }, {}), [catalog]);

  function togglePermission(id: string) {
    setAccess(current => ({ ...current, [id]: current[id] === "granted" ? "revoked" : current[id] === "revoked" ? "default" : "granted" }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    onError(null);
    if (!roleId || !workspace || !fullName.trim() || !email.trim()) return;
    setSaving(true);
    const directPermissionIds = Object.entries(access).filter(([, state]) => state === "granted").map(([id]) => id);
    const revokedPermissionIds = Object.entries(access).filter(([, state]) => state === "revoked").map(([id]) => id);
    const result = user
      ? await updateClinicUser({ id: user.id, full_name: fullName, email, phone, role_id: roleId, workspace, directPermissionIds, revokedPermissionIds })
      : await createClinicUser({ full_name: fullName, email, phone, role_id: roleId, workspace, directPermissionIds, revokedPermissionIds });
    setSaving(false);
    if (!result.success) { onError(result.error); return; }
    onSaved({ activationLink: result.activationLink, emailSent: result.emailSent });
  }

  return <form onSubmit={save} className="space-y-6" dir={ar ? "rtl" : "ltr"}>
    <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">{user ? (ar ? "تعديل المستخدم" : "Edit user") : (ar ? "إعداد مستخدم جديد" : "Configure new user")}</h2><p className="mt-1 text-sm text-muted-foreground">{ar ? "كل إعدادات المستخدم الأساسية والوصول والدخول في نموذج واحد ثم حفظ واحد." : "Configure identity, role, workspace, access, and login in one form with one Save action."}</p></div><Button type="button" variant="ghost" size="sm" onClick={onClose}><X className="me-1 h-4 w-4" />{ar ? "إلغاء" : "Cancel"}</Button></div>
    <Card><CardHeader><CardTitle className="text-base">{ar ? "1. البيانات الأساسية" : "1. Basic information"}</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="user-full-name">{ar ? "الاسم الكامل" : "Full name"}</Label><Input id="user-full-name" value={fullName} onChange={e => setFullName(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="user-email">{ar ? "البريد الإلكتروني" : "Email"}</Label><Input id="user-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="user-phone">{ar ? "رقم الهاتف" : "Phone"}</Label><Input id="user-phone" value={phone} onChange={e => setPhone(e.target.value)} /></div></CardContent></Card>
    <Card><CardHeader><CardTitle className="text-base">{ar ? "2. الدور ومساحة العمل" : "2. Role & workspace"}</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>{ar ? "الدور" : "Role"}</Label><Select value={roleId} onValueChange={value => { setRoleId(value); const role = roles.find(item => item.id === value); if (role?.workspace) setWorkspace(role.workspace); }}><SelectTrigger><SelectValue placeholder={ar ? "اختر الدور" : "Choose role"} /></SelectTrigger><SelectContent>{roles.filter(role => role.role_key !== "super_admin").map(role => <SelectItem key={role.id} value={role.id}>{ar ? role.role_name_ar || role.role_name : role.role_name}</SelectItem>)}</SelectContent></Select>{selectedRole?.workspace && <p className="text-xs text-muted-foreground">{ar ? `المساحة المقترحة: ${selectedRole.workspace}` : `Suggested workspace: ${selectedRole.workspace}`}</p>}</div><div className="space-y-2"><Label>{ar ? "مساحة العمل" : "Workspace"}</Label><Select value={workspace} onValueChange={value => setWorkspace(value as UserWorkspace)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{workspaces.map(item => <SelectItem key={item.value} value={item.value}>{ar ? item.ar : item.en}</SelectItem>)}</SelectContent></Select></div></CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" />{ar ? "3. الصلاحيات والاستثناءات" : "3. Permissions & exceptions"}</CardTitle></CardHeader><CardContent className="space-y-5"><p className="text-sm text-muted-foreground">{ar ? "الوضع الافتراضي يأتي من الدور. المنح المباشرة والاستثناءات تُحفظ مع نفس المستخدم ضمن نفس عملية الحفظ." : "The role provides the default access. Direct grants and explicit exceptions are saved with the same user in the same Save operation."}</p>{catalogLoading || (user && (directLoading || overridesLoading)) ? <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{ar ? "جاري تحميل الصلاحيات..." : "Loading access catalog..."}</div> : <div className="max-h-[420px] space-y-4 overflow-y-auto pe-1">{Object.entries(groupedCatalog).map(([resource, permissions]) => <div key={resource} className="rounded-lg border p-3"><div className="mb-2 flex items-center justify-between"><span className="font-medium">{resource}</span><Badge variant="outline">{permissions.length}</Badge></div><div className="grid gap-2 md:grid-cols-2">{permissions.map(permission => { const state = access[permission.id] ?? "default"; return <button key={permission.id} type="button" onClick={() => togglePermission(permission.id)} className={`flex items-center gap-2 rounded-md border p-2 text-start ${state === "granted" ? "border-green-300 bg-green-50" : state === "revoked" ? "border-red-300 bg-red-50" : "hover:bg-muted/50"}`}>{state === "granted" ? <Plus className="h-4 w-4" /> : state === "revoked" ? <Minus className="h-4 w-4" /> : <Check className="h-4 w-4 opacity-30" />}<span className="text-sm">{permission.permission_name || permission.action}</span><span className="ms-auto text-xs text-muted-foreground">{state}</span></button>; })}</div></div>)}</div>}</CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-4 w-4" />{ar ? "4. الحساب والدعوة" : "4. Account & invitation"}</CardTitle></CardHeader><CardContent><div className="rounded-lg border bg-muted/30 p-4"><p className="text-sm font-medium">{ar ? "كلمة المرور" : "Password"}</p><p className="mt-1 text-sm text-muted-foreground">{ar ? "تتم إدارة كلمة المرور عبر Supabase Auth. لا ينشئ Clinic Admin كلمة المرور ولا يعرفها." : "Password is managed by Supabase Auth. The Clinic Admin does not create or know the password."}</p></div>{!user && <p className="mt-3 text-xs text-muted-foreground">{ar ? "عند الحفظ سيتم إنشاء حساب الدخول وإرسال دعوة التفعيل." : "Saving creates the login account and sends the activation invitation."}</p>}{user?.auth_user_id && <p className="mt-3 text-xs text-muted-foreground">{ar ? "إعادة التفعيل/الدعوة تتم من مسار المستخدم ولا تتطلب نموذجًا ثانيًا." : "Reactivation/invitation stays on the user lifecycle path and does not require a second setup form."}</p>}</CardContent></Card>
    <Separator /><div className="flex items-center justify-end gap-3"><Button type="button" variant="outline" onClick={onClose}>{ar ? "إلغاء" : "Cancel"}</Button><Button type="submit" disabled={saving || !roleId || !workspace || !fullName.trim() || !email.trim()}>{saving ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}{saving ? (ar ? "جاري الحفظ..." : "Saving...") : (ar ? "حفظ إعدادات المستخدم" : "Save user configuration")}</Button></div>
  </form>;
}