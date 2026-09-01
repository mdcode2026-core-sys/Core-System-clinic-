# CORE SYSTEM — AJM Stage Index

**AJM = Administrative & Journey Management**

This file is the quick-reference index for the AJM implementation program. Historical implementation status is not current-cycle acceptance evidence.

## Master references

- `docs/AJM-FULL-EXECUTION-PROMPT-2026-08-29.md` — authoritative full execution contract.
- `docs/AJM-IMPLEMENTATION-PLAN.md` — execution plan, dependencies, Definition of Done and stage protocol.
- `docs/AJM-ACCEPTANCE-CYCLE-2026-08-30.md` — final current-cycle pre-stage audits, evidence and closure.
- `docs/AJM-INTEGRATED-EXECUTION-RECORD-2026-08-29.md` — integrated AJM-3 → AJM-8 implementation/release record.

## Stages

| Stage | Name | Primary scope | Current-cycle status |
|---|---|---|---|
| AJM-0 | Baseline & Readiness | Repository/runtime reconciliation, classification and implementation lock | **CLOSED** |
| AJM-1 | Team & Access Foundation | Users, settings, workspaces, roles, Permission Catalog, bundles, overrides, effective access | **CLOSED** |
| AJM-2 | Financial & Resources Foundation | Billing, payments, installments, insurance minimum, inventory, purchasing, suppliers, resource data and coherent tenant-facing product surface | **CLOSED** |
| AJM-3 | Workforce & Operations Foundation | Staff, availability, scheduling, capacity, leave, payroll, recruitment, benefits, productivity | **CLOSED** |
| AJM-4 | Communications Foundation | Internal communication, patient communication, Portal communication, notifications | **CLOSED** |
| AJM-5 | Journey Coordination Foundation | Tasks, requests, handoffs, next actions, escalation, Work Center | **CLOSED** |
| AJM-6 | Insights & Analytics | KPIs, metrics, reporting, dashboards, product-tier analytics | **CLOSED** |
| AJM-7 | PJ & Cross-Domain Integration | End-to-end integration and reconciliation with PJ/Clinical | **CLOSED** |
| AJM-8 | Final Validation & Closure | Security, privacy, financial/legal controls, runtime and production acceptance | **CLOSED** |

## Final program state

The 2026-08-30 acceptance cycle completed AJM-0 → AJM-8 and Final Production Closure using current-cycle evidence. Historical `CLOSED` labels were not used as substitutes for acceptance.

Final Production candidate:
- Git SHA: `36eb20f90ec1b79c48d19b6f7c8cc90a7985d3c6`
- Vercel deployment: `dpl_3mQtJqGVmia6dLjDb9P4QBobNans`
- Vercel state: `READY`
- Authenticated Production E2E: **2/2 PASS**
- Final runtime error/warning verification: **no logs found**

## Closure rule

A stage is closed only after its current-cycle Definition of Done, required production verification, evidence and documentation are satisfied. This cycle satisfies that closure rule.
