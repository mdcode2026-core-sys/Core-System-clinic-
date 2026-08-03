// src/features/followup/followup-list-view.tsx
// Package 3.1.9 — Follow-up List View
// Renders all follow-ups with filtering by status/type. Status update only.

"use client";

import { useState } from "react";
import { updateFollowupStatus } from "@/domain/followup/followup.queries";
import type { FollowupRecord, FollowupDeliveryStatus } from "@/domain/followup/followup.types";

interface FollowupListViewProps {
  records: FollowupRecord[];
  canUpdate: boolean;
  onStatusUpdate: (id: string, status: string) => void;
  isPending: boolean;
}

const statusConfig: Record<string, { label: string; colorClass: string }> = {
  pending: { label: "معلّقة", colorClass: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  sent: { label: "تم الإرسال", colorClass: "bg-blue-100 text-blue-800 border-blue-200" },
  delivered: { label: "تم التوصيل", colorClass: "bg-green-100 text-green-800 border-green-200" },
  read: { label: "مقروءة", colorClass: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  failed: { label: "فشل", colorClass: "bg-red-100 text-red-800 border-red-200" },
  cancelled: { label: "ملغاة", colorClass: "bg-gray-100 text-gray-800 border-gray-200" },
};

const typeLabels: Record<string, string> = {
  post_visit_24h: "متابعة 24 ساعة",
  post_visit_7d: "متابعة 7 أيام",
  reactivation_30d: "تفعيل 30 يوم",
  reactivation_60d: "تفعيل 60 يوم",
  reactivation_90d: "تفعيل 90 يوم",
  appointment_reminder_24h: "تذكير 24 ساعة",
  appointment_reminder_2h: "تذكير ساعتين",
  birthday: "عيد ميلاد",
  custom: "مخصص",
};

export function FollowupListView({ records, canUpdate, onStatusUpdate, isPending }: FollowupListViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = filterStatus === "all"
    ? records
    : records.filter((r) => r.delivery_status === filterStatus);

  const handleStatusChange = async (id: string, newStatus: FollowupDeliveryStatus) => {
    setUpdatingId(id);
    const result = await updateFollowupStatus({ followup_id: id, new_status: newStatus });
    if (result.success) {
      onStatusUpdate(id, newStatus);
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-500">تصفية حسب الحالة:</span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        >
          <option value="all">الكل</option>
          <option value="pending">معلّقة</option>
          <option value="sent">تم الإرسال</option>
          <option value="delivered">تم التوصيل</option>
          <option value="read">مقروءة</option>
          <option value="failed">فشل</option>
          <option value="cancelled">ملغاة</option>
        </select>
        <span className="text-sm text-gray-500 mr-auto">الإجمالي: {filtered.length}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
          لا توجد متابعات مطابقة للتصفية
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((record) => {
            const status = record.delivery_status ?? "pending";
            const cfg = statusConfig[status] ?? { label: status, colorClass: "bg-gray-100 text-gray-800" };

            return (
              <div key={record.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">
                        {record.patient_name ?? "مريض غير معروف"}
                      </span>
                      {record.patient_phone && (
                        <span className="text-sm text-gray-500">{record.patient_phone}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                        {typeLabels[record.followup_type] ?? record.followup_type}
                      </span>
                      <span>•</span>
                      <span>{new Date(record.scheduled_for).toLocaleString("ar-SA")}</span>
                      {record.channel && (
                        <>
                          <span>•</span>
                          <span>{record.channel}</span>
                        </>
                      )}
                    </div>
                    {record.message_body && (
                      <p className="text-sm text-gray-500 line-clamp-2">{record.message_body}</p>
                    )}
                  </div>

                  {/* Status + Action */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.colorClass}`}>
                      {cfg.label}
                    </span>
                    {canUpdate && (
                      <select
                        disabled={updatingId === record.id || isPending}
                        value={status}
                        onChange={(e) => handleStatusChange(record.id, e.target.value as FollowupDeliveryStatus)}
                        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm"
                      >
                        <option value="pending">معلّقة</option>
                        <option value="sent">تم الإرسال</option>
                        <option value="delivered">تم التوصيل</option>
                        <option value="read">مقروءة</option>
                        <option value="failed">فشل</option>
                        <option value="cancelled">ملغاة</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
