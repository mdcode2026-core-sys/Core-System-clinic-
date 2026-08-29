# CORE SYSTEM — AJM ↔ UX/IA ↔ PJ Unified Execution Plan
## Runtime-First Full Execution Protocol — 2026-08-29

**Status:** EXECUTION AUTHORITY FOR THE NEW AJM CYCLE
**Baseline:** current `main` plus the current Terminology Governance and Deep PJ/AJM/UX Reconciliation records.

## 0. Execution reset

For this execution cycle, **AJM-0 through AJM-8 are treated as unexecuted stages** regardless of historical `CLOSED`, `IMPLEMENTED` or `PRODUCTION READY` labels.

Historical records are evidence only. They are not acceptance certificates for the new cycle.

Existing code, migrations, database objects and UX work are not discarded. They are classified as:

`KEEP / FIX / RECONCILE / EXTEND / REPLACE / REMOVE`

and must pass the current gates again.

## 1. Governing execution chain

AJM, UX/IA and PJ are one integrated execution chain:

`AJM contract → PJ impact → UX surface → authorization/entitlement → canonical data owner → runtime workflow → evidence → production → closure`

No stage is complete because a document says so.
No UX surface is accepted because a route/component exists.
No database table is accepted as a capability without a working user workflow.
No workflow is accepted if it creates a second owner for an existing authoritative domain.

## 2. Mandatory pre-stage review

Before every stage:

1. Read the applicable AJM master/stage/domain blueprint.
2. Read the current UX/IA Final Authority and applicable UX stage records.
3. Read relevant PJ references and the PJ/UX reconciliation addendum.
4. Read the Terminology Governance and Historical Reconciliation records.
5. Inspect current `main` code and routes.
6. Inspect relevant historical branches and PRs; never merge an old branch wholesale.
7. Inspect Supabase schema, migrations, RLS, constraints, functions and relevant live data.
8. Identify the canonical owner for every affected record/lifecycle.
9. Identify existing implementations that can be reused.
10. Build a stage-specific reconciliation matrix before changing code.

Required method:

`READ → INSPECT → MAP → RECONCILE → RESEARCH → VALIDATE → IMPLEMENT`

and:

`Inspect → Reuse → Extend → Reconcile → Create`.

## 3. Deep PJ/AJM/UX reconciliation gate

The deep reconciliation found broad architectural alignment but also implementation/documentation conflicts that must remain visible during execution.

### Confirmed alignment

- PJ remains the patient-centered journey authority.
- Patient Flow remains one system with Operations, Clinical and Administrative views.
- Queue remains inside Patient Flow and its persisted visit-session state remains authoritative.
- Patient Context is contextual navigation, not a new patient journey.
- Agenda remains appointment authority.
- Treatment Plan remains its own clinical/product concept.
- Follow-up remains its own continuity capability.
- Journey Coordination coordinates general work and does not replace PJ, Agenda, Clinical, Follow-up, Workforce, Communications or Financial & Resources.
- Financial & Resources is one coherent user-facing product surface while backend ownership remains explicit.
- Workspace is UX organization, not authorization.

### Confirmed conflicts requiring control

1. `domainSurfaceCatalog.ts` had classified Patient Flow as contextual while the authoritative UX/PJ decision requires a first-class Sidebar system. **Corrected in the reconciliation branch.**
2. The UX surface catalog used `domain` terminology for presentation subjects that are not necessarily AJM Domains. The code comment is now explicit; broad renaming is deferred to controlled cleanup.
3. Journey Coordination contains old `Skill / Capability` wording that conflicts with the authoritative terminology separation of Capability, Skill and Qualification. This must be corrected before the affected stage is accepted.
4. The AJM master contains the same historical Skill/capability shorthand and must be reconciled before affected stages are accepted.
5. Historical stage closure records are evidence, not current closure, because the new execution contract requires the complete runtime-first gate.

