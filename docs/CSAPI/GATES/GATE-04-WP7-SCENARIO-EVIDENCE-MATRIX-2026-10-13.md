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
| 7 | Room conflict | Live exclusion constraint exists; no scenario-level competing booking probe. | PARTIAL |
| 8 | Resource conflict | Live exclusion constraint exists; no scenario-level competing booking probe. | PARTIAL |
| 9 | Patient conflict | Live exclusion constraint exists; no scenario-level competing booking probe. | PARTIAL |
| 10 | Confirmation | Protected transition `scheduled → confirmed` and STATUS_CHANGE audit verified in isolated local DB. | PASS |
| 11 | Normal reschedule | Cancelled appointment rebooking is verified; rescheduling a scheduled/confirmed appointment is not independently exercised. | PARTIAL |
| 12 | Normal cancellation | Protected cancel command, reason, actor, and CANCEL audit verified in isolated local DB. | PASS |
| 13 | No-show | No direct no-show transition scenario. | GAP |
| 14 | Arrival/status progression | Confirmation is tested; arrived → in_session → completed path is not. | PARTIAL |
| 15 | Completed appointment no longer blocks active conflicts | No conflict-engine scenario for completed appointments. | GAP |
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
| 28 | Default exclusive resource cannot overlap | Live room/resource exclusion constraints exist; no competing requests are executed. | PARTIAL |
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

## WP-8 read-only schema observations — 2026-10-13

The hosted Supabase project was queried read-only. No hosted schema, data, or migration history was changed.

- Present: `master_agenda_events`, `clinic_provider_availability`, `workforce_staff_schedules`, and `workforce_procedure_capabilities`.
- Present on `master_agenda_events`: exclusion constraints `no_doctor_overlap`, `no_patient_overlap`, `no_resource_overlap`, and `no_room_overlap`.
- `workforce_procedure_capabilities` has tenant-scoped policies and indexes; this supports object presence, not proof that a particular migration body was applied unchanged.
- `clinic_procedure_resources` is absent from the live schema even though hosted history contains a resource-requirement migration under another version key. The approved Gate 04 contract explicitly prohibits resurrecting this historical model merely by replaying old migration files.
- Fresh inventory remains: 238 repository SQL migration files (233 canonical 14-digit keys plus 5 shorter legacy files), 292 hosted history rows, 121 shared keys, 112 repository-only keys, 171 hosted-only keys, and 12 shared-key name mismatches.
- A fresh exact-name triage did not reproduce the earlier handoff's stated 82/80/82 candidate counts: this pass found 71 repository-only canonical keys with exact-name hosted candidates and 72 hosted-only rows with exact-name repository candidates. The matching-method discrepancy is unresolved; neither count is equivalence proof.

## Exit disposition

- **WP-7 remains OPEN.** Exact-head CI is green, but the explicit scenario gaps above prevent integrated-verification closure.
- **WP-8 remains BLOCKED.** Version/name inventory and selected schema observations are not a complete migration-lineage reconciliation.
- PR #242 remains Draft/open/unmerged. No hosted migration application/history edits, merge, or production promotion is authorized by this checkpoint.
