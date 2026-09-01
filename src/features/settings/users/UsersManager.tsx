"use client";

import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useClinicUsers } from "@/domain/users/users.queries";
import { useRoles } from "@/domain/roles/roles.queries";
import { activateClinicUserAccount, createClinicUser, updateClinicUser, toggleClinicUserActive } from "@/domain/users/users.actions";
import type { ClinicUserWithRole, UserWorkspace } from "@/domain/users/users.types";
import type { Role } from "@/domain/roles/roles.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { Users, Plus, Pencil, Mail, Phone, ShieldCheck, Shield, AlertTriangle, UserPlus, KeyRound, Copy, Check, BriefcaseBusiness } from "lucide-react";

const workspaces: Array<{ value: UserWorkspace; en: string; ar: string }> = [
  { value: "operation", en: "Operational", ar: "تشغيلي" },
  { value: "clinical", en: "Clinical", ar: "سريري" },
  { value: "administration", en: "Administration", ar: "إداري" },
];

function workspaceLabel(value: string | null | undefined, locale: string) {
  const found = workspaces.find((item) => item.value === value);
  return found ? (locale === "ar" ? found.ar : found.en) : "—";
}

function errorLabel(error: string | null, locale: string) {
  if (!error) return null;
  const labels: Record<string, [string, string]> = {
    USER_EMAIL_OR_USER_EXISTS: ["This user or email already exists.", "هذا المستخدم أو البريد الإلكتروني موجود بالفعل."],
    USER_EMAIL_REQUIRED: ["An email address is required for activation.", "البريد الإلكتروني مطلوب لتفعيل الحساب."],
    USER_WORKSPACE_SETUP_FAILED: ["The user could not be assigned a workspace.", "تعذر تعيين مساحة العمل للمستخدم."],
    USER_WORKSPACE_UPDATE_FAILED: ["The workspace could not be updated.", "تعذر تحديث مساحة العمل."],
    AUTH_INVITATION_FAILED: ["The account could not be provisioned.", "تعذر إنشاء حساب الدخول."],
    AUTH_LINK_FAILED: ["The login account could not be linked to the clinic user.", "تعذر ربط حساب الدخول بمستخدم العيادة."],
    AUTH_REACTIVATION_FAILED: ["The login account could not be reactivated.", "تعذر إعادة تفعيل حساب الدخول."],
    AUTH_EMAIL_UPDATE_FAILED: ["The login email could not be updated.", "تعذر تحديث بريد تسجيل الدخول."],
    USER_STATUS_UPDATE_FAILED: ["The user status could not be updated.", "تعذر تحديث حالة المستخدم."],
    AUTH_STATUS_UPDATE_FAILED: ["The login access could not be updated.", "تعذر تحديث صلاحية الدخول."],
  };
  const pair = labels[error];
  return pair ? (locale === "ar" ? pair[1] : pair[0]) : error;
}

