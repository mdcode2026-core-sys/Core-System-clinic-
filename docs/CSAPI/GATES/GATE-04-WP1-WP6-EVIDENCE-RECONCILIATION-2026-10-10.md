# Gate 04 — WP1–WP6 Implementation / Evidence Reconciliation

**Record date:** 2026-10-10  
**Scope:** Evidence reconciliation only; no application, database, migration, permission, or test changes are made by this record.  
**Gate:** 04 — Agenda & Scheduling  
**PR:** [#242](https://github.com/mdcode2026-core-sys/Core-System-clinic-/pull/242) (Draft; not merged)  
**Reviewed candidate SHA:** `8a2000350bc905427fb1ffdc2ffb4748c9b07b03`  
**Verification run:** [Workstream Verification #38001733010](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38001733010)  
**Controlling contract:** `GATE-04-AGENDA-EXECUTION-CONTRACT-2026-09-29.md`  
**Work-package exit authority:** `GATE-04-IMPLEMENTATION-PLAN-2026-09-29.md`  
**Verification authority:** `GATE-04-VERIFICATION-PLAN-2026-09-29.md`

## 1. Executive finding
## Owner-approved minimum integration addendum — 2026-10-11

The owner approved Follow-up → Agenda integration as part of the minimum Gate 04 closure scope. The narrow bridge is implemented as follows:

- Active Follow-up records with `action_type = appointment` show a localized booking action in both Follow-up work-list and scheduled views.
- The action navigates to Agenda with the same `patientId` and `followupRequestId` context.
- Agenda opens its existing appointment form, preselects the patient, and identifies the originating request. Appointment mutation still runs only through Agenda's canonical server-side mutation service and protected database command boundary.
- Follow-up remains owner of follow-up continuity. This bridge does not change Follow-up lifecycle rules, create a competing appointment record, or claim a persisted relational link from the appointment back to the follow-up. The marker is request context for initiating the booking only.
- Added static assertions and authenticated browser E2E coverage. Their status must be taken from the exact-head run, not from the existence of test code.

This approved bridge is within Gate 04 scope. Gate 11 remains open and is not being implemented or reclassified here.



The branch contains implementation work for WP1–WP6. It is inaccurate to describe the work as having stopped at WP1. However, **implementation present is not equivalent to a work package passing its exit condition**. On the reviewed candidate, WP1–WP6 are recorded as implementation-present but not formally closed because required integrated evidence is incomplete, and WP7 is open.

The latest workflow did finish; its result was not pending. The progress record must therefore reflect these exact outcomes:

- Gate 04 static audit: **PASS — 49 checks, 0 failures**.
- Authenticated E2E lane: **PASS**.
- Engineering governance lane: **PASS**.
- Presentation static/runtime lanes: **PASS**.
- Clean local Supabase migration replay: **PASS**.
- Local database schema/security inspection: **PASS**.
- Protected command ACL checks: **PASS**.
- Appointment-table write ACL checks: **PASS**.
- Agenda audit-trigger presence check: **PASS**.
- Agenda RLS-enabled check: **PASS**.
- Integrated local database command/audit flow: **FAIL**, before the create/update/audit assertions could run. The verifier stopped because its fixture could not find the permission key `agenda:create` in `public.permissions`.
- Global i18n audit: **FAIL** on ten user-facing literals in Follow-up, Kiosk and Patient Quick Registration files. The reviewed PR file list does not include those files; they are classified as outside Gate 04 pending any evidence of a direct dependency.

The database failure is currently classified as **verification-fixture/permission-catalog reconciliation unresolved**, not as proof that the production permission model is wrong and not as proof that the Agenda command is correct. No permission seed, assertion, or production policy should be changed until the source of truth and migration history for permission keys are checked.

## 2. WP-by-WP evidence matrix

### WP1 — Canonical mutation convergence + protected database command boundary

**Exit condition:** All active Appointment writes converge on the server authority and protected DB persistence commands; direct table writes are denied.

**Implementation found on the reviewed branch:**
- `src/domain/agenda/agenda.mutation-service.ts` centralizes create/update/lifecycle mutation orchestration and calls the four command names.
- `src/infrastructure/supabase/agenda-command.ts` creates a dedicated `server-only` client using `SUPABASE_SERVICE_ROLE_KEY`; it does not reuse the Auth administration client.
- `20261010100000_csapi_gate04_agenda_command_boundary.sql` defines create, update, transition and cancel commands with tenant/actor checks, effective-permission evaluation, expected-state checks and tenant-scoped reference validation.
- `20261010120000_csapi_gate04_agenda_write_acl_lockdown.sql` revokes browser-facing table-write privileges and grants SELECT to authenticated/service-role subject to existing RLS.
- The static audit reported all 49 checks passing, including command existence/ACL patterns, tenant scoping, state guards, and direct-write path checks.
- The local DB verifier passed command-boundary/schema security checks, table-write ACL checks and RLS-enabled checks.

**Not yet proven / findings:**
- The end-to-end database flow did not reach its command/audit assertions because the test fixture failed to find `agenda:create`. Thus successful create/update/transition/cancel and audit reconstruction have not been demonstrated by this DB flow.
- The static audit is pattern-based and is not an independent security review. Privileged actor binding, permission calculation, and audit attribution still require focused review.
- WP1 is **implementation-present; exit not proven; do not close**.

### WP2 — Booking requirements + provider feasibility

**Exit condition:** Provider/room/resource requirements have one explicit contract.

**Implementation found:**
- `src/domain/agenda/procedure-resource-requirements.ts` provides the booking-requirement adapter.
- The implementation uses active, tenant-scoped `clinic_procedures.provider_type` metadata and keeps provider optional only when the active procedure metadata does not require one.
- Existing availability and eligibility engines remain in the path; no new scheduling engine is introduced.
- Static audit checks for provider-optional request handling and propagation of provider requirements to the Agenda forms passed.

**Limitations / evidence gap:**
- The contract explicitly records that there is no active canonical procedure-to-resource requirement source. The code does not reactivate the historical `clinic_procedure_resources` model or invent generalized resource requirements. This is a documented source limitation, not a completed physical resource-requirement configuration feature.
- The full integrated positive/negative provider-required/provider-optional scenario set has not been evidenced by the current DB flow.
- WP2 is **implementation-present; contract adapter evidence partial; exit not proven; do not close**.

### WP3 — Resource concurrency policy

**Exit condition:** Default exclusivity and the explicit policy boundary are proven.

**Implementation found:**
- The adapter defaults resource behavior to exclusive/capacity 1 where no owning-domain policy is present.
- Existing PostgreSQL exclusion constraints are retained as the final integrity defense.
- Static audit passed checks that the adapter exists and that no parallel resource/capacity engine is introduced.

**Evidence gap:**
- The latest workflow does not provide a successful integrated concurrent-request/race probe demonstrating that two competing bookings cannot both succeed for each applicable resource type.
- No explicit shared-capacity configuration source is implemented by this gate; the implementation intentionally does not invent one.
- WP3 is **adapter implemented; integrated concurrency proof absent; exit not proven; do not close**.

### WP4 — Appointment audit completion

**Exit condition:** CREATE, UPDATE and lifecycle mutations are reconstructible.

**Implementation found:**
- `20261010110000_csapi_gate04_agenda_audit_completion.sql` reuses `audit_trail` and the existing `fn_audit_changes()` trigger function.
- The Agenda branch classifies CREATE, UPDATE, STATUS_CHANGE, CANCEL and RESCHEDULE and records old/new values, actor/tenant, and reason where supplied.
- The migration deliberately preserves the pre-existing behavior for non-Agenda trigger consumers.
- The static audit passed audit-related assertions and the local schema check found the Agenda audit trigger.

**Evidence gap / security review:**
- The DB command/audit flow failed during fixture setup before it could assert actual audit rows and actor attribution for create/status/cancel/rebook.
- The audit function relies on transaction-local context set by the privileged command. Its actor-to-`auth.uid()`/tenant binding must be reviewed independently against the actual Supabase/Postgres execution context; source inspection alone is not security approval.
- WP4 is **implementation-present; trigger existence verified; end-to-end audit reconstruction not proven; exit not proven; do not close**.

### WP5 — UI / entry-surface convergence

**Exit condition:** Calendar/Quick Appointment/form writes use the canonical server path.

**Implementation found:**
- The PR changes Agenda actions, the Agenda API route, Agenda forms, event detail, Agenda page, patient page and Quick Appointment.
- Static audit passed checks for provider requirement propagation, provider-optional request handling, cancelled appointment rebooking and relevant entry-point wiring.
- The authenticated E2E lane and presentation runtime/static lanes passed on the reviewed SHA.

**Outstanding product/workflow blocker:**
- PR #242 records that the Agenda form’s “new patient” mode does not call canonical patient registration and lacks Gate 03’s complete identity fields. The booking API correctly requires an already registered `patient_id`.
- The PR offers two paths and recommends A: selecting an existing patient; “new patient” routes to canonical registration and returns to booking. This is a genuine product/workflow choice and must not be silently implemented as an architecture decision. Until approved, preserve the blocker and do not bypass identity requirements.
- WP5 is **implementation-present; current tested lanes pass; new-patient path blocked by owner decision; exit not proven; do not close**.

### WP6 — Verification infrastructure

**Exit condition:** Binding Gate 04 test contract and executable lanes are ready.

**Implementation found:**
- `docs/testing/workstream-contracts/csapi-gate04-agenda.execution.json` defines Gate 04 applicability, required suites, evidence expectations and protection against incidentally reopening closed Gate 02 tests.
- `tools/csapi-gate04-static-audit.mjs` runs the static contract checks; latest run passed 49/49.
- `tools/csapi-gate04-database-verification.mjs` runs CI-only local Supabase clean replay, schema/ACL/RLS checks, and a command/audit flow.
- The latest workflow confirms the lane was executed and published its result.

**Defect / evidence gap:**
- The DB lane’s fixture queries `public.permissions` for `permission_key = 'agenda:create'` and raises `GATE04_TEST_PERMISSION_MISSING=agenda:create` before command-flow assertions. It also expects `agenda:update`. The current evidence does not establish whether the cause is a missing canonical permission seed, a different canonical key/representation, or an incorrect fixture assumption. Reconcile the permission catalogue, effective-permission function, relevant migrations and existing fixtures before modifying anything.
- WP6 infrastructure is present and executes, but its required DB lane does not pass; it is not ready to support WP7 closure.
- WP6 is **infrastructure implemented; static lane passes; DB lane fails at fixture setup; exit not proven; do not close**.

### Permission-catalog investigation result — 2026-10-10 (recorded before any fix)

**Finding: FAIL — canonical database permission catalogue is missing the Agenda permission rows in the clean migration chain.** This is a migration/catalogue completeness defect, not evidence that agenda:create / agenda:update are aliases or that the fixture should be weakened.

Evidence:
- src/core/permissions/types.ts declares agenda:read, agenda:create, agenda:update, and agenda:delete; src/core/permissions/permissionMatrix.ts assigns the create/update keys to the existing clinic-admin and receptionist application matrix.
- The relevant Agenda RLS migration 20260903080530_approved_non_breaking_rbac_patient_flow_remediation_20260903.sql references these keys in policies and permission checks, but the repository search of migration SQL found no corresponding INSERT/upsert that creates the agenda:create or agenda:update rows in public.permissions.
- The Gate 04 command migration checks public.get_effective_permissions(...). The canonical Stage 17 function (20260909170000_stage17_subscription_permission_boundary.sql) builds permissions by joining role/direct grants and overrides back to public.permissions, and applies the subscription boundary using that catalogue's resource. It does not synthesize missing permission catalogue entries. permissionEngine.ts delegates to this database function; it is not the source of the missing catalogue rows.
- CI #38001733010's isolated db reset --local --no-seed completed migration replay and then failed at fixture setup when its lookup of public.permissions returned no active agenda:create row. The same fixture next requires agenda:update; that lookup was not reached in the failed run, so its absence is strongly indicated by the same missing-seed gap but has not separately been observed in that run.
- No production/hosted database was queried or changed during this investigation.

**Root-cause classification:** canonical migration-chain omission of Agenda permission catalogue rows; fixture is correctly surfacing that omission. get_effective_permissions is a consumer of the canonical catalogue, not the cause identified here.

**Bounded investigation log:** one focused source review completed within the declared 25-minute target; hard-stop limit remains 30 minutes. No patch attempts were made. This finding is documented before any implementation change. The additive repair is committed in 20261010130000_csapi_gate04_agenda_permission_catalog_reconciliation.sql. Next action is exact-head CI verification in the same isolated DB lane; no second fix without recording the first concrete failure. Do not change hosted permissions, alter the effective-permission engine, or weaken the fixture. Existing role grants must be checked before deciding whether new role-permission rows are appropriate; the app-side matrix alone is not authority to change database grants.

### Bounded permission-catalog repair — implementation checkpoint (2026-10-10)

**Implementation status: COMMITTED; verification NOT YET PROVEN.** Following the documented root-cause finding, an additive migration was added:
- `supabase/migrations/20261010130000_csapi_gate04_agenda_permission_catalog_reconciliation.sql`
- Commit: `7b22ebb6968488e6184d1fa5c446c0d522b96a35`

The migration idempotently restores the four canonical Agenda catalogue keys (`agenda:read`, `agenda:create`, `agenda:update`, `agenda:delete`) and reactivates their catalogue records if soft-deleted. It restores role grants to match the current application `permissionMatrix`: clinic_admin gets read/create/update/delete; doctor gets read; receptionist gets read/create/update. It does not grant delete to doctor/receptionist, activate other roles, alter `get_effective_permissions`, change fixtures, or touch hosted data. This also repairs the catalogue rows needed by existing Agenda RLS read/delete policies, beyond the create/update keys directly exposed by the failed fixture.

**Pre-verification risk:** the migration has only been committed to the feature branch. Clean replay, migration syntax, role-grant uniqueness/reactivation, and the Agenda DB command/audit flow must be proven by CI before calling the repair successful. The existing test fixture uses explicit user permission overrides, so its passing would prove catalogue availability and command flow, not by itself prove every role matrix end-to-end.

**Timebox / stop:** source investigation and the focused additive repair were performed as one bounded work item; the 25-minute target and 30-minute hard stop remain in force. No hosted Supabase query or mutation, production release, merge, or fixture weakening occurred. At the next checkpoint, inspect the exact-head CI. If DB replay or the command/audit flow fails, record the first concrete failure and stop; do not stack a speculative second patch.

## 3. Workflow evidence and failure classification

Run: [#38001733010](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38001733010)  
Candidate: `8a2000350bc905427fb1ffdc2ffb4748c9b07b03`

| Evidence | Result | Interpretation |
|---|---|---|
| Engineering governance | PASS | Governance lane passed on this candidate |
| Gate 04 static audit | PASS, 49/49 | Static assertions pass; not a substitute for runtime/security review |
| Authenticated E2E | PASS | Included E2E suite passed; does not cover all required Gate 04 scenarios by itself |
| Presentation static/runtime | PASS | Applicable presentation lanes passed |
| Local clean migration replay | PASS | Repository migrations replayed on the isolated local Supabase instance |
| Local command/table ACL and RLS checks | PASS | Schema/security checks reached before the fixture failure passed |
| DB command + audit flow | FAIL | Fixture could not find `agenda:create`; business command/audit assertions did not execute |
| i18n audit | FAIL | Ten literals in out-of-scope Follow-up/Kiosk/Patient Quick Registration files |
| Overall final gate | FAIL | WP7 cannot close |

## 4. Required next steps — bounded, no scope drift

1. **Permission-catalog reconciliation (first and only next investigation):** inspect the canonical permission definitions, `get_effective_permissions`, migrations/seeds and existing role/permission fixtures. Determine whether `agenda:create` and `agenda:update` are intended canonical keys, aliases, or missing data. Do not change production permissions or weaken the test to obtain green CI.
2. **Record the finding before implementing a fix.** If the root cause is not isolated within a single focused investigation, stop and report the evidence plus the unresolved question instead of trying speculative patches.
3. After the DB flow is repaired for the correct reason, rerun the same clean local DB lane. Then obtain explicit evidence for command execution, audit reconstruction, authorization-negative cases and relevant concurrency behavior.
4. Conduct a separate security review of the service-role command boundary and audit actor attribution. Static checks do not satisfy this requirement.
5. Keep the new-patient workflow as an owner decision. Do not bypass canonical registration or infer a decision.
6. Keep unrelated i18n findings classified separately unless a changed Gate 04 dependency is demonstrated.
7. Do not merge, promote to production, alter hosted Supabase, or rewrite migration history during this reconciliation.

## 5. Work discipline and mandatory checkpoints

Effective immediately for this Gate 04 continuation:

- **Timebox:** one focused investigation is limited to 25 minutes, with a hard stop at 30 minutes. If the root cause is not isolated by then, write the current evidence, what was ruled out, what remains unknown and the next bounded action; report to the owner before continuing.
- **Attempt limit:** after two unsuccessful attempts to validate the same proposed fix, stop. Reassess the diagnosis instead of stacking more changes.
- **Work-package exit:** before leaving any WP, update this record or the progress record with (a) files/behavior changed, (b) exact candidate SHA, (c) tests run and result, (d) failures and classification, (e) remaining evidence, and (f) explicit status: PASS / FAIL / BLOCKED / NOT RUN.
- **Failure logging:** record a failure as soon as it is observed, before another fix or work package begins. Never describe pending as passed or implementation-present as closed.
- **No silent continuation:** at each hard stop, provide the owner a short checkpoint report. A later work package cannot hide a failed earlier exit condition.
- **Documentation changes do not validate code:** any documentation-only commit creates a new candidate SHA; it does not make the code tested. The code lanes must be rerun on the exact candidate before final verification.

## 6. Current disposition

- WP1–WP6: implementation exists; individual exit conditions remain incompletely evidenced as detailed above.
- WP7: OPEN — integrated verification not passed.
- WP8: BLOCKED — WP7 evidence and independent repository-vs-hosted migration-lineage reconciliation are outstanding.
- PR #242 remains Draft and must not be merged.
- No production release or hosted database mutation is authorized by this record.


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


## 2026-10-10 — Exact-head verification and migration-lineage evidence

- Workstream Verification #968 passed on exact code SHA `926e97dc99fa84abb85eb1e30e8d48f3489a451d` (attempt 2); Engineering Governance #228 passed. The first global-presentation runtime attempt reported `JWT issued at future`; retry of the same job passed without an application-code workaround.
- The passed run included Engineering (typecheck/lint/build), Gate 04 static and local DB verification, authenticated route E2E, Gate 03 identity audit/E2E, global presentation static/runtime, and changed-source i18n plus catalogue parity.
- Follow-up verification work strengthens the Gate 04 static audit with explicit checks for the owner-approved patient-registration return path and Quick Appointment record selection, and declares the existing read-only cross-domain runtime lane required because the frozen Verification Plan includes cross-domain integration evidence. These additions are not yet verified until the next exact-head run passes.
- Read-only migration-history comparison: hosted project `qaslsjyxjwvdoiczmhgq` lists 292 migration rows; current `main` has 235 SQL files. Exact-version comparison found 102 versioned repository identifiers not present in hosted history, 160 hosted identifiers not present in the repository, and 12 shared versions with different names. Latest hosted version is `20260926105306`; latest repository version is `20260926110000`. The four Gate 04 migrations remain branch-only.
- These discrepancies are a release blocker, not permission to repair hosted history. No hosted schema/data/history changes, merge, or production promotion were performed. WP-8 remains BLOCKED; do not mark Gate 04 fully closed.


 
## 8. Exact-head continuation and Follow-up minimum handoff — 2026-10-12

The Product Owner approved the minimum Follow-up appointment-request → Agenda handoff as mandatory Gate 04 closure scope on 2026-10-11. The decision is final for this scope and must not be re-asked. See the operational handoff for exact ownership and execution boundaries.

Exact candidate: `fe4f4d2b34b546540236102cd469946dcab4a59d`. Workstream Verification #984 failed; Engineering Governance #244 passed.

Verified passing lanes on #984: engineering/typecheck/lint/build, Gate 04 static, Gate 04 isolated local DB, authenticated route E2E, Gate 03 identity static/E2E, read-only cross-domain runtime, changed-source i18n/catalogue parity, global presentation static. Failures:
1. `patient-journey`: the legacy Gate 02 longitudinal runtime E2E was invoked and failed with `Redirected to login from /patients`. Because Gate 02 is closed and this suite is not the Gate 04 integration test, first correct the workstream descriptor/planner classification that causes it to run on Follow-up presentation changes. Do not label this as proof of a Follow-up product defect.
2. `global-experience-presentation-runtime`: Playwright TimeoutError; root cause remains unknown and requires full-log review and bounded diagnosis.
Final gate = FAIL. WP-7 remains OPEN.

The required Gate 04 Follow-up evidence is the minimum UI handoff into canonical Agenda with patient/request context, without Follow-up lifecycle changes or parallel appointment storage. The read-only cross-domain integrity lane alone is not equivalent to this E2E. After planner correction, verify the Gate 04 static assertions and authenticated route/runtime behavior on the exact candidate.

WP-8 remains BLOCKED: recorded comparison is 235 repository SQL migration files versus 292 hosted migration rows, 102 repo versions absent from hosted history, 160 hosted versions absent from repo, and 12 shared-version name mismatches. Do not mutate hosted schema/data/history or bulk-apply migrations.


## Exact-head evidence reconciliation — 2026-10-12 / Workstream #997

The latest exact candidate `534474015383716e6517a7b0d26cc205864a493f` passed Workstream Verification #997 (all 12 jobs) and Engineering Governance #257. Direct evidence now includes Gate 04 static 59/59 checks; isolated local DB clean replay/ACL/RLS checks; a command/audit flow proving create, status change, cancel, and cancelled-appointment rebooking with corresponding audit actor/reason assertions; and 3 authenticated route E2E tests including the approved Follow-up → Agenda patient-context handoff. Global presentation runtime passed on this candidate; the earlier timeout did not reproduce. The Gate 02 legacy patient-journey suite was not selected and Gate 02 remains closed.

Independent source review (preliminary, not closure) found mutation identity/tenant derived by the server from the authenticated session; service-role-only RPC invocation; database validation of active tenant actor, effective permission, tenant-scoped references and expected status; and revoked ordinary client appointment writes. Pattern checks and these focused probes do not establish every contract scenario.

**Remaining evidence gap:** Gate 04 Verification Plan explicitly calls for provider-required and provider-optional positive/negative cases, provider/room/resource/patient conflicts, time normalization and buffer behavior, concurrency/race probes, workforce availability interactions, full lifecycle negatives, and cross-domain cases. The current green lanes and focused DB flow do not individually prove all of these. Reconcile each scenario to an executable test/log or mark it unresolved; do not close WP7 on the aggregate green status alone. WP8 remains blocked pending fresh read-only repository-versus-hosted migration lineage evidence and an approved resolution plan. No hosted mutation/history edits, merge or production promotion.


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
