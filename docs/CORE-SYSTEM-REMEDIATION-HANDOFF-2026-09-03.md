# CORE SYSTEM — Remediation & Production Handoff
## 2026-09-03

This handoff records the completed Approved Non-Breaking Remediation Contract, dependency-security Change Order, the authorized correction to Work Package 1.3, and the governance rules required to prevent legacy/mapping contamination between completed and not-yet-audited scope.

## 1.3 — DIRECT ACTIVATION RESTORED

The previous removal of `directActivation`, the administrative password input, `createDirectAuthAccount(password)`, and `setDirectAuthPassword(...)` is **superseded by the authorized operational correction**.

Reason: the current email activation channel is not a reliable sole activation/recovery mechanism. User Management therefore restores an administrative direct-activation/recovery path for ordinary clinic users.

Restored capability:
- Direct Activation option in User Management.
- Password input for that mode.
- Direct activation for a newly created ordinary user.
- Password recovery/reset for an existing ordinary user who cannot use email activation.
- Email activation remains available as an alternative path.

### Security boundary

The password is an authentication secret owned by Supabase Auth. It must never be stored in `clinic_users` or another application table, logged, or returned to the browser after processing.

The server-side operation authorizes the requesting Clinic Admin, resolves the target through the tenant's `clinic_users` identity, enforces the protected Clinic Admin invariant, and performs the Auth credential operation server-side without exposing a service-role credential to the client.

The direct-activation implementation is application-level; no PostgreSQL password-storage migration is required. The previously documented migration filename `20260903093000_restore_admin_direct_activation_safely.sql` is therefore **not treated as an existing migration** and is removed from the implementation claim.

## Canonical Authorization Preserved

- **Canonical role:** `clinic_users.role_id`.
- **`role_template_id`:** compatibility only; it must not participate in authorization resolution.
- **Runtime authorization:** live effective permissions.
- **Application identity:** explicit `clinic_users.id` mapping to `auth_user_id`.
- **Clinic Admin DB invariant:** remains authoritative and protected.

## Stage Boundary / Legacy Contamination Governance

This is a mandatory rule for all future work:

> **A completed/audited Stage must be cleaned and isolated at its own boundary, but untouched future scope must not be redesigned, deleted, renamed, or "cleaned" before it has undergone its own Inspect → Map → Reconcile → Implement → Verify → Document cycle.**

The objective is **not** to clean the entire repository prematurely. The objective is to prevent completed work from leaving executable legacy mappings that can influence other scopes, while preserving untouched scope until its own architecture and SSOT are verified.

### Required treatment of every discovered artifact

Every legacy-looking artifact within the audited scope must be classified before action:

1. **Current / SSOT** — retain and reference it as canonical.
2. **Required Compatibility** — retain only when technically required, with explicit non-authoritative status.
3. **Superseded** — remove it from executable resolution/mapping paths; retain historical documentation only when useful.
4. **Obsolete** — remove when it is demonstrably inside the audited scope and no longer required.
5. **Historical Documentation** — may remain as history, but must not be presented as current architecture.
6. **Untouched / Not Yet Audited** — do not alter merely because it appears old; defer it to its own Stage audit.
7. **Unclear** — do not delete or reinterpret until ownership and SSOT are established.

### Contamination test

The key question is not simply whether an old artifact exists. The required question is:

> **Can this artifact still affect current behavior, authorization, identity resolution, workflow transitions, UI mapping, RPC execution, or cross-domain mapping?**

If yes, it is a boundary defect and must be resolved within the audited scope. If no, it may remain only if its status is explicit and it cannot act as a competing source of truth.

## SSOT — Single Source of Truth

**SSOT means Single Source of Truth: the one authoritative source for a given concept.**

A concept must not have competing executable definitions that can produce different answers. A SSOT can be a database model, domain contract, workflow definition, architecture decision, or other explicitly approved canonical source; it does not necessarily mean one file.

