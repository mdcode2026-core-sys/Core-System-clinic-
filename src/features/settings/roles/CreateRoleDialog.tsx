"use client";

import { useState } from "react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { createRole } from "@/domain/roles/roles.actions";
import { usePermissionsCatalog } from "@/domain/roles/roles.queries";
import type { PermissionRow } from "@/domain/roles/roles.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Save, Loader2, AlertTriangle } from "lucide-react";

interface CreateRoleDialogProps { open: boolean; onClose: () => void; onSuccess: () => void; }

export function CreateRoleDialog({ open, onClose, onSuccess }: CreateRoleDialogProps) {
  const { data: catalog, isLoading: catalogLoading } = usePermissionsCatalog();
  const { messages, terminology, locale } = useI18n();
  const [roleKey, setRoleKey] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roleNameAr, setRoleNameAr] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const togglePermission = (permissionId: string) => setSelectedIds((prev) => { const next = new Set(prev); if (next.has(permissionId)) next.delete(permissionId); else next.add(permissionId); return next; });

  const handleSave = async () => {
    setIsSaving(true); setSaveError(null);
    const result = await createRole({ role_key: roleKey, role_name: roleName, role_name_ar: roleNameAr || undefined, description: description || undefined, permissionIds: Array.from(selectedIds) });
    setIsSaving(false);
    if (result.success) { setRoleKey(""); setRoleName(""); setRoleNameAr(""); setDescription(""); setSelectedIds(new Set()); onSuccess(); }
    else setSaveError(result.error || messages.common.unexpectedError);
  };

  const canSave = roleKey.trim().length >= 2 && roleName.trim().length >= 2 && !isSaving;
  const groupedCatalog = (catalog ?? []).reduce<Record<string, PermissionRow[]>>((acc, perm) => { if (!acc[perm.resource]) acc[perm.resource] = []; acc[perm.resource].push(perm); return acc; }, {});
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={direction}>
        <DialogHeader><DialogTitle>{messages.roles.newRole}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label htmlFor="role-key">{messages.roles.roleKey}</Label><Input id="role-key" value={roleKey} onChange={(e) => setRoleKey(e.target.value)} placeholder={messages.roles.roleKeyPlaceholder} disabled={isSaving} /><p className="text-xs text-muted-foreground">{messages.roles.roleKeyHint}</p></div>
              <div className="space-y-1.5"><Label htmlFor="role-name">{messages.roles.roleName}</Label><Input id="role-name" value={roleName} onChange={(e) => setRoleName(e.target.value)} disabled={isSaving} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label htmlFor="role-name-ar">{messages.roles.roleNameArabic}</Label><Input id="role-name-ar" value={roleNameAr} onChange={(e) => setRoleNameAr(e.target.value)} disabled={isSaving} /></div>
              <div className="space-y-1.5"><Label htmlFor="role-desc">{messages.roles.descriptionLabel}</Label><Input id="role-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={messages.roles.descriptionPlaceholder} disabled={isSaving} /></div>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-2">{messages.roles.permissions}</h4>
            {catalogLoading ? <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span className="mr-2 text-sm text-muted-foreground">{messages.common.loading}</span></div> : <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {Object.entries(groupedCatalog).map(([resource, perms]) => {
                const resourceInfo = terminology.permissions.resources[resource];
                const selectedCount = perms.filter((p) => selectedIds.has(p.id)).length;
                return <Card key={resource} className="border-border"><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-semibold">{resourceInfo?.label || resource}</CardTitle><Badge variant={selectedCount > 0 ? "default" : "outline"} className="text-xs">{selectedCount} / {perms.length}</Badge></div></CardHeader><CardContent className="pt-0"><div className="grid grid-cols-2 gap-2">{perms.map((perm) => { const actionLabel = terminology.permissions.actions[perm.action] || perm.action; return <label key={perm.id} className={`flex items-center gap-2 rounded-md border p-2.5 cursor-pointer transition-colors ${selectedIds.has(perm.id) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}><Checkbox checked={selectedIds.has(perm.id)} onCheckedChange={() => togglePermission(perm.id)} /><div className="flex-1 min-w-0"><span className="text-sm font-medium block">{actionLabel}</span><span className="text-xs text-muted-foreground truncate block">{resourceInfo?.description || messages.common.details}</span></div></label>; })}</div></CardContent></Card>;
              })}
            </div>}
          </div>
          {saveError && <div className="rounded-md bg-red-50 border border-red-200 p-3 flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" /><p className="text-sm text-red-800">{saveError}</p></div>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose} disabled={isSaving}>{messages.common.cancel}</Button><Button onClick={handleSave} disabled={!canSave} className="gap-2">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{messages.roles.createRole}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
