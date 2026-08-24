"use client";

import { useState } from "react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { updateRole, deleteRole } from "@/domain/roles/roles.actions";
import { useRoleWithPermissions } from "@/domain/roles/roles.queries";
import type { Role } from "@/domain/roles/roles.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Save, Trash2, Loader2, AlertTriangle } from "lucide-react";

interface EditRoleDialogProps {
  role: Role | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditRoleDialog({ role, open, onClose, onSuccess }: EditRoleDialogProps) {
  const { data: roleWithPerms } = useRoleWithPermissions(role?.id ?? null);
  const { locale, messages } = useI18n();

  const [roleName, setRoleName] = useState("");
  const [roleNameAr, setRoleNameAr] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    const result = await updateRole({ roleId: role.id, role_name: roleName, role_name_ar: roleNameAr, description });
    setIsSaving(false);
    if (result.success) onSuccess();
    else setSaveError(result.error || messages.common.unexpectedError);
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
      setDeleteError(result.error || messages.common.unexpectedError);
    }
  };

  const hasChanges = role && (roleName.trim() !== role.role_name || roleNameAr.trim() !== (role.role_name_ar ?? "") || description.trim() !== (role.description ?? ""));
  const canSave = hasChanges && !isSaving && roleName.trim().length >= 2;
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <>
      <Dialog open={open && !showDeleteConfirm} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-lg" dir={direction}>
          <DialogHeader>
            <DialogTitle>{messages.roles.editRole}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-role-name">{messages.roles.roleName}</Label>
                <Input id="edit-role-name" value={roleName} onChange={(e) => setRoleName(e.target.value)} disabled={isSaving} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-role-name-ar">{messages.roles.roleNameArabic}</Label>
                <Input id="edit-role-name-ar" value={roleNameAr} onChange={(e) => setRoleNameAr(e.target.value)} disabled={isSaving} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-role-desc">{messages.roles.descriptionLabel}</Label>
              <Input id="edit-role-desc" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSaving} />
            </div>
            {roleWithPerms && (
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">{messages.roles.permissionsCount}: <span className="font-medium text-foreground">{roleWithPerms.permissions.length}</span></p>
                <p className="text-xs text-muted-foreground mt-1">{messages.roles.permissionsHint}</p>
              </div>
            )}
            {saveError && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-800">{saveError}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)} disabled={isSaving || isDeleting} className="gap-1">
                <Trash2 className="h-4 w-4" />
                {messages.common.delete}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={isSaving}>{messages.common.cancel}</Button>
                <Button onClick={handleSave} disabled={!canSave} className="gap-2">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {messages.common.save}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md" dir={direction}>
          <DialogHeader>
            <DialogTitle>{messages.roles.confirmDeleteTitle}</DialogTitle>
            <DialogDescription>
              {messages.roles.confirmDeleteMessage}
              <br />
              <strong>{role?.role_name_ar || role?.role_name}</strong>
              <br />
              {messages.roles.irreversible}
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-800">{deleteError}</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>{messages.common.cancel}</Button>
            <Button onClick={handleDelete} disabled={isDeleting} variant="destructive" className="gap-2">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {messages.roles.yesDelete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
