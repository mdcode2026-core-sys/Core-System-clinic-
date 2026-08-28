# CORE SYSTEM — Global UX / Information Architecture
# Implementation Plan — 2026-08-28

**Status:** APPROVED EXECUTION PLAN — PRE-IMPLEMENTATION
**Authority:** `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
**Scope:** Global UX, Information Architecture, Navigation, Workspaces, Widgets, Patient Flow, Queue surfaces, Global Search, contextual navigation, Dashboard/Overview separation, mobile, bilingual parity, reconciliation and runtime validation.

---

## 1. Purpose

This plan converts the approved Global UX / IA decisions into an implementation sequence. It is not a greenfield redesign. Existing functionality, domains, Patient Journey ownership, authorization, tenant isolation and valid implementations must be preserved.

The mandatory working rule is:

**READ → INSPECT → MAP → RECONCILE → IMPLEMENT → VALIDATE → DOCUMENT → CLOSE**

And for every item:

**Inspect → Reuse → Extend → Reconcile → Create**

No new implementation is justified merely because a route, table or component already exists or because another product uses a different arrangement.

---

# 2. Non-Negotiable Approved Product Decisions

These are decisions, not recommendations.

## 2.1 User model

A CORE SYSTEM user is a member of the clinic team who has a role. The role is organizational guidance; permissions determine what the user can actually access and perform.

Clinic Admin may assign any available permission to a user regardless of whether the permission is conventionally associated with that user's role. CORE SYSTEM does not impose a presumed real-world job boundary on the clinic.

Clinic Admin controls creation, editing, assignment, delegation and removal of users and roles within the subscription, subject to the platform's non-bypassable security and tenancy controls.

**Role ≠ Permission.**

Role templates are advisory starting points. They are editable, reusable and do not restrict Clinic Admin from creating completely new roles.

## 2.2 Sidebar

Sidebar is the user's complete navigational surface for the capabilities they are authorized to access. It is not a shortcut-only representation of the Workspace.

A capability may appear in Sidebar even when the user does not place a related Widget in Workspace.

Do not create a Sidebar item merely because a route, page or database table exists.

## 2.3 Workspace

Workspace is the user's working surface. It is not merely an Overview, it is not the full list of work, and it is not a security boundary.

The system must not force the product into only two fixed user screens such as Clinical and Operations. The user's effective surface is driven by permissions, while Workspace provides a controlled, personal working environment.

A user has a Workspace and a Sidebar appropriate to the capabilities granted to that user.

The Workspace may contain information, actions and operational tools selected by the user from the capabilities available to them.

A default Workspace may be supplied from an advisory role/template or system default, but the user may personalize it.

**Workspace default ≠ authorization restriction.**

## 2.4 Workspace personalization

The user may add, remove and reorder permitted Widgets and Quick Actions.

Widgets must support drag-and-drop ordering. The Workspace is vertically/continuously scrollable so available Widgets do not have to be forced into one viewport.

Widgets keep their intended size; the system must not arbitrarily shrink or distort a Widget solely to force it into a screen size.

The responsive presentation adapts to desktop, tablet and mobile while preserving the same underlying Workspace and available capabilities.

A reset/restore-default mechanism must be provided.

## 2.5 Widgets

Widgets are reusable user-facing surfaces derived from existing capabilities.

A Widget never grants permission. Permission grants access to the underlying capability; that capability makes the Widget available; the user may then add it to Workspace.

Therefore:

**Permission → Widget availability → User selection → Workspace**

Widgets must be classified before implementation by actual usefulness. A Domain does not need a Widget merely because it has a page or operation.

The classification must distinguish at least:

- Information Widgets.
- Action Widgets.
- Operational Widgets.
- Contextual Widgets.
- Quick Actions that do not need a large Widget surface.
- Full-page capabilities that should remain full pages.
- Capabilities for which a Widget provides no meaningful benefit.

Widgets may be exposed as Sidebar entries when the underlying capability itself legitimately belongs in navigation. A Widget must never become a second authorization path.

## 2.6 Patient Flow / Queue

Patient Flow is an independent system and remains in the Sidebar only when explicitly enabled for the user by Clinic Admin and the required access conditions are met.

Patient Flow is NOT absorbed into Workspace and is NOT replaced by Widgets.

The existing Queue/Patient Flow system must be reused and reconciled rather than replaced merely to support the new UX.

Patient Flow has three user-facing views:

1. **Operations** — operational/reception flow.
2. **Clinical** — clinical flow.
3. **Administrative** — full patient movement/operational oversight, including the ability to oversee and intervene across the other two views as authorized.

The existence of an Operations-oriented Workspace does NOT automatically expose Patient Flow.

Example: a user may have an Operations Workspace and financial permissions while having no Patient Flow access. Patient Flow appears only when Clinic Admin explicitly enables it and associates the appropriate Patient Flow view/context.

## 2.7 Overview

Overview is not the complete Workspace and is not a replacement for operational work.

Overview is for appropriate summary/status/attention/KPI information according to the nature of the relevant area.

## 2.8 Dashboard

Dashboard is an administrative/management surface for monitoring, analysis and oversight.

It is not the same thing as Workspace and must not be used as an alternative operational Workspace for ordinary users.

Clinic Admin retains visibility across the system and may delegate administrative/management access according to permissions.

## 2.9 Global Search

CORE SYSTEM must provide a real system-wide Global Search.

The user must be able to search from anywhere for permitted records without knowing which Domain contains the information.

Results may include, subject to authorization and tenant isolation:

- Patients and patient identifiers.
- Doctors and staff.
- Appointments.
- Invoices and payments.
- Financial plans and installments.
- Treatment plans.
- Services/procedures.
- Inventory items.
- Suppliers and purchase orders.
- Tasks and requests.
- Communications.
- Events and other searchable records.

Results must identify the result type/context and open directly to the appropriate record.

Global Search must respect permissions, privacy and tenant isolation and must work coherently in Arabic and English.

## 2.10 Patient Context / contextual navigation

Patient context must reduce unnecessary cross-Domain navigation without changing Domain ownership.

When a user is within an authorized patient context, relevant capabilities such as visits, appointments, treatment, financial information, follow-up, communication, records and portal-related information may be reached contextually according to permissions.

Patient context is not a new Domain and does not merge existing Domains.

## 2.11 Authorization and architecture

Do not change the authorization model merely to make UX easier.

- Role ≠ Permission.
- Workspace ≠ Security Boundary.
- Clinic Admin is the operational authority for tenant user/role configuration.
- Tenant isolation remains mandatory.
- Domain ownership remains independent.
- PJ remains the owner/reference for the Patient Journey.
- Patient Flow does not redefine PJ.
- Workspace does not redefine Domain ownership.

---

# 3. Execution Stages

## Stage 0 — Baseline and Truth Lock

### Objective
Establish the actual current state before modifying UX behavior.

### Inspect

- Repository navigation and route definitions.
- Workspace implementations.
- Sidebar/navigation registries.
- Dashboard and Overview implementations.
- Widget implementations and registries.
- Patient Flow and Queue implementation.
- Role/permission/role-template code.
- Workspace persistence/settings.
- Feature flags affecting visibility.
- Database tables, relationships, functions, RLS and migrations related to these surfaces.
- Vercel/runtime behavior.
- Current Arabic/English behavior.

### Output
Current UX/IA Truth Map and discrepancy list.

### Gate
No broad UI restructuring until the authoritative existing implementation is identified for each affected capability.

---

## Stage 1 — Navigation and Information Architecture Reconciliation

### Objective
Determine the correct user-facing hierarchy before changing individual screens.

For every current Sidebar item, route and major page determine whether it is:

- Domain.
- Sub-area.
- Feature.
- Configuration.
- Operational action.
- Contextual feature.
- Patient Flow.
- Workspace capability.

### Required outcome

One coherent navigation model without duplicate ownership or navigation registrations.

Do not remove a feature solely because it is inconvenient in Sidebar. Move it only after establishing whether its natural surface is Sidebar, submenu, contextual navigation, Workspace, Widget or Quick Action.

---

## Stage 2 — User Surface from Role + Permissions

### Objective
Make effective permissions the basis for what the user can see and do.

Validate that:

- Role templates remain advisory.
- Direct permission assignment remains possible where approved.
- Mixed-domain permissions are supported.
- Sidebar visibility follows effective access.
- Workspace availability does not grant access.
- Widget availability follows effective access.
- Patient Flow requires explicit enablement/context.

No new security model is introduced.

---

## Stage 3 — Workspace Foundation

### Objective
Make the existing Workspace implementation a true working surface without creating a second Workspace system.

Reuse valid existing Workspace persistence and user settings.

The resulting Workspace must support:

- Useful work at a glance.
- Fast actions.
- Operational tools.
- Information tools.
- Contextual entry points.
- Personal ordering.
- Responsive presentation.

The Workspace must not become a duplicate Sidebar.

---

## Stage 4 — Widget Library and Personalization

### Objective
Create/reconcile a governed collection of reusable Widgets and Quick Actions.

For each candidate Widget record:

- capability;
- permission dependency;
- type;
- intended size;
- context dependency;
- primary action;
- destination;
- supported Workspace use;
- Sidebar eligibility if applicable;
- Arabic label;
- English label.

### User behavior

- Add permitted Widget.
- Remove Widget.
- Drag and drop reorder.
- Scroll through the complete Workspace.
- Reset to default.

### Important
Do not create Widgets for every Domain automatically. Determine their value from the actual workflow.

---

## Stage 5 — Domain-by-Domain Widget Assessment

Review every AJM, Clinical and relevant PJ-connected Domain.

For each major capability ask:

1. Is this used frequently enough to deserve a Widget?
2. Is it urgent or time-saving when surfaced directly?
3. Is it better as a Quick Action?
4. Does it need full-page treatment?
5. Is it contextual to a patient, appointment, visit or another record?
6. Does it need no Widget at all?

The result is a documented Widget inventory rather than a blanket Widget conversion.

---

## Stage 6 — Patient Flow and Queue Reconciliation

### Objective
Preserve the existing Patient Flow/Queue capability and make its relationship to the new user surface explicit.

Validate end-to-end:

Reception → Queue → Clinical → Reception/Financial close → completion.

Validate drag-and-drop behavior, ordering, current patient state, handoff and role-specific views using the existing implementation where correct.

Do not duplicate Queue logic inside Workspace.

Workspace may expose Queue-related Widgets such as waiting/next-patient summaries when the user has the required access, but these Widgets are surfaces of Patient Flow rather than replacements for it.

---

## Stage 7 — Patient Context and Cross-Domain Navigation

### Objective
Make the integrated platform feel like one system while keeping independent Domains.

Review direct contextual navigation between:

- Patient.
- Visit.
- Appointment.
- Treatment Plan.
- Financial Plan.
- Payments/Installments.
- Resource/consumption information where appropriate.
- Follow-up.
- Communication.
- Portal.

Use existing authoritative routes and domain ownership.

---

## Stage 8 — Global Search

### Objective
Deliver the approved system-wide search experience.

### Required behavior

- Available from every major system surface.
- Searches multiple permitted record types.
- Understands Arabic and English input as supported by the data/search design.
- Shows type and context.
- Opens directly to the authorized record.
- Does not leak records through suggestions, counts or snippets.
- Preserves tenant isolation and permissions.

The implementation mechanism must be selected after inspecting existing search infrastructure and data rather than assumed in advance.

---

## Stage 9 — Dashboard / Overview Reconciliation

Review every Dashboard and Overview.

For each, determine whether content is:

- Summary.
- Status.
- Attention.
- KPI.
- Management insight.
- Operational work.
- Configuration.
- Data entry.

Move/reconcile content according to its actual purpose, not merely its current page location.

Do not turn Overview into a second Workspace or Dashboard into a general-purpose operational page.

---

## Stage 10 — Sidebar Final Reconciliation

Only after Workspace, Widgets, Patient Flow and contextual navigation are understood should Sidebar be finalized.

Remove/reconcile only proven:

- duplicate entries;
- obsolete routes;
- duplicate navigation registrations;
- legacy surfaces;
- entries that belong naturally elsewhere.

Do not hide a broken duplicate while leaving the duplicate implementation active.

---

## Stage 11 — Mobile and Responsive Validation

Validate the same user model on:

- Desktop.
- Tablet.
- Mobile.

Workspace remains one user surface. Responsive behavior adapts layout and scrolling without silently removing authorized capabilities.

Validate Sidebar, Global Search, Patient Flow, tables, forms, dialogs/drawers and patient context.

---

## Stage 12 — Arabic / English Parity

Validate all changed surfaces in both languages:

- Sidebar.
- Workspace.
- Widgets.
- Quick Actions.
- Patient Flow.
- Queue.
- Global Search.
- Dashboard.
- Overview.
- Patient Context.
- Empty/error/loading states.
- RTL/LTR.

No hard-coded replacement or post-render translation workaround should be introduced where the unified i18n system is authoritative.

---

## Stage 13 — Permission, Tenant and Regression Validation

Test at least:

- Limited user.
- Operations-oriented user.
- Operations + Financial permissions.
- Clinical user.
- Clinical + Financial permissions.
- Administrative user.
- Clinic Admin.
- User with no Patient Flow enablement.
- User with Patient Flow Operations view.
- User with Patient Flow Clinical view.
- User with Patient Flow Administrative view.

Confirm that Workspace customization never expands authorization.

Confirm that Widgets never expand authorization.

Confirm that Patient Flow visibility requires the approved enablement/context.

Confirm tenant isolation and auditability.

---

## Stage 14 — Runtime Validation

Source code and build success are insufficient.

Validate the published application through realistic flows:

Login → user surface → Sidebar → Workspace → add Widget → reorder → remove → reset → open capability → patient context → Patient Flow → Search → save → reload.

Repeat in Arabic and English and across responsive sizes.

Validate production data paths where the feature requires persistence.

---

## Stage 15 — Root-Cause Legacy Cleanup

After successful validation, identify and remove only implementations proven to be obsolete or duplicated.

Inspect for:

- Duplicate routes.
- Duplicate components.
- Duplicate navigation registration.
- Legacy Workspace/Dashboard implementations.
- Conflicting feature flags.
- Unused UI.
- Deprecated translation paths.
- Dead code affecting visible behavior.

Never use a visual hide, redirect or wrapper as a substitute for root-cause correction when the source is known.

---

## Stage 16 — Documentation and Closure

Documentation is part of Definition of Done.

For every completed stage:

**Implement → Validate → Document → Commit.**

Update all affected:

- Global UX/IA authority document.
- Global UX/IA implementation plan.
- AJM Master Blueprint and relevant AJM implementation/stage documents.
- PJ Master/related journey documents.
- Team & Access documentation.
- Workspace architecture documentation.
- Patient Flow/Queue documentation.
- ADRs.
- Handoffs.
- Master indexes.

Every superseded rule must be explicitly marked so future agents cannot select an obsolete document merely because it still exists.

---

# 4. Definition of Done

The work is complete only when all of the following are true:

1. Users can understand where they are.
2. Users can understand what they can do.
3. Users can find capabilities without knowing CORE SYSTEM's internal architecture.
4. Sidebar represents complete authorized navigation rather than Workspace shortcuts.
5. Workspace is a useful personal working surface.
6. Widgets are permission-dependent, user-selectable and reorderable.
7. Widgets do not grant authorization.
8. Patient Flow remains an independent system with Operations, Clinical and Administrative views.
9. Patient Flow does not appear merely because a user has an Operations Workspace.
10. Queue behavior remains functional and authoritative.
11. Dashboard and Workspace are clearly separated.
12. Overview is not a duplicate of operational work.
13. Global Search works across authorized system data.
14. Patient Context reduces unnecessary navigation without changing Domain ownership.
15. Mobile behavior is usable.
16. Arabic and English remain functionally and semantically aligned.
17. Tenant isolation and authorization remain intact.
18. No duplicate implementation remains where reconciliation has established a single authoritative source.
19. Existing valid capabilities are preserved.
20. Production/runtime behavior reflects the approved implementation.
21. Documentation reflects the actual final state.

---

# 5. Change Control

No implementation may reinterpret an approved decision as an optional recommendation.

If implementation discovers a genuine architectural conflict that cannot be resolved by applying this plan and the current approved documentation, stop at that decision point and record:

1. Previous approved decision.
2. Newly discovered fact.
3. Exact conflict.
4. Available solutions.
5. Impact of each solution.
6. Required owner decision.

Do not silently alter architecture.

Conversely, ordinary implementation defects and incomplete work inside the approved scope must be corrected directly and must not be escalated as architectural decisions.

---

# 6. Final Operating Principle

CORE SYSTEM must feel like one integrated system without becoming one undifferentiated system.

```text
Independent Domains
        ↓
Authorized capabilities
        ↓
Complete Sidebar access
        +
Personal Workspace
        ↓
Widgets / Quick Actions
        ↓
Contextual work
        ↓
Independent Patient Flow / Queue where explicitly enabled
```

The surface is controlled and simple. The underlying system remains deep, integrated, extensible and ready for future automation and AI.
