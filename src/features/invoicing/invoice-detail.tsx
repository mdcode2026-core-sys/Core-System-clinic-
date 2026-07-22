// ============================================================
// src/features/invoicing/invoice-detail.tsx
// Phase 5 — Invoice Detail Component
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { FileText, Printer, CreditCard, Ban, ArrowLeft, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/domain/invoicing/invoicing.calculator";
import { issueInvoice, recordPayment, cancelInvoice } from "@/domain/invoicing/invoicing.actions";
import type { InvoiceWithItems, PaymentMethod } from "@/domain/invoicing/invoicing.types";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  issued: "bg-blue-500",
  paid: "bg-green-500",
  partial: "bg-yellow-500",
  cancelled: "bg-red-500",
  refunded: "bg-purple-500",
};

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  issued: "مصدرة",
  paid: "مدفوعة",
  partial: "جزئية",
  cancelled: "ملغاة",
  refunded: "مستردة",
};

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "نقدي" },
  { value: "credit_card", label: "بطاقة ائتمان" },
  { value: "bank_transfer", label: "تحويل بنكي" },
  { value: "insurance", label: "تأمين" },
  { value: "other", label: "أخرى" },
];

interface InvoiceDetailProps {
  invoice: InvoiceWithItems;
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const remaining = invoice.total_subunits - invoice.amount_paid_subunits;

  async function handleIssue() {
    setLoading(true);
    setError(null);
    const result = await issueInvoice({ invoice_id: invoice.id });
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
    router.refresh();
  }

  async function handlePayment() {
    setLoading(true);
    setError(null);
    const amount = Math.round(parseFloat(paymentAmount) * 100);
    if (isNaN(amount) || amount <= 0) {
      setError("المبلغ غير صالح");
      setLoading(false);
      return;
    }
    if (amount > remaining) {
      setError("المبلغ أكبر من الباقي");
      setLoading(false);
      return;
    }
    const result = await recordPayment({
      invoice_id: invoice.id,
      amount_subunits: amount,
      payment_method: paymentMethod,
      reference_number: paymentRef || null,
      notes: paymentNotes || null,
    });
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
    setPaymentAmount("");
    router.refresh();
  }

  async function handleCancel() {
    setLoading(true);
    setError(null);
    if (!cancelReason.trim()) {
      setError("سبب الإلغاء مطلوب");
      setLoading(false);
      return;
    }
    const result = await cancelInvoice({
      invoice_id: invoice.id,
      reason: cancelReason,
    });
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/invoices")}>
          <ArrowLeft className="w-4 h-4 ml-2" />
          رجوع
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 ml-2" />
            طباعة
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6" />
              فاتورة {invoice.invoice_number ?? "مسودة"}
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              {new Date(invoice.invoice_date).toLocaleDateString("ar-JO")}
            </p>
          </div>
          <Badge className={statusColors[invoice.invoice_status] ?? "bg-gray-500"}>
            {statusLabels[invoice.invoice_status] ?? invoice.invoice_status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">المريض</p>
              <p className="font-medium">
                {invoice.patient?.first_name} {invoice.patient?.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الهاتف</p>
              <p className="font-medium">{invoice.patient?.phone_primary ?? "—"}</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="font-semibold mb-3">البنود</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2">#</th>
                  <th className="text-right py-2">الوصف</th>
                  <th className="text-right py-2">الكمية</th>
                  <th className="text-right py-2">السعر</th>
                  <th className="text-right py-2">الخصم</th>
                  <th className="text-right py-2">الضريبة</th>
                  <th className="text-right py-2">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2">{item.description ?? "—"}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">{formatCurrency(item.unit_price_subunits)}</td>
                    <td className="py-2">
                      {item.discount_amount_subunits > 0
                        ? formatCurrency(item.discount_amount_subunits)
                        : "—"}
                    </td>
                    <td className="py-2">{formatCurrency(item.tax_amount_subunits)}</td>
                    <td className="py-2 font-medium">{formatCurrency(item.line_total_subunits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>المجموع الفرعي</span>
              <span>{formatCurrency(invoice.subtotal_subunits)}</span>
            </div>
            {invoice.discount_subunits > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>الخصم</span>
                <span>-{formatCurrency(invoice.discount_subunits)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>الضريبة</span>
              <span>{formatCurrency(invoice.tax_subunits)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>الإجمالي</span>
              <span>{formatCurrency(invoice.total_subunits)}</span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span>المدفوع</span>
              <span>{formatCurrency(invoice.amount_paid_subunits)}</span>
            </div>
            {remaining > 0 && (
              <div className="flex justify-between text-sm font-medium text-yellow-600">
                <span>الباقي</span>
                <span>{formatCurrency(remaining)}</span>
              </div>
            )}
          </div>

          {/* Payments History */}
          {invoice.payments.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">سجل المدفوعات</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-2">التاريخ</th>
                    <th className="text-right py-2">المبلغ</th>
                    <th className="text-right py-2">الطريقة</th>
                    <th className="text-right py-2">المرجع</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((payment) => (
                    <tr key={payment.id} className="border-b">
                      <td className="py-2">
                        {new Date(payment.paid_at).toLocaleDateString("ar-JO")}
                      </td>
                      <td className="py-2 font-medium">{formatCurrency(payment.amount_subunits)}</td>
                      <td className="py-2">
                        {paymentMethods.find(m => m.value === payment.payment_method)?.label ?? payment.payment_method}
                      </td>
                      <td className="py-2">{payment.reference_number ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            {invoice.invoice_status === "draft" && (
              <Button onClick={handleIssue} disabled={loading}>
                <CheckCircle className="w-4 h-4 ml-2" />
                إصدار الفاتورة
              </Button>
            )}

            {(invoice.invoice_status === "issued" || invoice.invoice_status === "partial") && remaining > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <CreditCard className="w-4 h-4 ml-2" />
                    تسجيل دفعة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>تسجيل دفعة</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>المبلغ (دينار)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder={`الحد الأقصى: ${(remaining / 100).toFixed(2)}`}
                      />
                    </div>
                    <div>
                      <Label>طريقة الدفع</Label>
                      <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>رقم المرجع (اختياري)</Label>
                      <Input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
                    </div>
                    <div>
                      <Label>ملاحظات (اختياري)</Label>
                      <Input value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} />
                    </div>
                    <Button onClick={handlePayment} disabled={loading} className="w-full">
                      تأكيد الدفعة
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {(invoice.invoice_status === "draft" || invoice.invoice_status === "issued") && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" disabled={loading}>
                    <Ban className="w-4 h-4 ml-2" />
                    إلغاء الفاتورة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إلغاء الفاتورة</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>سبب الإلغاء *</Label>
                      <Input
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="أدخل سبب الإلغاء"
                      />
                    </div>
                    <Button onClick={handleCancel} disabled={loading} variant="destructive" className="w-full">
                      تأكيد الإلغاء
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
