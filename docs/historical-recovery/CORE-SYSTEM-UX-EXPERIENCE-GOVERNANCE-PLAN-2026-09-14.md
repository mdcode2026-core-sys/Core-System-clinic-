# CORE SYSTEM — UX / Experience Governance PLAN
## 2026-09-14

**Stage:** PLAN — completed
**Branch:** `ux-experience-governance-verify-2026-09-14`
**Preceding VERIFY:** `docs/CORE-SYSTEM-UX-EXPERIENCE-GOVERNANCE-VERIFY-2026-09-14.md`
**Governing authority:** Approved Constitution + Approved Integrated Work / Execution Contract, 2026-09-14

## 1. Objective
Establish a product-wide UX / Experience Governance layer for CORE SYSTEM so that screens, work surfaces and global surfaces use one coherent visual and interaction language while preserving the approved domain ownership and workspace architecture.

The work is not a visual reskin. It is a controlled experience-system implementation that makes the existing UI foundation explicit, reusable and testable across the product.

## 2. Primary Outcome
A user should experience CORE SYSTEM as one product rather than a collection of individually repaired screens.

The governed experience must consistently define, where applicable:
- page hierarchy;
- typography hierarchy;
- spacing rhythm;
- surface/container behavior;
- border/radius/elevation language;
- semantic color usage;
- action hierarchy;
- input/control states;
- loading/empty/error/success states;
- responsive behavior;
- RTL/LTR behavior;
- accessibility expectations;
- navigation and feedback patterns.

## 3. Controlled Pilot
The first product pilot is **Home** because it is a high-visibility entry surface and current source evidence shows mixed awareness, routing and context content that needs stronger experience hierarchy.

The pilot must validate the governance layer without turning Home into a specialist workspace or duplicating Agenda, Clinical Workspace, Communications, Notifications, Work Center or other authoritative domains.

Home ordering and final visual hierarchy remain an OPEN product decision. The implementation plan must therefore define the governance framework and measurable rules first, then apply only decisions that are already authorized.

## 4. Non-Goals
This plan does not authorize:
- a full product rebuild;
- replacing the existing UI foundation;
- creating a second design system;
- redesigning every module in one pass;
- changing Role Workspace semantics;
- merging Home, My Workspace and Role Workspace;
- redesigning Header as part of this workstream;
- changing Communications/Chat architecture;
- changing Agenda/Calendar architecture;
- changing Patient Flow/PJ architecture;
- changing roles, permissions, entitlements or tenant security;
- changing DB schema unless later verification proves a DB change is genuinely required;
- resolving open product decisions by assumption.

## 5. Affected Surfaces
### Direct
- shared experience primitives/tokens where gaps are proven;
- page/surface composition patterns;
- Home as the controlled pilot;
- responsive and accessibility behavior for the pilot;
- applicable loading/empty/error/success states.

### Adjacent validation only
- Header;
- Sidebar;
- My Workspace;
- Role Workspace entry;
- Communications / Chat / Notifications;
- representative Module/Domain pages.

Adjacent surfaces are used to verify consistency and regression risk. They are not automatically redesigned.

## 6. Authoritative Ownership
- Product meaning and surface boundaries: approved Constitution.
- Global-surface semantics: `CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`.
- Patient Journey / Patient Flow semantics: current authoritative PJ material.
- Agenda semantics: current Agenda/AJM authority.
- Authorization: existing server-side permission/tenant authorization architecture.
- Visual/experience implementation: existing UI foundation and shared primitives, extended only where the verified gap requires it.
- Home business data: authoritative Home/domain queries already used by the current implementation; Home must remain a presentation/routing surface rather than a new business engine.

## 7. Reuse → Extend → Create Decision
### Reuse
Reuse existing:
- shared Header/Sidebar shell;
- UI primitives;
- semantic color tokens;
- existing i18n and RTL/LTR infrastructure;
- existing domain query/data authorities;
- existing Home routes and domain destinations where behavior is correct.

### Extend
Extend existing shared primitives/tokens only when a repeated product-wide requirement is proven, such as missing semantic surface/state variants, typography hierarchy, spacing conventions or responsive primitives.

### Create
Create new experience abstractions only when no existing primitive can safely represent the approved requirement. Any new abstraction must have a clear owner, naming rule, usage contract and test/verification strategy.

No duplicate design system, duplicate authorization model or duplicate domain workflow may be created.

## 8. Frontend Impact
Expected frontend work, subject to implementation-stage verification:
1. Define/confirm semantic experience tokens and component contracts from the existing foundation.
2. Establish governed page/container hierarchy patterns.
3. Establish governed state patterns.
4. Apply the patterns to Home as the pilot.
5. Verify responsive/RTL/accessibility behavior.
6. Verify that Home routes users into authoritative work surfaces rather than duplicating their workflows.

The implementation must avoid large local class duplication when a shared governed primitive is appropriate.

## 9. Backend / Database Impact
**Expected:** none.

