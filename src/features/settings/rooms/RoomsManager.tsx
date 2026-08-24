"use client";
import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { createRoom, toggleRoomActive, updateRoom, useRooms } from "@/domain/rooms";
import type { ClinicRoom } from "@/domain/rooms";
import { ROOM_TYPE_OPTIONS } from "@/domain/rooms";
import { useI18n } from "@/core/i18n/I18nProvider";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { CheckCircle2, Loader2, Pencil, Plus, XCircle } from "lucide-react";

export function RoomsManager() {
  const { tenantId } = useTenantId();
  const { hasPermission } = usePermissions();
  const { messages, locale, rooms: t } = useI18n();
  const common = messages.common;
  const canManage = hasPermission("settings:update");
  const { data: roomRows = [], isLoading, error, refetch } = useRooms(tenantId, { includeInactive: true });
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<ClinicRoom | null>(null); const [message, setMessage] = useState<string | null>(null); const [errorMessage, setErrorMessage] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  const typeLabel = (value: string) => t.types[value as keyof typeof t.types] ?? value;
  function startCreate() { setEditing(null); setMessage(null); setErrorMessage(null); setOpen(true); }
  function startEdit(room: ClinicRoom) { setEditing(room); setMessage(null); setErrorMessage(null); setOpen(true); }
  async function handleToggle(room: ClinicRoom, checked: boolean) { setMessage(null); setErrorMessage(null); const result = await toggleRoomActive(room.id, checked); if (!result.success) setErrorMessage(result.error ?? t.updateFailed); else { setMessage(checked ? t.resourceActivated : t.resourceDeactivated); refetch(); } }
  const direction = locale === "ar" ? "rtl" : "ltr";
  if (isLoading) return <div className="flex items-center justify-center py-12" dir={direction}><Loader2 className="me-3 h-6 w-6 animate-spin" /><span className="text-muted-foreground">{common.loading}</span></div>;
  if (error) return <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive" dir={direction}>{t.loadFailed}</div>;
  return <div className="space-y-6" dir={direction}>
    <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">{t.title}</h2><p className="text-sm text-muted-foreground">{t.description}</p></div>{canManage && <Button onClick={startCreate}><Plus className="me-2 h-4 w-4" />{t.newResource}</Button>}</div>
    {message && <div className="flex items-center gap-2 rounded-md border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" />{message}</div>}
    {errorMessage && <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"><XCircle className="h-4 w-4" />{errorMessage}</div>}
    <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>{t.resource}</TableHead><TableHead>{t.type}</TableHead><TableHead>{t.floor}</TableHead><TableHead>{t.capacity}</TableHead><TableHead>{common.status}</TableHead>{canManage && <TableHead>{common.actions}</TableHead>}</TableRow></TableHeader><TableBody>{roomRows.length === 0 ? <TableRow><TableCell colSpan={canManage ? 6 : 5} className="py-8 text-center text-muted-foreground">{t.noResources}</TableCell></TableRow> : roomRows.map((room) => <TableRow key={room.id} className={!room.is_active ? "opacity-60" : ""}><TableCell className="font-medium">{room.room_name}</TableCell><TableCell>{typeLabel(room.room_type)}</TableCell><TableCell>{room.floor_number ?? "—"}</TableCell><TableCell>{room.capacity ?? "—"}</TableCell><TableCell><Badge variant={room.is_active ? "default" : "secondary"}>{room.is_active ? common.active : common.inactive}</Badge></TableCell>{canManage && <TableCell><div className="flex items-center gap-2"><Button variant="ghost" size="sm" aria-label={t.editResource} onClick={() => startEdit(room)}><Pencil className="h-4 w-4" /></Button><Switch checked={room.is_active} onCheckedChange={(checked) => handleToggle(room, checked)} /></div></TableCell>}</TableRow>)}</TableBody></Table></CardContent></Card>
    <RoomDialog open={open} onOpenChange={setOpen} room={editing} onSuccess={(text) => { setMessage(text); setErrorMessage(null); setOpen(false); refetch(); }} onError={(text) => { setErrorMessage(text); setMessage(null); }} saving={saving} setSaving={setSaving} locale={locale} />
  </div>;
}

function RoomDialog({ open, onOpenChange, room, onSuccess, onError, saving, setSaving, locale }: { open: boolean; onOpenChange: (open: boolean) => void; room: ClinicRoom | null; onSuccess: (message: string) => void; onError: (message: string) => void; saving: boolean; setSaving: (value: boolean) => void; locale: "ar" | "en" }) {
  const { rooms: t } = useI18n();
  const isEdit = !!room; const [name, setName] = useState(room?.room_name ?? ""); const [type, setType] = useState(room?.room_type ?? "procedure"); const [floor, setFloor] = useState(room?.floor_number?.toString() ?? ""); const [capacity, setCapacity] = useState(room?.capacity?.toString() ?? "1");
  function resetFromRoom(next: ClinicRoom | null) { setName(next?.room_name ?? ""); setType(next?.room_type ?? "procedure"); setFloor(next?.floor_number?.toString() ?? ""); setCapacity(next?.capacity?.toString() ?? "1"); }
  function handleOpenChange(next: boolean) { if (next) resetFromRoom(room); onOpenChange(next); }
  async function submit(event: React.FormEvent) { event.preventDefault(); setSaving(true); const payload = { room_name: name.trim(), room_type: type, floor_number: floor.trim() ? Number(floor) : null, capacity: capacity.trim() ? Number(capacity) : null }; const result = isEdit && room ? await updateRoom(room.id, payload) : await createRoom({ ...payload, is_active: true }); setSaving(false); if (!result.success) onError(result.error ?? t.saveFailed); else onSuccess(isEdit ? t.updated : t.created); }
  const typeLabel = (value: string) => t.types[value as keyof typeof t.types] ?? value;
  return <Dialog open={open} onOpenChange={handleOpenChange}><DialogContent dir={locale === "ar" ? "rtl" : "ltr"} className="sm:max-w-[520px]"><DialogHeader><DialogTitle>{isEdit ? t.editResource : t.newResource}</DialogTitle><DialogDescription>{t.resourceDescription}</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-5"><div className="space-y-2"><Label htmlFor="room-name">{t.resourceName}</Label><Input id="room-name" value={name} onChange={(e) => setName(e.target.value)} required disabled={saving} /></div><div className="space-y-2"><Label>{t.resourceType}</Label><Select value={type} onValueChange={setType} disabled={saving}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ROOM_TYPE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{typeLabel(option.value)}</SelectItem>)}</SelectContent></Select></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="room-floor">{t.floor}</Label><Input id="room-floor" type="number" min="0" step="1" value={floor} onChange={(e) => setFloor(e.target.value)} disabled={saving} /></div><div className="space-y-2"><Label htmlFor="room-capacity">{t.capacity}</Label><Input id="room-capacity" type="number" min="1" step="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} disabled={saving} /></div></div><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>{t.cancel}</Button><Button type="submit" disabled={saving || !name.trim()}>{saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}{isEdit ? t.saveChanges : t.createResource}</Button></DialogFooter></form></DialogContent></Dialog>;
}
