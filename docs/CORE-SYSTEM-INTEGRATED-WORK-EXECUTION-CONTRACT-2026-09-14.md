# CORE SYSTEM — Integrated Work / Execution Contract
## Version 1.0 — 2026-09-14

**Status:** APPROVED — Product Owner approval recorded 2026-09-14.
**Scope:** UX, architecture, frontend, backend, database, tests, documentation and release work.
**Mandatory lifecycle:** VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE

## 1. Purpose
This Contract governs how approved CORE SYSTEM work is executed. It prevents guessing, silent architecture changes, duplicate engines, unsafe DB changes, test suppression, premature Vercel use and false closure claims.

The Constitution governs product/architecture meaning; this Contract governs execution discipline.

## 2. Authority / Reality Model
- Approved current product/architecture decision = intent authority.
- Current repository = checked-in implementation reality.
- Live Supabase/runtime = runtime reality when the claim requires it.
- Historical reports = evidence, not automatic instructions.

Repository state alone never proves production state.

## 3. Mandatory Evidence Classes
Use: PROVEN, STRONG EVIDENCE, PROBABLE, UNVERIFIED, NOT A PROBLEM, DOCUMENTATION-ONLY.

Every material finding/blocker/closure statement must be classifiable. Never convert a weaker evidence type into stronger proof.

## 4. Stage 1 — VERIFY
Before implementation:
1. Read the applicable approved decision and governing docs.
2. Identify exact scope and affected domains/surfaces.
3. Inspect current repository implementation and tests.
4. Inspect relevant PJ/AJM/UX authority.
5. Inspect live Supabase only when current schema/data/backend behavior is relevant.
6. Reconcile contradictions.
7. Record evidence and unknowns.

No implementation begins while a genuine architectural/product contradiction is unresolved.

## 5. Stage 2 — PLAN
The plan must state:
- objective and non-goals;
- affected domains/surfaces;
- authoritative owner for each changed concept;
- reuse/extension/create decision;
- frontend/backend/DB impact;
- security/tenant implications;
- tests and verification evidence;
- documentation updates;
- rollback/compatibility considerations where relevant.

Open product decisions must remain explicit; they must not be silently converted into implementation assumptions.

## 6. Branch Rules
Never implement directly on `main` for planned work. Create a purpose-specific branch from the verified current base.

Separate unrelated UI/API/DB work where practical. Keep commits coherent and attributable. Do not force-push or rewrite shared history unless explicitly authorized.

The branch used for documentation governance in this handoff is:
`docs/constitution-contract-2026-09-14`

## 7. Stage 3 — IMPLEMENT
Implementation order:
```text
Inspect → Reuse → Extend → Integrate → Validate
```

Create new structures only when an existing structure cannot safely support the approved requirement.

Forbidden: silent scope expansion, speculative redesign, duplicate domains/engines, terminology changes without decision, workflow changes without decision, unsafe legacy deletion, security weakening, or modifying tests merely to suppress genuine failures.

## 8. Database / Supabase Contract
For DB-related work:
1. Inspect live Supabase state when current production/runtime schema matters.
2. Inspect repository migrations/schema definitions.
3. Reconcile differences explicitly.
4. Identify the canonical structure; never guess.
5. Create a migration only when required.
6. Prefer additive/non-breaking changes unless a destructive change is explicitly approved.
7. Verify migration application.
8. Verify runtime behavior.
9. Document schema/repository reconciliation.

Stop and request a decision before destructive or ambiguous changes involving data loss, tenant boundaries, security policies, unclear legacy structures or ownership.

No DB change is closed until applicable tenant isolation and authorization are verified.

## 9. Stage 4 — BUILD
GitHub Actions is the default first-line automated gate. Where applicable run:
- dependency install using lockfile;
- TypeScript;
- ESLint;
- i18n audit/catalog parity;
- automated tests;
- stage-specific structural/integration checks;
- production build.

CI proves only what actually ran. **CI PASS ≠ Runtime PASS.**

## 10. Stage 5 — VERIFY AGAIN
Test actual changed behavior, not only source health.

Where applicable verify:
- happy/invalid/empty/error states;
- permission denial and unauthorized direct invocation;
- tenant mismatch/isolation;
- cross-role behavior;
- mobile/responsive behavior;
- Arabic/English and RTL/LTR;
- navigation/deep links;
- adjacent-domain regression;
- loading states;
- data-dependent behavior;
- accessibility.

For global surfaces preserve:
```text
Home ≠ Role Workspace
Home ≠ My Workspace
My Workspace ≠ Role Workspace
Sidebar ≠ Authorization
Widget ≠ Authorization
Header ≠ Home/Workspace
Calendar ≠ Agenda
Appointment ≠ Agenda
Chat ≠ Separate Communications Engine
```

For mixed-permission users, additional authorized capabilities must not silently change the primary Role Workspace.

