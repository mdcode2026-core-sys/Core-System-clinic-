# CORE SYSTEM — AJM Execution Handoff

**Date:** 2026-08-29  
**Purpose:** Single entry point for any new execution conversation for AJM stages.

## 1. Mission
Execute AJM end-to-end as a production clinic operating workflow, not as a documentation exercise. Treat AJM-0 through AJM-8 as **UNEXECUTED for acceptance purposes**, regardless of historical completion claims. Existing code, database objects, UX, and prior stage work are evidence to inspect, reuse, correct, or extend.

## 2. Mandatory pre-stage review
Before every stage:
1. Read the current AJM master/blueprints and the relevant AJM stage documents.
2. Read the current UX/IA authority and relevant UX stage documents.
3. Read the relevant PJ documents and identify patient-journey ownership/impact.
4. Inspect current `main`, relevant branches, existing implementation, migrations, tests, and runtime surfaces.
5. Inspect current Supabase schema/data/RLS/functions/policies relevant to the stage.
6. Reconcile historical work before changing anything: KEEP / CLARIFY / RENAME / RECONCILE / SUPERSEDE / HISTORICAL.
7. Never infer completion from documentation alone.

## 3. Governing architecture
- PJ owns the patient journey and patient-facing/clinical journey semantics.
- AJM supplies administrative/operational capabilities and cross-domain coordination without duplicating PJ ownership.
- UX/IA determines how capabilities are exposed and used; presentation is not authorization.
- Workspace is a working environment, not an authorization boundary.
- Domain != Module.
- Module != Feature.
- Capability != Skill != Qualification.
- Permission != Entitlement != Capability.
- Appointment != Visit; CORE uses Visit internally, with Encounter as an external medical-standard mapping when needed.
- Do not invent a new ownership boundary merely to satisfy a stage.

## 4. Terminology governance
Use `docs/CORE-SYSTEM-TERMINOLOGY-GLOSSARY-2026-08-29.md` and `docs/TERMINOLOGY-APPLICATION-REGISTER-2026-08-29.md` as mandatory terminology references. Do not perform blind global replacements. Historical documents remain historical unless explicitly reconciled.

## 5. AJM ↔ UX ↔ PJ execution chain
For every capability/workflow:

AJM contract → PJ impact/ownership → UX/IA surface → entitlement/authorization → canonical data owner → runtime workflow → evidence → production verification → closure.

A UI route/component alone is not acceptance. A database object alone is not acceptance. A document marked CLOSED is not current acceptance evidence.

## 6. Stage order
AJM-0 → AJM-1 → AJM-2 → AJM-3 → AJM-4 → AJM-5 → AJM-6 → AJM-7 → AJM-8.

Stages may proceed sequentially. If a stage is blocked by a genuine external dependency, document the exact blocker and continue to a later stage only when no dependency is violated.

## 7. Mandatory stage state machine
UNEXECUTED → PRECHECK → RECONCILED → IMPLEMENTING → LOCAL/CI VALIDATED → DB/AUTH VALIDATED → RUNTIME VALIDATED → PRODUCTION CANDIDATE → VERCEL PRODUCTION DEPLOYED → PRODUCTION VERIFIED → DOCUMENTATION CLOSED → CLOSED.

A failed gate returns the stage to the first invalid state.

## 8. Execution behavior
Do not stop for issues that can be resolved without a user decision. Diagnose → fix → test → re-check → document. Escalate only genuine architectural/product decisions not already governed by existing decisions or this handoff.

Use Inspect → Reuse → Extend → Create only when genuinely required.

## 9. Validation gates
At minimum, where applicable:
- typecheck/build
- lint/static checks
- unit/integration tests
- migration correctness
- schema/data integrity
- RLS/tenant isolation
- effective permission behavior
- entitlement/license behavior
- authenticated runtime
- critical user workflow/E2E
- UX/IA visibility and discoverability
- Arabic/English/i18n behavior
- responsive/mobile behavior
- error/empty/loading states
- PJ workflow integrity
- cross-domain integration

## 10. Vercel economy rule
Do not use Vercel Production deployments as a substitute for cheap/local/CI validation. Exhaust local/Codespaces/GitHub Actions/Supabase validation first. Use a Production deployment when the candidate is genuinely ready for the final production gate. Economy means avoiding waste, never reducing verification quality.

Preview deployments caused automatically by Git integration are not Production acceptance.

## 11. Closure rule
A stage is `CLOSED` only after successful final Production deployment and Production verification, plus documentation/evidence completion.

If Production closure is genuinely impossible because of an external blocker:
- mark `PARTIALLY CLOSED / BLOCKED`;
- record exact blocker, completed work, remaining work, last valid SHA, next action, and continuation marker;
- create/maintain an actionable TODO or issue;
- proceed only to stages that are not dependent on the blocker.

## 12. Evidence protocol
Every stage must leave an auditable record containing:
- scope and acceptance criteria;
- pre-stage findings;
- AJM/UX/PJ reconciliation;
- files/code/schema changed;
- migrations and RLS changes;
- tests/checks and results;
- defects found and fixes;
- runtime verification;
- Production deployment ID/URL/SHA when applicable;
- final closure state;
- unresolved items and continuation instructions.

## 13. GitHub/Supabase discipline
- Work from current `main` and use focused branches.
- Inspect branches before porting work; port only required intent.
- Keep commits coherent and auditable.
- Never treat a branch as authoritative merely because its name matches a stage.
- Supabase is part of the implementation, not an afterthought. Verify migrations, live schema, RLS, functions, triggers, data invariants, and tenant isolation.

## 14. New-conversation execution instruction
A new execution conversation should begin by reading this file plus the linked governing documents in the repository, then stating the current stage and beginning the mandatory pre-stage review. Do not ask the user to restate project context that is already documented here.

## 15. Canonical references
- `docs/AJM-UX-UNIFIED-EXECUTION-PLAN-2026-08-29.md`
- `docs/PJ-AJM-UX-DEEP-RECONCILIATION-2026-08-29.md`
- `docs/CORE-SYSTEM-TERMINOLOGY-GLOSSARY-2026-08-29.md`
- `docs/TERMINOLOGY-APPLICATION-REGISTER-2026-08-29.md`
- Current AJM master/blueprint documents under `docs/`
- Current UX/IA authority and relevant UX documents under `docs/`
- PJ master documents and relevant journey documents under `docs/`

## 16. Non-negotiable principle
**Do not confuse implementation evidence with acceptance. The objective is a working, coherent clinic workflow whose AJM, UX, PJ, authorization, data ownership, and runtime behavior agree in production.**
