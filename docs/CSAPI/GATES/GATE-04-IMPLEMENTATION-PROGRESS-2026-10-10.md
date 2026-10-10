# Gate 04 — Implementation Progress Record

**Record date:** 2026-10-10  
**Gate:** 04 — Agenda & Scheduling  
**Controlling contract:** `docs/CSAPI/GATES/GATE-04-AGENDA-EXECUTION-CONTRACT-2026-09-29.md`  
**Implementation design:** `docs/CSAPI/GATES/GATE-04-AGENDA-IMPLEMENTATION-DESIGN-2026-09-29.md`  
**Execution plan:** `docs/CSAPI/GATES/GATE-04-IMPLEMENTATION-PLAN-2026-09-29.md`  
**Delivery PR:** #242 — Draft; base `main`; implementation branch `csapi/gate04-agenda-implementation-2026-10-10`  
**WP1–WP6 evidence reconciliation:** [`GATE-04-WP1-WP6-EVIDENCE-RECONCILIATION-2026-10-10.md`](GATE-04-WP1-WP6-EVIDENCE-RECONCILIATION-2026-10-10.md)  
**Reviewed candidate:** `8a2000350bc905427fb1ffdc2ffb4748c9b07b03`

## 1. Scope and engineering ownership

This work is confined to Agenda & Scheduling. Engineering implementation follows the controlling gate contract and the repository's AI engineering operating contract. Technical design, implementation, testing, security checks, evidence collection, and documentation are engineering responsibilities. No Product Owner decisions or new product/medical workflow rules are inferred.

No direct changes were made to `main`. No hosted Supabase schema, data, or migration-history changes were made. No production Vercel deployment or promotion was initiated. A non-production preview may be created automatically by the repository's Vercel Git integration.

## 2. Work-package status

| Work package | Current status | Implemented scope / remaining evidence |
|---|---|---|
| WP-1 — Canonical Mutation Boundary | Implemented on branch; verification pending | Agenda create, update, status transition, and cancel converge on a canonical server-side mutation service and four database command functions. Browser and ordinary authenticated roles cannot invoke the privileged RPCs or write the appointment table directly. |
| WP-2 — Booking Requirements + Provider Feasibility | Implemented on branch; verification pending | Uses the existing active, tenant-scoped Service/Procedure `provider_type` metadata. Provider-optional bookings are allowed only when no provider is required by that metadata. Existing availability/eligibility checks remain in use. |
| WP-3 — Resource Concurrency Policy | Contract adapter implemented; integrated verification pending | Defaults resources to exclusive capacity 1. Existing PostgreSQL exclusion constraints remain the final concurrency authority. No inactive historical resource-requirement model or parallel capacity engine was reactivated. |
| WP-4 — Appointment Audit | Implemented on branch; verification pending | Reuses `audit_trail` and the existing audit trigger function. Agenda create/update/status/cancel/reschedule are classified; rescheduling/rebooking carries a validated reason and actor attribution. Non-Agenda trigger behavior is intentionally preserved. |
| WP-5 — UI/Entry Surface Convergence | Implemented on branch; verification pending | Existing Agenda and Quick Appointment entry points route through the canonical mutation path. Provider requirement metadata reaches the applicable forms; clinic-local wall-clock values are preserved; a cancelled appointment can be rebooked through the lifecycle command. Duplicate browser-side Agenda mutation hooks were removed. |
| WP-6 — Verification Infrastructure | Implemented on branch; latest-head CI pending | Added a binding Gate 04 workstream descriptor, static audit, and CI-only local Supabase clean-replay/ACL/audit flow. Workstream planning explicitly prevents broad Agenda paths from accidentally reopening closed Gate 02 tests, while retaining bypasses for direct Gate 02 changes. |
| WP-7 — Integrated Verification | Open | Must pass typecheck/lint/build, latest-head Gate 04 static verification, isolated local clean migration replay and command/audit probes, plus applicable integration checks. Existing unrelated baseline checks are classified separately, not fixed by expanding Gate 04. |
| WP-8 — Production Release & Closure | Blocked / not started | Requires WP-7 evidence and an independently reconciled repository-vs-hosted migration lineage. No production DDL, hosted migration-history manipulation, merge, or production release is authorized by this progress record. |

