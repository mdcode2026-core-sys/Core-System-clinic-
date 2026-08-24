import type { Locale } from "./messages";
export const reportViewerMessages = { ar: { record: "سجل", records: "سجلات", noData: "لا توجد بيانات لهذا التقرير في النطاق المحدد.", yes: "نعم", no: "لا", unknown: "—" }, en: { record: "record", records: "records", noData: "No data is available for this report in the selected range.", yes: "Yes", no: "No", unknown: "—" } } as const satisfies Record<Locale, unknown>;
export function getReportViewerMessages(locale: Locale) { return reportViewerMessages[locale]; }
