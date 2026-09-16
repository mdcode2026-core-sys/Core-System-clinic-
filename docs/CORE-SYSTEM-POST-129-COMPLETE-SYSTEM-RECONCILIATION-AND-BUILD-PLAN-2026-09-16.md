# CORE SYSTEM — Post-129 Complete System Reconciliation & Build Plan
## System-wide reality map, decision recovery, domain classification, execution architecture, and controlled build sequence

**Date:** 2026-09-16  
**Baseline:** PR #129 canonical head `1a1282bcdf59f037c9ef491c51b5425261cd86a9`  
**Scope:** Entire CORE SYSTEM platform after the Global Experience reconciliation stream  
**Purpose:** Establish a reality-first control map before further feature execution.  
**Status:** OPEN — this document is a reconciliation/build-control baseline, not a claim that the product is complete.

---

## 1. Why this document exists

CORE SYSTEM has accumulated substantial product architecture, database capability, domain logic, UI modules, workflows, permissions, automation, and documentation. The primary problem is no longer simply "missing features".

The larger problem is **execution coherence**:

- implementation has progressed through multiple workstreams;
- some decisions were made during execution but were never formally documented;
- some documented requirements were not implemented or were only partially implemented;
- some work was implemented even though it was not part of the user's current priority;
- some historical documents describe states that are no longer canonical;
- some modules contain real business logic while other modules are still presentation-heavy or incomplete;
- database reality, repository migrations, application code, and documentation have not always remained synchronized;
- a technically sophisticated capability can therefore be mistaken for either a defect or a completed product feature depending on which source is inspected.

This document therefore does **not** assume that every gap discovered by engineering is a product defect.

Instead, every finding must be classified into one of these states:

1. **CONFIRMED IMPLEMENTED** — evidence exists in current repository/live system.
2. **PARTIALLY IMPLEMENTED** — meaningful capability exists but the full intended contract is incomplete.
3. **VERIFICATION REQUIRED** — implementation exists, but current runtime/live evidence is insufficient.
4. **DOCUMENTATION DRIFT** — current code/live state contradicts an older document.
5. **UNDOCUMENTED PRODUCT DECISION POSSIBLE** — engineering evidence suggests a gap, but it may be intentional.
6. **REQUESTED-BUT-NOT-VERIFIED** — the user may previously have requested it, but current repository evidence does not prove execution.
7. **TECHNICAL DEBT / HARDENING** — improvement that does not automatically represent missing product functionality.
8. **FUTURE / DEFERRED** — explicitly intended for a later product phase.
9. **PRODUCT OWNER DECISION REQUIRED** — implementation must not invent the missing product decision.

The critical rule is:

> **Engineering evidence identifies reality. It does not replace Product Owner intent.**

Where evidence and memory/documentation conflict, the conflict itself becomes a work item.

---

# 2. Authority model for all future work

The platform must be governed by five different authorities, each answering a different question.

| Authority | Answers |
|---|---|
| Product decisions / approved ADRs | What CORE SYSTEM is supposed to be |
| Current repository | What code and migrations currently exist |
| Live Supabase | What database/security/automation actually exists now |
| Runtime | What the user can actually experience |
| Execution ledger | What was actually done, when, why, and with what evidence |

No single source is sufficient for every question.

## 2.1 Conflict protocol

When sources disagree:

**A. Record the conflict.**  
**B. Do not silently choose one.**  
**C. Identify whether the conflict is technical, documentation, or product intent.**  
**D. Resolve Product Owner questions explicitly.**  
**E. Update the authoritative document only after resolution.**  
**F. Continue implementation from the reconciled state.**

This prevents a common failure mode where engineering "fixes" something that was actually an intentional product decision.

---

# 3. Current platform reality baseline

The live Supabase project currently exposes:

- **120 public base tables**
- **0 public views**
- **266 public routines/functions**
- **131 public triggers**
- **272 public RLS policies**

This confirms that CORE SYSTEM is already a substantial operational platform, not a simple CRUD application.

The live schema includes major areas for:

- tenants and branches;
- users and permissions;
- agenda and provider availability;
- patients and patient identity/history;
- visit sessions and treatment plans;
- procedures/services/packages/offers;
- communications and chat;
- notifications;
- medical files and AI results;
- follow-up/retention;
- operational work and coordination;
- invoicing, payments, refunds and financial plans;
- insurance;
- inventory, lots and consumption;
- purchasing, receiving, suppliers and obligations;
- workforce, qualifications, skills, schedules and unavailability;
- payroll, benefits, deductions, advances and payslips;
- analytics snapshots;
- subscriptions, entitlements, capabilities and feature flags;
- audit and billing/subscription events.

