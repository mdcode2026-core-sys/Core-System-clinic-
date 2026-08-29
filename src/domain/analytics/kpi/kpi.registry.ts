import type { KpiDefinition, KpiRegistry as IKpiRegistry } from "../analytics.types";
import { patientsTotalKpi, patientsNewKpi, patientsReturningKpi, patientsActiveKpi, patientsGrowthRateKpi, patientsAvgVisitsKpi } from "./kpi.definitions/patient.kpis";
import { appointmentsTotalKpi, appointmentsCompletedKpi, appointmentsCancelledKpi, appointmentsNoShowKpi, appointmentsAvgWaitingTimeKpi, appointmentsAvgDurationKpi } from "./kpi.definitions/appointment.kpis";
import { queueAvgWaitingTimeKpi, queueLongestWaitKpi, queueCurrentKpi, queueServedTodayKpi } from "./kpi.definitions/queue.kpis";
import { revenueTotalKpi, revenueDailyKpi, revenueMonthlyKpi, revenueAvgInvoiceKpi, revenueByDoctorKpi, revenueByProcedureKpi, revenueTopProceduresKpi } from "./kpi.definitions/revenue.kpis";
import { invoicesPaidKpi, invoicesPendingKpi, invoicesCancelledKpi, invoicesCollectionRateKpi } from "./kpi.definitions/invoice.kpis";
import { stockTurnoverRateKpi, inventoryConsumptionRateKpi, lowStockRiskRateKpi, inventoryAdjustmentRateKpi, purchaseReturnRateKpi } from "./kpi.definitions/inventory.kpis";
import { followupCompletionRateKpi, followupResponseRateKpi, overdueFollowupRateKpi, patientRetentionRateKpi, avgFollowupDelayKpi } from "./kpi.definitions/followup.kpis";
import { workforceEmployeesKpi, workforceAttendanceKpi, communicationsMessagesKpi, communicationsRequestsKpi, coordinationOpenWorkKpi, coordinationCompletedWorkKpi } from "./kpi.definitions/ajm.kpis";

const allKpis: KpiDefinition[] = [
  patientsTotalKpi, patientsNewKpi, patientsReturningKpi, patientsActiveKpi, patientsGrowthRateKpi, patientsAvgVisitsKpi,
  appointmentsTotalKpi, appointmentsCompletedKpi, appointmentsCancelledKpi, appointmentsNoShowKpi, appointmentsAvgWaitingTimeKpi, appointmentsAvgDurationKpi,
  queueAvgWaitingTimeKpi, queueLongestWaitKpi, queueCurrentKpi, queueServedTodayKpi,
  revenueTotalKpi, revenueDailyKpi, revenueMonthlyKpi, revenueAvgInvoiceKpi, revenueByDoctorKpi, revenueByProcedureKpi, revenueTopProceduresKpi,
  invoicesPaidKpi, invoicesPendingKpi, invoicesCancelledKpi, invoicesCollectionRateKpi,
  stockTurnoverRateKpi, inventoryConsumptionRateKpi, lowStockRiskRateKpi, inventoryAdjustmentRateKpi, purchaseReturnRateKpi,
  followupCompletionRateKpi, followupResponseRateKpi, overdueFollowupRateKpi, patientRetentionRateKpi, avgFollowupDelayKpi,
  workforceEmployeesKpi, workforceAttendanceKpi, communicationsMessagesKpi, communicationsRequestsKpi, coordinationOpenWorkKpi, coordinationCompletedWorkKpi,
];

export const kpiRegistry: IKpiRegistry = {
  get(id: string): KpiDefinition | undefined { return allKpis.find((kpi) => kpi.id === id); },
  getAll(): KpiDefinition[] { return [...allKpis]; },
  getByCategory(category: KpiDefinition["category"]): KpiDefinition[] { return allKpis.filter((kpi) => kpi.category === category); },
};
