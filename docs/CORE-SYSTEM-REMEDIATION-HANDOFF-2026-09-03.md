# CORE SYSTEM — Remediation & Production Handoff
## 2026-09-03

This handoff records the completed Approved Non-Breaking Remediation Contract, dependency-security Change Order, and the authorized correction to Work Package 1.3.

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

The server-side operation must authorize the requesting Clinic Admin, resolve the target through the tenant's `clinic_users` identity, enforce the protected Clinic Admin invariant, and perform the Auth credential operation server-side without exposing a service-role credential to the client.

The additive migration documenting this boundary is:

`supabase/migrations/20260903093000_restore_admin_direct_activation_safely.sql`

This migration is documentation/DB-boundary metadata only; it is **not** permission to persist passwords in PostgreSQL.

## Canonical Authorization Preserved

- Canonical role: `clinic_users.role_id`.
- `role_template_id`: compatibility only.
- Runtime authorization: live effective permissions.
- Application identity: explicit `clinic_users.id` mapping.
- Clinic Admin DB invariant remains authoritative.

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
7. UI → Server Action → Supabase Auth/Data boundary produce the intended authorization result.

No other Work Package is reopened by this correction.

## Explicit Non-Scope

`master_tenants`, `subscriptions`, `subscription_events`, and the Super Admin/Tenant Control layer remain outside this contract.

## Handoff Rules

Future work must not remove direct activation again while no reliable activation/recovery channel exists; store passwords in application tables; expose service-role credentials to the client; bypass tenant/user mapping; weaken the protected Clinic Admin invariant; use `role_template_id` for authorization; create a second permission engine; allow Doctor to bypass `pending_close`; resurrect Resource Requirement without explicit architectural approval; or treat Workspace context as an authorization permission.

## Status

**Original remediation: CLOSED / ACCEPTED**

**Dependency security Change Order: CLOSED / ACCEPTED**

**Direct Activation correction: RESTORED / IMPLEMENTATION BOUNDARY DOCUMENTED / VERIFICATION REQUIRED**

**RBAC/RLS/RPC architecture: PRESERVED**

**Patient Flow ownership: PRESERVED**
