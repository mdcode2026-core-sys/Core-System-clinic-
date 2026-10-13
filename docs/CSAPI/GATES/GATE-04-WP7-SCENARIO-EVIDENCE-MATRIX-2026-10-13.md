# Gate 04 — WP-7 Scenario Evidence Matrix

**Record date:** 2026-10-13  
**Candidate verified:** `548f050c2f6e18122b9350e655e74ea5ab54090e`  
**Workstream Verification:** [#1000 — PASS](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38368309289)  
**Engineering Governance:** [#260 — PASS](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38368309490)  
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
| 2 | Booking within provider availability | Availability engine exists; no scenario-level positive booking probe. | GAP |
| 3 | Booking requiring a room/resource | No integrated room/resource booking probe. | GAP |
| 4 | Booking requiring a device/resource | No device/resource scenario probe. | GAP |
| 5 | Provider + room + device simultaneously feasible | No combined feasibility scenario probe. | GAP |
| 6 | Provider unavailable | No direct negative booking scenario. | GAP |
| 7 | Room conflict | Isolated clean-replay DB probe rejects an active overlapping booking for the same room; after the first appointment completes, an overlapping booking is accepted. | PASS |
| 8 | Resource conflict | Isolated clean-replay DB probe rejects an active overlapping booking for the same resource/device; after completion, an overlapping booking is accepted. | PASS |
| 9 | Patient conflict | Isolated clean-replay DB probe verifies completed appointment releases the patient interval and active overlapping appointment is rejected. | PASS |
| 10 | Confirmation | Protected transition `scheduled → confirmed` and STATUS_CHANGE audit verified in isolated local DB. | PASS |
| 11 | Normal reschedule | Isolated DB flow reschedules a confirmed appointment, verifies the `confirmed → rescheduled` state and RESCHEDULE audit, then transitions it back to scheduled. | PASS |
| 12 | Normal cancellation | Protected cancel command, reason, actor, and CANCEL audit verified in isolated local DB. | PASS |
| 13 | No-show | Isolated DB flow transitions `confirmed → no_show`, verifies STATUS_CHANGE audit, and verifies the no-show provider interval no longer blocks a new booking. | PASS |
| 14 | Arrival/status progression | Isolated DB flow exercises `scheduled → confirmed → arrived → in_session → completed` for patient/provider/room/resource-device conflict scenarios. | PASS |
| 15 | Completed appointment no longer blocks active conflicts | Branch-only forward migration aligns all four exclusion predicates. On the exact candidate, isolated clean replay passed separate patient, provider, room, and resource/device probes: completion releases the interval and an active overlap is still rejected. Hosted schema remains unchanged pending WP-8 release review. | PASS — branch-local verification |
| 16 | Tenant-local wall-clock values persist as correct UTC values | Test tenant uses Asia/Amman, but the DB probe passes UTC timestamps directly; conversion behavior is not tested. | GAP |
| 17 | Buffer prevents adjacent conflicting booking | No adjacent-booking buffer probe. | GAP |
| 18 | Late arrival does not mutate planned time | No late-arrival scenario. | GAP |
| 19 | Overrun does not create a second scheduler state | No overrun scenario. | GAP |
| 20 | Workforce working pattern permits booking | No positive schedule/availability integration probe. | GAP |
| 21 | Approved leave/unavailability blocks booking | No direct leave/unavailability scenario. | GAP |
| 22 | Workforce change does not silently delete/rebook existing appointments | No workforce-change preservation scenario. | GAP |
| 23 | Provider-required procedure rejects missing provider | No scenario with a procedure explicitly requiring a provider. | GAP |
| 24 | Provider-optional procedure permits null provider | Null-provider command succeeds with no procedure selected; this does not prove the explicit optional-procedure case. | PARTIAL |
| 25 | Provider eligibility uses explicit Workforce capability | Live capability table exists and source code consults it; configured allowed/denied provider cases are not tested. | PARTIAL |
| 26 | Required resource unavailable rejects booking | No configured required-resource scenario; historical resource requirement table is not active. | GAP |
| 27 | Optional resource does not create a hard block | No optional-resource scenario. | GAP |
| 28 | Default exclusive resource cannot overlap | Isolated clean-replay resource/device probe confirms active overlapping requests are rejected; no capacity engine is introduced. | PASS |
| 29 | Explicit shared/capacity policy behaves as configured | No configured capacity/shared policy scenario; do not infer a capacity engine. | GAP |
| 30 | Consumable shortage does not block booking automatically | No consumable-shortage scenario. | GAP |
| 31 | Treatment Plan Next Action requests an Agenda-owned appointment | No direct Treatment Plan → Agenda E2E evidence on this candidate. | GAP |
| 32 | Appointment reference returns to requesting cross-domain context | No direct Treatment Plan return-reference scenario. | GAP |
| 33 | Pre-booked appointment enters Patient Flow without Queue becoming a scheduler | No direct Agenda → Patient Flow E2E scenario. | GAP |
| 34 | Follow-up appointment request creates an Agenda appointment | Authenticated E2E verifies that the request opens the Agenda form with patient/request context; it does not submit and verify appointment creation. | PARTIAL |

## Additional protected-command, authorization and audit probes

| Requirement | Evidence on candidate `548f050c2f6e18122b9350e655e74ea5ab54090e` | Status |
|---|---|---|
| Clean local migration replay; protected RPC ACL; appointment table write ACL; RLS and audit trigger presence | Gate 04 isolated database lane #1000 passed all checks. | PASS |
| Ordinary authenticated role cannot invoke protected RPC or directly write appointment rows | Negative authenticated RPC/table-write probes passed in local DB. | PASS |
| Anonymous role has no protected RPC execution or direct table-write privilege | Privilege/catalog assertions passed; a separate anonymous-session mutation attempt is not part of the probe. | PARTIAL |
| Cross-tenant patient reference is rejected | New local DB negative probe passed. | PASS |
| Cross-tenant provider, room, and resource references are rejected | SQL guards and tenant-safe FK structures are present; dynamic negative probes are missing. | PARTIAL |
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
