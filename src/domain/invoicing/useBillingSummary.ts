"use client";

// Client-side wrapper composing the documented billing report queries.
import { useQuery } from "@tanstack/react-query";
import { getRevenueSummary, getPaidInvoices, getOutstandingInvoices } from "@/domain/reports/reports.queries";

export interface BillingSummary {
  totalRevenue: number;
  paidInvoicesCount: number;
  outstandingCount: number;
  outstandingAmount: number;
  periodKey: "thisMonth";
}

function getThisMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end) };
}

export function useBillingSummary(tenantId: string | null) {
  return useQuery<BillingSummary>({
    queryKey: ["billing", "summary", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { start, end } = getThisMonthRange();
      const [revenue, paid, outstanding] = await Promise.all([getRevenueSummary(start, end), getPaidInvoices(start, end), getOutstandingInvoices()]);
      return {
        totalRevenue: Number(revenue.rows[0]?.revenue_subunits ?? 0),
        paidInvoicesCount: Number(paid.rows[0]?.paid_invoices ?? 0),
        outstandingCount: Number(outstanding.rows[0]?.count ?? 0),
        outstandingAmount: Number(outstanding.rows[0]?.amount_due_subunits ?? 0),
        periodKey: "thisMonth",
      };
    },
  });
}
