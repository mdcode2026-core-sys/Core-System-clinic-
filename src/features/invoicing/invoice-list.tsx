"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { FileText, Plus, Eye } from "lucide-react";
import { formatCurrency } from "@/domain/invoicing/invoicing.calculator";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useI18n } from "@/core/i18n/I18nProvider";
import type { InvoiceListItem } from "@/domain/invoicing/invoicing.types";
import type { Permission } from "@/core/permissions/types";

const statusColors: Record<string, string> = { draft: "bg-gray-500", issued: "bg-blue-500", paid: "bg-green-500", partial: "bg-yellow-500", cancelled: "bg-red-500", refunded: "bg-purple-500" };
interface Props { initialData: InvoiceListItem[]; initialError: string | null; permissions?: Permission[]; currency: string; }

export function InvoiceList({ initialData, initialError, permissions: serverPermissions, currency }: Props) {
  const router = useRouter();
  const { messages, invoice, locale } = useI18n();
  const { permissions: clientPermissions } = usePermissions();
  const [invoices] = useState<InvoiceListItem[]>(initialData);
  const [error] = useState<string | null>(initialError);
  const effectivePermissions = serverPermissions ?? clientPermissions;
  const canCreate = effectivePermissions.includes("invoices:create");
  const statusLabels: Record<string, string> = { draft: invoice.draft, issued: invoice.issued, paid: invoice.paid, partial: invoice.partial, cancelled: invoice.cancelled, refunded: invoice.refunded };
  const dateLocale = locale === "ar" ? "ar-u-nu-latn" : "en-u-nu-latn";

  if (error) return <Card><CardContent className="py-8 text-center text-red-500">{invoice.errorPrefix}: {error}</CardContent></Card>;
  if (invoices.length === 0) return <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />{invoice.title}</CardTitle></CardHeader><CardContent><div className="text-center py-8 text-muted-foreground">{invoice.noInvoices}</div>{canCreate && <div className="flex justify-center mt-4"><Button onClick={() => router.push("/invoices/new")}><Plus className="w-4 h-4 me-2" />{invoice.createNew}</Button></div>}</CardContent></Card>;
  return <Card dir={locale === "ar" ? "rtl" : "ltr"}><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />{invoice.title}</CardTitle>{canCreate && <Button onClick={() => router.push("/invoices/new")}><Plus className="w-4 h-4 me-2" />{invoice.createNew}</Button>}</CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-start py-3 px-4">{invoice.invoiceNumber}</th><th className="text-start py-3 px-4">{invoice.date}</th><th className="text-start py-3 px-4">{invoice.patientColumn}</th><th className="text-start py-3 px-4">{invoice.itemsColumn}</th><th className="text-start py-3 px-4">{invoice.totalColumn}</th><th className="text-start py-3 px-4">{invoice.paidColumn}</th><th className="text-start py-3 px-4">{invoice.remainingColumn}</th><th className="text-start py-3 px-4">{invoice.status}</th><th className="py-3 px-4" aria-label={messages.common.actions}>{messages.common.actions}</th></tr></thead><tbody>{invoices.map((item) => <tr key={item.id} className="border-b hover:bg-muted/50"><td className="py-3 px-4 font-mono">{item.invoice_number ?? "—"}</td><td className="py-3 px-4">{new Date(item.invoice_date).toLocaleDateString(dateLocale)}</td><td className="py-3 px-4">{item.patient_name}</td><td className="py-3 px-4 text-center">{item.item_count}</td><td className="py-3 px-4">{formatCurrency(item.total_subunits, currency, locale)}</td><td className="py-3 px-4">{formatCurrency(item.amount_paid_subunits, currency, locale)}</td><td className="py-3 px-4">{formatCurrency(item.amount_due_subunits ?? item.total_subunits - item.amount_paid_subunits, currency, locale)}</td><td className="py-3 px-4"><Badge className={statusColors[item.invoice_status] ?? "bg-gray-500"}>{statusLabels[item.invoice_status] ?? item.invoice_status}</Badge></td><td className="py-3 px-4"><Button variant="ghost" size="sm" onClick={() => router.push(`/invoices/${item.id}`)} aria-label={invoice.view}><Eye className="w-4 h-4" /></Button></td></tr>)}</tbody></table></div></CardContent></Card>;
}
