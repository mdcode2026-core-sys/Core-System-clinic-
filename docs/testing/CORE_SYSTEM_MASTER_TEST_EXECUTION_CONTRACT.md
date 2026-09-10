# CORE SYSTEM — MASTER TEST EXECUTION CONTRACT

**Status:** Installed on feature branch for validation
**Effective model:** SETUP → Engineering → Impact → Execution Matrix → Real-World E2E → Reconciliation → Regression → Final Verification

## 1. Purpose
This contract governs how CORE SYSTEM decides, executes, evidences, and closes software validation. It is not a route checklist and it is not itself a single E2E suite.

## 2. SETUP JOB — Decision Engine
SETUP is mandatory before downstream validation. It must identify:
- baseline commit and candidate commit;
- changed files and changed domains;
- direct dependencies and cross-domain impact;
- database, API, security, data, UI, i18n and mobile impact;
- affected roles and role handoffs;
- integrated business journeys;
- independent areas that may be excluded with evidence;
- required engineering checks, E2E journeys, security checks, reconciliation and regression level.

SETUP produces a machine-readable execution plan. Downstream jobs consume that plan rather than inventing scope independently.

## 3. Engineering Validation — before E2E
Required baseline checks are selected from impact but the engineering integrity gate precedes Real-World E2E:
- TypeScript, lint and production build;
- routing/API/application contracts;
- i18n and UX/IA structural integrity;
- architecture/domain boundaries;
- database schema, migrations, RLS, policies, functions, triggers and privileges;
- authentication, authorization and tenant isolation;
- data/reference/state integrity.

Routine validation uses local/CI execution. Vercel is reserved for the final release stage.

## 4. Impact Classes
Each relevant surface is classified as one or more of:
`TARGET`, `DEPENDENCY`, `CROSS_IMPACT`, `INDEPENDENT`, `INTEGRATED`, `SECURITY_IMPACT`, `DATA_IMPACT`, `ROLE_IMPACT`.

Exclusion requires an explicit reason and evidence in the execution plan.

## 5. Real-World E2E Contract
A Real-World E2E test represents a **user goal/journey**, not a page.

Every critical journey records:
- actor/role;
- starting state;
- user actions;
- expected visible outcomes;
- persisted domain state;
- next-role/handoff outcome when applicable;
- cross-module consequences;
- authorization boundaries;
- reconciliation evidence.

Core actor coverage must be selected from impact and may include Clinic Admin, Receptionist, Doctor, Nurse/Assistant, Finance/Accounting, Follow-up Staff, and Super Admin boundary scenarios.

## 6. Role Handoff
Where a business process crosses roles, E2E must prove the handoff rather than stopping at the first successful UI action.

`Actor A action → persisted state → Actor B sees actionable state → Actor B action → resulting state`

## 7. Evidence Contract
HTTP success alone is insufficient. Evidence should progress through:
`UI → API → domain state → database state → next actor/business outcome`.

## 8. Negative / Security E2E
Affected roles must be tested for prohibited actions and tenant boundaries. A successful positive journey does not prove authorization correctness.

## 9. Regression Levels
- **R0:** target only
- **R1:** target + direct dependencies
- **R2:** cross-domain impact
- **R3:** critical user journeys
- **R4:** full-system regression

SETUP selects the minimum justified level; critical security/tenant changes may elevate the level.

## 10. Gates
`SETUP PASS → Engineering PASS → Impact/Matrix VALID → Required E2E PASS → Reconciliation PASS → Regression PASS → Final Verification → Closure`.

A failed prerequisite blocks downstream closure. `BLOCKED` is not `PASS`.

## 11. Route Smoke Tests
Authenticated route traversal remains useful as a **smoke/authorization regression**. It is explicitly not considered Real-World E2E because page reachability does not prove business workflow correctness.

## 12. Governance
- Never work directly on `main`.
- No production DB mutation as part of routine test-contract validation.
- Database changes, when authorized, use controlled migrations and appropriate isolated validation.
- Do not use Vercel for routine build/validation.
- Preserve PJ-MASTER-DOCS authority.
- Record every material execution decision in `CORE_SYSTEM_EXECUTION_LEDGER.md` and update `CORE_SYSTEM_EXECUTION_HANDOFF.md` at handoff boundaries.
