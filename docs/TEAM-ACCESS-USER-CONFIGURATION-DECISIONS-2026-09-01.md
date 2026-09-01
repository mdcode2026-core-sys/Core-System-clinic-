# CORE SYSTEM — Team & Access User Configuration — Final Architecture Decisions

**Decision date:** 2026-09-02  
**Scope:** Team & Access, User Configuration, Account Lifecycle, Authentication integration  
**Status:** **FINAL ARCHITECTURAL CONTRACT — IMPLEMENTATION MUST CONFORM**

> This document is the authoritative architectural contract for Team & Access user administration. If implementation conflicts with this document, the implementation is wrong; the requirement is not to be silently changed to fit the implementation.

## 1. Scope Boundary

This work covers Team & Access user administration and the authentication/account lifecycle directly required by it. No Patient Flow, Agenda, Clinical Visit, Treatment Plan, Medical Photos, or other unrelated domain may be refactored as part of this work.

A directly connected security, integrity, identity, authentication, or lifecycle defect may be fixed when required for the correctness of Team & Access.

## 2. Canonical Team & Access Structure

```text
Team & Access
├── Users
│   └── Unified User Configuration Form
├── Roles
└── Advanced
```

`Users` is the only canonical operational user-management surface. Create and Edit use the same unified User Configuration Form and one Save action.

`Roles` defines roles. Role assignment remains in the User Form.

`Advanced` is the deep administration boundary and must not become a second CRUD workflow or second permission engine.

Advanced may expose:
- Access Administration
- Role Templates
- Administrable User Settings boundary
- Login/account lifecycle administration and guidance
- Workspace-related administration only where it does not duplicate the User Form

## 3. Independent Domain Concepts

The UI unifies administration without merging the underlying concepts:

`User ≠ Role ≠ Permission ≠ Workspace ≠ Tenant ≠ Authentication Identity`

Workspace membership is not an authorization boundary.

No duplicate user table, permission engine, role engine, workspace CRUD model, or authentication system may be introduced.

## 4. Tenant and User Identity Model

Each clinic is a tenant with a canonical `master_tenants.id`.

Each employee/clinic user has a canonical CORE SYSTEM `clinic_users.id`.

Each authenticated identity has a Supabase Auth `auth.users.id`, referenced from `clinic_users.auth_user_id`.

The identity relationship is:

```text
Tenant / Clinic
└── master_tenants.id
    └── clinic_users.tenant_id
        └── clinic_users.id          ← CORE SYSTEM User ID
            └── clinic_users.auth_user_id
                └── auth.users.id    ← Authentication Identity
```

`employee_code` is an operational employee identifier and is not a replacement for `clinic_users.id`.

Changing an email must never create a new tenant, a new CORE SYSTEM user ID, or a new Auth identity. The same tenant and user identity remain authoritative.

## 5. Clinic Admin — Protected Tenant Authority

Clinic Admin is the highest operational authority inside its tenant and is **not an ordinary limited employee account**.

The protected Clinic Admin account:
- remains `role = clinic_admin`
- remains active unless a platform-level emergency mechanism outside Team & Access is explicitly defined
- remains linked to its existing Auth identity
- retains tenant authority
- cannot have its role reduced through User Management
- cannot have its effective authority reduced by Direct Permission removal or negative Override
- cannot be deleted through User Management
- cannot be deactivated through User Management
- cannot be converted into an ordinary staff role

Clinic Admin may edit its own permitted profile/account information through the dedicated clinic/account settings surface.

## 6. Unified User Form Contract

The User Form represents, in one operational flow:
- Basic identity/contact data
- Role
- Workspace membership
- Direct permissions
- Explicit exceptions/overrides
- Account lifecycle status
- Invitation/account lifecycle actions as applicable

**The User Form does NOT contain a field for an administrator to choose or know an employee's password.**

PIN is not a functional authentication method.

## 7. Account Lifecycle States

The lifecycle is explicitly divided into:

### Pending Invitation

A staff account has been provisioned but the employee has not completed initial password setup.

Available administrative action:
- `Resend Invitation`

### Active

