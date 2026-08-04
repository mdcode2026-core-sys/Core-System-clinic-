-- Migration: Add reports:read permission to all active roles
-- Date: 2026-08-04
-- Package: 3.1.7 — Reports Module
-- Reason: getEffectivePermissions() queries role_permissions in the database,
--         not permissionMatrix.ts. Without this, reports:read is never granted
--         and the Reports menu item remains hidden for all roles.

-- Step 1: Ensure the permission exists in the permissions catalog
INSERT INTO permissions (permission_key, permission_name, resource, action)
SELECT 'reports:read', 'Read Reports', 'reports', 'read'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE permission_key = 'reports:read');

-- Step 2: Link reports:read to all 4 active roles in role_permissions
-- Avoids duplicates if run more than once.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.role_key IN ('super_admin', 'clinic_admin', 'doctor', 'receptionist')
  AND p.permission_key = 'reports:read'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp2
    WHERE rp2.role_id = r.id AND rp2.permission_id = p.id
  );
