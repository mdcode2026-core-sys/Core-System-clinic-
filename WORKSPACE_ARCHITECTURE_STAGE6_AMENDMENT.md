# Workspace Architecture — Stage 6 Amendment

**Status:** HISTORICAL STAGE-6 BASELINE — RECONCILED 2026-08-28
**Authority for current behavior:** `GLOBAL_UX_IA_FINAL_DECISIONS_AMENDMENT_2026-08-28.md`, `GLOBAL_UX_IA_AUDIT_FINAL_REPORT_2026-08-28.md`, and the current `WORKSPACE_ARCHITECTURE_SPECIFICATION.md`.

This document preserves Stage 6 architectural history. Where older Stage 6 wording conflicts with the later 2026-08-28 decisions, the later decisions are authoritative.

## 1. Stage 6 continuity

The Stage 6 Workspace architecture established Workspaces as working surfaces rather than fixed role screens. The 2026-08-28 reconciliation retains that principle and extends it with explicit personalization, Widget behavior, Patient Flow activation/context and the final Dashboard/Overview distinction.

## 2. Authoritative user model

`Role ≠ Permission ≠ Workspace ≠ Capability`

Role is an organizational starting template. Clinic Admin may modify roles, create new roles, save/reuse templates and assign any available permissions according to the clinic's own operating model.

Permissions determine actual capabilities. Profession-based assumptions do not restrict Clinic Admin from assigning capabilities across conventional boundaries within the existing authorization model.

Workspace is the user's working environment and is not a security boundary.

## 3. Workspace contexts

### Operations

Operations is a real working environment. It may expose permitted operational work such as Quick Registration, Quick Appointment, Patient Search, tasks/requests and permitted financial capabilities.

Patient Flow is available in Operations only when explicitly enabled/configured for that user in Operations context.

### Clinical

Clinical is a real working environment for permitted clinical work. It is not a fixed Doctor screen.

Patient Flow is available in Clinical only when explicitly enabled/configured for that user in Clinical context.

### Administration

Administration is the tenant administration/configuration working environment. It is not the same thing as the management Dashboard.

### Global/Home

Global/Home is the system-wide orientation/entry surface with Global Search, permitted cross-system Quick Actions, recent/relevant work, attention items and controlled entry to available workspaces. It is administration-heavy for Clinic Admin while preserving full system visibility.

## 4. Workspace personalization — authoritative

Workspace is personalized by the user within their granted capabilities.

Users may add/remove permitted Widgets, reorder them by drag and drop, place frequent tools earlier and move through additional selected Widgets beyond the initial viewport.

Widgets retain usable sizes. The system does not shrink Widgets merely to fit more content into one viewport. Additional selected Widgets remain available through the movable/scrollable Workspace.

Useful defaults and templates are provided so users do not start from an empty screen.

## 5. Widget model — authoritative

Widgets are reusable working tools, not only Overview cards.

They may provide information, actions, attention/operational support or contextual summary. Not every Domain requires a Widget.

Widget availability follows existing permission checks. Widgets do not grant permissions and cannot bypass authorization.

Widgets may be organized in a library using categories based on actual Domain/workflow inspection, such as Patients, Appointments, Clinical, Financial, Operations, Communication, Tasks, Inventory/Resources, Analytics/Information and System.

Widgets may also be offered in a clearly separated optional quick-access area within the user's Sidebar. This is convenience only and does not replace full Domain/Feature navigation.

## 6. Role templates and Workspace defaults

Existing role templates remain aids, not fixed screens. Future templates may provide:

`Role + initial Permissions + initial Workspace arrangement + suggested Widgets`

Clinic Admin remains free to modify or replace all of these settings.

## 7. Patient Flow — final reconciliation

Patient Flow is one independent Sidebar/system surface with three contextual interfaces:

1. Operations — reception/operational movement.
2. Clinical — clinician-facing movement and handoff.
3. Administrative — complete operational visibility/intervention for authorized administrators.

These are three interfaces for one Patient Flow system, not three systems.

Patient Flow must not appear merely because a user's Role is Operations, Reception, Doctor or another role name.

Clinic Admin explicitly enables Patient Flow and selects its context for the user. An Operations user may therefore have Operations Workspace without Patient Flow.

The existing drag-and-drop workflow is a real state-changing operational action and must be preserved.

The operational handoff remains:

`Operations → Clinical → Operations`

Existing Queue/Patient Flow implementations must be reconciled into one canonical workflow implementation before duplicate/legacy removal.

## 8. Dashboard vs Workspace vs Overview

**Workspace:** where the user works.

**Overview:** contextual status, summary, attention, contextual KPIs and supporting information. It must not duplicate Workspace operations.

**Dashboard:** authorized management/monitoring view of performance, trends, cross-system KPIs, status and management attention.

Dashboard is not an administrative Workspace.

Clinic Admin retains complete system visibility/access according to the established authorization model; delegated administrators see what their permissions allow.

## 9. Sidebar and Information Architecture

Sidebar is the complete map of accessible capabilities, organized according to Domain ownership, user mental model and workflow.

A route/table/component does not automatically become a top-level Sidebar item.

Patient Flow remains an independent explicit Sidebar surface.

## 10. Global Search

Global Search is a true system-wide capability across permitted tenant-scoped data. It identifies result type/context, navigates directly, respects authorization/tenant isolation and supports Arabic and English.

It coexists with contextual searches where those are faster.

## 11. Patient Context

Patient-centered work should provide authorized contextual access to related Domains such as visits, treatment plans, appointments, financial information, medical files/photos, follow-up, communication and Patient Portal without requiring unnecessary return to global navigation.

This does not change Domain ownership.

## 12. Workspace Membership

A separate user-facing Workspace Membership authorization layer is rejected. Workspace availability derives from existing user/role/permission configuration and approved context. Account lifecycle remains separate.

## 13. Mobile and bilingual requirements

The same hierarchy must remain understandable on small screens. Workspace Widgets retain usable dimensions; additional selected Widgets remain accessible through scrolling; touch reordering is required.

Arabic and English must have equivalent meaning and behavior across navigation, Workspace, Widgets, Search, Patient Flow, Overview, Dashboard, actions, states, terminology, RTL/LTR and formatting.

## 14. Architecture preservation

No UX change may:

- transfer Domain ownership for convenience;
- create duplicate Domains;
- create a second permission system;
- use Workspace as security;
- bypass tenant isolation/RLS/auditability;
- redefine Patient Journey ownership;
- remove valid capabilities merely to simplify the surface;
- create duplicate Patient Flow/Queue workflows.

Use:

`Inspect → Reuse → Extend → Reconcile → Create`

## 15. Documentation governance

Every implementation stage must document decisions, canonical implementations, changed routes/components, data changes, permission effects, legacy reconciliation and runtime verification.

The 2026-08-28 final decision amendment is authoritative. No later wording may silently convert an approved decision into an optional recommendation.

## 16. Implementation gate

No product implementation begins from this historical Stage 6 document alone. Implementation follows the current Global UX/IA decisions and execution plan after documentation and repository/data reconciliation are complete.