Full evidence is recorded in `docs/PJ-AJM-UX-DEEP-RECONCILIATION-2026-08-29.md`.

## 4. Stage execution state machine

Every stage follows:

```text
UNEXECUTED
  ↓
PRECHECK
  ↓
RECONCILED
  ↓
IMPLEMENTING
  ↓
LOCAL/CI VALIDATED
  ↓
DB + AUTH VALIDATED
  ↓
RUNTIME VALIDATED
  ↓
PRODUCTION CANDIDATE
  ↓
VERCEL PRODUCTION DEPLOYED
  ↓
PRODUCTION VERIFIED
  ↓
DOCUMENTATION CLOSED
  ↓
CLOSED
```

A failure returns the stage to the earliest invalid gate and is fixed before proceeding.

## 5. Evidence matrix required for every stage

| Gate | Required evidence |
|---|---|
| Architecture | AJM contract + applicable architectural decisions |
| PJ impact | affected journey steps, ownership and workflow impact |
| UX | canonical route/surface, navigation, contextual entry and IA |
| Terminology | current glossary compliance |
| Ownership | one authoritative domain/record/lifecycle owner |
| Reuse | existing implementation inspected and disposition recorded |
| Duplicate check | no competing engine/registry/workflow |
| Authorization | permission source + server/data/action enforcement |
| Entitlement | capability/license logic where applicable |
| Database | schema, FK, constraints, RLS, functions and migration state |
| Workflow | complete authenticated business workflow |
| i18n | Arabic/English semantic and interaction parity |
| Mobile | responsive behavior on small screens |
| Accessibility | keyboard/focus/labels/disclosure behavior where applicable |
| Auditability | required audit/history evidence |
| CI | TypeScript, tests/audits, lint gate and production build |
| Production | deployed candidate SHA and runtime verification |
| Documentation | stage record, findings, fixes, evidence and handoff |
| Closure | explicit status, SHA, deployment and remaining-risk statement |

## 6. GitHub/Codespaces-first engineering policy

All implementation starts in GitHub/Codespaces and the repository engineering toolchain.

Use the available code, test, static-analysis, database and repository tooling aggressively.

Expected pre-deployment validation includes, where applicable:

- dependency/lockfile verification;
- TypeScript;
- unit/domain tests;
- repository audits;
- i18n audit and parity;
- changed-surface ESLint;
- relevant full-repository diagnostics as reported evidence;
- migration/schema validation;
- RLS/policy checks;
- authorization checks;
- tenant-isolation checks;
- authenticated E2E/runtime checks;
- production build.

Do not use Vercel to discover errors that could have been found by these gates.

## 7. Supabase execution policy

Supabase is part of implementation, not merely a deployment dependency.

Before any migration:

`repository migrations ↔ live migration history ↔ live schema ↔ application code`

must be reconciled.

Never recreate a migration merely because its filename is missing from the repository.

Every database change must validate:

- tenant ownership;
- FK integrity;
- constraints;
- RLS;
- server-side authorization;
- migration idempotency/safety where appropriate;
- impact on existing PJ/AJM data.

## 8. Vercel resource-economy policy

Vercel Production is the final runtime gate, not the first diagnostic tool.

Use local/Codespaces/GitHub validation for inexpensive checks first.

Deploy to Production only when the candidate has passed the applicable non-Vercel gates and is actually ready for runtime verification.

Resource economy must never lower verification quality.

If a deployment fails for an infrastructure/rate-limit/configuration reason, distinguish that from an application failure and record the exact blocker.

No secret, token or environment variable may be invented.

## 9. Automatic progression rule

Do not stop for a decision when the issue can be resolved by applying an existing approved architecture, terminology rule, UX authority or engineering best practice.

Stop only when there is a genuine unresolved architectural/product decision that is not covered by an existing authority.

When a blocker is independent of the current stage and does not invalidate the next stage, record it with:

- blocker ID;
- owner;
- exact condition;
- current evidence;
- continuation command/TODO;
- dependency impact;

