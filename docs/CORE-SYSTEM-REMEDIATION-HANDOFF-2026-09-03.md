# CORE SYSTEM — Remediation & Production Handoff
## RBAC / Permissions / RLS / RPC + Patient Flow
### Date: 2026-09-03

## 1. Purpose

This document is the operational handoff for the completed **Approved Non-Breaking Remediation Contract** and its authorized dependency-security Change Order.

It records the final implementation state, evidence boundaries, migration reconciliation, authorization model, Patient Flow ownership, duplication cleanup, GitHub merge, and production deployment.

This document is a handoff record, not a new architecture decision and not a replacement for the repository's approved architecture SSOT.

---

## 2. Final Status

**PRODUCTION CLOSED — COMPLETE**

Final chain:

Architecture SSOT → Approved Remediation → DB/RLS/RPC + Application Changes → Verification → Dependency Security Repair → Full GitHub Checks Green → Merge → Production Deployment

Final merge commit:

`40f0a8c348c17af0da9f5bb3135dc54f6149012a`

Pull Request:

`#62 — Approved Non-Breaking Remediation`

Production deployment:

`dpl_3WRxLqJpLsAQeWeM8acpYFpQiXAy`

Production deployment target: `production`

Deployment status: **READY**

---

## 3. Scope Closed

The following Work Packages are closed:

- 1.1 Canonical Role Resolution
- 1.2 Clinic Admin DB Invariant
- 1.3 Administrative Password Path Removal
- 1.4 Resource Requirement Orphan Removal
- 1.5 RLS Authorization Hardening
- 1.6 Sensitive RPC Hardening
- 1.7 D2 Atomic Agenda Status + D19 Patient Overlap
- 2.1 D7 Visit Transition Ownership
- 2.2 D1 Agenda ↔ Visit Integration Contract
- 2.3 D6 Arrival Integrity
- 3.1 Follow-up → Operational Work authorization boundary
- 3.2 F-13 Canonical identity mapping
- 3.3 F-14 Live PermissionGuard
- 3.4 F-15 Permission cache invalidation/shortening
- 3.5 D10 Duration-aware Queue ETA
- 3.6 D11 Workspace permission-string cleanup

All were accepted as completed before the final dependency Change Order and were not reopened unnecessarily.

---

## 4. Canonical Authorization Model

### Role

The canonical role source is:

`clinic_users.role_id`

`role_template_id` remains only for compatibility and is not used for effective permission calculation inside the DB authorization functions.

### Effective permissions

The effective permission model is composed from the canonical role and the approved direct/override permission layers.

`permissionMatrix.ts` is not a security boundary. Runtime authorization uses live effective permissions.

### Identity

Application authorization paths map the authenticated identity explicitly to:

`clinic_users.id`

Direct comparisons between `auth.uid()` and `clinic_users.id` are not used as an implicit identity model.

---

## 5. Clinic Admin Invariant

Clinic Admin is a protected tenant administrator.

DB enforcement prevents:

- self-demotion;
- demotion of another protected Clinic Admin;
- disabling the protected Clinic Admin;
- deletion of the protected Clinic Admin;
- conversion to another role;
- creation of an additional active Clinic Admin where the invariant requires a single active administrator.

The invariant is enforced at database level and therefore is not dependent on UI or Server Action behavior.

---

## 6. User Activation Model

The administrative-password path was removed.

Removed concepts include:

- `directActivation`;
- administrative password input in User Management;
- `createDirectAuthAccount(password)`;
- `setDirectAuthPassword(...)`.

Final model:

**Clinic Admin creates user → invitation email → `/activate` → employee sets own password.**

Clinic Admin cannot view or enter the employee's password through User Management.

---

## 7. RLS Authorization Boundary

The hardened pattern is:

**Tenant isolation + `has_tenant_permission(tenant_id, permission_key)`**

Applied to:

### `clinic_patients`

- SELECT → `patients:read`
- INSERT → `patients:create`
- UPDATE → `patients:update`
- DELETE → `patients:delete`

