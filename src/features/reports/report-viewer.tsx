"use client";
import type { ReportResult } from "@/domain/reports/reports.queries";
import { useI18n } from "@/core/i18n/I18nProvider";
interface ReportViewerProps { reportLabel: string; result: ReportResult; }
export function ReportViewer({ reportLabel, result }: ReportViewerProps) {
  const { locale, reportViewer: t } = useI18n();
  const { columns, rows, summary } = result;
  const dateLocale = locale === "ar" ? "ar" : "en-US";
  const numeric = { numberingSystem: "latn" as const };
  const format = (value: unknown): string => {
    if (value === null || value === undefined) return t.unknown;
    if (typeof value === "boolean") return value ? t.yes : t.no;
    if (typeof value === "number") return value.toLocaleString(dateLocale, numeric);
    if (value instanceof Date) return value.toLocaleDateString(dateLocale, numeric);
    return String(value);
  };
  return <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm print:border-0 print:shadow-none" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="mb-4 hidden print:block"><h1 className="text-xl font-bold">ClinicSaaS™ — {reportLabel}</h1><p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(dateLocale, numeric)}</p></div>
    <div className="border-b bg-muted/50 p-4 print:hidden"><h3 className="font-semibold">{reportLabel}</h3><p className="text-xs text-muted-foreground">{rows.length.toLocaleString("en-US", numeric)} {rows.length === 1 ? t.record : t.records}</p></div>
    {rows.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">{t.noData}</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/30">{columns.map(col => <th key={col} className="whitespace-nowrap px-4 py-3 text-start font-medium text-muted-foreground">{col}</th>)}</tr></thead><tbody>{rows.map((row, idx) => <tr key={idx} className="border-b last:border-0 hover:bg-muted/20">{columns.map(col => <td key={col} className="whitespace-nowrap px-4 py-3">{format(row[col])}</td>)}</tr>)}</tbody></table></div>}
    {summary && Object.keys(summary).length > 0 && <div className="border-t bg-muted/30 p-4"><div className="flex flex-wrap gap-4">{Object.entries(summary).map(([key, value]) => <div key={key} className="min-w-[120px]"><div className="text-xs text-muted-foreground">{key}</div><div className="font-semibold">{format(value)}</div></div>)}</div></div>}
  </div>;
}
