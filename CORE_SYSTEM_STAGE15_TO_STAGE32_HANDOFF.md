# CORE SYSTEM

# STAGE 15 → STAGE 32 EXECUTION HANDOFF

**Execution mode:** Continuation from validated Stage 15 baseline. This document is the handoff authority for the execution sequence Stage 16–32 and is intentionally evidence-driven. It does not authorize data cleanup, parallel engines, hard-coded account exceptions, or premature production deployment.

**Prepared:** 2026-09-09

---

## A. Project Context

CORE SYSTEM is a multi-tenant clinic management platform combining clinic operations, medical CRM, patient journey/workspace, agenda, clinical workflow, treatment plans, follow-up, communications, notifications, inventory, procurement, financial operations, analytics/business intelligence, subscription/capability management, roles/permissions, security and tenant isolation.

Primary clinic profiles: dermatology, aesthetic, laser and skin-care clinics.

Architectural principle: **Independent Modules + Integrated Platform**. Domains remain independently bounded but exchange explicit, auditable business events and references.

The Patient Internal Journey is the core operational journey. Super Admin is the platform owner/lessor; Clinic Admin is the tenant administrator.

---

## B. Baseline

### Git

Authoritative pre-execution main baseline:

`cdedb1937edc44bd93dafdceacfa52e70c19bbbb`

Execution branch:

`reconciliation/execution-baseline-20260909`

Branch was verified to be **0 commits behind / 2 commits ahead** of the main baseline, with the two added commits/files being the execution handoff and ledger. Latest known execution HEAD:

`eb57133ad353bcb5f0dbe0a24ad04a7d630e5f50`

The branch HEAD must be re-verified before each consequential write and before merge.

### Supabase

Live project checked during handoff validation:

`qaslsjyxjwvdoiczmhgq`

The live database is treated as **Current Reality + Regression Evidence**. Live schema/data changes are not to be rewritten merely to match historical reports.

### Vercel

Production runtime/deployment state remains an execution item to verify through Stage 30–32 gates. No production deployment is authorized by this handoff before all required gates pass.

---

## C. What Was Investigated

The Stage 15 continuation is based on prior project reconnaissance, current repository documentation, live database evidence and the explicit architecture/operational decisions carried into this prompt. The execution scope covers:

- Architecture and domain boundaries
- Database schema, relationships and integrity
- Application code and existing engines
- Workspace / Patient Flow
- AJM and clinical workflow
- Team & Access / roles / permissions
- Financial
- Inventory
- Procurement
- Agenda / availability
- Workforce
- Follow-up
- Communications
- Notifications
- Analytics
- Subscription
- Security / multi-tenancy / RLS
- UX / IA / runtime behavior
- Scenario / E2E validation
- Stage 15 closure evidence

Current execution must continue from this baseline rather than repeating Stage 0–15 wholesale. Historical findings are evidence only and must be revalidated when their correctness affects a current repair.

---

## D. Architecture Decisions

1. **Subscription defines the Tenant Capability Boundary.** A Tenant can use only the domains/features enabled by its subscription tier.
2. Subscription tiers include Basic, Pro and Full, with future tiers possible.
3. **Full** exposes all platform domains/features available to that Tenant.
4. **Clinic Admin** is the Tenant Administrator and can administer the Tenant within the capability ceiling of that Tenant's subscription. A Clinic Admin under Full may have full administrative access within that Tenant.
5. **Xalkair is not a special account.** `xalkair@gmail.com` must not be used in code as an authorization exception; it is simply a Clinic Admin belonging to a Full-subscription Tenant.
6. The permission decision chain is: Subscription capability → Administrative scope → Role permissions → Direct permissions → Overrides → Effective permissions → Tenant Security / RLS / Authentication.
7. Full subscription never bypasses authentication, RLS, tenant isolation, audit or platform-level security boundaries.
8. Super Admin remains platform owner/lessor, not a clinic user inside a Tenant.
9. Preserve the existing permission engine; repair it instead of introducing a parallel engine.
10. Preserve the existing canonical engines for Inventory, Agenda, Follow-up and Notifications.
11. Golden engineering rule: **Inspect → Reuse → Extend → Integrate → Validate**. Never invent, replace, duplicate or assume when an existing canonical mechanism is capable of the responsibility.
12. Preserve current database evidence. No deletion of E2E/AUDIT/SYNTHETIC records to make counts look clean.
13. Treatment Plans must be proven through actual application E2E; do not manually rebuild existing plans solely to fill empty child tables.
14. Procurement records are not to be edited manually just to hide anomalies; validate the true workflow and repair the actual cause.
15. Analytics snapshots are not to be rebuilt merely for cosmetic consistency; first establish canonical semantic definitions and rebuild only the affected scope when technically/semantically required.
16. Migration reconciliation is deliberately deferred until Stage 28 unless an earlier mismatch is proven to block a safe repair or correct operation.

