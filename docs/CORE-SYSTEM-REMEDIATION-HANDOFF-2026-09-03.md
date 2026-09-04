# CORE SYSTEM — Remediation & Production Handoff
## 2026-09-03 / continued 2026-09-04

This handoff records the approved non-breaking remediation, the authorized restoration of Direct Activation, the dependency-security change order, and the mandatory stage-boundary governance used to prevent legacy/mapping contamination.

## 1.3 — DIRECT ACTIVATION RESTORED

The previous removal of Direct Activation is superseded by the authorized operational correction. Email activation remains an alternative path because it is not a reliable sole activation/recovery mechanism for the current operating model.

### User Configuration UI — verified implementation boundary

`src/features/settings/users/UserConfigurationForm.tsx` is the single User Configuration UI path for Add User and Edit User.

The final form order is now:
1. Basic information
2. Role & workspace
3. Permissions & exceptions
4. Activation configuration
5. Save / Cancel

The Activation configuration section is deliberately the final configuration section immediately before Save. It exposes both:
- **Email activation** — the existing invitation path.
- **Direct activation** — administrative password setup for the Auth account.

The same activation-mode control is used for both Add and Edit. Existing email resend/setup action remains available inside the final Activation section for existing users.

### Security boundary

Passwords are authentication secrets owned by Supabase Auth. They must never be stored in `clinic_users`, another application table, logs, or client-visible persistent state.

Direct activation is application-level. No PostgreSQL password-storage migration is required. No migration named `20260903093000_restore_admin_direct_activation_safely.sql` exists or is claimed as part of this implementation.

The server-side operation resolves the caller and target within the tenant boundary, protects Clinic Admin, and performs credential operations server-side without exposing a service-role credential to the browser.

### Direct Activation behavior

- New direct-activation users are created directly in Supabase Auth with confirmed email and the configured password.
- The same generated `clinic_users.id` is used in the Auth metadata mapping; no alternate provisional identity remains.
- Existing ordinary users can use Direct Activation in Edit to set a password through the existing Auth account.
- Selecting Email activation in Edit does not deactivate or otherwise alter an already-active account.
- Disabling the Direct Activation option in a future UI/configuration change must not deactivate or alter accounts that were already activated.
- Clinic Admin remains protected and cannot be mutated through User Management.

## Canonical Authorization / Identity

- **Canonical role:** `clinic_users.role_id`.
- **`role_template_id`:** compatibility only; never an authorization source.
- **Runtime authorization:** live effective permission resolution.
- **Identity mapping:** `clinic_users.id` ↔ `auth_user_id` inside the tenant boundary.
- **Clinic Admin invariant:** authoritative and protected.

## Stage Boundary / Legacy Contamination Governance — MANDATORY

A completed/audited Stage must be cleaned and isolated at its own boundary, while untouched future scope must not be redesigned, deleted, renamed, or cleaned before its own Inspect → Map → Reconcile → Implement → Verify → Document cycle.

The goal is not premature repository-wide cleanup. The goal is to prevent completed work from leaving executable legacy mappings that can affect current behavior while preserving untouched scope until its own architecture and SSOT are verified.

Every artifact in an audited scope is classified as Current/SSOT, Required Compatibility, Superseded, Obsolete, Historical Documentation, Untouched/Not Yet Audited, or Unclear before action.

A legacy artifact is a boundary defect when it can still affect current behavior, authorization, identity resolution, workflow transitions, UI mapping, RPC execution, or cross-domain mapping.

## SSOT — Single Source of Truth

SSOT means the one authoritative source for a given concept. A concept must not have competing executable definitions that can produce different answers. The SSOT may be a database model, domain contract, workflow definition, architecture decision, or other explicitly approved canonical source.

Preserved examples:
- Role resolution → `clinic_users.role_id`.
- Effective authorization → canonical live permission resolution.
- Identity → `clinic_users.id` ↔ `auth_user_id`.
- Patient Journey → approved PJ Master Documents.
- Workflow ownership → approved workflow/state contract.

All dependent layers — UI, Server Actions, RPCs, database enforcement, and documentation — must consume the same canonical truth.

## Mapping Governance

**Module ↔ Domain ↔ Feature ↔ Role ↔ Permission ↔ User ↔ Workflow ↔ DB/RPC ↔ UI**

No layer may silently introduce a second mapping authority. Workspace context is operational context, not an authorization permission.

## Preserved Remediation Boundaries

RLS remains tenant-isolated with `has_tenant_permission(...)`. Sensitive RPCs retain tenant matching and target-record tenant validation. The Resource Requirement enforcement path remains removed. Patient Flow remains:

**Doctor → `pending_close` → Reception → `completed`**

`pending_close` remains Visit-only.

## Duplication Result

Direct activation is an additional activation mode, not a second authentication authority. Email and Direct Activation both terminate in Supabase Auth credentials.

No second permission engine, role source, identity source, Visit completion path, or Resource Requirement model is introduced.

## Verification Gate / Evidence

Required closure evidence for this correction:
1. Add and Edit expose both activation modes.
2. Activation configuration is the last configuration section before Save.
3. Clinic Admin is protected.
4. Server authorization remains tenant/user scoped.
5. Password is handled only by Supabase Auth and is not persisted/logged by application code.
6. Existing ordinary users can be recovered without relying solely on email.
7. Email activation remains available.
8. `clinic_users.id` and Auth metadata identity remain aligned.
9. Production build and deployment complete successfully.
10. Runtime/UX verification must distinguish actual browser verification from build success.

The 2026-09-04 UI correction changed only `UserConfigurationForm.tsx`; no untouched Module/Domain/Workflow was reopened.

## Closure Boundary

"Closed" means the audited scope satisfies its defined acceptance criteria. It does not imply that untouched future scope has been audited or redesigned.

## Status

**Original remediation: CLOSED / ACCEPTED**

**Dependency security Change Order: CLOSED / ACCEPTED**

**Direct Activation: IMPLEMENTED / UI RESTORED IN ADD + EDIT / PRODUCTION BUILD READY**

**Stage-boundary + SSOT governance: DOCUMENTED / MANDATORY**

**RBAC/RLS/RPC architecture: PRESERVED**

**Patient Flow ownership: PRESERVED**
