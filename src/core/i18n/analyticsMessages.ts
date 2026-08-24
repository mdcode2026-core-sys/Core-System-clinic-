import type { Locale } from "./messages";

const kpiLabels = {
  ar: {
    "patients.total": "إجمالي المرضى", "patients.new": "مرضى جدد", "patients.returning": "مرضى عائدون", "patients.active": "مرضى نشطون", "patients.growth_rate": "معدل نمو المرضى", "patients.avg_visits": "متوسط الزيارات",
    "appointments.total": "إجمالي المواعيد", "appointments.completed": "مواعيد مكتملة", "appointments.cancelled": "مواعيد ملغاة", "appointments.no_show": "لم يحضر", "appointments.avg_waiting_time": "متوسط وقت الانتظار", "appointments.avg_duration": "متوسط مدة الكشف",
    "queue.avg_waiting_time": "متوسط الانتظار", "queue.longest_wait": "أطول انتظار", "queue.current": "الطابور الحالي", "queue.served_today": "تم خدمتهم اليوم",
    "revenue.total": "إجمالي الإيرادات", "revenue.daily": "إيرادات اليوم", "revenue.monthly": "إيرادات الشهر", "revenue.avg_invoice": "متوسط الفاتورة", "revenue.by_doctor": "الإيرادات حسب الطبيب", "revenue.by_procedure": "الإيرادات حسب الخدمة", "revenue.top_procedures": "أكثر الخدمات",
    "invoices.paid": "فواتير مدفوعة", "invoices.pending": "فواتير معلقة", "invoices.cancelled": "فواتير ملغاة", "invoices.collection_rate": "معدل التحصيل",
    "inventory.stock_turnover_rate": "معدل دوران المخزون", "inventory.consumption_rate": "معدل استهلاك المخزون", "inventory.low_stock_risk_rate": "معدل مخاطر نقص المخزون", "inventory.adjustment_rate": "معدل تعديلات المخزون", "inventory.purchase_return_rate": "معدل إرجاع المشتريات",
    "followup.completion_rate": "معدل إنجاز المتابعات", "followup.response_rate": "معدل استجابة المتابعات", "followup.overdue_rate": "معدل المتابعات المتأخرة", "followup.patient_retention_rate": "معدل الاحتفاظ بالمرضى", "followup.avg_delay": "متوسط تأخير المتابعة"
  },
  en: {
    "patients.total": "Total Patients", "patients.new": "New Patients", "patients.returning": "Returning Patients", "patients.active": "Active Patients", "patients.growth_rate": "Patient Growth Rate", "patients.avg_visits": "Average Visits",
    "appointments.total": "Total Appointments", "appointments.completed": "Completed Appointments", "appointments.cancelled": "Cancelled Appointments", "appointments.no_show": "No-Shows", "appointments.avg_waiting_time": "Average Waiting Time", "appointments.avg_duration": "Average Examination Duration",
    "queue.avg_waiting_time": "Average Waiting Time", "queue.longest_wait": "Longest Wait", "queue.current": "Current Queue", "queue.served_today": "Served Today",
    "revenue.total": "Total Revenue", "revenue.daily": "Daily Revenue", "revenue.monthly": "Monthly Revenue", "revenue.avg_invoice": "Average Invoice", "revenue.by_doctor": "Revenue by Doctor", "revenue.by_procedure": "Revenue by Service", "revenue.top_procedures": "Top Services",
    "invoices.paid": "Paid Invoices", "invoices.pending": "Pending Invoices", "invoices.cancelled": "Cancelled Invoices", "invoices.collection_rate": "Collection Rate",
    "inventory.stock_turnover_rate": "Stock Turnover Rate", "inventory.consumption_rate": "Inventory Consumption Rate", "inventory.low_stock_risk_rate": "Low Stock Risk Rate", "inventory.adjustment_rate": "Inventory Adjustment Rate", "inventory.purchase_return_rate": "Purchase Return Rate",
    "followup.completion_rate": "Follow-up Completion Rate", "followup.response_rate": "Follow-up Response Rate", "followup.overdue_rate": "Overdue Follow-up Rate", "followup.patient_retention_rate": "Patient Retention Rate", "followup.avg_delay": "Average Follow-up Delay"
  }
} as const;

export const analyticsMessages = {
  ar: { title: "التحليلات", loadError: "خطأ في تحميل التحليلات", noData: "لا توجد بيانات تحليلية متاحة", sections: { patients: "المرضى", appointments: "المواعيد", queue: "الطابور", revenue: "الإيرادات", invoices: "الفواتير", inventory: "المخزون", followup: "المتابعة" }, kpi: kpiLabels.ar },
  en: { title: "Analytics", loadError: "Failed to load analytics", noData: "No analytics data available", sections: { patients: "Patients", appointments: "Appointments", queue: "Queue", revenue: "Revenue", invoices: "Invoices", inventory: "Inventory", followup: "Follow-up" }, kpi: kpiLabels.en }
} as const;

export function getAnalyticsMessages(locale: Locale) { return analyticsMessages[locale]; }