---

## E. Stage 15 Outcome

Stage 15 established the continuation baseline and the need for an execution-focused sequence rather than another broad discovery pass. The known state entering this handoff includes existing implementations for the major clinic domains, previously reported integrity checks, and explicit decisions correcting the earlier over-broad interpretation of Clinic Admin permissions.

What Stage 15 did **not** prove for this continuation is that every Stage 16–32 gate has already passed. The outstanding work must therefore be executed and evidenced, not inferred from historical closure language.

---

## F. Current Findings

### F1 — Git execution branch

Verified branch exists and is based directly on the specified main baseline, with execution documentation added on top. This is the controlled branch for Stage 16–32 work.

### F2 — Live current-reality drift

A live count comparison performed at handoff time showed current values higher than the historical baseline for at least:

- Patients: 283 vs historical baseline 279
- Clinic visit sessions: 139 vs 138
- Retention follow-ups: 693 vs 690
- Notification queue: 701 vs 696

This is classified as **OBSERVATION / RECONCILIATION REQUIRED**, not data corruption. The source of the deltas must be determined from valid application activity, audit trail, E2E activity or other evidence before any cleanup decision. No records are to be deleted or rewritten to restore historical counts.

### F3 — Inventory canonical-path concern

The continuation specification identifies a legacy `adjust_inventory_stock` path and direct `current_stock` editing as known risk areas. Exact live function signatures/definitions and all callers must be re-established before any repair is committed.

### F4 — Treatment Plan evidence gap

Existing mechanisms for plan items / visits / linking are expected to exist, but execution evidence is incomplete. This is currently **UNRESOLVED — E2E PROOF REQUIRED**, not a confirmed code defect.

### F5 — Other Stage 16–32 domains

Procurement, clinical-to-inventory-to-financial linkage, follow-up, notifications/communications, agenda concurrency, analytics semantic drift, security isolation and migration history require execution-time validation before closure.

---

## G. Corrected Understanding

### Full Subscription

Full is a capability boundary for the Tenant. It permits the Tenant to access all platform domains/features that the platform exposes for that tier.

### Clinic Admin

Clinic Admin is the Tenant Administrator. Under Full Subscription, Clinic Admin may have full administrative access within the Tenant; this is expected behavior, not a defect. Under Basic/Pro, administrative authority cannot escape the subscription boundary.

### Xalkair

The Xalkair account is ordinary Tenant-scoped Clinic Admin behavior. Any implementation that grants access through a named email, fixed user ID or account-specific branch is invalid.

### Clinic Users

Clinic Users inherit permissions from the available Tenant capability set plus their role/direct permissions/overrides. They cannot be delegated a permission outside the subscription boundary.

### Subscription boundary vs permission boundary

Subscription answers **what the Tenant can access**. Permissions answer **what a user inside that Tenant can do**. Both are required for the final effective permission.

---

## H. Data Preservation Decision

Current live records are regression evidence and operational reality. E2E, audit and synthetic records must be preserved during repair. An anomaly must be recorded, traced to its source, repaired at the cause where possible, and only reconciled later under an explicit decision. Data deletion is not a test strategy and must never be used to suppress a failing invariant.

---

## I. Treatment Plan Decision

Do not manually rebuild the existing eight Treatment Plans merely because child evidence is currently sparse or empty. The correct proof is an actual application workflow creating/activating/linking plan items and visits, then advancing through appointment, visit, procedure, inventory and follow-up behavior. Any missing evidence must be traced to the real application path.

