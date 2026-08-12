"use client";

import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useClinicUsers } from "@/domain/users/users.queries";
import { useRoles } from "@/domain/roles/roles.queries";
import { createClinicUser, updateClinicUser, toggleClinicUserActive } from "@/domain/users/users.actions";
import type { ClinicUserWithRole, CreateUserInput, UpdateUserInput } from "@/domain/users/users.types";
import type { UserRole } from "@/core/permissions/types";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Switch } from "@/shared/components/ui/switch";

import {
  Users,
  Plus,
  Pencil,
  Mail,
  Phone,
  ShieldCheck,
  Shield,
  AlertTriangle,
  UserPlus,
} from "lucide-react";

export function UsersManager() {
  const { tenantId } = useTenantId();
  const { hasPermission } = usePermissions();
  const { data: users = [], isLoading, error, refetch } = useClinicUsers(tenantId);
  const { data: roles = [] } = useRoles(tenantId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ClinicUserWithRole | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const canCreate = hasPermission("users:create");
  const canUpdate = hasPermission("users:update");
  const canDelete = hasPermission("users:delete");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="mr-3 text-muted-foreground">جاري التحميل...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-destructive mb-2" />
        <p className="text-destructive font-medium">فشل تحميل المستخدمين</p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">إدارة المستخدمين</h2>
            <p className="text-sm text-muted-foreground">
              {users.length} مستخدم{users.length !== 1 ? "ين" : ""}
            </p>
          </div>
        </div>
        {canCreate && (
          <Button onClick={() => { setActionError(null); setCreateOpen(true); }}>
            <Plus className="h-4 w-4 ml-2" />
            مستخدم جديد
          </Button>
        )}
      </div>

      {actionError && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {actionError}
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    لا يوجد مستخدمون مسجلون
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className={!user.is_active ? "opacity-60" : ""}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{user.full_name || "—"}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email || "—"}
                        </span>
                        {user.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </span>
                        )}
                        {!user.auth_user_id && (
                          <Badge variant="outline" className="text-xs w-fit mt-1 text-amber-600 border-amber-200 bg-amber-50">
                            <AlertTriangle className="h-3 w-3 ml-1" />
                            بانتظار إنشاء الحساب
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.is_system_role ? (
                          <ShieldCheck className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Shield className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="text-sm">
                          {user.role_name_ar || user.role_name || user.role}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"} className="text-xs">
                        {user.is_active ? "نشط" : "معطل"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString("ar-SA")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center justify-end gap-2">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setActionError(null);
                              setEditOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{user.is_active ? "نشط" : "معطل"}</span>
                            <Switch
                              checked={user.is_active}
                              onCheckedChange={async (checked) => {
                                setActionError(null);
                                const result = await toggleClinicUserActive(user.id, checked);
                                if (!result.success) {
                                  setActionError(result.error);
                                } else {
                                  refetch();
                                }
                              }}
                              disabled={user.role === "clinic_owner"}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        roles={roles}
        onError={setActionError}
        onSuccess={() => { setCreateOpen(false); refetch(); }}
      />

      {/* Edit Dialog */}
      {editingUser && (
        <EditUserDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          user={editingUser}
          roles={roles}
          onError={setActionError}
          onSuccess={() => { setEditOpen(false); setEditingUser(null); refetch(); }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

function CreateUserDialog({
  open,
  onOpenChange,
  roles,
  onError,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  roles: { id: string; role_key: string; role_name: string; role_name_ar: string | null; is_system_role: boolean }[];
  onError: (msg: string | null) => void;
  onSuccess: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("receptionist");
  const [roleTemplateId, setRoleTemplateId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const systemRoles = roles.filter((r) => r.is_system_role);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    setSubmitting(true);

    const selectedRole = systemRoles.find((r) => r.role_key === role);
    const templateId = selectedRole ? selectedRole.id : roleTemplateId;

    const result = await createClinicUser({
      full_name: fullName,
      email,
      phone: phone || undefined,
      role,
      role_template_id: templateId,
    });

    setSubmitting(false);

    if (!result.success) {
      onError(result.error);
    } else {
      setFullName("");
      setEmail("");
      setPhone("");
      setRole("receptionist");
      setRoleTemplateId(null);
      onSuccess();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            مستخدم جديد
          </DialogTitle>
          <DialogDescription>
            إنشاء مستخدم جديد للعيادة. سيتم إنشاء حساب المصادقة لاحقاً.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="محمد أحمد"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@clinic.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">الدور</Label>
            <Select
              value={role}
              onValueChange={(v) => {
                setRole(v as UserRole);
                const matched = systemRoles.find((r) => r.role_key === v);
                setRoleTemplateId(matched ? matched.id : null);
              }}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                {systemRoles.map((r) => (
                  <SelectItem key={r.id} value={r.role_key}>
                    {r.role_name_ar || r.role_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "جاري الإنشاء..." : "إنشاء المستخدم"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

function EditUserDialog({
  open,
  onOpenChange,
  user,
  roles,
  onError,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: ClinicUserWithRole;
  roles: { id: string; role_key: string; role_name: string; role_name_ar: string | null; is_system_role: boolean }[];
  onError: (msg: string | null) => void;
  onSuccess: () => void;
}) {
  const [fullName, setFullName] = useState(user.full_name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [role, setRole] = useState<UserRole>(user.role);
  const [roleTemplateId, setRoleTemplateId] = useState<string | null>(user.role_template_id);
  const [submitting, setSubmitting] = useState(false);

  const systemRoles = roles.filter((r) => r.is_system_role);
  const isClinicOwner = user.role === "clinic_owner";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    setSubmitting(true);

    const selectedRole = systemRoles.find((r) => r.role_key === role);
    const templateId = selectedRole ? selectedRole.id : roleTemplateId;

    const result = await updateClinicUser({
      id: user.id,
      full_name: fullName,
      email,
      phone: phone || undefined,
      role,
      role_template_id: templateId,
    });

    setSubmitting(false);

    if (!result.success) {
      onError(result.error);
    } else {
      onSuccess();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            تعديل المستخدم
          </DialogTitle>
          <DialogDescription>
            تعديل بيانات المستخدم {user.full_name || user.email || ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-fullName">الاسم الكامل</Label>
            <Input
              id="edit-fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">البريد الإلكتروني</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">رقم الهاتف</Label>
            <Input
              id="edit-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-role">الدور</Label>
            <Select
              value={role}
              onValueChange={(v) => {
                setRole(v as UserRole);
                const matched = systemRoles.find((r) => r.role_key === v);
                setRoleTemplateId(matched ? matched.id : null);
              }}
              disabled={isClinicOwner}
            >
              <SelectTrigger id="edit-role">
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                {systemRoles.map((r) => (
                  <SelectItem key={r.id} value={r.role_key}>
                    {r.role_name_ar || r.role_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isClinicOwner && (
              <p className="text-xs text-muted-foreground">
                لا يمكن تغيير دور مالك العيادة
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
