# CORE SYSTEM — Global UX / Information Architecture
# Implementation Plan — 2026-08-28

**Status:** APPROVED EXECUTION PLAN — RECONCILED 2026-09-11
**Authority:** `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
**Current surface interpretation:** `CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`
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

A CORE SYSTEM user has a Role/job function. Role is organizational/configuration information; effective Permissions determine what the user can access and perform.

The primary relationship for work context is:

```text
Primary Role / Job Function
        ↓
Primary Work Context / Classification
        ↓
Role Workspace
```

Additional permissions may be assigned outside the primary context. They do not, by themselves, change the user's Role, Primary Work Context or Role Workspace.

Clinic Admin may assign available permissions regardless of the convention associated with the user's role. CORE SYSTEM does not impose an assumed real-world job boundary on the clinic.

Role templates are advisory starting points. They are editable, reusable and do not restrict Clinic Admin from creating custom roles.

**Role ≠ Permission ≠ Role Workspace.**

## 2.2 Sidebar

Sidebar is the complete navigational surface for capabilities the user is authorized to access. It is not a mirror of the Role Workspace and not merely a shortcut list for My Workspace.

An authorized capability/domain may appear in Sidebar even when the user does not place a related Widget in My Workspace.

Primary Work Context must not suppress an otherwise authorized Domain.

Do not create artificial labels such as `My Financial` or `My Agenda` merely to represent cross-context permissions.

## 2.3 Role Workspace

Role Workspace is the user's primary professional work environment associated with their Primary Role / Primary Work Context.

The system must not treat Role Workspace as:

- a permission set;
- a Role;
- a security boundary;
- a complete inventory of all capabilities the user possesses;
- a substitute for Sidebar navigation.

A Clinical primary user therefore remains in the Clinical work environment even if additional Financial, Operational, Administrative, Reporting or other permissions are granted.

The existing Clinical and Operational Workspaces remain their established primary work environments. Additional permissions must not force unrelated responsibilities into those workspaces.

**Additional Permission ≠ Role Workspace change.**

## 2.4 My Workspace

My Workspace is the user's personal working/presentation surface associated with the user's primary Role Workspace.

It is not a second Role Workspace and not an authorization layer.

The user may arrange permitted work/tools/widgets here, including authorized capabilities originating outside the user's primary work context.

Personalization affects presentation only. It must never grant or revoke authorization or alter Patient Flow ownership.

Workspace Widgets and **Global Header Quick Actions are separate concepts**. The former belong to personal work presentation; the latter are global interface/account actions.

## 2.5 Widgets

Widgets are reusable user-facing surfaces derived from existing capabilities.

A Widget never grants permission. Permission grants access to the underlying capability; that capability may make a Widget available; the user may then arrange it in My Workspace or another supported surface.

Therefore:

**Permission → capability availability → Widget availability → user presentation**

Widgets must be classified before implementation by actual usefulness. A Domain does not need a Widget merely because it has a page or operation.

The classification must distinguish at least:

- Information Widgets.
- Action Widgets.
- Operational Widgets.
- Contextual Widgets.
- Workspace Quick Actions that do not need a large Widget surface.
- Full-page capabilities that should remain full pages.
- Capabilities for which a Widget provides no meaningful benefit.

The term `Workspace Quick Action` must not be confused with `Global Header Quick Actions`.

## 2.6 Patient Flow / Queue

Patient Flow is an internal workflow/state authority within the Patient Journey. It is not a permission model and not an ordinary-user standalone Sidebar Domain.

Patient Flow remains available in the administrative/background context required by the architecture and its operational/clinical workflow surfaces remain the authoritative workflow views.

The existence of an Operations, Clinical or Administration Role Workspace does not itself grant Patient Flow access and does not turn Patient Flow into a Sidebar Domain.

The existing Queue/Patient Flow system must be reused and reconciled rather than replaced merely to support the new UX.

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
- Role Workspace ≠ Permission.
- Workspace ≠ Security Boundary.
- Additional permissions do not redefine the primary Role Workspace.
- Sidebar authorization is independent of primary work classification.
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
- Header/global shell implementations.
- Workspace implementations and context resolution.
- Sidebar/navigation registries.
- Home implementation and Home data/widgets.
- Dashboard and Overview implementations.
- My Workspace implementation, widget registry, renderer and persistence.
- Patient Flow and Queue implementation.
- Role/permission/role-template code.
- Communications, Notifications, authentication/session/logout and language controls.
- Feature flags affecting visibility.
- Database tables, relationships, functions, RLS and migrations related to these surfaces.
- Vercel/runtime behavior.
- Current Arabic/English behavior.
- Historical documents and archive markers relevant to these concepts.

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
- Home/global utility.
- Header/global access surface.

### Required outcome

One coherent navigation model without duplicate ownership or navigation registrations.

Do not remove a feature solely because it is inconvenient in Sidebar. Move it only after establishing whether its natural surface is Sidebar, submenu, contextual navigation, My Workspace, Home, Header, Widget or Quick Action.

---

## Stage 2 — User Surface from Role + Permissions

### Objective
Make effective permissions the basis for what the user can see and do, without allowing permission expansion to redefine the primary professional workspace.

Validate that:

- Role templates remain advisory.
- Direct permission assignment remains possible where approved.
- Mixed-domain permissions are supported.
- Sidebar visibility follows effective access.
- Primary work classification does not suppress authorized Domains.
- Role Workspace remains stable when additional permissions change.
- My Workspace can expose permitted cross-context tools without changing Role Workspace.
- Workspace availability does not grant access.
- Widget availability follows effective access.
- Patient Flow remains governed by its approved access/context rules.

No new security model is introduced.

---

## Stage 3 — Workspace Foundation

### Objective
Make the existing Role Workspace implementations true work environments without creating a second Workspace system.

Reuse valid existing Workspace persistence and user settings.

The resulting Role Workspace must support the work required by its primary context. It must not become a generic permission dashboard.

My Workspace remains a separate personal presentation layer associated with the user's Role Workspace.

The Workspace system must preserve clear separation between:

- Role Workspace;
- My Workspace;
- Sidebar;
- Home;
- Header.

---

## Stage 4 — Widget Library and Personalization

### Objective
Create/reconcile a governed collection of reusable Widgets and Workspace Quick Actions.

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
- Scroll through the complete My Workspace.
- Reset to default.

Global Header Quick Actions are specified separately and are not part of My Workspace personalization merely because both use shortcut-like interactions.

### Important
Do not create Widgets for every Domain automatically. Determine their value from the actual workflow.

---

## Stage 5 — Domain-by-Domain Widget Assessment

Review every AJM, Clinical and relevant PJ-connected Domain.

For each major capability ask:

1. Is this used frequently enough to deserve a Widget?
2. Is it urgent or time-saving when surfaced directly?
3. Is it better as a Workspace Quick Action?
4. Does it need full-page treatment?
5. Is it contextual to a patient, appointment, visit or another record?
6. Does it need no Widget at all?

The result is a documented Widget inventory rather than a blanket Widget conversion.

---

## Stage 6 — Patient Flow and Queue Reconciliation

### Objective
Preserve the existing Patient Flow/Queue capability and make its relationship to the user surfaces explicit.

Validate end-to-end:

Reception → Queue → Clinical → Reception/Financial close → completion.

Validate drag-and-drop behavior, ordering, current patient state, handoff and work-context views using the existing implementation where correct.

Do not duplicate Queue logic inside Home, Header, My Workspace or Role Workspace.

Home/My Workspace/Workspace may expose Queue-related summaries or entry points where appropriate and authorized, but these are surfaces of Patient Flow rather than replacements for it.

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

Do not turn Overview into a second Role Workspace or Dashboard into a general-purpose operational page.

---

## Stage 10 — Sidebar Final Reconciliation

Only after Role Workspace, My Workspace, Widgets, Patient Flow and contextual navigation are understood should Sidebar be finalized.

Remove/reconcile only proven:

- duplicate entries;
- obsolete routes;
- duplicate navigation registrations;
- legacy surfaces;
- entries that belong naturally elsewhere.

Do not hide a broken duplicate while leaving the duplicate implementation active.

The Sidebar must remain independent from the user's primary Role Workspace: authorized cross-context Domains remain normally accessible.

---

## Stage 11 — Mobile and Responsive Validation

Validate the same user model on:

- Desktop.
- Tablet.
- Mobile.

Role Workspace and My Workspace remain distinct concepts. Responsive behavior adapts layout and scrolling without silently removing authorized capabilities.

Validate Header, Sidebar, Home, Global Search, Patient Flow, tables, forms, dialogs/drawers and patient context.

---

## Stage 12 — Arabic / English Parity

Validate all changed surfaces in both languages:

- Header.
- Sidebar.
- Home.
- Workspace.
- My Workspace.
- Widgets.
- Workspace Quick Actions.
- Global Header Quick Actions.
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
- User with no Patient Flow access where applicable.
- User with Patient Flow access/context where applicable.

Confirm that:

- Workspace customization never expands authorization.
- Additional permissions do not change Role Workspace.
- Widgets never expand authorization.
- Sidebar exposes authorized Domains outside primary classification.
- Home remains independent of Role Workspace/My Workspace.
- Header global controls remain available from any authenticated surface.
- Chat/Communications reuse their authoritative domain.
- Logout remains accessible for shared-device operation.

Confirm tenant isolation and auditability.

---

## Stage 14 — Runtime Validation

Source code and build success are insufficient.

Validate the published application through realistic flows:

Login → Header/Home → Sidebar → Role Workspace → My Workspace → add Widget → reorder → remove → reset → open capability → patient context → Patient Flow → Search → save → reload.

Also validate:

Header → Communications
Header → Chat
Header → Notifications
Header → Quick Actions → Language / Logout

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
- Terminology/reconciliation register.

Every superseded rule must be explicitly marked so future agents cannot select an obsolete document merely because it still exists.

---

# 4. Definition of Done

The work is complete only when all of the following are true:

1. Users can understand where they are.
2. Users can understand what they can do.
3. Users can find capabilities without knowing CORE SYSTEM's internal architecture.
4. Sidebar represents complete authorized navigation rather than Role Workspace or My Workspace shortcuts.
5. Role Workspace represents the user's primary professional work context.
6. My Workspace is a personal working/presentation surface.
7. Additional permissions can expand Sidebar/Widget/My Workspace access without redefining Role Workspace.
8. Widgets are permission-dependent, user-selectable and reorderable.
9. Workspace Widgets and Global Header Quick Actions remain distinct concepts.
10. Widgets do not grant authorization.
11. Patient Flow remains an independent workflow/state authority.
12. Queue behavior remains functional and authoritative.
13. Dashboard and Workspace are clearly separated.
14. Overview is not a duplicate of operational work.
15. Global Search works across authorized system data.
16. Patient Context reduces unnecessary navigation without changing Domain ownership.
17. Header remains persistent and provides its approved global access surfaces.
18. Communications and Chat remain distinct presentation intents over the same authoritative Communications domain.
19. Notifications remain separate from Communications and Follow-up.
20. Logout remains rapidly accessible for shared workstation use.
21. Mobile behavior is usable.
22. Arabic and English remain functionally and semantically aligned.
23. Tenant isolation and authorization remain intact.
24. No duplicate implementation remains where reconciliation has established a single authoritative source.
25. Existing valid capabilities are preserved.
26. Production/runtime behavior reflects the approved implementation.
27. Documentation reflects the actual final state and the canonical terminology.

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
Primary Role
     ↓
Primary Work Context
     ↓
Role Workspace

Effective Permissions
     ↓
Authorized Domains / Capabilities
     ├── Sidebar
     ├── Widgets
     └── My Workspace

Home
     └── Global starting / awareness surface

Global Header
     ├── Search
     ├── Communications
     ├── Chat
     ├── Notifications
     └── Quick Actions
```

The surface is controlled and simple. The underlying system remains deep, integrated, extensible and ready for future automation and AI.
