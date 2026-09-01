# CORE SYSTEM — Team & Access Final Execution & Closure

**Date:** 2026-09-02 correction  
**Scope:** Team & Access user administration only  
**Correction commits:** `684814f30d46da9942999105c4de11e0f07a5a6e`, `0edfc7b628cdc260e56398ba036dd3bf1d525e1e`

## Executive Result

The approved Team & Access simplification remains the final architecture. A material omission in the previous closure was identified and corrected: the User Form had lost the agreed `Active / Not active` account-status control and incorrectly presented Supabase Auth self-service activation as the only password path. That was not accepted architecture and is now removed from the primary creation flow.

Final UX model:

```text
Team & Access
├── Users
│   └── Unified User Configuration Form
├── Roles
└── Advanced
```

The superseded duplicate Users Manager remains removed. The canonical users surface is the unified manager and unified user form.

## Correct User Creation Contract

User creation now requires, in the same User Form:

- Basic information
- Role
- Workspace
- Direct permissions
- Exceptions / overrides
- **Account status: Active / Not active**
- **Password**

The Clinic Admin sets the initial password during configuration. The password is passed directly to Supabase Auth and is **never stored in the CORE SYSTEM database**.

The primary creation flow no longer depends on an email invitation or activation link. Supabase Auth creates the credentialed account with email confirmation already satisfied. Therefore a newly created **Active** account can sign in immediately with its configured password, while a **Not active** account is blocked at both the CORE SYSTEM account layer and the Supabase Auth ban layer.

This removes the previous failure mode where `USER_CREATE_FAILED` could be caused by an unavailable/broken activation-email path.

## User Edit Contract

The same User Form is used for editing.

- Active / Not active can be changed there.
- Password can be replaced there; leaving it blank preserves the current password.
- Email, role, workspace, direct permissions, and overrides remain in the same configuration flow.
- Password is never persisted to `clinic_users` or any CORE SYSTEM table.

## Password / PIN Decision

`password` is the authoritative authentication credential through Supabase Auth.

The existing `pin_code` database column was **not deleted, renamed, or structurally modified**. Functional PIN behavior remains retired. New records continue to receive only the inert compatibility value required by the existing schema; PIN is not displayed, generated as a login credential, validated, or used for authentication.

The activation-link path is no longer a prerequisite for initial account activation. Existing activation/reset infrastructure is not used to block creation.

## Phase 1 → Phase 14 Correction Status

### Phase 1 — Final UX contract
Completed and corrected. The User Form explicitly includes account status and password.

### Phase 2 — Unified User Form
Completed. Create and Edit use the same form.

### Phase 3 — Role + Workspace
Completed. Role selection and workspace assignment are part of the same user configuration flow while remaining separate domain concepts.

### Phase 4 — Permissions
Completed. Direct permissions use the existing permission catalog and persistence model.

### Phase 5 — Exceptions / Overrides
Completed. Explicit revokes use the existing override model.

### Phase 6 — Account + authentication
**Corrected and completed.** Password is configured in the User Form. Active status is configured in the User Form. Supabase Auth is used for authentication, but email invitation/activation is not a prerequisite for account creation.

### Phase 7 — User settings boundary
Completed. Personal settings remain personal and are not converted into authorization settings.

### Phase 8 — Advanced consolidation
Completed. Advanced remains the deep Team & Access administration branch without becoming a prerequisite for normal user setup.

### Phase 9 — Users / Roles / navigation simplification
Completed. The old duplicate Users Manager remains removed.

### Phase 10 — Database integrity + authorization reconciliation
Completed. No new database change was required for the password correction. Existing email uniqueness and authorization reconciliation remain intact.

### Phase 11 — RLS / security validation
Completed for the Team & Access changes. Password is never written to the application database.

### Phase 12 — Runtime / production validation
Production build validation is required after this correction before a new closure claim is made. The previous closure statement that depended on the activation flow is superseded by this correction.

### Phase 13 — Regression boundary
The correction is confined to Team & Access user types, user actions, user form, and Team & Access documentation. No unrelated module/domain was intentionally changed.

### Phase 14 — Documentation + closure
This correction is documented here and must be followed by final production build verification.

## Clinic Admin Protection

The current Clinic Admin account remains protected and is not changed by this correction. The Clinic Admin account remains the tenant-level authority and enterprise account as previously established.

## Final Architecture

```text
Users
  ↓
One complete User Configuration Form
  ↓
Basic + Role + Workspace + Permissions + Exceptions
  + Active status + Password
  ↓
Save
  ↓
Supabase Auth credential + CORE SYSTEM user configuration
```

`Roles` remains the independent role-definition surface.

`Advanced` remains the consolidated deep Team & Access administration surface.

**Important:** This corrected document supersedes the previous password/activation wording in the earlier closure document. No email activation link is required to make a newly created Active account usable.