### `master_agenda_events`

- SELECT → `agenda:read`
- INSERT → `agenda:create`
- UPDATE → `agenda:update`
- DELETE → `agenda:delete`

### `clinic_procedures`

- SELECT → `procedures:read`
- INSERT → `procedures:create`
- UPDATE → `procedures:update`
- DELETE → `procedures:delete`

### `retention_followups`

- SELECT → `followup:read`
- INSERT → `followup:create`
- UPDATE → `followup:update`

### `inventory_items`

- SELECT → `inventory:read`
- Existing write authorization pattern preserved.

---

## 8. Sensitive RPC Boundary

The sensitive functions use explicit tenant matching and appropriate permission checks:

- `execute_commercial_sale`
- `consume_procedure_inventory`
- `validate_procedure_resources_for_booking`
- `get_workforce_unavailability`

Required tenant guard:

`p_tenant_id <> get_current_tenant_id()` → `Tenant mismatch`

Target records are also validated against the current tenant.

`validate_procedure_resources_for_booking` no longer has `anon`/`PUBLIC` execution access; the intended authenticated execution boundary is preserved.

---

## 9. Resource Requirement Decision

The orphan Resource Requirement implementation was **removed**, not rebuilt.

Removed/disabled:

- `enforce_procedure_resource_requirement` trigger
- `enforce_procedure_resource_requirement()`
- active operational dependency on `clinic_procedure_resources`

`validate_procedure_resources_for_booking()` explicitly reports that there is no active Resource Requirement model rather than querying an orphan model.

This is intentional and follows the approved architectural decision.

---

## 10. Agenda / Visit Ownership

The approved Visit transition ownership is:

**Doctor**

`finishClinicalVisit()`

→ `pending_close`

**Reception**

reception close

→ `completed`

The old direct physician completion path from `in_consultation` was removed/disabled.

`pending_close` is a Visit-only state and intentionally has no Agenda equivalent.

### Agenda ↔ Visit mapping

| Agenda | Visit |
|---|---|
| `arrived` | `waiting` |
| `in_session` | `in_consultation` |
| `completed` | `completed` |
| `cancelled` | `cancelled` |
| `no_show` | `no_show` |

---

## 11. Agenda Integrity

### D2

Agenda status updates are atomic and use the expected current status as part of the update predicate. Zero updated rows are treated as an explicit state conflict.

### D19

The additive patient-overlap exclusion constraint is present:

`no_patient_overlap`

Live conflicting data was checked before adding the constraint.

### D6

When `agenda_event_id` is supplied to arrival registration, patient/doctor/room identity is derived from the Agenda record rather than accepting independently conflicting identifiers.

Walk-in registration remains a separate path.

---

## 12. Secondary Corrections

### Follow-up bridge

Protection at `retention_followups` is the authorization boundary for:

`retention_followups → operational_work_items`

No redundant second authorization layer was introduced.

### PermissionGuard

Runtime guard uses live effective permissions.

Static permission data, where retained for UI optimization, is presentation-only and not a security control.

### Permission cache

Permission cache duration was reduced and refresh behavior was added so permission changes do not remain stale for the previous long interval.

### Queue ETA

ETA is duration-aware rather than using a universal 30-minute estimate.

### Workspace strings

`workspace:administration`, `workspace:operation`, and `workspace:clinical` are not treated as ordinary authorization permissions. Workspace is context/navigation; domain permissions are authorization.

---

## 13. Duplication Cleanup — Architectural Result

The remediation deliberately removed competing sources of truth.

### Permission engine

One runtime authorization source: live effective permissions.

### Role source

One canonical role source: `clinic_users.role_id`.

### User identity

One mapped application identity: `clinic_users.id`.

### Visit completion

One controlled workflow:

Doctor → `pending_close` → Reception → `completed`.

### Resource Requirement

No parallel orphan model and validation trigger remain active.

### Workspace authorization

Workspace context is separated from Domain authorization.

### Agenda / Visit state

