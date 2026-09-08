import type { Locale } from "./messages";

const kpiLabels = {
  ar: {
    "patients.total": "إجمالي المرضى", "patients.new": "مرضى جدد", "patients.returning": "مرضى عائدون", "patients.active": "مرضى نشطون", "patients.growth_rate": "معدل نمو المرضى الجدد", "patients.avg_visits": "متوسط الزيارات لكل مريض",
    "appointments.total": "إجمالي المواعيد", "appointments.completed": "مواعيد مكتملة", "appointments.cancelled": "مواعيد ملغاة", "appointments.no_show": "لم يحضر", "appointments.attendance_rate": "نسبة الحضور", "appointments.avg_waiting_time": "متوسط وقت الانتظار", "appointments.avg_duration": "متوسط مدة الجلسة",
    "queue.avg_waiting_time": "متوسط الانتظار", "queue.longest_wait": "أطول انتظار", "queue.current": "الطابور الحالي", "queue.served_today": "تم خدمتهم ضمن الفترة",
    "revenue.total": "إجمالي الفوترة", "revenue.daily": "المحصل ضمن الفترة", "revenue.monthly": "المبالغ المستردة", "revenue.avg_invoice": "صافي المحصل", "revenue.by_doctor": "إجمالي الفوترة حسب الطبيب", "revenue.by_procedure": "إجمالي الفوترة حسب الخدمة", "revenue.top_procedures": "أكثر الخدمات من حيث الفوترة", "revenue.collected": "المحصل", "revenue.refunded": "المسترد", "revenue.net_collected": "صافي المحصل",
    "invoices.paid": "فواتير مدفوعة", "invoices.pending": "فواتير قائمة/جزئية", "invoices.cancelled": "فواتير ملغاة", "invoices.collection_rate": "معدل التحصيل",
    "inventory.stock_turnover_rate": "معدل دوران المخزون", "inventory.consumption_rate": "معدل استهلاك المخزون", "inventory.low_stock_risk_rate": "معدل مخاطر نقص المخزون", "inventory.adjustment_rate": "معدل تعديلات المخزون", "inventory.purchase_return_rate": "معدل إرجاع المشتريات",
    "followup.completion_rate": "معدل إنجاز المتابعات", "followup.response_rate": "معدل استجابة المتابعات", "followup.overdue_rate": "معدل المتابعات المتأخرة", "followup.patient_retention_rate": "معدل الاحتفاظ بالمرضى", "followup.avg_delay": "متوسط تأخير المتابعة"
  },
  en: {
    "patients.total": "Total Patients", "patients.new": "New Patients", "patients.returning": "Returning Patients", "patients.active": "Active Patients", "patients.growth_rate": "New Patient Growth Rate", "patients.avg_visits": "Average Visits per Patient",
    "appointments.total": "Total Appointments", "appointments.completed": "Completed Appointments", "appointments.cancelled": "Cancelled Appointments", "appointments.no_show": "No-Shows", "appointments.attendance_rate": "Attendance Rate", "appointments.avg_waiting_time": "Average Waiting Time", "appointments.avg_duration": "Average Session Duration",
    "queue.avg_waiting_time": "Average Waiting Time", "queue.longest_wait": "Longest Wait", "queue.current": "Current Queue", "queue.served_today": "Served in Period",
    "revenue.total": "Gross Invoiced", "revenue.daily": "Collected in Period", "revenue.monthly": "Refunded in Period", "revenue.avg_invoice": "Net Collected", "revenue.by_doctor": "Gross Invoiced by Doctor", "revenue.by_procedure": "Gross Invoiced by Service", "revenue.top_procedures": "Top Services by Invoicing", "revenue.collected": "Collected", "revenue.refunded": "Refunded", "revenue.net_collected": "Net Collected",
    "invoices.paid": "Paid Invoices", "invoices.pending": "Issued/Partial Invoices", "invoices.cancelled": "Cancelled Invoices", "invoices.collection_rate": "Collection Rate",
    "inventory.stock_turnover_rate": "Stock Turnover Rate", "inventory.consumption_rate": "Inventory Consumption Rate", "inventory.low_stock_risk_rate": "Low Stock Risk Rate", "inventory.adjustment_rate": "Inventory Adjustment Rate", "inventory.purchase_return_rate": "Purchase Return Rate",
    "followup.completion_rate": "Follow-up Completion Rate", "followup.response_rate": "Follow-up Response Rate", "followup.overdue_rate": "Overdue Follow-up Rate", "followup.patient_retention_rate": "Patient Retention Rate", "followup.avg_delay": "Average Follow-up Delay"
  }
} as const;

const kpiUnits = {
  ar: { "followup.avg_delay": "ساعة" },
  en: { "followup.avg_delay": "hours" },
} as const;

export const analyticsMessages = {
  ar: { title: "التحليلات", loadError: "خطأ في تحميل التحليلات", noData: "لا توجد بيانات تحليلية متاحة", sections: { patients: "المرضى", appointments: "المواعيد", queue: "الطابور", revenue: "التحصيل والفوترة", invoices: "الفواتير", inventory: "المخزون", followup: "المتابعة" }, kpi: kpiLabels.ar, unit: kpiUnits.ar },
  en: { title: "Analytics", loadError: "Failed to load analytics", noData: "No analytics data available", sections: { patients: "Patients", appointments: "Appointments", queue: "Queue", revenue: "Billing & Collections", invoices: "Invoices", inventory: "Inventory", followup: "Follow-up" }, kpi: kpiLabels.en, unit: kpiUnits.en }
} as const;

export function getAnalyticsMessages(locale: Locale) { return analyticsMessages[locale]; }
export function getAnalyticsKpiLabel(locale: Locale, id: string) { return analyticsMessages[locale].kpi[id as keyof typeof analyticsMessages.en.kpi] ?? id; }
export function getAnalyticsKpiUnit(locale: Locale, id: string) { return analyticsMessages[locale].unit[id as keyof typeof analyticsMessages.en.unit] ?? ""; }
