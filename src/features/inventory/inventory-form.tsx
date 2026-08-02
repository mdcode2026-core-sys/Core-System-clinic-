"use client";

import { useState } from "react";
import { useInvalidateInventory } from "@/domain/inventory/inventory.queries";
import { createInventoryItem, updateInventoryItem, adjustStock } from "@/domain/inventory/inventory.actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import type { InventoryItem } from "@/domain/inventory/inventory.types";

interface InventoryFormProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  initialData?: InventoryItem | null;
}

export function InventoryForm({ open, onClose, tenantId, initialData }: InventoryFormProps) {
  const { invalidateItems, invalidateLedger } = useInvalidateInventory();
  const [activeTab, setActiveTab] = useState<"details" | "adjust">("details");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: initialData?.name || "",
    name_ar: initialData?.name_ar || "",
    unit: initialData?.unit || "piece",
    reorder_threshold: initialData?.reorder_threshold ?? 10,
    current_stock: initialData?.current_stock ?? 0,
  });

  const [adjustment, setAdjustment] = useState({
    quantity_delta: 0,
    reason: "",
    consumption_type: "stock_in" as "stock_in" | "stock_adjustment",
  });

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("اسم الصنف مطلوب");
      return;
    }

    setIsPending(true);

    const fd = new FormData();
    fd.append("tenant_id", tenantId);
    fd.append("name", form.name);
    fd.append("name_ar", form.name_ar);
    fd.append("unit", form.unit);
    fd.append("reorder_threshold", String(form.reorder_threshold));
    fd.append("current_stock", String(form.current_stock));

    let result;
    if (initialData) {
      fd.append("id", initialData.id);
      fd.append("is_active", "true");
      result = await updateInventoryItem(fd);
    } else {
      result = await createInventoryItem(fd);
    }

    setIsPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    invalidateItems(tenantId);
    onClose();
  };

  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!initialData) return;
    if (adjustment.quantity_delta === 0) {
      setError("التغيير لا يمكن أن يكون صفراً");
      return;
    }
    if (!adjustment.reason.trim()) {
      setError("السبب مطلوب");
      return;
    }

    setIsPending(true);

    const fd = new FormData();
    fd.append("tenant_id", tenantId);
    fd.append("item_id", initialData.id);
    fd.append("quantity_delta", String(adjustment.quantity_delta));
    fd.append("reason", adjustment.reason);
    fd.append("consumption_type", adjustment.consumption_type);

    const result = await adjustStock(fd);
    setIsPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    invalidateItems(tenantId);
    invalidateLedger(tenantId, initialData.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? `تعديل: ${initialData.name}` : "إضافة صنف جديد"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Tab switcher using buttons instead of Tabs component */}
        {initialData && (
          <div className="flex gap-2 mt-4 border-b pb-2">
            <Button
              type="button"
              variant={activeTab === "details" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("details")}
            >
              البيانات الأساسية
            </Button>
            <Button
              type="button"
              variant={activeTab === "adjust" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("adjust")}
            >
              تعديل المخزون
            </Button>
          </div>
        )}

        {activeTab === "details" && (
          <form onSubmit={handleSubmitDetails} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الصنف (EN) *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_ar">اسم الصنف (AR)</Label>
                <Input
                  id="name_ar"
                  value={form.name_ar}
                  onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">الوحدة</Label>
                <Input
                  id="unit"
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorder">الحد الأدنى للتنبيه</Label>
                <Input
                  id="reorder"
                  type="number"
                  min={0}
                  value={form.reorder_threshold}
                  onChange={(e) => setForm((f) => ({ ...f, reorder_threshold: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">المخزون الحالي</Label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  value={form.current_stock}
                  onChange={(e) => setForm((f) => ({ ...f, current_stock: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الحفظ..." : initialData ? "حفظ التعديلات" : "إضافة الصنف"}
              </Button>
            </div>
          </form>
        )}

        {initialData && activeTab === "adjust" && (
          <form onSubmit={handleAdjustment} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="delta">التغيير في المخزون (+ إضافة / - صرف)</Label>
              <Input
                id="delta"
                type="number"
                value={adjustment.quantity_delta}
                onChange={(e) => setAdjustment((a) => ({ ...a, quantity_delta: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adj_reason">السبب / الملاحظات</Label>
              <Input
                id="adj_reason"
                value={adjustment.reason}
                onChange={(e) => setAdjustment((a) => ({ ...a, reason: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adj_type">نوع العملية</Label>
              <select
                id="adj_type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={adjustment.consumption_type}
                onChange={(e) => setAdjustment((a) => ({ ...a, consumption_type: e.target.value as "stock_in" | "stock_adjustment" }))}
              >
                <option value="stock_in">إضافة مخزون (شراء/إرجاع)</option>
                <option value="stock_adjustment">تسوية مخزون (جرد/تعديل)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري التعديل..." : "تنفيذ التعديل"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
