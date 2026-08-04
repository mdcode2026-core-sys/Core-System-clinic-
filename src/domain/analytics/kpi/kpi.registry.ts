import type { KpiDefinition, KpiRegistry as IKpiRegistry } from "../analytics.types";

import {
  patientsTotalKpi,
  patientsNewKpi,
  patientsReturningKpi,
  patientsActiveKpi,
  patientsGrowthRateKpi,
  patientsAvgVisitsKpi,
} from "./kpi.definitions/patient.kpis";

import {
  appointmentsTotalKpi,
  appointmentsCompletedKpi,
  appointmentsCancelledKpi,
  appointmentsNoShowKpi,
  appointmentsAvgWaitingTimeKpi,
  appointmentsAvgDurationKpi,
} from "./kpi.definitions/appointment.kpis";

import {
  queueAvgWaitingTimeKpi,
  queueLongestWaitKpi,
  queueCurrentKpi,
  queueServedTodayKpi,
} from "./kpi.definitions/queue.kpis";

import {
  revenueTotalKpi,
  revenueDailyKpi,
  revenueMonthlyKpi,
  revenueAvgInvoiceKpi,
  revenueByDoctorKpi,
  revenueByProcedureKpi,
  revenueTopProceduresKpi,
} from "./kpi.definitions/revenue.kpis";

import {
  invoicesPaidKpi,
  invoicesPendingKpi,
  invoicesCancelledKpi,
  invoicesCollectionRateKpi,
} from "./kpi.definitions/invoice.kpis";

// ── NEW: Inventory KPIs ─────────────────────────────────────
import {
  stockTurnoverRateKpi,
  inventoryConsumptionRateKpi,
  lowStockRiskRateKpi,
  inventoryAdjustmentRateKpi,
  purchaseReturnRateKpi,
} from "./kpi.definitions/inventory.kpis";

// ── NEW: Follow-up KPIs ─────────────────────────────────────
import {
  followupCompletionRateKpi,
  followupResponseRateKpi,
  overdueFollowupRateKpi,
  patientRetentionRateKpi,
  avgFollowupDelayKpi,
} from "./kpi.definitions/followup.kpis";

const allKpis: KpiDefinition[] = [
  // Patients (6)
  patientsTotalKpi,
  patientsNewKpi,
  patientsReturningKpi,
  patientsActiveKpi,
  patientsGrowthRateKpi,
  patientsAvgVisitsKpi,
  // Appointments (6)
  appointmentsTotalKpi,
  appointmentsCompletedKpi,
  appointmentsCancelledKpi,
  appointmentsNoShowKpi,
  appointmentsAvgWaitingTimeKpi,
  appointmentsAvgDurationKpi,
  // Queue (4)
  queueAvgWaitingTimeKpi,
  queueLongestWaitKpi,
  queueCurrentKpi,
  queueServedTodayKpi,
  // Revenue (7)
  revenueTotalKpi,
  revenueDailyKpi,
  revenueMonthlyKpi,
  revenueAvgInvoiceKpi,
  revenueByDoctorKpi,
  revenueByProcedureKpi,
  revenueTopProceduresKpi,
  // Invoices (4)
  invoicesPaidKpi,
  invoicesPendingKpi,
  invoicesCancelledKpi,
  invoicesCollectionRateKpi,
  // Inventory (5) — NEW
  stockTurnoverRateKpi,
  inventoryConsumptionRateKpi,
  lowStockRiskRateKpi,
  inventoryAdjustmentRateKpi,
  purchaseReturnRateKpi,
  // Follow-up (5) — NEW
  followupCompletionRateKpi,
  followupResponseRateKpi,
  overdueFollowupRateKpi,
  patientRetentionRateKpi,
  avgFollowupDelayKpi,
];

export const kpiRegistry: IKpiRegistry = {
  get(id: string): KpiDefinition | undefined {
    return allKpis.find((kpi) => kpi.id === id);
  },
  getAll(): KpiDefinition[] {
    return [...allKpis];
  },
  getByCategory(category: KpiDefinition["category"]): KpiDefinition[] {
    return allKpis.filter((kpi) => kpi.category === category);
  },
};
