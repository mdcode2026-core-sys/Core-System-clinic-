# PJ Stage 6 — Workspace Architecture Decision

## Status
Approved for Stage 6 implementation.

## Product Owner decision
CORE SYSTEM Patient Journey uses role/capability-aware workspaces rather than a single role-specific screen architecture.

### Workspace model

- **Operation Workspace** — operational patient movement, reception/front-desk workflow, queue, arrival, routing, return from clinical work, completion, and operational follow-up handoff.
- **Clinical Workspace** — medical work for the assigned clinical user. Doctor, laser specialist, laser technician, nurse, or another tenant-approved clinical capability may use the same workspace foundation with different permissions/capabilities. Detailed medical workflows are expanded in later clinical stages.
- **Administration Workspace** — tenant administration, configuration, users, roles, permissions, modules, and later non-Patient-Journey administration. Stage 6 establishes the access foundation but does not implement the complete administration product.

## Governing relationship

`Workspace != Role != Permission != Capability`

A user's role/template and individual permission assignments determine which workspace(s) and actions are available. Clinic Admin remains the tenant administrator responsible for configuring users and permissions through the existing permission architecture.

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

Workspace access is permission-driven and enforced server-side. The implementation must reuse the existing `permissions`, `roles`, `role_permissions`, `clinic_users`, tenant resolution, and RLS architecture. No parallel role, permission, tenant, queue, or subscription system is permitted.

## Stage boundary

Stage 6 establishes the workspace/handoff foundation and complete operational Queue/Reception workflow. It does not implement the full future Clinical Workspace medical chart, treatment planning, follow-up engine, or the complete Administration Workspace.
