"use client";

import type { ReportResult } from "@/domain/reports/reports.queries";

interface ReportViewerProps {
  reportLabel: string;
  result: ReportResult;
}

export function ReportViewer({ reportLabel, result }: ReportViewerProps) {
  const { columns, rows, summary } = result;

  const hasData = rows.length > 0;

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden print:shadow-none print:border-0">
      {/* Print header */}
      <div className="hidden print:block mb-4">
        <h1 className="text-xl font-bold">ClinicSaaS™ — {reportLabel}</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("ar-SA")}
        </p>
      </div>

      {/* Digital header */}
      <div className="border-b bg-muted/50 p-4 print:hidden">
        <h3 className="font-semibold">{reportLabel}</h3>
        <p className="text-xs text-muted-foreground">
          {rows.length} {rows.length === 1 ? "سجل" : "سجلات"}
        </p>
      </div>

      {!hasData ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          لا توجد بيانات لهذا التقرير في النطاق المحدد.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-right font-medium text-muted-foreground whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 whitespace-nowrap">
                      {formatCellValue(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary block (if provided) */}
      {summary && Object.keys(summary).length > 0 && (
        <div className="border-t bg-muted/30 p-4">
          <div className="flex flex-wrap gap-4">
            {Object.entries(summary).map(([key, value]) => (
              <div key={key} className="min-w-[120px]">
                <div className="text-xs text-muted-foreground">{key}</div>
                <div className="font-semibold">{formatCellValue(value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  if (typeof value === "number") return value.toLocaleString("ar-SA");
  if (value instanceof Date) return value.toLocaleDateString("ar-SA");
  return String(value);
}
