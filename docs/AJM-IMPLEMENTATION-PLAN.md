# CORE SYSTEM — AJM Implementation Plan

**Short name:** AJM
**Full name:** Administrative & Journey Management
**Program:** Domain Reconciliation & Consolidation → Implementation
**Status:** Approved execution plan — pre-implementation
**Governing document:** `docs/CORE-SYSTEM-ADMINISTRATIVE-JOURNEY-MANAGEMENT-BLUEPRINT.md`

---

## 1. Purpose

AJM is the implementation program created from the final reconciliation of the administrative and operational domains around the existing CORE SYSTEM and Patient Journey (PJ).

The objective is **not** to build six isolated products. The objective is to make the existing system operate as one coherent platform with:

- clear domain ownership;
- simple user-facing workflows;
- deep background capabilities;
- explicit cross-domain integration;
- strong administrative, financial, legal and privacy controls;
- structured data from day one;
- readiness for future automation and AI agents.

This plan is the execution companion to the AJM Master Blueprint. It does not replace the detailed domain blueprints.

---

# 2. AJM Domain Scope

AJM covers six reconciled domains:

1. **Financial & Resources**
2. **Team & Access**
3. **Workforce & Operations**
4. **Insights**
5. **Communications**
6. **Journey Coordination**

The implementation must also reconcile their relationships with existing Clinical domains and PJ.

---

# 3. Governing source hierarchy

When implementing AJM, use this order of authority:

1. Explicit current architectural decisions recorded by the project owner.
2. `docs/CORE-SYSTEM-ADMINISTRATIVE-JOURNEY-MANAGEMENT-BLUEPRINT.md` for cross-domain architecture and integration.
3. The detailed blueprint/reference document for the domain being implemented.
4. Existing approved PJ documents for patient-journey ownership and behavior.
5. Existing repository implementation, after inspection and validation.
6. Implementation-stage documents produced for the current stage.

Existing code is **evidence**, not automatically the desired final behavior.

No implementation stage may silently reopen a settled architectural decision.

---

# 4. Execution principles

## 4.1 Inspect → Reuse → Reconcile → Extend → Create

Before creating anything:

```text
Inspect existing repository/runtime
        ↓
Identify authoritative implementation
        ↓
Reuse where correct
        ↓
Reconcile conflicts/gaps
        ↓
Extend only where necessary
        ↓
Create only when genuinely required
```

## 4.2 Runtime reality over assumptions

Every stage must validate:

- repository files;
- database schema and migrations;
- authentication/authorization;
- deployed behavior;
- integrations;
- actual UI behavior;
- existing data compatibility.

## 4.3 Preserve domain boundaries

A feature must not be duplicated merely because another domain needs to consume it.

The consuming domain integrates with the authoritative owner.

## 4.4 Data first, visibility second

Where a capability is intentionally advanced or subscription-dependent, the architecture should collect justified structured source data from day one when privacy, security and legal requirements permit it.

This does not mean exposing an unfinished feature to users as if it were complete.

## 4.5 Simple UX, deep system

The implementation should minimize the number of concepts the everyday user must understand while retaining rich background state and history.

---

# 5. Stage model

AJM is executed in **nine stages**. The sequence is deliberate: foundations first, then financial/resource truth, then workforce/access, then communication and coordination, then analytical consolidation, followed by cross-domain hardening.

---

## AJM-0 — Baseline, Reconciliation Lock & Implementation Readiness

### Objective
Establish the exact implementation baseline before modifying code.

### Work

- Reconfirm the AJM Master Blueprint.
- Index every detailed domain document.
- Map existing repository modules to the six domains.
- Map existing database tables/functions/migrations.
- Identify duplicated engines.
- Identify stale implementations.
- Identify existing PJ integrations.
- Identify production/runtime gaps.
- Classify every finding:
  - KEEP
  - FIX
  - RECONCILE
  - EXTEND
  - BUILD
  - DATA FOUNDATION
  - ADVANCED
  - DEFER
  - REMOVE
- Freeze settled architectural decisions.

### Deliverable
`AJM-0` Baseline & Reconciliation Report.

### Exit criteria
No implementation work begins until the current-state map and conflict list are explicit.

---

## AJM-1 — Team & Access Foundation

