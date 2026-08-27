# CORE SYSTEM — Administrative & Journey Management Master Blueprint

**Status:** Final master architectural and engineering reconciliation reference — pre-implementation execution planning
**Purpose:** Governing synthesis of the six reconciled administrative/operational domains and their integration with the existing CORE SYSTEM and Patient Journey (PJ).
**Scope:** Tenant / Clinic platform architecture; excludes the separate Super Admin / platform-governance product except where its outputs or future integration are explicitly noted.
**Authority:** This document governs cross-domain architecture, boundaries, priorities and execution sequencing. Domain-specific blueprints remain authoritative for the detailed contract of each domain. A later explicit architectural decision supersedes this document only where it clearly states the superseding decision.

---

## 1. Executive conclusion

The reconciliation phase establishes a **simple-to-use, deeply capable operating architecture** rather than six independent products.

The target is:

```text
Simple user experience
        ↓
Strong domain ownership
        ↓
Explicit integration
        ↓
Structured operational data
        ↓
Insights / reporting
        ↓
Future automation and AI
```

The six domains are complementary:

1. **Financial & Resources** — money, resources and resource-linked operational records.
2. **Team & Access** — users, roles, permissions, templates, overrides and user settings.
3. **Workforce & Operations** — staff/work reality, availability, scheduling, capacity and productivity.
4. **Insights** — interpretation of operational data into useful insight.
5. **Communications** — internal and patient-facing communication and notification capabilities.
6. **Journey Coordination** — clinic-wide work coordination across domains.

These domains must remain **independently owned and understandable**, while being tightly integrated through explicit events, references, actions and shared identifiers where appropriate.

They do not replace PJ. They provide the administrative and operational infrastructure that allows PJ to be executed reliably.

---

# 2. Architectural principles

## 2.1 Independent Modules + Integrated Platform

Each domain owns its own business logic and authoritative records.

Integration occurs through explicit relationships rather than by merging domain responsibilities.

```text
Domain A
   │
   │ event / request / reference
   ▼
Domain B
```

Avoid:

```text
Domain A secretly owns part of Domain B
```

## 2.2 Simple surface, deeper background

CORE SYSTEM should expose only the complexity a user needs for the immediate decision or action.

The platform should nevertheless collect structured data from day one when doing so is justified, because those data become valuable for:

- operational management;
- KPIs;
- reporting;
- benchmarking;
- automation;
- future AI agents;
- tenant coaching and support.

## 2.3 Clinic autonomy

The Clinic Admin is the primary operational authority for the tenant.

CORE supplies capabilities and guardrails; the clinic decides how to organize its people and work within those capabilities.

This is particularly important for Team & Access: the platform must accommodate both a one-doctor/one-receptionist clinic and a larger clinic with combined or unusual responsibilities.

## 2.4 Authorization is not organization

```text
Role       = organizational label
Permission = authorization
Workspace  = working environment / UX organization
Skill      = capability or qualification
```

These concepts must not be collapsed into one another.

## 2.5 Data collection is not entitlement

A tenant may receive a limited user-facing product capability while CORE still records the underlying structured operational facts when architecturally and legally appropriate.

This supports future product decisions, analytics and AI without pretending that an unconfigured advanced feature is already fully operational.

## 2.6 Controls are non-negotiable

Flexibility never overrides:

- tenant isolation;
- authorization enforcement;
- auditability;
- patient privacy;
- clinical safety;
- financial controls;
- legal/compliance obligations;
- separation of duties where required.

---

# 3. Domain map

