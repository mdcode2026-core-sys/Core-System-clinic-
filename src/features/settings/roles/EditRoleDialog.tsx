"use client";

import { useState } from "react";
import { updateRole, deleteRole } from "@/domain/roles/roles.actions";
import { useRoleWithPermissions } from "@/domain/roles/roles.queries";
import type { Role } from "@/domain/roles/roles.types";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";

import { Save, Trash2, Loader2, AlertTriangle } from "lucide-react";

interface EditRoleDialogProps {
  role: Role | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditRoleDialog({ role, open, onClose, onSuccess }: EditRoleDialogProps) {
  const { data: roleWithPerms } = useRoleWithPermissions(role?.id ?? null);

  const [roleName, setRoleName] = useState("");
  const [roleNameAr, setRoleNameAr] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Sync form state to the current role — render-phase adjustment guarded
  // by an identity check instead of setState-in-effect, matching the
  // pattern established in RolePermissionsEditor.tsx.
  const [loadedRoleId, setLoadedRoleId] = useState<string | undefined>(undefined);
  if (role && role.id !== loadedRoleId) {
    setLoadedRoleId(role.id);
    setRoleName(role.role_name);
    setRoleNameAr(role.role_name_ar ?? "");
    setDescription(role.description ?? "");
    setSaveError(null);
    setDeleteError(null);
    setShowDeleteConfirm(false);
  }

  const handleSave = async () => {
    if (!role) return;
    setIsSaving(true);
    setSaveError(null);

    const result = await updateRole({
      roleId: role.id,
      role_name: roleName,
      role_name_ar: roleNameAr,
      description: description,
    });

    setIsSaving(false);
    if (result.success) {
      onSuccess();
    } else {
      setSaveError(result.error || "فشل تحديث الدور");
    }
  };

  const handleDelete = async () => {
    if (!role) return;
    setIsDeleting(true);
    setDeleteError(null);

    const result = await deleteRole(role.id);

    setIsDeleting(false);
    if (result.success) {
      setShowDeleteConfirm(false);
      onSuccess();
    } else {
      setDeleteError(result.error || "فشل حذف الدور");
    }
  };

  const hasChanges =
    role &&
    (roleName.trim() !== role.role_name ||
      roleNameAr.trim() !== (role.role_name_ar ?? "") ||
      description.trim() !== (role.description ?? ""));

  const canSave = hasChanges && !isSaving && roleName.trim().length >= 2;

  return (
    <>
      {/* Main Edit Dialog */}
      <Dialog open={open && !showDeleteConfirm} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الدور</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-role-name">اسم الدور</Label>
                <Input
                  id="edit-role-name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-role-name-ar">الاسم بالعربية</Label>
                <Input
                  id="edit-role-name-ar"
                  value={roleNameAr}
                  onChange={(e) => setRoleNameAr(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-role-desc">الوصف</Label>
              <Input
                id="edit-role-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
              />
            </div>

            {roleWithPerms && (
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">
                  عدد الصلاحيات المُخصصة:{" "}
                  <span className="font-medium text-foreground">
                    {roleWithPerms.permissions.length}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  لتعديل الصلاحيات، استخدم زر &quot;تعديل الصلاحيات&quot; في بطاقة الدور.
                </p>
              </div>
            )}

            {saveError && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-800">{saveError}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSaving || isDeleting}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                حذف الدور
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={isSaving}>
                  إلغاء
                </Button>
                <Button onClick={handleSave} disabled={!canSave} className="gap-2">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  حفظ
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog (using standard Dialog) */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد حذف الدور</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الدور &quot;{role?.role_name_ar || role?.role_name}&quot;؟
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-800">{deleteError}</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
              className="gap-2"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              نعم، احذف الدور
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
