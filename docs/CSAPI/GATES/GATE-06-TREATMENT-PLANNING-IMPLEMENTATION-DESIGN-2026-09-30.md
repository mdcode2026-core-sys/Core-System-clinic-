# CSAPI Gate 06 — Treatment Planning — Implementation Design
## 2026-09-30

**Status:** Planning only — implementation not started

## 1. Implementation objective
Formalize the existing Treatment Plan domain into an explicit, tenant-safe lifecycle authority while preserving existing data and cross-domain ownership.

## 2. Work packages
### WP-1 — Lifecycle command authority
Introduce one canonical server-side mutation boundary for plan/stage lifecycle commands. Reuse the project's established command-boundary/security pattern where applicable. Do not expose direct table mutation as the supported application write path.

### WP-2 — Plan transition matrix
Implement deterministic plan-state transitions with actor/permission checks, current-state guards, timestamps and audit context.

### WP-3 — Stage transition matrix
Implement deterministic item-state transitions. Separate planned/scheduled/in-progress/completed from skipped/cancelled. Prevent arbitrary jumps.

### WP-4 — Explicit next-action intent
Replace the current `planned_date` heuristic with explicit next-action semantics. Preserve `operational_work_items` as derived coordination state and preserve idempotency.

### WP-5 — Visit linkage semantics
Make visit linkage a relationship operation, not an automatic completion operation. Completion must follow the stage lifecycle outcome.

### WP-6 — Plan completion rule
Enforce the approved deterministic completion condition. If an explicit override is product-approved, require actor authorization and audit reason.

### WP-7 — Cross-domain contracts
Define typed references/contracts for:
- Clinical source decision/recommendation;
- Agenda booking/appointment;
- Coordination next-action work;
- optional package/commercial context;
- Follow-up source outcome.

No receiving-domain lifecycle is implemented by Gate 06.

### WP-8 — UI/workspace convergence
Align TreatmentPlanWorkspace with canonical commands:
- explicit Save/Update for state changes;
- visible lifecycle status;
- distinguish linked visit from completed stage;
- show next-action intent;
- prevent unsupported transitions;
- preserve patient context.

### WP-9 — Verification
Provide:
- clean migration replay;
- structural lifecycle assertions;
- tenant isolation/RLS assertions;
- authorization assertions;
- idempotency assertions;
- local production runtime;
- authenticated E2E for draft→active→stage execution→next action→Agenda handoff→completion;
- regression evidence for Gate 02 continuity;
- explicit proof that Agenda remains appointment owner.

## 3. Data strategy
Prefer additive changes:
- explicit next-action representation if required;
- lifecycle/audit support where missing;
- tenant-safe composite integrity;
- no destructive replacement of current plan tables;
- deterministic backfill only where semantics are unambiguous.

Existing data must remain readable throughout migration.

## 4. Permission strategy
Do not invent a second permission engine. Reconcile current `treatment_plans:read/create/update` with the platform permission model during implementation planning. Any permission-key change requires a controlled migration and role-assignment reconciliation.

## 5. Security strategy
RLS remains enabled. New mutation boundaries must validate:
- authenticated actor;
- tenant;
- effective permission;
- current lifecycle state;
- referenced patient/visit/plan/item tenant integrity.

Direct table writes must not remain as an unintended bypass after command migration.

## 6. Non-goals
No implementation of:
- Agenda scheduler;
- Clinical decision engine;
- Follow-up engine;
- Package/financial engine;
- Procedure master/catalog;
- Patient Flow lifecycle;
- generic workflow engine.

## 7. Gate barrier
This design is not authorization to implement. Gate 06 implementation remains prohibited until Gate 04 and Gate 05 are both CLOSED / VERIFIED / PRODUCTION VERIFIED.