| Domain | Primary responsibility | Detailed governing document |
|---|---|---|
| Financial & Resources | Billing, payments, inventory, purchasing, suppliers and resource/financial data | `docs/CLINIC-OPERATIONS-WORKFORCE-FINANCIAL-INTEGRATION-REFERENCE.md` and the Financial & Resources domain specification produced during reconciliation |
| Team & Access | Users, roles, permissions, templates, bundles, overrides, settings, access explanation | `docs/TEAM-ACCESS-ENGINEERING-BLUEPRINT.md` |
| Workforce & Operations | Staff/workforce reality, availability, scheduling, capacity, productivity and operational performance | `docs/CLINIC-OPERATIONS-WORKFORCE-REFERENCE.md` and `docs/CLINIC-OPERATIONS-WORKFORCE-FINANCIAL-INTEGRATION-REFERENCE.md` |
| Insights | KPIs, metrics, analytical interpretation and insight delivery | `docs/INSIGHTS-ENGINEERING-BLUEPRINT.md` |
| Communications | Internal communication, patient communication, portal communication and notification orchestration | Communications engineering blueprint in repository; this master document defines its cross-domain position |
| Journey Coordination | Tasks, requests, handoffs, next actions, escalation and clinic-wide work coordination | `docs/JOURNEY-COORDINATION-ENGINEERING-BLUEPRINT.md` |

**Repository reconciliation note:** where an earlier domain document has a combined name or integration-reference role, it remains a supporting source. This master blueprint does not silently delete or replace earlier records. During execution planning, duplicate/stale documents must be explicitly classified rather than assumed authoritative.

---

# 4. Domain 1 — Financial & Resources

## Purpose

Provide the clinic with a usable financial and resource operating foundation, not merely a payment screen.

The domain covers:

- Billing.
- Payments.
- Installments.
- Treatment-plan financial linkage.
- Insurance status and minimum insurance capability.
- Inventory.
- Consumption.
- Purchasing.
- Suppliers.
- Resource-related operational data.
- Financial/resource reporting inputs.

## Key decisions

### Installments are Core

Installment functionality must be operational because it directly supports Treatment Plans and Patient Portal financial visibility.

### Insurance has a Core minimum

The basic product must at least identify that a patient's financial responsibility is insurance-related and support clinic-level claims/reconciliation preparation for approved insurers.

Full insurer-system integration may be advanced/future, but the underlying patient/financial model must not block it.

### Resource data matters from day one

Inventory, purchasing and consumption data should be structured even where advanced workflows are not exposed to every tenant.

These data can later support operational KPIs, treatment economics and AI.

## Relationship to PJ

Financial & Resources supports PJ through:

```text
Treatment Plan
 → Financial commitment
 → Installments / payments
 → Patient Portal visibility
```

and:

```text
Treatment / Procedure
 → Resource consumption
 → Inventory data
 → Cost / operational insight
```

Financial logic remains outside PJ ownership.

---

# 5. Domain 2 — Team & Access

## Purpose

Give the Clinic Admin maximum practical flexibility to organize users and access without forcing a predefined organizational structure.

## Key decisions

- Roles are independent from permissions.
- Clinic Admin can create and name roles freely within a Workspace.
- Role templates are advisory starting points.
- Permission Catalog is authoritative.
- Permission Bundles simplify configuration but do not replace the catalog.
- Direct permissions and overrides remain supported.
- Workspace is not a security boundary.
- User Settings belong to this domain.
- Effective access must be explainable.
- Skill/Capability is advanced and distinct from permissions.
- Clinic Admin can delegate appropriate capabilities subject to non-bypassable controls.

## Workspace model

```text
Administrative
Operation
Clinical
```

These are working environments and UX organization mechanisms, not fixed job classifications or security walls.

## Relationship to PJ

Team & Access is an administrative domain and does **not** define PJ rules.

Its output affects execution:

```text
Access decision
 → Authorized actor
 → Operational execution
 → PJ outcome data
```

The relationship is therefore operational/outcome-based, not ownership of the patient journey.

Detailed contract: `docs/TEAM-ACCESS-ENGINEERING-BLUEPRINT.md`.

---

# 6. Domain 3 — Workforce & Operations

## Purpose

Represent the real operating condition of the clinic and its staff without becoming a full enterprise HR system.

The domain includes:

