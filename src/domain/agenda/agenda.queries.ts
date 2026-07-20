/**
 * Agenda Module — Queries
 * Client-side React Query hooks
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type {
  AgendaEventRow,
  AgendaEventInsert,
  AgendaEventUpdate,
  AgendaEventWithRelations,
  AgendaEventFilters,
  CalendarRange,
} from "./agenda.types";

const supabase = createClient();

const agendaKeys = {
  all: ["agenda"] as const,
  tenant: (tenantId: string) => [...agendaKeys.all, tenantId] as const,
  range: (tenantId: string, range: CalendarRange) =>
    [...agendaKeys.tenant(tenantId), range.start, range.end] as const,
  detail: (tenantId: string, eventId: string) =>
    [...agendaKeys.tenant(tenantId), "detail", eventId] as const,
  filters: (tenantId: string, filters: AgendaEventFilters) =>
    [...agendaKeys.tenant(tenantId), "filters", filters] as const,
};

export function useDoctors(tenantId: string | null) {
  return useQuery({
    queryKey: ["doctors", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("clinic_users")
        .select("id, full_name, full_name_ar, specialization")
        .eq("tenant_id", tenantId)
        .eq("role", "doctor")
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
  });
}

export function useRooms(tenantId: string | null) {
  return useQuery({
    queryKey: ["rooms", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("clinic_rooms")
        .select("id, room_name, room_name_ar")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("room_name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
  });
}

export function useProcedures(tenantId: string | null) {
  return useQuery({
    queryKey: ["procedures", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("clinic_procedures")
        .select("id, procedure_name, procedure_name_ar, standard_duration_minutes")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("procedure_name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
  });
}

export function useAgendaEventsByRange(
  tenantId: string | null,
  range: CalendarRange | null
) {
  return useQuery({
    queryKey: range ? agendaKeys.range(tenantId!, range) : agendaKeys.all,
    queryFn: async () => {
      if (!tenantId || !range) return [];
      const { data, error } = await supabase
        .from("master_agenda_events")
        .select("*")
        .eq("tenant_id", tenantId)
        .gte("scheduled_start", range.start)
        .lte("scheduled_start", range.end)
        .not("status", "in", "(cancelled,no_show)")
        .order("scheduled_start", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AgendaEventRow[];
    },
    enabled: !!tenantId && !!range,
  });
}

export function useAgendaEventsWithRelations(
  tenantId: string | null,
  range: CalendarRange | null
) {
  return useQuery({
    queryKey: range
      ? [...agendaKeys.range(tenantId!, range), "with-relations"]
      : agendaKeys.all,
    queryFn: async () => {
      if (!tenantId || !range) return [];
      const { data, error } = await supabase
        .from("master_agenda_events")
        .select(
          `
          *,
          patient:patient_id (
            id,
            first_name,
            last_name,
            phone_primary
          ),
          doctor:doctor_id (
            id,
            full_name,
            specialization
          ),
          room:room_id (
            id,
            room_name
          ),
          procedure:procedure_id (
            id,
            procedure_name,
            standard_duration_minutes
          )
        `
        )
        .eq("tenant_id", tenantId)
        .gte("scheduled_start", range.start)
        .lte("scheduled_start", range.end)
        .order("scheduled_start", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AgendaEventWithRelations[];
    },
    enabled: !!tenantId && !!range,
  });
}

export function useAgendaEventById(
  tenantId: string | null,
  eventId: string | null
) {
  return useQuery({
    queryKey: eventId && tenantId ? agendaKeys.detail(tenantId, eventId) : agendaKeys.all,
    queryFn: async () => {
      if (!tenantId || !eventId) return null;
      const { data, error } = await supabase
        .from("master_agenda_events")
        .select(
          `
          *,
          patient:patient_id (
            id,
            first_name,
            last_name,
            phone_primary
          ),
          doctor:doctor_id (
            id,
            full_name,
            specialization
          ),
          room:room_id (
            id,
            room_name
          ),
          procedure:procedure_id (
            id,
            procedure_name,
            standard_duration_minutes
          )
        `
        )
        .eq("tenant_id", tenantId)
        .eq("id", eventId)
        .single();
      if (error) throw error;
      return data as AgendaEventWithRelations | null;
    },
    enabled: !!tenantId && !!eventId,
  });
}

export function useAgendaEventsFiltered(
  tenantId: string | null,
  filters: AgendaEventFilters
) {
  return useQuery({
    queryKey: tenantId ? agendaKeys.filters(tenantId, filters) : agendaKeys.all,
    queryFn: async () => {
      if (!tenantId) return [];
      let query = supabase
        .from("master_agenda_events")
        .select("*")
        .eq("tenant_id", tenantId);
      if (filters.doctorId) {
        query = query.eq("doctor_id", filters.doctorId);
      }
      if (filters.roomId) {
        query = query.eq("room_id", filters.roomId);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.patientId) {
        query = query.eq("patient_id", filters.patientId);
      }
      if (filters.dateFrom) {
        query = query.gte("scheduled_start", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("scheduled_start", filters.dateTo);
      }
      const { data, error } = await query.order("scheduled_start", {
        ascending: true,
      });
      if (error) throw error;
      return (data ?? []) as AgendaEventRow[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateAgendaEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: AgendaEventInsert) => {
      const { data, error } = await supabase
        .from("master_agenda_events")
        .insert(event)
        .select()
        .single();
      if (error) throw error;
      return data as AgendaEventRow;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: agendaKeys.tenant(data.tenant_id),
      });
    },
  });
}

export function useUpdateAgendaEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      tenantId,
      updates,
    }: {
      id: string;
      tenantId: string;
      updates: AgendaEventUpdate;
    }) => {
      const { data, error } = await supabase
        .from("master_agenda_events")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .select()
        .single();
      if (error) throw error;
      return data as AgendaEventRow;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: agendaKeys.tenant(data.tenant_id),
      });
      queryClient.invalidateQueries({
        queryKey: agendaKeys.detail(data.tenant_id, data.id),
      });
    },
  });
}

export function useUpdateAgendaEventStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      tenantId,
      status,
    }: {
      id: string;
      tenantId: string;
      status: string;
    }) => {
      const { data, error } = await supabase
        .from("master_agenda_events")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .select()
        .single();
      if (error) throw error;
      return data as AgendaEventRow;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: agendaKeys.tenant(data.tenant_id),
      });
      queryClient.invalidateQueries({
        queryKey: agendaKeys.detail(data.tenant_id, data.id),
      });
    },
  });
}

export function useCancelAgendaEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      tenantId,
    }: {
      id: string;
      tenantId: string;
    }) => {
      const { data, error } = await supabase
        .from("master_agenda_events")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .select()
        .single();
      if (error) throw error;
      return data as AgendaEventRow;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: agendaKeys.tenant(data.tenant_id),
      });
    },
  });
}

export function useInvalidateAgenda() {
  const queryClient = useQueryClient();
  return {
    invalidateAll: (tenantId?: string) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: agendaKeys.tenant(tenantId),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: agendaKeys.all });
      }
    },
    invalidateEvent: (tenantId: string, eventId: string) => {
      queryClient.invalidateQueries({
        queryKey: agendaKeys.detail(tenantId, eventId),
      });
    },
    invalidateRange: (tenantId: string, range: CalendarRange) => {
      queryClient.invalidateQueries({
        queryKey: agendaKeys.range(tenantId, range),
      });
    },
  };
}
