# CORE SYSTEM — Global UX / Information Architecture Reorganization
## Approved Implementation Plan — 2026-08-28

**Status:** APPROVED EXECUTION PLAN — RECONCILED 2026-09-11
**Current canonical surface interpretation:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

This plan governs the implementation of the approved Global UX / IA decisions. It is not a redesign from zero and it does not authorize removal of capabilities merely for simplification.

## 1. Governing principles

**READ → INSPECT → MAP → RECONCILE → IMPLEMENT → RUNTIME VALIDATE → DOCUMENT → CLOSE**

Always use:

**Inspect → Reuse → Extend → Reconcile → Create**

Create nothing new when an existing correct implementation can be reused or extended. Do not use visual hiding, duplicate wrappers, temporary redirects, conditional hacks, or other patches instead of correcting the root cause.

The governing product principle remains:

**Independent Modules + Integrated Platform**

UX changes must not transfer Domain ownership, create duplicate Domains or business logic, weaken authorization, tenant isolation or auditability, or redefine Patient Journey ownership.

## 2. Approved user model

A CORE SYSTEM user is a member of the clinic team assigned a Role/job function for organizational purposes and granted effective Permissions according to the clinic's actual work.

The canonical relationship for the user's primary work environment is:

```text
Primary Role / Job Function
        ↓
Primary Work Context / Classification
        ↓
Role Workspace
```

Additional permissions may be granted outside the primary context. They expand authorized capabilities but do not, by themselves, change the user's Primary Role, Primary Work Context or Role Workspace.

**Role ≠ Permission. Role Workspace ≠ Permission.**

Role Templates are advisory starting points. They are editable, reusable and do not restrict Clinic Admin from creating new roles.

## 3. Approved user surfaces

### Sidebar

The Sidebar exposes the user's authorized capabilities and remains the complete navigation surface. It is not merely a collection of Workspace shortcuts and is not the user's Role Workspace.

A capability/domain may appear in Sidebar even when the user does not place a related Widget in My Workspace.

Primary Work Context must not suppress an otherwise authorized Domain.

Do not create artificial labels such as `My Financial` or `My Agenda` merely to represent cross-context permissions.

### Role Workspace

Role Workspace is the user's primary professional working environment associated with the Primary Role / Primary Work Context. It is not a permission set, not the totality of the user's authorized capabilities, and not a substitute for Sidebar.

A Clinical primary user remains in Clinical work context even if additional Financial, Operational, Administrative, Reporting or other permissions are granted.

The existing Clinical and Operational Workspaces remain their established primary work environments unless a separate approved decision changes them.

### My Workspace

My Workspace is the user's personal working/presentation surface associated with the user's Role Workspace.

The user may add, remove, reorder and arrange permitted Widgets/tools here, including authorized capabilities originating outside the primary work context.

My Workspace is not a second Role Workspace and not an authorization system.

### Home

Home is the independent global starting/awareness surface after login. It is not determined by Role Workspace and is not My Workspace.

Home may include daily awareness, global/lightweight utilities, calendar/date utility, external ambient information such as weather, user-selected shortcuts, optional system-managed content, and summarized actionable information that routes to authoritative work destinations.

Home must not own full clinical/operational workflows or become a second Work Center/Workspace.

### Header

The Header is persistent global access, separate from Home and all Workspaces.

Current conceptual global functions:

- system identity/branding;
- existing Global Search;
- Communications access;
- separate compact Chat access backed by Communications;
- Notifications access;
- Quick Actions for global interface/account actions such as Language and Logout.

Quick Actions in the Header must not be confused with Workspace Widget/Quick Action categories.

### My Settings

My Settings remains in the Sidebar as the personal account/preferences destination.

## 4. Patient Flow and Queue

Patient Flow remains an internal workflow/state authority within the Patient Journey. It is not absorbed into Workspace and is not replaced by Widgets.

Patient Flow must not appear to ordinary users as a standalone Sidebar Module/Domain merely because a user has a Clinical or Operational Role Workspace. It remains available in the administrative/background context required by the approved architecture.

