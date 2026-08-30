# CORE SYSTEM — Ideal Scenario Reality Validation

**Date:** 2026-08-30
**Scope:** Architecture-to-Reality implementation validation for the 42 ideal operational scenarios.
**Current result:** BLOCKED — complete 42/42 authenticated E2E closure has not yet been established.

## Evidence rules

- Code presence is not implementation proof.
- Database tables are not workflow proof.
- A successful deployment is not scenario validation.
- `VALIDATED` requires execution of the complete scenario against the current candidate with evidence.
- `PRODUCTION VERIFIED` requires the same scenario evidence against the exact production candidate plus runtime/security checks.

## Current implementation evidence

- Branch `main` contains the remediation commits for Treatment Next Action, procurement receiving/payment, workforce unavailability, commercial sale, insurance reconciliation, domain-event work creation, procedure consumption, resource requirements, and ownership integrity.
- The connected Supabase project has the corresponding remediation migrations applied, including the later integrity fixes.
- Production deployment `dpl_8FZy8LPUtwTEaoDGXsCTyH7ZKag3` reached `READY` for commit `be9acc5feb16df2814aeb882e025a9b4a3ee9323`; subsequent commits are awaiting their normal Vercel Git deployment cycle.
- Latest observed production runtime error window after the remediation deployment contained no runtime error groups.
- Production `/login` returns HTTP 200 and renders the current authentication surface.
- No persistent test data is intentionally retained by the transactional DB probes used during remediation.

## Transactional validation evidence obtained

The following database-backed workflow probes were executed with an authenticated test-tenant JWT context inside transactions and rolled back where applicable:

1. Commercial Service/Package/Offer → Financial Plan → Invoice → Patient Package: success path proven for a package with a 10% offer; result returned gross, discount, net, financial plan, invoice and patient-package identifiers.
2. Purchasing → Supplier → Purchase Order → Receiving → Supplier Obligation → Supplier Payment: full database chain returned `paid` with the expected paid amount.
3. Domain Event → Operational Work: authorized creation and idempotent repeat behavior proven after aligning the work kind with the existing operational-work contract.
4. Procedure → Inventory Consumption: stock decrement and idempotent repeat behavior proven; ledger now records procedure, treatment-plan item and visit/session ownership.
5. Procedure → Required Resource → Agenda: persistence trigger rejects a required resource omission and accepts a correctly matched configured resource.
6. Operational Work ownership: persistence trigger rejects cross-tenant assignees.
7. Permission helper execution: authenticated execution grants for the application-facing permission helpers are present in live Supabase.

These are **targeted database/integration proofs**, not substitutes for the required full browser/user journey validation.

## Implemented remediation during this execution

1. Journey Coordination permission argument order corrected so `hasEffectivePermission(permission,userId)` is called correctly.
2. Agenda booking/rescheduling enforce Workforce/Room availability rather than relying only on conflict checks.
3. Agenda availability uses authenticated server Supabase context.
4. Agenda availability no longer silently falls back to invented default working hours.
5. Procedure skill/qualification foundations were added and Agenda eligibility checks configured requirements.
6. Distinct Service / Package / Offer / patient-package commercial foundations were added.
7. Operating Expense / Supplier Obligation / Supplier Payment foundations were added.
8. Collected-payment commission source linkage and calculation path were added, with idempotency protection for collected-payment commission entries.
9. Treatment completion creates an idempotent `next_action` work item for the next actionable Treatment Plan stage.
10. Treatment Next Action records use clinic-user identity and preserve tenant/source ownership.
11. Supplier receiving now atomically maintains a single Supplier Obligation per Purchase Order and updates its received value from the owning Purchase Order items.
12. Supplier payment recording is atomic through a database RPC that locks the obligation, inserts the payment, and updates balance/status in one transaction.
13. Workforce now has a unified availability-blocking absence model covering leave, sick leave, conference, seminar, official holiday, permission, departure and other approved unavailability; Agenda consumes this model while retaining legacy leave compatibility.
14. Commercial sale now requires a patient-owned Financial Plan, validates its amount against the net commercial amount, creates the invoice with valid installment terms, and creates the patient-package entitlement when applicable.
15. Insurance reconciliation now enforces tenant and insurance-management authorization, separates payer reconciliation from invoice cash balance, persists patient responsibility/profile state, and returns payer outstanding balance.
16. Domain-event work creation now enforces the required permission and tenant ownership and uses the existing `request` work kind rather than inventing a new operational-work kind.
17. Procedure inventory consumption now records visit/session, procedure and treatment-plan item provenance and prevents duplicate consumption.
18. Canonical Agenda persistence now enforces required Procedure Resources at the database boundary.
19. Operational Work persistence now enforces tenant ownership for requester, assignee and patient.

## Scenario result classification

### IMPLEMENTED — not yet full-workflow VALIDATED

1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42.

### VALIDATED

0 scenarios are promoted to the final `VALIDATED` gate because complete authenticated end-to-end execution across all workflow steps and actors has not yet been captured.

### PRODUCTION VERIFIED

0 scenarios.

## Remaining technical validation gate

The implementation blockers identified in the original 17-scenario list have materially been converted into executable database/application paths. The remaining gate is **authenticated full-workflow execution** across the current production candidate, including UI/IA, role/permission behavior, resource scheduling, visit/session completion, financial collection, insurance lifecycle, follow-up and coordination handoffs.

## Hard Scenarios

The hard-scenario register remains preserved and outside the current 42-scenario execution scope. No hard scenario is being silently removed or used to redefine the ideal baseline.

## Closure decision

**42 Ideal Scenarios: NOT CLOSED.**

The implementation remediation has advanced to targeted database/integration proof, but it would be incorrect to promote the 42 scenarios to `VALIDATED`, `PRODUCTION VERIFIED`, or `CLOSED` without the complete authenticated workflow evidence required by the execution contract.

No owner decision is currently required. Remaining work is execution/validation rather than an unresolved architecture, product, clinical-workflow, or business-policy decision.
