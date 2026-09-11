# PJ Stage 6 — Workspace Architecture Decision

## Status
Approved for Stage 6 implementation — historical architecture record, reconciled 2026-09-11.

**Current canonical interpretation:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

> **2026-09-11 clarification:** This document's original phrase “role/capability-aware workspaces” must not be interpreted as saying that total permissions determine or continuously redefine a user's Role Workspace. The current model is: `Primary Role / Job Function → Primary Work Context / Classification → Role Workspace`. Additional effective permissions expand authorized capabilities/Sidebar/Widgets/My Workspace without changing the primary Role Workspace.

## Product Owner decision

CORE SYSTEM Patient Journey uses distinct primary work environments for different work contexts rather than a single role-specific screen architecture.

### Workspace model

- **Operation Workspace** — operational patient movement, reception/front-desk workflow, queue, arrival, routing, return from clinical work, completion, and operational follow-up handoff.
- **Clinical Workspace** — medical work for the primary clinical user. Doctor, laser specialist, laser technician, nurse, or another tenant-approved clinical user may use the same Clinical primary work environment according to their primary work context and effective permissions. Detailed medical workflows are expanded in later clinical stages.
- **Administration Workspace** — tenant administration, configuration, users, roles, permissions, modules, and later non-Patient-Journey administration. Stage 6 establishes the access foundation but does not implement the complete administration product.

## Governing relationship

```text
Primary Role / Job Function
        ↓
Primary Work Context / Classification
        ↓
Role Workspace

Effective Permissions
        ↓
Authorized Capabilities
        ├── Sidebar
        ├── Widgets
        └── My Workspace
```

`Role Workspace != Role != Permission != Capability`

A user's primary role/work context determines the primary Role Workspace. The user's effective permissions determine what they are authorized to do or access. Additional permission grants do not automatically create additional Role Workspaces or change the primary Role Workspace.

Clinic Admin remains the tenant administrator responsible for configuring roles, permissions, work contexts and Workspace assignment through the existing architecture.

## My Workspace relationship

My Workspace is the user's personal working/presentation surface associated with their primary Role Workspace.

It may contain permitted tools/widgets originating from outside the primary work context when the user is authorized.

This cross-context capability does not change the user's primary Role Workspace.

## Home relationship

Home is independent from Role Workspace and My Workspace. It is the global starting/awareness surface after login and is not selected by the user's total permissions.

## Sidebar relationship

Sidebar is authorized navigation. It is not a representation of Role Workspace. A user may see authorized Domains outside the primary work context under their normal Domain names.

## Shared Patient Journey state

The patient does not move between separate systems. All workspaces operate on the same Patient Journey state and tenant-scoped entities.

Primary Stage 6 handoff:

`Operation Workspace → Clinical Workspace → Operation Workspace`

Operational state:

`Scheduled / Walk-in → Arrived → Waiting → With Provider → Pending Reception → Completed`

`No-show` and `Cancelled` are terminal operational outcomes.

## Reception / Operation requirement

Reception is not a deferred future screen. The Stage 6 Operation Workspace is the operational command surface for reception and other permitted operational users. It must support the patient flow from arrival through return and completion, including persisted drag-and-drop for valid operational transitions.

## Clinical requirement

Clinical Workspace owns the medical work portion of the journey. When the clinical user finishes the current medical work, the session moves to `pending_close` and returns to Operation Workspace for reception completion. Detailed clinical documentation remains in later clinical stages.

## Security requirement

Workspace presentation is separate from authorization. The implementation must reuse the existing `permissions`, `roles`, `role_permissions`, `clinic_users`, tenant resolution, and RLS architecture. No parallel role, permission, tenant, queue, or subscription system is permitted.

Workspace access/route availability must still be authorization-enforced. However, authorization is not the source of the user's primary work identity and additional permissions do not redefine Role Workspace.

## Stage boundary

Stage 6 establishes the workspace/handoff foundation and complete operational Queue/Reception workflow. It does not implement the full future Clinical Workspace medical chart, treatment planning, follow-up engine, or the complete Administration Workspace.

**End of Stage 6 Workspace Architecture Decision.**
