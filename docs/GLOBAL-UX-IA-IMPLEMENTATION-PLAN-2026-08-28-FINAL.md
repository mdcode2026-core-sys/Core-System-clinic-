# CORE SYSTEM — Global UX / Information Architecture / Interaction Reorganization
## Final Implementation Plan — 2026-08-28

**Status:** APPROVED EXECUTION PLAN. This document authorizes planning and governs implementation order; it does not itself execute product changes.

## 1. Governing objective

Reorganize how CORE SYSTEM is presented and used without rebuilding the product from zero, deleting capabilities for simplicity, changing Domain ownership, or changing authorization merely for UX convenience.

Target:

> **Simple Surface + Deep Background Capability + Independent Domains + Explicit Integration + Structured Data + Future Automation / AI Readiness.**

The platform must feel like one integrated system while preserving independent Domains and explicit integration.

## 2. Mandatory method

```text
READ → INSPECT → MAP → RECONCILE → IMPLEMENT → RUNTIME VALIDATE → DOCUMENT → CLOSE
```

Within each step:

**Inspect → Reuse → Extend → Reconcile → Create**

Create only after a genuine gap is demonstrated. No quick patch, hidden Sidebar item, duplicate wrapper, temporary redirect, conditional hack, or parallel implementation may conceal a root problem.

If a required correction needs a new architectural decision not already approved, stop at that decision and present it for explicit approval.

## 3. Approved user model

CORE SYSTEM user model:

```text
User
↓
Role (clinic-defined organizational role)
↓
Permissions (explicit capabilities granted by Clinic Admin)
↓
Sidebar (full authorized capability navigation)
+
Workspace (personal working surface)
↓
Widgets / Quick Actions selected from authorized capabilities
```

Role does not restrict the categories of permissions that Clinic Admin may grant. A user may receive clinical, administrative, financial, operational, or other available permissions regardless of conventional expectations for the role.

Clinic Admin is the clinic's authority for creating, editing, deleting and organizing users and roles within the approved system controls. Role Templates are advisory starting points, not mandatory role definitions. Clinic Admin may create and save new roles for reuse.

## 4. Workspace

Workspace is the user's principal working surface. It is not merely an Overview, not a Dashboard, not a security boundary, and not a fixed Clinical/Operations screen determined solely by role.

Workspace must support useful daily work, including where appropriate:

- quick registration;
- patient search;
- quick booking;
- daily work;
- attention items;
- executable operational tools;
- domain-specific working tools.

The exact contents are determined by the user's permissions, available Widgets, and personal configuration.

The previous concept of mandatory fixed Clinical and Operations Workspaces as the general user model is superseded. Clinical and Operations remain meaningful contexts where required by workflows, domains, or Patient Flow views.

## 5. Workspace personalization

Users may personalize their Workspace using only capabilities they are authorized to use. They may:

- add Widgets;
- remove Widgets;
- reorder Widgets;
- drag and drop Widgets;
- scroll/swipe through additional Widgets;
- organize the surface around actual frequency and workflow;
- restore the default configuration.

Widgets retain a natural/defined size appropriate to their purpose. They are not arbitrarily compressed or enlarged merely to fill a screen. Mobile/tablet presentation adapts to available space while preserving the same capability model.

A useful default Workspace must exist so users are not forced to design a screen from zero.

## 6. Widget system

Widgets are reusable system tools. They may be used only when their required permissions are available.

The governing relationship is:

```text
Permission
↓
Widget available
↓
User chooses Widget
↓
Widget appears in Workspace
```

Never the reverse. A Widget cannot grant a permission or bypass authorization.

Widgets are not limited to passive Overview information. They may be:

- informational;
- actionable;
- operational;
- contextual.

Not every Domain requires a Widget. Some capabilities should remain full pages, contextual actions, Quick Actions, Sidebar features, or have no Widget representation.

Each Widget must be classified and documented by purpose, Domain ownership, required permission(s), relevant context, natural size, supported placement, and whether it may also be exposed through Sidebar.

Quick Actions may be used for simple high-frequency actions that should not consume the space of a full Widget.

Widgets may be available in the user's Sidebar when the capability is appropriate for direct navigation. Sidebar and Workspace are complementary, not substitutes.

## 7. Sidebar