Examples preserved by this remediation:
- Role resolution → `clinic_users.role_id`.
- Effective authorization → canonical live permission resolution.
- Identity mapping → `clinic_users.id` ↔ `auth_user_id` within the tenant boundary.
- Patient Journey architecture → approved PJ Master Documents.
- Workflow state ownership → approved workflow/state contract.

All dependent layers — UI, Server Actions, RPCs, database enforcement, and documentation — must consume the same canonical truth rather than creating competing mappings.

## Mapping Governance

The canonical mapping chain must remain explicit:

**Module ↔ Domain ↔ Feature ↔ Role ↔ Permission ↔ User ↔ Workflow ↔ DB/RPC ↔ UI**

No layer may silently introduce a second mapping authority. Workspace context may describe operational context, but it must not become a substitute authorization permission.

## Other Closed Remediation Boundaries Preserved

RLS continues to use tenant isolation plus `has_tenant_permission(...)`. Sensitive RPCs retain tenant matching and target-record tenant validation. `validate_procedure_resources_for_booking` remains unavailable to PUBLIC/anon.

The orphan Resource Requirement implementation remains removed.

Patient Flow remains:

**Doctor → `pending_close` → Reception → `completed`**

`pending_close` remains Visit-only.

## Duplication Result

Direct activation is an additional **activation mode**, not a second authentication authority. Email activation and direct activation both terminate in Supabase Auth credentials.

No second permission engine, role source, identity source, Visit completion path, or Resource Requirement model is reintroduced.

## Required 1.3 Verification Gate

Before this correction is declared production-closed, verify:

1. UI exposes Direct Activation and Password only inside authorized User Management.
2. Protected Clinic Admin cannot be mutated through this path.
3. Server Action rejects unauthorized callers and cross-tenant targets.
4. Password is handled server-side by Supabase Auth and is never persisted/logged by application code.
5. Existing ordinary users can be recovered without relying on email delivery.
6. Email activation remains available as fallback.
7. The `clinic_users.id` used for the direct account is the same identity mapped into Auth metadata; no alternate provisional ID is left behind.
8. UI → Server Action → Supabase Auth/Data boundary produces the intended authorization result.

No other Work Package is reopened by this correction.

## Explicit Non-Scope

`master_tenants`, `subscriptions`, `subscription_events`, and the Super Admin/Tenant Control layer remain outside this contract.

Untouched future Modules/Domains/Workflows remain outside this cleanup boundary until their own approved audit and implementation cycle.

## Handoff Rules

Future work must not remove direct activation again while no reliable activation/recovery channel exists; store passwords in application tables; expose service-role credentials to the client; bypass tenant/user mapping; weaken the protected Clinic Admin invariant; use `role_template_id` for authorization; create a second permission engine; allow Doctor to bypass `pending_close`; resurrect Resource Requirement without explicit architectural approval; treat Workspace context as an authorization permission; or modify untouched future scope merely to make current mappings appear clean.

Every future Stage must close its own boundary before being marked complete and must record any compatibility remnants, superseded artifacts, and verified SSOT mappings.

## Evidence / Closure Boundary / Deduplication

### Evidence

Closure claims require concrete evidence appropriate to the boundary: source inspection, database verification, authorization tests, workflow tests, CI results, and runtime/UX verification where applicable. A successful build alone is not runtime verification.

### Closure Boundary

"Closed" means the audited scope has satisfied its defined acceptance criteria. It does **not** mean the untouched system is implicitly audited or redesigned.

### Deduplication

The system must retain one authoritative implementation per concern. Compatibility remnants are allowed only when explicitly required and must not become a second SSOT or executable mapping authority.

## Status

**Original remediation: CLOSED / ACCEPTED**

**Dependency security Change Order: CLOSED / ACCEPTED**

**Direct Activation correction: IMPLEMENTED / IDENTITY MAPPING GUARD FIXED / VERIFICATION REQUIRED**

**Stage-boundary + SSOT governance: DOCUMENTED / MANDATORY FOR FUTURE WORK**

**RBAC/RLS/RPC architecture: PRESERVED**

**Patient Flow ownership: PRESERVED**
