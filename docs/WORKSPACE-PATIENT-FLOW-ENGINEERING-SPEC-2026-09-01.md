# CORE SYSTEM — Workspace & Patient Flow Engineering Specification
## Reconciled against repository reality and Git history — 2026-09-01

Status: **IMPLEMENTATION BASIS**
Authority: `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`

## 1. Objective

Bring the existing Workspace, navigation, Patient Flow, Role, permission and widget implementation into exact alignment with the approved architecture, while preserving existing domain ownership and reusing working components.

## 2. Non-negotiable boundaries

- Patient Journey is not Patient Flow.
- Patient Flow remains an internal workflow and is not a user Sidebar module/domain.
- Clinical / Operational / Administration are Patient Flow work classifications, not Roles and not permission sets.
- Workspace assignment is independent of effective permissions and is administratively assigned.
- Permissions control capabilities within the assigned Workspace and the Modules/Domains the user can access.
- Clinic Admin is tenant authority, not an ordinary user with a large permission bundle.
- My Workspace is personal customization of the assigned Workspace; My Settings is personal account settings.
- Home is the login landing surface and is not a business Workspace.
- Global Search is a header search bar, not a Home/Workspace surface.

## 3. Current implementation findings

1. `currentWorkspace.ts` correctly reads the assigned Workspace from `clinic_user_workspaces`, but retains a legacy Role-based fallback. This fallback must be removed or isolated as migration-only behavior so it cannot redefine the architectural source of truth.
2. `workspaceSurfaces.ts` contains the correct three business Workspaces but also retains a `global` surface and legacy permission-oriented API parameters. Global must be treated as Home, not a business Workspace.
3. `navigationRegistry.ts` correctly marks Patient Flow contextual, but still models Patient Flow as a navigation group with user-facing Operations/Clinical/Administrative children. This must be removed from ordinary navigation while preserving the underlying workflow routes for authorized administrative/background use.
4. `patient-flow/page.tsx` currently presents Operations/Clinical/Administrative as selectable Patient Flow views. This is not the approved model and must no longer be the ordinary user's Workspace model.
5. `WorkspaceRenderer.tsx` already provides per-workspace widget rendering and personalization and should be reused.
6. `widgetRegistry.ts` already places Quick Registration and Quick Appointment in Operations and clinical workflow widgets in Clinical. These mappings should be preserved where they match the approved work model, then expanded/adjusted only from validated domain behavior.
7. Widget authorization currently checks the existence of a required permission. The engineering model must preserve server authorization and introduce capability-level behavior where the existing permission catalog supports distinct read/create/update/delete actions. No widget may expose an action not authorized by the user.
8. User Settings no longer permits users to select Workspace; this is correct. Workspace assignment belongs to clinic administration.
9. The repository history shows an earlier permission-derived Workspace model and a later assigned-Workspace correction. The new implementation must eliminate remaining mixed-mode behavior rather than layering another fallback.

## 4. Target navigation contract

Ordinary subscribed clinic user:

LOGIN → HOME → WORKSPACE / MY WORKSPACE → MODULES / DOMAINS → MY SETTINGS

Sidebar:

- Workspace / My Workspace
- Authorized Modules and Domains, grouped by Clinical / Operational / Administration where appropriate to the domain navigation model
- My Settings
- No Patient Flow item

The exact display label for the assigned Workspace need not expose `clinical`, `operation`, or `administration` if the product UX does not require it.

## 5. Assignment contract

`clinic_user_workspaces` is the authoritative persisted assignment/default Workspace for ordinary users.

Resolution:
- read assigned Workspace;
- validate it is one of the three business Workspaces;
- do not derive it from effective permissions;
- do not let user personal settings override it;
- Clinic Admin can assign/change it through administration settings.

For Clinic Admin, tenant authority must not be reduced to an ordinary Workspace/permission decision. Its administration surface is special and may expose the full currently available tenant platform for the test account.

## 6. Workspace contract

Clinical:
- daily medical work;
- queue/clinical visit and clinical actions;
- medical files and other clinical widgets as authorized.

Operational:
- daily execution/reception/coordination;
- queue movement and operational patient handling;
- quick registration/appointment where authorized;
- other operational actions.

Administration:
- clinic administration, financial/resource oversight, customer follow-up and management capabilities as authorized;
- administrative widgets and controls;
- must not be treated as a replacement for Clinic Admin authority.

## 7. My Workspace contract

- Start with important executable widgets appropriate to the user's assigned Workspace and permissions.
- Allow informational widgets where useful.
- Allow user arrangement/visibility customization.
- Never allow customization to grant access.
- Remove or lock stale widgets after permission changes according to the chosen safe UX.

## 8. Widget capability contract

Widget availability = Workspace context + product capability/entitlement + effective permission.

Action exposure must reflect permission granularity:
- read → information only;
- create/write → create/write only;
- update/edit → update capability;
- delete → delete capability;
- absent permission → no widget/action, or intentionally locked `🔐` presentation where useful.

This contract is enforced at the action boundary as well as the UI.

## 9. Home contract

Home is a separate landing surface. It may contain general daily context such as appointment counts, reminders, notifications, internal communications, Patient Portal/Work Center information and other approved general information. Operational quick actions do not become Home defaults merely because they are useful.

## 10. Patient Flow contract

Patient Flow remains available as a workflow implementation and administrative/background surface. It must not become a Module/Domain in the ordinary user Sidebar and must not be confused with Patient Journey.

The three work classifications may be used by Clinic Admin when assigning a user's primary work context. They are not permissions.

## 11. Data/DB rule

No new Workspace table is required by this specification. Reuse `clinic_user_workspaces` and existing tenant/user/role/permission architecture. Any migration is permitted only when required to reconcile existing data or enforce the approved contract.

## 12. Compatibility/debt rule

Legacy code paths that encode permission-derived Workspace, user-selected Workspace, Global-as-Workspace, or Patient-Flow-as-navigation must be removed or explicitly isolated from runtime. Do not preserve contradictory behavior merely for compatibility.

## 13. Verification contract

Before closure, validate:
- Home is distinct from Workspace.
- Each business Workspace has its own correct working surface.
- Patient Flow is absent from ordinary Sidebar.
- Clinic Admin can administer the tenant and access the intended test surface.
- A user assigned Clinical remains Clinical even when granted selected Operational/Administration permissions.
- Modules/Domains appear only when authorized.
- My Workspace personalization cannot elevate permissions.
- Widget actions match permission level.
- My Settings contains personal settings and does not assign Workspace.
- Global Search remains a header search bar and is authorization-aware.
- No regression to Patient Journey/domain ownership.