Therefore the correct post-129 task is not to invent another feature list. It is to **reconcile these existing capabilities into one controlled platform architecture**.

---

# 4. Product architecture target

CORE SYSTEM should be treated as:

```text
CORE SYSTEM
│
├── Experience Layer
│   ├── Login
│   ├── Home
│   ├── Header
│   ├── Sidebar / Navigation
│   ├── Workspace
│   ├── My Workspace
│   └── Responsive / RTL / LTR / Accessibility
│
├── Application / Access Layer
│   ├── Authentication
│   ├── Tenant Resolution
│   ├── Permission Engine
│   ├── Workspace Assignment
│   ├── Entitlement Engine
│   └── Feature Flags
│
├── Domain Layer
│   ├── Patients
│   ├── Agenda
│   ├── Visit / Queue / Patient Flow
│   ├── Treatment Plans
│   ├── Procedures / Services / Packages
│   ├── Medical Files
│   ├── Follow-up
│   ├── Communications
│   ├── Notifications
│   ├── Workforce
│   ├── Financial Resources
│   ├── Inventory / Procurement
│   ├── Insurance
│   ├── Analytics / Reports
│   ├── Subscriptions / Entitlements
│   └── Coordination / Operational Work
│
├── Workflow & Event Layer
│   ├── Domain Events
│   ├── Workflow transitions
│   ├── Operational Work
│   ├── Notifications
│   ├── Audit
│   └── Scheduled automation
│
├── Transport / Integration Layer
│   ├── Server Actions
│   ├── API Routes
│   ├── Realtime
│   ├── Future Webhooks
│   └── Future external integrations
│
└── Data / Security Layer
    ├── PostgreSQL
    ├── RLS
    ├── RPCs
    ├── Triggers
    ├── Storage
    └── Migration lineage
```

This is the architecture that future work should converge toward.

---

# 5. Domain-by-domain reality and build plan

## 5.1 Tenant / Clinic / Branch domain

### Current reality

Confirmed core entities include:

- `master_tenants`
- `branches`
- `clinic_users`
- tenant-related subscription and entitlement structures

ADR-000 establishes `master_tenants` and `clinic_users` as the active tenant/user model and explicitly warns against resurrecting the old `tenants`/`users` path.

ADR-004 establishes branch-ready architecture through a `branches` foundation while leaving most operational tables tenant-scoped until true multi-branch execution is implemented.

### Classification

**Confirmed implemented:** tenant and branch foundation.  
**Partial:** true operational multi-branch behavior.  
**Future:** branch-level operational isolation where product requirements demand it.  
**Verification:** signup, default branch creation, tenant lifecycle and branch behavior must be runtime-verified before further extension.

### Build plan

1. Establish one canonical tenant resolver.
2. Establish one canonical branch resolver when branch context becomes active.
3. Define exactly which domains are tenant-scoped vs branch-scoped.
4. Do not add `branch_id` indiscriminately.
5. Add branch scoping only through an explicit domain-by-domain decision.
6. Preserve single-branch clinics as the default path.

---

# 5.2 Identity / Authentication domain

### Current reality

The repository contains:

- Auth Provider
- Auth Context
- auth actions
- tenant resolution
- login/register/reset/activate routes
- Supabase auth infrastructure

### Required architecture

Authentication answers **who are you?**

It must not directly answer:

- what modules you can use;
- what workspace you belong to;
- what data you can see;
- what actions you can perform.

Those belong to authorization, workspace assignment, RLS and entitlements.

### Build plan

- verify authentication lifecycle;
- verify registration against current tenant model;
- verify session persistence;
- verify tenant resolution;
- verify logout and reset;
- verify protected route behavior;
- document any intentional registration limitations.

---

# 5.3 Users / Roles / Permissions domain

### Current reality

The system contains:

- `roles`
- `permissions`
- `role_permissions`
- `clinic_user_permissions`
- `clinic_user_permission_overrides`
- permission bundles/templates
- application permission engine
- effective permission functions
- RLS authorization

ADR-001 establishes an additive permission architecture rather than replacing the existing RLS model in one risky rewrite.

### Important reconciliation point

The existence of a sophisticated permission engine does not prove that every surface consumes it consistently.

The target model is:

```text
User
  ↓
Role / Template
  ↓
Effective Permissions
  ↓
Workspace / Surface Visibility
  ↓
Domain Action Authorization
  ↓
RLS / Database Enforcement
```

Visibility must never be treated as authorization.

### Build plan

1. Inventory every permission key.
2. Map every module action to permission requirements.
3. Map every UI visibility rule to permission/entitlement logic.
4. Map every Server Action/API route to authorization.
5. Map database RLS independently.
6. Detect authorization paths that rely only on UI hiding.
7. Detect hardcoded role checks that should remain intentionally legacy vs those that must migrate.
8. Resolve `clinic_owner` status explicitly rather than assuming historical intent.
9. Resolve unsupported/legacy role values explicitly.
10. Produce a single effective-permission matrix.

---

# 5.4 Workspace / Navigation / Experience domain

### Current reality

The repository contains dedicated workspace engines, workspace registries, widget catalogs, workspace assignment and global presentation components.

The approved experience architecture establishes:

- Home ≠ Workspace
- My Workspace ≠ Role
- Workspace ≠ Security Boundary
- Widget ≠ Permission
- Visibility ≠ Authorization

### Build plan

The experience layer should now be treated as infrastructure, not as a sequence of isolated UI fixes.

For every surface:

1. identify user purpose;
2. identify domain ownership;
3. identify data source;
4. identify action source;
5. identify authorization source;
6. identify entitlement source;
7. identify routing/context rules;
8. identify responsive composition;
9. identify RTL/LTR behavior;
10. identify accessibility contract;
11. verify runtime.

No new dashboard/card/workspace surface should be created simply because a domain has data.

---

# 5.5 Patients domain

### Current reality

Entities include:

- `clinic_patients`
- patient identities
- clinic relationships
- patient history
- insurance profiles
- patient packages
- package consumption

The domain layer already contains patient actions, queries, authorization and types.

### Architecture target

Patients is the canonical patient identity and clinic relationship domain.

Other domains reference the patient; they do not recreate patient identity.

### Build plan

- canonical patient identity rules;
- duplicate detection;
- clinic relationship rules;
- patient lifecycle;
- patient search;
- patient context loading;
- patient-to-appointment relationship;
- patient-to-visit relationship;
- patient-to-treatment-plan relationship;
- patient-to-financial relationship;
- patient-to-follow-up relationship;
- patient-to-portal relationship.

Any second patient engine discovered during audit must be classified as reuse, adapter, legacy, or defect before removal.

---

# 5.6 Agenda / Scheduling domain

### Current reality

The domain already contains:

- agenda actions;
- agenda queries;
- mutation service;
- availability engine;
- conflict engine;
- resource requirements;
- provider availability;
- `master_agenda_events`.

The approved architecture states that Agenda is authoritative and Calendar is a representation, not a second scheduling engine.

### Build plan

Agenda must become the single scheduling authority for:

- appointments;
- provider availability;
- rooms/resources;
- conflicts;
- cancellation;
- rescheduling;
- no-show;
- context-preserving navigation;
- future branch/resource scheduling.

All alternate scheduling logic must be audited and either:

- reused as an adapter;
- merged into Agenda;
- retained as a read-only representation;
- or explicitly classified as legacy.

---

# 5.7 Queue / Visit / Patient Flow

### Current reality

The repository contains Queue Engine, Queue Actions, Queue Queries, Visit Actions and Patient Flow UI.

The established visit lifecycle is:

```text
Queue
→ Clinical Visit
→ Pending Close
→ Reception Workflow
→ Completed
```

Reception owns the final drag/drop workflow.

### Build plan

Define ownership explicitly:

- Queue owns ordering and waiting state.
- Clinical Visit owns medical interaction.
- Visit owns clinical session state.
- Reception owns operational completion transition.
- Patient Flow is a workflow concept/presentation, not a new domain database engine.

Verify all transitions, authorization, audit and cross-domain effects.

---

# 5.8 Treatment Plans

### Current reality

Treatment Plan tables and domain actions exist.

### Product rule

Treatment Plan is not required for every visit.

It is a longitudinal clinical planning construct.

### Build plan

- plan lifecycle;
- procedure/item relationships;
- visit/session relationships;
- next action generation;
- appointment linkage;
- financial linkage where applicable;
- package linkage where applicable;
- audit/history;
- permissions;
- no accidental requirement that every clinical visit creates a plan.

---

# 5.9 Procedures / Services / Packages / Offers

### Current reality

