"use client";

import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useClinicUsers } from "@/domain/users/users.queries";
import { useRoles } from "@/domain/roles/roles.queries";
import { activateClinicUserAccount, createClinicUser, updateClinicUser, toggleClinicUserActive } from "@/domain/users/users.actions";
import type { ClinicUserWithRole } from "@/domain/users/users.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Switch } from "@/shared/components/ui/switch";
import { Users, Plus, Pencil, Mail, Phone, ShieldCheck, Shield, AlertTriangle, UserPlus, KeyRound } from "lucide-react";

type RoleOption = { id: string; role_key: string; role_name: string; role_name_ar: string | null; is_system_role: boolean };
type DialogProps = { open: boolean; onOpenChange: (value: boolean) => void; roles: RoleOption[]; onError: (message: string | null) => void; onSuccess: () => void };

export function UsersManager() {
  const { locale, admin: a } = useI18n();
  const { tenantId } = useTenantId();
  const { hasPermission } = usePermissions();
  const { data: users = [], isLoading, error, refetch } = useClinicUsers(tenantId);
  const { data: roles = [] } = useRoles(tenantId);
  const [createOpen, setCreateOpen] = useState(false); const [editOpen, setEditOpen] = useState(false); const [editingUser, setEditingUser] = useState<ClinicUserWithRole | null>(null); const [actionError, setActionError] = useState<string | null>(null); const [activatingUserId, setActivatingUserId] = useState<string | null>(null);
  const canCreate = hasPermission("users:create"); const canUpdate = hasPermission("users:update"); const canDelete = hasPermission("users:delete"); const dateLocale = locale === "ar" ? "ar" : "en-US-u-nu-latn"; const direction = locale === "ar" ? "rtl" : "ltr";

  async function handleActivate(userId: string) {
    setActionError(null); setActivatingUserId(userId);
    const result = await activateClinicUserAccount(userId);
    setActivatingUserId(null);
    if (!result.success) setActionError(a.users.actionFailed); else void refetch();
  }

  if (isLoading) return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /><span className="ms-3 text-muted-foreground">{a.users.loading}</span></div>;
  if (error) return <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center"><AlertTriangle className="mx-auto mb-2 h-8 w-8 text-destructive" /><p className="font-medium text-destructive">{a.users.loadFailed}</p></div>;
  return <div className="space-y-6" dir={direction}>
    <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2"><Users className="h-5 w-5 text-primary" /></div><div><h2 className="text-xl font-semibold">{a.users.title}</h2><p className="text-sm text-muted-foreground">{users.length} {a.users.count}</p></div></div>{canCreate && <Button onClick={() => { setActionError(null); setCreateOpen(true); }}><Plus className="me-2 h-4 w-4" />{a.users.newUser}</Button>}</div>
    {actionError && <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{actionError}</div>}
    <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>{a.users.user}</TableHead><TableHead>{a.users.role}</TableHead><TableHead>{a.users.status}</TableHead><TableHead>{a.users.createdAt}</TableHead><TableHead>{a.users.actions}</TableHead></TableRow></TableHeader><TableBody>{users.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">{a.users.noUsers}</TableCell></TableRow> : users.map(user => <TableRow key={user.id} className={!user.is_active ? "opacity-60" : ""}><TableCell><div className="flex flex-col gap-0.5"><span className="font-medium">{user.full_name || "—"}</span><span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{user.email || "—"}</span>{user.phone && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{user.phone}</span>}{!user.auth_user_id && <Badge variant="outline" className="mt-1 w-fit text-xs"><AlertTriangle className="me-1 h-3 w-3" />{a.users.pendingAuth}</Badge>}</div></TableCell><TableCell><div className="flex items-center gap-2">{user.is_system_role ? <ShieldCheck className="h-4 w-4" /> : <Shield className="h-4 w-4" />}<span className="text-sm">{locale === "ar" ? user.role_name_ar || user.role_name || user.role : user.role_name || user.role_name_ar || user.role}</span></div></TableCell><TableCell><Badge variant={user.is_active ? "default" : "secondary"}>{user.is_active ? a.users.active : a.users.inactive}</Badge></TableCell><TableCell className="text-sm text-muted-foreground">{user.created_at ? new Date(user.created_at).toLocaleDateString(dateLocale, { numberingSystem: "latn" }) : "—"}</TableCell><TableCell><div className="flex items-center gap-2">{canUpdate && <Button variant="ghost" size="sm" aria-label={a.users.editTitle} onClick={() => { setEditingUser(user); setActionError(null); setEditOpen(true); }}><Pencil className="h-4 w-4" /></Button>}{canUpdate && user.auth_user_id === null && <Button variant="outline" size="sm" disabled={activatingUserId === user.id} onClick={() => void handleActivate(user.id)} title={locale === "ar" ? "تفعيل حساب الدخول وإرسال رابط التفعيل" : "Activate login account and send activation link"}><KeyRound className="me-2 h-4 w-4" />{locale === "ar" ? "تفعيل الحساب" : "Activate account"}</Button>}{canDelete && <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{user.is_active ? a.users.active : a.users.inactive}</span><Switch checked={user.is_active} onCheckedChange={async checked => { setActionError(null); const result = await toggleClinicUserActive(user.id, checked); if (!result.success) setActionError(a.users.actionFailed); else void refetch(); }} /></div>}</div></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} roles={roles as RoleOption[]} onError={setActionError} onSuccess={() => { setCreateOpen(false); void refetch(); }} />
    {editingUser && <EditUserDialog open={editOpen} onOpenChange={setEditOpen} user={editingUser} roles={roles as RoleOption[]} onError={setActionError} onSuccess={() => { setEditOpen(false); setEditingUser(null); void refetch(); }} />}
  </div>;
}

function CreateUserDialog({ open, onOpenChange, roles, onError, onSuccess }: DialogProps) {
  const { locale, admin: a } = useI18n(); const [fullName, setFullName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState(""); const [roleId, setRoleId] = useState(""); const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(e: React.FormEvent) { e.preventDefault(); onError(null); setSubmitting(true); const result = await createClinicUser({ full_name: fullName, email, phone: phone || undefined, role_id: roleId }); setSubmitting(false); if (!result.success) onError(a.users.actionFailed); else { setFullName(""); setEmail(""); setPhone(""); setRoleId(""); onSuccess(); } }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />{a.users.newUser}</DialogTitle><DialogDescription>{locale === "ar" ? "أنشئ مستخدم العيادة أولاً، ثم فعّل حساب الدخول من قائمة المستخدمين. سيضع الموظف كلمة المرور بنفسه عبر رابط التفعيل." : "Create the clinic user first, then activate the login account from the user list. The employee sets their own password through the activation link."}</DialogDescription></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div className="space-y-2"><Label htmlFor="fullName">{a.users.fullName}</Label><Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="email">{a.users.email}</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="phone">{a.users.phone}</Label><Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="role">{a.users.role}</Label><Select value={roleId} onValueChange={setRoleId}><SelectTrigger id="role"><SelectValue placeholder={a.users.chooseRole} /></SelectTrigger><SelectContent>{roles.filter(r => r.role_key !== "super_admin").map(r => <SelectItem key={r.id} value={r.id}>{locale === "ar" ? r.role_name_ar || r.role_name : r.role_name || r.role_name_ar}</SelectItem>)}</SelectContent></Select></div><DialogFooter className="gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{a.users.cancel}</Button><Button type="submit" disabled={submitting || !roleId}>{submitting ? a.users.creating : a.users.create}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function EditUserDialog({ open, onOpenChange, user, roles, onError, onSuccess }: DialogProps & { user: ClinicUserWithRole }) {
  const { locale, admin: a } = useI18n(); const [fullName, setFullName] = useState(user.full_name || ""); const [email, setEmail] = useState(user.email || ""); const [phone, setPhone] = useState(user.phone || ""); const [roleId, setRoleId] = useState(user.role_id); const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(e: React.FormEvent) { e.preventDefault(); onError(null); setSubmitting(true); const result = await updateClinicUser({ id: user.id, full_name: fullName, email, phone: phone || undefined, role_id: roleId }); setSubmitting(false); if (!result.success) onError(a.users.actionFailed); else onSuccess(); }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{a.users.editTitle}</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div className="space-y-2"><Label htmlFor="edit-fullName">{a.users.fullName}</Label><Input id="edit-fullName" value={fullName} onChange={e => setFullName(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="edit-email">{a.users.email}</Label><Input id="edit-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="edit-phone">{a.users.phone}</Label><Input id="edit-phone" value={phone} onChange={e => setPhone(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="edit-role">{a.users.role}</Label><Select value={roleId} onValueChange={setRoleId}><SelectTrigger id="edit-role"><SelectValue placeholder={a.users.chooseRole} /></SelectTrigger><SelectContent>{roles.filter(r => r.role_key !== "super_admin").map(r => <SelectItem key={r.id} value={r.id}>{locale === "ar" ? r.role_name_ar || r.role_name : r.role_name || r.role_name_ar}</SelectItem>)}</SelectContent></Select></div><DialogFooter className="gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{a.users.cancel}</Button><Button type="submit" disabled={submitting || !roleId}>{submitting ? a.users.saving : a.users.save}</Button></DialogFooter></form></DialogContent></Dialog>;
}
