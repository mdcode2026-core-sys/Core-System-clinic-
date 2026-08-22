# Workspace Architecture — Stage 6 Amendment

**Status:** Approved
**Authority:** Product Owner decision, superseding any conflicting wording in earlier Workspace documentation.

## Reason

The original Workspace specification established the reusable Workspace/Widget architecture. Stage 6 now clarifies that CORE SYSTEM requires **workspace contexts** for different operational responsibilities. This does not create separate systems or duplicate data models.

## Superseding rule

Where earlier documentation describes a single undifferentiated Workspace or a role-named screen, the following Stage 6 model is authoritative:

- **Operation Workspace** — patient movement and operational/reception work.
- **Clinical Workspace** — medical work for permitted clinical users.
- **Administration Workspace** — tenant administration and configuration.

These are workspace contexts within the same CORE SYSTEM platform and Patient Journey, not independent applications.

## Critical distinction

`Workspace != Role != Permission != Capability`

A role is a permission template/assignment mechanism. A workspace is an operational surface. Capabilities determine the actions available within that surface. Clinic Admin controls user permissions using the existing permission architecture.

## Patient Journey continuity

The patient remains in one tenant-scoped Patient Journey. The operational handoff is:

`Operation Workspace → Clinical Workspace → Operation Workspace`

The canonical Stage 6 flow is:

`Scheduled / Walk-in → Arrived → Waiting → With Provider → Pending Reception → Completed`

The clinical user owns the medical portion. Reception/Operation owns operational completion after the clinical handoff.

## Reception requirement

Reception is not a later add-on. Stage 6 includes the complete operational surface required to run reception's Patient Journey responsibilities, including queue management, arrival, routing, return from clinical work, completion, and persisted drag-and-drop for valid operational transitions.

## Clinical requirement

Stage 6 establishes the Clinical Workspace foundation and handoff contract. Later medical stages add the detailed clinical documentation, procedure, treatment, and decision workflows without changing the handoff architecture.

## Administration requirement

Stage 6 establishes permission-based Administration Workspace access for the existing tenant administration architecture. The complete post-PJ administration product remains outside Stage 6.

## Security

All workspace access and actions remain server-side permission controlled. Existing tenant resolution, RLS, `roles`, `permissions`, `role_permissions`, `clinic_users`, and the existing queue/session domain are reused. No parallel permission, tenant, queue, or subscription architecture is allowed.
