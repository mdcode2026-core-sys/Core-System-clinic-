"use client";

import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useClinicUsersWithOverrides } from "@/domain/overrides/overrides.queries";
import { usePermissionsCatalog } from "@/domain/roles/roles.queries";
import { UserPermissionEditor } from "./UserPermissionEditor";
import type { UserWithOverrides } from "@/domain/overrides/overrides.types";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import {
  UserCog,
  Shield,
  ShieldCheck,
  Pencil,
  Loader2,
  AlertTriangle,
  Users,
  Plus,
  Minus,
} from "lucide-react";

export function OverridesManager() {
  const { tenantId } = useTenantId();
  const { hasPermission, isLoading: permsLoading } = usePermissions();
  const { data: users = [], isLoading: usersLoading, error: usersError } = useClinicUsersWithOverrides(tenantId);
  const { data: catalog = [] } = usePermissionsCatalog();

  const canManageOverrides = hasPermission("overrides:manage");

  const [editingUser, setEditingUser] = useState<UserWithOverrides | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleEdit = (user: UserWithOverrides) => {
    setEditingUser(user);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingUser(null);
  };

  if (permsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="mr-3 text-muted-foreground">جاري التحقق من الصلاحيات...</span>
      </div>
    );
  }

  if (!canManageOverrides) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">غير مصرح</h3>
        <p className="text-muted-foreground">
          ليس لديك صلاحية إدارة تجاوزات الصلاحيات.
        </p>
      </div>
    );
  }

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="mr-3 text-muted-foreground">جاري تحميل المستخدمين...</span>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <h3 className="text-lg font-semibold mb-2">خطأ في التحميل</h3>
        <p className="text-muted-foreground">{usersError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <UserCog className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">تجاوزات الصلاحيات</h2>
            <p className="text-sm text-muted-foreground">
              منح أو سحب صلاحيات فردية للمستخدمين بخلاف قالب دورهم
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50 border-border">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">التجاوزات</span> — تتيح لك منح صلاحية إضافية 
                لمستخدم معين (<Plus className="inline h-3 w-3 text-green-600" />) أو سحب صلاحية منه (<Minus className="inline h-3 w-3 text-red-600" />) 
                بخلاف ما يمنحه قالب دوره الافتراضي.
              </p>
              <p className="text-sm text-muted-foreground">
                يتم تطبيق التجاوزات فوراً على صلاحيات المستخدم الفعلية.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التجاوزات</TableHead>
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
                users.map((user) => {
                  const grantCount = user.overrides.filter((o) => o.granted).length;
                  const revokeCount = user.overrides.filter((o) => !o.granted).length;

                  return (
                    <TableRow key={user.id} className={!user.is_active ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{user.full_name || "—"}</span>
                          <span className="text-xs text-muted-foreground">{user.email || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{user.role_name_ar || user.role_name || user.role}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "secondary"} className="text-xs">
                          {user.is_active ? "نشط" : "معطل"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {grantCount > 0 && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                              <Plus className="h-3 w-3 ml-1" />
                              {grantCount} منح
                            </Badge>
                          )}
                          {revokeCount > 0 && (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50">
                              <Minus className="h-3 w-3 ml-1" />
                              {revokeCount} سحب
                            </Badge>
                          )}
                          {grantCount === 0 && revokeCount === 0 && (
                            <span className="text-xs text-muted-foreground">لا توجد تجاوزات</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="gap-1"
                        >
                          <Pencil className="h-4 w-4" />
                          تعديل
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل تجاوزات الصلاحيات</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <UserPermissionEditor
              user={editingUser}
              catalog={catalog}
              onClose={handleCloseEditor}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
