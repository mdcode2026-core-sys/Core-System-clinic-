# CORE SYSTEM — Team & Access User Lifecycle — Final Engineering & Execution Contract

**Date:** 2026-09-02  
**Status:** **FINAL — AUTHORITATIVE EXECUTION CONTRACT**  
**Scope:** Tenant users, Clinic Admin protection, user CRUD, Auth integration, invitation, activation, recovery, email change, lifecycle

## 1. Purpose

This document converts the approved Team & Access architecture into an explicit engineering contract. It exists to prevent partial fixes, contradictory authentication models, accidental tenant/user identity replacement, and premature closure claims.

## 2. Identity Contract

Three identifiers must remain distinct:

| Identifier | Meaning | Lifecycle |
|---|---|---|
| `master_tenants.id` | Canonical Clinic/Tenant ID | Never changes because of email/user edits |
| `clinic_users.id` | Canonical CORE SYSTEM User ID | Never changes because of email/password changes |
| `auth.users.id` / `clinic_users.auth_user_id` | Supabase authentication identity | Same identity retained through normal email/password lifecycle |

`employee_code` is an operational identifier and is not a substitute for `clinic_users.id`.

Relationship:

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

## 3. Clinic Admin Engineering Contract

Clinic Admin is the protected tenant authority.

User Management must reject attempts to:
- change Clinic Admin role
- reduce Clinic Admin effective authority
- deactivate Clinic Admin
- delete Clinic Admin
- apply ordinary-user negative restrictions to Clinic Admin

Clinic Admin account/profile settings may still allow permitted personal/account changes, including email change through verified email-change flow.

Changing Clinic Admin email must preserve:
- `master_tenants.id`
- `clinic_users.id`
- `auth_user_id`

## 4. User State Machine

```text
                    ┌──────────────────┐
                    │ Pending Invitation│
                    └────────┬─────────┘
                             │ Activate
                             ▼
                         ┌───────┐
                         │ Active│
                         └───┬───┘
                    Deactivate│
                              ▼
                        ┌──────────┐
                        │ Inactive │
                        └────┬─────┘
                           Reactivate
                              │
                              ▼
                           Active
```

Pending users use **Resend Invitation**.

Previously activated inactive users use **Reactivate**.

Reactivate does not reset an existing password.

## 5. Create User Sequence

```text
Clinic Admin
  ↓
Users → Create
  ↓
Unified User Configuration Form
  ↓
Validate
  ↓
Generate `clinic_users.id` when DB does not supply it
  ↓
Generate unique employee code within DB limit
  ↓
Create CORE SYSTEM user
  ↓
Create/link Auth identity
  ↓
Persist `auth_user_id`
  ↓
Workspace membership
  ↓
Role/access configuration
  ↓
Pending Invitation
  ↓
Fresh secure invitation
```

No administrator-entered employee password is part of the contract.

## 6. Invitation Sequence

The invitation must resolve through the production origin and ultimately reach the activation experience.

```text
Invitation email
  ↓
Auth verification/session handling
  ↓
Production `/activate`
  ↓
New password
  ↓
Confirm password
  ↓
Complete setup
  ↓
Active
```

`localhost` is forbidden in production invitation/recovery redirects.

## 7. Resend Invitation

For a Pending Invitation user:

```text
Users → Pending User → Resend Invitation
        ↓
Fresh invitation
        ↓
Fresh secure token/link
        ↓
Production `/activate`
```

A consumed or expired invitation is not reused.

The UI must make Pending state visible and must expose the resend operation without creating a duplicate user.

## 8. Activation Page Contract

The activation/recovery experience must provide:
- password input
- confirmation input
- Show/Hide password
- Show/Hide confirmation
- validation
- invalid/expired/used token handling
- success state
- navigation to Login after successful setup

Activation establishes the initial password for a Pending user.

## 9. Login Contract

The canonical authentication route is `/login` for Clinic Admin and all clinic staff.

It must provide:
- email
- password
- Show/Hide password
- Forgot Password
- loading state
- invalid credentials state
- inactive account state
- correct post-login tenant/user context

No separate employee login is introduced.

## 10. Forgot Password Contract

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

Recovery is not the same state transition as account activation or reactivation.

## 11. Ordinary Data Edit Contract

Changing non-authentication data must update CORE SYSTEM directly.

Examples:
- name
- phone
- profile/contact data
- role
- workspace
- direct permissions
- explicit overrides

These operations must not require email activation or password reset.

## 12. Email Change Contract — Staff

Email is authentication-sensitive.

```text
Current email
  ↓
Request new email
  ↓
Verification sent to new email
  ↓
Successful verification
  ↓
New email becomes canonical
  ↓
Old email is no longer the login email
```

Before successful verification, the current valid login identity must not be destroyed solely because a change was requested.

