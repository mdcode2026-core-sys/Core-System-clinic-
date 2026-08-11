"use client";

import { Shield, ShieldCheck, Pencil, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { Role, PermissionRow } from "@/domain/roles/roles.types";
import { PERMISSION_GROUPS, ACTION_LABELS } from "@/domain/roles/roles.types";

interface RoleCardProps {
  role: Role;
  permissions: PermissionRow[];
  onEdit?: (roleId: string) => void;
  canManage: boolean;
}

export function RoleCard({ role, permissions, onEdit, canManage }: RoleCardProps) {
  const isSystem = role.is_system_role;

  // Group permissions by resource for display
  const grouped = permissions.reduce<Record<string, PermissionRow[]>>((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${isSystem ? "bg-blue-50" : "bg-amber-50"}`}>
              {isSystem ? (
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              ) : (
                <Shield className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {role.role_name_ar || role.role_name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{role.role_key}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isSystem ? "default" : "secondary"} className="text-xs">
              {isSystem ? "نظام" : "مخصص"}
            </Badge>
            {canManage && !isSystem && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(role.id)}
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {role.description && (
          <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Users className="h-4 w-4" />
          <span>{permissions.length} صلاحية</span>
        </div>

        {permissions.length > 0 ? (
          <div className="space-y-3">
            {Object.entries(grouped).map(([resource, perms]) => {
              const groupInfo = PERMISSION_GROUPS[resource];
              return (
                <div key={resource} className="border rounded-md p-2.5 bg-muted/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">
                      {groupInfo?.labelAr || resource}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {perms.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {perms.map((perm) => (
                      <Badge
                        key={perm.id}
                        variant="outline"
                        className="text-xs font-normal"
                      >
                        {ACTION_LABELS[perm.action] || perm.action}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            لا توجد صلاحيات مخصصة لهذا الدور
          </p>
        )}
      </CardContent>
    </Card>
  );
}
