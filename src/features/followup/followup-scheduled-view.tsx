// src/features/followup/followup-scheduled-view.tsx
// Package 3.1.9 — Follow-up Scheduled View
// Shows only pending follow-ups with future scheduled_for. Status update only.

"use client";

import { useState } from "react";
import { updateFollowupStatus } from "@/domain/followup/followup.queries";
import type { FollowupRecord, FollowupDeliveryStatus } from "@/domain/followup/followup.types";

interface FollowupScheduledViewProps {
  records: FollowupRecord[];
  canUpdate: boolean;
  onStatusUpdate: (id: string, status: string) => void;
  isPending: boolean;
}

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

export function FollowupScheduledView({ records, canUpdate, onStatusUpdate, isPending }: FollowupScheduledViewProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: FollowupDeliveryStatus) => {
    setUpdatingId(id);
    const result = await updateFollowupStatus({ followup_id: id, new_status: newStatus });
    if (result.success) {
      onStatusUpdate(id, newStatus);
    }
    setUpdatingId(null);
  };

  // Group by date (YYYY-MM-DD)
  const grouped = records.reduce<Record<string, FollowupRecord[]>>((acc, record) => {
    const dateKey = record.scheduled_for.slice(0, 10);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(record);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      {records.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
          <svg className="mx-auto mb-3 h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          لا توجد متابعات مجدولة مستقبلية
        </div>
      ) : (
        sortedDates.map((dateKey) => (
          <div key={dateKey} className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500">
              {new Date(dateKey).toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </h3>
            <div className="grid gap-3">
              {grouped[dateKey].map((record) => (
                <div key={record.id} className="rounded-lg border border-l-4 border-l-blue-500 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">
                          {record.patient_name ?? "مريض غير معروف"}
                        </span>
                        {record.patient_phone && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {record.patient_phone}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                          {typeLabels[record.followup_type] ?? record.followup_type}
                        </span>
                        <span>•</span>
                        <span>{new Date(record.scheduled_for).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</span>
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
                      <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        معلّقة
                      </span>
                      {canUpdate && (
                        <select
                          disabled={updatingId === record.id || isPending}
                          value={record.delivery_status ?? "pending"}
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
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