export function UsersManager() {
  const { locale, admin: a } = useI18n();
  const { tenantId } = useTenantId();
  const { hasPermission } = usePermissions();
  const { data: users = [], isLoading, error, refetch } = useClinicUsers(tenantId);
  const { data: roles = [] } = useRoles(tenantId);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ClinicUserWithRole | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activatingUserId, setActivatingUserId] = useState<string | null>(null);
  const [activationLink, setActivationLink] = useState<string | null>(null);

  const canCreate = hasPermission("users:create");
  const canUpdate = hasPermission("users:update");
  const canDelete = hasPermission("users:delete");
  const dateLocale = locale === "ar" ? "ar" : "en-US-u-nu-latn";
  const direction = locale === "ar" ? "rtl" : "ltr";

  async function handleActivate(userId: string) {
    setActionError(null); setNotice(null); setActivatingUserId(userId);
    const result = await activateClinicUserAccount(userId);
    setActivatingUserId(null);
    if (!result.success) setActionError(errorLabel(result.error, locale));
    else { setActivationLink(result.activationLink ?? null); setNotice(result.emailSent === false && !result.activationLink ? (locale === "ar" ? "تم تحديث حالة الحساب." : "The account status was updated.") : result.activationLink ? null : (locale === "ar" ? "تم إرسال رابط التفعيل إلى البريد الإلكتروني." : "The activation invitation was sent by email.")); void refetch(); }
  }

  if (isLoading) return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /><span className="ms-3 text-muted-foreground">{a.users.loading}</span></div>;
  if (error) return <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center"><AlertTriangle className="mx-auto mb-2 h-8 w-8 text-destructive" /><p className="font-medium text-destructive">{a.users.loadFailed}</p></div>;

  return <div className="space-y-6" dir={direction}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2"><Users className="h-5 w-5 text-primary" /></div><div><h2 className="text-xl font-semibold">{locale === "ar" ? "أعضاء الفريق" : "Team members"}</h2><p className="text-sm text-muted-foreground">{users.length} {a.users.count} · {locale === "ar" ? "الهوية والوصول وحساب الدخول من مكان واحد" : "Identity, access, and login account in one place"}</p></div></div>{canCreate && <Button onClick={() => { setActionError(null); setNotice(null); setCreateOpen(true); }}><Plus className="me-2 h-4 w-4" />{locale === "ar" ? "دعوة عضو للفريق" : "Invite team member"}</Button>}</div>
    {actionError && <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{actionError}</div>}
    {notice && <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-foreground">{notice}</div>}

    <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>{locale === "ar" ? "عضو الفريق" : "Team member"}</TableHead><TableHead>{a.users.role}</TableHead><TableHead>{locale === "ar" ? "مساحة العمل" : "Workspace"}</TableHead><TableHead>{locale === "ar" ? "حساب الدخول" : "Login account"}</TableHead><TableHead>{a.users.status}</TableHead><TableHead>{a.users.actions}</TableHead></TableRow></TableHeader><TableBody>{users.length === 0 ? <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">{a.users.noUsers}</TableCell></TableRow> : users.map(user => <TableRow key={user.id} className={!user.is_active ? "opacity-60" : ""}>
      <TableCell><div className="flex flex-col gap-0.5"><span className="font-medium">{user.full_name || "—"}</span><span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{user.email || "—"}</span>{user.phone && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{user.phone}</span>}</div></TableCell>
      <TableCell><div className="flex items-center gap-2">{user.is_system_role ? <ShieldCheck className="h-4 w-4" /> : <Shield className="h-4 w-4" />}<span className="text-sm">{locale === "ar" ? user.role_name_ar || user.role_name || user.role : user.role_name || user.role_name_ar || user.role}</span></div></TableCell>
      <TableCell><span className="inline-flex items-center gap-1.5 text-sm"><BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />{workspaceLabel(user.role_workspace, locale)}</span></TableCell>
      <TableCell>{user.auth_user_id ? <Badge variant="default">{locale === "ar" ? "مرتبط" : "Linked"}</Badge> : <Badge variant="outline"><AlertTriangle className="me-1 h-3 w-3" />{locale === "ar" ? "بانتظار التفعيل" : "Invitation pending"}</Badge>}</TableCell>
      <TableCell><Badge variant={user.is_active ? "default" : "secondary"}>{user.is_active ? a.users.active : a.users.inactive}</Badge></TableCell>
      <TableCell><div className="flex flex-wrap items-center gap-2">{canUpdate && <Button variant="ghost" size="sm" aria-label={a.users.editTitle} onClick={() => { setEditingUser(user); setActionError(null); setEditOpen(true); }}><Pencil className="h-4 w-4" /></Button>}{canUpdate && user.auth_user_id === null && <Button variant="outline" size="sm" disabled={activatingUserId === user.id} onClick={() => void handleActivate(user.id)} title={locale === "ar" ? "إرسال/إعادة إرسال رابط التفعيل" : "Send or resend activation"}><KeyRound className="me-2 h-4 w-4" />{locale === "ar" ? "إرسال التفعيل" : "Send activation"}</Button>}{canDelete && <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{user.is_active ? a.users.active : a.users.inactive}</span><Switch checked={user.is_active} onCheckedChange={async checked => { setActionError(null); const result = await toggleClinicUserActive(user.id, checked); if (!result.success) setActionError(errorLabel(result.error, locale)); else void refetch(); }} /></div>}</div></TableCell>
    </TableRow>)}</TableBody></Table></CardContent></Card>

    <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} roles={roles} locale={locale} onError={(e) => setActionError(errorLabel(e, locale))} onSuccess={(result) => { setCreateOpen(false); setActivationLink(result.activationLink ?? null); setNotice(result.emailSent === false && result.activationLink ? (locale === "ar" ? "تم إنشاء الحساب. تعذر إرسال البريد تلقائيًا، لذلك تم تجهيز رابط التفعيل للنسخ والمشاركة بأمان." : "The account was created. Email delivery was unavailable, so a secure activation link is ready to copy and share.") : (locale === "ar" ? "تم إنشاء عضو الفريق وإرسال رابط التفعيل." : "The team member was created and the activation invitation was sent.")); void refetch(); }} />
    {editingUser && <EditUserDialog open={editOpen} onOpenChange={setEditOpen} user={editingUser} roles={roles} locale={locale} onError={(e) => setActionError(errorLabel(e, locale))} onSuccess={() => { setEditOpen(false); setEditingUser(null); void refetch(); }} />}

    <Dialog open={!!activationLink} onOpenChange={(open) => { if (!open) setActivationLink(null); }}><DialogContent dir={direction} className="sm:max-w-xl"><DialogHeader><DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" />{locale === "ar" ? "رابط تفعيل الحساب" : "Account activation link"}</DialogTitle><DialogDescription>{locale === "ar" ? "تم إنشاء حساب الدخول بنجاح. أرسل هذا الرابط للموظف عبر قناة موثوقة ليضع كلمة المرور بنفسه." : "The login account was created. Share this link with the employee through a trusted channel so they can set their own password."}</DialogDescription></DialogHeader><div className="space-y-3"><Input readOnly value={activationLink ?? ""} /><Button className="w-full" onClick={() => { if (activationLink) void navigator.clipboard.writeText(activationLink); }}>{locale === "ar" ? "نسخ الرابط" : "Copy activation link"}</Button><p className="text-xs text-muted-foreground">{locale === "ar" ? "لا يطلب النظام من Clinic Admin معرفة كلمة المرور أو إنشائها." : "The Clinic Admin never needs to know or create the employee's password."}</p></div></DialogContent></Dialog>
  </div>;
}

