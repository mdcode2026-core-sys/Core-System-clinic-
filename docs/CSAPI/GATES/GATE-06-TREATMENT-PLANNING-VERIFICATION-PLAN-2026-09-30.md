# CSAPI Gate 06 — Treatment Planning — Verification Plan
## 2026-09-30

**Status:** Planning only — no verification execution yet

## 1. Structural
Verify:
- canonical Treatment Plan tables remain present;
- status constraints and tenant-safe relationships;
- explicit next-action representation;
- lifecycle command functions/authority;
- no duplicate scheduler/work engine.

## 2. Authorization
Verify:
- each command requires effective permission;
- tenant cannot be crossed;
- unsupported transitions are rejected;
- direct table INSERT/UPDATE/DELETE is denied after command cutover;
- supported server mutations succeed;
- RLS remains enabled and scoped.

## 3. Lifecycle
Verify at minimum:
- draft→active;
- active↔on_hold where permitted;
- active→completed under completion rule;
- permitted cancellation paths;
- planned→scheduled→in_progress→completed;
- valid skipped/cancelled paths;
- invalid jumps rejected;
- completion timestamps are deterministic;
- visit link does not auto-complete a stage.

## 4. Next action
Verify:
- one active derived work item per stage;
- repeated transition/retry is idempotent;
- no next action when policy says none;
- explicit booking intent produces Coordination work;
- Agenda consumes booking context and remains the only appointment writer;
- completed next action no longer appears as active work.

## 5. Tenant/security
Verify cross-tenant plan, item, visit and work references are rejected and cross-tenant reads are denied.

## 6. Regression
Re-run the relevant Gate 02 longitudinal continuity path and the Gate 03 closed identity path only as regression evidence; do not reopen those gates.

## 7. Runtime/E2E
Authenticated E2E should prove a realistic patient journey:
patient/visit context → create plan → add stages → activate → execute stage → explicit next-action outcome → Coordination → Agenda booking when required → visit linkage → subsequent stage → plan completion.

## 8. Production
After implementation and pre-production evidence, verify exact main SHA in production and reconcile Live schema/migrations/data.

No Gate 06 verification is executed during planning.
