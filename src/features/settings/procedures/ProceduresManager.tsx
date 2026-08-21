"use client";

/**
 * PJ Stage 3 — Clinic Service Catalog Management UI
 * Settings → Medical Services / الخدمات الطبية
 *
 * Supports: list, search, filter by specialty, create, edit, activate/deactivate.
 * Permission-gated via usePermissions / hasPermission.
 */

import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useProcedures } from "@/domain/procedures/procedures.queries";
import {
  createProcedure,
  updateProcedure,
  toggleProcedureActive,
} from "@/domain/procedures/procedures.actions";
import type { ClinicProcedure, ClinicProcedureInsert, ClinicProcedureUpdate } from "@/domain/procedures/procedures.types";
import {
  SPECIALTY_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  PROVIDER_TYPE_OPTIONS,
} from "@/domain/procedures/procedures.types";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
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
import {
  Plus,
  Pencil,
  Search,
  Stethoscope,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

/* ── Component ── */

export function ProceduresManager() {
  const { tenantId } = useTenantId();
  const { hasPermission } = usePermissions();
  const {
    data: procedures = [],
    isLoading,
    error,
    refetch,
  } = useProcedures(tenantId, { includeInactive: true });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<ClinicProcedure | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const canCreate = hasPermission("procedures:create");
  const canUpdate = hasPermission("procedures:update");
  const canDelete = hasPermission("procedures:delete");

  /* Filtered list */
  const filtered = procedures.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.procedure_name.toLowerCase().includes(q) ||
      (p.procedure_name_ar && p.procedure_name_ar.includes(q)) ||
      (p.procedure_code && p.procedure_code.toLowerCase().includes(q));
    const matchesSpecialty =
      specialtyFilter === "all" || p.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  const activeCount = procedures.filter((p) => p.is_active).length;
  const inactiveCount = procedures.length - activeCount;

  function clearMessages() {
    setActionError(null);
    setActionSuccess(null);
  }

  /* ── Render ── */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" dir="rtl">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="mr-3 text-muted-foreground">جاري التحميل...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center" dir="rtl">
        <AlertTriangle className="mx-auto h-8 w-8 text-destructive mb-2" />
        <p className="text-destructive font-medium">فشل تحميل الكتالوج</p>
        <p className="text-sm text-muted-foreground mt-1">
          {error instanceof Error ? error.message : "حدث خطأ غير متوقع"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">الخدمات الطبية</h2>
            <p className="text-sm text-muted-foreground">
              {procedures.length} خدمة مسجلة
              {activeCount > 0 && ` · ${activeCount} نشطة`}
              {inactiveCount > 0 && ` · ${inactiveCount} معطلة`}
            </p>
          </div>
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              clearMessages();
              setCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4 ml-2" />
            خدمة جديدة
          </Button>
        )}
      </div>

      {/* Messages */}
      {actionError && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="rounded-md border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {actionSuccess}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بالاسم أو الكود..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
            dir="rtl"
          />
        </div>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="التخصص" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع التخصصات</SelectItem>
            {SPECIALTY_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الخدمة</TableHead>
                <TableHead className="text-right">التخصص</TableHead>
                <TableHead className="text-right">المدة</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    لا توجد خدمات مطابقة
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((proc) => (
                  <TableRow
                    key={proc.id}
                    className={!proc.is_active ? "opacity-60" : ""}
                  >
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{proc.procedure_name}</span>
                        {proc.procedure_name_ar && (
                          <span className="text-xs text-muted-foreground">
                            {proc.procedure_name_ar}
                          </span>
                        )}
                        {proc.procedure_code && (
                          <Badge variant="outline" className="text-xs w-fit mt-1">
                            {proc.procedure_code}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {SPECIALTY_OPTIONS.find((s) => s.value === proc.specialty)
                          ?.label || proc.specialty || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {proc.standard_duration_minutes} د
                      {proc.buffer_time_minutes > 0 &&
                        ` (+${proc.buffer_time_minutes} احتياطي)`}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(proc.base_price_subunits / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={proc.is_active ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {proc.is_active ? "نشط" : "معطل"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center justify-end gap-2">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProcedure(proc);
                              clearMessages();
                              setEditOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={proc.is_active}
                              onCheckedChange={async (checked) => {
                                clearMessages();
                                const result = await toggleProcedureActive(proc.id, checked);
                                if (!result.success) {
                                  setActionError(result.error || "فشل تحديث الحالة");
                                } else {
                                  setActionSuccess(
                                    checked ? "تم تفعيل الخدمة" : "تم تعطيل الخدمة"
                                  );
                                  refetch();
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <ProcedureDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onError={setActionError}
        onSuccess={(msg) => {
          setActionSuccess(msg);
          setCreateOpen(false);
          refetch();
        }}
      />

      {/* Edit Dialog */}
      {editingProcedure && (
        <ProcedureDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          procedure={editingProcedure}
          onError={setActionError}
          onSuccess={(msg) => {
            setActionSuccess(msg);
            setEditOpen(false);
            setEditingProcedure(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

/* ── ProcedureDialog (Create / Edit) ── */

interface ProcedureDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  procedure?: ClinicProcedure | null;
  onError: (msg: string | null) => void;
  onSuccess: (msg: string) => void;
}

function ProcedureDialog({
  open,
  onOpenChange,
  mode,
  procedure,
  onError,
  onSuccess,
}: ProcedureDialogProps) {
  const isEdit = mode === "edit";

  const [procedureName, setProcedureName] = useState(procedure?.procedure_name || "");
  const [procedureNameAr, setProcedureNameAr] = useState(procedure?.procedure_name_ar || "");
  const [procedureCode, setProcedureCode] = useState(procedure?.procedure_code || "");
  const [category, setCategory] = useState(procedure?.category || "");
  const [specialty, setSpecialty] = useState(procedure?.specialty || "");
  const [serviceType, setServiceType] = useState(procedure?.service_type || "procedure");
  const [providerType, setProviderType] = useState(procedure?.provider_type || "doctor");
  const [duration, setDuration] = useState(
    procedure?.standard_duration_minutes?.toString() || "30"
  );
  const [bufferTime, setBufferTime] = useState(
    procedure?.buffer_time_minutes?.toString() || "0"
  );
  const [basePrice, setBasePrice] = useState(
    procedure?.base_price_subunits ? (procedure.base_price_subunits / 100).toString() : "0"
  );
  const [taxRate, setTaxRate] = useState(
    procedure?.tax_rate_percent?.toString() || "0"
  );
  const [taxIncluded, setTaxIncluded] = useState(procedure?.tax_included ?? false);
  const [displayOrder, setDisplayOrder] = useState(
    procedure?.display_order?.toString() || "0"
  );
  const [isActive, setIsActive] = useState(procedure?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    setSubmitting(true);

    const priceSubunits = Math.round(parseFloat(basePrice || "0") * 100);

    const payload = {
      procedure_name: procedureName.trim(),
      procedure_name_ar: procedureNameAr.trim() || null,
      procedure_code: procedureCode.trim() || null,
      category: category.trim() || null,
      specialty: specialty || null,
      service_type: serviceType,
      provider_type: providerType,
      standard_duration_minutes: parseInt(duration) || 30,
      buffer_time_minutes: parseInt(bufferTime) || 0,
      base_price_subunits: priceSubunits,
      tax_rate_percent: parseInt(taxRate) || 0,
      tax_included: taxIncluded,
      display_order: parseInt(displayOrder) || 0,
      is_active: isActive,
    };

    try {
      if (isEdit && procedure) {
        const result = await updateProcedure(procedure.id, payload as ClinicProcedureUpdate);
        if (!result.success) {
          onError(result.error || "فشل تحديث الخدمة");
        } else {
          onSuccess("تم تحديث الخدمة بنجاح");
        }
      } else {
        const result = await createProcedure(payload as ClinicProcedureInsert);
        if (!result.success) {
          onError(result.error || "فشل إنشاء الخدمة");
        } else {
          onSuccess("تم إنشاء الخدمة بنجاح");
        }
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل خدمة" : "خدمة جديدة"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "تعديل بيانات الخدمة الطبية"
              : "إضافة خدمة جديدة إلى كتالوج العيادة"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Names */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم الخدمة *</Label>
              <Input
                value={procedureName}
                onChange={(e) => setProcedureName(e.target.value)}
                required
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالعربية</Label>
              <Input
                value={procedureNameAr}
                onChange={(e) => setProcedureNameAr(e.target.value)}
                dir="rtl"
              />
            </div>
          </div>

          {/* Row 2: Code + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>كود الخدمة</Label>
              <Input
                value={procedureCode}
                onChange={(e) => setProcedureCode(e.target.value)}
                placeholder="مثال: DENT-001"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>الفئة</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="مثال: علاج الجذور"
                dir="rtl"
              />
            </div>
          </div>

          {/* Row 3: Specialty + Service Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>التخصص *</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر التخصص" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTY_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>نوع الخدمة</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPE_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Provider Type + Display Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع مقدم الخدمة</Label>
              <Select value={providerType} onValueChange={setProviderType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_TYPE_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ترتيب العرض</Label>
              <Input
                type="number"
                min="0"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>

          {/* Row 5: Duration + Buffer + Price */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>المدة (دقيقة) *</Label>
              <Input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>وقت الاحتياطي (دقيقة)</Label>
              <Input
                type="number"
                min="0"
                value={bufferTime}
                onChange={(e) => setBufferTime(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>السعر الأساسي *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
                dir="ltr"
              />
            </div>
          </div>

          {/* Row 6: Tax */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نسبة الضريبة (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={taxIncluded}
                onCheckedChange={setTaxIncluded}
              />
              <Label>الضريبة مضمنة</Label>
            </div>
          </div>

          {/* Active toggle (edit only) */}
          {isEdit && (
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>نشط</Label>
            </div>
          )}

          {/* Footer */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : isEdit ? (
                "حفظ التعديلات"
              ) : (
                "إنشاء الخدمة"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