## 3. Current verification evidence

Latest observed run: [Workstream Verification #38001733010](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38001733010), candidate `8a2000350bc905427fb1ffdc2ffb4748c9b07b03`. This run **completed and failed**; it was not pending.

- Engineering governance: PASS.
- Gate 04 static audit: PASS — 49 checks, 0 failures.
- Authenticated E2E: PASS.
- Presentation static/runtime lanes: PASS.
- Local Supabase startup, isolated local target guard, clean migration replay, schema/security inspection, protected command ACL, appointment-table write ACL, Agenda audit-trigger presence, and Agenda RLS-enabled checks: PASS.
- **Database flow: FAIL** before command/audit assertions. The fixture raised `GATE04_TEST_PERMISSION_MISSING=agenda:create` while querying `public.permissions`. Root cause is not yet determined; reconcile canonical permission keys, migrations/seeds, effective-permission logic and fixtures before any change.
- **Global i18n audit: FAIL** on ten literals in Follow-up, Kiosk and Patient Quick Registration files. These files are not changed by PR #242; keep this finding outside Gate 04 unless a direct dependency is demonstrated.
- Final verification gate: FAIL because required lanes did not all pass.

The detailed WP-by-WP evidence and exit assessment are maintained in the linked WP1–WP6 reconciliation record. Do not treat static success, a passed E2E lane, or implementation-present status as work-package closure.

## 4. Reconciled architecture and safety boundaries

1. The canonical write path is the Agenda mutation service → trusted server-only command caller → tenant/actor-validated database command functions → existing appointment table and constraints.
2. Trusted commands reuse `get_effective_permissions`; they do not introduce a parallel permission engine. The command binds the already validated actor to the existing effective-permission evaluation within that transaction.
3. The service-role key remains server-only. Browser-facing clients retain read/select access governed by existing SELECT RLS, but direct appointment-table writes are removed. Protected command RPCs are not executable by `anon` or `authenticated`.
4. The existing PostgreSQL resource exclusion constraints remain the concurrency backstop. The new adapter intentionally does not invent capacity behavior where the owning domain has not published a canonical policy.
5. Appointment audit reuses `audit_trail`; there is no parallel audit store. Actor attribution is checked against the validated actor/tenant context; reschedule classification uses the validated reason.
6. Service/Procedure's lack of an active canonical procedure-to-resource requirement source is recorded as a source limitation, not replaced with guessed requirements.

## 5. Known blockers and exclusions

- **Release blocker — migration lineage:** the repository and hosted migration histories are not reconciled. This is not resolved by this PR and must be handled through the project's migration-lineage reconciliation procedure before production release. No hosted migration-history rows were inserted or rewritten.
- **Verification blocker — database flow:** latest observed CI completed on candidate `8a2000350bc905427fb1ffdc2ffb4748c9b07b03`; the database lane failed at fixture setup because `agenda:create` was not found in `public.permissions`. Static audit and included authenticated E2E passed, but WP-7 remains open.
- **Pre-existing i18n baseline:** older verification logs reported unrelated literals in `src/features/followup/followup-shell.tsx`, `src/features/kiosk/AmbientKioskView.tsx`, and `src/features/workspace/widgets/patients/QuickRegistrationWidget.tsx`. They remain outside this gate unless a direct scoped dependency is proven.
- No other gate has been reopened. Gate 02, Gate 03, Patient Flow, Follow-up Gate 11, Treatment Plan, workforce, inventory, and other domains remain outside this implementation scope.

## 6. Closure criteria

Do not merge or promote this work until the latest candidate has:
1. successful typecheck, lint, and production build;
2. passing Gate 04 static assertions;
3. successful isolated clean local database replay and command ACL/audit/rebooking probes;
4. reviewed integration evidence for the Agenda entry points and booking lifecycle;
5. independent security/code review; and
6. a separate, evidence-backed resolution of migration-lineage reconciliation before WP-8 production release.

**Current overall disposition:** WP1–WP6 implementation is present but their exit conditions are not all evidenced; WP-7 is OPEN after a failed DB lane; WP-8 is BLOCKED by integrated verification and migration-lineage reconciliation; PR #242 must remain Draft. The linked reconciliation record governs the current detailed status.