The Home pilot should continue consuming authoritative existing data sources. No new database tables, duplicate queries/engines, permissions, authorization paths or workflow engines are authorized by this plan.

If implementation discovers a genuine backend/schema requirement, the work must stop at the DB decision gate and follow the approved Supabase reconciliation contract before any migration is created.

## 10. Security / Tenant Implications
No authorization model change is planned.

The following must remain true:
- visibility is not authorization;
- Home widgets/cards do not grant permissions;
- direct route/action authorization remains server-side;
- tenant-owned data remains tenant-isolated;
- additional permissions do not redefine Primary Role or Role Workspace;
- personalization changes presentation only.

Any security or tenant-boundary change discovered during implementation is a blocker for decision/verification, not an implicit implementation detail.

## 11. Implementation Sequence
The implementation stage, after this plan, must proceed in this order:

### Implementation Phase A — Experience Foundation
- inspect existing tokens/primitives;
- identify verified gaps;
- extend shared contracts minimally;
- add or standardize only the necessary states/patterns;
- preserve existing behavior unless an approved UX decision requires change.

### Implementation Phase B — Home Pilot
- refactor Home to consume the governed experience patterns;
- preserve authoritative routes/data ownership;
- improve action/outcome clarity;
- keep Home lightweight and distinct from specialist workspaces;
- preserve permission-aware visibility.

### Implementation Phase C — Regression / Representative Surfaces
- verify Header and Sidebar remain stable;
- verify My Workspace and Role Workspace semantics;
- verify Communications/Chat/Notifications remain distinct;
- verify representative Domain surfaces do not regress visually or behaviorally.

### Implementation Phase D — Validation
- CI/build/tests;
- interactive browser/runtime verification;
- mobile/responsive;
- Arabic/English and RTL/LTR;
- accessibility;
- evidence review.

No Vercel deployment is part of the implementation phase unless deployed-runtime evidence becomes necessary after all pre-deployment gates pass.

## 12. Required Tests / Evidence
### Static/automated
- TypeScript;
- ESLint;
- existing automated tests;
- applicable i18n/catalog checks;
- stage-specific structural checks;
- production build.

### Behavioral/runtime
- Home loads for authorized users;
- permission-dependent cards do not expose unauthorized data/actions;
- routes land on authoritative destinations;
- empty/loading/error states behave correctly;
- no duplicate workflow is introduced;
- no cross-tenant data is surfaced;
- mobile/responsive behavior;
- Arabic/English + RTL/LTR;
- keyboard/focus/semantic accessibility checks.

### Visual
- compare the Home pilot against the governed experience rules;
- verify consistency of hierarchy, spacing, surfaces, controls and states;
- verify no local pattern silently contradicts the shared experience rules.

Visual claims that cannot be proven by static CI require interactive evidence.

## 13. Documentation Deliverables
At minimum, the implementation work must update/create repository documentation for:
- experience foundation decisions actually implemented;
- Home pilot implementation and scope;
- evidence and test results;
- unresolved/open UX decisions;
- exact commit/PR references;
- runtime/deployment evidence when applicable;
- final closure status.

Official documentation remains under `docs/`.

## 14. Rollback / Compatibility
- Prefer additive/shared primitive changes.
- Avoid destructive removal of existing primitives until usage is proven and migration is controlled.
- Keep domain routes and authoritative data ownership stable.
- If a shared change causes an adjacent-surface regression, revert or isolate the change rather than adding local exceptions that weaken the governance model.

## 15. Stage Gates
### Before IMPLEMENT
- Constitution/Contract approved: YES.
- VERIFY completed: YES.
- PLAN completed: YES.
- No unresolved constitutional/product contradiction: YES.
- Implementation branch exists: YES.

### Before BUILD / VERIFY AGAIN
- Intended implementation complete: required.
- Tests updated only where behavior requires them: required.
- No genuine failure suppressed: required.

### Before production candidate
- CI gates pass.
- Interactive/runtime checks pass where required.
- Mobile/i18n/accessibility checks pass where applicable.
- No known blocking defect remains.
- Deployment candidate explicitly marked READY FOR DEPLOYMENT.

## 16. Open Decisions Preserved
This plan deliberately does not decide:
- final Home ordering/visual hierarchy;
- Dashboard vs Analytics UI boundary;
- Work Center vs My Workspace boundary;
- final visual token taxonomy beyond what verification proves necessary;
- visual regression tooling;
- Administrative Workspace IA;
- Super Admin Workspace scope;
- final platform-content model.

If any of these becomes necessary to proceed, STOP and request the specific Product Owner decision.

## 17. PLAN Result
**Evidence classification:** STRONG EVIDENCE

**Stage status:** PLAN COMPLETE — implementation may begin under the approved Contract.

**Implementation target:** Product-wide UX / Experience Governance foundation with Home as the first controlled pilot.

**Implementation authorized by this plan:** YES, for the defined scope only. No unrelated redesign or architecture change is authorized.

**Next stage:** IMPLEMENT

**End of PLAN.**