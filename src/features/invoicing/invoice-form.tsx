// ============================================================
// src/features/invoicing/invoice-form.tsx
// Phase 5 — Invoice Form Component
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Plus, Trash2, Calculator, Save } from "lucide-react";
import { createManualInvoice } from "../../../domain/invoicing/invoicing.actions";
import { getUninvoicedSessions, getClinicProcedures, getPatientsList } from "../../../domain/invoicing/invoicing.queries";
import { calculateLineItem, calculateInvoiceTotals, formatCurrency } from "../../../domain/invoicing/invoicing.calculator";
import type { InvoiceFormState, InvoiceFormItem, PaymentTerms } from "../../../domain/invoicing/invoicing.types";

const paymentTermsOptions: { value: PaymentTerms; label: string }[] = [
  { value: "cash", label: "نقدي" },
  { value: "credit", label: "آجل" },
  { value: "installment", label: "تقسيط" },
];

export function InvoiceForm() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<InvoiceFormState>({
    patient_id: "",
    session_id: null,
    payment_terms: "cash",
    notes: "",
    items: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [patientsRes, proceduresRes, sessionsRes] = await Promise.all([
      getPatientsList(),
      getClinicProcedures(),
      getUninvoicedSessions(),
    ]);

    if (patientsRes.success) setPatients(patientsRes.data);
    if (proceduresRes.success) setProcedures(proceduresRes.data);
    if (sessionsRes.success) setSessions(sessionsRes.data);

    setLoading(false);
  }

  function addItem() {
    const newItem: InvoiceFormItem = {
      tempId: crypto.randomUUID(),
      procedure_id: null,
      description: "",
      quantity: 1,
      unit_price_subunits: 0,
      discount_amount_subunits: 0,
      discount_percent: null,
      discount_reason: null,
      tax_rate_percent: 16,
      tax_included: false,
    };
    setForm((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  }

  function removeItem(tempId: string) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.tempId !== tempId),
    }));
  }

  function updateItem(tempId: string, updates: Partial<InvoiceFormItem>) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.tempId === tempId ? { ...i, ...updates } : i)),
    }));
  }

  function handleProcedureSelect(tempId: string, procedureId: string | null) {
    const procedure = procedures.find((p) => p.id === procedureId);
    if (procedure) {
      updateItem(tempId, {
        procedure_id: procedureId,
        description: procedure.procedure_name,
        unit_price_subunits: procedure.base_price_subunits,
        tax_rate_percent: procedure.tax_rate_percent ?? 16,
        tax_included: procedure.tax_included ?? false,
      });
    } else {
      updateItem(tempId, { procedure_id: null });
    }
  }

  function getCalculations() {
    const calcItems = form.items.map((item) => ({
      quantity: item.quantity,
      unitPriceSubunits: item.unit_price_subunits,
      discountAmountSubunits: item.discount_amount_subunits,
      discountPercent: item.discount_percent,
      taxRatePercent: item.tax_rate_percent,
      taxIncluded: item.tax_included,
    }));
    return calculateInvoiceTotals({ items: calcItems });
  }

  async function handleSubmit() {
    if (!form.patient_id) {
      setError("اختر المريض");
      return;
    }
    if (form.items.length === 0) {
      setError("أضف بند واحد على الأقل");
      return;
    }

    setSaving(true);
    setError(null);

    const result = await createManualInvoice({
      tenant_id: "",
      patient_id: form.patient_id,
      session_id: form.session_id,
      payment_terms: form.payment_terms,
      notes: form.notes || null,
      items: form.items.map((item) => ({
        procedure_id: item.procedure_id,
        description: item.description,
        quantity: item.quantity,
        unit_price_subunits: item.unit_price_subunits,
        discount_amount_subunits: item.discount_amount_subunits,
        discount_percent: item.discount_percent,
        discount_reason: item.discount_reason,
        tax_rate_percent: item.tax_rate_percent,
      })),
    });

    if (result.success) {
      router.push(`/invoices/${result.data.invoice_id}`);
    } else {
      setError(result.error);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">جاري التحميل...</CardContent>
      </Card>
    );
  }

  const totals = getCalculations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">فاتورة جديدة</h1>
        <Button variant="outline" onClick={() => router.push("/invoices")}>
          إلغاء
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>معلومات الفاتورة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>المريض *</Label>
              <Select value={form.patient_id} onValueChange={(v) => setForm((p) => ({ ...p, patient_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المريض" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} — {p.phone_primary}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الجلسة (اختياري)</Label>
              <Select
                value={form.session_id ?? "none"}
                onValueChange={(v) => setForm((p) => ({ ...p, session_id: v === "none" ? null : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر جلسة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون جلسة</SelectItem>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.patient?.first_name} {s.patient?.last_name} — {new Date(s.session_started_at).toLocaleDateString("ar-JO")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>شروط الدفع</Label>
              <Select
                value={form.payment_terms}
                onValueChange={(v) => setForm((p) => ({ ...p, payment_terms: v as PaymentTerms }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentTermsOptions.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="ملاحظات اختيارية"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>البنود</CardTitle>
          <Button onClick={addItem} variant="outline" size="sm">
            <Plus className="w-4 h-4 ml-2" />
            إضافة بند
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.items.length === 0 && (
            <div className="text-center text-muted-foreground py-4">لا توجد بنود. اضغط "إضافة بند"</div>
          )}

          {form.items.map((item, index) => {
            const calc = calculateLineItem({
              quantity: item.quantity,
              unitPriceSubunits: item.unit_price_subunits,
              discountAmountSubunits: item.discount_amount_subunits,
              discountPercent: item.discount_percent,
              taxRatePercent: item.tax_rate_percent,
              taxIncluded: item.tax_included,
            });

            return (
              <div key={item.tempId} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">بند #{index + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.tempId)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>الإجراء</Label>
                    <Select
                      value={item.procedure_id ?? "custom"}
                      onValueChange={(v) => handleProcedureSelect(item.tempId, v === "custom" ? null : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر إجراء" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">يدوي</SelectItem>
                        {procedures.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.procedure_name} — {formatCurrency(p.base_price_subunits)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>الوصف</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.tempId, { description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label>الكمية</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.tempId, { quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label>السعر (دينار)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={item.unit_price_subunits / 100}
                      onChange={(e) =>
                        updateItem(item.tempId, { unit_price_subunits: Math.round(parseFloat(e.target.value) * 100) })
                      }
                    />
                  </div>
                  <div>
                    <Label>خصم %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={item.discount_percent ?? ""}
                      onChange={(e) =>
                        updateItem(item.tempId, {
                          discount_percent: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>خصم مبلغ</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={item.discount_amount_subunits / 100}
                      onChange={(e) =>
                        updateItem(item.tempId, {
                          discount_amount_subunits: Math.round(parseFloat(e.target.value) * 100),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calculator className="w-4 h-4" />
                  <span>الإجمالي: {formatCurrency(calc.lineTotal)}</span>
                  <span>|</span>
                  <span>الضريبة: {formatCurrency(calc.taxAmount)}</span>
                  {calc.discountAmount > 0 && (
                    <>
                      <span>|</span>
                      <span>الخصم: {formatCurrency(calc.discountAmount)}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>المجموع الفرعي</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-red-600">
              <span>الخصم</span>
              <span>-{formatCurrency(totals.discount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>الضريبة</span>
              <span>{formatCurrency(totals.tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>الإجمالي</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSubmit} disabled={saving} size="lg">
              <Save className="w-4 h-4 ml-2" />
              {saving ? "جاري الحفظ..." : "حفظ الفاتورة"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