type DialogBaseProps = { roles: Role[]; locale: string; onError: (message: string | null) => void };

function CreateUserDialog({ open, onOpenChange, roles, locale, onError, onSuccess }: DialogBaseProps & { open: boolean; onOpenChange: (value: boolean) => void; onSuccess: (result: { activationLink?: string; emailSent?: boolean }) => void }) {
  const [fullName, setFullName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState(""); const [roleId, setRoleId] = useState(""); const [workspace, setWorkspace] = useState<UserWorkspace | "">(""); const [submitting, setSubmitting] = useState(false);
  const selectedRole = roles.find(role => role.id === roleId);
  function handleRoleChange(value: string) { setRoleId(value); const role = roles.find(item => item.id === value); if (role?.workspace) setWorkspace(role.workspace); }
  async function handleSubmit(e: React.FormEvent) { e.preventDefault(); onError(null); setSubmitting(true); const result = await createClinicUser({ full_name: fullName, email, phone: phone || undefined, role_id: roleId, workspace: workspace || undefined }); setSubmitting(false); if (!result.success) onError(result.error); else { setFullName(""); setEmail(""); setPhone(""); setRoleId(""); setWorkspace(""); onSuccess(result); } }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir={locale === "ar" ? "rtl" : "ltr"} className="max-h-[90vh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />{locale === "ar" ? "إضافة عضو للفريق" : "Add team member"}</DialogTitle><DialogDescription>{locale === "ar" ? "أنشئ ملف العضو، حدّد دوره ومساحة عمله، وأنشئ حساب الدخول وأرسل التفعيل في العملية نفسها." : "Create the member profile, set their role and workspace, and provision their login invitation in the same flow."}</DialogDescription></DialogHeader><form onSubmit={handleSubmit} className="space-y-5">
    <section className="space-y-4"><div><h3 className="font-semibold">{locale === "ar" ? "1. البيانات الأساسية" : "1. Basic information"}</h3><p className="text-xs text-muted-foreground">{locale === "ar" ? "الاسم وبيانات التواصل التي ستظهر داخل العيادة." : "Identity and contact details used inside the clinic."}</p></div><div className="space-y-2"><Label htmlFor="fullName">{locale === "ar" ? "الاسم الكامل" : "Full name"}</Label><Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="email">{locale === "ar" ? "البريد الإلكتروني" : "Email"}</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="phone">{locale === "ar" ? "رقم الهاتف" : "Phone number"}</Label><Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} /></div></section>
    <Separator />
    <section className="space-y-4"><div><h3 className="font-semibold">{locale === "ar" ? "2. الدور والوصول" : "2. Role & access"}</h3><p className="text-xs text-muted-foreground">{locale === "ar" ? "الدور يحدد الصلاحيات الأساسية، ومساحة العمل تحدد بيئة العمل الافتراضية." : "The role provides baseline permissions; the workspace sets the user's default working environment."}</p></div><div className="space-y-2"><Label htmlFor="role">{locale === "ar" ? "الدور" : "Role"}</Label><Select value={roleId} onValueChange={handleRoleChange}><SelectTrigger id="role"><SelectValue placeholder={locale === "ar" ? "اختر الدور" : "Choose role"} /></SelectTrigger><SelectContent>{roles.filter(r => r.role_key !== "super_admin").map(r => <SelectItem key={r.id} value={r.id}>{locale === "ar" ? r.role_name_ar || r.role_name : r.role_name || r.role_name_ar}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="workspace">{locale === "ar" ? "مساحة العمل الافتراضية" : "Default workspace"}</Label><Select value={workspace} onValueChange={value => setWorkspace(value as UserWorkspace)}><SelectTrigger id="workspace"><SelectValue placeholder={locale === "ar" ? "اختر مساحة العمل" : "Choose workspace"} /></SelectTrigger><SelectContent>{workspaces.map(item => <SelectItem key={item.value} value={item.value}>{locale === "ar" ? item.ar : item.en}</SelectItem>)}</SelectContent></Select>{selectedRole?.workspace && <p className="text-xs text-muted-foreground">{locale === "ar" ? `الافتراضي المقترح لهذا الدور: ${workspaceLabel(selectedRole.workspace, locale)}` : `Suggested default for this role: ${workspaceLabel(selectedRole.workspace, locale)}`}</p>}</div></section>
    <Separator />
    <section className="rounded-lg border bg-muted/30 p-4"><div className="flex items-start gap-3"><KeyRound className="mt-0.5 h-5 w-5 text-primary" /><div><h3 className="font-semibold">{locale === "ar" ? "3. حساب الدخول" : "3. Login account"}</h3><p className="mt-1 text-sm text-muted-foreground">{locale === "ar" ? "سيتم إنشاء حساب Auth مستقل وإرسال رابط تفعيل. الموظف هو من يحدد كلمة المرور." : "A separate Auth account will be provisioned and an activation link sent. The employee sets their own password."}</p></div></div></section>
    <DialogFooter className="gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{locale === "ar" ? "إلغاء" : "Cancel"}</Button><Button type="submit" disabled={submitting || !roleId || !workspace}>{submitting ? (locale === "ar" ? "جاري الإنشاء..." : "Creating...") : (locale === "ar" ? "إنشاء وإرسال التفعيل" : "Create & send invitation")}</Button></DialogFooter>
  </form></DialogContent></Dialog>;
}

function EditUserDialog({ open, onOpenChange, user, roles, locale, onError, onSuccess }: DialogBaseProps & { open: boolean; onOpenChange: (value: boolean) => void; user: ClinicUserWithRole; onSuccess: () => void }) {
  const [fullName, setFullName] = useState(user.full_name || ""); const [email, setEmail] = useState(user.email || ""); const [phone, setPhone] = useState(user.phone || ""); const [roleId, setRoleId] = useState(user.role_id); const [workspace, setWorkspace] = useState<UserWorkspace>((user.role_workspace as UserWorkspace) || "operation"); const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(e: React.FormEvent) { e.preventDefault(); onError(null); setSubmitting(true); const result = await updateClinicUser({ id: user.id, full_name: fullName, email, phone: phone || undefined, role_id: roleId, workspace }); setSubmitting(false); if (!result.success) onError(result.error); else onSuccess(); }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir={locale === "ar" ? "rtl" : "ltr"} className="max-h-[90vh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>{locale === "ar" ? "إدارة عضو الفريق" : "Manage team member"}</DialogTitle><DialogDescription>{locale === "ar" ? "الهوية والدور ومساحة العمل وحالة حساب الدخول محفوظة ضمن ملف العضو نفسه." : "Identity, role, workspace, and login state are managed as one member profile."}</DialogDescription></DialogHeader><form onSubmit={handleSubmit} className="space-y-5"><section className="space-y-4"><div className="space-y-2"><Label htmlFor="edit-fullName">{locale === "ar" ? "الاسم الكامل" : "Full name"}</Label><Input id="edit-fullName" value={fullName} onChange={e => setFullName(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="edit-email">{locale === "ar" ? "البريد الإلكتروني" : "Email"}</Label><Input id="edit-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="edit-phone">{locale === "ar" ? "رقم الهاتف" : "Phone number"}</Label><Input id="edit-phone" value={phone} onChange={e => setPhone(e.target.value)} /></div></section><Separator /><section className="space-y-4"><div className="space-y-2"><Label htmlFor="edit-role">{locale === "ar" ? "الدور" : "Role"}</Label><Select value={roleId} onValueChange={setRoleId}><SelectTrigger id="edit-role"><SelectValue /></SelectTrigger><SelectContent>{roles.filter(r => r.role_key !== "super_admin").map(r => <SelectItem key={r.id} value={r.id}>{locale === "ar" ? r.role_name_ar || r.role_name : r.role_name || r.role_name_ar}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="edit-workspace">{locale === "ar" ? "مساحة العمل الافتراضية" : "Default workspace"}</Label><Select value={workspace} onValueChange={value => setWorkspace(value as UserWorkspace)}><SelectTrigger id="edit-workspace"><SelectValue /></SelectTrigger><SelectContent>{workspaces.map(item => <SelectItem key={item.value} value={item.value}>{locale === "ar" ? item.ar : item.en}</SelectItem>)}</SelectContent></Select></div></section><Separator /><section className="rounded-lg border bg-muted/30 p-4"><p className="text-sm font-medium">{locale === "ar" ? "الصلاحيات المتقدمة" : "Advanced access"}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{locale === "ar" ? "الصلاحيات الأساسية تأتي من الدور. المنح والاستثناءات الفردية تُدار من قسم Access & Overrides ضمن Team & Access." : "Baseline access comes from the role. Individual grants and exceptions are managed under Access & Overrides inside Team & Access."}</p></section><DialogFooter className="gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{locale === "ar" ? "إلغاء" : "Cancel"}</Button><Button type="submit" disabled={submitting || !roleId}>{submitting ? (locale === "ar" ? "جاري الحفظ..." : "Saving...") : (locale === "ar" ? "حفظ التغييرات" : "Save changes")}</Button></DialogFooter></form></DialogContent></Dialog>;
}