The employee has completed account setup and is allowed to authenticate.

Available actions depend on authorization:
- Edit
- Deactivate
- Resend/other lifecycle actions only where explicitly applicable

### Inactive

The employee account is intentionally disabled.

Both CORE SYSTEM account state and Auth access must reflect the disabled state.

Available action:
- `Reactivate`

Reactivating a previously activated user does **not** reset the password and does **not** require a new invitation.

## 8. Employee Creation — Authoritative Scenario

```text
Clinic Admin
  ↓
Team & Access → Users → Create User
  ↓
Unified User Form
  ↓
Validate tenant, identity, role, workspace, access, and lifecycle data
  ↓
Create CORE SYSTEM clinic_users record with its own UUID
  ↓
Create/link Supabase Auth identity
  ↓
Persist auth_user_id
  ↓
Persist workspace membership
  ↓
Persist direct permissions / explicit overrides
  ↓
Set Pending Invitation
  ↓
Send secure invitation email
```

The administrator does not set or receive the employee password.

The transaction/compensation strategy must not leave an orphaned CORE SYSTEM user or Auth identity when a required step fails.

## 9. Invitation and Activation

Initial employee activation is an email-based secure invitation flow.

```text
Pending Invitation
  ↓
Invitation email
  ↓
Secure verification/session handling
  ↓
Production activation route
  ↓
/activate
  ↓
Employee sets password
  ↓
Account becomes Active
  ↓
Employee uses /login
```

The production invitation must never resolve to `localhost` or another development origin.

The activation page must support:
- New password
- Confirm password
- Show/Hide password
- Show/Hide confirmation
- Validation
- Expired/invalid/used invitation handling
- Clear success/failure states

## 10. Resend Invitation

`Pending Invitation` must expose an explicit `Resend Invitation` action.

Resend must issue a fresh invitation/link and must not depend on reusing an old consumed or expired token.

`Reactivate` and `Resend Invitation` are different operations:

```text
Pending → Resend Invitation
Inactive + previously activated → Reactivate
```

## 11. Authentication Login

There is one canonical login entry point for the system:

`/login`

It is used by:
- Clinic Admin
- Doctors
- Receptionists
- Nurses
- Therapists
- Other authorized clinic users

There is no separate employee login system.

Login must provide:
- Email
- Password
- Show/Hide password
- Forgot Password
- Clear authentication errors
- Correct tenant/user context after authentication

## 12. Forgot Password

Forgot Password is a recovery flow, not account activation.

```text
/login
  ↓
Forgot Password
  ↓
Email
  ↓
Supabase Auth recovery email
  ↓
Secure recovery route
  ↓
Set new password
  ↓
/login
```

The recovery UI must support Show/Hide password and confirmation, validation, and clear error states.

## 13. Ordinary Profile/Data Edits

Changing non-authentication profile data must update CORE SYSTEM directly without requiring email activation or password reset.

Examples:
- Name
- Phone
- Other profile/contact fields
- Role
- Workspace
- Direct permissions
- Explicit overrides

A normal Save must not silently trigger an authentication reactivation flow.

## 14. Email Change — Staff Users

Changing a user's email is an authentication-sensitive operation.

The new address must be verified before it becomes authoritative.

```text
Current active account
  ↓
Request email change
  ↓
New email verification
  ↓
Successful verification
  ↓
New email becomes canonical login email
  ↓
Old email is no longer the login email
```

The same `tenant_id`, `clinic_users.id`, and `auth_user_id` remain unchanged.

Until verification succeeds, the existing verified identity must not be destroyed merely because a new email was requested.

## 15. Clinic Admin Email Change

Clinic Admin may change the email of the clinic's protected account through the **clinic/account settings surface**, not through ordinary staff-user administration.

The same email-verification principle applies:
- Verify the new email
- Preserve the existing tenant/clinic ID
- Preserve the existing CORE SYSTEM Clinic Admin user ID
- Preserve the existing Auth identity
- After successful verification, the new email becomes the login email
- The old email ceases to be the login email

Changing the Clinic Admin email does not create a new clinic or change `master_tenants.id`.

## 16. Password Ownership