- Staff.
- Availability.
- Scheduling/work patterns.
- Capacity.
- Productivity.
- Workforce-related operational performance.
- Payroll.
- Recruitment.
- Benefits.
- Comprehensive leave management.
- Commission/bonus context where required.

These financial/employment capabilities are important because clinic performance often depends on understanding both **what an employee costs** and **what the employee contributes**.

## Key boundary

Workforce and Agenda are separate.

```text
Workforce = who is available / capable / productive
Agenda    = what appointment is scheduled and when
Coordination = what work needs to happen
```

## Relationship to Team & Access

```text
Team & Access
 → who the user is allowed to be / do

Workforce
 → employment and work reality
```

Employee ≠ User.

Job/position ≠ Role.

Skill ≠ Permission.

## Relationship to PJ

Workforce does not own PJ.

Its operational effects can be measured against PJ outcomes:

```text
Staff capacity / productivity
 → operational execution
 → patient-flow outcome
 → PJ / Insights
```

Detailed supporting documents:

- `docs/CLINIC-OPERATIONS-WORKFORCE-REFERENCE.md`
- `docs/CLINIC-OPERATIONS-WORKFORCE-FINANCIAL-INTEGRATION-REFERENCE.md`

---

# 7. Domain 4 — Insights

## Purpose

Turn structured operational facts into useful understanding for the clinic without taking ownership of source-domain business logic.

The domain includes:

- KPI framework.
- Metrics.
- Trends.
- Operational insight.
- Commercial/financial insight.
- Patient-journey insight.
- Cross-domain analytical views.
- Tenant-level analytical products according to entitlement.

## Critical product decision

The clinic may receive different levels of analytics according to subscription/product packaging.

However, the architecture should capture useful source data from day one when justified.

This enables:

- future upgrades;
- product validation;
- tenant coaching;
- training;
- benchmarking;
- AI readiness.

## Super Admin / platform-level analytical access

Super Admin belongs to a separate future platform-governance environment.

The intended principle is:

> Super Admin may access final analytical outputs across tenants for support, training, coaching, product and commercial purposes, including outputs beyond the tenant's subscribed analytical package, without receiving the underlying patient/user-level source data merely for that purpose.

This is an architectural distinction between **analytical output** and **source records**, and must remain subject to privacy, security and governance controls.

## Relationship to PJ

Insights may interpret PJ-related data, but it does not become part of PJ execution.

```text
PJ / operational domains
 → structured events and outcomes
 → Insights
 → KPI / insight
 → decision
```

Detailed contract: `docs/INSIGHTS-ENGINEERING-BLUEPRINT.md`.

---

# 8. Domain 5 — Communications

## Purpose

Provide controlled communication inside the clinic and between clinic and patient, rather than treating all communication as generic external messaging.

The domain includes:

- Internal communication.
- Clinical-to-clinical communication.
- Clinical-to-administrative communication.
- Administrative/executive communication.
- Patient communication.
- Patient Portal communication.
- Notifications.
- Communication history and context.

## Internal communication decision

Internal communication is an operational tool, not merely a chat product.

Example:

```text
Doctor
 → request / message
 → authorized colleague
 → action
 → documented response
```

A user without the required execution permission may request the action from someone who has it, subject to the access model.

This reduces reliance on undocumented verbal/external communication and creates useful accountability.

## Patient Portal relationship

Patient Portal communication is contextual to the patient and clinic relationship.

It should support:

- requests;
- treatment-related communication;
- financial/appointment communication where appropriate;
- required patient actions;
- responses and follow-up;
- continuity across clinics using CORE where the patient account architecture permits it.

External channels such as SMS/WhatsApp can remain notification/communication channels where appropriate, but Portal communication provides a dedicated patient context.

## Relationship to Coordination

```text
Communication
 ↔ Request / Task
 ↔ Action
 ↔ Completion notification
```

Communication does not become a second workflow engine, and Coordination does not become a second messaging system.

---

# 9. Domain 6 — Journey Coordination

## Purpose

