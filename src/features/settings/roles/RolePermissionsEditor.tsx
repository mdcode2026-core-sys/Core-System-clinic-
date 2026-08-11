"use client";

import { useState, useCallback } from "react";
import { useRoleWithPermissions, usePermissionsCatalog } from "@/domain/roles/roles.queries";
import { updateRolePermissions } from "@/domain/roles/roles.actions";
import { PERMISSION_GROUPS, ACTION_LABELS } from "@/domain/roles/roles.types";
import type { PermissionRow } from "@/domain/roles/roles.types";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Save, X, Loader2, AlertTriangle } from "lucide-react";

interface RolePermissionsEditorProps {
  roleId: string;
  onClose: () => void;
}

export function RolePermissionsEditor({ roleId, onClose }: RolePermissionsEditorProps) {
  const { data: roleData, isLoading: roleLoading } = useRoleWithPermissions(roleId);
  const { data: catalog, isLoading: catalogLoading } = usePermissionsCatalog();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize selected IDs when role data loads
  const rolePermissionsLoaded = roleData?.permissions.map((p) => p.id) ?? [];
  const initialSet = new Set(rolePermissionsLoaded);

  // Only set initial selection once
  const handleInit = useCallback(() => {
    if (selectedIds.size === 0 && rolePermissionsLoaded.length > 0) {
      setSelectedIds(new Set(rolePermissionsLoaded));
    }
  }, [rolePermissionsLoaded.length, selectedIds.size]);

  // Call init via effect-like pattern
  if (roleData && selectedIds.size === 0 && rolePermissionsLoaded.length > 0) {
    setSelectedIds(new Set(rolePermissionsLoaded));
  }

  const togglePermission = (permissionId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const result = await updateRolePermissions(roleId, Array.from(selectedIds));

    setIsSaving(false);
    if (result.success) {
      setSaveSuccess(true);
    } else {
      setSaveError(result.error || "Failed to save");
    }
  };

  const isLoading = roleLoading || catalogLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="mr-3 text-muted-foreground">جاري التحميل...</span>
      </div>
    );
  }

  if (!roleData || !catalog) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
        <p>تعذر تحميل بيانات الدور أو قائمة الصلاحيات</p>
      </div>
    );
  }

  // Group catalog permissions by resource
  const groupedCatalog = catalog.reduce<Record<string, PermissionRow[]>>((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  const hasChanges =
    selectedIds.size !== initialSet.size ||
    !Array.from(selectedIds).every((id) => initialSet.has(id)) ||
    !Array.from(initialSet).every((id) => selectedIds.has(id));

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            تعديل صلاحيات: {roleData.role_name_ar || roleData.role_name}
          </h3>
          <p className="text-sm text-muted-foreground">
            اختر الصلاحيات التي تريد تخصيصها لهذا الدور
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4 ml-1" />
          إغلاق
        </Button>
      </div>

      {roleData.is_system_role && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            هذا دور نظامي. لا يمكن تعديل صلاحيات الأدوار النظامية. يمكنك فقط عرض التكوين الحالي.
          </p>
        </div>
      )}

      <Separator />

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {Object.entries(groupedCatalog).map(([resource, perms]) => {
          const groupInfo = PERMISSION_GROUPS[resource];
          const selectedCount = perms.filter((p) => selectedIds.has(p.id)).length;

          return (
            <Card key={resource} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {groupInfo?.labelAr || resource}
                  </CardTitle>
                  <Badge variant={selectedCount > 0 ? "default" : "outline"} className="text-xs">
                    {selectedCount} / {perms.length}
                  </Badge>
                </div>
                {groupInfo?.description && (
                  <p className="text-xs text-muted-foreground">{groupInfo.description}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2">
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      className={`flex items-center gap-2 rounded-md border p-2.5 cursor-pointer transition-colors ${
                        selectedIds.has(perm.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      } ${roleData.is_system_role ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <Checkbox
                        checked={selectedIds.has(perm.id)}
                        onCheckedChange={() => !roleData.is_system_role && togglePermission(perm.id)}
                        disabled={roleData.is_system_role}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block">
                          {ACTION_LABELS[perm.action] || perm.action}
                        </span>
                        <span className="text-xs text-muted-foreground truncate block">
                          {perm.permission_name}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          {saveError && (
            <p className="text-sm text-destructive">{saveError}</p>
          )}
          {saveSuccess && (
            <p className="text-sm text-green-600">تم الحفظ بنجاح</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          {!roleData.is_system_role && (
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              حفظ التغييرات
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
