# CORE SYSTEM — CSAPI Gate 04 — Agenda & Scheduling
## Verification Plan

**Date:** 2026-09-29
**Status:** VERIFICATION DESIGN FROZEN — EXECUTION CONTRACT JSON/LANES NOT YET ADDED
**Purpose:** Define the exact evidence Gate 04 must produce before closure.

## 1. Governing verification method
Use the existing Master Test Execution Contract:
`SETUP → Engineering → Impact/Matrix → Real-World E2E → Reconciliation → Regression → Final Verification`.
Gate 04 must provide a binding workstream descriptor before implementation verification begins. That descriptor will be added under `docs/testing/workstream-contracts/` together with the required runner/lane mappings.

## 2. Impact classification
Every changed surface is classified as:
`TARGET`, `DEPENDENCY`, `CROSS_IMPACT`, `INTEGRATED`, `SECURITY_IMPACT`, `DATA_IMPACT`, `ROLE_IMPACT`.
Exclusions require evidence.

## 3. Engineering lane
Mandatory:
- TypeScript/typecheck;
- lint;
- production build;
- Agenda architectural/static checks;
- no active direct mutation path into `master_agenda_events`;
- protected DB command boundary is the only supported Appointment write path;
- authenticated and anonymous direct table INSERT/UPDATE/DELETE attempts are denied;
- no duplicate scheduler/calendar engine;
- no unintended Treatment Plan / Follow-up ownership transfer.

## 4. Database / migration lane
Verify on clean replay:
- required Gate 04 migration order is deterministic;
- `master_agenda_events` remains the appointment source;
- tenant-safe foreign keys remain valid;
- RLS remains enabled and scoped;
- existing exclusion constraints remain present unless an explicitly approved policy transition changes enforcement;
- audit coverage exists for CREATE and lifecycle updates;
- any new booking-requirement/policy tables are tenant-safe and have clear owner/source semantics;
- repository migration history and Live migration history are reconciled before release.

## 5. Authorization / security lane
Positive:
- authorized read/create/update/status/cancel/reschedule actions work.
Negative:
- user without `agenda:create` cannot create;
- user without `agenda:update` cannot update/status/cancel/reschedule;
- cross-tenant patient/provider/room/resource references are rejected;
- client-submitted expected status cannot override persisted state;
- direct table mutation from an authenticated browser client is rejected;
- direct table mutation from anonymous access is rejected;
- trusted server command boundary performs final tenant/actor/state guards;
- audit data is not exposed at unauthorized detail levels.

## 6. Core authenticated E2E scenarios
### Booking
1. Standard appointment booking.
2. Booking with provider availability.
3. Booking requiring a room/resource.
4. Booking requiring a device/resource.
5. Provider + room + device simultaneously feasible.
6. Provider unavailable.
7. Room conflict.
8. Resource conflict.
9. Patient conflict.

### Lifecycle
10. Confirmation.
11. Normal reschedule.
12. Normal cancellation.
13. No-show.
14. Arrival/status progression where Agenda is authoritative.
15. Completed appointment does not remain as an active conflict.

### Time
16. Tenant-local wall-clock booking persists correct UTC values.
17. Buffer prevents adjacent conflicting booking.
18. Late arrival does not mutate planned appointment time.
19. Overrun does not create a second scheduler state.

### Workforce
20. Working pattern allows booking.
21. Approved leave/unavailability prevents new conflicting booking.
22. Workforce change does not silently delete or rebook an existing appointment.

### Provider optionality
23. A procedure/service that requires provider rejects missing provider.
24. A procedure/service that does not require provider permits a null provider.
25. Provider eligibility uses explicit Workforce capability, not skill/qualification auto-inference.

### Requirements / resources
26. Required resource is unavailable → booking fails with explicit reason.
27. Optional resource does not create an unnecessary hard block.
28. Default exclusive resource cannot overlap.
29. Explicit capacity/shared policy behaves according to its owner policy.
30. Consumable stock shortage does not automatically block booking.

## 7. Cross-domain E2E
31. Treatment Plan Next Action produces a booking request that results in an Agenda-owned Appointment.
32. Appointment reference returns to the requesting cross-domain context without Agenda taking clinical ownership.
33. Pre-booked appointment reaches Patient Flow/Visit without Queue becoming a scheduler.
34. Follow-up request can create an appointment while Follow-up remains continuity owner.

## 8. Audit verification
For each of create, update, status change, cancel and reschedule verify:
- one reconstructible audit record;
- correct actor/tenant/record;
- old/new state where applicable;
- reason/context captured where applicable;
- audit does not block the underlying appointment mutation solely because audit presentation is unavailable.

## 9. Concurrency verification
Verify:
- two competing requests for an exclusive doctor/room/resource cannot both succeed;
- database integrity remains the final defense;
- policy-driven capacity is not bypassed by direct client writes;
- no hidden second concurrency engine exists.

## 10. Historical / difficult scenario boundary
Gate 04 may include directly relevant difficult scenarios from the permanent register:
- late arrival;
- no-show;
- same-day cancellation;
- provider absence;
- room/device unavailable;
- provider+room+device conflict;
- overrun;
- Workforce leave overlapping an appointment;
- resource becoming unavailable after booking;
- cancellation caused by workforce/resource failure;
- audit reconstruction dispute;
- duplicate booking risk.
Other difficult scenarios remain with their owning future gates unless implementation evidence shows a direct Gate 04 dependency.

## 11. Regression policy
Minimum regression is Gate 04 target + direct dependencies. Cross-domain scenarios are elevated where Agenda mutations affect Treatment Plan/Follow-up/Patient Flow handoffs.
Closed Gates 01–03 are verified by their existing closure evidence and are not re-run as new feature scope unless Gate 04 evidence demonstrates a regression.

## 12. Failure handling
On failure:
1. capture exact candidate SHA;
2. identify first concrete failure;
3. classify owner;
4. inspect source/domain boundary;
5. fix the smallest root cause in the correct layer;
6. rerun the same required contract.
Never weaken or relabel the required test.

## 13. Release verification
Production verification begins only after required pre-production evidence passes on the exact candidate.
Required production evidence:
`main SHA → exact Vercel deployment → /api/build-info exact SHA → authenticated Production E2E → database/runtime reconciliation → closure documentation`.

## 14. Closure evidence bundle
Final bundle must contain:
- approved decisions and implementation contract;
- implementation plan and role allocation;
- binding Gate 04 workstream descriptor;
- CI results and exact SHAs;
- clean migration evidence;
- database/security evidence;
- authenticated E2E artifacts;
- cross-domain evidence;
- production evidence where required;
- final Ownership → Source → Execution Path → Integration Contract → Evidence → Classification reconciliation.

## 15. Closure condition
Gate 04 Verification is PASS only when every required lane is PASS and the final reconciliation demonstrates one canonical Agenda authority with no unexplained bypass or ownership drift.
