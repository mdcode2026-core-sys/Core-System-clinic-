-- CSAPI Gate 02 / R02 root-cause repair.
-- Coordination records the explicit Agenda result of a booking requirement without
-- becoming the appointment owner. Agenda remains authoritative for appointment state.
alter table public.operational_work_items
  add column if not exists agenda_event_id uuid references public.master_agenda_events(id) on delete set null;

create index if not exists operational_work_items_agenda_event_idx
  on public.operational_work_items(tenant_id, agenda_event_id)
  where agenda_event_id is not null;

comment on column public.operational_work_items.agenda_event_id is
  'R02 coordination reference to the Agenda-owned appointment created from this work item; never an appointment source of truth.';