Coordinate work across the clinic without taking ownership of other domains.

Core concepts:

- Tasks.
- Requests.
- Assignment.
- Handoffs.
- Next Action.
- Follow-up-linked work.
- Escalation.
- My Work / Work Center.
- Admin operational oversight.
- Audit/history.

## Central model

```text
Domain Event
 → Required Work
 → Eligible / authorized actor
 → Assign / Request / Handoff
 → Execute
 → Notify
 → Monitor
 → Escalate if needed
 → Close
 → Analyze
```

## Important boundary

Journey Coordination is **not**:

- a second Agenda;
- a second Clinical workflow;
- a second Treatment Plan engine;
- a second Follow-up engine;
- a second Communications engine;
- a second Workforce system;
- a second Analytics system.

Detailed contract: `docs/JOURNEY-COORDINATION-ENGINEERING-BLUEPRINT.md`.

---

# 10. Cross-domain integration architecture

## 10.1 Team & Access + Workforce

```text
User / Role / Permission
          +
Availability / Capacity / Skill
          ↓
Eligible operational actor
```

Team & Access decides authorization.

Workforce supplies work reality.

Neither should absorb the other.

## 10.2 Workforce + Agenda

```text
Workforce availability/capacity
              ↓
Agenda availability decisions
              ↓
Appointment
```

Agenda remains the appointment authority.

## 10.3 Agenda + Journey Coordination

```text
Appointment confirmed
 → preparation work

Appointment completed
 → required operational work
```

Coordination does not schedule appointments.

## 10.4 Treatment Plan + Financial & Resources

```text
Treatment Plan
 → financial commitment
 → installments / payments
 → resource consumption
 → operational / financial insight
```

Each domain retains its own authority.

## 10.5 Inventory + Purchasing + Suppliers

```text
Consumption / stock state
 → purchasing need
 → supplier transaction
 → inventory update
```

Coordination can manage the work around these operations but not replace their source records.

## 10.6 Communications + Coordination

```text
Message / request
 → Work Item
 → execution
 → communication back
```

The conversion must be explicit, not automatic for every message.

## 10.7 Coordination + Insights

```text
Work history
 → structured operational data
 → Insights
 → KPI / bottleneck / trend
```

## 10.8 Patient Portal + Financial

```text
Patient
 ↔ Portal
 ↔ clinic financial records relevant to patient
 ↔ treatment plan / installments / payments
```

The Portal exposes only the patient's appropriate financial context.

## 10.9 Patient Portal + Communications

Portal becomes a dedicated patient communication context rather than an alternative to the clinic's general messaging architecture.

## 10.10 Patient Portal + Coordination

```text
Patient request
 → clinic work
 → staff action
 → patient response
```

This makes the Portal operationally useful rather than a static information display.

---

# 11. Integration with Patient Journey (PJ)

PJ remains the patient-centered journey model and governing clinical/patient-flow reference.

The six domains support it rather than becoming PJ modules.

## Representative integrated journey

```text
Patient enters / appointment
        ↓
Agenda
        ↓
Clinical encounter
        ↓
Treatment Plan
        ↓
Financial commitment
        ↓
Installment / Payment
        ↓
Operational Tasks / Handoffs
        ↓
Treatment / Resource consumption
        ↓
Follow-up
        ↓
Patient Portal communication
        ↓
Next Action
        ↓
Insights
```

At each point:

- Team & Access determines who may act.
- Workforce determines relevant work reality.
- Communications provides appropriate communication.
- Financial & Resources owns financial/resource truth.
- Coordination manages required work.
- Insights interprets outcomes.

## PJ boundary rule

No administrative domain may silently redefine the Patient Journey.

PJ remains the patient-centered source of journey intent; administrative domains provide the infrastructure required to execute it.

---

# 12. What is already present vs what needs execution

The reconciliation identified that CORE already contains meaningful implementations and infrastructure across these areas. Examples include:

- existing Agenda/appointment domain and canonical appointment entity;
- existing permission calculation and overrides;
- existing Workspace/sidebar architecture;
- System Preferences and tenant direction infrastructure;
- Subscription/entitlement infrastructure;
- Patient Portal implementation foundation;
- existing Follow-up and clinical workflow components;
- existing audit/activity infrastructure;
- existing Insights/analytics foundations;
- existing financial/resource-related structures;
- existing workforce/clinic operations structures.

However, **presence is not equivalent to integrated completion**.

The implementation program must therefore distinguish:

1. **Already correct and reusable.**
2. **Implemented but requiring reconciliation/integration.**
3. **Partially implemented and requiring completion.**
4. **Missing and requiring new implementation.**
5. **Advanced/future-ready data that should be captured now but not exposed as a full product capability.**
6. **Explicitly deferred/non-goal functionality.**

No implementation phase should recreate a capability merely because it exists under a different UI or domain path.

---

# 13. Product tiering model

The platform should distinguish three product dimensions rather than treating everything as simply "on" or "off":

## 13.1 Core / included

Capabilities required for a credible operating clinic system.

## 13.2 Advanced

Capabilities that deepen automation, analysis or operational sophistication but are not required for every clinic.

## 13.3 Independent add-ons / future products

Capabilities that can be sold or enabled independently from the base subscription.

## Important data rule

Where appropriate, source data collection should not be artificially stopped merely because the tenant's visible product does not expose an advanced analytical or automation feature.

This is especially important for:

- workforce/productivity data;
- financial/resource relationships;
- inventory/consumption;
- operational work history;
- communications metadata;
- PJ outcomes;
- analytical dimensions.

This must always remain subject to privacy, legal and contractual rules.

---

# 14. Execution classification

Every implementation item must receive one of these statuses before coding:

| Classification | Meaning |
|---|---|
| **KEEP** | Existing implementation is correct and remains authoritative |
| **RECONCILE** | Existing implementation exists but boundaries/integration need correction |
| **EXTEND** | Existing capability is correct but incomplete |
| **BUILD** | Genuine capability is missing |
| **DATA FOUNDATION** | Capture structured data now for future use |
| **ADVANCED** | Implement after Core operational integrity is secured |
| **DEFER** | Explicitly postponed/non-goal |
| **REMOVE / REPLACE** | Existing implementation conflicts with approved architecture |

This classification must be applied before each execution stage.

---

# 15. Proposed execution stages

The exact task-level Implementation Plan is a separate execution document and must be produced from this blueprint. The following is the governing stage architecture.

## Stage A — Baseline & reconciliation lock

- Snapshot repository reality.
- Verify production/runtime reality.
- Verify database/migrations.
- Verify existing domain implementations.
- Map authoritative records.
- Classify KEEP / RECONCILE / EXTEND / BUILD / DATA FOUNDATION / DEFER / REMOVE.
- Confirm PJ integration points.

**Output:** frozen implementation baseline.

## Stage B — Cross-domain foundations

- Shared identifiers/references.
- Domain ownership boundaries.
- Event/action integration conventions.
- Authorization enforcement.
- Audit requirements.
- Entitlement boundaries.
- Data foundation required for future analytics/AI.

**Output:** safe integration substrate.

## Stage C — Team & Access integrity

- Verify User/Role/Permission separation.
- Complete Permission Catalog.
- Validate templates/bundles.
- Validate overrides/direct permissions.
- Validate effective access.
- Validate User Settings.
- Validate dynamic Workspace/sidebar behavior.
- Validate server-side enforcement.

**Output:** reliable authorization foundation for every later domain.

## Stage D — Financial & Resources completion

- Billing.
- Payments.
- Installments.
- Insurance minimum.
- Claims/reconciliation preparation.
- Inventory.
- Consumption.
- Purchasing.
- Suppliers.
- Resource relationships.
- Financial/resource audit and reporting data.

**Output:** operational financial/resource foundation.

## Stage E — Workforce & Operations completion