Live schema already contains:

- `clinic_procedures`
- `clinic_services`
- `clinic_service_procedures`
- packages and package items;
- offers;
- visit procedures;
- treatment-plan procedures.

This is important: current live schema is more advanced than the historical ADR description alone suggests.

### Required reconciliation

ADR-005 requires the distinction:

```text
Medical Specialty
       ↓
Master Procedure
       ↓
Clinic Procedure Customization
       ↓
Service
       ↓
Package / Offer
```

Because live tables now include clinic services and service-procedure relationships, the next task is **not automatically to create them again**.

The correct task is to determine whether the live schema already represents the approved ADR partially or fully, and then close only the missing pieces.

### Build plan

- master medical specialty library;
- master procedure library;
- specialty ↔ procedure mapping;
- clinic customization layer;
- service catalog;
- service ↔ procedure mapping;
- package layer;
- commercial offers;
- procedure eligibility;
- workforce skill/qualification compatibility;
- inventory consumption;
- billing;
- analytics.

This domain is a major cross-domain dependency and should be reconciled before new clinical/commercial features are built on top of it.

---

# 5.10 Medical Files

### Current reality

The system contains:

- medical files;
- storage locations;
- annotations;
- measurements;
- AI results;
- synchronization events;
- patient portal release capability;
- an agent API surface.

### Build plan

Medical Files should be treated as a canonical medical-document domain, not a generic upload component.

Required ownership:

- file metadata;
- storage location;
- clinical relationship;
- annotations;
- measurements;
- AI analysis;
- release/portal permissions;
- audit;
- synchronization.

AI results must remain subordinate to the medical-file record and must never silently become authoritative clinical facts.

---

# 5.11 Follow-up / Retention / Automation

### Current reality

Entities include:

- follow-up automation rules;
- retention follow-ups;
- notification queue;
- operational work items;
- communications integration;
- scheduled automation.

### Target workflow

```text
Clinical/Business Event
        ↓
Follow-up Rule
        ↓
Follow-up Instance
        ↓
Communication / Notification
        ↓
Operational Work if required
        ↓
Completion / Audit
```

### Build plan

- event source registry;
- rule evaluation;
- idempotency;
- scheduling;
- retry/failure state;
- communication routing;
- work creation;
- completion;
- audit;
- tenant isolation.

No second follow-up engine should be created.

---

# 5.12 Communications / Chat

### Current reality

Communications is clinic-wide and is not a doctor-only subsystem.

Live schema includes:

- conversations;
- participants;
- messages;
- attachments;
- reads;
- communication requests;
- templates.

Chat is a compact presentation over Communications, not an independent communication domain.

### Build plan

```text
Communications Domain
├── Conversation
├── Participants
├── Messages
├── Attachments
├── Read State
├── Requests
└── Templates
       ↑
Chat Presentation Layer
```

The engineering contract must preserve this ownership.

Future external messaging providers must integrate at the Communications boundary rather than creating another internal message store.

---

# 5.13 Notifications

Notifications are distinct from Communications.

### Build plan

Separate:

- event generation;
- notification creation;
- destination selection;
- user read state;
- delivery state;
- communication delivery where applicable.

Do not turn Notifications into Chat and do not turn Communications into a generic notification queue.

---

# 5.14 Operational Work / Journey Coordination

### Current reality

The system contains:

- `operational_work_items`
- `operational_work_history`
- domain-event/work actions
- cross-domain triggers
- completion flows.

### Target architecture

Operational Work is the execution layer for cross-domain work that needs an authorized human or process to complete something.

It is not the owner of the original business entity.

Example:

```text
Invoice / Follow-up / Procurement / Clinical Event
                     ↓
              Domain Event
                     ↓
             Operational Work
                     ↓
             Authorized Actor
                     ↓
                 Completion
                     ↓
                  Audit
```

This distinction is essential for avoiding domain ownership leakage.

---

# 5.15 Financial Resources / Invoicing

### Current reality

Live schema contains:

- clinic invoices;
- invoice items;
- payments;
- refunds;
- financial plans;
- installments;
- operating expenses;
- supplier bills;
- supplier obligations;
- supplier payments;
- insurance claims/contracts/providers;
- commercial sale infrastructure.

The domain layer also contains financial actions and workflow actions.

### Target architecture

Financial Resources is a domain family, not one giant transaction table.

Recommended internal boundaries:

```text
Commercial
├── Offers / Services / Packages
└── Sales

Receivables
├── Invoices
├── Payments
├── Refunds
└── Financial Plans / Installments

Payables
├── Supplier Bills
├── Obligations
└── Supplier Payments

Expenses
└── Operating Expenses

Insurance
├── Contracts
├── Claims
└── Reconciliation
```

### Build plan

Every mutation must have one canonical mutation boundary and one source of truth.

Cross-domain relationships must be explicit.

---

# 5.16 Inventory / Procurement

### Current reality

Live schema contains:

- inventory items;
- inventory ledger;
- lots;
- consumption;
- purchase orders;
- purchase order items;
- purchase receipts;
- receipt items;
- suppliers;
- supplier bills/obligations/payments.

### Target workflow

```text
Need
→ Purchase Order
→ Receipt
→ Lot / Stock
→ Inventory Ledger
→ Consumption
→ Financial Obligation
→ Payment
```

### Build plan

- canonical stock movement;
- lot tracking;
- receipt integrity;
- supplier obligation synchronization;
- payment synchronization;
- procedure consumption;
- idempotency;
- tenant integrity;
- audit.

Inventory must never maintain a parallel financial obligation engine.

---

# 5.17 Workforce

### Current reality

Workforce is one of the largest existing domain families, including:

- employees;
- employment records;
- positions;
- candidates;
- skills;
- qualifications;
- employee skills/qualifications;
- procedure capabilities;
- staff schedules;
- staffing needs;
- leave types/requests;
- unavailability;
- attendance;
- advances;
- benefits;
- commissions;
- payroll entries;
- payroll periods;
- payslips;
- earnings/deductions;
- country rules.

### Target architecture

Workforce is not merely HR CRUD.

It feeds operational capability and scheduling:

```text
Employee
 ↓
Employment
 ↓
Skills / Qualifications
 ↓
Procedure Capability
 ↓
Availability / Schedule / Unavailability
 ↓
Agenda Eligibility
 ↓
Operational Execution
 ↓
Attendance / Commission / Payroll
```

### Build plan

The key reconciliation is to verify that procedure eligibility, workforce capability, provider availability and Agenda conflict rules all use compatible sources.

---

# 5.18 Analytics

### Current reality

Analytics has:

- analytics domain actions;
- analytics engine;
- KPI definitions;
- KPI registry;
- daily snapshots;
- feature/UI surfaces.

### Architecture rule

Analytics is a read/interpretation layer over authoritative domain data.

It must not become a second source of truth.

### Build plan

For every KPI:

1. define source entity;
2. define source lifecycle;
3. define tenant filter;
4. define date/time semantics;
5. define inclusion/exclusion rules;
6. define cancelled/rescheduled/no-show behavior;
7. define business vs clinical classification;
8. define snapshot vs real-time calculation;
9. define auditability.

---

# 5.19 Reports

ADR-007 explicitly separates Reports from the Analytics/BI engine.

Reports are a unified viewer over predefined reports.

Therefore:

```text
Domain Data
   ↓
Analytics / Query / KPI
   ↓
Report Definition
   ↓
Unified Report Viewer
```

No separate reporting database engine should be created unless explicitly approved.

---

# 5.20 Subscription / Entitlement / License

This is a major architectural dependency.

ADR-003 establishes:

```text
Base Plan
 + Add-ons
 + Resource Limits
 + Feature Flags
        ↓
License Engine
        ↓
Capability Access
```

ADR-006 states that every module is licensable and permission-controlled.

### Current reality

The repository/live schema already has:

- subscription plans;
- subscriptions;
- subscription events;
- capabilities;
- entitlements;
- tenant entitlements;
- entitlement capabilities;
- feature flags;
- entitlement engine.

This means the architecture has materially progressed beyond the earliest ADR snapshot.

### Required reconciliation

Before creating anything new:

- compare current schema to ADR-003;
- identify which license concepts now exist;
- identify which are only partially wired;
- identify actual runtime checks;
- identify legacy `subscription_tier` dependencies;
- identify modules still using direct tier checks;
- identify missing resource consumption enforcement;
- identify lifecycle enforcement.

Only then decide what is actually missing.

---

# 5.21 Audit

Audit is not a decorative activity log.

It must answer:

- who acted;
- what entity changed;
- what action occurred;
- when;
- tenant context;
- relevant before/after state where appropriate;
- originating workflow/event;
- authorized actor.

Administrative Intervention must never become an invisible mutation.

---

# 6. Workflow architecture

