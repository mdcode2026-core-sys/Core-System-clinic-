-- PJ Stage 3 — Permission Seed
-- Insert new procedures:* permissions into the permissions table
-- and assign them to the clinic_admin, doctor, receptionist roles via role_permissions.
-- Run this AFTER the schema migration has been applied.

-- ============================================================
-- 1. INSERT PERMISSIONS (idempotent)
-- ============================================================

INSERT INTO permissions (permission_key, permission_name, resource, action, description)
VALUES
  ('procedures:read', 'Read Procedures', 'procedures', 'read', 'View clinic service catalog'),
  ('procedures:create', 'Create Procedures', 'procedures', 'create', 'Create new services in catalog'),
  ('procedures:update', 'Update Procedures', 'procedures', 'update', 'Edit existing services'),
  ('procedures:delete', 'Delete Procedures', 'procedures', 'delete', 'Deactivate services')
ON CONFLICT (permission_key) DO NOTHING;

-- ============================================================
-- 2. ASSIGN TO clinic_admin (full CRUD)
-- ============================================================

DO $$
DECLARE
  v_role_id uuid;
  v_perm_id uuid;
BEGIN
  SELECT id INTO v_role_id FROM roles WHERE role_key = 'clinic_admin' LIMIT 1;
  IF v_role_id IS NULL THEN
    RAISE NOTICE 'clinic_admin role not found — skipping';
    RETURN;
  END IF;

  FOR v_perm_id IN
    SELECT id FROM permissions WHERE permission_key LIKE 'procedures:%'
  LOOP
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES (v_role_id, v_perm_id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ============================================================
-- 3. ASSIGN procedures:read TO doctor
-- ============================================================

DO $$
DECLARE
  v_role_id uuid;
  v_perm_id uuid;
BEGIN
  SELECT id INTO v_role_id FROM roles WHERE role_key = 'doctor' LIMIT 1;
  SELECT id INTO v_perm_id FROM permissions WHERE permission_key = 'procedures:read';

  IF v_role_id IS NOT NULL AND v_perm_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES (v_role_id, v_perm_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================================
-- 4. ASSIGN procedures:read TO receptionist
-- ============================================================

DO $$
DECLARE
  v_role_id uuid;
  v_perm_id uuid;
BEGIN
  SELECT id INTO v_role_id FROM roles WHERE role_key = 'receptionist' LIMIT 1;
  SELECT id INTO v_perm_id FROM permissions WHERE permission_key = 'procedures:read';

  IF v_role_id IS NOT NULL AND v_perm_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES (v_role_id, v_perm_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
