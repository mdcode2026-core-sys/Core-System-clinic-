-- M2.0 Migration 02: Remove clinic_rooms.name column
BEGIN;
ALTER TABLE public.clinic_rooms DROP COLUMN IF EXISTS name;
COMMIT;