CORE SYSTEM already contains workflow logic, but it is distributed across:

- TypeScript domain actions;
- mutation services;
- PostgreSQL RPCs;
- triggers;
- scheduled jobs;
- notification queue;
- operational work items;
- RLS;
- realtime.

The solution is **not** to move all logic into one giant Workflow Engine.

Instead create a **Workflow & Event Governance Layer** with explicit ownership.

## 6.1 Workflow categories

### A. Domain lifecycle workflows
Owned by the domain.

Examples:

- appointment lifecycle;
- invoice lifecycle;
- treatment-plan lifecycle;
- purchase receipt lifecycle;
- payroll lifecycle.

### B. Cross-domain workflows
Coordinate domains without taking ownership away from them.

Examples:

- completed visit → follow-up;
- procedure → inventory consumption;
- received purchase → supplier obligation;
- collected payment → commission;
- workforce unavailability → Agenda eligibility.

### C. Human operational workflows
Represent work that an authorized actor must complete.

### D. Scheduled automation
Cron-driven rule execution.

### E. External integration workflows
Future webhook/API/provider synchronization.

---

# 7. Event architecture

The platform already has event-like structures such as:

- subscription events;
- billing events;
- medical-file sync events;
- notification queue;
- operational work;
- domain-event/work coordination.

The next step is to establish a **canonical event contract**, not necessarily a centralized message broker.

Every event should define:

```text
Event ID
Event Type
Tenant ID
Domain
Entity Type
Entity ID
Occurred At
Actor
Correlation ID
Payload Version
Idempotency Key
```

Handlers must be explicit and idempotent.

---

# 8. Webhook architecture

There is currently no evidence that CORE SYSTEM has a general-purpose Webhook Platform comparable to a mature external integration product.

This should **not automatically be classified as a defect**.

A webhook platform becomes necessary when CORE SYSTEM begins supporting external systems that require:

- outbound event delivery;
- inbound event reception;
- signature validation;
- retry;
- dead-letter handling;
- endpoint management;
- delivery logs;
- idempotency;
- replay;
- versioned event contracts.

### Future architecture

```text
CORE Domain Event
       ↓
Integration Event
       ↓
Webhook Dispatcher
       ↓
Endpoint
       ↓
Delivery Attempt
       ↓
Retry / Failure / Replay
```

Inbound:

```text
External Provider
       ↓
Webhook Gateway
       ↓
Signature Verification
       ↓
Idempotency
       ↓
Integration Event
       ↓
Domain Handler
```

Until external integration requirements are confirmed, this remains an architectural preparation item rather than an automatic implementation blocker.

---

# 9. API architecture

Current repository evidence shows a mixed API model:

- some routes already call domain mutation services;
- some routes call domain queries;
- some routes contain direct database interaction;
- Server Actions also exist.

The target is:

```text
UI / External Consumer
        ↓
Transport Boundary
        ↓
Application / Domain Service
        ↓
Domain Rules
        ↓
Supabase / RPC / Transaction
```

## API rules

1. API routes do not own business rules.
2. API routes validate transport input.
3. Domain services validate business invariants.
4. Authorization occurs before mutation.
5. Tenant context is resolved centrally.
6. API responses use stable contracts.
7. Idempotent operations use explicit idempotency rules.
8. No endpoint creates a second domain engine.
9. Server Actions and API Routes must call the same canonical domain capability when they represent the same operation.
10. External APIs should be treated as adapters around internal domain contracts.

---

# 10. Business logic ownership

This is one of the most important post-129 workstreams.

For every business rule we will classify its current owner:

| Rule location | Acceptable role |
|---|---|
| Domain action/service | Primary application business rule |
| Pure domain engine/calculator | Deterministic business calculation |
| PostgreSQL function/RPC | Transactional/integrity-critical operation |
| Trigger | Invariant or automatic side effect that must be DB-enforced |
| RLS policy | Data access security boundary |
| UI component | Presentation only, except local interaction state |
| API route | Transport validation only |
| Cron | Scheduling/automation trigger, not hidden business ownership |

A rule duplicated in multiple places becomes a reconciliation candidate.

---

# 11. Cross-domain integrity map

Every cross-domain relationship must be documented as one of:

- reference;
- command;
- domain event;
- workflow handoff;
- read model/query;
- authorization dependency;
- financial dependency;
- audit relationship.

Examples:

