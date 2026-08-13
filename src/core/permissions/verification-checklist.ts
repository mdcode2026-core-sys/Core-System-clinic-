/**
 * MANUAL VERIFICATION CHECKLIST — Package 3.0.1
 * Permission Engine Runtime
 *
 * These checks verify that getEffectivePermissions() produces correct output.
 * Run each check by calling getEffectivePermissions(userId, tenantId) for a real
 * user in the database and comparing the returned array against the expected set.
 *
 * No test runner required — these are plain assertions you can verify manually
 * via console.log, browser devtools, or a simple script.
 */

import { getEffectivePermissions } from "./permissionEngine";
import { permissionMatrix } from "./permissionMatrix";

// ============================================================
// CHECK 1: clinic_admin includes the full administrative permission set
// ============================================================
// Input:  A user whose clinic_users.role = 'clinic_admin'
// Expected: The returned array MUST include every permission granted to
//   clinic_admin in the roles/role_permissions tables (the DB is the
//   source of truth — see permissionMatrix.clinic_admin for the
//   client-side reference copy).
//
// Verification:
//   const result = await getEffectivePermissions(userId, tenantId);
//   const expected = permissionMatrix.clinic_admin;
//   const sortedResult = [...result].sort();
//   const sortedExpected = [...expected].sort();
//   console.assert(JSON.stringify(sortedResult) === JSON.stringify(sortedExpected),
//     "clinic_admin must exactly match permissionMatrix");
//
// Note: "super_admin" is not part of the approved M2 role model and must
// never appear as an assignable role or a basis for authorization — see
// the M2 role-authorization trigger on clinic_users for the enforced rule.

// ============================================================
// CHECK 2: clinic_admin matches permissionMatrix.clinic_admin exactly
// ============================================================
// Input:  A user whose clinic_users.role = 'clinic_admin'
// Expected: The returned array, when sorted, exactly equals:
//   permissionMatrix.clinic_admin sorted
//
// Verification:
//   const result = await getEffectivePermissions(userId, tenantId);
//   const sortedResult = [...result].sort();
//   const sortedExpected = [...permissionMatrix.clinic_admin].sort();
//   console.assert(JSON.stringify(sortedResult) === JSON.stringify(sortedExpected),
//     "clinic_admin must exactly match permissionMatrix");

// ============================================================
// CHECK 3: doctor matches permissionMatrix.doctor exactly
// ============================================================
// Input:  A user whose clinic_users.role = 'doctor'
// Expected: The returned array, when sorted, exactly equals:
//   permissionMatrix.doctor sorted
//
// Verification:
//   const result = await getEffectivePermissions(userId, tenantId);
//   const sortedResult = [...result].sort();
//   const sortedExpected = [...permissionMatrix.doctor].sort();
//   console.assert(JSON.stringify(sortedResult) === JSON.stringify(sortedExpected),
//     "doctor must exactly match permissionMatrix");

// ============================================================
// CHECK 4: receptionist matches permissionMatrix.receptionist exactly
// ============================================================
// Input:  A user whose clinic_users.role = 'receptionist'
// Expected: The returned array, when sorted, exactly equals:
//   permissionMatrix.receptionist sorted
//
// Verification:
//   const result = await getEffectivePermissions(userId, tenantId);
//   const sortedResult = [...result].sort();
//   const sortedExpected = [...permissionMatrix.receptionist].sort();
//   console.assert(JSON.stringify(sortedResult) === JSON.stringify(sortedExpected),
//     "receptionist must exactly match permissionMatrix");

// ============================================================
// CHECK 5: Override grant adds a permission beyond the template
// ============================================================
// Setup:  Insert a row into clinic_user_permission_overrides:
//   INSERT INTO clinic_user_permission_overrides
//     (tenant_id, user_id, permission_id, granted, created_by)
//   VALUES
//     (tenantId, userId, (SELECT id FROM permissions WHERE permission_key='reports:read'), true, creatorId);
//
// Input:  The same user from Check 2 (clinic_admin)
// Expected: The returned array includes "reports:read" (which clinic_admin does NOT have by default)
//
// Verification:
//   const result = await getEffectivePermissions(userId, tenantId);
//   console.assert(result.includes("reports:read"), "Override grant must add reports:read");

// ============================================================
// CHECK 6: Override revoke removes a permission from the template
// ============================================================
// Setup:  Insert a row into clinic_user_permission_overrides:
//   INSERT INTO clinic_user_permission_overrides
//     (tenant_id, user_id, permission_id, granted, created_by)
//   VALUES
//     (tenantId, userId, (SELECT id FROM permissions WHERE permission_key='patients:delete'), false, creatorId);
//
// Input:  The same user from Check 2 (clinic_admin)
//
// Verification:
//   const result = await getEffectivePermissions(userId, tenantId);
//   console.assert(!result.includes("patients:delete"), "Override revoke must remove patients:delete");

// ============================================================
// CHECK 7: User with no role returns empty array
// ============================================================
// Input:  A userId that does not exist in clinic_users, or a clinic_users row with role = null
// Expected: The returned array is empty []
//
// Verification:
//   const result = await getEffectivePermissions("nonexistent-user-id", tenantId);
//   console.assert(result.length === 0, "Nonexistent user must return empty array");

// ============================================================
// CHECK 8: usePermissions hook returns correct shape
// ============================================================
// Render a component that calls usePermissions() inside a valid AuthProvider.
// Expected: The hook returns an object with:
//   - permissions: Permission[] (initially [], then populated)
//   - hasPermission: (key) => boolean
//   - hasAnyPermission: (keys) => boolean
//   - isLoading: boolean (true initially, then false)
//   - error: string | null
//
// Verification (React DevTools or console.log):
//   const { permissions, hasPermission, hasAnyPermission, isLoading, error } = usePermissions();
//   console.assert(Array.isArray(permissions), "permissions must be an array");
//   console.assert(typeof hasPermission === "function", "hasPermission must be a function");
//   console.assert(typeof hasAnyPermission === "function", "hasAnyPermission must be a function");
//   console.assert(typeof isLoading === "boolean", "isLoading must be a boolean");
//   console.assert(error === null || typeof error === "string", "error must be null or string");
