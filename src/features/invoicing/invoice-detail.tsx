"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { ArrowLeft, Printer, CreditCard, Ban, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/domain/invoicing/invoicing.calculator";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useI18n } from "@/core/i18n/I18nProvider";
import type { InvoiceWithItems, PaymentMethod } from "@/domain/invoicing/invoicing.types";

interface Props { invoice: InvoiceWithItems; currency: string; }
const statusColors: Record<string, string> = { draft: "bg-gray-500", issued: "bg-blue-500", paid: "bg-green-500", partial: "bg-yellow-500", cancelled: "bg-red-500", refunded: "bg-purple-500" };

export function InvoiceDetail({ invoice, currency }: Props) {
  const router = useRouter();
  const { invoice: t, locale } = useI18n();
  const { hasPermission, isLoading: permLoading } = usePermissions();
  const [showPayment, setShowPayment] = useState(false); const [showCancel, setShowCancel] = useState(false); const [showRefund, setShowRefund] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(""); const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash"); const [paymentRef, setPaymentRef] = useState(""); const [paymentNotes, setPaymentNotes] = useState(""); const [cancelReason, setCancelReason] = useState(""); const [refundReason, setRefundReason] = useState("");
  const [loading, setLoading] = useState(false); const [permError, setPermError] = useState<string | null>(null);
  const remaining = invoice.total_subunits - invoice.amount_paid_subunits;
  const canUpdate = !permLoading && hasPermission("invoices:update");
  const statusLabels: Record<string, string> = { draft: t.draft, issued: t.issued, paid: t.paid, partial: t.partial, cancelled: t.cancelled, refunded: t.refunded };
  const dateLocale = locale === "ar" ? "ar-u-nu-latn" : "en-u-nu-latn";
  const money = (value: number) => formatCurrency(value, currency, locale);
  async function handleRecordPayment() { if (!canUpdate) { setPermError(t.paymentPermission); return; } }
  async function handleCancel() { if (!canUpdate) { setPermError(t.cancelPermission); return; } }
  async function handleRefund() { if (!canUpdate) { setPermError(t.refundPermission); return; } }

  return <div className="space-y-6 p-6" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="flex items-center justify-between"><Button variant="outline" onClick={() => router.push("/invoices")}><ArrowLeft className="w-4 h-4 me-2" />{t.back}</Button><div className="flex gap-2"><Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 me-2" />{t.print}</Button></div></div>
    {permError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{permError}</div>}
    <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle className="text-2xl">{t.title} #{invoice.invoice_number ?? invoice.id.slice(0, 8)}</CardTitle><p className="text-muted-foreground text-sm mt-1">{new Date(invoice.invoice_date).toLocaleDateString(dateLocale)}</p></div><Badge className={statusColors[invoice.invoice_status] ?? "bg-gray-500"}>{statusLabels[invoice.invoice_status] ?? invoice.invoice_status}</Badge></CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4"><div><Label className="text-muted-foreground">{t.patient}</Label><p className="font-medium">{invoice.patient?.first_name} {invoice.patient?.last_name}</p><p className="text-sm text-muted-foreground">{invoice.patient?.phone_primary}</p></div>{invoice.session && <div><Label className="text-muted-foreground">{t.session}</Label><p className="font-medium">{invoice.session.session_status}</p><p className="text-sm text-muted-foreground">{invoice.session.session_started_at ? new Date(invoice.session.session_started_at).toLocaleDateString(dateLocale) : "—"}</p></div>}</div>
        <Separator />
        <div><h3 className="font-medium mb-3">{t.items}</h3><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-start py-2">{t.item}</th><th className="text-start py-2">{t.quantity}</th><th className="text-start py-2">{t.price}</th><th className="text-start py-2">{t.total}</th></tr></thead><tbody>{invoice.items.map((item) => <tr key={item.id} className="border-b"><td className="py-2">{item.description ?? item.procedure_id ?? "—"}</td><td className="py-2">{item.quantity}</td><td className="py-2">{money(item.unit_price_subunits)}</td><td className="py-2">{money(item.line_total_subunits)}</td></tr>)}</tbody></table></div>
        <Separator />
        <div className="space-y-2"><div className="flex justify-between text-sm"><span>{t.subtotal}</span><span>{money(invoice.subtotal_subunits)}</span></div>{invoice.discount_subunits > 0 && <div className="flex justify-between text-sm text-red-600"><span>{t.discount}</span><span>-{money(invoice.discount_subunits)}</span></div>}<div className="flex justify-between text-sm"><span>{t.tax}</span><span>{money(invoice.tax_subunits)}</span></div><div className="flex justify-between text-xl font-bold border-t pt-2"><span>{t.total}</span><span>{money(invoice.total_subunits)}</span></div><div className="flex justify-between text-sm text-green-600"><span>{t.paid}</span><span>{money(invoice.amount_paid_subunits)}</span></div>{remaining > 0 && <div className="flex justify-between text-sm font-medium"><span>{t.remaining}</span><span>{money(remaining)}</span></div>}</div>
        <div className="flex flex-wrap gap-2 pt-4">{invoice.invoice_status === "draft" && canUpdate && <Button onClick={() => {}}>{t.issue}</Button>}{(invoice.invoice_status === "issued" || invoice.invoice_status === "partial") && remaining > 0 && canUpdate && <Button variant="outline" onClick={() => setShowPayment(true)}><CreditCard className="w-4 h-4 me-2" />{t.recordPayment}</Button>}{(invoice.invoice_status === "draft" || invoice.invoice_status === "issued") && canUpdate && <Button variant="destructive" onClick={() => setShowCancel(true)}><Ban className="w-4 h-4 me-2" />{t.cancelInvoice}</Button>}{(invoice.invoice_status === "paid" || invoice.invoice_status === "partial") && canUpdate && <Button variant="outline" onClick={() => setShowRefund(true)}><RotateCcw className="w-4 h-4 me-2" />{t.refund}</Button>}</div>
        {showPayment && canUpdate && remaining > 0 && <Card className="mt-4"><CardHeader><CardTitle className="text-lg">{t.paymentTitle}</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>{t.amountJod}</Label><Input type="number" step="0.01" max={remaining / 100} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder={t.maxAmount.replace("{amount}", (remaining / 100).toFixed(2))} /></div><div><Label>{t.paymentMethod}</Label><select className="w-full border rounded-md p-2" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}><option value="cash">{t.cash}</option><option value="credit_card">{t.creditCard}</option><option value="bank_transfer">{t.bankTransfer}</option><option value="insurance">{t.insurance}</option><option value="other">{t.other}</option></select></div><div><Label>{t.reference}</Label><Input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} /></div><div><Label>{t.notesOptional}</Label><Input value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} /></div><div className="flex gap-2"><Button onClick={handleRecordPayment} disabled={loading}>{loading ? t.loading : t.confirmPayment}</Button><Button variant="outline" onClick={() => setShowPayment(false)}>{t.cancelInvoice}</Button></div></CardContent></Card>}
        {showCancel && canUpdate && <Card className="mt-4"><CardHeader><CardTitle className="text-lg text-red-600">{t.cancelInvoice}</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>{t.cancelReason}</Label><Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder={t.cancelPlaceholder} /></div><div className="flex gap-2"><Button variant="destructive" onClick={handleCancel} disabled={loading || !cancelReason.trim()}>{loading ? t.loading : t.confirmCancel}</Button><Button variant="outline" onClick={() => setShowCancel(false)}>{t.backOut}</Button></div></CardContent></Card>}
        {showRefund && canUpdate && <Card className="mt-4"><CardHeader><CardTitle className="text-lg text-purple-600">{t.refundTitle}</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>{t.refundReason}</Label><Input value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder={t.refundPlaceholder} /></div><div className="flex gap-2"><Button variant="destructive" onClick={handleRefund} disabled={loading || !refundReason.trim()}>{loading ? t.loading : t.confirmRefund}</Button><Button variant="outline" onClick={() => setShowRefund(false)}>{t.backOut}</Button></div></CardContent></Card>}
      </CardContent>
    </Card>
  </div>;
}
