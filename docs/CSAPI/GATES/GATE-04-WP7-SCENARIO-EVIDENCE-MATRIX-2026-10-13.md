> **AUTHORITATIVE SESSION STATE — 2026-10-15 (reconciled after repository/PR/release review):**
> - Gate 04 PR #242 remains OPEN / DRAFT / UNMERGED. Gate 05 documentation PR #241 must remain OPEN and untouched until Gate 04 is formally closed; do not merge #241 early.
> - Verified baseline for this checkpoint: `fd26ba1c57a33556c033e664adf1da97e820cf2c` passed Workstream Verification [#38764571577](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38764571577) (all 12 lanes and Final gate, including the isolated Gate 04 database lane) and Engineering Governance [#38764571690](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38764571690). This proves the baseline only; the new documentation checkpoint still needs exact-head verification.
> - **Scenario 22 reverified PASS on the exact baseline head `fd26ba1c57a33556c033e664adf1da97e820cf2c`:** Workstream #38764571577's clean local database lane reran the Workforce absence probe. The existing appointment remained exactly one row with unchanged planned start/end and `scheduled` status; a new overlapping booking was rejected as unavailable and not persisted. Branch-local evidence only; hosted Supabase was not touched.
> - Resource requirement blockers remain explicit, not implementation invitations: scenarios 26/27 have no active canonical Service/Procedure → required/optional room/resource source; scenario 29 has no owning-domain shared/capacity policy; scenario 30 cannot be tied to a procedure-specific consumable-shortage fixture because current active inventory schema has no canonical procedure → consumable requirement relationship. The contract says shortage must not automatically block booking; do not invent associations, revive historical `clinic_procedure_resources`, or add a capacity engine.
> - Scenario 31/32 are still GAP. The Work Center→Agenda context and post-create callback exist, but scenario 31 lacks a scoped end-to-end proof, and scenario 32 lacks a typed `operational_work_items.agenda_event_id` round-trip. Its repository migration `20260923130000_csapi_gate02_next_action_agenda_link.sql` is absent from hosted schema/history. Changes to `src/domain/journey-coordination/` or this migration match Gate 02's suppression-bypass patterns and activate its mutation-capable longitudinal suite; do not change those paths or run that suite until an approved isolated test route exists.
> - **Resume after this checkpoint receives exact-head verification:** define a Gate-04-scoped, local-only verification boundary for scenario 31 from an existing next-action work item through canonical Agenda submission. Keep scenario 32 GAP and WP-8 BLOCKED until an isolated typed-reference test and migration-lineage resolution are available. Do not reopen Gate 02, scenarios 1–21, or scenario 16 without direct failing evidence.
> - PR #241 is deliberately held until Gate 04 closure. No PR merge, hosted Supabase schema/data/migration-history mutation, or production deployment/promotion is authorized in this session.
> - Release review found the prior production-gated run [#36617926070](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/36617926070) failed the authenticated Clinic Admin production E2E; do not claim production release readiness. WP-8 remains BLOCKED: repository/hosted migration lineage and live exclusion-constraint drift remain unresolved. WP-7 remains OPEN until remaining scenario evidence is resolved.
> - Historical checkpoints below are retained as history, not current instructions. The verified Scenario 22 result and the resource/Scenario 31–32 boundaries above supersede older resume points; do not treat historical PASS evidence as a substitute for a scenario-specific current-head assertion.
>
> ---
>
> **Investigation addendum — 2026-10-15 (scenarios 31–32):**
- Exact-head verification for the previous handoff checkpoint `dc8862a394934e55e13643684c9b770ec3c41a1c` passed on Workstream Verification run [#38729294952](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38729294952), retry attempt 2, and Engineering Governance. This is not evidence that scenarios 31/32 themselves passed.
- Source review confirms the Work Center → Agenda navigation already carries patient/work-item context, and the Agenda form calls `linkWorkItemToAgendaEvent` after a successful create. The callback does not write the existing typed `operational_work_items.agenda_event_id` column; it records the ID in text outcome and history only.
- Read-only hosted schema inspection confirms `operational_work_items.agenda_event_id` is absent from the live database, and hosted migration history contains no `20260923130000` row. This is a concrete WP-8 lineage/schema discrepancy, not a guess from filename similarity.
- Do not upgrade scenarios 31/32 to PASS without isolated end-to-end proof; do not apply the migration or repair hosted history. Treatment Plan and Operational Work ownership remains governed by Gate 02/its downstream owner; Agenda remains the sole appointment authority.

---

> **Exact-head verification addendum — 2026-10-15 (scenario 33):** Repository head `759a02082a35675d79c144cf9a10f8689ef96ef4` passed Workstream Verification [#38725278794](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38725278794) with all 12 jobs including Final gate, and Engineering Governance [#38725278788](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38725278788) passed on the same head. The Gate 04 database job explicitly logged `agenda-to-patient-flow-visit-bridge STATUS=PASS`: a pre-booked Agenda appointment remains the single scheduled appointment; a same-tenant Visit references it; canonical D3 creates one active waiting Queue Entry and one correlated `waiting_entered` event. This upgrades WP-7 scenario 33 from GAP to PASS for isolated branch-local DB evidence only. It does not imply hosted integration, Gate 04 closure, or any change to hosted Supabase. This documentation update itself requires exact-head verification.

---

> **Latest exact-head verification and scope reconciliation — 2026-10-15:** Repository head `51b28b30b478590bb303988e90515f48fcbfdc17` passed Workstream Verification [#1050](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38718190150) — all 12 jobs including the Gate 04 local DB lane and Final gate — and Engineering Governance [#310](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38718190151). Exact-head authenticated E2E passed both Follow-up entry paths (work and scheduled), verifying tenant patient/request UUIDs, the canonical Agenda route, the open appointment form, and Follow-up context label. Binding Gate 04 execution-contract §21 defines this handoff as the minimum integration: Agenda alone creates the appointment; Follow-up continuity/lifecycle remains Gate 11-owned. Scenario 34 is therefore PASS at the approved Gate 04 minimum scope. This does **not** claim a persistent appointment-result link back into `retention_followups`; that is not part of the approved Gate 04 minimum and must not be improvised by adding a parallel field/lifecycle. Local DB concurrency, audit boundary and direct permission-denial probes also remain PASS on their scenario-specific code candidates. No hosted Supabase schema/data/migration-history changes, merge or production promotion occurred. Gate 04 remains OPEN: WP-7 scenarios 31–33 and 26/27/29/30 remain GAP; WP-8 remains BLOCKED; PR #242 remains Draft/open/unmerged. This documentation refresh requires exact-head Workstream and Governance verification.

---

---

---

> **Exact-head verification update — 2026-10-14:** Candidate `a1f7a0aeba14d9a892849fd19e0ea0ff2be7b4e2` completed Workstream Verification #1031 **PASS** (all applicable lanes and final gate) and Engineering Governance #291 **PASS**. Direct probes on clean local migration replay rejected real room and resource rows owned by another tenant with `AGENDA_ROOM_NOT_AVAILABLE` and `AGENDA_RESOURCE_UNAVAILABLE`. Hosted Supabase was not changed. This documentation update requires exact-head verification before being treated as fully verified.

---

> **Verification result correction — 2026-10-14:** Workstream Verification #1026 on candidate `ec6b6572ed679c65f379f0b9d13a70ed263d4840` subsequently completed **PASS**: all 11 verification lanes and the final gate succeeded. Engineering Governance #286 also passed on that candidate. Scenario 19 is therefore PASS on direct branch-local DB evidence and the exact implementation candidate is fully verified. The later documentation-only candidate `369278b00dcbfb25f0f78e8925b1edb91f5fb3e0` started Workstream Verification #1027, but that run is superseded by this status correction; the new documentation candidate created by this correction requires its own exact-head verification. Do not report the current documentation head as verified until its run completes.

---

# Gate 04 — WP-7 Scenario Evidence Matrix

**Record date:** 2026-10-15  
**Latest exact-head verified code candidate before this documentation refresh:** `2e786c4d11a9aa0f19ed58ea7ab0f3661332df72` — Workstream Verification #1049 PASS (all 12 jobs + Final gate) and Engineering Governance #309 PASS.  
**Scenario 19:** PASS on direct branch-local DB evidence at `ec6b6572ed679c65f379f0b9d13a70ed263d4840`.  
**Scenario 22:** PASS on direct branch-local DB evidence at exact baseline `fd26ba1c57a33556c033e664adf1da97e820cf2c`; Workstream #38764571577's isolated `csapi-gate04-database` lane re-ran the absence-preservation assertions on that head.  
**Cross-tenant provider/room/resource references:** PASS on direct isolated local DB evidence; provider probe verified on `f165f19cb7e32aa5bb62cf219cf34a63607d9bb2` by Workstream #1039, with expected `AGENDA_PROVIDER_NOT_FOUND_IN_TENANT`; room/resource probes verified on `a1f7a0aeba14d9a892849fd19e0ea0ff2be7b4e2`.  
**Engineering Governance:** #299 — PASS on `f165f19cb7e32aa5bb62cf219cf34a63607d9bb2`.  
**Gate status:** OPEN — this matrix is a coverage reconciliation, not a closure declaration.

## Evidence interpretation

- **PASS** means the specific behavior has direct, traceable evidence on the stated candidate.
- **PARTIAL** means a related layer is tested, but the full scenario in the frozen Verification Plan is not proven.
- **GAP** means the required scenario has no direct, traceable test evidence on this candidate.
- Passing CI, static assertions, existing schema objects, or source inspection alone do not upgrade a scenario to PASS.

## Frozen Verification Plan — scenarios 1–34

| # | Required scenario | Current evidence / referenced candidate | Status |
|---:|---|---|---|
| 1 | Standard appointment booking | Local protected command creates a scheduled appointment, but no full UI submission scenario is exercised. | PARTIAL |
| 2 | Booking within provider availability | Isolated behavioral check executes the actual availability engine and confirms a feasible 09:00 Asia/Amman slot is available within configured provider hours; it does not submit a full appointment command/UI booking. | PARTIAL |
| 3 | Booking requiring a room/resource | Actual conflict engine rejects an overlapping room and allows the no-conflict room path in the combined provider/room/device feasibility probe; full mutation submit remains untested. | PARTIAL |
| 4 | Booking requiring a device/resource | Actual conflict engine rejects an overlapping selected device/resource; combined feasibility probe includes the selected resource with no overlap. Full mutation submit remains untested. | PARTIAL |
| 5 | Provider + room + device simultaneously feasible | Actual availability engine accepts the configured provider and room together; actual conflict engine confirms no patient/provider/room/device conflict for the same candidate interval. Full mutation submit remains untested. | PARTIAL |
| 6 | Provider unavailable | Isolated behavioral checks confirm the actual availability engine rejects an out-of-hours slot and a provider with an active overlapping booking; full appointment-submit rejection is not independently exercised. | PARTIAL |
| 7 | Room conflict | Isolated clean-replay DB probe rejects an active overlapping booking for the same room; after the first appointment completes, an overlapping booking is accepted. | PASS |
| 8 | Resource conflict | Isolated clean-replay DB probe rejects an active overlapping booking for the same resource/device; after completion, an overlapping booking is accepted. | PASS |
| 9 | Patient conflict | Isolated clean-replay DB probe verifies completed appointment releases the patient interval and active overlapping appointment is rejected. | PASS |
| 10 | Confirmation | Protected transition `scheduled → confirmed` and STATUS_CHANGE audit verified in isolated local DB. | PASS |
| 11 | Normal reschedule | Isolated DB flow reschedules a confirmed appointment, verifies the `confirmed → rescheduled` state and RESCHEDULE audit, then transitions it back to scheduled. | PASS |
| 12 | Normal cancellation | Protected cancel command, reason, actor, and CANCEL audit verified in isolated local DB. | PASS |
| 13 | No-show | Isolated DB flow transitions `confirmed → no_show`, verifies STATUS_CHANGE audit, and verifies the no-show provider interval no longer blocks a new booking. | PASS |
| 14 | Arrival/status progression | Isolated DB flow exercises `scheduled → confirmed → arrived → in_session → completed` for patient/provider/room/resource-device conflict scenarios. | PASS |
| 15 | Completed appointment no longer blocks active conflicts | Branch-only forward migration aligns all four exclusion predicates. On the exact candidate, isolated clean replay passed separate patient, provider, room, and resource/device probes: completion releases the interval and an active overlap is still rejected. Hosted schema remains unchanged pending WP-8 release review. | PASS — branch-local verification |
| 16 | Tenant-local wall-clock values persist as correct UTC values | Exact-head Gate 04 timezone lane passes 12 behavior groups: normal conversion/round-trip, non-hour UTC offset, explicit-offset preservation, invalid input/timezone rejection, DST spring-gap rejection, deterministic earlier instant during fall-back overlap, wall-clock duration across midnight, and a tenant-local week range spanning a 167-hour DST week. Static assertions also verify Quick Appointment/form duration calculations, tenant-local calendar bounds, and tenant-local workforce-leave fallback. | PASS — timezone boundary behavior verified |
| 17 | Buffer prevents adjacent conflicting booking | Isolated clean-replay DB probe sets a 15-minute buffer: same-resource booking inside the buffer is rejected, and a booking after buffer end succeeds. | PASS |
| 18 | Late arrival does not mutate planned time | Isolated clean-replay DB probe transitions `scheduled → confirmed → arrived` and asserts `scheduled_start` is unchanged. | PASS |
| 19 | Overrun does not create a second scheduler state | On candidate `ec6b6572ed679c65f379f0b9d13a70ed263d4840`, isolated clean local DB replay in Workstream Verification #1026 passed the direct overrun assertions: an appointment whose planned end is in the past transitions to `in_session`, remains one `master_agenda_events` row, preserves `scheduled_start`/`scheduled_end`, and remains in the same lifecycle. Hosted DB was not touched. | PASS — branch-local DB evidence |
| 20 | Workforce working pattern permits booking | Behavioral assertion runs the actual availability engine with an active Workforce schedule and confirms a feasible slot is allowed. Isolated client double; not hosted integration. | PASS — isolated behavior |
| 21 | Approved leave/unavailability blocks booking | Behavioral assertion runs the actual availability engine with an approved Workforce absence overlapping the requested interval and confirms the slot is blocked. Isolated client double; not hosted integration. | PASS — isolated behavior |
| 22 | Workforce change does not silently delete/rebook existing appointments | Exact baseline `fd26ba1c57a33556c033e664adf1da97e820cf2c`, Workstream Verification [#38764571577](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38764571577) PASS: clean local replay confirms the existing appointment remains exactly one row with planned start/end and `scheduled` status unchanged after an approved Workforce absence; an overlapping new booking is rejected as unavailable and not persisted. | PASS — exact-head branch-local DB evidence; hosted DB untouched | WP-7 remains OPEN; WP-8 remains BLOCKED; PR #242 Draft/unmerged; PR #241 held open until Gate 04 closure | Reconcile the missing owner-owned resource contracts (26/27/29/30) without inventing requirements, then prepare a Gate-04-only isolated verification path for scenario 31. Scenario 32 remains GAP until typed-reference evidence and WP-8 lineage reconciliation are resolved |
| 23 | Provider-required procedure rejects missing provider | Actual Service/Procedure requirement adapter resolves `provider_type=doctor`; the availability engine rejects a missing provider with `AGENDA_PROVIDER_REQUIRED`. Isolated client double. | PASS — isolated behavior |
| 24 | Provider-optional procedure permits null provider | Actual Service/Procedure adapter resolves `provider_type=optional`; the availability engine allows providerless feasibility. Isolated client double; no full booking submission. | PASS — isolated behavior |
| 25 | Provider eligibility uses explicit Workforce capability | New behavioral assertions exercise the actual availability engine with a configured capability: an eligible Workforce provider is allowed, an ineligible provider is rejected, and no configured capability retains the existing fallback. Isolated client double; not hosted integration. | PASS — isolated behavior |
| 26 | Required resource unavailable rejects booking | No configured required-resource scenario; historical resource requirement table is not active. | GAP |
| 27 | Optional resource does not create a hard block | No optional-resource scenario. | GAP |
| 28 | Default exclusive resource cannot overlap | Isolated clean-replay resource/device probe confirms active overlapping requests are rejected; no capacity engine is introduced. | PASS |
| 29 | Explicit shared/capacity policy behaves as configured | No configured capacity/shared policy scenario; do not infer a capacity engine. | GAP |
| 30 | Consumable shortage does not block booking automatically | No consumable-shortage scenario. | GAP |
| 31 | Treatment Plan Next Action requests an Agenda-owned appointment | Work Center exposes `Book in Agenda` for `next_action` items sourced from `treatment_plan_item`, passing patient ID, `bookingWorkItemId`, and `treatmentPlanItemId` in the Agenda URL. Agenda form accepts the work-item ID, but no E2E proves the full Treatment Plan Next Action → appointment creation path on an isolated fixture. | GAP — direct E2E missing |
| 32 | Appointment reference returns to requesting cross-domain context | The existing migration `20260923130000_csapi_gate02_next_action_agenda_link.sql` defines `operational_work_items.agenda_event_id`, but `linkWorkItemToAgendaEvent` currently stores the appointment UUID only in `outcome` and `operational_work_history.note`, never writes the typed column. Read-only hosted inspection confirms the column and migration-history row are absent in project `qaslsjyxjwvdoiczmhgq`. No isolated round-trip assertion proves a durable typed reference. | GAP — implementation + hosted lineage divergence |
| 33 | Pre-booked appointment enters Patient Flow without Queue becoming a scheduler | Workstream Verification #38725278794 on exact head `759a02082a35675d79c144cf9a10f8689ef96ef4`: `csapi-gate04-database` passed the isolated clean-migration replay. The verifier creates an Agenda-owned scheduled appointment through `agenda_create_appointment`, links it to a same-tenant Visit, invokes canonical `csapi_d3_enter_waiting`, and asserts one active Queue Entry plus one correlated `waiting_entered` event while the Agenda appointment remains scheduled and unduplicated. Explicit log marker: `GATE04_DB_CHECK=agenda-to-patient-flow-visit-bridge STATUS=PASS`. Local rollback-only evidence; no hosted DB mutation. | PASS — branch-local DB evidence |
| 34 | Active Follow-up appointment request hands off to Agenda with context; Follow-up retains continuity ownership | Workstream #1050 on exact head `51b28b30b478590bb303988e90515f48fcbfdc17`: authenticated E2E passes from both Follow-up work and scheduled views, verifies tenant patient/request UUIDs, opens the canonical Agenda form and verifies its Follow-up context label. This is the minimum Gate 04 scope in execution-contract §21; appointment creation stays in Agenda and Follow-up lifecycle stays Gate 11-owned. No persistent return-reference or `retention_followups.agenda_event_id` link is claimed or introduced. | PASS — approved Gate 04 minimum |

## Additional protected-command, authorization and audit probes

| Requirement | Evidence on candidate `548f050c2f6e18122b9350e655e74ea5ab54090e` | Status |
|---|---|---|
| Clean local migration replay; protected RPC ACL; appointment table write ACL; RLS and audit trigger presence | Gate 04 isolated database lane #1000 passed all checks. | PASS |
| Ordinary authenticated role cannot invoke protected RPC or directly write appointment rows | Negative authenticated RPC/table-write probes passed in local DB. | PASS |
| Anonymous role has no protected RPC execution or direct table-write privilege | Privilege/catalog assertions passed; a separate anonymous-session mutation attempt is not part of the probe. | PARTIAL |
| Cross-tenant patient reference is rejected | New local DB negative probe passed. | PASS |
| Cross-tenant provider, room, and resource references are rejected | Workstream #1039 PASS on exact head `f165f19cb7e32aa5bb62cf219cf34a63607d9bb2` verifies the real cross-tenant provider is rejected with `AGENDA_PROVIDER_NOT_FOUND_IN_TENANT`; clean local replay previously rejected real cross-tenant room/resource rows with `AGENDA_ROOM_NOT_AVAILABLE` and `AGENDA_RESOURCE_UNAVAILABLE` on `a1f7a0aeba14d9a892849fd19e0ea0ff2be7b4e2`. | PASS — provider/room/resource negative probes verified in isolated local DB |
| Normal UPDATE is reconstructible with actor/reason | New local DB update and UPDATE-audit assertion passed. | PASS |
| Stale expected appointment status cannot override persisted status | New local DB stale-status negative probe passed. | PASS |
| CREATE, STATUS_CHANGE, CANCEL, and cancelled → scheduled RESCHEDULE audit | Direct isolated local DB assertions passed. | PASS |
| User lacking `agenda:create` / `agenda:update` is denied | Clean local DB replay on exact candidate `5dae0de8d98738ea56ac1d05d8deeff1270a64dd`: seeded a valid same-tenant clinic user with no effective Agenda grants; canonical create and update commands both rejected with `AGENDA_PERMISSION_DENIED`. | PASS — branch-local DB evidence |
| Unauthorized audit-detail disclosure is blocked | Clean local DB replay on exact candidate `5dae0de8d98738ea56ac1d05d8deeff1270a64dd`: a same-tenant authenticated user without audit-read rights queried `audit_trail` and observed zero rows; static checks confirmed the broad `rls_breaches_isolation FOR ALL` policy is absent and dedicated operation-scoped policies exist. | PASS — branch-local DB evidence |
| Two competing requests cannot both acquire an exclusive provider/room/resource | Workstream #1049 on exact candidate `2e786c4d11a9aa0f19ed58ea7ab0f3661332df72`, clean local DB replay: two separate `psql` sessions called protected `agenda_create_appointment` against the same exclusive device while the first transaction remained open; one winner, one exclusion conflict, exactly one persisted appointment, fixture cleanup PASS. This does not verify hosted Supabase. | PASS — branch-local concurrency evidence |

## Completed-appointment conflict policy — branch verification result

The earlier read-only inspection identified a mismatch between the hosted exclusion predicates and the application lifecycle. A forward-only branch migration, `20261013100000_csapi_gate04_completed_appointment_conflict_policy.sql`, now aligns the doctor, patient, room, and resource/device exclusion predicates with the approved active-conflict lifecycle.

On candidate `972786d6569e5e596a6974a8c2e5fde155a6f727`, Workstream Verification #1008 passed, including clean local migration replay and separate patient/provider/room/resource-device flow probes. Each tested dimension allows a new overlapping booking after completion and rejects an active overlap. This is evidence for the branch's clean-replay state only; it does **not** mean the migration was applied to hosted Supabase. Hosted schema/data/history remain unchanged. The migration-lineage and read-only active-overlap preflight remain WP-8 release blockers.

## WP-8 read-only schema and migration-lineage observations — 2026-10-13

- Hosted schema objects and constraints were inspected read-only; no hosted schema, data, or migration history was changed.
- `clinic_procedure_resources` is absent from live schema. The approved Gate 04 contract prohibits resurrecting that historical model merely by replaying old migration files.
- Fresh inventory at repository SHA `25bbb3c27f00f662ae438d2f9cbdcc1d8f2cebc6`: 240 repository SQL files, 234 canonical 14-digit migration files, 6 noncanonical legacy files, 292 hosted migration-history rows, 121 shared version keys, 113 repository-only version keys, 171 hosted-only rows, and 12 shared version keys with different names.
- Exact-name triage identified 71 repository-only version keys with same-name hosted candidates and 72 hosted-only rows with same-name repository candidates. 42 repository-only versions and 99 hosted-only rows have no exact-name candidate. Name matching is correlation only, not proof of identical SQL or effects.
- The 2026-10-13 inventory recorded five branch-only canonical Gate 04 migrations at that snapshot. The later audit-read lockdown migration `20261015100000_csapi_gate04_audit_read_policy_lockdown.sql` is an additional branch-only migration and must also be reconciled during WP-8; no hosted history row was inserted or rewritten.

## Exit disposition

- **WP-7 remains OPEN.** Exact-head CI is green, but the remaining scenario gaps in the matrix prevent integrated-verification closure.
- **WP-8 remains BLOCKED.** The refreshed version/name inventory and selected schema observations are not a complete migration-lineage reconciliation, and hosted preflight/release review remain outstanding.
- PR #242 remains Draft/open/unmerged. No hosted migration application/history edits, merge, or production promotion is authorized by this checkpoint.


## Latest scenario-15 evidence addendum — candidate a24f6e70c659d3996c4e9bb5f0352220f2dc5dbc

Workstream #1004 and Governance #264 passed on this exact candidate. The isolated local DB verifier now drives an appointment through the complete active lifecycle to `completed`, verifies that an overlapping new appointment for the same patient is accepted, then verifies a second overlapping active appointment is rejected. It also checks all four canonical exclusion-constraint definitions for the lifecycle exclusions.

**Updated classification:** scenario 15 is **PARTIAL**, not PASS: direct behavior is exercised for patient overlap, while doctor/room/resource completed-vs-active behavior is supported only by constraint-definition assertions, not separate dimension-specific competing-booking probes. All other matrix statuses remain as previously recorded against candidate `548f050c2f6e18122b9350e655e74ea5ab54090e` until new scenario-specific evidence changes them. WP-7 remains OPEN; WP-8 remains BLOCKED.


## WP-7 scenario 15 extension — dimension-specific probes added; verification pending (2026-10-13)

- Extended `tools/csapi-gate04-database-verification.mjs` with separate provider, room, and resource/device scenarios. Each scenario drives a booking through scheduled → confirmed → arrived → in_session → completed, verifies a new overlapping booking on that same dimension can be created, and verifies a further active overlap is rejected.
- The probes seed distinct same-tenant patients and dedicated room/resource records so patient overlap does not mask provider/room/resource results.
- The existing patient-dimension scenario remains in place. The four constraint-definition assertions remain as a separate structural check.
- **Evidence status remains PARTIAL / PENDING exact-head CI.** These new probes are implementation, not evidence of success until the local database lane passes on this exact revision. Do not upgrade scenario 15 to PASS beforehand.
- The most recent documentation-only candidate `b89a408234aac26e707d22f60152bbf59eac0f0c` had a passing Gate 04 database lane but failed the unrelated global presentation runtime lane while waiting for `global-header` visibility after repeated “destination stream closed early” errors. The targeted retry was initiated; no retry result is assumed here.
- Scope remains Gate 04 WP-7. WP-7 stays OPEN pending exact-head results and remaining scenarios; WP-8 stays BLOCKED. Branch-only changes: no hosted Supabase mutation/history edits, PR merge, or production promotion.


## Exact-head verification refresh — 2026-10-13

Workstream Verification #1008 and Engineering Governance #268 passed on `972786d6569e5e596a6974a8c2e5fde155a6f727`. The local database lane explicitly passed clean replay, schema/security inspection, protected command boundary, direct table-write ACL, audit trigger/RLS checks, and the Gate 04 appointment command/audit flow. Scenario rows 7, 8, 9, 15 and 28 are updated from the new dimension-specific probes. Other rows are not upgraded merely because CI is green. Any subsequent documentation commit is a new candidate and must pass exact-head verification again.


## Exact-head scenario expansion — normal reschedule and no-show (2026-10-13)

Candidate `f7a3d828ff2d133ca4797d8153fd5758e077e1dc` passed Workstream Verification #1010 and Governance #270. The isolated local database lane passed confirmed-appointment reschedule to `rescheduled` with RESCHEDULE audit, `rescheduled → scheduled`, and `confirmed → no_show` with STATUS_CHANGE audit plus provider interval release. Existing dimension-specific probes also verify the full `scheduled → confirmed → arrived → in_session → completed` lifecycle. Scenarios 11, 13, and 14 are therefore PASS on this candidate. The remaining matrix gaps still prevent WP-7 closure.


## Hosted active-conflict preflight — read-only (2026-10-13)

A fresh read-only query against hosted `master_agenda_events` found **0 active overlapping pairs** sharing patient, doctor, room, or resource/device. There were 13 pairs with overlapping time ranges, but they shared none of those exclusive dimensions. The four hosted exclusion definitions were also re-read: doctor, patient, and room still exclude only cancelled/no-show statuses and therefore still block completed appointments; resource/device already excludes completed. This is evidence for a safe data preflight at this moment, not permission to apply the branch migration. WP-8 remains blocked pending complete lineage reconciliation and release review.


## Tenant-local wall-clock verification added — pending (2026-10-13)

The next candidate adds executable checks that import and run the actual `tenantLocalToUtc` / `utcToTenantInput` helpers from `src/shared/utils/dateTime.ts`: Asia/Amman wall-clock 09:00 converts to 06:00Z, round-trips to 09:00 local, and an explicitly offset-aware input remains absolute. Scenario 16 remains GAP until the exact-head Gate 04 static lane passes with these behavioral assertions. No status upgrade is inferred from code presence alone.


## Provider availability behavior probes added — pending (2026-10-13)

Candidate `1d2bf5c76eeda9f32907fc5b5362924c6850220e` passed Workstream Verification #1013 and Governance #273. The isolated behavioral checks execute the actual `checkAvailability` implementation with a controlled Supabase-client double: an in-hours Asia/Amman slot is available, an out-of-hours slot is rejected, an active provider overlap is rejected, and a provider-required booking without a provider is rejected. Scenarios 2 and 6 are PARTIAL because the engine decision is directly verified but a full appointment-submit scenario is not yet covered.


## Current exact-head availability evidence — 2026-10-13

The Gate 04 static lane passed on `1d2bf5c76eeda9f32907fc5b5362924c6850220e`, including actual timezone helper behavior and availability-engine behavior. This raises scenario 16 to PASS and scenarios 2 and 6 to PARTIAL; the latter still need an integrated appointment-submit assertion. The isolated DB lane and all required workstream jobs passed on the same exact head. Remaining scenario gaps still keep WP-7 open.


## Follow-up action end-to-end extension — pending (2026-10-13)

The next candidate replaces the previous direct-URL-only E2E with two read-only UI flows: click the real Book appointment action from the Follow-up work view and from the scheduled view, verify the tenant-scoped patient/request context in the generated Agenda URL, and confirm the Agenda form opens with the Follow-up context label. No appointment is submitted and no hosted data is mutated. Scenario 34 remains PARTIAL until an authorized local integration test proves the appointment-submit/result-reference path.


## Provider / room / device feasibility probes — isolated runtime (2026-10-13)

The Gate 04 static lane now transpiles and executes the real `conflict.engine.ts` against deterministic overlapping event rows. It asserts that room overlap returns the `room` conflict rule and device/resource overlap returns the `resource` rule. A combined scenario executes the real availability engine for a provider plus room, then the conflict engine for provider, room, device/resource and patient with no overlapping event; the candidate is accepted by both engines. These probes are intentionally classified PARTIAL for scenarios 3–5 because they do not submit through the full protected mutation service or configure authoritative procedure resource requirements. No capacity/resource-requirement model is inferred or activated.


## Buffer and late-arrival lifecycle probes — isolated database (2026-10-13)

The clean local replay now verifies a 15-minute exclusive-resource buffer: an overlapping booking beginning 5 minutes before buffer end is rejected by the database exclusion constraint, while a new booking beginning 5 minutes after buffer end succeeds. A separate appointment is transitioned to `confirmed` and `arrived`; the stored planned `scheduled_start` must remain identical. These checks do not alter hosted data and do not create an additional scheduler state.


## Exact-head timezone verification — 2026-10-13

- Candidate: `66a76b200d7871a5e4e1870727d9150b7fd5db4d`
- Workstream Verification [#1022 — PASS](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38405509811); Engineering Governance [#282 — PASS](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38405509614).
- The dedicated timezone verifier reports `GATE04_TIMEZONE_CHECK=PASS cases=12`; the Gate 04 static lane and isolated local database lane also pass on this exact SHA.
- Corrected behaviors: reject nonexistent DST-gap wall times, select the earlier instant consistently for repeated fall-back wall times, preserve explicit-offset instants, handle non-hour offsets, calculate durations as tenant wall-clock arithmetic rather than browser-local time, and query/render calendar weeks by tenant-local date boundaries. Workforce-leave fallback boundaries are converted from tenant-local midnight to UTC; buffer arithmetic uses elapsed-time milliseconds.
- Gate 04 remains OPEN: other WP-7 scenarios remain PARTIAL/GAP, and WP-8 remains BLOCKED. No hosted database/history changes, merge, or production promotion occurred.


### Verification boundary for Workforce/provider scenarios

Scenarios 20, 21, 23, 24 and 25 are now directly exercised against the actual TypeScript availability/requirement implementations using a deterministic isolated Supabase-client double. They prove branch behavior, not live Workforce data correctness, end-to-end appointment submission, or hosted database integration. The remaining matrix gaps are unchanged unless separately evidenced. Exact-head Workstream Verification must pass before these updates count as verified.


### Scenario 19 exact evidence update — 2026-10-14

- Added an isolated local database scenario that creates a past-ended appointment, moves it through `scheduled → confirmed → arrived → in_session`, and asserts exactly one appointment record remains, planned start/end remain unchanged, and status remains `in_session`.
- The `csapi-gate04-database` lane passed on candidate `ec6b6572ed679c65f379f0b9d13a70ed263d4840` in Workstream Verification #1026. This is direct scenario-level evidence; Workstream Verification #1026 subsequently completed PASS across all 11 lanes and the final gate.
- No hosted Supabase schema/data/history change, merge, or production promotion occurred. WP-7 remains OPEN for remaining gaps; WP-8 remains BLOCKED.


## 2026-10-15 exact-head security evidence

- Workstream Verification #1045 and Engineering Governance #305 both passed on `5dae0de8d98738ea56ac1d05d8deeff1270a64dd`.
- The new audit read-policy migration and the three negative checks above passed the isolated `csapi-gate04-database` lane after clean local migration replay. This evidence is not hosted-Supabase verification.
- The frozen 2026-10-13 WP-8 inventory remains a historical read-only snapshot (240 repository SQL files / 234 canonical files at that snapshot). The branch now has one additional branch-only canonical migration, `20261015100000_csapi_gate04_audit_read_policy_lockdown.sql`; do not interpret the old inventory as current branch counts or as refreshed hosted history.
- Remaining WP-7 gaps are unchanged except for the two authorization/audit rows marked PASS: concurrent competing bookings; scenarios 26, 27, 29 and 30 pending canonical resource contracts; scenarios 31–33; and scenario 34 remains PARTIAL because booking submission/result reference are not proven.



## 2026-10-15 concurrency verification addendum

- Exact code candidate `2e786c4d11a9aa0f19ed58ea7ab0f3661332df72` passed Workstream Verification #1049 and Engineering Governance #309.
- The Gate 04 isolated database lane ran a controlled two-session booking conflict. The first session retained an uncommitted exclusive-resource booking while the competing session attempted the same resource; verification observed one winner, one exclusion conflict, exactly one stored appointment, and successful cleanup.
- Scenario concurrency is PASS on branch-local evidence only. Do not infer that hosted constraints or hosted migration history have changed. WP-7 remains OPEN; WP-8 remains BLOCKED; PR #242 remains Draft/open/unmerged.


## Scenario 34 scope and evidence boundary — 2026-10-15

- Acceptance is the authenticated handoff from an active appointment-type Follow-up record to the canonical Agenda form, carrying the same tenant-scoped patient and request context. Workstream #1050 passed this path from both work and scheduled views on `51b28b30b478590bb303988e90515f48fcbfdc17`.
- This PASS is deliberately scoped to the approved minimum in Gate 04 execution-contract §21. Agenda remains the only appointment writer/owner; Follow-up retains continuity ownership.
- No persistent appointment ID is written back to `retention_followups` by this bridge, and Gate 04 must not add a new `agenda_event_id` field or new Follow-up lifecycle. A durable return-reference path belongs to Gate 11 / later explicit approval and is not a Gate 04 blocker under the frozen minimum contract.

## Exact-head verification addendum — 2026-10-15 (SHA `f00a1d0e146d7ef9b5f99da55f563cb776227daf`)

- Workstream Verification [#38721803811](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38721803811), retry attempt 2, completed **PASS** on the exact SHA above; all 12 jobs, including the final gate, succeeded. Engineering Governance [#38721803849](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38721803849) also passed on this candidate.
- The previously failing Gate 03 authenticated identity E2E now passed: authenticated login, registration without national ID, `REVIEW_REQUIRED` / `CREATE_NEW` resolution, authoritative patient search, and identity-preserving demographic update. The earlier `PATIENT_DATABASE_ERROR` / statement timeout did not recur in this run; this supports recording the retry as PASS, not a claim that all possible database latency is eliminated.
- The authenticated route E2E passed all 4 tests, including Follow-up → Agenda retaining the same patient and request context. Next.js emitted `destination stream closed early` messages during the run, but the Playwright suite reported `4 passed` and the job completed successfully; retain these messages as a runtime observation, not a test failure.
- Gate 04 isolated local database verification passed on this exact SHA, including clean local migration replay, security/ACL/RLS/audit checks, authenticated Agenda command audit flow, Agenda → same-tenant Visit / canonical D3 queue bridge without duplicate appointment, and concurrent exclusive-resource booking. The two independent command sessions yielded one winner, one exclusion conflict, and exactly one persisted appointment; cleanup passed.
- A verifier-only permissions fixture repair was included in the preceding implementation commit: required standard permission keys are restored inside the local rollback-only verification transaction. This is not a schema migration or persistent hosted database change.
- These results are branch/local-candidate evidence only. They do not reconcile repository-vs-hosted migration lineage or prove the hosted database was changed. No hosted Supabase mutation, PR merge, or production promotion occurred. PR #242 remains OPEN / DRAFT / UNMERGED.
- Gate 04 remains OPEN: WP-7 scenario gaps remain as classified in this matrix; WP-8 remains BLOCKED pending read-only, evidence-backed migration-lineage reconciliation. Do not infer closure from the green aggregate workflow.
