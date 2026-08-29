# CORE SYSTEM — AJM Stage Index

**AJM = Administrative & Journey Management**

This file is the quick-reference index for the AJM implementation program. Historical implementation status is not current-cycle acceptance evidence.

## Master references

- `docs/AJM-FULL-EXECUTION-PROMPT-2026-08-29.md` — authoritative full execution contract.
- `docs/AJM-IMPLEMENTATION-PLAN.md` — execution plan, dependencies, Definition of Done and stage protocol.
- `docs/AJM-ACCEPTANCE-CYCLE-2026-08-30.md` — current-cycle pre-stage audits, evidence and blockers.
- `docs/AJM-INTEGRATED-EXECUTION-RECORD-2026-08-29.md` — integrated AJM-3 → AJM-8 implementation/release record.

## Stages

| Stage | Name | Primary scope | Current-cycle status |
|---|---|---|---|
| AJM-0 | Baseline & Readiness | Repository/runtime reconciliation, classification and implementation lock | PRECHECK PASS / CLOSURE PENDING |
| AJM-1 | Team & Access Foundation | Users, settings, workspaces, roles, Permission Catalog, bundles, overrides, effective access | IMPLEMENTED / AUTHENTICATED ACCEPTANCE BLOCKED |
| AJM-2 | Financial & Resources Foundation | Billing, payments, installments, insurance minimum, inventory, purchasing, suppliers, resource data and coherent tenant-facing product surface | IMPLEMENTED / AUTHENTICATED ACCEPTANCE BLOCKED |
| AJM-3 | Workforce & Operations Foundation | Staff, availability, scheduling, capacity, leave, payroll, recruitment, benefits, productivity | IMPLEMENTED / AUTHENTICATED ACCEPTANCE BLOCKED |
| AJM-4 | Communications Foundation | Internal communication, patient communication, Portal communication, notifications | IMPLEMENTED / AUTHENTICATED ACCEPTANCE BLOCKED |
| AJM-5 | Journey Coordination Foundation | Tasks, requests, handoffs, next actions, escalation, Work Center | IMPLEMENTED / AUTHENTICATED ACCEPTANCE BLOCKED |
| AJM-6 | Insights & Analytics | KPIs, metrics, reporting, dashboards, product-tier analytics | IMPLEMENTED / AUTHENTICATED ACCEPTANCE BLOCKED |
| AJM-7 | PJ & Cross-Domain Integration | End-to-end integration and reconciliation with PJ/Clinical | IMPLEMENTED / AUTHENTICATED ACCEPTANCE BLOCKED |
| AJM-8 | Final Validation & Closure | Security, privacy, financial/legal controls, runtime and production acceptance | IMPLEMENTED / FINAL CLOSURE BLOCKED |

## Current program state

The current `main` release contains the integrated AJM-3 → AJM-8 application and live Supabase migration sequence. It has passed the recorded non-production engineering gates. Current Production is deployed and `READY`.

**No AJM stage is CLOSED in the 2026-08-30 acceptance cycle.**

The remaining external blocker is authenticated Production E2E identity/session availability (GitHub Issue #53). Vercel deployment-rate limiting (Issue #54) is resolved.

## Closure rule

A stage is not considered closed because implementation code, historical documents, CI success or a production deployment exists. Closure requires the current-cycle Definition of Done, including the required authenticated production verification, evidence and documentation.
