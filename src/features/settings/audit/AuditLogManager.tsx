"use client";

import { useState, useMemo } from "react";
import { useTenantId } from "@/core/auth/useTenantId";
import { usePermissions } from "@/core/permissions/usePermissions";
import {
  useAuditTrail,
  useAuditActions,
  useAuditTableNames,
} from "@/domain/audit/audit.queries";
import type { AuditFilterParams } from "@/domain/audit/audit.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import {
  ClipboardList,
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Database,
  Activity,
  Eye,
  X,
} from "lucide-react";

const PAGE_SIZE = 25;

/**
 * M2.9 — Audit / Activity Manager
 *
 * Displays audit trail records for the current tenant with:
 * - Search (action, table, reason)
 * - Filter by action type
 * - Filter by table name
 * - Date range filtering
 * - Pagination
 * - Actor resolution
 */
export function AuditLogManager() {
  const { tenantId } = useTenantId();
  const { hasPermission, isLoading: permsLoading } = usePermissions();

  const canReadAudit = hasPermission("audit:read");

  const [filters, setFilters] = useState<AuditFilterParams>({
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [searchInput, setSearchInput] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const {
    data: auditResult,
    isLoading: auditLoading,
    error: auditError,
  } = useAuditTrail(tenantId, filters);

  const { data: actionList } = useAuditActions(tenantId);
  const { data: tableList } = useAuditTableNames(tenantId);

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchInput.trim() || undefined,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setDateFrom("");
    setDateTo("");
    setFilters({ page: 1, pageSize: PAGE_SIZE });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    if (auditResult && newPage > auditResult.totalPages) return;
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const hasActiveFilters =
    filters.search || filters.action || filters.tableName || filters.dateFrom || filters.dateTo;

  // Format timestamp for display
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  // Action badge color mapping
  const actionColor = (action: string): string => {
    const a = action.toLowerCase();
    if (a.includes("insert") || a.includes("create")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (a.includes("update") || a.includes("edit")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (a.includes("delete") || a.includes("remove")) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (a.includes("login") || a.includes("auth")) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  // Truncate JSON for display
  const truncateJson = (value: unknown, maxLen = 120): string => {
    if (!value) return "—";
    const str = typeof value === "string" ? value : JSON.stringify(value);
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen) + "…";
  };

  if (permsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="mr-3 text-muted-foreground">جاري التحقق من الصلاحيات...</span>
      </div>
    );
  }

  if (!canReadAudit) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-3" />
        <h3 className="text-lg font-semibold">غير مصرح</h3>
        <p className="text-muted-foreground mt-1">
          ليس لديك صلاحية audit:read لعرض سجل النشاط.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">سجل النشاط والتدقيق</h2>
          <p className="text-sm text-muted-foreground">
            مراجعة الأنشطة الإدارية المسجلة في النظام
          </p>
        </div>
      </div>

      <Separator />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[240px]">
              <label className="text-sm font-medium mb-1.5 block">بحث</label>
              <div className="flex gap-2">
                <Input
                  placeholder="البحث في الإجراء، الجدول، السبب..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button variant="secondary" size="icon" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action filter */}
            <div className="min-w-[160px]">
              <label className="text-sm font-medium mb-1.5 block">الإجراء</label>
              <Select
                value={filters.action || "all"}
                onValueChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    action: v === "all" ? undefined : v,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="كل الإجراءات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الإجراءات</SelectItem>
                  {actionList?.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table filter */}
            <div className="min-w-[160px]">
              <label className="text-sm font-medium mb-1.5 block">الجدول</label>
              <Select
                value={filters.tableName || "all"}
                onValueChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    tableName: v === "all" ? undefined : v,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="كل الجداول" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الجداول</SelectItem>
                  {tableList?.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date from */}
            <div className="min-w-[160px]">
              <label className="text-sm font-medium mb-1.5 block">من تاريخ</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setFilters((prev) => ({
                    ...prev,
                    dateFrom: e.target.value || undefined,
                    page: 1,
                  }));
                }}
              />
            </div>

            {/* Date to */}
            <div className="min-w-[160px]">
              <label className="text-sm font-medium mb-1.5 block">إلى تاريخ</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setFilters((prev) => ({
                    ...prev,
                    dateTo: e.target.value || undefined,
                    page: 1,
                  }));
                }}
              />
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="mb-0.5">
                <X className="h-4 w-4 ml-1" />
                مسح الفلاتر
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              السجلات
              {auditResult && (
                <Badge variant="secondary" className="mr-2">
                  {auditResult.totalCount}
                </Badge>
              )}
            </CardTitle>
            {auditResult && auditResult.totalPages > 1 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  صفحة {auditResult.page} من {auditResult.totalPages}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {auditLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="mr-3 text-muted-foreground">جاري تحميل السجلات...</span>
            </div>
          ) : auditError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-3" />
              <h3 className="text-lg font-semibold">خطأ في التحميل</h3>
              <p className="text-muted-foreground mt-1">
                {auditError instanceof Error ? auditError.message : "فشل تحميل سجل النشاط"}
              </p>
            </div>
          ) : !auditResult || auditResult.records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold">لا توجد سجلات</h3>
              <p className="text-muted-foreground mt-1">
                {hasActiveFilters
                  ? "لا توجد نتائج تطابق الفلاتر المحددة."
                  : "لم يتم تسجيل أي نشاط بعد في هذا المستأجر."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">التاريخ</TableHead>
                      <TableHead className="w-[120px]">الإجراء</TableHead>
                      <TableHead>الجدول</TableHead>
                      <TableHead>المستخدم</TableHead>
                      <TableHead>السجل</TableHead>
                      <TableHead>التفاصيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditResult.records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatDate(record.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={actionColor(record.action)}>
                            {record.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Database className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-mono text-sm">{record.table_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">
                              {record.actor?.full_name || record.actor?.email || "—"}
                            </span>
                            {record.actor_role && (
                              <Badge variant="outline" className="text-xs">
                                {record.actor_role}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">
                            {record.record_id
                              ? record.record_id.slice(0, 8) + "…"
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[300px] truncate text-sm text-muted-foreground">
                            {record.reason || truncateJson(record.new_values) || "—"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {auditResult.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    إجمالي السجلات: {auditResult.totalCount}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(auditResult.page - 1)}
                      disabled={auditResult.page <= 1}
                    >
                      <ChevronRight className="h-4 w-4 ml-1" />
                      السابق
                    </Button>
                    <span className="text-sm px-2">
                      {auditResult.page} / {auditResult.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(auditResult.page + 1)}
                      disabled={auditResult.page >= auditResult.totalPages}
                    >
                      التالي
                      <ChevronLeft className="h-4 w-4 mr-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
