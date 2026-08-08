"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";

export function useInvoiceSummary(tenantId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["invoice-summary", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinic_invoices")
        .select(
          "total_subunits, amount_due_subunits, invoice_status"
        )
        .eq("tenant_id", tenantId);

      if (error) throw error;

      const invoices = data ?? [];

      const totalRevenue = invoices.reduce(
        (sum, invoice) => sum + (invoice.total_subunits ?? 0),
        0
      );

      const pendingAmount = invoices.reduce(
        (sum, invoice) => sum + (invoice.amount_due_subunits ?? 0),
        0
      );

      const averageInvoice =
        invoices.length > 0
          ? Math.round(totalRevenue / invoices.length)
          : 0;

      return {
        total_revenue: totalRevenue,
        total_invoices: invoices.length,
        pending_amount: pendingAmount,
        average_invoice: averageInvoice,
        period: "الإجمالي",
      };
    },
    enabled: !!tenantId,
  });
}
