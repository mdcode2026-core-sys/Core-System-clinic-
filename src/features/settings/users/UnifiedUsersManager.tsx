"use client";

import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useClinicUsers } from "@/domain/users/users.queries";
import { useRoles } from "@/domain/roles/roles.queries";
import { activateClinicUserAccount, toggleClinicUserActive } from "@/domain/users/users.actions";
import type { ClinicUserWithRole } from "@/domain/users/users.types";
import { UserConfigurationForm } from "./UserConfigurationForm";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Switch } from "@/shared/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { AlertTriangle, BriefcaseBusiness, KeyRound, Loader2, Mail, Pencil, Phone, Plus, Users } from "lucide-react";

const workspaceLabel = (value: string | null | undefined, ar: boolean) => ({ operation: ar ? "تشغيلي" : "Operational", clinical: ar ? "سريري" : "Clinical", administration: ar ? "إداري" : "Administration" } as Record<string, string>)[value ?? ""] ?? "—";

export function UnifiedUsersManager() {
  const { locale, admin: a } = useI18n();
  const { tenantId, userId } = useTenantId();
  const { hasPermission } = usePermissions();
  const { data: users = [], isLoading, error, refetch } = useClinicUsers(tenantId);
  const { data: roles = [] } = useRoles(tenantId);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ClinicUserWithRole | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activationLink, setActivationLink] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);
  const ar = locale === "ar";
  const canCreate = hasPermission("users:create");
  const canUpdate = hasPermission("users:update");
  const canDelete = hasPermission("users:delete");
  const errorLabel = (code: string | null) => ({ USER_EMAIL_OR_USER_EXISTS: ar ? "هذا البريد الإلكتروني موجود بالفعل داخل العيادة." : "This email already exists in this clinic.", USER_EMPLOYEE_CODE_EXISTS: ar ? "تعذر إنشاء رمز موظف فريد." : "A unique employee code could not be generated.", USER_ACCESS_SETUP_FAILED: ar ? "تعذر حفظ صلاحيات المستخدم أثناء الإنشاء." : "User access could not be saved during creation.", USER_ACCESS_UPDATE_FAILED: ar ? "تعذر حفظ صلاحيات المستخدم." : "User access could not be saved.", PERMISSION_REFERENCE_INVALID: ar ? "إحدى الصلاحيات المحددة غير صالحة." : "One of the selected permissions is invalid.", CLINIC_ADMIN_ACCOUNT_PROTECTED: ar ? "حساب Clinic Admin الرئيسي محمي ولا يمكن تغييره من إدارة المستخدمين." : "The primary Clinic Admin account is protected from changes here.", USER_WORKSPACE_SETUP_FAILED: ar ? "تعذر إعداد مساحة عمل المستخدم." : "The user's workspace could not be configured.", USER_WORKSPACE_UPDATE_FAILED: ar ? "تعذر تحديث مساحة العمل." : "The workspace could not be updated.", AUTH_INVITATION_FAILED: ar ? "تعذر إنشاء دعوة الدخول." : "The login invitation could not be created." } as Record<string, string>)[code ?? ""] ?? code;

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (error) return <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center"><AlertTriangle className="mx-auto mb-2 h-8 w-8 text-destructive" /><p className="font-medium text-destructive">{a.users.loadFailed}</p></div>;

  async function activate(userIdToActivate: string) { setActionError(null); setActivating(userIdToActivate); const result = await activateClinicUserAccount(userIdToActivate); setActivating(null); if (!result.success) setActionError(errorLabel(result.error)); else { setActivationLink(result.activationLink ?? null); void refetch(); } }

  if (formOpen) return <UserConfigurationForm user={editingUser} roles={roles} onClose={() => setFormOpen(false)} onError={code => setActionError(errorLabel(code))} onSaved={result => { setFormOpen(false); setEditingUser(null); setActionError(null); setActivationLink(result.activationLink ?? null); void refetch(); }} />;

  return <div className="space-y-6" dir={ar ? "rtl" : "ltr"}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2"><Users className="h-5 w-5 text-primary" /></div><div><h2 className="text-xl font-semibold">{ar ? "المستخدمون" : "Users"}</h2><p className="text-sm text-muted-foreground">{users.length} {a.users.count} · {ar ? "الإعداد الكامل من مسار واحد" : "Complete configuration from one path"}</p></div></div>{canCreate && <Button onClick={() => { setEditingUser(null); setActionError(null); setFormOpen(true); }}><Plus className="me-2 h-4 w-4" />{ar ? "إضافة مستخدم" : "Add user"}</Button>}</div>
    {actionError && <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{actionError}</div>}
    <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>{ar ? "المستخدم" : "User"}</TableHead><TableHead>{a.users.role}</TableHead><TableHead>{ar ? "مساحة العمل" : "Workspace"}</TableHead><TableHead>{ar ? "الدخول" : "Login"}</TableHead><TableHead>{a.users.status}</TableHead><TableHead>{a.users.actions}</TableHead></TableRow></TableHeader><TableBody>{users.map(user => { const isCurrentAccount = !!userId && user.auth_user_id === userId; return <TableRow key={user.id} className={!user.is_active ? "opacity-60" : ""}><TableCell><div className="flex flex-col gap-0.5"><span className="font-medium">{user.full_name || "—"}</span><span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{user.email || "—"}</span>{user.phone && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{user.phone}</span>}{isCurrentAccount && <span className="text-xs font-medium text-primary">{ar ? "حساب Clinic Admin الحالي — محمي" : "Current Clinic Admin account — protected"}</span>}</div></TableCell><TableCell>{ar ? user.role_name_ar || user.role_name || user.role : user.role_name || user.role}</TableCell><TableCell><span className="inline-flex items-center gap-1.5 text-sm"><BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />{workspaceLabel(user.role_workspace, ar)}</span></TableCell><TableCell>{user.auth_user_id ? <Badge>{ar ? "مرتبط" : "Linked"}</Badge> : <Badge variant="outline">{ar ? "بانتظار التفعيل" : "Invitation pending"}</Badge>}</TableCell><TableCell><Badge variant={user.is_active ? "default" : "secondary"}>{user.is_active ? a.users.active : a.users.inactive}</Badge></TableCell><TableCell><div className="flex flex-wrap items-center gap-2">{canUpdate && !isCurrentAccount && <Button variant="ghost" size="sm" onClick={() => { setEditingUser(user); setActionError(null); setFormOpen(true); }}><Pencil className="h-4 w-4" /></Button>}{canUpdate && !isCurrentAccount && !user.auth_user_id && <Button variant="outline" size="sm" disabled={activating === user.id} onClick={() => void activate(user.id)}><KeyRound className="me-1 h-4 w-4" />{ar ? "إرسال التفعيل" : "Send invitation"}</Button>}{canDelete && !isCurrentAccount && <div className="flex items-center gap-2"><Switch checked={user.is_active} onCheckedChange={async checked => { const result = await toggleClinicUserActive(user.id, checked); if (!result.success) setActionError(errorLabel(result.error)); else void refetch(); }} /><span className="text-xs text-muted-foreground">{user.is_active ? a.users.active : a.users.inactive}</span></div>}</div></TableCell></TableRow>; })}</TableBody></Table></CardContent></Card>
    <Dialog open={!!activationLink} onOpenChange={open => { if (!open) setActivationLink(null); }}><DialogContent dir={ar ? "rtl" : "ltr"}><div className="space-y-4"><h3 className="flex items-center gap-2 text-lg font-semibold"><KeyRound className="h-5 w-5" />{ar ? "رابط التفعيل" : "Activation link"}</h3><p className="text-sm text-muted-foreground">{ar ? "المستخدم يحدد كلمة المرور بنفسه." : "The user sets their own password."}</p><input className="w-full rounded-md border bg-background px-3 py-2 text-sm" readOnly value={activationLink ?? ""} /><Button className="w-full" onClick={() => activationLink && void navigator.clipboard.writeText(activationLink)}>{ar ? "نسخ الرابط" : "Copy link"}</Button></div></DialogContent></Dialog>
  </div>;
}