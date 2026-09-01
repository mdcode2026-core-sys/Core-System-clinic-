# CORE SYSTEM — Ideal Scenario Reality Validation

**Date:** 2026-08-30
**Scope:** Architecture-to-Reality implementation validation for the 42 ideal operational scenarios.

## Current gate

The implementation remediation has reached targeted database/integration proof. The remaining required gate is authenticated full-workflow execution of the current candidate, followed by exact-candidate production verification where justified.

## Evidence rules

- Code presence is not implementation proof.
- Database tables/functions are not workflow proof.
- A successful deployment is not scenario validation.
- `VALIDATED` requires execution of the complete scenario against the current candidate with evidence.
- `PRODUCTION VERIFIED` requires the same scenario evidence against the exact production candidate plus runtime/security checks.
- `CLOSED` requires all applicable closure gates and recorded evidence.

## Implemented remediation baseline

The current `main` candidate contains remediation for Treatment Next Action, Agenda workforce/room availability, authenticated Agenda availability, procedure skill/qualification eligibility, Service/Package/Offer commercial foundations, Financial Plan/Invoice/installment validation, collected-payment commission linkage and idempotency, supplier receiving/obligation atomicity, supplier payment atomicity, unified workforce absence blocking, insurance claim reconciliation, Domain Event → Operational Work authorization/ownership/idempotency, procedure inventory consumption provenance/idempotency, Agenda Procedure Resource enforcement, Operational Work tenant ownership, and Journey Coordination permission invocation.

## Targeted transactional validation already obtained

The connected Supabase project has been exercised through authenticated transaction probes covering:

- Commercial Service/Package/Offer → Financial Plan → Invoice → Patient Package.
- Purchasing → Supplier → Purchase Order → Receiving → Supplier Obligation → Supplier Payment.
- Domain Event → Operational Work with idempotent repeat behavior.
- Procedure → Inventory Consumption with idempotent repeat behavior.
- Procedure → Required Resource → Agenda enforcement.
- Operational Work cross-tenant ownership rejection.
- Application-facing permission helper execution.

These are targeted database/integration proofs and **do not substitute for the complete authenticated browser/user journey**.

## Full-workflow validation harness

The repository contains `tools/clinic-admin-real-world-e2e-v2.mjs`. CI orchestrates local production-build E2E through `.github/workflows/reality-audit-local.yml`, then exact-candidate production verification through `.github/workflows/production-gated-deploy.yml`. The harness requires authenticated E2E credentials and covers the clinic-wide route surface plus patient creation, appointment lifecycle, treatment-plan, financial-plan/installment, insurance/claims, inventory/procurement/receiving, workforce, communications, work center, follow-up, reports/analytics, RTL and mobile checks.

Route/surface checks remain evidence of rendered and reachable UI, not automatic proof of every scenario's complete workflow. Scenario closure requires mapping actual execution evidence to the traceability matrix.

## 42-scenario status

### IMPLEMENTED — full-workflow validation pending

1–42: implementation paths exist in the current candidate; complete scenario execution evidence is still required before promotion.

### VALIDATED

0 scenarios.

### PRODUCTION VERIFIED

0 scenarios.

### CLOSED

0 scenarios.

## Hard Scenarios

The hard-scenario register remains preserved and outside the current 42-scenario execution scope. No hard scenario is being silently removed or used to redefine the ideal baseline.

## Closure decision

**42 Ideal Scenarios: NOT CLOSED.**

No owner decision is currently required. Remaining work is execution/validation rather than an unresolved architecture, product, clinical-workflow, or business-policy decision.