and continue to the next stage where safe.

## 10. AJM-0 — Baseline & Readiness

Treat historical AJM-0 as evidence, not current closure.

Reconfirm:

- governing documents;
- repository baseline;
- branch state;
- Supabase schema/migration state;
- Vercel project/deployment state;
- PJ anchors;
- UX authority;
- terminology governance;
- known blockers.

AJM-0 must produce the frozen baseline used by all later stages.

## 11. AJM-1 — Team & Access

Execute against the existing foundation rather than rebuilding it.

Validate:

- Clinic Admin access;
- custom roles;
- role assignment;
- permission assignment;
- direct permission grants;
- explicit revoke/negative overrides;
- effective permission calculation;
- unauthorized route/action denial;
- tenant isolation;
- workspace independence from authorization;
- Sidebar/Workspace visibility;
- Arabic/English;
- mobile;
- audit history.

Then perform authenticated end-to-end acceptance and production deployment verification.

## 12. AJM-2 — Financial & Resources

Use the canonical Financial & Resources product hierarchy:

```text
Financial & Resources
├── Overview
├── Invoices
├── Payments
├── Financial Plans
│   └── Installments
├── Insurance
│   └── Claims
├── Inventory
│   └── Consumption
└── Purchasing
    ├── Suppliers
    └── Receiving
```

Validate every surface against:

- canonical backend ownership;
- permissions/entitlements;
- tenant isolation;
- financial persistence and state transitions;
- invoice/payment integrity;
- plans/installments;
- minimum insurance/claims;
- inventory/consumption;
- purchasing/suppliers/receiving;
- patient context;
- Patient Portal relationship;
- Insights consumption;
- i18n/mobile;
- duplicate-root navigation absence.

No AJM-3 begins until AJM-2 passes its closure gate.

## 13. AJM-3 — Workforce & Operations

Before implementation:

- reconcile Workforce with Team & Access;
- reconcile Workforce with Agenda;
- reconcile Skill vs Qualification vs Capability;
- identify current availability structures that can be reused;
- define independent Workforce ownership.

Implement/validate only genuine gaps across:

- Staff;
- Employment;
- Availability;
- Working patterns;
- Leave/absence;
- Attendance;
- Capacity;
- Payroll/benefits/commission/recruitment where required by the approved scope;
- Productivity/operational data.

Workforce must not become Agenda or Team & Access.

## 14. AJM-4 — Communications

Reconcile existing notification/Portal messaging infrastructure before creating anything.

Validate:

- internal communication;
- patient communication;
- Portal communication;
- notifications;
- communication history/context;
- authorization/privacy;
- explicit conversion from communication to work only when action is required.

Do not create a second workflow engine or second messaging system.

## 15. AJM-5 — Journey Coordination

Implement the general work-coordination layer around existing domains.

Core concepts:

- Work Item;
- Task;
- Request;
- Assignment;
- Handoff;
- Next Action;
- Escalation;
- My Work / Work Center;
- Admin operational oversight;
- audit/history.

Integrate domain events from Agenda, Clinical/PJ, Follow-up, Financial & Resources, Workforce, Communications and Portal without duplicating their source lifecycles.

Correct all Skill/Capability terminology before acceptance.

## 16. AJM-6 — Insights

Use canonical source-domain data.

Validate:

- KPI definitions;
- financial metrics;
- workforce metrics;
- journey/PJ metrics;
- operational bottlenecks;
- cross-domain reporting;
- tenant entitlement boundaries;
- no duplicate calculation engine.

Insights interprets; it does not own source operational truth.

## 17. AJM-7 — PJ & Cross-Domain Integration

This is the principal workflow-integration gate.

Validate representative real clinic journeys end-to-end:

