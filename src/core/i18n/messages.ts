export type Locale = "ar" | "en";

export const messages = {
  ar: {
    nav: { dashboard:"لوحة التحكم", operation:"مساحة التشغيل", clinical:"المساحة الطبية", treatmentPlans:"خطط العلاج", patients:"المرضى", agenda:"الأجندة", queue:"الطابور", invoices:"الفواتير", inventory:"المخزون", reports:"التقارير", analytics:"التحليلات", followUp:"المتابعة", settings:"الإعدادات" },
    shell: { workspace:"مساحة العمل", signOut:"تسجيل الخروج", openMenu:"فتح القائمة", closeMenu:"إغلاق القائمة" },
    language: { label:"اللغة", arabic:"العربية", english:"English" },
    patients: { title:"المرضى", add:"إضافة مريض", searchPlaceholder:"ابحث باسم المريض أو رقم الهاتف...", list:"قائمة المرضى", noMatches:"لا يوجد مرضى مطابقين للبحث", loading:"جاري التحميل...", active:"نشط", inactive:"غير نشط", archived:"مؤرشف", blocked:"محظور", checkIn:"تسجيل حضور", view:"عرض", edit:"تعديل", delete:"حذف", confirmDelete:"هل أنت متأكد من حذف هذا المريض؟", details:"تفاصيل المريض", addFiles:"إضافة ملفات", medicalFiles:"الملفات الطبية" }
  },
  en: {
    nav: { dashboard:"Dashboard", operation:"Operation Workspace", clinical:"Clinical Workspace", treatmentPlans:"Treatment Plans", patients:"Patients", agenda:"Agenda", queue:"Queue", invoices:"Invoices", inventory:"Inventory", reports:"Reports", analytics:"Analytics", followUp:"Follow-up", settings:"Settings" },
    shell: { workspace:"Workspace", signOut:"Sign out", openMenu:"Open menu", closeMenu:"Close menu" },
    language: { label:"Language", arabic:"العربية", english:"English" },
    patients: { title:"Patients", add:"Add Patient", searchPlaceholder:"Search by patient name or phone number...", list:"Patient List", noMatches:"No patients match your search", loading:"Loading...", active:"Active", inactive:"Inactive", archived:"Archived", blocked:"Blocked", checkIn:"Check in", view:"View", edit:"Edit", delete:"Delete", confirmDelete:"Are you sure you want to delete this patient?", details:"Patient Details", addFiles:"Add Files", medicalFiles:"Medical Files" }
  }
} as const;

export type Messages = typeof messages.en;
export function getMessages(locale: Locale): Messages { return messages[locale] as Messages; }
