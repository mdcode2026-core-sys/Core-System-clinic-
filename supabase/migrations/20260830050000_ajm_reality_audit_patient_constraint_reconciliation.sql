-- AJM reality audit: reconcile patient form options with the live patient schema.
-- The UI already exposes these values; the previous checks rejected valid user input.

alter table public.clinic_patients
  drop constraint if exists clinic_patients_gender_check;

alter table public.clinic_patients
  add constraint clinic_patients_gender_check
  check (gender is null or gender in ('male', 'female', 'other'));

alter table public.clinic_patients
  drop constraint if exists clinic_patients_preferred_channel_check;

alter table public.clinic_patients
  add constraint clinic_patients_preferred_channel_check
  check (preferred_channel is null or preferred_channel in ('whatsapp', 'sms', 'email', 'phone'));

alter table public.clinic_patients
  drop constraint if exists clinic_patients_patient_status_check;

alter table public.clinic_patients
  add constraint clinic_patients_patient_status_check
  check (patient_status is null or patient_status in ('active', 'inactive', 'archived', 'blocked'));