### Objective
Make identity, role organization and effective authorization reliable before dependent operational work is expanded.

### Core scope

- Users.
- User settings.
- Workspaces.
- Roles.
- Role templates.
- Permission Catalog.
- Permission Bundles / Sets.
- Direct permissions where approved.
- Overrides.
- Effective permissions.
- Explainable access.
- Admin visibility and delegation model.

### Advanced foundation

- Skill / Capability model.
- Capability-aware eligibility for future routing.

### Critical rules

- Role ≠ Permission.
- Role ≠ Skill.
- Workspace ≠ security boundary.
- Templates are advisory.
- Clinic Admin has high flexibility within non-bypassable controls.
- No permission may be invented outside the Permission Catalog/entitlement model.

### PJ relationship
Administrative only. Its output determines who may perform work; it does not define PJ.

### Deliverable
`AJM-1` Team & Access implementation and validation package.

---

## AJM-2 — Financial & Resources Foundation

### Objective
Build the minimum complete financial/resource backbone required by the patient journey and clinic operations, while preparing deeper automation in the background.

### Core scope

- Billing.
- Payments.
- Installments.
- Patient financial linkage.
- Minimum insurance classification.
- Claims/reconciliation preparation for clinic-approved insurers.
- Inventory foundation.
- Consumption records.
- Purchasing foundation.
- Supplier records.
- Resource relationships.

### Background/data foundation

- Financial automation events.
- Resource consumption data.
- Cost-related structured records.
- Future automation-ready states.

### Important product rule

Installments are **Core**, not deferred.

Insurance has a **Core minimum** even without insurer-system integration.

Inventory/consumption/purchasing data should be captured where justified even when advanced automation is not exposed.

### PJ relationship

```text
Treatment Plan
 → financial commitment
 → installment/payment
 → patient portal visibility
```

and:

```text
Treatment/procedure
 → resource consumption
 → inventory/resource data
 → insight
```

### Deliverable
`AJM-2` Financial & Resources implementation and reconciliation package.

---

## AJM-3 — Workforce & Operations Foundation

### Objective
Represent real clinic workforce conditions without turning CORE into a large enterprise HR suite.

### Core scope

- Staff records.
- Availability.
- Work schedules/patterns.
- Capacity basics.
- Leave management.
- Payroll foundation.
- Recruitment foundation.
- Benefits foundation.
- Commission/bonus context.
- Productivity records.

### Advanced

- Skill / Capability utilization.
- Capacity optimization.
- Advanced workforce analytics.

### Critical boundary

```text
Workforce = work reality
Agenda    = appointment scheduling
Coordination = operational work
```

These remain separate systems with explicit integration.

### PJ relationship

Workforce does not own PJ. Workforce performance can influence operational execution and therefore PJ outcomes.

### Deliverable
`AJM-3` Workforce & Operations implementation and validation package.

---

## AJM-4 — Communications Foundation

### Objective
Establish controlled internal and patient communication as a real operating capability.

### Core scope

- Internal communication.
- Clinical ↔ clinical communication.
- Clinical ↔ administrative communication.
- Administrative/executive communication.
- Patient communication.
- Patient Portal communication.
- Notifications.
- Communication context/history.

### Key behavior

Communication and work are distinct:

```text
Message
 → explicit Request/Task when action is required
 → execution
 → response/notification
```

Do not build a second workflow engine inside Communications.

### PJ relationship

Communications supports continuity and execution but does not redefine clinical/PJ state.

### Deliverable
`AJM-4` Communications implementation and integration package.

---

## AJM-5 — Journey Coordination Foundation

### Objective
Create the cross-domain work layer that makes the platform operationally coherent.

### Core scope

- Tasks.
- Requests.
- Assignment.
- Handoffs.
- Next Action.
- Follow-up integration.
- Manual escalation.
- My Work / Work Center.
- Admin operational oversight.
- Audit/history.

### Advanced

- Automated work creation.
- Automated routing.
- Automated handoffs.
- Automated escalation.
- Skill/Capability-aware routing.
- Workload-aware routing.
- Recurring work.

### Critical rule

Coordination does not become a second:

- Agenda;
- Clinical workflow;
- Treatment Plan;
- Follow-up engine;
- Communications system;
- Workforce system;
- Analytics system.

### PJ relationship