```text
Patient → Appointment       reference
Appointment → Visit         lifecycle relationship
Visit → Treatment Plan     optional relationship
Visit → Follow-up          event/workflow
Procedure → Inventory      consumption event/command
Payment → Commission       financial event
Workforce → Agenda         availability constraint
Follow-up → Communications delivery/workflow
Domain Event → Work        coordination
```

This prevents accidental ownership transfer between modules.

---

# 12. Documentation reconciliation program

Documentation must be treated as a controlled system, not a collection of notes.

## 12.1 Every document gets one status

- CURRENT AUTHORITY
- ACTIVE CONTRACT
- ACTIVE PLAN
- HISTORICAL HANDOFF
- SUPERSEDED
- ARCHIVED
- REQUIRES RECONCILIATION

## 12.2 Every implementation item gets traceability

```text
Product Decision
 ↓
ADR / Contract
 ↓
Execution Item
 ↓
Branch / PR
 ↓
Commit
 ↓
Files
 ↓
Runtime Evidence
 ↓
Database Evidence
 ↓
Closure Record
```

## 12.3 Requested-but-not-executed register

A new explicit register is required for requests that were:

- requested;
- acknowledged;
- planned;
- implemented;
- partially implemented;
- not implemented;
- intentionally deferred;
- superseded;
- or unresolved.

This directly addresses the recurring problem where a requested change exists in conversation history but never entered the repository execution record.

---

# 13. Product Owner decision recovery

This is mandatory because undocumented decisions may currently be hiding inside apparent technical gaps.

For every major gap, create a decision record with:

```text
Finding
Evidence
Why engineering thinks it matters
Possible intentional reason
Current user/product impact
Dependencies
Decision needed
Decision owner
Decision
Date
Implementation consequence
```

Engineering must never convert "I cannot find the implementation" into "the product must need this".

---

# 14. Complete execution program

The post-129 program should proceed in controlled waves.

## Wave 0 — Canonical state lock

Deliver:

- canonical branch/head;
- branch map;
- document authority map;
- current architecture baseline;
- current live database baseline;
- open decision register.

No product changes.

## Wave 1 — Product decision recovery

Deliver:

- undocumented-decision register;
- requested-but-not-executed register;
- intentional-deferral register;
- superseded-work register.

No speculative implementation.

## Wave 2 — Domain ownership map

For every domain:

- entity ownership;
- lifecycle ownership;
- actions;
- queries;
- mutation boundary;
- security boundary;
- integration boundary;
- events;
- workflows;
- UI surfaces;
- API surfaces;
- database objects.

## Wave 3 — Business-rule ownership

Build a rule-by-rule map and eliminate accidental duplication.

## Wave 4 — Workflow/Event architecture

Formalize event types, handlers, operational work, scheduled automation and audit relationships.

## Wave 5 — API normalization

Normalize API/Server Action boundaries without creating a new framework.

## Wave 6 — Cross-domain integrity

Validate tenant integrity, lifecycle consistency, idempotency, ownership and event/work relationships.

## Wave 7 — Access / Entitlement / License

Reconcile ADR-001, ADR-003 and ADR-006 against current live implementation before adding missing enforcement.

## Wave 8 — Medical Master / Service Catalog

Reconcile current procedure/service/package implementation against ADR-005.

## Wave 9 — Operational integration

Validate Workforce → Availability → Agenda → Visit → Follow-up → Communications → Financial → Inventory relationships.

## Wave 10 — Analytics / Reports

Reconcile KPI ownership, snapshot rules, business/clinical separation and report definitions.

## Wave 11 — External integration architecture

Only where justified by product requirements:

- API public surface;
- webhook gateway;
- outbound webhooks;
- provider integrations;
- integration audit/retry/replay.

## Wave 12 — Full verification

Run:

- static checks;
- typecheck;
- lint;
- build;
- database integrity;
- authorization runtime;
- cross-domain runtime;
- authenticated route E2E;
- real-world clinic journeys;
- responsive runtime;
- RTL/LTR;
- accessibility;
- PWA/touch;
- production runtime verification.

## Wave 13 — Closure

A workstream closes only when:

- implementation is verified;
- product intent is confirmed;
- database is verified;
- runtime is verified;
- documentation is reconciled;
- exact head is recorded;
- no unresolved contradiction remains.

---

# 15. Priority rule for the whole program

Priority must not be determined by engineering excitement, architectural elegance, or the size of a gap.

Priority is determined by:

```text
Product Owner intent
        +
Dependency impact
        +
User/business impact
        +
Security/data integrity
        +
Execution blocking impact
        +
Verification confidence
```

