-- Prevent a patient from being booked into overlapping active appointments at database level.
create extension if not exists btree_gist;
alter table public.master_agenda_events drop constraint if exists no_patient_overlap;
alter table public.master_agenda_events add constraint no_patient_overlap exclude using gist (patient_id with =, tstzrange(scheduled_start, buffer_end) with &&) where (status not in ('cancelled','no_show','completed') and patient_id is not null);