The existing Queue/Patient Flow system must be reused and reconciled rather than rebuilt without evidence.

## 5. Dashboard and Overview

**Dashboard ≠ Workspace.**

Dashboard is an administrative/management monitoring surface. Overview is a contextual summary surface for Status, Summary, Attention and KPI information appropriate to its relevant area.

Neither is a substitute for the user's Role Workspace or My Workspace.

## 6. Patient Context

CORE SYSTEM should reduce unnecessary navigation through contextual navigation around the patient and related records while preserving Domain ownership and permissions.

Patient Context is not a new Domain.

## 7. Global Search

CORE SYSTEM must provide true Global Search from a consistent location. It searches authorized data across the system rather than only the current page or Domain.

Global Search is a Header capability, not a Home Widget and not Workspace.

## 8. Execution stages

### Stage 0 — Baseline and implementation lock

Inspect repository, database, runtime, Header, Home, Sidebar, Role Workspace, My Workspace, Widgets, Patient Flow/Queue, Dashboard/Overview, roles, permissions, feature flags and legacy implementations. Produce the current-state and conflict/duplication maps. Do not delete anything solely because it looks old.

### Stage 1 — Navigation and Information Architecture reconciliation

Map every relevant Sidebar item, route and page as Domain, sub-area, feature, configuration, operation, contextual feature, Patient Flow, Workspace capability, Home utility or Header/global access surface. Reconcile duplicate and inappropriate navigation without deleting legitimate capabilities.

### Stage 2 — Permission-to-user-surface reconciliation

Make effective permissions the authoritative input to visible capabilities while keeping the primary Role Workspace stable.

Validate mixed permission combinations, including non-conventional combinations such as reception + financial and clinical + administrative. Verify that additional permission grants do not change the primary Role Workspace.

### Stage 3 — Role Workspace and My Workspace foundation

Inspect and reuse the existing Workspace implementation and persistence where correct.

Establish:

- stable primary Role Workspace from primary work context;
- separate My Workspace personalization;
- no authorization semantics in Workspace personalization;
- permitted cross-context Widgets/tools may appear in My Workspace without changing Role Workspace;
- Home remains separate from both.

### Stage 4 — Widget foundation and personalization

Inspect all current Widgets. Classify them as information, action, operational, contextual, Workspace Quick Action or unsuitable as Widgets. Define required permissions and contexts. Implement selection, removal, ordering, drag/drop, persistence and reset-to-default using existing infrastructure where possible.

### Stage 5 — Domain-by-Domain Widget classification

For each Domain inspect daily workflows, frequent/urgent actions, information requiring quick visibility, contextual actions and full-page functions. Build Widgets only where they materially improve work. Do not force every Domain to have Widgets.

### Stage 6 — Patient Flow and Queue reconciliation

Inspect the existing Patient Flow, Queue, drag/drop behavior, arrival/start/end visit path, reception/clinical/administrative interfaces, saved states, permissions and mobile behavior. Preserve the existing system and reconcile it with the approved workflow model.

### Stage 7 — Patient Flow and Workspace integration

Surface relevant authorized Patient Flow information/actions through Widgets or contextual entry points where useful. Workspace surfaces must never grant Patient Flow access.

### Stage 8 — Patient Context and contextual navigation

Implement/reconcile contextual links and actions around patient, visit and related records. Every action remains permission-filtered.

### Stage 9 — Global Search

Inspect existing search and reuse where correct. Maintain one consistent Header Global Search entry point, multi-entity results and direct navigation while enforcing tenant isolation, authorization and privacy.

### Stage 10 — Dashboard and Overview reconciliation

Audit every Dashboard and Overview. Separate management/monitoring from contextual summary and from operational work/data entry.

### Stage 11 — Final Sidebar reconciliation

After Role Workspace, My Workspace, Widgets and contextual navigation are established, reconcile Sidebar entries. Keep complete authorized navigation independent of primary classification.

### Stage 12 — Responsive/mobile validation