A large technical gap can therefore be deliberately deferred.

A small undocumented routing or ownership issue can be critical if it blocks the intended product experience.

---

# 16. Definition of "ready to build"

No new implementation wave should begin until its target has:

- confirmed product purpose;
- domain owner;
- source of truth;
- dependencies;
- permissions;
- entitlement requirements;
- API boundary;
- workflow impact;
- event impact;
- audit requirements;
- database impact;
- runtime verification plan;
- documentation destination.

---

# 17. Definition of "done"

Done means:

> The requested product behavior exists in the intended location, uses the intended architecture, preserves existing authoritative behavior, is verified against the live system, and is documented with enough evidence that another engineer cannot accidentally recreate or contradict it.

A green build alone is not done.

A database migration alone is not done.

A UI screenshot alone is not done.

A document saying "complete" is not done.

---

# 18. Immediate next controlled work

The next implementation activity after this reconciliation is **not a random feature**.

It is:

1. produce the complete Product Decision Recovery Register;
2. produce the Domain Ownership Matrix;
3. produce the Business Rule Ownership Matrix;
4. produce the Workflow/Event Registry;
5. produce the API Boundary Matrix;
6. reconcile current live Supabase objects against repository migrations;
7. reconcile each module against ADR-003/005/006 and newer approved decisions;
8. identify only the gaps that remain after Product Owner intent is recovered;
9. convert those confirmed gaps into isolated execution streams.

This sequence is deliberately designed to stop the previous failure mode where implementation itself creates the next layer of documentation and architectural confusion.

---

# 19. Final operating principle

CORE SYSTEM should not be rebuilt because it is "wrong".

It should be **reconciled because it is large**.

The existing implementation contains substantial value and must be preserved wherever it is authoritative and correct.

The objective is:

```text
Existing Reality
      ↓
Evidence
      ↓
Product Intent Recovery
      ↓
Canonical Architecture
      ↓
Ownership
      ↓
Controlled Execution
      ↓
Verification
      ↓
Documented Closure
```

The governing engineering principle for the post-129 program is therefore:

> **Do not redesign what is already correct. Do not preserve what is only accidental. Do not implement what has not been decided. Do not declare complete what has not been verified.**

---

## Appendix A — Current live domain families observed

The current live schema confirms the existence of the following major families:

- Tenant / Branch
- Users / Roles / Permissions / Overrides / Templates / Bundles
- User Settings / System Preferences
- Agenda / Provider Availability / Resources / Rooms
- Patients / Identity / Relationships / History / Insurance
- Visit / Queue / Treatment Plan / Treatment Plan Visits / Procedures
- Procedure / Service / Service-Procedure / Package / Offer
- Medical Files / Storage / AI / Measurements / Annotations / Sync
- Follow-up / Retention / Automation
- Communications / Chat / Requests / Templates / Attachments / Reads
- Notifications / Queue / Read Receipts / Preferences
- Operational Work / History / Coordination
- Financial Plans / Installments / Invoices / Items / Payments / Refunds
- Insurance / Claims / Contracts / Providers
- Expenses
- Inventory / Lots / Ledger / Consumption
- Procurement / Purchase Orders / Receipts / Suppliers
- Supplier Bills / Obligations / Payments
- Workforce / Employees / Employment / Positions / Candidates
- Workforce Skills / Qualifications / Procedure Capabilities
- Workforce Schedules / Staffing / Leave / Unavailability / Attendance
- Workforce Commission / Payroll / Earnings / Deductions / Benefits / Advances / Payslips
- Analytics / Daily Snapshots
- Subscription / Plans / Events / Entitlements / Capabilities / Tenant Entitlements
- Feature Flags
- Audit

This appendix is an inventory baseline, not a claim that every family is fully production-complete.

## Appendix B — Non-negotiable reconciliation rule

If future investigation finds that a capability marked here as partial was intentionally deferred by the Product Owner, the classification must be changed to **INTENTIONALLY DEFERRED**, with the decision recorded.

If future investigation finds that a capability marked as missing was actually implemented under another name or boundary, the classification must be changed to **IMPLEMENTED / RECONCILED**, not duplicated.

If a user request is discovered that has no implementation evidence, it must be recorded as **REQUESTED-BUT-NOT-VERIFIED** until repository/runtime evidence proves execution.

This is the mechanism that converts CORE SYSTEM from a large accumulation of work into a controlled, auditable product engineering system.
