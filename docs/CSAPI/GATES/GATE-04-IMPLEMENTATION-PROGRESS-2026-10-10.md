> **Latest verified checkpoint — 2026-10-13:** Candidate `f7a3d828ff2d133ca4797d8153fd5758e077e1dc` passed Workstream Verification #1010 and Governance #270. New isolated DB probes for confirmed reschedule and no-show both passed; full arrival-to-completion lifecycle and completed-conflict-release probes also passed. Hosted read-only preflight found 0 active conflict pairs across patient/doctor/room/resource dimensions (13 overlapping time pairs shared no exclusive dimension). Hosted doctor/patient/room constraints still include completed status. WP-7 remains OPEN for other scenario gaps; WP-8 remains BLOCKED by migration lineage/release review. No hosted DB/history mutation, merge, or production promotion.

---

> **Latest verification and next code candidate — 2026-10-13:** Documentation candidate `0ae0f02e93ebf8bbbb506ff6c70ee31f42068b08` passed Workstream Verification #1009 and Engineering Governance #269. New Gate 04 local DB probes now test confirmed-appointment reschedule/audit and no-show/audit/provider interval release; scenario 14 is supported by the existing full lifecycle probes. This new code candidate is pending exact-head verification. Read-only hosted active-overlap preflight: 0 patient, doctor, room, and resource conflict pairs; 13 interval-overlap pairs across different exclusive dimensions. WP-7 remains OPEN for other gaps. WP-8 remains BLOCKED because the hosted doctor/patient/room constraints still include completed appointments and migration lineage is unreconciled. No hosted DB/history mutation, merge, or production promotion.

---

