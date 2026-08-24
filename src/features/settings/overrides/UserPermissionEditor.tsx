"use client";

import { useState, useCallback, useMemo } from "react";
import { useUserPermissionOverrides } from "@/domain/overrides/overrides.queries";
import { setPermissionOverride, removePermissionOverride } from "@/domain/overrides/overrides.actions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useI18n } from "@/core/i18n/I18nProvider";
import type { UserWithOverrides, PermissionOverride } from "@/domain/overrides/overrides.types";
import type { PermissionRow } from "@/domain/roles/roles.types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Save, X, Loader2, Plus, Minus } from "lucide-react";

interface UserPermissionEditorProps { user: UserWithOverrides; catalog: PermissionRow[]; onClose: () => void; }

export function UserPermissionEditor({ user, catalog, onClose }: UserPermissionEditorProps) {
  const { locale, admin: a } = useI18n();
  const { tenantId } = useTenantId();
  const { data: existingOverrides = [], isLoading: overridesLoading, refetch } = useUserPermissionOverrides(user.id, tenantId);
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean | null>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const existingByPermId = useMemo(() => new Map<string, PermissionOverride>(existingOverrides.map(ov => [ov.permission_id, ov])), [existingOverrides]);
  const getEffectiveState = useCallback((permissionId: string): "default" | "granted" | "revoked" => { const pending = pendingChanges.get(permissionId); if (pending === true) return "granted"; if (pending === false) return "revoked"; if (pending === null) return "default"; const existing = existingByPermId.get(permissionId); return existing ? (existing.granted ? "granted" : "revoked") : "default"; }, [pendingChanges, existingByPermId]);
  const togglePermission = (permissionId: string) => { setSaveSuccess(false); setSaveError(null); setPendingChanges(prev => { const next = new Map(prev); const current = getEffectiveState(permissionId); next.set(permissionId, current === "default" ? true : current === "granted" ? false : null); return next; }); };
  const handleSave = async () => { setIsSaving(true); setSaveError(null); setSaveSuccess(false); try { for (const [permissionId, state] of pendingChanges.entries()) { const result = state === null ? await removePermissionOverride({ userId: user.id, permissionId }) : await setPermissionOverride({ userId: user.id, permissionId, granted: state }); if (!result.success) throw new Error(result.error || a.overrides.saveError); } setSaveSuccess(true); setPendingChanges(new Map()); void refetch(); } catch (err) { setSaveError(err instanceof Error ? err.message : a.overrides.saveError); } finally { setIsSaving(false); } };
  const groupedCatalog = catalog.reduce<Record<string, PermissionRow[]>>((acc, perm) => { (acc[perm.resource] ||= []).push(perm); return acc; }, {});
  if (overridesLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ms-3 text-muted-foreground">{a.overrides.loading}</span></div>;

  return <div className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold">{user.full_name || user.email || a.users.noRole}</h3><p className="text-sm text-muted-foreground">{a.users.role}: {locale === "ar" ? user.role_name_ar || user.role_name || user.role : user.role_name || user.role_name_ar || user.role}</p></div><Button variant="ghost" size="sm" onClick={onClose}><X className="me-1 h-4 w-4" />{a.overrides.close}</Button></div>
    <Separator />
    <div className="flex flex-wrap items-center gap-4 text-sm"><span className="text-muted-foreground">{a.overrides.inherited}</span><span className="text-green-700">{a.overrides.additionalGrant}</span><span className="text-red-700">{a.overrides.permissionRevoke}</span></div>
    <div className="max-h-[55vh] space-y-4 overflow-y-auto pe-1">{Object.entries(groupedCatalog).map(([resource, perms]) => { const groupKey = resource as keyof typeof a.overrides.groups; const grantedCount = perms.filter(p => getEffectiveState(p.id) === "granted").length; const revokedCount = perms.filter(p => getEffectiveState(p.id) === "revoked").length; return <Card key={resource}><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-semibold">{a.overrides.groups[groupKey] || resource}</CardTitle><div className="flex items-center gap-2">{grantedCount > 0 && <Badge variant="outline"><Plus className="me-1 h-3 w-3" />{grantedCount}</Badge>}{revokedCount > 0 && <Badge variant="outline"><Minus className="me-1 h-3 w-3" />{revokedCount}</Badge>}<Badge variant="outline">{perms.length}</Badge></div></div><p className="text-xs text-muted-foreground">{a.overrides.groupDescriptions[groupKey] || ""}</p></CardHeader><CardContent className="pt-0"><div className="grid grid-cols-1 gap-2 md:grid-cols-2">{perms.map(perm => { const state = getEffectiveState(perm.id); const granted = state === "granted"; const revoked = state === "revoked"; return <button key={perm.id} type="button" onClick={() => togglePermission(perm.id)} className={`flex items-center gap-2 rounded-md border p-2.5 text-start transition-colors ${granted ? "border-green-300 bg-green-50" : revoked ? "border-red-300 bg-red-50" : "border-border hover:bg-muted/50"}`}><div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${granted ? "border-green-500 bg-green-500 text-white" : revoked ? "border-red-500 bg-red-500 text-white" : "border-muted-foreground"}`}>{granted && <Plus className="h-3 w-3" />}{revoked && <Minus className="h-3 w-3" />}</div><div className="min-w-0 flex-1"><span className="block text-sm font-medium">{a.overrides.actions[perm.action as keyof typeof a.overrides.actions] || perm.action}</span><span className="block truncate text-xs text-muted-foreground">{perm.permission_name}</span></div></button>; })}</div></CardContent></Card>; })}</div>
    <Separator />
    <div className="flex items-center justify-between"><div>{saveError && <p className="text-sm text-destructive">{saveError}</p>}{saveSuccess && <p className="text-sm text-green-600">{a.overrides.saved}</p>}</div><div className="flex gap-2"><Button variant="outline" onClick={onClose}>{a.overrides.close}</Button><Button onClick={() => void handleSave()} disabled={isSaving || pendingChanges.size === 0} className="gap-2">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{isSaving ? a.overrides.saving : a.overrides.save}</Button></div></div>
  </div>;
}