Sidebar is the user's full authorized capability navigation surface. It is not a list of Workspace shortcuts and must not be a storage location for every repository route.

Each candidate must be classified as Domain, Subdomain, Feature, Setting, Process, Child feature, Contextual feature, Patient Flow, or Workspace-related capability.

A route existing in code is not sufficient reason for a top-level Sidebar item.

A feature must not be deleted merely because it does not belong in the Sidebar. It must be reconciled to the appropriate surface: Sidebar, submenu, parent/detail flow, contextual navigation, Workspace Widget, Quick Action, settings, or Global Search.

## 8. Patient Flow and Queue

Patient Flow remains an **independent system** and remains a Sidebar item only when explicitly enabled/assigned by Clinic Admin and permitted for that user.

Patient Flow is not replaced by Widgets. The existing Queue, drag-and-drop movement, patient movement, visit start/close behavior, and related working system must be reused and reconciled rather than recreated merely for UX reasons.

Patient Flow has exactly three approved user-facing interfaces of the same system:

```text
Patient Flow
├── Operations view
├── Clinical view
└── Administrative view
```

Patient Flow does **not** appear merely because a user has an Operations role, Operations-related permissions, or a general Workspace associated with Operations.

For Patient Flow to appear:

1. Clinic Admin must explicitly enable/assign Patient Flow to the user;
2. the applicable Patient Flow context must be selected/assigned;
3. the user's authorization must permit the relevant data/actions.

Therefore:

> Operations role/Workspace ≠ automatic Patient Flow.

An Operations-oriented user such as an accountant may have financial capabilities and still have no Patient Flow.

### Operations view

Supports operational patient movement and coordination, including reception-type work where applicable.

### Clinical view

Supports the clinical side of patient movement and clinical workflow.

### Administrative view

Provides the broader patient movement/operational picture and authorized administrative intervention required to control operations.

These three interfaces are not three separate Patient Flow systems.

A Queue Widget may appear in a Workspace when authorized, but it is a Widget/surface of the existing Patient Flow capability and does not replace Patient Flow.

## 9. Dashboard and Overview

Dashboard and Workspace are different.

**Dashboard:** management, monitoring, KPI, analytical and administrative oversight. It is not the everyday Workspace of ordinary users. Clinic Admin retains broad system visibility under the approved authorization model; delegated access follows permissions.

**Overview:** contextual status, summary, attention, KPI and related information. It must not become a second copy of the Domain's operational functions.

Executable work belongs in Workspace/Widgets/Quick Actions or appropriate operational pages when that is the correct surface.

## 10. Global Search

CORE SYSTEM must provide a genuine system-wide Global Search available from a clear and consistent location.

It searches authorized information across Domains without requiring the user to know where the record belongs.

Potential searchable entities include patients, patient numbers, phone numbers, staff, invoices, payments, financial plans, installments, appointments, treatment plans, services/procedures, inventory, suppliers, purchase orders, tasks, requests, communications, records and events.

Results must identify type and context and open directly to the appropriate record.

Global Search must:

- respect tenant isolation;
- respect permissions and privacy;
- work in Arabic and English;
- return relevant cross-domain results;
- not be limited to the current page.

Specialized searches may remain where they are better for a focused workflow.

## 11. Patient Context

When the user is inside a patient context, relevant authorized capabilities should be accessible without unnecessary returns to global navigation.

Potential contextual areas include visits, appointments, treatment, financial information, follow-up, communication, medical records and Portal-related information.

Patient Context is a navigation/interaction surface, not a new Domain and must not change Domain ownership.

## 12. Cross-domain integration

Independent Domain ownership remains unchanged.

The user experience should make the real integrated workflow understandable, for example:

```text
Patient / Visit
↓
Treatment Plan
↓
Financial commitment
↓
Installments / Payments
↓
Appointment / Clinical action
↓
Resource consumption
↓
Operational work
↓
Follow-up
↓
Communication
↓
Patient Portal
↓
Insights
```

These relationships should be exposed through contextual links/actions rather than by merging Domains or creating duplicate ownership.

PJ remains the Patient Journey reference/owner where already established. AJM Domains remain independent capabilities that integrate with PJ.

## 13. Information Architecture reconciliation

Before restructuring, map every relevant page, route, navigation item and major UI surface:

- current location;
- Domain owner;
- purpose;
- parent/child relationship;
- required permission;
- current entry points;
- duplicate entry points;
- intended target surface;
- reusable implementation;
- legacy implementation;
- runtime status.

Target conceptual hierarchy:

```text
Global Navigation
↓
Domains / logical areas
↓
Sub-areas
↓
Features / records
↓
Contextual / operational actions
↓
Workspace tools / Widgets
```

This is an information architecture model, not an authorization hierarchy.

## 14. Duplicate and legacy reconciliation

Search for and reconcile duplicate pages, routes, components, Domain logic, navigation entries, Overview screens, settings, legacy implementations, terminology, multiple entry points, dead routes, deprecated UI, unused UI, contradictory feature flags and old translation systems.

The authoritative implementation must be identified before removal.

No duplicate may be hidden only by removing a Sidebar link.

## 15. Functional validation

A page is not complete because it renders. Relevant functions must be verified for real data, create/edit behavior, primary actions, permissions, persistence, relationships, feedback, loading, empty/error states and end-to-end completion.

Operational paths must be tested from beginning to end.

## 16. Database / backend validation

Where a UX issue may originate below the UI, inspect tables, relationships, constraints, functions, RLS, server actions, queries/APIs, authorization, audit records, tenant isolation and data integrity.

Do not alter database architecture solely to make navigation easier. If the backend/data layer is the root cause, document that cause before correction.

## 17. Mobile and language

The same approved user model applies to desktop, tablet and mobile.

Validate Sidebar, Global Search, Workspace, Widgets, tables, forms, actions, dialogs/drawers, Patient Context, Patient Flow, financial and operational screens.

Arabic and English must have equal meaning and behavior, including navigation, labels, Widget names, search, errors, RTL/LTR, ordering and formatting.

No new hard-coded translation system may be introduced.

## 18. Authorization and safety

Do not change the authorization model merely for UX.

Non-negotiable:

- Role ≠ Permission.
- Workspace ≠ Security Boundary.
- Widget ≠ Permission.
- Patient Flow visibility cannot bypass authorization.
- Clinic Admin remains the tenant's operational authority within approved controls.
- Tenant isolation, privacy and auditability remain mandatory.

## 19. Execution stages

### Stage 0 — Baseline Lock

Inspect approved documentation, repository, database and runtime. Produce current UX Architecture, Navigation Map, Domain Surface Map, Duplication Map, Parent/Child Map, Discoverability findings, Usability findings, Runtime discrepancies and Global Search assessment.

**No product restructuring in this stage.**

### Stage 1 — Navigation & IA Reconciliation

Reconcile the authoritative navigation model and correct hierarchy. Remove only proven duplicate/legacy navigation after identifying the authoritative implementation.

### Stage 2 — User Surface Model

Align Role, Permissions, Sidebar and Workspace with the approved user model. Verify that permissions—not assumed professional categories—determine accessible capabilities.

### Stage 3 — Workspace Foundation

Reuse/extend the existing Workspace implementation. Establish Workspace as the principal working surface. Do not create a second Workspace system.

### Stage 4 — Workspace Personalization

Implement/reconcile Widget add/remove, drag/drop, ordering, scrolling, default configuration, reset and persistence.

### Stage 5 — Widget Library & Classification

Inventory existing Widgets and classify each candidate as informational, actionable, operational, contextual, full page, Quick Action, Sidebar capability, or no Widget required. Attach required permissions and context.

### Stage 6 — Patient Flow / Queue Reconciliation

Preserve and reconcile the existing Patient Flow and Queue. Validate independent Sidebar presence, explicit Clinic Admin enablement, Operations/Clinical/Administrative views, visibility conditions, Queue behavior, drag/drop, patient movement and visit start/close behavior.

### Stage 7 — Patient Context

Improve contextual navigation around the patient without changing Domain ownership.

### Stage 8 — Global Search

Assess existing search and reuse/extend it only as needed to satisfy the Global Search Definition of Done.

### Stage 9 — Overview / Dashboard Reconciliation

Separate contextual summary from management Dashboard and everyday Workspace.

### Stage 10 — Sidebar Finalization

Finalize Sidebar after Workspace and Widget behavior are established. This prevents Sidebar from becoming a substitute for Workspace design.

### Stage 11 — Mobile & Language Validation

Validate the unified model across devices and Arabic/English.

