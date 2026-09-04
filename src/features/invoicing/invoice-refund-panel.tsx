"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useI18n } from "@/core/i18n/I18nProvider";
import { refundInvoicePayment } from "@/domain/invoicing/refund.actions";

export function InvoiceRefundPanel({ invoiceId, maxRefundSubunits }: { invoiceId: string; maxRefundSubunits: number }) {
 const router=useRouter(); const {invoice:t,locale}=useI18n(); const {hasPermission,isLoading}=usePermissions();
 const [open,setOpen]=useState(false),[amount,setAmount]=useState(""),[reason,setReason]=useState(""),[method,setMethod]=useState("cash"),[reference,setReference]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null);
 if(isLoading||!hasPermission("invoices:refund")||maxRefundSubunits<=0)return null;
 async function submit(){const value=Math.round(Number(amount)*100);if(!Number.isInteger(value)||value<=0||value>maxRefundSubunits)return setError(t.refundPermission);if(!reason.trim())return setError(t.refundReason);setBusy(true);setError(null);const r=await refundInvoicePayment({invoice_id:invoiceId,amount_subunits:value,refund_method:method as "cash"|"card"|"bank_transfer"|"online"|"other",reason:reason.trim(),reference:reference||null});setBusy(false);if(!r.success)return setError(r.error);setOpen(false);setAmount("");setReason("");setReference("");router.refresh();}
 return <Card dir={locale==="ar"?"rtl":"ltr"}><CardHeader><CardTitle>{t.refundTitle}</CardTitle></CardHeader><CardContent>{!open?<Button variant="outline" onClick={()=>setOpen(true)}>{t.refund}</Button>:<div className="space-y-4">{error&&<div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}<div><Label>{t.amountJod}</Label><Input type="number" min="0.01" step="0.01" max={maxRefundSubunits/100} value={amount} onChange={e=>setAmount(e.target.value)}/></div><div><Label>{t.paymentMethod}</Label><select className="w-full rounded-md border p-2" value={method} onChange={e=>setMethod(e.target.value)}><option value="cash">{t.cash}</option><option value="card">{t.creditCard}</option><option value="bank_transfer">{t.bankTransfer}</option><option value="online">{t.online}</option><option value="other">{t.other}</option></select></div><div><Label>{t.refundReason}</Label><Input value={reason} onChange={e=>setReason(e.target.value)} placeholder={t.refundPlaceholder}/></div><div><Label>{t.reference}</Label><Input value={reference} onChange={e=>setReference(e.target.value)}/></div><div className="flex gap-2"><Button onClick={submit} disabled={busy}>{busy?t.loading:t.confirmRefund}</Button><Button variant="outline" onClick={()=>setOpen(false)}>{t.backOut}</Button></div></div>}</CardContent></Card>;
}
