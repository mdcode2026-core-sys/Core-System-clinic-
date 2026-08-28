# Workspace Architecture — Stage 6 Amendment

**Status:** Approved — superseded by the Global UX / Information Architecture Audit Final Decision (2026-08-28) where this document conflicts with that later decision.

**Authority:** Product Owner decision. This document remains the governing Stage 6 historical baseline, while the later UX/IA decision is authoritative for current Workspace presentation and navigation.

## Reason

The original Workspace specification established the reusable Workspace/Widget architecture. Stage 6 clarified that CORE SYSTEM requires workspace contexts for different operational responsibilities. The 2026-08-28 UX/IA reconciliation further clarifies how those contexts appear to users without changing the underlying independent-domain architecture.

## Current authoritative workspace model

CORE SYSTEM uses **workspaces as working surfaces**, not as fixed role screens and not as permission containers.

The authoritative contexts are:

- **Operations Workspace** — operational/reception work and patient movement responsibilities.
- **Clinical Workspace** — medical work for permitted clinical users.
- **Administration Workspace** — tenant administration and configuration.
- **Global/Home Workspace** — the system-wide entry and orientation surface. It is not a duplicate of the Administration Workspace. For Clinic Admin it is intentionally administration-heavy; for other users it presents only useful cross-system orientation and permitted quick actions.

The workspace model is intentionally flexible:

`Workspace != Role != Permission != Capability`

A Clinic Admin may create roles and assign any available permissions according to the clinic's own operating model. A user may therefore have permissions that cross the conventional boundaries between medical, operational, and administrative work. Permissions determine what the user can access and do; the workspace determines the appropriate working surface in which the permitted capability is presented.

## Patient Flow — independent surface

**Patient Flow** is an independent navigation surface and is not owned by either Operations or Clinical Workspace.

Reason: the same underlying patient movement process serves different users at different points of the clinic journey.

Patient Flow supports three presentation contexts:

1. **Operations** — reception/operational view of patient movement, arrival, routing, return and completion.
2. **Clinical** — clinician-facing view of the patient's position and the clinical handoff/work relevant to the clinician.
3. **Administrative** — full operational visibility across the journey, allowing an authorised administrator to monitor and intervene when operational control requires it.

The Clinic Admin may make Patient Flow available to any user according to the clinic's own configuration. This does not create a second permission system. Existing permissions remain authoritative for access and actions.

## Patient Journey continuity

The patient remains in one tenant-scoped Patient Journey. The operational handoff remains:

`Operations Workspace → Clinical Workspace → Operations Workspace`

Patient Flow is the cross-workspace operational surface that makes this continuity visible and actionable.

The canonical Stage 6 flow remains:

`Scheduled / Walk-in → Arrived → Waiting → With Provider → Pending Reception → Completed`

The clinical user owns the medical portion. Operations/reception owns operational completion after the clinical handoff.

## Operations Workspace

Operations is a **working environment**, not merely an overview.

Its surface may contain operational widgets such as:

- Quick Registration
- Quick Appointment
- Patient Search
- Patient Flow entry/actions
- Operational tasks and requests
- Other capabilities that the current user is permitted to use

If Clinic Admin grants an Operations user a financial permission, the permitted financial function may appear within the user's Operations working surface. If the same user receives a clinical permission, the clinical capability is presented through the Clinical Workspace rather than being mixed into Operations.

This is presentation logic only. It does not redefine domain ownership or permissions.

## Clinical Workspace

Clinical is a working environment for permitted clinical work. Its contents are not restricted to a single hard-coded profession. Clinic Admin may configure permissions and the appropriate workspace availability according to the clinic's actual roles and workflow.

Clinical Overview widgets may be expanded over time, but an Overview remains contextual information and attention support; it is not a replacement for the workspace's operational functions.

## Administration Workspace and Dashboard distinction

Administration Workspace is for administration and configuration work.

A **Dashboard** is an administrative/management observation surface for authorised management users. It is not a second Workspace and must not become a duplicate of the operational or clinical working environment.

For Clinic Admin, the full system remains visible and accessible across workspaces according to the established permission model. Delegated administrative users receive only what their permissions allow.

The distinction is:

- **Workspace:** where the user works.
- **Overview:** what the user needs to understand about the current workspace at a glance.
- **Dashboard:** management/monitoring view of performance, status, KPIs and attention across the system.

## Global/Home Workspace

The Global/Home Workspace is the system-wide entry and orientation surface.

It must not become a fourth business domain or a duplicate of Operations, Clinical, or Administration.

Its primary purposes are:

- orient the user;
- provide global search;
- expose useful cross-system quick actions allowed to the user;
- surface recent/relevant work and attention items;
- provide a controlled entry point into the user's available workspaces.

For Clinic Admin, this surface is intentionally weighted toward administrative and cross-system oversight. For other users, the content is personalized to their permitted work without creating a separate role-specific screen architecture.

## Workspace Membership decision

A separate **Workspace Membership** concept is not required as a user-facing authorization layer.

Workspace availability is derived from the existing permission model and the user's configured access. A separate membership layer must not duplicate permissions or become a second security boundary.

User lifecycle remains a separate concern: activation, invitation, suspension/deactivation, and account status belong to user/account administration, not to Workspace Membership.

## Permission model

Clinic Admin controls user roles and permissions using the existing authorization architecture. The system does not impose profession-based permission restrictions.

All workspace visibility and actions remain permission-controlled server-side. No workspace is a security boundary.

## Navigation hierarchy

The current UX/IA direction is:

`Global/Home → Workspaces → logical sub-areas → contextual features → operational actions`

A feature does not become a top-level Sidebar item merely because it has a route or database table.

Parent/child relationships are determined by domain ownership, user mental model, workflow, and actual use.

## Patient Flow and Queue

Patient Flow is the approved cross-workspace surface. Existing Queue implementations and related legacy surfaces must be reconciled before implementation. No duplicate Queue/Patient Flow implementation may be created merely to support the new navigation model.

## Global Search

Global Search is a system-wide capability, not a page-local search. It must search across permitted tenant-scoped records and features, respect authorization and tenant isolation, identify the type/context of results, and allow direct navigation to the appropriate destination.

## Security and architecture

All workspace access and actions remain server-side permission controlled. Existing tenant resolution, RLS, roles, permissions, role_permissions, clinic_users, and the existing queue/session domain are reused.

No parallel permission, tenant, queue, workspace-security, or subscription architecture is permitted.

## Implementation rule

No implementation begins from this document alone. The final UX/IA audit report and execution plan must be recorded first. Implementation then follows:

`Inspect → Reuse → Extend → Reconcile → Implement → Runtime Validate → Document Closure`

No major architectural change may be introduced without explicit Product Owner approval.
