"use client";

import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { createRoom, toggleRoomActive, updateRoom, useRooms } from "@/domain/rooms";
import type { ClinicRoom } from "@/domain/rooms";
import { ROOM_TYPE_OPTIONS } from "@/domain/rooms";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { CheckCircle2, Loader2, Pencil, Plus, XCircle } from "lucide-react";

export function RoomsManager() {
  const { tenantId } = useTenantId();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("settings:update");
  const { data: rooms = [], isLoading, error, refetch } = useRooms(tenantId, { includeInactive: true });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicRoom | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function startCreate() {
    setEditing(null);
    setMessage(null);
    setErrorMessage(null);
    setOpen(true);
  }

  function startEdit(room: ClinicRoom) {
    setEditing(room);
    setMessage(null);
    setErrorMessage(null);
    setOpen(true);
  }

  async function handleToggle(room: ClinicRoom, checked: boolean) {
    setMessage(null);
    setErrorMessage(null);
    const result = await toggleRoomActive(room.id, checked);
    if (!result.success) setErrorMessage(result.error ?? "فشل تحديث حالة المورد");
    else {
      setMessage(checked ? "تم تفعيل المورد" : "تم تعطيل المورد");
      refetch();
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /><span className="mr-3 text-muted-foreground">جاري التحميل...</span></div>;
  }

  if (error) {
    return <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">فشل تحميل الغرف والموارد.</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">الغرف والموارد</h2>
          <p className="text-sm text-muted-foreground">إدارة الموارد القابلة للجدولة المستخدمة في المواعيد.</p>
        </div>
        {canManage && <Button onClick={startCreate}><Plus className="ml-2 h-4 w-4" /> مورد جديد</Button>}
      </div>

      {message && <div className="flex items-center gap-2 rounded-md border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" />{message}</div>}
      {errorMessage && <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"><XCircle className="h-4 w-4" />{errorMessage}</div>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الطابق</TableHead>
                <TableHead className="text-right">السعة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                {canManage && <TableHead className="text-left">إجراءات</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow><TableCell colSpan={canManage ? 6 : 5} className="py-8 text-center text-muted-foreground">لا توجد موارد مسجلة.</TableCell></TableRow>
              ) : rooms.map((room) => {
                const type = ROOM_TYPE_OPTIONS.find((option) => option.value === room.room_type);
                return (
                  <TableRow key={room.id} className={!room.is_active ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{room.room_name}</TableCell>
                    <TableCell>{type?.label ?? room.room_type}</TableCell>
                    <TableCell>{room.floor_number ?? "—"}</TableCell>
                    <TableCell>{room.capacity ?? "—"}</TableCell>
                    <TableCell><Badge variant={room.is_active ? "default" : "secondary"}>{room.is_active ? "نشط" : "معطل"}</Badge></TableCell>
                    {canManage && <TableCell className="text-left"><div className="flex items-center justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => startEdit(room)}><Pencil className="h-4 w-4" /></Button><Switch checked={room.is_active} onCheckedChange={(checked) => handleToggle(room, checked)} /></div></TableCell>}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RoomDialog
        open={open}
        onOpenChange={setOpen}
        room={editing}
        onSuccess={(text) => { setMessage(text); setErrorMessage(null); setOpen(false); refetch(); }}
        onError={(text) => { setErrorMessage(text); setMessage(null); }}
      />
    </div>
  );
}

function RoomDialog({
  open,
  onOpenChange,
  room,
  onSuccess,
  onError,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: ClinicRoom | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) {
  const isEdit = !!room;
  const [name, setName] = useState(room?.room_name ?? "");
  const [type, setType] = useState(room?.room_type ?? "procedure");
  const [floor, setFloor] = useState(room?.floor_number?.toString() ?? "");
  const [capacity, setCapacity] = useState(room?.capacity?.toString() ?? "1");
  const [saving, setSaving] = useState(false);

  function resetFromRoom(next: ClinicRoom | null) {
    setName(next?.room_name ?? "");
    setType(next?.room_type ?? "procedure");
    setFloor(next?.floor_number?.toString() ?? "");
    setCapacity(next?.capacity?.toString() ?? "1");
  }

  function handleOpenChange(next: boolean) {
    if (next) resetFromRoom(room);
    onOpenChange(next);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      room_name: name.trim(),
      room_type: type,
      floor_number: floor.trim() ? Number(floor) : null,
      capacity: capacity.trim() ? Number(capacity) : null,
    };

    const result = isEdit && room
      ? await updateRoom(room.id, payload)
      : await createRoom({ ...payload, is_active: true });

    setSaving(false);
    if (!result.success) onError(result.error ?? "فشل حفظ المورد");
    else onSuccess(isEdit ? "تم تحديث المورد بنجاح" : "تم إنشاء المورد بنجاح");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-[520px]">
        <DialogHeader><DialogTitle>{isEdit ? "تعديل المورد" : "مورد جديد"}</DialogTitle><DialogDescription>المورد هو غرفة أو مساحة سريرية قابلة للاستخدام في الجدولة.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="room-name">اسم المورد</Label><Input id="room-name" value={name} onChange={(e) => setName(e.target.value)} required disabled={saving} /></div>
          <div className="space-y-2"><Label>نوع المورد</Label><Select value={type} onValueChange={setType} disabled={saving}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ROOM_TYPE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="room-floor">الطابق</Label><Input id="room-floor" type="number" min="0" step="1" value={floor} onChange={(e) => setFloor(e.target.value)} disabled={saving} /></div>
            <div className="space-y-2"><Label htmlFor="room-capacity">السعة</Label><Input id="room-capacity" type="number" min="1" step="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} disabled={saving} /></div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>إلغاء</Button><Button type="submit" disabled={saving || !name.trim()}>{saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}{isEdit ? "حفظ التغييرات" : "إنشاء المورد"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
