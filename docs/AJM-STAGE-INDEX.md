# CORE SYSTEM — AJM Stage Index

**AJM = Administrative & Journey Management**

This file is the quick-reference index for the AJM implementation program. It is intentionally short and is used to locate the detailed stage document and the domain blueprint governing each stage.

## Master references

- `docs/CORE-SYSTEM-ADMINISTRATIVE-JOURNEY-MANAGEMENT-BLUEPRINT.md` — master architectural and cross-domain authority.
- `docs/AJM-IMPLEMENTATION-PLAN.md` — execution plan, dependencies, Definition of Done and stage protocol.

## Stages

| Stage | Name | Primary scope | Governing domain reference |
|---|---|---|---|
| AJM-0 | Baseline & Readiness | Repository/runtime reconciliation, classification and implementation lock | Master Blueprint |
| AJM-1 | Team & Access Foundation | Users, settings, workspaces, roles, Permission Catalog, bundles, overrides, effective access | `docs/TEAM-ACCESS-ENGINEERING-BLUEPRINT.md` |
| AJM-2 | Financial & Resources Foundation | Billing, payments, installments, insurance minimum, inventory, purchasing, suppliers, resource data | Financial & Resources domain specification / integration reference |
| AJM-3 | Workforce & Operations Foundation | Staff, availability, scheduling, capacity, leave, payroll, recruitment, benefits, productivity | `docs/CLINIC-OPERATIONS-WORKFORCE-REFERENCE.md` and integration reference |
| AJM-4 | Communications Foundation | Internal communication, patient communication, Portal communication, notifications | Communications engineering blueprint |
| AJM-5 | Journey Coordination Foundation | Tasks, requests, handoffs, next actions, escalation, Work Center | `docs/JOURNEY-COORDINATION-ENGINEERING-BLUEPRINT.md` |
| AJM-6 | Insights & Analytics | KPIs, metrics, reporting, dashboards, product-tier analytics | `docs/INSIGHTS-ENGINEERING-BLUEPRINT.md` |
| AJM-7 | PJ & Cross-Domain Integration | End-to-end integration and reconciliation with PJ/Clinical | Master Blueprint + relevant domain blueprints + PJ documents |
| AJM-8 | Final Validation & Closure | Security, privacy, financial/legal controls, runtime and production acceptance | Master Blueprint + all domain/stage documents |

## Stage-document rule

Before implementation of a stage, create its dedicated stage document in `docs/` using the `AJM-N-...` naming convention. The stage document must link to this index, the AJM Implementation Plan, the Master Blueprint and its detailed domain reference(s).

## Status rule

A stage is not considered closed because its implementation code exists. The stage index must be updated only after repository/database reconciliation, runtime validation, acceptance evidence and explicit closure have been completed.

## Current program status

**AJM planning complete. Implementation not yet started under this plan.**

**Next action:** prepare and approve `AJM-0` before making implementation changes.
