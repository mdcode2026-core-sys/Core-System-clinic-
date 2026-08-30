# CORE SYSTEM — Implementation Documentation Remediation Master Matrix

**Date:** 2026-08-30  
**Status:** CONTROL MATRIX FOR EXECUTION  
**Scope:** Documentation remediation before any implementation/Reality validation.

## 1. Purpose

This matrix is the control sheet for R01–R12. It prevents any remediation item or ideal scenario from being silently skipped.

## 2. Remediation matrix

| ID | Contract | Main dependencies | Primary ideal scenarios | Documentation completion gate |
|---|---|---|---|---|
| R12 | Documentation authority / closure | All | All 42 | One status authority + exact evidence chain + historical classification |
| R01 | Procedure / Service / Package / Treatment Plan | Medical Master, PJ, Financial | 6, 24–28 | Semantics + ownership + links + booking/clinical/commercial boundaries |
| R02 | Treatment Plan → Next Action → Appointment | R01, Follow-up, Coordination, Agenda | 18–23, 42 | Stage/next-action/work/booking/visit chain explicitly defined |
| R03 | Package / Financial Plan / Installments / Sessions | R01, R02, Financial | 26–30 | Commercial, clinical and financial states distinct and connected |
| R04 | Workforce → Availability → Agenda | Workforce, Agenda | 8–14, 37–38 | Staff reality → availability → appointment impact explicitly defined |
| R05 | Staff + Room + Device + Procedure | R01, R04, Resources/Agenda | 9–11, 17, 40 | Real feasibility requires actor + resource + time |
| R06 | Insurance lifecycle | Financial, Patient/PJ | 31–33 | Responsibility → claim-ready → reconciliation → patient balance |
| R07 | Procurement lifecycle | Financial, Inventory, Suppliers | 34–35, 40 | Need → purchase → receiving → inventory → supplier obligation/payment |
| R08 | Revenue → Commission → Payroll | Financial, Workforce | 34–36 | Collection-based attribution and compensation rules are explicit |
| R09 | Communication → Request → Work | Communications, Coordination | 5, 12, 41–42 | Message/request/work boundaries and handoff are explicit |
| R10 | Domain Event → Coordination → Completion | All operating domains | 6, 20–22, 41–42 | Event → work → actor → close → result is explicit |
| R11 | Skill / Qualification / Permission | Team & Access, Workforce, Coordination | 17, 39 | Terms and behavioral boundaries standardized |

## 3. Mandatory step template for every contract

### Step 1 — Authority
Identify current architectural authority and domain owner.

### Step 2 — Historical reconciliation
List historical documents, decisions and implementation claims. Mark each current/historical/superseded/reconciled/contradictory.

### Step 3 — Scenario statement
Write the ideal clinic scenario in plain operational terms.

### Step 4 — Ownership map
For every fact identify owner and source of truth.

### Step 5 — Actor map
Identify who acts and why they are authorized.

### Step 6 — Workflow map
Define trigger, action, handoff, result and next state.

### Step 7 — User surface
Identify the canonical UX/work surface without using visibility as authorization.

### Step 8 — Data contract
Document persistent objects/references conceptually and who owns each fact.

### Step 9 — Control contract
Document permission, entitlement, tenant-isolation and audit expectations.

### Step 10 — Acceptance contract
Specify the evidence later needed to prove the workflow, not merely the presence of UI/data structures.

### Step 11 — Documentation synchronization
Update the affected execution documents and cross-links. Preserve historical evidence.

### Step 12 — Complete / Block
Mark `DOCUMENTATION COMPLETE` only when no ambiguity remains. If a genuine product/architecture decision is required, mark `DECISION REQUIRED` and isolate that decision.

## 4. Scenario-to-contract gate

A 42-scenario ideal baseline is accepted only when every referenced contract is `DOCUMENTATION COMPLETE`.

No contract may be considered complete solely because a current implementation document says `Implemented` or `Closed`.

## 5. Final handoff checklist

Before implementation/Reality validation begins, verify:

- [ ] All R01–R11 contracts are documentation-complete.
- [ ] R12 status/closure authority is active.
- [ ] Historical/superseded documents are classified.
- [ ] All 42 ideal scenarios trace to completed contracts.
- [ ] Future difficult scenarios remain deferred and registered.
- [ ] No ownership conflicts remain unresolved.
- [ ] No terminology conflicts remain unresolved.
- [ ] No hidden duplicate-engine requirement exists.
- [ ] Acceptance evidence for the later Reality phase is specified.

## 6. Evidence boundary

This matrix is a documentation-control artifact. It does not certify code, database, runtime, production, UX performance or security implementation.
