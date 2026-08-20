-- CORE SYSTEM — Patient Journey Stage 1
-- Complete clinic_owner removal

BEGIN;

-- Migrate active clinic users.
UPDATE public.clinic_users
SET role = 'clinic_admin'
WHERE role = 'clinic_owner';

-- Migrate role-template references before deleting the role.
UPDATE public.clinic_users cu
SET role_template_id = (
    SELECT id FROM public.roles
    WHERE role_key = 'clinic_admin'
)
WHERE cu.role_template_id = (
    SELECT id FROM public.roles
    WHERE role_key = 'clinic_owner'
);

-- Migrate legacy user role references before deleting the role.
UPDATE public.users u
SET role_id = (
    SELECT id FROM public.roles
    WHERE role_key = 'clinic_admin'
)
WHERE u.role_id = (
    SELECT id FROM public.roles
    WHERE role_key = 'clinic_owner'
);

-- Remove permission mappings.
DELETE FROM public.role_permissions
WHERE role_id IN (
    SELECT id
    FROM public.roles
    WHERE role_key = 'clinic_owner'
);

-- Remove the retired role itself.
DELETE FROM public.roles
WHERE role_key = 'clinic_owner';

-- Remove the retired value from the active role constraint.
ALTER TABLE public.clinic_users
DROP CONSTRAINT IF EXISTS clinic_users_role_check;

ALTER TABLE public.clinic_users
ADD CONSTRAINT clinic_users_role_check
CHECK (
    role IN (
        'super_admin',
        'clinic_admin',
        'doctor',
        'nurse',
        'receptionist',
        'accounting'
    )
);

COMMIT;
