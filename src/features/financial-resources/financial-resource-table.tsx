"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useI18n } from "@/core/i18n/I18nProvider";
export type FinancialResourceColumn = { key: string; label: string };
export function FinancialResourceTable({ title, columns, rows }: { title: string; columns: FinancialResourceColumn[]; rows: Record<string, string | number | null>[] }) {
  const { workspace: t } = useI18n();
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="overflow-x-auto p-0">{rows.length === 0 ? <p className="p-6 text-sm text-muted-foreground">{t.noRecordsFound}</p> : <table className="w-full text-sm"><thead><tr className="border-b bg-muted/40">{columns.map((c) => <th key={c.key} className="whitespace-nowrap px-4 py-3 text-start font-medium">{c.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id ?? index)} className="border-b last:border-0">{columns.map((c) => <td key={c.key} className="whitespace-nowrap px-4 py-3">{row[c.key] ?? "—"}</td>)}</tr>)}</tbody></table>}</CardContent></Card>;
}
