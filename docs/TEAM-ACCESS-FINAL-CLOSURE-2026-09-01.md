# CORE SYSTEM — Team & Access — Final Architecture, Engineering & Execution Record

**Date:** 2026-09-02  
**Status:** **FINAL CONTRACT / IMPLEMENTATION BASELINE — NOT A CLAIM OF RUNTIME CLOSURE**  
**Scope:** Team & Access, user administration, identity, authentication, invitation, activation, recovery, email change, lifecycle

## 1. Why This Document Replaces the Previous Closure Claim

The previous closure record declared a Clinic Admin-entered password model and removed email activation as a prerequisite. That implementation interpretation is superseded.

The authoritative requirement is now:

**Clinic Admin does not create or know an employee's password. The employee establishes the password through secure email-based activation.**

The existence of a successful build or an email being sent is not evidence that the complete lifecycle works.

## 2. Final Architecture

```text
Team & Access
├── Users
│   └── Unified User Configuration Form
├── Roles
└── Advanced
```

One User Form is the canonical operational configuration surface. It does not create duplicate CRUD or authorization engines.

## 3. Identity Architecture

```text
master_tenants.id
      ↓
clinic_users.tenant_id
      ↓
clinic_users.id
      ↓
clinic_users.auth_user_id
      ↓
auth.users.id
```

Every clinic has a stable Tenant/Clinic ID.

Every clinic user has a stable CORE SYSTEM User ID.

The Auth identity is separate from the CORE SYSTEM user identity but linked to it.

Changing an email does not change any of these IDs.

## 4. Protected Clinic Admin

Clinic Admin is Tenant Authority.

The ordinary Users management workflow cannot:
- reduce its role
- reduce its effective authority
- deactivate it
- delete it
- convert it to a staff role
- apply ordinary-user negative restrictions

Clinic Admin can still change permitted account/profile data through the appropriate clinic/account settings surface. Email change requires verification of the new email and preserves all tenant/user/Auth IDs.

## 5. Final Account Lifecycle

```text
                 ┌────────────────────┐
                 │ Pending Invitation │
                 └─────────┬──────────┘
                           │ Activate
                           ▼
                       ┌───────┐
                       │ Active│
                       └───┬───┘
                           │ Deactivate
                           ▼
                      ┌──────────┐
                      │ Inactive │
                      └────┬─────┘
                           │ Reactivate
                           ▼
                        Active
```

Separate operations:

- Pending → Resend Invitation
- Pending → Activation → Active
- Active → Deactivate → Inactive
- Inactive (previously activated) → Reactivate → Active
- Forgot Password is a recovery flow and is not Activation or Reactivation
- Email Change → New Email Verification → New canonical login email

## 6. User Creation

The Create operation must establish a consistent identity:

```text
Validate
 ↓
Generate clinic_users.id if DB has no default
 ↓
Generate unique employee_code within DB length
 ↓
Create CORE user
 ↓
Create/link Auth identity
 ↓
Persist auth_user_id
 ↓
Workspace membership
 ↓
Role + Direct Permissions + Overrides
 ↓
Pending Invitation
 ↓
Send fresh secure invitation
```

No administrator password is stored or requested.

If any required step fails, the system must not report success and must compensate/rollback where possible.

## 7. Activation

The invitation must route to the production activation experience.

```text
Email
 ↓
Supabase Auth verification/session handling
 ↓
Production /activate
 ↓
Employee sets password
 ↓
CORE account_status = active
 ↓
/login
```

Production links must never point to localhost.

## 8. Resend Invitation

Pending users require a visible `Resend Invitation` action.

The current implementation uses Supabase Auth's resend mechanism for the existing unconfirmed invited identity; it does not create a duplicate CORE user or Auth identity. Runtime acceptance still requires a fresh usable activation path to `/activate`.

Resend Invitation is not Reactivate.

## 9. Login

The system has one canonical `/login` for Clinic Admin and all clinic users.

Login must include Show/Hide Password and Forgot Password.

There is no separate employee login.

## 10. Forgot Password

Forgot Password uses a secure email recovery flow:

