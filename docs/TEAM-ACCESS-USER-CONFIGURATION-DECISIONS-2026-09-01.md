# CORE SYSTEM — Team & Access User Configuration Decisions

**Date:** 2026-09-01  
**Scope:** Team & Access only  
**Status:** Approved for implementation and validation

## 1. Scope Boundary

This work is limited to Team & Access and the user-management workflow. No other module or domain may be changed unless a defect is directly connected to the user-management path and the fix is necessary to preserve its correctness, security, or data integrity. Unrelated findings are recorded for the final report and are not silently changed.

## 2. Primary UX Decision

`Users` is the primary operational entry point for user administration.

Creating and editing a user use the same unified User Configuration Form. The administrator completes the configuration and performs one Save action.

The form represents, in one place:
- Basic identity and contact information
- Role
- Workspace
- Direct permissions
- Explicit exceptions / overrides
- Account and invitation state
- Password/authentication model

The form does not create a second authorization engine. It writes to the existing canonical Team & Access structures.

## 3. Team & Access Navigation

The Team & Access surface is consolidated to three primary areas:

```text
Team & Access
├── Users
├── Roles
└── Advanced
```

`Advanced` is the deep administration surface. It is not a prerequisite for ordinary user creation or editing.

Advanced groups:
- Access Administration (direct permissions + overrides)
- Role Templates
- User Settings where the setting is genuinely administrable for another user
- Login lifecycle guidance/administration
- Workspace membership remains managed from the User Form rather than gaining a duplicate CRUD surface

## 4. Architectural Separation Preserved

The following remain independent concepts:

`User ≠ Role ≠ Permission ≠ Workspace ≠ Patient Flow ≠ Workflow`

The User Form brings these concepts together operationally without merging their underlying domain models.

Workspace membership is not an authorization boundary. Role and permissions remain the authorization model.

## 5. Authorization Model

The existing authorization architecture remains authoritative:

`Role Permissions + Direct User Permissions + Explicit Overrides → Effective Access`

No second permission engine is introduced.

Direct grants and explicit revokes remain distinct persisted concepts.

## 6. Clinic Admin

Clinic Admin is the tenant's highest operational authority. It is not treated as an ordinary limited employee account.

The primary current Clinic Admin account is protected from user-management mutation. It must remain:
- `role = clinic_admin`
- active
- linked to its existing Auth identity
- an Enterprise subscription account

## 7. Password and PIN Decision

Authentication is password-based through Supabase Auth.

Clinic Admin does not create, know, or manage another employee's password.

The existing `clinic_users.pin_code` database column is **not deleted or structurally changed** in this work. All functional PIN behavior is stopped:
- no random PIN generation
- no PIN UI
- no PIN validation
- no PIN authentication
- no PIN-based invitation flow

Because the current production schema still requires a non-null legacy column, newly created users receive only an inert compatibility value in that field. The field is not part of the authentication model.

## 8. Invitation Lifecycle

Invitation and reactivation remain tied to the user lifecycle and User Form/Users surface. They do not become a second user-configuration workflow.

Password setup is performed by the invited user through Supabase Auth.

## 9. Data Integrity

Tenant-level active email uniqueness is enforced at database level with a case-insensitive unique partial index. Application checks remain supplemental, not authoritative.

Employee-code generation uses collision-resistant identifiers and retry behavior.

## 10. Change Discipline

No unrelated module/domain is to be refactored as part of this task. Any directly related security, integrity, or workflow defect discovered while implementing Team & Access is fixed immediately. Unrelated findings remain in the final report.

## 11. Closure Rule

The task is not considered closed by successful compilation alone. Closure requires evidence across:

Architecture → UX → Code → Database → Permissions → Integration → Runtime → Security → Regression → Documentation.
