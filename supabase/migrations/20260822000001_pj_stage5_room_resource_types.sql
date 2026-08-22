-- PJ Stage 5 — Room / Resource
-- Extend the canonical clinic_rooms classification without creating a parallel resource table.

alter table public.clinic_rooms
  drop constraint if exists clinic_rooms_room_type_check;

alter table public.clinic_rooms
  add constraint clinic_rooms_room_type_check
  check (
    (room_type)::text = any (
      array[
        'consultation'::text,
        'examination'::text,
        'treatment'::text,
        'laser'::text,
        'procedure'::text,
        'dental_chair'::text,
        'waiting'::text,
        'reception'::text
      ]
    )
  );