Validate Header, Sidebar, Home, Role Workspace, My Workspace scrolling, Widget sizing, drag/drop, Search, Patient Flow, tables, forms, modals/drawers and patient context on desktop, tablet and mobile.

### Stage 13 — Arabic/English reconciliation

Validate Header, Sidebar, Home, Workspaces, Widgets, Patient Flow, Search, Dashboard/Overview, actions, states, terminology, RTL/LTR, ordering and formatting. Do not allow competing hard-coded translation systems.

### Stage 14 — Authorization, tenant and regression validation

Verify:

- Workspace customization cannot grant access;
- Widgets cannot grant access;
- additional permissions do not change Role Workspace;
- Sidebar visibility follows effective authorization rather than primary classification;
- Home remains independent;
- Header controls remain global;
- Communications and Chat reuse the same authority;
- Notifications remain distinct from Communications/Follow-up;
- Logout remains readily available for shared workstations.

### Stage 15 — Runtime validation

Validate the complete deployed path:

Login → Header/Home → Sidebar → Role Workspace → My Workspace → Widget selection → reorder → capability → patient context → Patient Flow → Global Search → save → reload.

Also validate Header → Communications, Header → Chat, Header → Notifications and Header → Quick Actions → Language/Logout.

Validate both languages and device sizes. Build success alone is insufficient.

### Stage 16 — Legacy cleanup

Only after the authoritative replacement is validated, remove proven duplicate routes/components/navigation registries/obsolete Workspace or Dashboard implementations/old translation paths/contradictory flags/deprecated wrappers/unused UI.

### Stage 17 — Documentation closure

Documentation is part of implementation. After every stage:

**Implementation → Validation → Documentation update → Commit**

Record what was inspected, reused, reconciled, extended, created, removed, validated and documented. Superseded decisions must be explicitly marked as superseded.

## 9. Required validation scenarios

At minimum validate:

1. Reception user with patient/appointment permissions.
2. Reception user with additional financial permissions.
3. Clinical user with clinical permissions.
4. Clinical user with additional financial/administrative permissions while retaining Clinical Role Workspace.
5. Administrative user with appropriate management permissions.
6. Cross-context authorized Domain visible in Sidebar.
7. Patient Flow workflow surfaces according to their approved access/context.
8. Widget add/remove/reorder.
9. Permission removed after Widget configuration.
10. Global patient search.
11. Global invoice/identifier search.
12. Patient contextual navigation.
13. Header Communications access.
14. Header compact Chat.
15. Header Notifications.
16. Header Quick Actions including Language and Logout.
17. Shared workstation: User A → Logout → User B.
18. Arabic/English parity.
19. Mobile Home/Workspace/Sidebar/Widget interaction.
20. Tenant isolation and unauthorized access attempts.

## 10. Definition of Done

The work is complete only when:

- Sidebar is coherent and reflects authorized capabilities;
- Role Workspace represents primary professional work context;
- My Workspace is personal and configurable;
- additional permissions expand access without redefining Role Workspace;
- Widgets are reusable and permission-dependent;
- executable Widgets exist where materially useful;
- unsuitable Domains are not forced into Widget form;
- Patient Flow remains independent;
- Dashboard and Workspace are clearly separated;
- Overview is not a duplicate operational surface;
- Global Search works across authorized data;
- Patient Context reduces unnecessary navigation;
- Global Header remains persistent and coherent;
- Communications/Chat/Notifications boundaries are preserved;
- Logout remains easily accessible;
- Role Templates remain flexible and advisory;
- authorization and tenant isolation remain intact;
- Arabic/English parity is preserved;
- mobile behavior is validated;
- duplicates/legacy implementations are removed only after proof;
- runtime matches approved behavior;
- documentation matches implementation and current terminology.

## 11. Change-control rule

No new architectural decision may be silently introduced during execution. If an implementation exposes a conflict not resolved by the binding decisions or the 2026-09-11 canonical reconciliation, stop at that decision point and document the approved decision, the newly discovered conflict, repository/database/runtime evidence, possible resolutions and the exact decision required. Do not turn an implementation preference into an architectural decision without approval.
