-- Stage 23 prerequisite data reconciliation.
-- The persistent Zada/PJ demo fixture has five availability rows assigned to
-- a receptionist (employee code PJ15-DOC) while the only active doctor is Dr. Said Saleh.
-- Reassign only when the fixture has exactly one source receptionist and exactly one active doctor.
-- No rows are deleted and no historical appointment/visit data is changed.

WITH source_user AS (
  SELECT cu.id, cu.tenant_id
  FROM public.clinic_users cu
  WHERE cu.tenant_id = '2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid
    AND cu.is_active = true
    AND cu.deleted_at IS NULL
    AND cu.role_id = (SELECT r.id FROM public.roles r WHERE r.role_key = 'receptionist' AND r.deleted_at IS NULL LIMIT 1)
    AND cu.employee_code = 'PJ15-DOC'
), target_doctor AS (
  SELECT cu.id, cu.tenant_id
  FROM public.clinic_users cu
  JOIN public.roles r ON r.id = cu.role_id AND r.deleted_at IS NULL
  WHERE cu.tenant_id = '2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid
    AND cu.is_active = true
    AND cu.deleted_at IS NULL
    AND r.role_key = 'doctor'
), availability_rows AS (
  SELECT cpa.id
  FROM public.clinic_provider_availability cpa
  JOIN source_user su ON su.id = cpa.doctor_id
  WHERE cpa.tenant_id = su.tenant_id
    AND cpa.deleted_at IS NULL
    AND cpa.is_active = true
)
UPDATE public.clinic_provider_availability cpa
SET doctor_id = td.id,
    updated_at = now()
FROM source_user su
JOIN target_doctor td ON td.tenant_id = su.tenant_id
WHERE cpa.id IN (SELECT id FROM availability_rows)
  AND (SELECT count(*) FROM source_user) = 1
  AND (SELECT count(*) FROM target_doctor) = 1;