## 11. Interactive / Runtime Verification
Use Codespaces/local interactive validation when static CI cannot prove the claim, including route behavior, browser/runtime errors, interactions, responsive behavior, visual hierarchy, auth/session behavior, realtime/data-dependent behavior and post-mutation navigation.

Interactive evidence is mandatory whenever the Definition of Done contains a behavioral or visual claim that static CI cannot establish.

## 12. Vercel Contract
Vercel is reserved for evidence requiring the deployed environment.

Do not use Vercel merely to discover TypeScript, lint, i18n, deterministic build or other source-level failures GitHub Actions can detect.

Before deployment candidate:
- governing docs reconciled;
- intended implementation complete;
- CI gates pass;
- stage-specific checks pass;
- required local/runtime checks pass;
- no known blocking source defect remains;
- unresolved baseline failures are classified;
- candidate is explicitly marked READY FOR DEPLOYMENT.

After deployment, verify the exact repository SHA, deployment status and deployed runtime behavior. Deployment success alone is not product closure.

## 13. Stage 6 — REVIEW
Review must challenge the work against:
- Constitution invariants;
- domain ownership;
- authorization/tenant boundaries;
- anti-duplication rules;
- regression risk;
- accessibility and i18n;
- mobile/responsive behavior;
- open decisions accidentally converted into assumptions;
- evidence quality.

A real defect must be fixed or explicitly recorded; tests must not be weakened to make the defect disappear.

## 14. Stage 7 — DOCUMENT
Documentation belongs in the repository under `docs/`.

Every closed work item must record, as applicable:
- scope;
- decision/authority;
- implementation summary;
- evidence classification;
- CI/test results;
- runtime/production verification;
- DB/migration evidence;
- unresolved findings;
- exact commit/PR/deployment references;
- final status.

Documentation must never claim production closure without production evidence.

## 15. Stage 8 — CLOSE
A work item may close only when every applicable gate is satisfied:
- product/architecture gate;
- source/CI gate;
- tests;
- interactive/runtime gate when required;
- authorization/security/tenant gate when required;
- DB/backend gate when required;
- mobile/i18n/accessibility gate when applicable;
- production gate when the work requires production verification;
- documentation gate.

Mark N/A explicitly when a gate is genuinely not applicable.

Closure status must be one of:
- **CLOSED — VERIFIED**
- **CLOSED — DOCUMENTATION-ONLY**
- **BLOCKED — DECISION REQUIRED**
- **OPEN — IMPLEMENTATION REMAINING**

## 16. Stop Conditions
STOP and ask the Product Owner/architectural decision only when:
- two current authoritative sources conflict materially;
- the requested behavior changes a constitutional invariant;
- ownership between domains is genuinely ambiguous;
- a destructive DB/security change lacks approval;
- required evidence cannot be obtained and the claim cannot safely be made;
- an open product decision is required to continue.

Do not stop for ordinary implementation defects: investigate, fix and continue.

## 17. No-Guessing / No-Silent-Change Rules
Never guess schema, permissions, roles, routes, runtime behavior, ownership, product decisions or deployment state.

Never silently:
- rename a product concept;
- change workflow ownership;
- create a duplicate engine;
- change a security boundary;
- reinterpret a Role Workspace;
- convert Calendar into Agenda;
- make Treatment Plan mandatory;
- restrict Communications to doctors;
- delete legacy code without evidence.

## 18. Conflict Resolution
When a conflict is found:
1. identify the exact conflicting statements;
2. classify their authority and evidence;
3. inspect current implementation/runtime as applicable;
4. determine whether it is documentation drift or a genuine product/architecture conflict;
5. reconcile only when authority is clear;
6. otherwise STOP with a concise decision request.

Never silently choose a side merely because it is easier to implement.

## 19. Required Stage Record
Use this structure in repository documentation:
```text
Validation
- GitHub Actions: PASS / FAIL / N/A
- Codespaces/local: PASS / FAIL / N/A
- Vercel runtime: PASS / FAIL / N/A
- Supabase/backend: PASS / FAIL / N/A
- Mobile: PASS / FAIL / N/A
- Arabic/English + RTL/LTR: PASS / FAIL / N/A
- Accessibility: PASS / FAIL / N/A

Evidence classification: <classification>
Production deployment justification: YES / NO / N/A
Reason: <specific evidence required>
Final status: <closure status>
```

## 20. Mandatory Sequence
```text
VERIFY
  ↓
PLAN
  ↓
IMPLEMENT
  ↓
BUILD
  ↓
VERIFY
  ↓
REVIEW
  ↓
DOCUMENT
  ↓
CLOSE
```

The sequence may iterate inside a stage, but stages are not skipped merely for convenience.

**Approval:** Product Owner explicitly approved this Contract on 2026-09-14. The approval authorizes the execution rules; it does not authorize implementation scope that has not separately been planned/approved.

**End of Integrated Work / Execution Contract.**
