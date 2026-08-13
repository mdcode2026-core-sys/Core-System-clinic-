"use client";

import { useState, useCallback } from "react";
import { useUserPermissionOverrides } from "@/domain/overrides/overrides.queries";
import { setPermissionOverride, removePermissionOverride } from "@/domain/overrides/overrides.actions";
import { useTenantId } from "@/core/auth/useTenantId";
import { PERMISSION_GROUPS, ACTION_LABELS } from "@/domain/roles/roles.types";
import type { UserWithOverrides, PermissionOverride } from "@/domain/overrides/overrides.types";
import type { PermissionRow } from "@/domain/roles/roles.types";

import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";

import { Save, X, Loader2, AlertTriangle, Plus, Minus, RotateCcw } from "lucide-react";

interface UserPermissionEditorProps {
  user: UserWithOverrides;
  catalog: PermissionRow[];
  onClose: () => void;
}

export function UserPermissionEditor({ user, catalog, onClose }: UserPermissionEditorProps) {
  const { tenantId } = useTenantId();
  const { data: existingOverrides = [], isLoading: overridesLoading, refetch } = useUserPermissionOverrides(
    user.id,
    tenantId
  );

  // Local state for pending changes
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean | null>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Build a lookup of existing overrides by permission_id
  const existingByPermId = new Map<string, PermissionOverride>();
  for (const ov of existingOverrides) {
    existingByPermId.set(ov.permission_id, ov);
  }

  // Determine effective state for each permission
  const getEffectiveState = useCallback(
    (permissionId: string): "default" | "granted" | "revoked" => {
      const pending = pendingChanges.get(permissionId);
      if (pending === true) return "granted";
      if (pending === false) return "revoked";
      if (pending === null) return "default"; // removed override

      const existing = existingByPermId.get(permissionId);
      if (existing) {
        return existing.granted ? "granted" : "revoked";
      }
      return "default";
    },
    [pendingChanges, existingByPermId]
  );

  const togglePermission = (permissionId: string) => {
    setSaveSuccess(false);
    setSaveError(null);

    setPendingChanges((prev) => {
      const next = new Map(prev);
      const current = getEffectiveState(permissionId);

      if (current === "default") {
        // No override exists -> create grant
        next.set(permissionId, true);
      } else if (current === "granted") {
        // Currently granted -> switch to revoke
        next.set(permissionId, false);
      } else {
        // Currently revoked -> remove override (back to default)
        next.set(permissionId, null);
      }
      return next;
    });
  };

  const hasChanges = pendingChanges.size > 0;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      for (const [permissionId, state] of pendingChanges.entries()) {
        if (state === null) {
          // Remove override
          const result = await removePermissionOverride({
            userId: user.id,
            permissionId,
          });
          if (!result.success) {
            throw new Error(result.error || "Failed to remove override");
          }
        } else {
          // Set override (grant or revoke)
          const result = await setPermissionOverride({
            userId: user.id,
            permissionId,
            granted: state,
          });
          if (!result.success) {
            throw new Error(result.error || "Failed to set override");
          }
        }
      }

      setSaveSuccess(true);
      setPendingChanges(new Map());
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Group catalog permissions by resource
  const groupedCatalog = catalog.reduce<Record<string, PermissionRow[]>>((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  if (overridesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="mr-3 text-muted-foreground">جاري تحميل التجاوزات الحالية...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* User Info Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {user.full_name || user.email || "مستخدم"}
          </h3>
          <p className="text-sm text-muted-foreground">
            الدور: {user.role_name_ar || user.role_name || user.role}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4 ml-1" />
          إغلاق
        </Button>
      </div>

      <Separator />

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded border border-border bg-background" />
          <span className="text-muted-foreground">افتراضي (من الدور)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded border border-green-300 bg-green-50" />
          <span className="text-green-700">منح إضافي</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded border border-red-300 bg-red-50" />
          <span className="text-red-700">سحب صلاحية</span>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
        {Object.entries(groupedCatalog).map(([resource, perms]) => {
          const groupInfo = PERMISSION_GROUPS[resource];
          const grantedCount = perms.filter((p) => getEffectiveState(p.id) === "granted").length;
          const revokedCount = perms.filter((p) => getEffectiveState(p.id) === "revoked").length;

          return (
            <Card key={resource} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {groupInfo?.labelAr || resource}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {grantedCount > 0 && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                        <Plus className="h-3 w-3 ml-1" />
                        {grantedCount}
                      </Badge>
                    )}
                    {revokedCount > 0 && (
                      <Badge variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50">
                        <Minus className="h-3 w-3 ml-1" />
                        {revokedCount}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {perms.length}
                    </Badge>
                  </div>
                </div>
                {groupInfo?.description && (
                  <p className="text-xs text-muted-foreground">{groupInfo.description}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2">
                  {perms.map((perm) => {
                    const state = getEffectiveState(perm.id);
                    const isGranted = state === "granted";
                    const isRevoked = state === "revoked";

                    return (
                      <button
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`flex items-center gap-2 rounded-md border p-2.5 text-right transition-colors cursor-pointer ${
                          isGranted
                            ? "border-green-300 bg-green-50 hover:bg-green-100"
                            : isRevoked
                            ? "border-red-300 bg-red-50 hover:bg-red-100"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-sm border flex items-center justify-center shrink-0 ${
                          isGranted
                            ? "bg-green-500 border-green-500 text-white"
                            : isRevoked
                            ? "bg-red-500 border-red-500 text-white"
                            : "border-muted-foreground"
                        }`}>
                          {isGranted && <Plus className="h-3 w-3" />}
                          {isRevoked && <Minus className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium block">
                            {ACTION_LABELS[perm.action] || perm.action}
                          </span>
                          <span className="text-xs text-muted-foreground truncate block">
                            {perm.permission_name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      {/* Footer */}
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
        </div>
      </div>
    </div>
  );
}
