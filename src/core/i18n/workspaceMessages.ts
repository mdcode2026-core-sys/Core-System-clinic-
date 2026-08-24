import type { Locale } from "./messages";

export const workspaceMessages = {
  ar: {
    layerQuickActions: "إجراءات سريعة", layerStatusAnalytics: "الحالة والتحليلات", noWidgets: "لا توجد أدوات متاحة", contactAdmin: "اتصل بالمسؤول لتمكين الوحدات", widgetError: "حدث خطأ غير متوقع", retry: "إعادة المحاولة", collapsed: "مطوي", expand: "توسيع", collapse: "طي", unpin: "إلغاء التثبيت", pin: "تثبيت", show: "إظهار", hide: "إخفاء",
    quickRegistration: { clinicNotSelected: "لم يتم تحديد العيادة", required: "الاسم ورقم الهاتف مطلوبان", success: "تم تسجيل المريض بنجاح", successShort: "تم التسجيل بنجاح", failure: "فشل تسجيل المريض", fullName: "الاسم الكامل *", fullNamePlaceholder: "اسم المريض", phone: "رقم الهاتف *", phonePlaceholder: "رقم الهاتف", gender: "الجنس", male: "ذكر", female: "أنثى", dateOfBirth: "تاريخ الميلاد", submitting: "جاري التسجيل...", submit: "تسجيل المريض" },
    quickAppointment: { clinicNotSelected: "لم يتم تحديد العيادة أو المستخدم", required: "المريض والطبيب ووقت البدء مطلوبون", success: "تم إنشاء الموعد بنجاح", successShort: "تم إنشاء الموعد بنجاح", failure: "فشل إنشاء الموعد", patient: "المريض (ID) *", patientPlaceholder: "معرف المريض", doctor: "الطبيب *", chooseDoctor: "اختر طبيباً", room: "الغرفة", chooseRoom: "اختر غرفة", procedure: "الإجراء", chooseProcedure: "اختر إجراءً", start: "وقت البدء *", end: "وقت الانتهاء", notes: "ملاحظات", notesPlaceholder: "ملاحظات إضافية...", saving: "جاري الحفظ...", submit: "إنشاء الموعد" },
    billing: { collectedRevenue: "الإيرادات المحصّلة", paidInvoices: "فواتير مدفوعة", outstanding: "مستحق", period: "الفترة", thisMonth: "هذا الشهر", loadFailed: "فشل تحميل بيانات الفواتير", noData: "لا توجد بيانات فوترة" },
  },
  en: {
    layerQuickActions: "Quick Actions", layerStatusAnalytics: "Status & Analytics", noWidgets: "No widgets are available", contactAdmin: "Contact an administrator to enable modules", widgetError: "An unexpected error occurred", retry: "Retry", collapsed: "Collapsed", expand: "Expand", collapse: "Collapse", unpin: "Unpin", pin: "Pin", show: "Show", hide: "Hide",
    quickRegistration: { clinicNotSelected: "No clinic is selected", required: "Full name and phone number are required", success: "Patient registered successfully", successShort: "Registration successful", failure: "Patient registration failed", fullName: "Full name *", fullNamePlaceholder: "Patient name", phone: "Phone number *", phonePlaceholder: "Phone number", gender: "Gender", male: "Male", female: "Female", dateOfBirth: "Date of birth", submitting: "Registering...", submit: "Register patient" },
    quickAppointment: { clinicNotSelected: "No clinic or user is selected", required: "Patient, doctor and start time are required", success: "Appointment created successfully", successShort: "Appointment created successfully", failure: "Appointment creation failed", patient: "Patient (ID) *", patientPlaceholder: "Patient ID", doctor: "Doctor *", chooseDoctor: "Choose a doctor", room: "Room", chooseRoom: "Choose a room", procedure: "Procedure", chooseProcedure: "Choose a procedure", start: "Start time *", end: "End time", notes: "Notes", notesPlaceholder: "Additional notes...", saving: "Saving...", submit: "Create appointment" },
    billing: { collectedRevenue: "Collected revenue", paidInvoices: "Paid invoices", outstanding: "Outstanding", period: "Period", thisMonth: "This month", loadFailed: "Failed to load billing data", noData: "No billing data" },
  },
} as const satisfies Record<Locale, object>;

export function getWorkspaceMessages(locale: Locale) { return workspaceMessages[locale]; }
