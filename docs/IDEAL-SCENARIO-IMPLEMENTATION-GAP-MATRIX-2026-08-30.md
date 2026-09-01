# CORE SYSTEM — Ideal Scenario Implementation Gap Matrix

**Date:** 2026-08-30
**Authority:** `docs/CROSS-DOMAIN-IMPLEMENTATION-CONTRACTS-2026-08-30.md`

A scenario is `VALIDATED` only after the full workflow is executed against the current candidate with evidence. Code/DB presence alone is not validation.

## Current implementation remediation

| Scenario | Implementation state | Targeted evidence | Full E2E gate |
|---:|---|---|---|
| 1-5 | IMPLEMENTED | Existing implementation baseline | Authenticated workflow execution |
| 6 | IMPLEMENTED | Service/procedure selection + commercial foundations | Service/procedure → treatment → next action → booking |
| 7-9 | IMPLEMENTED | Existing implementation baseline | Authenticated workflow execution |
| 10-11 | IMPLEMENTED | Agenda availability + required resource persistence enforcement | Provider + room + device/resource + time |
| 12-16 | IMPLEMENTED | Existing implementation baseline | Authenticated workflow execution |
| 17 | IMPLEMENTED | Skill/qualification foundations + Agenda eligibility | Specialist qualification → execution |
| 18-19 | IMPLEMENTED | Existing implementation baseline | Authenticated workflow execution |
| 20 | IMPLEMENTED | Idempotent Treatment Next Action implementation | Treatment completion → next action |
| 21 | IMPLEMENTED | Next Action carries booking requirement context | Next Action → authorized booking → Agenda |
| 22-24 | IMPLEMENTED | Existing implementation baseline | Authenticated workflow execution |
| 25-28 | IMPLEMENTED | Commercial sale transaction: offer calculation, Financial Plan validation, invoice creation, package entitlement | Sale → invoice → installments/payment → revenue/commission |
| 29-31 | IMPLEMENTED | Existing implementation baseline | Authenticated workflow execution |
| 32-33 | IMPLEMENTED | Claim reconciliation with authorization, patient responsibility and payer outstanding balance | Coverage → claim → reconciliation → balances |
| 34 | IMPLEMENTED | Existing implementation baseline | Authenticated workflow execution |
| 35 | IMPLEMENTED | Transactional Purchasing → Receiving → Supplier Obligation → Supplier Payment probe | Full procurement chain |
| 36-37 | IMPLEMENTED | Existing implementation baseline | Authenticated workflow execution |
| 38 | IMPLEMENTED | Unified Workforce unavailability consumed by Agenda | Schedule/absence → availability → Agenda |
| 39 | IMPLEMENTED | Existing implementation baseline | Authenticated workflow execution |
| 40 | IMPLEMENTED | Procedure inventory consumption with provenance + idempotency | Visit/procedure → consumption → inventory |
| 41 | IMPLEMENTED | Authorized idempotent Domain Event → Operational Work bridge + ownership trigger | Event → work → assignment → execution → closure |
| 42 | IMPLEMENTED | Follow-up/Next Action foundation | Visit → follow-up → next action |

## Targeted execution evidence

The following database-backed probes were executed against the connected Supabase project using the existing E2E/test tenant context. Test records were rolled back when the probe was designed as a transactional test:

- Commercial sale success path returned gross `10000`, discount `1000`, net `9000`, a Financial Plan ID, Invoice ID and Patient Package ID.
- Purchasing chain returned a Supplier Payment with `paid` status and `amount_paid_subunits=2000` after receiving the purchase order.
- Domain-event work bridge returned an idempotent work item on the repeated source event.
- Procedure consumption returned an idempotent ledger result on repeated consumption for the same visit/treatment-plan item/inventory item.
- Agenda required-resource persistence rejected a required-resource omission and accepted a correctly matched configured resource.
- Operational Work ownership rejected a cross-tenant assignee.
- Authenticated execution privileges for the application-facing permission helpers are present in live Supabase.

## Validation status

**42 scenarios: IMPLEMENTED.**

**42 scenarios: not yet promoted to VALIDATED.** The required authenticated, UI-inclusive, end-to-end execution evidence is not available for all 42 scenarios in the current tool session.

**PRODUCTION VERIFIED: 0.**

**CLOSED: 0.**

## Evidence discipline

- No scenario is promoted solely because a file, component, function, table, migration or deployment exists.
- Transactional probes do not manufacture persistent production test data.
- Vercel deployment is used only for meaningful candidate/runtime verification; document-only changes do not require deployment.
- Production verification must target the exact deployed commit and include runtime/security checks.

## Current gate

**IMPLEMENTATION REMEDIATION: ADVANCED. FULL 42-SCENARIO AUTHENTICATED E2E VALIDATION: REQUIRED BEFORE CLOSURE.**
