BEGIN;

ALTER TABLE public.clinic_user_settings
  DROP COLUMN IF EXISTS default_workspace;

COMMIT;
