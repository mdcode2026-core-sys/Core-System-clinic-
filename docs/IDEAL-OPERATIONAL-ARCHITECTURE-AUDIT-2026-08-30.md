# CORE SYSTEM — Ideal Operational Architecture Audit

**Date:** 2026-08-30  
**Scope:** Architecture + implementation-document reconciliation baseline  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`  
**Baseline branch:** `main`  
**Status:** ARCHITECTURE BASELINE RECONCILED → IMPLEMENTATION DOCUMENTATION CLOSED

## 1. Purpose

This document records the ideal clinic-operation architecture and the investigation that preceded implementation-document remediation. It is not a code, runtime or Production acceptance record.

## 2. Investigation conclusion

CORE SYSTEM architecture is fundamentally sound and should not be rebuilt. The documentary gaps identified by the investigation have now been reconciled into R01–R12 contracts. The repository now has an explicit path from architecture decision to implementation contract to future evidence.

Historical documents remain valuable evidence, but `CLOSED`, `IMPLEMENTED` or `PRODUCTION READY` labels in historical records do not override current evidence policy.

## 3. Architectural baseline preserved

CORE SYSTEM is an integrated platform composed of independently owned domains around the Patient Journey (PJ).

- Patient Journey / clinical domains own the clinical journey and clinical truth.
- Agenda owns appointments and scheduling truth.
- Workforce owns employment/work reality, working patterns, leave, attendance and availability inputs.
- Team & Access owns users, roles, permissions, entitlements and access boundaries.
- Financial & Resources owns billing, payments, installments, insurance financial responsibility, purchasing, suppliers and inventory/resource financial flows.
- Communications owns channels and messages, not operational work.
- Journey Coordination owns cross-domain operational work/handoffs, not source-domain truth.
- Insights consumes authoritative data and is not a second source of truth.

Critical separations:

- Role ≠ Permission
- Employee ≠ User
- Skill ≠ Permission
- Qualification ≠ Permission
- Workforce ≠ Agenda
- Communication ≠ Work
- Coordination ≠ source-domain ownership
- Package ≠ Treatment Plan
- Treatment Plan ≠ Financial Plan
- Appointment ≠ clinical treatment plan

## 4. Ideal operational chain

`Patient contact → identification → service/procedure selection → booking → availability/resource check → confirmation → arrival → queue/visit → clinical decision → treatment plan → financial commitment → execution → resource consumption → payment/insurance handling → follow-up → next action → next appointment`

The chain is now operationalized by R01–R11 and governed by R12.

## 5. Contract reconciliation result

| Area | Governing contract | Current documentary state |
|---|---|---|
| Procedure / Service / Package / Treatment Plan | R01 | DOCUMENTATION CLOSED |
| Treatment Plan / Next Action / Appointment | R02 | DOCUMENTATION CLOSED |
| Package / Financial Plan / Installments / Sessions | R03 | DOCUMENTATION CLOSED |
| Workforce / Availability / Agenda | R04 | DOCUMENTATION CLOSED |
| Staff / Room / Device / Procedure | R05 | DOCUMENTATION CLOSED |
| Insurance | R06 | DOCUMENTATION CLOSED |
| Procurement | R07 | DOCUMENTATION CLOSED |
| Revenue / Commission / Payroll | R08 | DOCUMENTATION CLOSED |
| Communication / Request / Work | R09 | DOCUMENTATION CLOSED |
| Coordination operational fabric | R10 | DOCUMENTATION CLOSED |
| Skill / Qualification / Permission | R11 | DOCUMENTATION CLOSED |
| Documentation authority / closure | R12 | DOCUMENTATION CLOSED |

Detailed requirements are in `CROSS-DOMAIN-IMPLEMENTATION-CONTRACTS-2026-08-30.md`.

## 6. Historical governance finding

Earlier AJM/Stage documents contain different states at different dates, including in-progress, reconciliation-required, gated and later closure claims. The 2026-08-30 AJM Final Production Closure explicitly records a Production blocker. These records are retained as historical evidence and do not conflict with the documentation closure reached here because they govern different validation boundaries.

Current status/freshness authority remains `DOCUMENTATION_STATUS.md`; `CORE_SYSTEM_INDEX.md` is the navigation authority for this remediation bundle.

## 7. 42-scenario baseline

The 42 ideal scenarios are now individually traced to completed contracts in `IDEAL-SCENARIO-TRACEABILITY-MATRIX-2026-08-30.md`. This is documentary closure only.

## 8. Deferred work

The following remain outside this phase:

- source-code correctness;
- live database schema correctness;
- runtime/browser functional correctness;
- authenticated E2E validation;
- Production UX correctness;
- performance;
- penetration/security testing.

Difficult/exception scenarios remain registered for a future phase and must not silently change the ideal baseline.

## 9. Decision baseline

1. Do not rebuild the CORE architecture.
2. Use R01–R12 as the implementation-document specification.
3. Preserve historical decisions as evidence and classify authority explicitly.
4. Do not treat feature existence or a CLOSED label as proof of operational completeness.
5. A scenario is documentary-complete only when ownership, authorization, next action, handoff and source-of-truth continuity are explicit.
6. Difficult scenarios are deferred until the ideal baseline is implemented and validated.

## 10. Status

**Ideal operational architecture investigation: COMPLETE.**  
**Implementation documentation remediation: COMPLETE / DOCUMENTATION CLOSED.**  
**Implementation / runtime / Production validation: DEFERRED.**
