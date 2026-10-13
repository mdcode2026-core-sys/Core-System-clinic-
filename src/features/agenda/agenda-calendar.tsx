"use client";

import { useI18n } from "@/core/i18n/I18nProvider";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { addCalendarDays, formatTimeInTimeZone, getTenantLocalDate, tenantLocalToUtc } from "@/shared/utils/dateTime";
import type { AgendaEventWithRelations, AgendaEventStatusValue } from "@/domain/agenda/agenda.types";

interface AgendaCalendarProps {
  events: AgendaEventWithRelations[];
  currentDate: Date;
  timeZone?: string;
  onDateChange: (date: Date) => void;
  onEventClick: (event: AgendaEventWithRelations) => void;
  onTimeSlotClick: (date: string, hour: number) => void;
}

const StatusColors: Record<AgendaEventStatusValue, string> = {
  scheduled: "bg-blue-500 hover:bg-blue-600",
  confirmed: "bg-green-500 hover:bg-green-600",
  arrived: "bg-yellow-500 hover:bg-yellow-600",
  in_session: "bg-purple-500 hover:bg-purple-600",
  completed: "bg-emerald-600 hover:bg-emerald-700",
  no_show: "bg-red-500 hover:bg-red-600",
  cancelled: "bg-gray-400 hover:bg-gray-500",
  rescheduled: "bg-orange-500 hover:bg-orange-600",
};

const StatusLabelKey: Record<AgendaEventStatusValue, "scheduled" | "confirmed" | "arrived" | "inSession" | "completed" | "noShow" | "cancelled" | "rescheduled"> = {
  scheduled: "scheduled",
  confirmed: "confirmed",
  arrived: "arrived",
  in_session: "inSession",
  completed: "completed",
  no_show: "noShow",
  cancelled: "cancelled",
  rescheduled: "rescheduled",
};

export function AgendaCalendar({ events, currentDate, timeZone = "UTC", onDateChange, onEventClick, onTimeSlotClick }: AgendaCalendarProps) {
  const { locale, admin: a } = useI18n();
  const tenantToday = getTenantLocalDate(currentDate, timeZone);
  const weekday = new Date(`${tenantToday}T00:00:00Z`).getUTCDay();
  const days = Array.from({ length: 7 }, (_, i) => addCalendarDays(tenantToday, -weekday + i));
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
  const sameTenantDay = (value: string, day: string) => getTenantLocalDate(value, timeZone) === day;
  const getEvents = (day: string, hour?: number) => events.filter((e) => {
    if (!sameTenantDay(e.scheduled_start, day)) return false;
    if (hour === undefined) return true;
    const eventHour = Number(new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", hourCycle: "h23" }).format(new Date(e.scheduled_start)));
    return eventHour === hour;
  });
  const shiftWeek = (amount: number) => {
    const nextDate = addCalendarDays(tenantToday, amount * 7);
    onDateChange(new Date(tenantLocalToUtc(`${nextDate}T12:00:00`, timeZone)));
  };
  const statusLabel = (status: AgendaEventStatusValue) => a.agenda[StatusLabelKey[status]];
  const formatTime = (event: AgendaEventWithRelations) => `${formatTimeInTimeZone(event.scheduled_start, locale, timeZone)} - ${formatTimeInTimeZone(event.scheduled_end, locale, timeZone)}`;

  return (
    <div className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => shiftWeek(-1)} aria-label={a.agenda.previous}><ChevronLeft className="h-4 w-4 rtl:rotate-180" /></Button>
          <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}><Calendar className="me-1 h-4 w-4" />{a.agenda.today}</Button>
          <Button variant="outline" size="sm" onClick={() => shiftWeek(1)} aria-label={a.agenda.next}><ChevronRight className="h-4 w-4 rtl:rotate-180" /></Button>
        </div>
        <div className="text-sm text-muted-foreground">{new Date(`${days[0]}T12:00:00Z`).toLocaleDateString(locale === "ar" ? "ar" : "en-US", { numberingSystem: "latn", timeZone: "UTC", year: "numeric", month: "long", day: "numeric" })}</div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-8 border-b bg-muted/50">
          <div className="border-e p-2 text-center text-xs text-muted-foreground">{a.agenda.time}</div>
          {days.map((day) => (
            <div key={day} className={`border-e p-2 text-center`}>
              <div className="text-xs text-muted-foreground">{new Date(`${day}T12:00:00Z`).toLocaleDateString(locale === "ar" ? "ar" : "en-US", { numberingSystem: "latn", timeZone: "UTC", weekday: "short" })}</div>
              <div className="text-sm font-bold">{new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { numberingSystem: "latn", timeZone: "UTC", day: "numeric" })}</div>
            </div>
          ))}
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid min-h-[60px] grid-cols-8 border-b">
              <div className="flex items-center justify-center border-e bg-muted/30 p-2 text-center text-xs text-muted-foreground">{String(hour).padStart(2, "0")}:00</div>
              {days.map((day) => {
                const dayEvents = getEvents(day, hour);
                const dateStr = day;
                return (
                  <div key={`${dateStr}-${hour}`} className="relative border-e p-1" onClick={() => dayEvents.length === 0 && onTimeSlotClick(dateStr, hour)}>
                    {dayEvents.map((event) => (
                      <button type="button" key={event.id} className={`${StatusColors[event.status as AgendaEventStatusValue] || StatusColors.scheduled} mb-1 block w-full rounded p-1 text-start text-xs text-white transition-colors`} onClick={(e) => { e.stopPropagation(); onEventClick(event); }}>
                        <div className="truncate font-medium">{event.patient ? `${event.patient.first_name} ${event.patient.last_name}` : a.agenda.unknownPatient}</div>
                        <div className="text-[10px] opacity-90">{formatTime(event)}</div>
                        {event.doctor && <div className="truncate text-[10px] opacity-75">{a.agenda.doctorPrefix} {event.doctor.full_name}</div>}
                        <div className="truncate text-[10px] opacity-80">{statusLabel(event.status as AgendaEventStatusValue)}</div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {(["scheduled", "confirmed", "arrived", "in_session", "completed"] as AgendaEventStatusValue[]).map((status) => (
          <div key={status} className="flex items-center gap-1">
            <div className={`h-3 w-3 rounded ${StatusColors[status].split(" ")[0]}`} />
            <span>{statusLabel(status)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
