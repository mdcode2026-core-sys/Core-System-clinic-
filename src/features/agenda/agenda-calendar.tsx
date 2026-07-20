/**
 * Agenda Module — Weekly Calendar
 * Simple week view: days as columns, events as blocks
 * Mobile-first design
 */

"use client";

import { useState, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import type { AgendaEventWithRelations, AgendaEventStatusValue } from "@/domain/agenda/agenda.types";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

interface AgendaCalendarProps {
  events: AgendaEventWithRelations[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: AgendaEventWithRelations) => void;
  onTimeSlotClick: (date: string, hour: number) => void;
}

// ─────────────────────────────────────────
// STATUS COLORS (for calendar blocks)
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

export function AgendaCalendar({
  events,
  currentDate,
  onDateChange,
  onEventClick,
  onTimeSlotClick,
}: AgendaCalendarProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  // ─────────────────────────────────────────
  // WEEK CALCULATION
  // ─────────────────────────────────────────

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay(); // 0 = Sunday
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // ─────────────────────────────────────────
  // HOURS (8 AM to 8 PM = 12 hours)
  // ─────────────────────────────────────────

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 to 20

  // ─────────────────────────────────────────
  // GET EVENTS FOR A SPECIFIC DAY
  // ─────────────────────────────────────────

  function getEventsForDay(date: Date): AgendaEventWithRelations[] {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((e) => {
      const eventDate = e.scheduled_start.split("T")[0];
      return eventDate === dateStr;
    });
  }

  // ─────────────────────────────────────────
  // GET EVENTS FOR A SPECIFIC HOUR
  // ─────────────────────────────────────────

  function getEventsForHour(
    dayEvents: AgendaEventWithRelations[],
    hour: number
  ): AgendaEventWithRelations[] {
    return dayEvents.filter((e) => {
      const eventHour = new Date(e.scheduled_start).getHours();
      return eventHour === hour;
    });
  }

  // ─────────────────────────────────────────
  // FORMAT HELPERS
  // ─────────────────────────────────────────

  function formatDayName(date: Date): string {
    return date.toLocaleDateString("ar-SA", { weekday: "short" });
  }

  function formatDayNumber(date: Date): string {
    return date.getDate().toString();
  }

  function isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  function formatHour(hour: number): string {
    return `${String(hour).padStart(2, "0")}:00`;
  }

  function formatEventTime(event: AgendaEventWithRelations): string {
    const start = new Date(event.scheduled_start).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const end = new Date(event.scheduled_end).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${start} - ${end}`;
  }

  // ─────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────

  function goToPreviousWeek() {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  }

  function goToNextWeek() {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  }

  function goToToday() {
    onDateChange(new Date());
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            <Calendar className="w-4 h-4 ml-1" />
            اليوم
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {weekDays[0].toLocaleDateString("ar-SA", {
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-8 border-b bg-muted/50">
          <div className="p-2 text-center text-xs text-muted-foreground border-l">
            الوقت
          </div>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`p-2 text-center border-l ${
                isToday(day) ? "bg-primary/10" : ""
              }`}
            >
              <div className="text-xs text-muted-foreground">{formatDayName(day)}</div>
              <div
                className={`text-sm font-bold ${
                  isToday(day) ? "text-primary" : ""
                }`}
              >
                {formatDayNumber(day)}
              </div>
            </div>
          ))}
        </div>

        {/* Hours Grid */}
        <div className="max-h-[500px] overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b min-h-[60px]">
              {/* Hour Label */}
              <div className="p-2 text-center text-xs text-muted-foreground border-l bg-muted/30 flex items-center justify-center">
                {formatHour(hour)}
              </div>

              {/* Days */}
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day);
                const hourEvents = getEventsForHour(dayEvents, hour);
                const dateStr = day.toISOString().split("T")[0];

                return (
                  <div
                    key={dayIndex}
                    className={`border-l p-1 relative ${
                      isToday(day) ? "bg-primary/5" : ""
                    }`}
                    onClick={() => {
                      if (hourEvents.length === 0) {
                        onTimeSlotClick(dateStr, hour);
                      }
                    }}
                  >
                    {/* Events */}
                    {hourEvents.map((event) => {
                      const statusColor =
                        StatusColors[event.status as AgendaEventStatusValue] ||
                        StatusColors.scheduled;

                      return (
                        <div
                          key={event.id}
                          className={`${statusColor} text-white text-xs rounded p-1 mb-1 cursor-pointer transition-colors`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                        >
                          <div className="font-medium truncate">
                            {event.patient
                              ? `${event.patient.first_name} ${event.patient.last_name}`
                              : "غير معروف"}
                          </div>
                          <div className="text-[10px] opacity-90">
                            {formatEventTime(event)}
                          </div>
                          {event.doctor && (
                            <div className="text-[10px] opacity-75 truncate">
                              د. {event.doctor.full_name}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Empty slot indicator */}
                    {hourEvents.length === 0 && (
                      <div className="h-full w-full hover:bg-muted/50 cursor-pointer rounded transition-colors" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>مجدول</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>مؤكد</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>حضر</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span>في الجلسة</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-600" />
          <span>مكتمل</span>
        </div>
      </div>
    </div>
  );
}
