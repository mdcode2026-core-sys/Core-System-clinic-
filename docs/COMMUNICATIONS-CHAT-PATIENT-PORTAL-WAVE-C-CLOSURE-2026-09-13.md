# CORE SYSTEM — Communications + Global Chat + Patient Portal
## Wave C — Retention, Work Center Boundary, Documentation Reconciliation

**Date:** 2026-09-13  
**Status:** CLOSURE CANDIDATE — pending Unified Test Execution Engine verification  
**Branch:** `wave-c-retention-workcenter-docs`  
**Scope:** Phase 8 Delete/Retention, Phase 9 narrow Work Center integration, Phase 10 documentation reconciliation.

## 1. Wave C decision

Wave C is the third execution block after Wave A (Phases 2–4) and Wave B (Phases 5–7).

Wave C does **not** introduce a new messaging engine, deletion engine, task engine, permission engine, tenant boundary, or attachment store.

## 2. Phase 8 — Delete / retention

The binding contract states that deletion must be explicitly authorized and audited and that retained history remains the default until a final deletion policy is implemented and verified.

The current implementation provides conversation archival through the existing Communications authority. It does not expose a message-delete operation as a substitute for a finalized retention policy.

Therefore Wave C treats the following as the production-safe current state:

- conversation archive is the available lifecycle action;
- message history is retained by default;
- no independent Chat/Portal deletion policy exists;
- no destructive deletion is introduced without an approved Communications-level policy and audit behavior.

This is a deliberate contract outcome, not an untracked omission.

## 3. Phase 9 — Narrow Work Center integration

Communications may create operational work only when an explicit operational action is requested.

The existing Communications request path delegates work creation to the existing Journey Coordination / Work Center authority. Communications does not own assignment, priority, due state, completion state, or operational queue state.

The integration remains narrow and event/action based:

```text
Communication request
        ↓
Journey Coordination / Work Center
        ↓
Operational work item
```

## 4. Phase 10 — Documentation reconciliation

The binding contract remains the canonical authority for Communications, Portal, Chat, unread, attachments, Notifications and Work Center boundaries.

Historical documentation is classified rather than silently rewritten:

- current: binding contract, execution plan and closure records;
- clarified/superseded: historical material that conflicts with the final architecture;
- historical record: prior implementation decisions retained for traceability.

Future work must not describe Patient Portal or Global Chat as independent messaging authorities, or Communications as the owner of operational assignment/queues.

## 5. Required verification

Wave C closure requires the existing Unified Test Execution Engine to verify:

- retention/archive boundary;
- no destructive message-delete path introduced;
- narrow Communication → Work Center integration;
- no duplicate operational-work or messaging authority;
- documentation reconciliation checks;
- current-head build/typecheck/lint/tests;
- tenant/security regressions remain green.

No Vercel verification is used for this wave.

## 6. Closure rule

Only the following statuses are permitted:

- **PRODUCTION CLOSED** — all objective Wave C checks pass.
- **NOT CLOSED — BLOCKER** — any required check remains unresolved.

Build success alone is not sufficient.
