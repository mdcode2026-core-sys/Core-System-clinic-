# CSAPI — Master State

**Status:** ACTIVE — Decision-Gate planning and verification track
**Canonical branch:** `architecture/csapi-decision-gates-2026-09-16`
**Baseline:** `main`
**Execution independence:** REQUIRED
**Current Gate:** Gate 01 — Patient Flow

## 1. Purpose

CSAPI is the independent CORE SYSTEM Architecture & Product Integration decision path.

It exists to convert the accumulated CORE SYSTEM architecture/product investigation into a controlled sequence of product decisions, implementation decisions, verification, and closure.

CSAPI is not a continuation of PR #129, PR #136, or any descendant branch. Historical findings from that work may be used as evidence and context, but their commits, branch lineage, implementation path, or unresolved presentation work must not be imported into CSAPI unless a future explicit decision creates a dependency.

## 2. Canonical execution path

The only canonical CSAPI execution branch is:

`architecture/csapi-decision-gates-2026-09-16`

It was intentionally established from `main`.

The operating sequence is:

**Study → Verify → Identify gaps/drift → Product Decision → Record approval → Implement → Verify → Close Gate → Next Gate**

Implementation is not the first step. A Gate is not closed merely because documentation exists or CI is green.

## 3. What CSAPI inherited from the previous investigation

The previous CORE SYSTEM investigation produced a substantial system-wide reconciliation/build baseline. CSAPI treats that material as **historical investigation input**, not as its execution lineage.

Important inherited findings include:

- CORE SYSTEM has substantial existing domain architecture across patient, agenda, visit, treatment, procedure/service/package, medical files, follow-up, communications, notifications, operational work, financial, inventory/procurement, workforce, analytics, subscription/entitlement, and audit areas.
- Business logic is distributed across TypeScript domain/application code, PostgreSQL functions/RPCs, triggers, cron/automation, notifications, operational work, and RLS rather than one universal workflow engine.
- Agenda is the authoritative scheduling domain; Calendar is a representation and must not become a second scheduling engine.
- Patient Flow is a workflow concept inside the clinic visit; it is not a new sidebar domain or a competing database engine.
- Patient Journey is distinct from Patient Flow and represents the patient's lifecycle over time.
- Communications is clinic-wide internal communication for authorized clinic accounts; Chat is a compact interaction surface over Communications; Notifications are distinct.
- Treatment Plan is not mandatory for every visit.
- The approved doctor visit lifecycle is Queue → Clinical Visit → Pending Close → Reception Workflow → Completed.
- Subscription/entitlement/access architecture is intended to evolve toward Tenant → Subscription → Entitlement → Capability → Access, with license/resource constraints and permission boundaries reconciled against the current implementation.
- Repository/live database drift has historically been a major investigation finding and must be rechecked rather than assumed resolved.
- Existing architecture should be reused and extended before creating new engines or duplicate domain boundaries.

## 4. Separation from PR #129/#136

PR #129 and its descendant work are presentation/UX execution history. They are not the CSAPI branch lineage.

Rules:

1. Do not cherry-pick commits from #129/#136 into CSAPI.
2. Do not merge #129/#136 into CSAPI.
3. Do not treat #129/#136 as a prerequisite for CSAPI.
4. Do not use old presentation PRs as the definition of current product architecture.
5. Use prior investigation findings only when they are relevant evidence and re-verify current reality.
6. Global Experience/UX implementation remains a separate workstream unless a CSAPI Gate explicitly identifies a product/architecture dependency.

## 5. Decision-Gate model

Every Gate follows these states:

**OPEN → UNDER REVIEW → DECISION READY → APPROVED → IMPLEMENTED → VERIFIED → CLOSED**

A Gate may remain in an earlier state. No unresolved decision may be silently carried forward.

## 6. Gate reporting contract

Every Gate record must answer:

1. What was previously decided?
2. What actually exists now?
3. What differs?
4. What works?
5. What is missing?
6. What was requested but not implemented?
7. What was implemented but not requested/currently prioritized?
8. What is documentation drift?
9. What may be intentional?
10. What requires Product Owner decision?
11. What is the proposed final decision?
12. What are the dependencies and impacts?
13. What are the implementation implications?
14. What evidence is required for verification and closure?

## 7. Gate plan

| Gate | Domain | Initial state |
|---|---|---|
| 01 | Patient Flow | **CURRENT / OPEN** |
| 02 | Patient Journey | PLANNED |
| 03 | Patient & Identity | PLANNED |
| 04 | Agenda & Scheduling | PLANNED |
| 05 | Clinical Care | PLANNED |
| 06 | Treatment Planning | PLANNED |
| 07 | Procedures / Services / Packages / Offers | PLANNED |
| 08 | Financial & Commercial Flow | PLANNED |
| 09 | Workforce & Resource Eligibility | PLANNED |
| 10 | Inventory & Procurement | PLANNED |
| 11 | Follow-up & Retention | PLANNED |
| 12 | Communications & Chat | PLANNED |
| 13 | Notifications & Operational Work | PLANNED |
| 14 | Medical Files & Patient Portal | PLANNED |
| 15 | Analytics & Reports | PLANNED |
| 16 | Subscription / Entitlement / Capability | PLANNED |
| 17 | Security / Authorization | PLANNED |
| 18 | Workflow / Automation / Events | PLANNED |
| 19 | API / Integration Architecture | PLANNED |
| 20 | Global Experience | PLANNED |

This is a controlled working map, not an immutable promise. A later Gate may be split, merged, reordered, or replaced only through an explicit CSAPI decision recorded in the ledger.

## 8. Gate 01 — Patient Flow

**Product term:** Patient Flow

Do not introduce `Canonical Clinic Flow` as a product/domain name.

The Gate is concerned with the patient's operational/clinical movement during the clinic visit and the boundaries between Queue, Clinical Visit, Pending Close, Reception Workflow, Completed, Procedure/Session, Treatment Plan, Next Action, and Follow-up.

Known approved baseline:

**Queue → Clinical Visit → Pending Close → Reception Workflow → Completed**

Gate 01 must verify the current repository/live implementation against this baseline before proposing any implementation change.

## 9. Documentation hierarchy

When sources disagree, the CSAPI investigation must explicitly identify the conflict rather than silently selecting one.

Priority for current reality:

1. Verified live repository implementation and live database/runtime evidence.
2. Explicitly approved Product Owner decisions.
3. Current binding architecture/work contracts.
4. Current decision registry and governed scenario/cross-domain contracts.
5. Historical handoffs and investigation reports.
6. Older stale status documents.

Historical documents remain valuable evidence but must not be treated as current execution state without verification.

## 10. Required evidence for closure

A Gate cannot be marked CLOSED merely because its document is written.

Closure requires, as applicable:

- approved product decision(s);
- exact implementation state identified;
- implementation completed where required;
- automated validation;
- relevant runtime/manual verification;
- security/authorization verification where relevant;
- cross-domain integrity verification;
- RTL/LTR and responsive verification where UI is affected;
- documentation and decision ledger reconciliation;
- exact reviewed branch/commit recorded;
- Product Owner acceptance where a product decision was required.

## 11. Current action

**Do not jump to implementation.**

The next action is to complete Gate 01's evidence-based reconciliation, identify only the decisions that genuinely require Product Owner approval, record the approved decision, then proceed to implementation/verification only after approval.

## 12. Continuity rule for future conversations

If a new conversation starts with `CSAPI`, the assistant must first locate and read this file and the current Gate file before treating the task as a continuation.

The conversation is not the source of truth for CSAPI state. The repository documentation is.

## 13. State integrity

If GitHub branch state, repository files, live Supabase state, or a prior conversation disagree, the discrepancy must be recorded and investigated. Never invent continuity from memory.