Coordination serves PJ-related work while remaining a general clinic work engine.

### Deliverable
`AJM-5` Journey Coordination implementation and cross-domain integration package.

---

## AJM-6 — Insights, Reporting & Analytical Consolidation

### Objective
Turn the structured data generated by the previous stages into useful operational understanding without moving source-domain ownership into Insights.

### Core scope

- KPI framework.
- Core operational metrics.
- Financial/resource metrics.
- Workforce metrics.
- Communication/operational metrics.
- Patient-journey metrics.
- Cross-domain reporting.
- Basic dashboards.

### Advanced

- Deep analytics.
- Benchmarking.
- Advanced dashboards.
- Predictive indicators.
- Advanced analytical products.

### Product packaging

The product model must distinguish:

1. Core/basic analytics.
2. Advanced analytics included in higher packages.
3. Independent/add-on analytical products.

### Super Admin platform boundary

A future separate platform may consume final analytical outputs across tenants for support, coaching, training, product and commercial purposes, including outputs beyond a tenant's subscribed analytics, without turning that platform into a general patient/user-data viewer.

### Deliverable
`AJM-6` Insights and reporting consolidation package.

---

## AJM-7 — PJ & Cross-Domain Integration Hardening

### Objective
Verify that the six domains operate as one system around the existing Patient Journey without taking ownership away from PJ or clinical domains.

### Required integration paths

- Agenda → Coordination.
- Agenda → Workforce.
- Team & Access → all authorized actions.
- Workforce → Coordination.
- Treatment Plan → Financial & Resources.
- Treatment Plan → Coordination.
- Clinical → Coordination where operational work is required.
- Follow-up → Coordination.
- Financial & Resources → Insights.
- Workforce → Insights.
- Coordination → Insights.
- Communications ↔ Coordination.
- Patient Portal ↔ Communications.
- Patient Portal ↔ Financial & Resources.
- Patient Portal ↔ Treatment Plan.
- Patient Portal ↔ Coordination.

### Validation scenarios

At minimum validate:

- small clinic with one Admin/owner/doctor and one receptionist;
- clinic where one person performs multiple operational functions;
- clinic with multiple doctors and procedure/device specialists;
- user who can read but cannot execute;
- request to an authorized user;
- appointment-generated preparation work;
- treatment-plan installment flow;
- insurance-linked patient financial flow;
- resource consumption linked to treatment;
- patient Portal request → clinic action → response;
- overdue work and escalation;
- communication that requires action;
- workload/capacity constraints.

### Deliverable
`AJM-7` Cross-domain/PJ Integration Verification Report.

---

## AJM-8 — Security, Privacy, Financial/Legal Controls & Runtime Closure

### Objective
Close the implementation only after the integrated system is operationally, technically and administratively safe.

### Validate

- tenant isolation;
- permission enforcement;
- role/permission independence;
- sensitive administrative actions;
- patient privacy;
- financial integrity;
- auditability;
- separation of duties where required;
- data consistency;
- migrations;
- production deployment;
- error handling;
- runtime behavior;
- subscription/entitlement behavior;
- background data collection rules;
- Portal access boundaries;
- communication visibility;
- reporting/analytics access.

### Deliverable
`AJM-8` Final Acceptance & Closure Report.

### Exit
AJM is implementation-complete only after runtime validation and cross-domain regression pass.

---

# 6. Stage dependency map

```text
AJM-0
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
AJM-8 Security / Privacy / Financial / Legal / Runtime Closure
```

Some implementation activities may run in parallel after their dependencies are verified, but no stage may bypass a required dependency.

---

# 7. Stage document protocol

Every AJM stage must have a dedicated repository document before or at the start of implementation.

Recommended naming:

```text
AJM-0-BASELINE.md
AJM-1-TEAM-ACCESS.md
AJM-2-FINANCIAL-RESOURCES.md
AJM-3-WORKFORCE-OPERATIONS.md
AJM-4-COMMUNICATIONS.md
AJM-5-JOURNEY-COORDINATION.md
AJM-6-INSIGHTS.md
AJM-7-INTEGRATION-PJ.md
AJM-8-FINAL-VALIDATION.md
```

Each stage document must contain:

- objective;
- governing decisions;
- exact scope;
- repository baseline;
- database baseline;
- runtime baseline;
- files/tables/functions affected;
- reuse/extension/build decisions;
- migration requirements;
- integration requirements;
- test/validation plan;
- acceptance criteria;
- unresolved issues;
- completion evidence;
- final status.

The stage document must link back to this plan and the relevant domain blueprint.

---

# 8. Definition of Done for every stage

A stage is not complete because code exists.

It is complete only when:

1. Scope is implemented.
2. Existing behavior that should remain has been preserved.
3. Domain boundaries remain intact.
4. Database changes are synchronized and reproducible.
5. Authorization is verified.
6. Cross-domain integrations work.
7. Relevant PJ behavior is verified.
8. Runtime behavior is verified.
9. Errors and edge cases are checked.
10. Documentation is updated.
11. Evidence is recorded.
12. The stage is explicitly closed.

---

# 9. Required implementation artifacts

The AJM program should maintain these artifact types:

### Architecture

- AJM Master Blueprint.
- Domain blueprints.
- Integration maps.
- Decision records where required.

### Execution

- Stage implementation plan.
- Stage prompts/contracts for implementation agents.
- Migration plans.
- Validation plans.

### Evidence

- Repository diff.
- Database/migration evidence.
- Runtime validation.
- Screenshots where useful.
- Test results.
- Production verification.

### Closure

- Stage closure report.
- Updated master status.
- Outstanding future work list.

---

# 10. Product-tier strategy

AJM must distinguish three product levels when a capability is appropriate:

### Core
Required for a useful clinic operating system.

### Advanced
Deeper capability for clinics that need it or higher subscription tiers.

### Add-on / Independent product
A separable capability that can be activated independently of the base subscription when commercially appropriate.

The implementation must not destroy the underlying data foundation merely because the visible feature is not included in every package.

---

# 11. Future AI readiness

AI is not an AJM implementation dependency, but AJM must produce the data foundation needed for future agents.

Useful structured facts include:

- who performed an action;
- who could have performed it;
- what permission allowed it;
- what was requested;
- what was completed;
- how long it took;
- what was delayed;
- what was escalated;
- what resources were consumed;
- what financial event occurred;
- what communication occurred;
- what patient-journey event surrounded the work;
- what outcome followed.

Future AI may use these facts to understand a tenant from the beginning rather than waiting for months of manually curated data.

AI must remain subject to the same authorization, privacy, clinical, financial and legal boundaries as human users.

---

# 12. Main execution risks

The implementation team must actively prevent:

1. Rebuilding existing functionality instead of reusing it.
2. Creating duplicate domain engines.
3. Making Role and Permission dependent on each other.
4. Treating Workspace as authorization.
5. Turning Coordination into a second Agenda or workflow engine.
6. Turning Communications into a task engine.
7. Turning Insights into a source-data owner.
8. Making Workforce dependent on Agenda.
9. Making PJ dependent on administrative implementation details.
10. Hiding valuable data merely because advanced UI is not subscribed.
11. Collecting sensitive data without legitimate purpose or appropriate controls.
12. Adding complexity to the daily user experience merely because the backend is capable of it.
13. Declaring a stage complete without runtime verification.

---

# 13. Execution governance

The implementation process is:

```text
AJM Blueprint
     ↓
Stage document
     ↓
Repository + database inspection
     ↓
Implementation contract
     ↓
Implementation
     ↓
Runtime verification
     ↓
Reconciliation
     ↓
Stage closure
     ↓
Next stage
```

The implementation team must not independently redefine product policy or architectural decisions.

Where a genuine contradiction is discovered, implementation pauses at the affected boundary and records the issue for decision rather than silently choosing a new architecture.

---

# 14. Final program outcome

When AJM is complete, CORE SYSTEM should present itself to the clinic as one coherent operating platform rather than a collection of unrelated modules.

The desired outcome is:

```text
Clinic Admin
   ↓
Flexible Team & Access
   ↓
Real Workforce
   ↓
Agenda + Clinical + PJ
   ↓
Financial & Resources
   ↓
Communications
   ↓
Journey Coordination
   ↓
Insights / Reports / Dashboards
   ↓
Structured operational intelligence
   ↓
Future automation + AI
```

The user experience remains understandable while the platform retains significantly deeper operational capability underneath.

**End of AJM Implementation Plan.**
