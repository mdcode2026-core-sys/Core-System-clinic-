# Gate 04 — Implementation Progress Record

**Record date:** 2026-10-10  
**Gate:** 04 — Agenda & Scheduling  
**Controlling contract:** `docs/CSAPI/GATES/GATE-04-AGENDA-EXECUTION-CONTRACT-2026-09-29.md`  
**Implementation design:** `docs/CSAPI/GATES/GATE-04-AGENDA-IMPLEMENTATION-DESIGN-2026-09-29.md`  
**Execution plan:** `docs/CSAPI/GATES/GATE-04-IMPLEMENTATION-PLAN-2026-09-29.md`  
**Delivery PR:** #242 — Draft; base `main`; implementation branch `csapi/gate04-agenda-implementation-2026-10-10`

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

- Engineering-governance workflow succeeded on revision `1e0617c63094078dfe008f89f7e9012ebee1be70`; later branch revisions include follow-up fixes and require verification against the exact latest head.
- An earlier Workstream Verification attempt found a duplicate local declaration in the Agenda command invoker. The duplicate was removed on the branch. Results from the earlier revision are not treated as proof for the current head.
- An earlier static Gate 04 audit completed successfully before the final verification assertions were added. It does not replace a latest-head run.
- The prior verification attempt also reported a baseline i18n audit failure for existing literals in Follow-up, Kiosk, and Patient Quick Registration. Those surfaces are outside Gate 04 and were not changed. Their failures must not be silently marked as Gate 04 implementation failures or fixed as unrelated scope.
- The latest-head Workstream Verification workflow was created but remained `pending` with no published jobs at the latest check. Therefore no latest-head pass is claimed in this record. Re-check the workflow run and its artifacts before approving merge or calling WP-7 complete.

## 4. Reconciled architecture and safety boundaries

1. The canonical write path is the Agenda mutation service → trusted server-only command caller → tenant/actor-validated database command functions → existing appointment table and constraints.
2. Trusted commands reuse `get_effective_permissions`; they do not introduce a parallel permission engine. The command binds the already validated actor to the existing effective-permission evaluation within that transaction.
3. The service-role key remains server-only. Browser-facing clients retain read/select access governed by existing SELECT RLS, but direct appointment-table writes are removed. Protected command RPCs are not executable by `anon` or `authenticated`.
4. The existing PostgreSQL resource exclusion constraints remain the concurrency backstop. The new adapter intentionally does not invent capacity behavior where the owning domain has not published a canonical policy.
5. Appointment audit reuses `audit_trail`; there is no parallel audit store. Actor attribution is checked against the validated actor/tenant context; reschedule classification uses the validated reason.
6. Service/Procedure's lack of an active canonical procedure-to-resource requirement source is recorded as a source limitation, not replaced with guessed requirements.

## 5. Known blockers and exclusions

- **Release blocker — migration lineage:** the repository and hosted migration histories are not reconciled. This is not resolved by this PR and must be handled through the project's migration-lineage reconciliation procedure before production release. No hosted migration-history rows were inserted or rewritten.
- **Verification blocker — latest-head CI:** the static/database/engineering verification lanes must finish on the exact current PR head. A pending workflow is not a pass.
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

**Current overall disposition:** implementation branch in progress; WP-7 evidence incomplete; WP-8 blocked; PR #242 must remain Draft.
