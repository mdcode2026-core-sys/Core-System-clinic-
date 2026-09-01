# AJM-1 Addendum — Unified User Configuration & Account Lifecycle

**Date:** 2026-09-02  
**Status:** **FINAL — IMPLEMENTATION CONTRACT ADDENDUM**

This addendum refines AJM-1 and makes the complete User Lifecycle explicit. It does not authorize replacement of the established Team & Access architecture.

## 1. Canonical Navigation

```text
Team & Access
├── Users
├── Roles
└── Advanced
```

Users is the canonical operational user-management surface. Create and Edit use one Unified User Configuration Form.

## 2. Unified Form

The form represents:
- Basic information
- Role
- Workspace
- Direct permissions
- Explicit exceptions/overrides
- Account lifecycle state
- Applicable invitation/lifecycle actions

The form does **not** allow Clinic Admin to create or know an employee password.

## 3. Identity

Every clinic has a canonical Tenant/Clinic ID: `master_tenants.id`.

Every clinic user has a canonical CORE SYSTEM User ID: `clinic_users.id`.

When authenticated, the clinic user is linked to a Supabase Auth identity through `clinic_users.auth_user_id` → `auth.users.id`.

`employee_code` is separate and is not the canonical User ID.

## 4. Clinic Admin

Clinic Admin is the protected tenant authority.

Ordinary Team & Access User Management cannot:
- reduce its role/authority
- deactivate it
- delete it
- apply ordinary-user negative restrictions
- convert it to a staff role

Clinic Admin may manage permitted personal/account data from the appropriate clinic/account settings surface, including verified email change.

## 5. Lifecycle

```text
Pending Invitation → Active → Inactive → Active
```

Pending users: `Resend Invitation`.  
Previously activated inactive users: `Reactivate`.  
Reactivate retains the existing password and Auth identity.

## 6. Employee Creation

Create must produce a complete, consistent user identity:

```text
clinic_users.id
  + tenant_id
  + Auth identity/auth_user_id
  + workspace membership
  + role/access configuration
  + Pending Invitation
```

`clinic_users.id` must be explicitly generated when Production schema provides no default.

Employee codes must remain unique and within the database column limit.

## 7. Invitation

Initial employee authentication setup uses a secure Supabase Auth invitation.

The invitation must reach the Production activation route and must never use a localhost redirect in Production.

## 8. Activation

`/activate` is the password setup experience for Pending users.

It must support:
- New password
- Confirm password
- Show/Hide password
- Show/Hide confirmation
- validation
- invalid/expired/used invitation handling
- successful completion

The employee chooses the password. Clinic Admin does not.

## 9. Resend Invitation

Pending users must have an explicit Resend Invitation action.

It sends a fresh invitation rather than relying on a previous token.

Resend Invitation is not Reactivate.

## 10. Login

There is one canonical `/login` for Clinic Admin and all clinic staff.

It must support Email, Password, Show/Hide Password, Forgot Password, errors, loading, and correct post-login tenant context.

No separate employee login is introduced.

## 11. Forgot Password

Forgot Password is a secure Supabase Auth recovery flow. It is not activation and is not reactivation.

Recovery must lead to password reset and then normal `/login`.

## 12. Ordinary User Edits

Name, phone, profile/contact information, role, workspace, direct permissions, and overrides update directly without email activation or password reset.

## 13. Email Changes

Email is authentication-sensitive.

A staff email change requires verification through the new email before it becomes authoritative. The existing Tenant ID, CORE User ID, and Auth User ID remain unchanged.

Clinic Admin email change follows the same verification principle but is initiated from clinic/account settings, not ordinary staff User Management. Clinic/Tenant ID remains unchanged.

## 14. Deactivate / Reactivate

Deactivate synchronizes CORE account state and Auth blocking.

Reactivate synchronizes CORE account state and Auth unblocking.

A previously activated user does not receive a new invitation merely because it was reactivated.

## 15. Authorization

```text
Role Permissions + Direct Permissions + Explicit Overrides → Effective Access
```

No second permission engine is introduced.

## 16. PIN

The legacy `pin_code` column is preserved only for schema compatibility. Functional PIN behavior is retired completely.

## 17. Mandatory Acceptance Scenarios

1. Create employee.
2. Receive invitation.
3. Open production `/activate`.
4. Set initial password.
5. Become Active.
6. Login through `/login`.
7. Receive correct Tenant/User/Workspace/Role/Effective Access context.
8. Edit name/phone without activation.
9. Edit role/workspace/access without password flow.
10. Resend invitation for Pending user.
11. Deactivate active staff user.
12. Confirm inactive user cannot login.
13. Reactivate previously activated user.
14. Confirm reactivated user can login with existing password.
15. Forgot Password.
16. Set new password through recovery.
17. Staff email change with verification.
18. Confirm old staff email is no longer the login email after verification.
19. Confirm staff email change preserves Tenant/User/Auth IDs.
20. Clinic Admin email change through clinic/account settings with verification.
21. Confirm Clinic Admin email change preserves Tenant/User/Auth IDs.
22. Attempt Clinic Admin role/authority reduction and confirm it is blocked.
23. Show/Hide password on Login.
24. Show/Hide password on Activation/Recovery.
25. Confirm production links never use localhost.
26. Reject duplicate tenant-scoped active email safely.
27. Resolve employee-code collision safely.
28. Confirm failed Create/Edit does not leave inconsistent identity state.

## 18. Closure

AJM-1 is not considered closed by build success. Closure requires evidence across Architecture, UX, Code, Database, Auth, Permissions, Integration, Runtime, Security, Regression, and Documentation.

This addendum must be read together with `TEAM-ACCESS-USER-CONFIGURATION-DECISIONS-2026-09-01.md` and `TEAM-ACCESS-USER-LIFECYCLE-FINAL-ENGINEERING-CONTRACT-2026-09-02.md`.