No second state machine was introduced; the two domains have an explicit integration contract.

---

## 14. Migration Reconciliation

Production migration ledger was compared against repository migration files before remediation.

Historical production migration versions without exact filename matches in the repository were recorded rather than silently rewritten or replayed.

The remediation migrations are now represented in the repository:

- `20260903080530_approved_non_breaking_rbac_patient_flow_remediation_20260903.sql`
- `20260903081055_patient_flow_reception_close_permission_20260903.sql`
- `20260903081638_canonicalize_has_effective_permission_role_id_20260903.sql`
- `20260903081911_fix_validate_resource_rpc_public_execute_20260903.sql`
- `20260903081943_restore_sensitive_rpc_bodies_with_contract_guards_20260903.sql`

The reconciliation record is maintained in:

`docs/REMEDIATION-MIGRATION-LEDGER-GAP-2026-09-03.md`

Historical gaps are not treated as instructions to replay old migrations.

---

## 15. Dependency Security Change Order

The only approved dependency change was the security repair for the browserslist chain.

Updated lockfile dependencies included:

- `browserslist` → `4.28.8`
- `caniuse-lite` → `1.0.30001810`

No unrelated major-version upgrade was introduced.

The Production dependency security audit subsequently passed.

---

## 16. Verification Gate

The final verification gate covered:

- RBAC role resolution;
- Clinic Admin invariants;
- RLS CRUD boundaries;
- Nurse restrictions;
- Receptionist permission boundaries;
- Doctor permission boundaries;
- cross-tenant RPC rejection;
- Agenda/Visit transition ownership;
- Patient Flow sequence;
- migration reconciliation;
- repository lint/build/type validation;
- dependency security audit;
- documentation/static audits required by CI.

The final GitHub verification gate was green before merge.

---

## 17. GitHub State

Repository:

`mdcode2026-core-sys/Core-System-clinic-`

PR:

`#62`

Final merge commit:

`40f0a8c348c17af0da9f5bb3135dc54f6149012a`

PR state: **MERGED**

The commit's GitHub combined status includes successful Vercel deployment statuses for the same commit.

---

## 18. Production State

Production deployment was executed only after GitHub verification and merge.

Deployment:

`dpl_3WRxLqJpLsAQeWeM8acpYFpQiXAy`

Status:

**READY**

The Vercel deployment corresponds to merge commit:

`40f0a8c348c17af0da9f5bb3135dc54f6149012a`

Vercel was used for deployment-status confirmation only, consistent with the contract.

---

## 19. Explicit Non-Scope

The following remain outside this handoff and were not modified by this contract:

- `master_tenants`
- `subscriptions`
- `subscription_events`
- Super Admin / Tenant Control layer

They require their own approved contract if later remediation is required.

This handoff must not be interpreted as authorization to modify those areas.

---

## 20. Handoff Rules for Future Work

Future engineers must preserve these invariants:

1. Do not introduce a second effective-permission engine.
2. Do not use `role_template_id` as a permission source.
3. Do not weaken the Clinic Admin DB invariant at UI/application level.
4. Do not reintroduce administrative password creation for staff.
5. Do not resurrect the removed Resource Requirement model without an explicit architectural decision.
6. Do not allow Doctor to bypass `pending_close` and directly complete a Visit.
7. Do not treat Workspace context strings as authorization permissions.
8. Do not bypass tenant checks in sensitive RPCs.
9. Do not add redundant authorization layers when the protected mutation source already provides the required boundary.
10. Any future change affecting these boundaries must be reconciled against the current architecture SSOT before implementation.

---

## 21. Closure Statement

This document records the final handoff state of the approved remediation.

**RBAC / Permissions / RLS / RPC boundary: CLOSED**

**Patient Flow transition boundary: CLOSED**

**Approved secondary corrections: CLOSED**

**Dependency security blocker: CLOSED**

**GitHub verification: CLOSED / GREEN**

**Main merge: COMPLETE**

**Production deployment: READY**

**Contract status: PRODUCTION CLOSED**