Clinic Admin does not create, know, or manage another employee's password.

The employee chooses the initial password during activation and may change it through recovery/password-management flows.

Passwords are managed by Supabase Auth and are never persisted in CORE SYSTEM application tables.

## 17. PIN Retirement

The existing `clinic_users.pin_code` schema is retained only for legacy compatibility where required by the current schema.

PIN is:
- not displayed
- not generated as an authentication credential
- not validated for login
- not used for invitation
- not used for activation
- not used for recovery

## 18. Authorization Model

The canonical effective-access model remains:

```text
Role Permissions
+
Direct User Permissions
+
Explicit Overrides
→
Effective Access
```

For ordinary users, an explicit negative override may remove an otherwise inherited permission.

Clinic Admin is the tenant authority and is protected from this ordinary-user restriction model.

No second permission engine is allowed.

## 19. Database Integrity Requirements

The implementation must maintain:
- unique `clinic_users.id`
- valid `tenant_id` referencing the clinic tenant
- valid `auth_user_id` linkage when an Auth identity exists
- tenant-scoped email uniqueness according to the approved data-retention/deletion model
- employee-code uniqueness
- employee-code values within the database column limit
- no orphaned required identity records after failed creation

The application must explicitly generate `clinic_users.id` if Production schema does not provide a DB default.

## 20. User Save Semantics

The unified Save must coordinate the independent concerns without confusing them:

```text
Profile Data
Role
Workspace
Direct Permissions
Overrides
Account Lifecycle
Authentication Identity
```

A profile edit must not require a password.

An access edit must not require an invitation.

An email change must invoke email verification.

A password reset must invoke secure recovery.

## 21. Error and Compensation Contract

Create/Edit is not successful merely because one layer succeeded.

If a required step fails, the system must:
- report a clear error
- avoid claiming success
- compensate/rollback where possible
- avoid orphaned Auth/CORE records
- preserve existing valid accounts

## 22. Required End-to-End Scenarios

The following scenarios are mandatory acceptance scenarios and are part of the architecture, not optional QA examples:

1. Clinic Admin creates a new employee.
2. New employee receives invitation.
3. Employee follows invitation to production `/activate`.
4. Employee sets initial password.
5. Employee becomes Active.
6. Employee logs in through the same `/login` used by Clinic Admin.
7. Employee receives the correct tenant, workspace, role, and effective permissions.
8. Clinic Admin edits employee name/phone/profile data without reactivation.
9. Clinic Admin edits role/workspace/access without password handling.
10. Pending employee can use `Resend Invitation` to receive a fresh invitation.
11. Previously activated Active employee can be Deactivated.
12. Deactivated employee cannot authenticate.
13. Previously activated Inactive employee can be Reactivated without a new password/invitation.
14. Reactivated employee can log in using the existing password.
15. Employee can use Forgot Password and receive a secure recovery email.
16. Employee can set a new password through recovery.
17. Staff email change requires verification of the new email.
18. Old staff email ceases to be the login email only after successful new-email verification.
19. Staff email change preserves tenant ID, CORE User ID, and Auth User ID.
20. Clinic Admin can change its own email through clinic/account settings using the same verification principle.
21. Clinic Admin email change preserves Clinic/Tenant ID, CORE User ID, and Auth User ID.
22. Clinic Admin cannot be role-reduced, deactivated, deleted, or authority-reduced through User Management.
23. Show/Hide password works on Login.
24. Show/Hide password works on Activation/Recovery.
25. Production invitation/recovery links never point to localhost.
26. Duplicate tenant-active email is rejected safely.
27. Employee-code collision is retried/resolved without violating uniqueness.
28. Failed Create/Edit does not leave an inconsistent user/Auth state.

## 23. Scope Protection

Patient Flow and unrelated domains remain outside this work. A directly related defect may be repaired only when it is necessary for user identity, authorization, authentication, lifecycle, or data integrity.

## 24. Closure Rule

Final closure requires evidence across:

**Architecture → UX → Code → Database → Permissions → Auth Integration → Runtime → Security → Regression → Documentation**

A successful build alone is never sufficient evidence of closure.