```text
Patient / Appointment
 → Visit / Patient Flow
 → Clinical work
 → Treatment Plan
 → Financial commitment
 → Payment / Installment
 → Resource consumption where applicable
 → Operational Task / Handoff
 → Follow-up
 → Communication / Portal
 → Next Action
 → Insight
```

For every transition verify:

- correct owner;
- correct actor authorization;
- correct persisted state;
- no duplicate state machine;
- patient context continuity;
- auditability;
- Arabic/English;
- mobile;
- tenant isolation.

## 18. AJM-8 — Final Validation & Closure

Run the complete system gate:

- architecture reconciliation;
- terminology compliance;
- PJ workflow integrity;
- AJM domain ownership;
- UX/IA integrity;
- authorization/security;
- tenant isolation;
- RLS;
- data integrity;
- auditability;
- i18n/RTL/LTR;
- mobile;
- performance/regression checks;
- production build;
- Vercel production deployment;
- production runtime verification;
- documentation/handoff completeness.

## 19. UX/PJ regression gates during AJM

Any AJM change touching these surfaces automatically triggers the relevant regression audit:

- Sidebar/navigation;
- Workspace;
- Widgets;
- Patient Flow/Queue;
- Patient Context;
- Global Search;
- Overview/Dashboard;
- Patient Portal;
- treatment/financial contextual links;
- i18n/RTL/LTR.

The current UX stages are evidence and regression suites, not independent authority over AJM architecture.

## 20. Historical branch policy

For every historical AJM/UX/PJ branch:

`compare → inspect changed files → identify unique intent → port only required delta → validate on current main`

Do not merge a stale branch wholesale.

A historical branch may contain a useful implementation even if its stage status is now reset to unexecuted.

## 21. Documentation protocol

For every stage maintain:

1. Pre-stage inspection record.
2. Reconciliation matrix.
3. Implementation record.
4. Issues/fixes register.
5. Validation evidence.
6. Production deployment evidence.
7. Closure record.
8. Handoff to next stage.

Documentation must record what was:

- inspected;
- reused;
- reconciled;
- extended;
- created;
- removed;
- left unchanged;
- tested;
- deployed.

## 22. Closure rule

A stage is **CLOSED** only when the final candidate SHA has:

1. passed the applicable GitHub/Codespaces validation;
2. passed database/security/runtime gates;
3. passed the required authenticated workflow validation;
4. been deployed to Vercel Production when the stage changes runtime behavior or its DoD requires deployment;
5. been verified in Production;
6. had its documentation updated;
7. had no unresolved stage blocker.

A historical `CLOSED` label never overrides this rule.

## 23. Partial closure / continuation rule

If Production deployment is genuinely impossible because of an external infrastructure constraint:

- mark `PARTIALLY CLOSED — DEPLOYMENT BLOCKED`;
- preserve all completed evidence;
- record exact deployment blocker;
- add a machine-readable continuation TODO/marker;
- record candidate SHA;
- do not claim Production Ready;
- continue to a later independent stage only if dependencies permit it.

## 24. Immediate execution sequence

```text
AJM-0 baseline reset/verification
        ↓
AJM-1 Team & Access
        ↓
AJM-2 Financial & Resources
        ↓
AJM-3 Workforce & Operations
        ↓
AJM-4 Communications
        ↓
AJM-5 Journey Coordination
        ↓
AJM-6 Insights
        ↓
AJM-7 PJ + Cross-Domain Integration
        ↓
AJM-8 Final Validation + Production Closure
```

No later UX implementation is allowed to skip an AJM gate.
No AJM implementation is allowed to silently override PJ or UX authority.

## 25. Completion criterion

The full plan succeeds only when every AJM capability has:

- one clear business owner;
- one canonical data/lifecycle owner;
- one authorized execution path;
- one clear user-facing surface;
- explicit PJ relationship where relevant;
- no competing implementation;
- verified runtime behavior;
- production deployment evidence;
- a closure record tied to a known SHA.

The final system must be understandable as a real clinic workflow, not merely as a collection of technically functioning pages.