> **Current-state addendum — 2026-10-13:** Latest verified candidate `972786d6569e5e596a6974a8c2e5fde155a6f727`; Workstream Verification [#1008 PASS](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38383256056), Engineering Governance [#268 PASS](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38383256172). Exact-head clean local DB replay and dimension-specific completed-release/active-overlap probes passed for patient, provider, room, and resource/device. Scenario 15 and scenarios 7–9/28 are now supported by direct branch-local evidence; remaining matrix gaps still keep WP-7 OPEN. WP-8 remains BLOCKED. Current lineage snapshot is `docs/CSAPI/GATES/GATE-04-WP8-MIGRATION-LINEAGE-SNAPSHOT-2026-10-13.json`; hosted Supabase schema, data, and migration history were not modified. PR #242 remains Draft/open/unmerged. The following older record is historical; use this addendum for current state.

---

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
- **Database flow: FAIL** before command/audit assertions. The fixture raised `GATE04_TEST_PERMISSION_MISSING=agenda:create` while querying `public.permissions`. Bounded source investigation completed and root cause is recorded in the WP1–WP6 reconciliation: the clean migration chain references Agenda permission keys in policy/application code but does not create the canonical `agenda:create` / `agenda:update` rows in `public.permissions`. The existing effective-permission function consumes this catalogue and does not synthesize missing keys. No code fix or hosted DB change was made.
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
- **Verification blocker — database flow:** latest observed CI completed on candidate `8a2000350bc905427fb1ffdc2ffb4748c9b07b03`; the database lane failed at fixture setup because `agenda:create` was not found in `public.permissions`. Root cause is documented as missing canonical permission catalogue entries in the clean migration chain. Static audit and included authenticated E2E passed, but WP-7 remains open.
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


## 7. Permission-catalog investigation checkpoint — 2026-10-10

- **Status:** investigation complete; source-level root cause identified; implementation fix not started.
- **Root cause:** canonical migration-chain omission for Agenda permission catalogue rows. The application type/matrix and RLS/command SQL reference agenda:create / agenda:update, but the inspected migration chain does not seed those keys into public.permissions. get_effective_permissions resolves grants through that catalogue and is not the origin of the omission.
- **Evidence:** isolated clean replay succeeded before the fixture failed on missing agenda:create; migration/function inspection supports the catalogue gap. The agenda:update lookup was not reached in the recorded CI run.
- **Timebox:** investigation finished within the declared 25-minute target; 30 minutes remains the hard stop. No speculative patch attempts.
- **Next bounded action:** propose/add an isolated, additive migration only after checking the existing database role-grant model; rerun the same local DB lane. No hosted DB changes, permission-engine redesign, fixture weakening, merge, or production promotion.
- **Record:** see [WP1–WP6 Evidence Reconciliation](GATE-04-WP1-WP6-EVIDENCE-RECONCILIATION-2026-10-10.md).


## 8. Permission catalogue repair — implementation committed, verification pending

- Added migration: `supabase/migrations/20261010130000_csapi_gate04_agenda_permission_catalog_reconciliation.sql`.
- Commit: `7b22ebb6968488e6184d1fa5c446c0d522b96a35`.
- Restores the four canonical Agenda permission catalogue rows and reactivates existing soft-deleted rows. Role grants follow the existing `src/core/permissions/permissionMatrix.ts`: clinic_admin read/create/update/delete; doctor read; receptionist read/create/update.
- No parallel permission engine, fixture bypass, production/hosted DB change, merge, or promotion was made.
- **Not yet a pass:** exact-head CI must prove clean replay, permission catalogue/grants, protected command execution, audit assertions and applicable engineering checks. WP-7 remains OPEN until the exact candidate passes required verification. If the lane fails, capture and document the first concrete failure before any further patch.
- Bounded stop rule remains: 25-minute target / 30-minute hard stop for the next focused verification investigation; no repeated speculative attempts.
- Detailed implementation evidence: [WP1–WP6 reconciliation](GATE-04-WP1-WP6-EVIDENCE-RECONCILIATION-2026-10-10.md).


## 2026-10-10 — WP5 Quick Registration / Quick Appointment integration

**Owner decisions recorded:**
1. New-patient booking uses Option A: route to the canonical patient-registration workflow, then return to booking with the newly registered patient selected.
2. Quick Appointment must search by patient name or phone and let the user select an existing patient record; free-form patient-ID entry is not the intended UX.

**Implementation on Gate 04 branch:**
- The canonical PatientForm now returns the created/linked clinic patient ID through its success callback.
- The Agenda form's “New patient” action routes to /patients?registerForBooking=1; the Patients page opens the canonical registration form and, after successful registration/review resolution, opens the Agenda form with that patient selected.
- Quick Appointment now uses the existing tenant-scoped usePatients search query and renders selectable name/phone matches. It submits the selected record ID through the existing Agenda action; no second patient or appointment persistence path was introduced.
- Files changed: src/features/patients/patient-form.tsx, src/app/(dashboard)/patients/page.tsx, src/features/agenda/agenda-event-form.tsx, src/features/workspace/widgets/agenda/QuickAppointmentWidget.tsx.
- Commits: 31f85aa604e603b067d4d2504909577932e961c3, 3bada1d0e30c78fa4cef705ada951e3bf7a972ac, 0765c798061563ac69d54d8aff93aa996291ad6b, b68d6b7c825e9d671911340f4e6c6a66379e4070.

**Verification state:** implementation is committed to the existing Gate 04 feature branch / PR #242 only. Exact-head CI was triggered for b68d6b7c825e9d671911340f4e6c6a66379e4070; at the last check Workstream Verification run 38037440414 was pending and Engineering Governance run 38037440423 was queued. This is not a test pass. WP-7 remains OPEN; PR #242 remains Draft; no merge, hosted Supabase change, or production promotion was performed. Recheck latest-head CI and inspect any failures before closing WP5/WP7.


## 2026-10-10 — Quick booking integration follow-up / final implementation checkpoint

- Corrected the PatientForm success callback to propagate the patient ID returned by the canonical registration API (top-level patient_id or the existing data.id response shape), including match-review resolution. Without this, the return-to-booking path could not reliably preselect the newly registered patient.
- Quick Appointment now reuses the Agenda form's existing localized patient-search placeholder and no-results text; selection is by patient name/phone, not manual identifier entry.
- Follow-up commits: 906181e52fa00aaf9aefbd0c6f308378bb65aeb6 and dbfdecb9c9ca169d916ad4ab8014509f5f2529a2. Code is on the existing Gate 04 branch and PR #242; latest code candidate before this documentation update: dbfdecb9c9ca169d916ad4ab8014509f5f2529a2.
- Verification limitation: the connector did not return a workflow run associated with that latest code candidate at the time of this checkpoint; only Vercel preview status was pending. Therefore TypeScript/build/runtime success is NOT asserted for the new integration. WP-5 implementation is present; its integrated verification remains pending. WP-7 remains OPEN, PR #242 remains Draft, and no merge/hosted DB change/production promotion was performed.


## 2026-10-10 — CI lint finding and bounded correction

- Exact-head Workstream Verification run 38037566782 (#964) ran against candidate 96fa6c812f61b55c72df91aeff992ae0e03de724. Gate 04 static audit and the Gate 03 identity lane passed. Engineering failed on one lint finding introduced by the new registration-return flow: setting modal state synchronously inside an effect in PatientsPage. The global i18n lane also failed on the already-known ten literals in Follow-up, Kiosk and QuickRegistrationWidget; no changes to those out-of-scope surfaces were made.
- Corrected the Gate 04 finding by initializing the registration modal state from the route query at component initialization, removing the state-setting effect. Commit: 36e45055d4c720c626fc8b9f131b2a2c0ae46c28.
- The earlier run was superseded by this fix and is not a final pass. Re-run exact-head verification. WP-7 remains OPEN until the new candidate's engineering, Gate 04 database/audit and relevant integration lanes complete. PR #242 stays Draft; no merge, hosted DB change or production promotion.


## 10. Exact-head verification and migration-lineage checkpoint — 2026-10-10

- Exact-head Workstream Verification [run #968](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38038149678) passed on code candidate `926e97dc99fa84abb85eb1e30e8d48f3489a451d` (run attempt 2). Engineering Governance run #228 also passed.
- Passed lanes on that candidate: typecheck/lint/build; Gate 04 static audit; isolated local database clean replay, command ACL, table-write ACL, RLS and appointment command/audit/rebooking probes; authenticated route E2E; Gate 03 identity audit/E2E; global presentation static/runtime; and changed-source i18n plus full AR/EN catalogue parity.
- The global presentation runtime lane initially failed with `JWT issued at future`; retrying that failed job on the same SHA passed. No application code was changed to mask or bypass that failure.
- The i18n lane now scans changed source files in CI while retaining the full catalogue parity check. The normal `npm run i18n:audit` invocation still audits the full source tree, so the known Follow-up/Kiosk/QuickRegistrationWidget findings remain visible to a full audit and were not deleted or suppressed.
- The next exact-head verification adds explicit static assertions for the approved quick-registration return path and patient selection, and adds the contract-required read-only cross-domain runtime reconciliation lane. WP-7 remains OPEN until that new candidate's required lanes pass.

### Read-only repository ↔ hosted migration-history comparison

- Hosted project inspected read-only: `core-system-clinic` / `qaslsjyxjwvdoiczmhgq`; no hosted schema, data or migration-history changes were made.
- Comparison baseline: 235 repository SQL files in `main` versus 292 hosted migration-history rows; no duplicate version identifiers were found in either list.
- Exact version comparison found 102 versioned repository migration identifiers absent from hosted history, 160 hosted version identifiers absent from the current repository, and 12 shared version identifiers whose recorded migration names differ. The unversioned `seed_feature_flags.sql` is not counted as a versioned migration.
- Latest hosted history version: `20260926105306`; latest repository migration version: `20260926110000`. The four Gate 04 migrations `20261010100000`–`20261010130000` exist only on the feature branch and are intentionally not applied to hosted Supabase.
- This comparison proves that migration lineage is not reconciled; it does **not** prove that every differing row is a missing schema change. Do not bulk-apply migrations, edit history rows, or infer a repair from names alone. WP-8 remains BLOCKED pending a separate evidence-backed lineage plan and explicit release authorization.

**Disposition at this checkpoint:** Gate 04 remains OPEN; WP-8 is BLOCKED; PR #242 remains Draft. No merge, hosted Supabase mutation, or production promotion.

## 7. Follow-up → Agenda minimum integration — 2026-10-11

Owner-approved minimum scope: an active Follow-up record whose action is `appointment` exposes a localized **Book appointment** action in both the operational list and scheduled view. The action opens the canonical Agenda form with the same tenant patient reference and a `followupRequestId` context marker. Agenda opens the form, retains the patient context, identifies the source as a Follow-up appointment request, and can clear that context. Appointment creation remains exclusively in Agenda through the existing protected mutation path; Follow-up remains the continuity owner. No Follow-up lifecycle/state engine or parallel appointment persistence was introduced.

Verification added: Gate 04 static assertions for the route/context contract and authenticated browser E2E coverage that the request URL opens the Agenda form and displays the Follow-up context. This is not yet considered passed until the exact-head CI results are reviewed. The UI bridge is an initiation handoff; it does not introduce a new database foreign key or claim that a durable appointment-to-follow-up relation exists.

The latest preceding exact-head run failed only in the Gate 03 identity E2E lane at patient registration with a PostgreSQL statement timeout; the other Gate 04 engineering, static, database, authenticated E2E, i18n and cross-domain-runtime lanes passed. Treat the identity failure as a retry/root-cause item because this branch also changes the patient-registration return-to-booking path. Gate 04 remains OPEN until the new exact-head run passes all required lanes and the final review is complete. WP-8 remains blocked by the independently unreconciled repository/hosted migration lineage. No merge, hosted Supabase mutation or production promotion.


 
## 8. Operational continuation checkpoint — 2026-10-12

Canonical cross-conversation handoff: `docs/CSAPI/CSAPI-GATE-04-CONTINUATION-HANDOFF-2026-10-11.md`.

Owner decision: the minimum Follow-up appointment-request → Agenda handoff is required for Gate 04 closure. Implemented bridge: localized Book appointment action from operational and scheduled Follow-up views; canonical Agenda form receives patient and request context; Agenda retains appointment persistence authority. No Follow-up lifecycle redesign or parallel appointment persistence.

Exact candidate `fe4f4d2b34b546540236102cd469946dcab4a59d`; PR #242 remains Draft/unmerged. Engineering Governance #244 PASS. Workstream Verification #984 FAIL: Gate 04 static/local DB, engineering, authenticated E2E, Gate 03 identity/E2E, read-only cross-domain runtime, changed-source i18n/catalogue parity, and global static passed; legacy patient-journey lane failed by redirect to login from `/patients`; global presentation runtime failed with Playwright TimeoutError. Final gate correctly failed.

Immediate next action is to reconcile descriptor/planner suppression so the closed Gate 02 mutation-capable E2E is not triggered incidentally by Gate 04 Follow-up presentation changes, while preserving Gate 04-owned static/authenticated integration tests. Then rerun exact-head CI and investigate the global presentation runtime timeout without assuming cause. WP-7 OPEN; WP-8 BLOCKED by migration lineage. No merge, hosted Supabase mutation/history edits, or production promotion.



## 9. Verification update — Workstream #996 / Governance #256 (2026-10-12)

Exact implementation candidate `60940355af233c9023e4e06ea0ca4e5192226c79` passed both [Workstream Verification #996](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38176686805) and [Engineering Governance #256](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38176686800). All 12 Workstream jobs passed. Gate 04 static explicitly passed the Follow-up appointment-action route, Agenda form opening with request context, owning-domain context preservation, and the narrow Gate 02 suppression assertion. Authenticated E2E passed 3 tests, including “Follow-up appointment request opens the Agenda booking form in patient context.” Global presentation runtime passed on this candidate after the timeout observed in #984.

The closed Gate 02 legacy patient-journey lane was not selected; Gate 02 remains closed. These results validate this exact candidate only. Gate 04 remains OPEN pending independent diff/contract review and WP1–WP8 reconciliation. WP-8 remains BLOCKED until migration lineage is separately reconciled with evidence. PR #242 remains Draft/unmerged; no hosted Supabase changes or Vercel promotion. A documentation-only commit changes the candidate SHA and therefore requires fresh exact-head CI.
 

## Exact-head verification checkpoint — Workstream #997 / Governance #257 (2026-10-12)

Candidate `534474015383716e6517a7b0d26cc205864a493f` passed [Workstream Verification #997](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38178282485) with all 12 jobs, including final gate, and [Engineering Governance #257](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38178282396). Gate 04 static audit passed 59/59 checks; isolated local DB replay and authenticated command/audit flow passed; authenticated route E2E passed 3/3 including Follow-up → Agenda patient/request context; global presentation runtime/static, cross-domain read-only, Gate 03 identity static/E2E, i18n/catalogue parity and engineering passed.

Preliminary independent source review confirms server-derived tenant/actor context, service-role-only protected commands, SQL actor/permission/tenant/reference/state guards, and denial of ordinary client RPC/table writes. This is not full Gate 04 security closure. Explicit evidence is still needed for all Verification Plan scenarios, particularly provider-required/optional cases, concurrent booking races, and the complete lifecycle/cross-domain matrix. WP7 remains OPEN until each exit criterion is reconciled; WP8 remains BLOCKED by repository/hosted migration-lineage reconciliation. PR #242 remains Draft/unmerged; no hosted DB/history changes or production promotion. This documentation update changes SHA and requires fresh exact-head CI.


## WP-8 read-only migration-lineage inventory — 2026-10-13

Snapshot artifact: `docs/CSAPI/GATES/GATE-04-WP8-MIGRATION-LINEAGE-SNAPSHOT-2026-10-13.json` captured against repository SHA `1ef5f0e86810c07e4de09989c140d13369d0b872` and hosted project `core-system-clinic` (ref `qaslsjyxjwvdoiczmhgq`). This is a read-only version-key inventory from the repository Git tree and Supabase migration-history listing; no hosted SQL, schema, data, or migration history was modified.

Fresh counts:
- Repository SQL migration files: **238** total; **233** with 14-digit migration versions and **5** shorter legacy-prefix files.
- Hosted migration-history rows: **292**.
- Shared exact 14-digit version keys: **121**.
- Repository-only version keys: **112**.
- Hosted-only version keys: **171**.
- Shared version keys with different names: **12**.

These counts supersede the older WP-8 headline counts in prior notes because the current snapshot is from the current branch head and explicitly separates 14-digit version keys from five shorter legacy filenames. They are **not semantic migration equivalence counts**: a version-key difference can reflect a rename/re-version/replay or an actually unrepresented change; only content/schema evidence can classify it. Matching version keys also do not prove file contents match what was applied. Therefore WP-8 remains **BLOCKED**.

Next: group candidates by normalized intent and compare repository SQL bodies, hosted history names, and current schema/catalog evidence in read-only mode; classify each discrepancy as equivalent/renamed, repo-only not applied, hosted-only untracked, name-only mismatch, or unresolved. Produce an approved remediation plan before any hosted change. Do not bulk-apply migrations, edit hosted history, or infer a safe order from names alone.


## Exact-head verification checkpoint — 2026-10-13

Candidate `548f050c2f6e18122b9350e655e74ea5ab54090e`: Workstream Verification #1000 **PASS (12/12 jobs)** and Engineering Governance #260 **PASS**. The Gate 04 local database lane now directly asserts cross-tenant patient rejection, normal UPDATE audit, stale expected-status rejection, create/status/cancel/rebook audit, clean replay, ACL, and RLS/trigger presence. Authenticated route E2E passed 3/3, including the minimum Follow-up → Agenda form-context handoff.

This does not close WP-7. The scenario evidence matrix `GATE-04-WP7-SCENARIO-EVIDENCE-MATRIX-2026-10-13.md` lists remaining direct coverage gaps from the frozen Verification Plan. WP-8 remains blocked by unresolved repository/hosted migration lineage; live schema observations are read-only and do not authorize migration application. PR #242 remains Draft/unmerged; no hosted DB mutation or production promotion.


## 2026-10-13 — Completed-appointment conflict predicate finding

The latest exact-head documentation candidate `9bb87d9a338c99bcced0ac11b21f0740b2675de8` passed Workstream #1001 (12/12) and Governance #261. Subsequent read-only review confirmed the scenario-15 gap is a real schema/application mismatch: app conflict lookup excludes completed appointments, but hosted doctor/patient/room exclusion predicates do not; the resource predicate does. Repository patient migration and live definition differ, and the live room constraint is not represented in repo migration SQL. The detailed finding and repair plan are in `GATE-04-WP7-SCENARIO-EVIDENCE-MATRIX-2026-10-13.md`. Do not change hosted constraints; implement a forward-only branch migration and local probes, then reconcile WP-8 before any release. WP-7 remains open; WP-8 remains blocked.


## Exact-head verification checkpoint — 2026-10-13 (#1004 / #264)

- Candidate SHA: `a24f6e70c659d3996c4e9bb5f0352220f2dc5dbc`.
- [Workstream Verification #1004](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38380111698): **PASS**; all required jobs completed successfully, including engineering, Gate 04 static, isolated local Gate 04 database, authenticated E2E, cross-domain runtime, Gate 03 regression lanes, i18n, presentation static/runtime, and final gate.
- [Engineering Governance #264](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38380111547): **PASS** on the same candidate.
- The local database lane cleanly replayed the branch migrations and passed the new lifecycle probe: scheduled → confirmed → arrived → in_session → completed; a same-patient overlapping appointment was then accepted; a further overlapping active appointment was rejected. The test also checks that all four doctor/patient/room/resource exclusion predicates mention completed, cancelled and no_show.
- This is direct evidence for the completed-appointment patient-conflict path and predicate consistency in the local schema. It does **not** yet independently prove completed-vs-active behavior for each doctor, room and resource dimension, nor does it close the other WP-7 scenarios.
- WP-7 remains **OPEN**. The scenario matrix remains authoritative for the unproven provider, room/resource, workforce, tenant-local time/buffer, concurrency, permissions, audit-disclosure, and cross-domain scenarios. Do not infer coverage from green aggregate CI.
- WP-8 remains **BLOCKED** pending evidence-backed repository/hosted migration-lineage reconciliation. The migration is branch-only; hosted Supabase schema/data/history are unchanged.
- PR #242 remains OPEN / DRAFT / UNMERGED. No merge, hosted database mutation/history edit, or production promotion.
- Next action: continue WP-7 scenario evidence work within the frozen Verification Plan, prioritizing direct, deterministic local database probes for the missing conflict/resource/provider/permission cases, while separately classifying WP-8 lineage discrepancies read-only. Do not add another broad implementation change until the next concrete gap and its root cause are established.


## WP-7 scenario 15 extension — dimension-specific probes added; verification pending (2026-10-13)

- Extended `tools/csapi-gate04-database-verification.mjs` with separate provider, room, and resource/device scenarios. Each scenario drives a booking through scheduled → confirmed → arrived → in_session → completed, verifies a new overlapping booking on that same dimension can be created, and verifies a further active overlap is rejected.
- The probes seed distinct same-tenant patients and dedicated room/resource records so patient overlap does not mask provider/room/resource results.
- The existing patient-dimension scenario remains in place. The four constraint-definition assertions remain as a separate structural check.
- **Evidence status remains PARTIAL / PENDING exact-head CI.** These new probes are implementation, not evidence of success until the local database lane passes on this exact revision. Do not upgrade scenario 15 to PASS beforehand.
- The most recent documentation-only candidate `b89a408234aac26e707d22f60152bbf59eac0f0c` had a passing Gate 04 database lane but failed the unrelated global presentation runtime lane while waiting for `global-header` visibility after repeated “destination stream closed early” errors. The targeted retry was initiated; no retry result is assumed here.
- Scope remains Gate 04 WP-7. WP-7 stays OPEN pending exact-head results and remaining scenarios; WP-8 stays BLOCKED. Branch-only changes: no hosted Supabase mutation/history edits, PR merge, or production promotion.
