# CORE SYSTEM — Ideal Scenario Implementation Gap Matrix

**Date:** 2026-08-30 17:00 UTC+03
**Authority:** `docs/CROSS-DOMAIN-IMPLEMENTATION-CONTRACTS-2026-08-30.md`

A scenario is `VALIDATED` only after the full workflow is executed against the current candidate with evidence. Code/DB presence alone is not validation.

## Current implementation remediation

| Scenario | Latest implementation state | Evidence |
|---:|---|---|
| 6 | Service/procedure selection foundation exists; commercial/service-to-next-action runtime handoff remains to be exercised | Repository implementation |
| 10-11 | Provider/room/resource availability checks exist; device requirement mapping and combined runtime proof remain | Agenda + resource domain |
| 17 | Skill/qualification foundations and appointment eligibility exist; specialist execution E2E remains | R05/R11 implementation |
| 20 | Treatment stage completion now idempotently creates `next_action` operational work | `treatment-plan.actions.ts` |
| 21 | Next-action work records booking requirement context; explicit booking execution handoff still requires E2E | Treatment/Agenda domains |
| 25-28 | Authorized commercial sale RPC now calculates applicable offer discount and creates patient package entitlement; UI/financial-plan/invoice integration and E2E remain | `execute_commercial_sale` migration + action |
| 32-33 | Insurance claim reconciliation RPC now locks claim/invoice, records reconciled amount, updates patient balance and profile reconciliation state | `reconcile_insurance_claim` migration + action |
| 35 | Receiving/payment atomic foundations exist; full purchase-order→obligation→payment E2E remains | Procurement migrations |
| 38 | Unified absence model exists and Agenda consumes it; full actor/runtime E2E remains | Workforce migrations |
| 40 | Procedure inventory consumption RPC now atomically decrements stock and records ledger against visit/treatment item | `consume_procedure_inventory` migration + action |
| 41 | Governed idempotent domain-event→operational-work bridge now exists with authorization gate | `create_operational_work_from_domain_event` migration + action |
| 42 | Follow-up/next-action foundation exists; complete visit→follow-up→next-action E2E remains | Follow-up/Journey domains |

## Validation status

All 42 scenarios remain **not yet VALIDATED** until authenticated end-to-end execution evidence exists. No scenario is promoted merely because implementation now exists.

### Existing implementation baseline

1,2,3,4,5,7,8,9,12,13,14,15,16,18,19,22,23,24,29,30,31,34,36,37,39 — **IMPLEMENTED / validation pending**.

6,10,11,17,20,21,25,26,27,28,32,33,35,38,40,41,42 — **IMPLEMENTED remediation / validation pending**.

## Evidence discipline

- No production test data is inserted solely to manufacture evidence.
- No Vercel deployment is used for document/code-only changes.
- `VALIDATED` requires complete workflow execution.
- `PRODUCTION VERIFIED` requires execution against the exact production candidate plus security/runtime checks.
- `CLOSED` requires all applicable closure gates and evidence.

## Current gate

**IMPLEMENTATION REMEDIATION ADVANCED — END-TO-END VALIDATION STILL REQUIRED.**