- Staff.
- Availability.
- Leave.
- Scheduling/work patterns.
- Capacity.
- Productivity.
- Payroll.
- Recruitment.
- Benefits.
- Commission/bonus context.
- Operational performance data.

**Output:** usable workforce foundation without turning CORE into a full HR suite.

## Stage F — Journey Coordination implementation

- Work Item model.
- Tasks.
- Requests.
- Assignment.
- Handoffs.
- Next Actions.
- Follow-up integration.
- Escalation.
- My Work.
- Admin operational oversight.
- Event-driven work creation.
- Audit/history.

**Output:** operational coordination layer.

## Stage G — Communications implementation/integration

- Internal communication.
- Permission-aware requests.
- Patient communication.
- Portal communication.
- Notifications.
- Communication history/context.
- Coordination integration.

**Output:** controlled communication layer integrated with work and patient context.

## Stage H — Insights and reporting integration

- KPI validation.
- Cross-domain metrics.
- Operational dashboards.
- Financial/resource insights.
- Workforce insights.
- PJ-related insights.
- Subscription/product analytics boundaries.
- Platform-level final analytical outputs without unnecessary source-data exposure.

**Output:** useful analytical layer built on verified source data.

## Stage I — PJ integration validation

This is not a rebuild of PJ.

It verifies that all administrative domains correctly support the existing Patient Journey:

- appointment;
- clinical work;
- treatment plans;
- financial commitments;
- resource use;
- communications;
- follow-up;
- Portal;
- operational work;
- analytics.

**Output:** end-to-end integrated patient/clinic operating flow.

## Stage J — Runtime, security and operational acceptance

- Tenant isolation.
- Authorization.
- Privacy.
- Audit.
- Financial controls.
- Clinical boundaries.
- Runtime workflows.
- Error handling.
- Production verification.
- Regression testing.
- Documentation synchronization.

**Output:** execution closure candidate.

---

# 16. Execution dependency graph

```text
Baseline
   ↓
Cross-domain foundations
   ↓
Team & Access
   ↓
Financial & Resources ─────┐
                           │
Workforce & Operations ────┤
                           ↓
                    Journey Coordination
                           ↓
                     Communications
                           ↓
                        Insights
                           ↓
                 PJ end-to-end validation
                           ↓
                Runtime / security acceptance
```

The sequence is a dependency guide, not a requirement to rebuild the domains in isolation.

Parallel work is permitted only when domain ownership and integration contracts are already stable.

---

# 17. Implementation-plan governance

The detailed **Implementation Plan** must be derived from this master blueprint.

For every task it must state:

- Domain.
- Existing implementation/path.
- Classification.
- Objective.
- Dependencies.
- Authoritative source.
- Expected user behavior.
- Expected backend/data behavior.
- Security/permission impact.
- PJ impact, if any.
- Cross-domain impact.
- Subscription/entitlement impact.
- Data-foundation requirement.
- Runtime validation.
- Acceptance criteria.
- Documentation affected.

No implementation prompt should bypass this structure.

---

# 18. Definition of Done

A cross-domain capability is not complete merely because a UI exists.

Depending on the capability, completion requires:

```text
UI
+ domain logic
+ persistence
+ authorization
+ tenant isolation
+ integration
+ audit
+ error handling
+ runtime verification
+ documentation
```

For analytical features, also require:

```text
source data validity
+ metric definition
+ reproducibility
+ entitlement behavior
+ appropriate privacy boundary
```

For future-ready data, require:

```text
structured capture
+ ownership
+ retention rules
+ documented meaning
```

---

# 19. Architectural risks to prevent during implementation

