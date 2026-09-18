# CSAPI Gate 01 — Historical Patient Flow Documentation Reconciliation

**Date:** 2026-09-17  
**Status:** CURRENT DOCUMENTATION CONTROL  
**Purpose:** Identify which historical Patient Flow documents already align with the clarified architecture, which require clarification before implementation, and which remain historical evidence only.

## 1. Authority rule

The current Patient Flow architecture is interpreted through:

1. the approved 2026-09-01 Workspace/Patient Flow architecture;
2. the 2026-09-11 terminology/global-surface reconciliations;
3. the approved 2026-09-17 Gate 01 Patient Flow Architecture Reconciliation;
4. current repository/live evidence once verified.

Historical documents are not rewritten by blind replacement. Each occurrence is classified as:

- **KEEP** — current meaning is already correct;
- **CLARIFY** — correct concept, insufficient detail;
- **RECONCILE** — concept is valid but must be connected to the expanded model;
- **SUPERSEDE** — current decision explicitly replaces the earlier meaning;
- **HISTORICAL** — retain as evidence, not current authority;
- **DRIFT** — current wording would mislead implementation if treated as the complete model.

## 2. Reconciliation matrix

| Document | Classification | Required treatment |
|---|---|---|
| `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md` | CLARIFY | Its Patient Flow principles remain valid. The 2026-09-17 reconciliation is the detailed current interpretation for Visit, Clinical Work Session, Hold, Transfer, operational closure and administrative control. |
| `docs/ENGINEERING-SPEC-WORKSPACE-PATIENT-FLOW-2026-09-01.md` | DRIFT / RECONCILE | The explicit execution state list is narrower than the current approved model. It must not be used as the complete Patient Flow state model until reconciled. |
| `docs/WORKSPACE-PATIENT-FLOW-FINAL-EXECUTION-CLOSURE-2026-09-01.md` | HISTORICAL | Preserve as historical execution evidence. Do not treat its closure as proof that the expanded current Patient Flow model was implemented or verified. |
| `PROJECT_HANDOFF.md` | RECONCILE | Existing Agenda↔Visit separation and clinical-handoff rules remain valid, but the Visit container / Clinical Work Session / Hold / Transfer / operational-vs-administrative closure distinctions must be added to the current handoff interpretation. |
| `docs/CORE-SYSTEM-TERMINOLOGY-GOVERNANCE.md` | DRIFT / RECONCILE | `Visit` currently risks being read as a single work session. Add the Clinical Work Session distinction while retaining `Encounter` as the interoperability mapping term. |
| `docs/JOURNEY-COORDINATION-ENGINEERING-BLUEPRINT.md` | KEEP + CLARIFY | Handoff, Task, Request and operational coordination boundaries are already aligned. Patient Flow remains authoritative for patient lifecycle; Coordination owns generic work/handoff mechanics. |
| `docs/CORE-SYSTEM-ADMINISTRATIVE-JOURNEY-MANAGEMENT-BLUEPRINT.md` | KEEP + CLARIFY | Clinic autonomy, admin authority, domain ownership and coordination principles align. Patient Flow lifecycle detail should come from the Gate 01 reconciliation rather than be duplicated here. |
| `docs/CORE_SYSTEM_INDEX.md` | KEEP + CLARIFY | Existing statement that clinical completion hands off to operations without automatically closing the Visit is aligned and should remain. The new reconciliation becomes the detailed interpretation. |

## 3. Historical documents that must not be rewritten as current truth

The following historical closure/execution documents should retain their original evidence because changing them would destroy the historical record:

- historical execution closure records;
- historical implementation logs;
- historical stage closure records;
- historical audit snapshots.

Where they contain a now-incomplete Patient Flow model, the current reconciliation document must be referenced instead of rewriting the historical claim.

## 4. Current implementation-document rule

Before any implementation begins, the following must be reconciled to the current model:

1. Engineering specification.
2. Current project handoff.
3. Current terminology governance.
4. Gate 01 evidence/decision ledger.
5. Any implementation contract that encodes the old explicit lifecycle as exhaustive.

The goal is not to create many competing Patient Flow documents. The goal is one current interpretation layer plus historical evidence.

## 5. Important non-decision

This reconciliation does **not** decide that every conceptual object listed in the architecture requires a new database table.

In particular, the investigation must first inspect whether existing Visit/session/procedure/work-item structures already represent:

- Visit;
- Clinical Work Session;
- Queue item;
- Hold;
- Transfer;
- Operational handoff;
- Administrative control.

Only a proven representation gap may justify schema changes.

**End of Historical Documentation Reconciliation.**