The following IDs remain unchanged:
- Tenant ID
- CORE User ID
- Auth User ID

## 13. Email Change Contract — Clinic Admin

Clinic Admin email change is initiated from the clinic/account settings surface, not ordinary staff User Management.

The same verification model applies and must preserve Tenant ID, CORE User ID, and Auth User ID.

## 14. Deactivation Contract

```text
Active
  ↓
Deactivate
  ↓
CORE `is_active = false`
+
Auth access blocked
  ↓
Inactive
```

No business data is deleted.

## 15. Reactivation Contract

```text
Inactive
  ↓
Reactivate
  ↓
CORE `is_active = true`
+
Auth access unblocked
  ↓
Active
```

If the user previously completed activation, no new invitation and no new password are required.

## 16. Authorization Contract

```text
Role Permissions
+
Direct User Permissions
+
Explicit Overrides
→ Effective Access
```

No second permission engine may be introduced.

Clinic Admin remains tenant authority and is protected from ordinary-user restriction semantics.

## 17. Database Integrity Contract

Creation/edit implementation must satisfy:
- UUID `clinic_users.id`
- valid `tenant_id`
- valid `auth_user_id` when Auth identity exists
- tenant-scoped email uniqueness per approved lifecycle/deletion rules
- unique employee code
- employee code within DB column limit
- no orphaned required records after failure

The known Production schema constraint that `clinic_users.id` is NOT NULL without a DB default must be respected explicitly by the application or a deliberate migration.

## 18. Failure/Compensation Contract

A Create/Edit operation is successful only when all required layers are consistent.

Examples of invalid final states:
- CORE user exists but required Auth identity creation failed
- Auth identity exists but required CORE user creation failed
- workspace/access configuration failed while UI reports success
- invitation was reported as sent when it was not

Required behavior is clear error + compensation/rollback where possible + no false success.

## 19. Mandatory Acceptance Matrix

| # | Scenario | Required result |
|---|---|---|
| 1 | Create employee | CORE user + Auth identity + configuration + Pending state |
| 2 | Invitation | Email sent with production-safe link |
| 3 | Activation | Employee reaches `/activate` and sets password |
| 4 | First login | Same `/login`; correct tenant/context |
| 5 | Profile edit | DB changes directly; no activation |
| 6 | Role/workspace/access edit | Changes persist; no password flow |
| 7 | Resend | Fresh invitation for Pending user |
| 8 | Deactivate | CORE + Auth blocked |
| 9 | Reactivate | CORE + Auth unblocked; existing password retained |
| 10 | Forgot password | Recovery email + new password |
| 11 | Staff email change | New email verified; old login email retired |
| 12 | Clinic Admin email change | Same verified change; clinic identity preserved |
| 13 | Clinic Admin protection | Role/authority/deactivation/delete attempts blocked |
| 14 | Show/Hide password | Works on Login and Activation/Recovery |
| 15 | Duplicate email | Safely rejected |
| 16 | Employee-code collision | Safely resolved/retried |
| 17 | Create failure | No inconsistent orphan state; no false success |
| 18 | Production redirect | No localhost in production |

## 20. Execution Order

Implementation must follow this order:

1. Baseline current `main` and Production schema.
2. Verify all existing Team & Access decisions against implementation.
3. Repair identity/DB contract.
4. Repair Create.
5. Repair Edit separation.
6. Implement/repair Pending + Invitation + Resend Invitation.
7. Implement/repair `/activate`.
8. Repair `/login` and Forgot Password.
9. Implement staff email-change verification.
10. Implement Clinic Admin email-change verification in clinic/account settings.
11. Implement/verify Deactivate + Reactivate.
12. Verify Clinic Admin protection.
13. Run integration/regression tests.
14. Deploy to Production.
15. Validate the complete end-to-end scenarios against Production.
16. Update closure evidence only after runtime validation succeeds.

## 21. Non-Negotiable Anti-Regression Rules

- Do not reintroduce administrator-set employee passwords as a workaround for broken invitations.
- Do not create a separate employee login system.
- Do not create a new tenant when changing an email.
- Do not create a new CORE User ID when changing an email.
- Do not create a new Auth identity for ordinary email changes unless the Auth provider contract explicitly requires identity replacement; the preferred contract is to retain the same identity.
- Do not trigger activation for ordinary profile edits.
- Do not treat Reactivate as Resend Invitation.
- Do not treat Forgot Password as Reactivate.
- Do not treat Pending as Inactive.
- Do not allow Clinic Admin to be reduced through ordinary User Management.
- Do not declare closure from build success alone.

## 22. Closure Evidence

Final closure requires evidence for:

**Architecture → UX → Code → Database → Auth → Permissions → Integration → Runtime → Security → Regression → Documentation**

Every mandatory scenario must be either directly runtime-tested or have an explicit, evidence-backed limitation. No untested behavior may be described as verified.
