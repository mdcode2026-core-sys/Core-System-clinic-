"use client";

import { useState } from "react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useAuth } from "@/core/auth/AuthContext";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useRoles, useRoleWithPermissions } from "@/domain/roles/roles.queries";
import { RoleCard } from "./RoleCard";
import { RolePermissionsEditor } from "./RolePermissionsEditor";
import { CreateRoleDialog } from "./CreateRoleDialog";
import { EditRoleDialog } from "./EditRoleDialog";
import type { Role } from "@/domain/roles/roles.types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Shield, Plus, Loader2, Info } from "lucide-react";

export function RolesManager() {
  const { tenantId } = useAuth();
  const { hasPermission, isLoading: permsLoading } = usePermissions();
  const { messages, locale } = useI18n();
  const canReadRoles = hasPermission("roles:read");
  const canManageRoles = hasPermission("roles:manage");
  const { data: roles, isLoading: rolesLoading, error: rolesError, refetch: refetchRoles } = useRoles(tenantId);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRoleMeta, setEditingRoleMeta] = useState<Role | null>(null);
  const [isEditMetaOpen, setIsEditMetaOpen] = useState(false);

  const handleEditPermissions = (roleId: string) => { setEditingRoleId(roleId); setIsEditorOpen(true); };
  const handleEditMetadata = (role: Role) => { setEditingRoleMeta(role); setIsEditMetaOpen(true); };
  const handleDeleteRole = (role: Role) => { setEditingRoleMeta(role); setIsEditMetaOpen(true); };
  const handleCloseEditor = () => { setIsEditorOpen(false); setEditingRoleId(null); };
  const handleCreateSuccess = () => { setIsCreateOpen(false); refetchRoles(); };
  const handleEditSuccess = () => { setIsEditMetaOpen(false); setEditingRoleMeta(null); refetchRoles(); };
  const direction = locale === "ar" ? "rtl" : "ltr";

  if (permsLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="mr-3 text-muted-foreground">{messages.common.loading}</span></div>;
  }

  if (!canReadRoles) {
    return <div className="text-center py-12" dir={direction}><Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><h3 className="text-lg font-semibold mb-2">{messages.roles.accessDeniedTitle}</h3><p className="text-muted-foreground">{messages.roles.accessDeniedMessage}</p></div>;
  }

  if (rolesLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="mr-3 text-muted-foreground">{messages.common.loading}</span></div>;
  }

  if (rolesError) {
    return <div className="text-center py-12" dir={direction}><Info className="h-12 w-12 mx-auto mb-4 text-destructive" /><h3 className="text-lg font-semibold mb-2">{messages.common.error}</h3><p className="text-muted-foreground">{messages.common.unexpectedError}</p></div>;
  }

  const systemRoles = roles?.filter((r) => r.is_system_role) ?? [];
  const customRoles = roles?.filter((r) => !r.is_system_role) ?? [];

  return (
    <div className="space-y-6" dir={direction}>
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-semibold">{messages.roles.title}</h2><p className="text-sm text-muted-foreground">{messages.roles.description}</p></div>
        {canManageRoles && <Button onClick={() => setIsCreateOpen(true)} className="gap-2"><Plus className="h-4 w-4" />{messages.roles.newRole}</Button>}
      </div>
      <Card className="bg-muted/50 border-border"><CardContent className="py-4"><div className="flex items-start gap-3"><Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" /><div className="space-y-1"><p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{messages.roles.systemRoles}</span> — {messages.roles.systemRolesInfo}</p><p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{messages.roles.customRoles}</span> — {messages.roles.customRolesInfo}</p></div></div></CardContent></Card>
      <Separator />
      <div className="space-y-3"><div className="flex items-center gap-2"><h3 className="text-lg font-medium">{messages.roles.systemRoles}</h3><Badge variant="default" className="text-xs">{systemRoles.length}</Badge></div><div className="grid gap-4 md:grid-cols-2">{systemRoles.map((role) => <RoleCardWrapper key={role.id} role={role} canManage={canManageRoles} onEditPermissions={handleEditPermissions} />)}</div></div>
      <Separator />
      <div className="space-y-3"><div className="flex items-center gap-2"><h3 className="text-lg font-medium">{messages.roles.customRoles}</h3><Badge variant="secondary" className="text-xs">{customRoles.length}</Badge></div>{customRoles.length > 0 ? <div className="grid gap-4 md:grid-cols-2">{customRoles.map((role) => <RoleCardWrapper key={role.id} role={role} canManage={canManageRoles} onEditPermissions={handleEditPermissions} onEditMetadata={handleEditMetadata} onDelete={handleDeleteRole} />)}</div> : <Card className="border-dashed border-border"><CardContent className="py-8 text-center"><p className="text-muted-foreground text-sm">{messages.roles.noCustomRoles}<br />{messages.roles.createFirstCustomRole}</p></CardContent></Card>}</div>
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={direction}><DialogHeader><DialogTitle>{messages.roles.editPermissions}</DialogTitle></DialogHeader>{editingRoleId && <RolePermissionsEditor roleId={editingRoleId} onClose={handleCloseEditor} />}</DialogContent></Dialog>
      <CreateRoleDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={handleCreateSuccess} />
      <EditRoleDialog role={editingRoleMeta} open={isEditMetaOpen} onClose={() => { setIsEditMetaOpen(false); setEditingRoleMeta(null); }} onSuccess={handleEditSuccess} />
    </div>
  );
}

function RoleCardWrapper({ role, canManage, onEditPermissions, onEditMetadata, onDelete }: { role: Role; canManage: boolean; onEditPermissions: (roleId: string) => void; onEditMetadata?: (role: Role) => void; onDelete?: (role: Role) => void; }) {
  const { data: roleWithPerms } = useRoleWithPermissions(role.id);
  return <RoleCard role={role} permissions={roleWithPerms?.permissions ?? []} onEditPermissions={canManage ? onEditPermissions : undefined} onEditMetadata={canManage ? onEditMetadata : undefined} onDelete={canManage ? onDelete : undefined} canManage={canManage} />;
}
