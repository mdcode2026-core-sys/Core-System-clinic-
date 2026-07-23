// ============================================================
// src/features/invoicing/invoice-list.tsx
// Phase 5 — Invoice List Component (Client Component)
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { FileText, Plus, Eye } from "lucide-react";
import { formatCurrency } from "../../domain/invoicing/invoicing.calculator";
import type { InvoiceListItem } from "../../domain/invoicing/invoicing.types";

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

interface InvoiceListProps {
  initialData: InvoiceListItem[];
  initialError: string | null;
}

export function InvoiceList({ initialData, initialError }: InvoiceListProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          جاري التحميل...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-red-500">
          خطأ: {error}
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            الفواتير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            لا توجد فواتير مسجلة
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={() => router.push("/invoices/new")}>
              <Plus className="w-4 h-4 ml-2" />
              فاتورة جديدة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          الفواتير
        </CardTitle>
        <Button onClick={() => router.push("/invoices/new")}>
          <Plus className="w-4 h-4 ml-2" />
          فاتورة جديدة
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-right py-3 px-4">رقم الفاتورة</th>
                <th className="text-right py-3 px-4">التاريخ</th>
                <th className="text-right py-3 px-4">المريض</th>
                <th className="text-right py-3 px-4">البنود</th>
                <th className="text-right py-3 px-4">الإجمالي</th>
                <th className="text-right py-3 px-4">المدفوع</th>
                <th className="text-right py-3 px-4">الباقي</th>
                <th className="text-right py-3 px-4">الحالة</th>
                <th className="text-right py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-mono">
                    {invoice.invoice_number ?? "—"}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(invoice.invoice_date).toLocaleDateString("ar-JO")}
                  </td>
                  <td className="py-3 px-4">{invoice.patient_name}</td>
                  <td className="py-3 px-4 text-center">{invoice.item_count}</td>
                  <td className="py-3 px-4">{formatCurrency(invoice.total_subunits)}</td>
                  <td className="py-3 px-4">{formatCurrency(invoice.amount_paid_subunits)}</td>
                  <td className="py-3 px-4">
                    {formatCurrency(invoice.amount_due_subunits ?? invoice.total_subunits - invoice.amount_paid_subunits)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={statusColors[invoice.invoice_status] ?? "bg-gray-500"}>
                      {statusLabels[invoice.invoice_status] ?? invoice.invoice_status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/invoices/${invoice.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