---

## J. Procurement Decision

Do not mutate historical purchase-order, receipt or supplier-obligation records simply to make them look consistent. Execute real purchase-order → receipt → inventory → obligation → payment behavior in a safe test context and repair the source logic when a defect is demonstrated.

---

## K. Analytics Decision

Analytics requires semantic unification before numerical rebuilding. A metric such as New Patients must have one canonical definition consumed consistently by snapshot generation, dashboards, reports and analytics queries. Rebuild only the dates/scope affected by a proved semantic or technical change and reconcile the result.

---

## L. Migration Decision

Migration reconciliation is a dedicated Stage 28 activity. Do not alter production schema or migration history merely to make repository files and live history look identical. Differences must be classified, explained and resolved through forward-safe, documented migrations only where a real schema correction is required.

---

## M. Stage 16–32 Plan

1. **Stage 16 — Inventory Canonical Repair:** trace every stock mutation path; enforce one atomic canonical mutation path; prevent direct stock editing; validate permissions, tenancy, negative stock and concurrency.
2. **Stage 17 — Subscription + Permission Repair:** enforce subscription capability boundary, role/direct/override behavior and Full Clinic Admin behavior without account exceptions.
3. **Stage 18 — Treatment Plan E2E:** execute lifecycle and relationship workflows through the application.
4. **Stage 19 — Procurement E2E:** execute PO → receipt → inventory → supplier obligation → payment and reconcile the flow.
5. **Stage 20 — Clinical → Inventory → Financial:** prove patient → appointment → visit → procedure → consumable → stock movement → cost → invoice → payment → analytics traceability.
6. **Stage 21 — Follow-up:** validate rule → schedule → execute → result → next action without inventing a second engine.
7. **Stage 22 — Notification / Communication:** validate business event → trigger → notification/channel/delivery/status plus communication boundaries and integration.
8. **Stage 23 — Agenda Hardening:** validate provider/room/resource/patient conflicts, availability, leave, buffers and DB-level concurrency protection as appropriate.
9. **Stage 24 — Analytics Semantic Unification:** define canonical metrics, unify consumers and perform scoped rebuild/reconciliation only when required.
10. **Stage 25 — Current Reality Regression:** use current real data as a compatibility/regression fixture across all major domains.
11. **Stage 26 — Negative / Security Validation:** authentication, authorization, disabled capability checks and Tenant A→Tenant B isolation at UI/server/RPC/DB/API boundaries.
12. **Stage 27 — Cross-Domain Integrity:** validate ownership, tenant, foreign keys, business rules, status/lifecycle and auditability across all domain links.
13. **Stage 28 — Migration Reconciliation:** compare repository files, live migration history and actual schema; classify every difference and resolve only real forward-safe mismatches.
14. **Stage 29 — Documentation Synchronization:** update authoritative project and domain documents to match final implementation.
15. **Stage 30 — Production Readiness Gate:** final static, test, E2E, security, DB, analytics, Git and runtime readiness checks.
16. **Stage 31 — Main + Production Deployment:** merge validated branch to main and deploy only after all gates pass.
17. **Stage 32 — Production Re-validation:** repeat critical workflows in production, inspect logs and issue final closure verdict.

---

## N. Known Code / DB Objects to Verify

The following are known from the continuation baseline and must be traced rather than assumed:

- Legacy inventory RPC family centered on `adjust_inventory_stock`.
- Inventory item `current_stock` direct mutation risk.
- Existing modern canonical inventory mutation path/RPC (exact name must be discovered from repository + live DB before use).
- Existing permission engine, subscription/capability resolution and effective-permission logic (exact files/functions must be recorded during Stage 17).
- Existing Treatment Plan mechanisms for plan items, visits and linking (exact files/functions must be recorded during Stage 18).
- Existing canonical Agenda, Follow-up and Notification engines.
- Existing analytics snapshot generator and consumers.

No unverified function/file name should be invented in the execution ledger.

---

## O. Known DB Evidence

Historical baseline counts supplied for continuity included:

- patients 279
- master_agenda_events 282
- clinic_visit_sessions 138
- clinic_visit_procedures 138
- clinic_invoices 138
- invoice_items 138
- invoice_payments 82
- inventory_items 17
- inventory_ledger 113
- purchase_orders 6
- purchase_order_items 22
- purchase_receipts 5
- purchase_receipt_items 20
- supplier_obligations 5
- clinic_treatment_plans 8
- clinic_treatment_plan_items 0
- clinic_treatment_plan_visits 0
- clinic_provider_availability 5
- analytics_daily_snapshots 251
- workforce_employees 8
- clinic_users 4
- retention_followups 690
- medical_files 12
- storage locations 3
- communications conversations 6
- communication messages 1
- communication requests 17
- operational work items 17
- notification_queue 696

Current handoff validation identified at least the following changed values:

- patients 283
- clinic_visit_sessions 139
- retention_followups 693
- notification_queue 701

These are evidence, not targets. All major counts and relationships must be re-read as needed during each relevant stage.

Previously reported integrity areas that must be revalidated include appointment/patient/doctor, visit/patient/doctor, invoice/visit/patient, inventory ledger/item, PO/receipt item relationships, follow-up links, cross-tenant relationships, completed appointment ↔ visit linkage, invoice arithmetic, payment totals, procedure relationships and inventory consumption linkage.

---

## P. Known Runtime Evidence

No current production closure claim is made in this handoff.

Repository branch state is verified. Production deployment status, runtime error state and post-deploy critical workflow verification remain Stage 30–32 gates.

---

## Q. Unresolved Items

1. Exact inventory mutation callers and the canonical modern RPC/path still require full repository + DB tracing.
2. Direct writes to `inventory_items.current_stock` must be exhaustively identified and blocked where operationally unsafe.
3. Subscription/permission effective-access behavior for Basic/Pro/Full requires executable proof.
4. Treatment Plan lifecycle requires application-generated E2E evidence.
5. Procurement workflow requires application-generated E2E evidence and reconciliation.
6. Clinical → Inventory → Financial traceability requires end-to-end proof.
7. Follow-up, Notification and Communication integration requires runtime validation.
8. Agenda room/resource/patient concurrency and `buffer_end IS NULL` edge cases require validation.
9. Analytics canonical metric semantics and any affected snapshot scope require proof.
10. Current-reality count drift requires explanation without data cleanup.
11. Migration repository/history/schema reconciliation remains pending for Stage 28.
12. Final production deployment and post-deployment runtime verification are pending.

---

## R. Production Closure Criteria

The final verdict can be **PRODUCTION CLOSED** only when all of the following are evidenced:

- No unresolved architecture conflict affecting production operation.
- No confirmed P0/P1 production defect.
- Basic / Pro / Full subscription behavior validated.
- Subscription boundary + RBAC + direct permissions + overrides validated.
- Full-subscription Clinic Admin behavior validated without special account logic.
- Clinic User delegation respects subscription capability boundary.
- Authentication, RLS and tenant isolation validated.
- Patient Journey and critical clinical workflows validated.
- Treatment Plan full lifecycle E2E validated.
- Inventory uses one atomic canonical mutation path and reconciles with its ledger.
- Procurement PO → Receipt → Inventory → Obligation → Payment validated.
- Financial invoice/payment arithmetic and relationships reconciled.
- Agenda availability/conflict/concurrency behavior validated.
- Follow-up lifecycle validated.
- Notification delivery/integration validated.
- Communication boundaries and integration validated.
- Analytics semantic contract and required numerical reconciliation validated.
- Repository migrations, live migration history and live schema reconciled/classified.
- Documentation matches actual final implementation.
- All intended code/document changes committed, merged correctly and traceable.
- Production deployment succeeds.
- Production runtime critical workflows succeed after deployment.
- Runtime logs show no closure-blocking errors.

If any real blocker remains, final verdict must be:

**NOT CLOSED — BLOCKER**

---

## Execution Discipline

Every finding must be classified, rooted and evidenced. Every repair must be minimal, canonical, safe and followed by TypeScript, lint, build, relevant tests/E2E, DB validation where applicable, tenant/security validation and regression validation. Each logical repair should be a separate commit. No claim of “fixed” is valid without evidence.