1. Building duplicate engines for capabilities that already exist.
2. Turning Workspaces into hidden authorization boundaries.
3. Reintroducing role-based hard restrictions after explicitly choosing flexible roles.
4. Allowing Requests/Handoffs to bypass permissions.
5. Turning Journey Coordination into a second Agenda.
6. Turning Communications into an undocumented workflow engine.
7. Turning Insights into a domain business-logic engine.
8. Allowing financial/resource logic to leak into Coordination.
9. Treating Employee, User, Role and Skill as interchangeable concepts.
10. Treating PJ as a collection of administrative screens.
11. Hiding valuable source-data capture behind product-tier switches when the architecture should retain it.
12. Exposing platform-level analytics by leaking underlying patient/user data.
13. Building advanced automation before the underlying operational records are trustworthy.
14. Declaring completion from screen-level validation without runtime/security verification.
15. Allowing stale documentation to become an accidental competing source of truth.

---

# 20. Future AI readiness

The architecture is intentionally being prepared for future AI agents.

The agent should eventually be able to understand:

```text
Tenant
 + Users / Roles / Permissions
 + Workforce
 + Agenda
 + Clinical events
 + Treatment Plans
 + Financial events
 + Resources
 + Communications
 + Work history
 + PJ outcomes
 + Insights
```

without needing to reconstruct the tenant's operating history from unstructured messages.

The current implementation therefore prioritizes **structured event and decision history**.

Future AI must remain constrained by:

- permissions;
- tenant isolation;
- clinical safety;
- financial controls;
- explicit action authority;
- auditability;
- human accountability.

AI readiness is a data/architecture requirement now, not a requirement to build the AI agent now.

---

# 21. Final architectural position

CORE SYSTEM should ultimately behave as follows:

```text
                 CORE SYSTEM
                      │
        ┌─────────────┼─────────────┐
        │             │             │
      Patient       Clinic        Platform
      Journey      Operations    Governance
        │             │
        │     ┌───────┼────────┐
        │     │       │        │
        │  Financial Team   Workforce
        │  Resources &Access Operations
        │     │       │        │
        │     └───────┼────────┘
        │             │
        │       Coordination
        │             │
        │      Communications
        │             │
        └──────── Insights ────────┘
```

The patient is not the only operational priority, and the employee is not the only operational priority.

The system seeks a **sustainable clinic operation** in which:

- the patient receives a satisfactory, continuous journey;
- the team can work at sustainable efficiency;
- the clinic maintains financial and administrative control;
- management can understand what is happening;
- the platform collects enough structured evidence to improve the clinic over time.

The target is not a theoretically perfect patient journey at the expense of the team.

The target is a **sustainable, measurable and continuously improvable operating system for the clinic**.

---

# 22. Governing source hierarchy

When implementation questions arise, use the following order:

1. **Explicit final architectural decisions approved by the product owner.**
2. **This Master Blueprint for cross-domain architecture and integration.**
3. **The relevant domain Engineering Blueprint for domain-specific behavior.**
4. **PJ-MASTER-DOCS for Patient Journey ownership and patient-flow rules.**
5. **Repository/runtime/database reality for implementation truth.**
6. **Implementation Plan for execution sequencing and task-level instructions.**

A repository implementation that conflicts with an approved architectural decision is not automatically authoritative; it must be reconciled.

A domain document that conflicts with this master cross-domain contract must be reviewed and explicitly corrected rather than silently ignored.

---

# 23. Required next artifact

The next controlled artifact after this document is:

**CORE SYSTEM — Administrative & Journey Management Implementation Plan**

It must translate the reconciled architecture into executable stages, tasks, dependencies, validation gates and implementation prompts.

The Implementation Plan must not introduce new architecture unless a new decision is explicitly approved and this Master Blueprint is updated accordingly.

---

# 24. Closure statement

This document closes the **Domain Reconciliation & Consolidation** phase for the six administrative/operational domains covered above and establishes the architectural bridge to implementation.

It does not declare every feature implemented in production.

It declares:

- what each domain is responsible for;
- what it must not own;
- how the domains integrate;
- how they support PJ;
- what principles govern implementation;
- how existing work must be classified;
- how implementation must be staged;
- and what evidence is required before declaring completion.

**End of CORE SYSTEM Administrative & Journey Management Master Blueprint.**
