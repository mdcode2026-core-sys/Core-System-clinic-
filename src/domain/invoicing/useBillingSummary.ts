"use client";

// src/domain/invoicing/useBillingSummary.ts
// Client-side wrapper composing three EXISTING, already-documented report
// queries (see ARCHITECTURE_DECISIONS.md — Reports module catalog,
// "Billing: Revenue Summary, Paid Invoices, Outstanding Invoices") into a
// single hook for the Workspace Billing widget.
//
// No new aggregation logic is introduced here — each number comes directly
// from src/domain/reports/reports.queries.ts, which already implements and
// documents exactly these three calculations.

import { useQuery } from "@tanstack/react-query";
import {
  getRevenueSummary,
  getPaidInvoices,
  getOutstandingInvoices,
} from "@/domain/reports/reports.queries";

export interface BillingSummary {
  totalRevenue: number; // subunits, this month, from getRevenueSummary
  paidInvoicesCount: number; // this month, from getPaidInvoices
  outstandingCount: number; // from getOutstandingInvoices
  outstandingAmount: number; // subunits, from getOutstandingInvoices
  periodLabel: string;
}

function getThisMonthRange(): { start: string; end: string; label: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end), label: "هذا الشهر" };
}

export function useBillingSummary(tenantId: string | null) {
  return useQuery<BillingSummary>({
    queryKey: ["billing", "summary", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { start, end, label } = getThisMonthRange();

      const [revenue, paid, outstanding] = await Promise.all([
        getRevenueSummary(start, end),
        getPaidInvoices(start, end),
        getOutstandingInvoices(),
      ]);

      return {
        totalRevenue: Number(revenue.rows[0]?.revenue_subunits ?? 0),
        paidInvoicesCount: Number(paid.rows[0]?.paid_invoices ?? 0),
        outstandingCount: Number(outstanding.rows[0]?.count ?? 0),
        outstandingAmount: Number(outstanding.rows[0]?.amount_due_subunits ?? 0),
        periodLabel: label,
      };
    },
  });
}
