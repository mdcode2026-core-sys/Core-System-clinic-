# CORE SYSTEM — Ideal Scenario Reality Validation

**Date:** 2026-08-30
**Scope:** Architecture-to-Reality implementation validation for the 42 ideal operational scenarios.
**Current result:** BLOCKED — 42/42 validation closure not achieved.

## Evidence rules

- Code presence is not implementation proof.
- Database tables are not workflow proof.
- A successful deployment is not scenario validation.
- `VALIDATED` requires execution of the complete scenario against the current candidate with evidence.
- `PRODUCTION VERIFIED` requires the same scenario evidence against the exact production candidate plus runtime/security checks.

## Repository / database evidence

- Current implementation branch: `main`.
- Production deployment checks remain subject to the Vercel build-rate limit; no deployment is being used as a substitute for scenario validation.
- Production `/login` and prior runtime inspection remain useful baseline evidence only.
- Live database baseline remains unchanged for test-data-sensitive domains; no production test records were inserted merely to manufacture workflow evidence.

## Implemented remediation during this execution

1. Journey Coordination permission argument order corrected so `hasEffectivePermission(permission,userId)` is called correctly.
2. Agenda booking/rescheduling enforce Workforce/Room availability rather than relying only on conflict checks.
3. Agenda availability uses authenticated server Supabase context.
4. Agenda availability no longer silently falls back to invented default working hours.
5. Procedure skill/qualification foundations were added and Agenda eligibility checks configured requirements.
6. Distinct Service / Package / Offer / patient-package commercial foundations were added.
7. Operating Expense / Supplier Obligation / Supplier Payment foundations were added.
8. Collected-payment commission source linkage and calculation path were added.
9. Treatment completion creates an idempotent `next_action` work item for the next actionable Treatment Plan stage.
10. Treatment Next Action records use clinic-user identity and preserve tenant/source ownership.
11. Supplier receiving now atomically maintains a single Supplier Obligation per Purchase Order and updates its received value from the owning Purchase Order items.
12. Supplier payment recording is now atomic through a database RPC that locks the obligation, inserts the payment, and updates balance/status in one transaction.
13. Workforce now has a unified availability-blocking absence model covering leave, sick leave, conference, seminar, official holiday, permission, departure and other approved unavailability; Agenda consumes this model while retaining legacy leave compatibility.
14. Repository migrations were added for the supplier receiving/payment and unified workforce unavailability remediations; corresponding Supabase migrations were applied to the connected project.

## Scenario result classification

The authoritative per-scenario matrix is `docs/IDEAL-SCENARIO-IMPLEMENTATION-GAP-MATRIX-2026-08-30.md`.

### IMPLEMENTED — not yet VALIDATED on current candidate

1, 2, 3, 4, 5, 7, 8, 9, 12, 13, 14, 15, 16, 18, 19, 22, 23, 24, 29, 30, 31, 34, 36, 37, 39.

### BLOCKED — implementation remediation still required and/or end-to-end evidence absent

6, 10, 11, 17, 20, 21, 25, 26, 27, 28, 32, 33, 35, 38, 40, 41, 42.

### VALIDATED

0 scenarios. No current-candidate authenticated full-workflow execution evidence has been accepted as sufficient for a 42-scenario closure claim.

### PRODUCTION VERIFIED

0 scenarios.

## Root blockers / current remediation state

### B1 — Commercial execution chain
Service, Package and Offer schemas exist, but the actual configured commercial sale path, offer application and atomic linkage to financial commitment/session entitlement still require implementation and E2E proof.

### B2 — Treatment continuation
Treatment completion now creates an idempotent `Next Action` work item for the next actionable stage. The remaining gap is the full authorized actor → booking requirement → Agenda → Visit → completion → subsequent stage/follow-up execution and evidence.

### B3 — Insurance reconciliation
Insurance profiles and claim creation exist, but deterministic reconciliation of payer amount, patient responsibility, invoice balance and final claim state still requires implementation and E2E proof.

### B4 — Procurement financial completion
Receiving now atomically creates/updates the single Supplier Obligation for the Purchase Order; supplier payment is also atomic. Remaining work is UI/E2E execution and full chain evidence.

### B5 — Resource consumption
Agenda validates provider/room/resource availability, but procedure completion does not yet drive the owning inventory/resource consumption truth end-to-end.

### B6 — Domain-event coordination
Operational Work lifecycle exists, but there is not yet a universal governed domain-event→work creation mechanism covering the required originating domains.

### B7 — Workforce absence breadth
A unified Workforce unavailability model now exists and Agenda consumes it. Runtime/E2E proof and the real clinic absence lifecycle still need to be executed before Scenario 38 can become VALIDATED.

## Closure decision

**42 Ideal Scenarios: BLOCKED.**

The implementation has advanced materially, including real database-backed remediations, but it is not legitimate to claim `VALIDATED`, `PRODUCTION VERIFIED`, or `CLOSED` for the 42-scenario set until the complete workflows are executed and evidenced.

No owner decision is currently required. The remaining blockers are implementation/technical workflow gaps covered by the existing contracts and can continue without changing the approved architecture.
