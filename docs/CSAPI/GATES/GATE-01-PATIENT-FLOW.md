# CSAPI Gate 01 — Patient Flow

**Status:** UNDER REVIEW
**Gate:** 01
**Product term:** Patient Flow
**Canonical branch:** `architecture/csapi-decision-gates-2026-09-16`

## 1. Purpose

Define and reconcile the patient's operational/clinical movement during the clinic visit without creating a duplicate domain or workflow engine.

## 2. Previously established decisions

The known approved baseline is:

**Queue → Clinical Visit → Pending Close → Reception Workflow → Completed**

Additional established principles:

- Patient Flow is a workflow concept, not a sidebar/domain label.
- Patient Journey is separate and longitudinal.
- Treatment Plan is not mandatory for every visit.
- Procedure/Session must be related to the visit without being assumed to replace the visit lifecycle.
- Follow-up is a downstream/cross-domain process, not a duplicate Patient Flow engine.
- Reception owns the reception workflow portion where the product decision requires reception action.

## 3. Evidence reconciliation started

The first repository + live Supabase evidence pass is recorded in:

`docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-EVIDENCE-2026-09-17.md`

Initial evidence establishes that the approved lifecycle is materially represented by the current Queue Engine and server-side transition actions. Clinical completion delegates to the canonical pending-close transition, and the live database currently has 138 completed sessions plus one stale waiting session.

Initial gaps requiring further verification are:

1. Existing-session arrival/reset behavior can write `waiting` without passing through the transition validator.
2. `buffer_window_expires_at` / `auto_close_at` semantics are not yet fully reconciled with application completion timestamps.
3. Semantic completeness of lifecycle audit coverage is not yet established.
4. The exact automatic follow-up trigger point remains unverified.
5. Transition-by-transition permission/actor coverage still requires a complete matrix.
6. Full scheduled and walk-in runtime verification has not yet been completed.

No Product Owner decision has been proposed from these findings yet.

## 4. What must be verified now

### Entry
- How a patient enters Queue/Patient Flow.
- What data establishes the patient/visit relationship.
- How appointment/arrival/no-show/reschedule context enters the flow.
- Whether an existing session may ever legitimately be reset to `waiting` and under what constraints.

### Queue
- Queue record/state ownership.
- Provider/clinic/resource context.
- Permissions for queue actions.
- Transition rules.
- Whether presentation-level target maps remain exactly aligned with server authority.

### Clinical Visit
- Visit/session identity.
- Clinical actor and authorization.
- Clinical documentation boundaries.
- Procedure/session relationships.
- Treatment Plan relationship.

### Pending Close
- Meaning of Pending Close.
- Which actor owns it.
- What must be complete before reception workflow.
- Whether the state is a true domain state or only UI behavior.
- Exact meaning of buffer and auto-close timestamps.

### Reception Workflow
- Reception responsibilities.
- Financial/administrative completion actions.
- Next appointment/next action behavior.
- Payment/insurance dependencies where applicable.
- Exact completion authority.

### Completed
- What actually makes a visit completed.
- Whether completion triggers follow-up, notifications, operational work, analytics, or audit events.
- Idempotency and duplicate-transition behavior.

### Cross-domain boundaries
- Agenda/appointment linkage.
- Treatment Plan linkage.
- Procedure/Session linkage.
- Financial linkage.
- Follow-up linkage.
- Notifications and operational work.
- Communications where applicable.
- Audit.
- Tenant/branch isolation.
- Permission/role/entitlement boundaries.

## 5. Required reconciliation questions

1. Does the live implementation actually express the approved lifecycle?
2. Are there competing lifecycle engines or duplicate state machines?
3. Is any UI workflow being mistaken for the product/domain workflow?
4. Are state transitions stored in the correct authoritative domain?
5. Are responsibilities split correctly between clinical and reception actors?
6. Are appointment and visit/session identities preserved correctly?
7. Does Treatment Plan remain optional?
8. Does Follow-up remain a downstream integrated process rather than a second flow engine?
9. Are permissions enforced consistently at every transition?
10. Are tenant/branch boundaries enforced?
11. Are automated side effects intentional, documented, and idempotent?
12. Does current documentation accurately describe the verified implementation?

## 6. Product decisions that may be required

Do not assume these are unresolved until verification is complete. Potential decision areas include:

- exact definition and responsibility of Pending Close;
- precise Reception Workflow entry/exit conditions;
- completion authority;
- Procedure/Session placement;
- Treatment Plan interaction;
- Next Action handoff;
- Follow-up trigger point;
- required audit events;
- actor/permission boundaries;
- patient context preservation across transitions;
- existing-session arrival/reset semantics;
- buffer/auto-close semantics.

## 7. Implementation rule

No implementation begins from this document until the current-state reconciliation is complete and every required product decision is explicitly approved.

## 8. Verification / closure criteria

Gate 01 may move to CLOSED only when:

- the current implementation is reconciled against the approved lifecycle;
- all meaningful gaps and documentation drift are recorded;
- Product Owner decisions are explicitly approved;
- approved implementation changes, if any, are completed;
- automated validation passes;
- relevant runtime/user-flow verification passes;
- permissions and tenant/branch boundaries are verified;
- cross-domain side effects are verified;
- the exact reviewed commit is recorded;
- the Master State and Decision Ledger are updated;
- no unresolved Gate 01 decision is silently carried forward.

## 9. Current next action

**Continue evidence-based reconciliation. Do not implement yet.**

The next investigation must complete the unresolved targets identified in the evidence record, then determine which findings require Product Owner approval before implementation.

This Gate is not yet approved for implementation and is not CLOSED.