### Stage 12 — Security / Permission Regression

Test combinations of roles and cross-domain permissions. Verify that Workspace customization and Widgets cannot bypass authorization.

### Stage 13 — Runtime / End-to-End Validation

Validate deployed behavior, real data, persistence, navigation, actions and integrations.

### Stage 14 — Legacy Cleanup

Remove only implementations proven obsolete, duplicate or superseded.

### Stage 15 — Documentation Closure

Update all affected governance, architecture, AJM, PJ, Workspace, Patient Flow, navigation and handoff documents. A stage is not closed until its documentation is updated.

## 20. Required scenarios

Test at minimum:

- limited-permission user;
- reception user with and without Patient Flow;
- reception user with selected financial permissions;
- clinical user;
- clinical + financial user;
- administrative Patient Flow user;
- Clinic Admin;
- Widget add/remove/reorder;
- Widget cannot grant permission;
- permission removal removes affected access even if the Widget was previously placed;
- Operations Workspace does not automatically expose Patient Flow;
- Global Search cannot expose unauthorized records;
- mobile Workspace with natural Widget sizes and scrolling/reordering;
- Arabic/English parity.

## 21. Documentation governance

Documentation is part of implementation.

For every stage:

```text
Implement
↓
Validate
↓
Update documentation
↓
Commit
↓
Proceed
```

No future agent should need conversation history to reconstruct an approved decision.

When an older document conflicts with a newer approved decision, explicitly mark/reconcile the older document so two competing interpretations cannot remain active.

## 22. Final Definition of Done

The reorganization is complete only when:

1. Users understand where they are and what they can do.
2. Capabilities are discoverable without knowledge of internal architecture.
3. Workspace is a useful working surface, not merely Overview.
4. Sidebar exposes complete authorized capabilities and is not merely a Widget shortcut list.
5. Widgets are permission-aware, customizable and capable of executable daily work.
6. Patient Flow remains an independent system with Queue and its three approved interfaces.
7. Patient Flow appears only when explicitly enabled/assigned and authorized.
8. Dashboard remains an administrative/management surface.
9. Overview remains contextual rather than a duplicate operational Domain.
10. Global Search works across authorized system data.
11. Patient Context reduces unnecessary navigation without merging Domains.
12. Domain ownership remains independent.
13. Authorization, tenant isolation, privacy and auditability remain intact.
14. Existing useful functionality is preserved.
15. Duplicate/legacy implementations are corrected at their source.
16. Desktop/tablet/mobile behavior is usable.
17. Arabic/English behavior is equivalent in meaning.
18. Runtime matches the approved architecture and implementation.
19. Documentation reflects the final implementation with no contradictory active interpretation.

## 23. Non-negotiable prohibitions

Do not:

- rebuild CORE SYSTEM from scratch;
- create a Domain merely for navigation;
- recreate Patient Flow as Widgets;
- replace the existing Queue without evidence of a genuine need;
- make Workspace a security boundary;
- use Widgets to grant permissions;
- force users into fixed Clinical/Operations screens solely because of role labels;
- turn Dashboard into everyday Workspace;
- turn Overview into a duplicate Domain;
- hide duplicate implementations only through Sidebar changes;
- create parallel implementations where a correct authoritative implementation exists;
- change authorization merely for UX convenience;
- change Domain ownership merely for navigation convenience;
- remove features without proof of duplication, obsolescence, scope exclusion, unusability or supersession;
- leave approved decisions undocumented.

## 24. Relationship to AJM / PJ

AJM continues to define independent administrative/operational Domains and explicit integrations.

PJ continues to own the Patient Journey model and approved behavior.

This plan changes how users encounter and use capabilities; it does not transfer Domain ownership.

Patient Flow remains integrated with the Patient Journey and remains its own user-facing system.

## 25. Implementation authority

This document is the execution plan for the approved Global UX / IA decisions. It must be read together with the final UX/IA authority document, documentation reconciliation, AJM Master Blueprint, AJM Implementation Plan, PJ Master Documents, applicable Domain Blueprints, ADRs and stage closure documents.

Where an explicit newer architectural decision conflicts with an older document, the newer approved decision controls and the older document must be reconciled.

**Reading this plan does not itself execute product changes. Product implementation begins only when the implementation task is explicitly started.**
