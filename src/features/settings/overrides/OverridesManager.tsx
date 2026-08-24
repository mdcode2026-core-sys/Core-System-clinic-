"use client";

import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useClinicUsersWithOverrides } from "@/domain/overrides/overrides.queries";
import { usePermissionsCatalog } from "@/domain/roles/roles.queries";
import { UserPermissionEditor } from "./UserPermissionEditor";
import type { UserWithOverrides } from "@/domain/overrides/overrides.types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { UserCog, Shield, ShieldCheck, Pencil, Loader2, AlertTriangle, Plus, Minus } from "lucide-react";

export function OverridesManager() {
  const { locale, admin: a } = useI18n();
  const { tenantId } = useTenantId();
  const { hasPermission, isLoading: permsLoading } = usePermissions();
  const { data: users = [], isLoading: usersLoading, error: usersError } = useClinicUsersWithOverrides(tenantId);
  const { data: catalog = [] } = usePermissionsCatalog();
  const canManage = hasPermission("overrides:manage");
  const [editingUser, setEditingUser] = useState<UserWithOverrides | null>(null);
  const dateDirection = locale === "ar" ? "rtl" : "ltr";

  if (permsLoading || usersLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ms-3 text-muted-foreground">{a.overrides.loading}</span></div>;
  if (!canManage) return <div className="py-12 text-center"><Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" /><h3 className="mb-2 text-lg font-semibold">{a.overrides.accessDenied}</h3></div>;
  if (usersError) return <div className="py-12 text-center"><AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" /><h3 className="mb-2 text-lg font-semibold">{a.overrides.loadFailed}</h3><p className="text-muted-foreground">{usersError.message}</p></div>;

  return <div className="space-y-6" dir={dateDirection}>
    <div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2"><UserCog className="h-5 w-5 text-primary" /></div><div><h2 className="text-xl font-semibold">{a.overrides.title}</h2><p className="text-sm text-muted-foreground">{a.overrides.description}</p></div></div>
    <Card className="bg-muted/50"><CardContent className="py-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" /><p className="text-sm text-muted-foreground">{a.overrides.override}: <Plus className="inline h-3 w-3" /> {a.overrides.grant} / <Minus className="inline h-3 w-3" /> {a.overrides.revoke}. {a.overrides.description}</p></div></CardContent></Card>
    <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>{a.overrides.user}</TableHead><TableHead>{a.users.role}</TableHead><TableHead>{a.users.status}</TableHead><TableHead>{a.overrides.override}</TableHead><TableHead>{a.users.actions}</TableHead></TableRow></TableHeader><TableBody>
      {users.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">{a.overrides.noUsers}</TableCell></TableRow> : users.map(user => { const grants = user.overrides.filter(o => o.granted).length; const revokes = user.overrides.filter(o => !o.granted).length; return <TableRow key={user.id} className={!user.is_active ? "opacity-60" : ""}><TableCell><div className="flex flex-col"><span className="font-medium">{user.full_name || "—"}</span><span className="text-xs text-muted-foreground">{user.email || "—"}</span></div></TableCell><TableCell>{locale === "ar" ? user.role_name_ar || user.role_name || user.role : user.role_name || user.role_name_ar || user.role}</TableCell><TableCell><Badge variant={user.is_active ? "default" : "secondary"}>{user.is_active ? a.users.active : a.users.inactive}</Badge></TableCell><TableCell><div className="flex items-center gap-2">{grants > 0 && <Badge variant="outline"><Plus className="me-1 h-3 w-3" />{grants} {a.overrides.grant}</Badge>}{revokes > 0 && <Badge variant="outline"><Minus className="me-1 h-3 w-3" />{revokes} {a.overrides.revoke}</Badge>}{grants === 0 && revokes === 0 && <span className="text-xs text-muted-foreground">{a.overrides.noPermissions}</span>}</div></TableCell><TableCell><Button variant="ghost" size="sm" className="gap-1" onClick={() => setEditingUser(user)}><Pencil className="h-4 w-4" />{a.users.editTitle}</Button></TableCell></TableRow>; })}
    </TableBody></Table></CardContent></Card>
    <Dialog open={!!editingUser} onOpenChange={open => { if (!open) setEditingUser(null); }}><DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{a.overrides.title}</DialogTitle></DialogHeader>{editingUser && <UserPermissionEditor user={editingUser} catalog={catalog} onClose={() => setEditingUser(null)} />}</DialogContent></Dialog>
  </div>;
}
