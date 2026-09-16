# CORE SYSTEM — Post-129 Canonical State Reconciliation
## 2026-09-16

**Status:** POST-129 ARCHITECTURE BASELINE — ACTIVE
**Purpose:** Establish the factual execution baseline for work after the Global Experience reconciliation without modifying PR #129 or any branch beneath it.

## 1. Scope and non-change rule

This document is a post-129 planning and architecture baseline.

It does **not** modify:

- PR #129;
- PR #136;
- PR #137;
- any historical PR/branch already reconciled into #129;
- the implementation payload of the Global Experience Presentation rebuild.

The post-129 stream starts from the reconciled #129 head:

- repository: `mdcode2026-core-sys/Core-System-clinic-`
- canonical reconciliation branch: `repair/global-experience-presentation-rebuild-2026-09-16`
- reviewed baseline SHA: `1a1282bcdf59f037c9ef491c51b5425261cd86a9`

The GitHub PR object for #129 remains an open draft at the time this document is written. For planning purposes, the post-129 stream treats the reconciled `1a1282bc...` implementation head as its baseline; this is not a claim that GitHub has merged or closed #129.

## 2. Canonical execution hierarchy

The canonical hierarchy after the Global Experience reconciliation is:

```text
main
  ↑
PR #129 canonical Global Experience reconciliation
  ↑
PR #136 Global Experience Presentation contract execution
  ↑
POST-129 architecture / execution stream
```

PR #137 remains validation-only and is not a promotion path.

The post-129 stream must never use PR #122 or another superseded presentation branch as its implementation base.

## 3. Documentation reconciliation rule

The older document:

`docs/CORE-SYSTEM-GLOBAL-EXPERIENCE-PRESENTATION-EXECUTION-STATUS-2026-09-16.md`

contains historical statements naming PR #122 and `e51bca46...` as the active execution path. Those statements are no longer authoritative for post-129 planning.

The authoritative post-129 facts are:

- #129 is the reconciled Global Experience canonical path;
- `1a1282bc...` is the post-reconciliation implementation baseline;
- #136 is a child execution stream of #129;
- #137 is validation-only;
- post-129 architecture work must branch from the reconciled baseline and must not rewrite the history of #129.

Historical documents may remain as historical evidence. They must not be interpreted as current execution instructions.

## 4. What is considered established

The Global Experience reconciliation established the current presentation baseline, including the approved Concept 01 visual direction and the Adaptive Hybrid Experience Model (Horizon + Vertex + Zenith), while preserving the settled functional boundaries.

The experience contract remains governed by:

- the Experience Constitution;
- the Experience Decision Registry;
- the Integrated Experience Work Contract;
- the repository engineering constitution;
- the canonical execution evidence attached to the reconciled implementation stream.

No post-129 architecture task may silently redefine those approved UX decisions.

## 5. Post-129 architecture finding

The next problem is not a request for another isolated API layer or another UI repair stream.

The repository already contains substantial domain logic, authorization, RLS, PostgreSQL functions, triggers, scheduled automation, event-like records, and transport routes. The structural gap is that these capabilities are not governed by one sufficiently explicit execution architecture.

The target is therefore:

**Unified Execution Architecture**

```text
CORE SYSTEM
│
├── Independent Business Domains
│   ├── own canonical entities
│   ├── own lifecycle rules
│   ├── own mutation boundaries
│   └── expose explicit integration contracts
│
├── Workflow + Event Coordination
│   ├── domain events
│   ├── handlers
│   ├── operational work
│   ├── notifications
│   └── scheduled automation
│
├── Ingress Boundaries
│   ├── Web UI
│   ├── API routes
│   ├── Server Actions
│   └── authenticated integrations
│
├── Egress Boundaries
│   ├── Webhooks
│   ├── notifications
│   ├── external integrations
│   └── future platform adapters
│
└── Canonical Data + Security
    ├── Supabase/PostgreSQL
    ├── tenant integrity
    ├── RLS
    ├── permission engine
    └── audit/history
```

## 6. Required post-129 work order

The execution order is fixed unless a new evidence-based blocker changes it:

1. **Canonical State Reconciliation** — repository, migrations, live database, documentation, and execution branches.
2. **Domain Boundary Audit** — identify each domain's canonical entities, lifecycle, mutation boundary, and external dependencies.
3. **Business Rule Ownership Map** — identify where each important rule currently lives: TypeScript, PostgreSQL function, trigger, cron, RLS, or UI.
4. **Workflow + Event Model** — define explicit event/action/task/history/audit distinctions and handler ownership without introducing a duplicate engine prematurely.
5. **API Boundary Normalization** — make API routes transport boundaries over authoritative domain/application operations instead of allowing route-specific business mutation.
6. **Cross-Domain Integration Hardening** — enforce tenant integrity, relationship invariants, event handoff, and idempotency where required.
7. **Subscription / Entitlement / License Completion** — reconcile the existing subscription ceiling and entitlement foundations with the four-layer license architecture.
8. **Medical Master / Service Catalog completion** — reconcile specialty, procedure, service, and service-procedure architecture with existing clinical flows.
9. **System-wide verification** — contract tests, typecheck/lint/build, domain integration, tenant isolation, authorization, and real workflow verification.
10. **Production hardening** — migration ledger reconciliation, advisor findings, observability, deployment proof, and production closure.

## 7. Rules for all post-129 implementation

- Inspect before creating.
- Reuse before extending.
- Extend before creating a new engine.
- Domain ownership must remain explicit.
- Cross-domain workflows must not transfer ownership of another domain's entity.
- UI visibility is not authorization.
- Workspace is not a security boundary.
- Permission is not entitlement.
- Subscription tier is not the complete license model.
- Calendar is not a second Agenda engine.
- Chat is not a second Communications engine.
- Events, actions, tasks, history, and audit records are not interchangeable.
- Database mutations must have one authoritative business boundary wherever practical.
- No documentation may declare implementation complete without evidence.
- No historical branch may be revived merely because its documentation is easier to find.

## 8. Immediate architectural deliverables

The next execution stream must produce and maintain:

- this canonical-state reconciliation;
- a domain boundary map;
- a business-rule ownership map;
- a workflow/event integration map;
- an API boundary inventory;
- a cross-domain integrity matrix;
- a subscription/entitlement/license reconciliation;
- a medical master/service catalog reconciliation;
- a final verification matrix tied to exact commit SHAs.

These artifacts are architecture controls, not substitutes for implementation or runtime verification.

## 9. Closure condition

Post-129 architecture reconciliation is not considered closed until:

- canonical execution state is unambiguous;
- repository/live migration lineage is reconciled;
- domain ownership is explicit;
- high-risk distributed business rules have owners;
- API mutation boundaries are explicit;
- cross-domain tenant integrity is verified;
- subscription/entitlement/license boundaries are verified;
- medical master/service catalog ownership is verified;
- automated and runtime evidence exists for implemented changes;
- supporting documentation points to the same exact reviewed head.

**Post-129 baseline: ACTIVE — execution continues from `1a1282bcdf59f037c9ef491c51b5425261cd86a9`.**
