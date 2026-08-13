"use client";

import { useState, useEffect, useCallback } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { isFeatureEnabled } from "@/core/features/featureRegistry";
import { reportModules } from "@/domain/reports/moduleRegistry";
import { reportRegistry, getReportsByModule } from "@/domain/reports/reportRegistry";
import type { ReportDefinition, DataSource } from "@/domain/reports/reportRegistry";
import { ReportViewer } from "./report-viewer";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Printer, FileDown, CalendarRange, BarChart3 } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/client";
import { runReport, type ReportResult } from "@/domain/reports/reports.queries";
import type { Permission } from "@/core/permissions/types";

// Simple select component since we don't have a Select wrapper in the repo
function SimpleSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; labelAr: string }[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.labelAr || opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: {
  startDate: string;
  endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">من</Label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">إلى</Label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
    </div>
  );
}

export function ReportsShell() {
  const { hasPermission, isLoading: permsLoading } = usePermissions();
  const [tenantId, setTenantId] = useState<string | null>(null);

  const [selectedModuleKey, setSelectedModuleKey] = useState("");
  const [selectedReportKey, setSelectedReportKey] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return firstDay.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.toISOString().split("T")[0];
  });

  const [availableModules, setAvailableModules] = useState<typeof reportModules>([]);
  const [availableReports, setAvailableReports] = useState<ReportDefinition[]>([]);

  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Resolve tenant_id on mount
  useEffect(() => {
    async function resolveTenant() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: cu } = await supabase
        .from("clinic_users")
        .select("tenant_id")
        .eq("auth_user_id", session.user.id)
        .limit(1)
        .maybeSingle();
      if (cu?.tenant_id) setTenantId(cu.tenant_id);
    }
    resolveTenant();
  }, []);

  // Filter modules by permission + feature flag
  useEffect(() => {
    if (permsLoading || !tenantId) return;

    async function filterModules() {
      const filtered: typeof reportModules = [];
      for (const mod of reportModules) {
        const hasPerm = hasPermission(mod.requiredPermission as Permission);
        const enabled = await isFeatureEnabled(tenantId!, mod.key);
        if (hasPerm && enabled) {
          filtered.push(mod);
        }
      }
      setAvailableModules(filtered);
    }
    filterModules();
  }, [permsLoading, tenantId, hasPermission]);

  // When module changes, update available reports. This is "adjusting
  // state when a value changes" — done during render, guarded by a
  // signature comparison, instead of via setState-in-effect. It also
  // removes the one-frame flash of the previous module's reports that the
  // effect version allowed before it corrected itself.
  const [lastModuleKey, setLastModuleKey] = useState(selectedModuleKey);
  if (selectedModuleKey !== lastModuleKey) {
    setLastModuleKey(selectedModuleKey);
    if (!selectedModuleKey) {
      setAvailableReports([]);
      setSelectedReportKey("");
    } else {
      const reports = getReportsByModule(selectedModuleKey);
      setAvailableReports(reports);
      setSelectedReportKey("");
      setReportResult(null);
      setReportError(null);
    }
  }

  const selectedReport = availableReports.find((r) => r.key === selectedReportKey);

  const handleRunReport = useCallback(async () => {
    if (!selectedReport) return;
    setReportLoading(true);
    setReportError(null);
    try {
      const result = await runReport(
        selectedReport.dataSource,
        selectedReport.needsDateRange ? startDate : undefined,
        selectedReport.needsDateRange ? endDate : undefined
      );
      setReportResult(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setReportError(msg);
      setReportResult(null);
    } finally {
      setReportLoading(false);
    }
  }, [selectedReport, startDate, endDate]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="space-y-6">
      {/* Overview blurb */}
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">التقارير</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          اختر الوحدة ثم التقرير المطلوب. بعض التقارير تتطلب تحديد نطاق زمني.
        </p>
      </div>

      {/* Controls */}
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SimpleSelect
            label="الوحدة"
            value={selectedModuleKey}
            onChange={setSelectedModuleKey}
            options={availableModules.map((m) => ({
              value: m.key,
              label: m.label,
              labelAr: m.labelAr,
            }))}
            placeholder="اختر الوحدة..."
            disabled={permsLoading || availableModules.length === 0}
          />
          <SimpleSelect
            label="التقرير"
            value={selectedReportKey}
            onChange={setSelectedReportKey}
            options={availableReports.map((r) => ({
              value: r.key,
              label: r.label,
              labelAr: r.labelAr,
            }))}
            placeholder={selectedModuleKey ? "اختر التقرير..." : "اختر الوحدة أولاً"}
            disabled={!selectedModuleKey || availableReports.length === 0}
          />
        </div>

        {selectedReport?.needsDateRange && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            onClick={handleRunReport}
            disabled={!selectedReport || reportLoading}
            className="gap-2"
          >
            <CalendarRange className="h-4 w-4" />
            {reportLoading ? "جاري التحميل..." : "عرض التقرير"}
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={!reportResult}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={!reportResult}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* Error */}
      {reportError && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {reportError}
        </div>
      )}

      {/* Result */}
      {reportResult && (
        <ReportViewer
          reportLabel={selectedReport?.labelAr || selectedReport?.label || ""}
          result={reportResult}
        />
      )}
    </div>
  );
}
