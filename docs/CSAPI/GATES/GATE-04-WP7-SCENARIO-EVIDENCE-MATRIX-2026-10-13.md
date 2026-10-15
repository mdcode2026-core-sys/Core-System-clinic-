> **Session close / latest exact-head verification — 2026-10-15:** Branch candidate `f165f19cb7e32aa5bb62cf219cf34a63607d9bb2` completed Workstream Verification [#1039 — PASS](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38528404638), including the isolated `csapi-gate04-database` lane and final gate; Engineering Governance [#299 — PASS](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38528404594) also passed on the same SHA. The actual cross-tenant provider negative probe now has exact-head verification: the protected booking command rejects the active provider belonging to another tenant with `AGENDA_PROVIDER_NOT_FOUND_IN_TENANT`. Cross-tenant room/resource probes remain PASS. Scenario 19 and scenario 22 remain PASS on their scenario-specific evidence. Gate 04 is NOT closed: WP-7 remains OPEN and WP-8 BLOCKED. PR #242 remains Draft/open/unmerged; no hosted Supabase mutation, merge, deployment, or production promotion occurred. The documentation changes in this session require their own exact-head verification before this documentation revision is treated as verified.

---

> **Exact-head verification update — 2026-10-14:** Candidate `a1f7a0aeba14d9a892849fd19e0ea0ff2be7b4e2` completed Workstream Verification #1031 **PASS** (all applicable lanes and final gate) and Engineering Governance #291 **PASS**. Direct probes on clean local migration replay rejected real room and resource rows owned by another tenant with `AGENDA_ROOM_NOT_AVAILABLE` and `AGENDA_RESOURCE_UNAVAILABLE`. Hosted Supabase was not changed. This documentation update requires exact-head verification before being treated as fully verified.

---

> **Verification result correction — 2026-10-14:** Workstream Verification #1026 on candidate `ec6b6572ed679c65f379f0b9d13a70ed263d4840` subsequently completed **PASS**: all 11 verification lanes and the final gate succeeded. Engineering Governance #286 also passed on that candidate. Scenario 19 is therefore PASS on direct branch-local DB evidence and the exact implementation candidate is fully verified. The later documentation-only candidate `369278b00dcbfb25f0f78e8925b1edb91f5fb3e0` started Workstream Verification #1027, but that run is superseded by this status correction; the new documentation candidate created by this correction requires its own exact-head verification. Do not report the current documentation head as verified until its run completes.

---

# Gate 04 — WP-7 Scenario Evidence Matrix

**Record date:** 2026-10-14  
**Latest exact-head verified code candidate before this documentation refresh:** `f165f19cb7e32aa5bb62cf219cf34a63607d9bb2` — Workstream Verification #1039 PASS (all applicable jobs + final gate) and Engineering Governance #299 PASS.  
**Scenario 19:** PASS on direct branch-local DB evidence at `ec6b6572ed679c65f379f0b9d13a70ed263d4840`.  
**Scenario 22:** PASS on direct branch-local DB evidence at `f3f3675855eb4e748064ebb7c10676fb2f4c4650`.  
**Cross-tenant provider/room/resource references:** PASS on direct isolated local DB evidence; provider probe verified on `f165f19cb7e32aa5bb62cf219cf34a63607d9bb2` by Workstream #1039, with expected `AGENDA_PROVIDER_NOT_FOUND_IN_TENANT`; room/resource probes verified on `a1f7a0aeba14d9a892849fd19e0ea0ff2be7b4e2`.  
**Engineering Governance:** #299 — PASS on `f165f19cb7e32aa5bb62cf219cf34a63607d9bb2`.  
**Gate status:** OPEN — this matrix is a coverage reconciliation, not a closure declaration.

## Evidence interpretation

- **PASS** means the specific behavior has direct, traceable evidence on the stated candidate.
- **PARTIAL** means a related layer is tested, but the full scenario in the frozen Verification Plan is not proven.
- **GAP** means the required scenario has no direct, traceable test evidence on this candidate.
- Passing CI, static assertions, existing schema objects, or source inspection alone do not upgrade a scenario to PASS.

## Frozen Verification Plan — scenarios 1–34

| # | Required scenario | Current evidence on `548f050c2f6e18122b9350e655e74ea5ab54090e` | Status |
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
| 22 | Workforce change does not silently delete/rebook existing appointments | On candidate `f3f3675855eb4e748064ebb7c10676fb2f4c4650`, Workstream Verification #1029 isolated clean-local DB lane passed: an existing scheduled appointment remained exactly one row with unchanged planned start/end and `scheduled` status after an approved Workforce absence was inserted; a new overlapping booking was rejected as unavailable and was not persisted. Hosted DB was not touched. | PASS — branch-local DB evidence |
| 23 | Provider-required procedure rejects missing provider | Actual Service/Procedure requirement adapter resolves `provider_type=doctor`; the availability engine rejects a missing provider with `AGENDA_PROVIDER_REQUIRED`. Isolated client double. | PASS — isolated behavior |
| 24 | Provider-optional procedure permits null provider | Actual Service/Procedure adapter resolves `provider_type=optional`; the availability engine allows providerless feasibility. Isolated client double; no full booking submission. | PASS — isolated behavior |
| 25 | Provider eligibility uses explicit Workforce capability | New behavioral assertions exercise the actual availability engine with a configured capability: an eligible Workforce provider is allowed, an ineligible provider is rejected, and no configured capability retains the existing fallback. Isolated client double; not hosted integration. | PASS — isolated behavior |
| 26 | Required resource unavailable rejects booking | No configured required-resource scenario; historical resource requirement table is not active. | GAP |
| 27 | Optional resource does not create a hard block | No optional-resource scenario. | GAP |
| 28 | Default exclusive resource cannot overlap | Isolated clean-replay resource/device probe confirms active overlapping requests are rejected; no capacity engine is introduced. | PASS |
| 29 | Explicit shared/capacity policy behaves as configured | No configured capacity/shared policy scenario; do not infer a capacity engine. | GAP |
| 30 | Consumable shortage does not block booking automatically | No consumable-shortage scenario. | GAP |
| 31 | Treatment Plan Next Action requests an Agenda-owned appointment | No direct Treatment Plan → Agenda E2E evidence on this candidate. | GAP |
| 32 | Appointment reference returns to requesting cross-domain context | No direct Treatment Plan return-reference scenario. | GAP |
| 33 | Pre-booked appointment enters Patient Flow without Queue becoming a scheduler | No direct Agenda → Patient Flow E2E scenario. | GAP |
| 34 | Follow-up appointment request creates an Agenda appointment | New authenticated E2E now clicks the actual Book appointment action from both Follow-up work and scheduled views, verifies patient/request UUIDs in the link, opens Agenda with the same context, and checks the context label. It does not submit the booking or verify the created appointment. | PARTIAL |

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
| User lacking `agenda:create` / `agenda:update` is denied | Not directly tested with a user lacking each permission. | GAP |
| Unauthorized audit-detail disclosure is blocked | No dedicated disclosure-level test. | GAP |
| Two competing requests cannot both acquire an exclusive provider/room/resource | No concurrent competing-booking test. | GAP |

## Completed-appointment conflict policy — branch verification result

The earlier read-only inspection identified a mismatch between the hosted exclusion predicates and the application lifecycle. A forward-only branch migration, `20261013100000_csapi_gate04_completed_appointment_conflict_policy.sql`, now aligns the doctor, patient, room, and resource/device exclusion predicates with the approved active-conflict lifecycle.

On candidate `972786d6569e5e596a6974a8c2e5fde155a6f727`, Workstream Verification #1008 passed, including clean local migration replay and separate patient/provider/room/resource-device flow probes. Each tested dimension allows a new overlapping booking after completion and rejects an active overlap. This is evidence for the branch's clean-replay state only; it does **not** mean the migration was applied to hosted Supabase. Hosted schema/data/history remain unchanged. The migration-lineage and read-only active-overlap preflight remain WP-8 release blockers.

## WP-8 read-only schema and migration-lineage observations — 2026-10-13

- Hosted schema objects and constraints were inspected read-only; no hosted schema, data, or migration history was changed.
- `clinic_procedure_resources` is absent from live schema. The approved Gate 04 contract prohibits resurrecting that historical model merely by replaying old migration files.
- Fresh inventory at repository SHA `25bbb3c27f00f662ae438d2f9cbdcc1d8f2cebc6`: 240 repository SQL files, 234 canonical 14-digit migration files, 6 noncanonical legacy files, 292 hosted migration-history rows, 121 shared version keys, 113 repository-only version keys, 171 hosted-only rows, and 12 shared version keys with different names.
- Exact-name triage identified 71 repository-only version keys with same-name hosted candidates and 72 hosted-only rows with same-name repository candidates. 42 repository-only versions and 99 hosted-only rows have no exact-name candidate. Name matching is correlation only, not proof of identical SQL or effects.
- Five canonical Gate 04 migrations are branch-only and must be accounted for separately; no hosted history row was inserted or rewritten.

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