```text
/login
 ↓
Forgot Password
 ↓
Email
 ↓
Recovery email
 ↓
Secure recovery route
 ↓
New password
 ↓
/login
```

Recovery is not Activation and not Reactivation.

## 11. Ordinary Edits

Non-authentication changes update CORE SYSTEM directly and do not require reactivation:

- name
- phone
- profile/contact data
- role
- workspace
- direct permissions
- explicit overrides

## 12. Email Change

For staff and Clinic Admin, email change is authentication-sensitive.

The new email must be verified before it becomes the canonical login email.

The old login identity must not be destroyed merely because a change was requested.

After successful verification:
- new email is authoritative
- old email is no longer the login email
- Tenant ID remains unchanged
- CORE User ID remains unchanged
- Auth User ID remains unchanged

For staff, User Management records `pending_email`; the employee completes Auth verification from their authenticated account. Clinic Admin initiates its own email change from the account settings surface.

## 13. Deactivation and Reactivation

Deactivation must synchronize CORE account state and Auth access blocking.

Reactivation must synchronize CORE account state and Auth access unblocking.

A previously activated reactivated user retains the existing password and does not require a new invitation.

## 14. Password and PIN

Passwords are managed by Supabase Auth.

Clinic Admin never chooses or knows another employee's password.

The legacy `pin_code` column remains only for compatibility with the current schema. Functional PIN behavior is fully retired.

## 15. Authorization

```text
Role Permissions
+
Direct User Permissions
+
Explicit Overrides
→ Effective Access
```

No second permission engine is permitted.

Clinic Admin remains protected Tenant Authority rather than an ordinary user subject to privilege reduction.

## 16. Database Contract

Required invariants:
- `master_tenants.id` is stable Tenant ID.
- `clinic_users.id` is stable CORE User ID.
- `clinic_users.tenant_id` points to the tenant.
- `clinic_users.auth_user_id` points to the Auth identity when provisioned.
- `clinic_users.account_status` is the canonical lifecycle state: `pending | active | inactive`.
- `clinic_users.is_active` is synchronized with lifecycle state for compatibility/authorization.
- `clinic_users.pending_email` holds an unverified requested email until Auth verification succeeds.
- tenant-scoped email uniqueness is enforced according to the approved active/deletion model.
- employee codes are unique and within the database column limit.
- Create/Edit cannot leave an inconsistent required identity state.

## 17. Canonical 28 Acceptance Scenarios

These are the **sole canonical acceptance scenarios**. Any grouped engineering matrix is only a mapping to these 28 and must not be treated as a second acceptance list.

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

## 18. Execution Order

The engineering sequence is mandatory:

1. Baseline repository and Production schema.
2. Verify architecture against implementation.
3. Repair identity/database contract.
4. Repair Create.
5. Repair Edit and separate profile/access/auth lifecycle concerns.
6. Implement/repair Pending + Invitation + Resend Invitation.
7. Implement/repair Activation.
8. Repair Login + Forgot Password.
9. Implement staff email verification/change.
10. Implement Clinic Admin email verification/change in clinic/account settings.
11. Implement/verify Deactivate + Reactivate.
12. Verify Clinic Admin protection.
13. Run integration and regression validation.
14. Deploy.
15. Execute production end-to-end scenarios.
16. Only then issue a runtime closure claim.

## 19. Explicit Non-Goals / Prohibitions

- No administrator-set employee password.
- No PIN authentication.
- No separate employee login.
- No new Tenant ID on email change.
- No new CORE User ID on email change.
- No ordinary profile edit triggering activation.
- No Reactivate used as Resend Invitation.
- No Forgot Password treated as Reactivate.
- No Clinic Admin privilege reduction through User Management.
- No duplicate permission engine.
- No unrelated domain refactoring.

## 20. Closure Standard

This document is the final architecture/engineering/execution baseline. It is **not itself evidence that every runtime scenario has already passed**.

Runtime closure requires explicit evidence for the 28 canonical scenarios and for:

**Architecture → UX → Code → Database → Auth → Permissions → Integration → Runtime → Security → Regression → Documentation**.

No scenario may be described as verified merely because the application builds or deploys successfully.
