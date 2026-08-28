# CORE SYSTEM — Global UX/IA Documentation Reconciliation Register

**Date:** 2026-08-28
**Status:** AUTHORITATIVE RECONCILIATION REGISTER
**Purpose:** Prevent historical documentation from being interpreted as current UX/IA authority.

## 1. Current authority

`/GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md` is the controlling document for the Global UX / Information Architecture / Workspace reorganization.

It records decisions explicitly agreed by the project owner. These decisions are not recommendations.

## 2. Documents reconciled by this register

The following documents must be read together with the Global UX/IA Final Authority. Where wording conflicts, the 2026-08-28 authority controls:

- `docs/CORE-SYSTEM-ADMINISTRATIVE-JOURNEY-MANAGEMENT-BLUEPRINT.md`
- `docs/AJM-IMPLEMENTATION-PLAN.md`
- `docs/AJM-STAGE-INDEX.md`
- `docs/AJM-1-TEAM-ACCESS-FOUNDATION.md`
- `docs/AJM-1-VISIBILITY-VALIDATION-FOLLOWUP.md`
- `docs/TEAM-ACCESS-ENGINEERING-BLUEPRINT.md`
- `docs/CLINIC-OPERATIONS-WORKFORCE-REFERENCE.md`
- `docs/CLINIC-OPERATIONS-WORKFORCE-FINANCIAL-INTEGRATION-REFERENCE.md`
- `docs/WORKSPACE_ARCHITECTURE_SPECIFICATION.md`
- `docs/WORKSPACE_ARCHITECTURE_STAGE6_AMENDMENT.md`
- `PJ_STAGE6_WORKSPACE_ARCHITECTURE.md`
- `PJ_FINAL_IMPLEMENTATION_STATE.md`
- `PJ_STAGE15_CLOSURE.md`
- `ARCHITECTURE_DECISIONS.md`
- `CORE_SYSTEM_INDEX.md`
- `DATABASE_SCHEMA.md`
- `DOCUMENTATION_STATUS.md`
- `MASTER_ROADMAP.md`

Historical/archive documents remain historical evidence and must not override current decisions.

## 3. Mandatory reconciliation rules

### Workspaces

Any older statement that treats Administrative, Operations/Operation and Clinical as the only mandatory user-facing Workspaces is superseded by the final 2026-08-28 user model.

Workspace is the user's working interface and is not a security boundary. The user's effective permissions determine capabilities. Workspace provides the working surface for those capabilities.

### Roles and permissions

Role and Permission remain independent. Clinic Admin defines roles and may assign any catalogued permission available to the tenant, regardless of whether that permission is conventionally associated with the role name.

Role templates are advisory and editable. Custom roles can be created and reused.

### Sidebar

Sidebar represents complete authorized entry points, not merely Workspace shortcuts and not a security engine.

### Widgets

Widgets are independent presentation/work tools. They may be informational, actionable or operational/attention-oriented. They are available only where the underlying capability is authorized. A Widget never grants permission.

Widgets are customizable within the user's Workspace. They can be reordered and the Workspace may scroll to additional Widgets. Natural Widget size is preserved rather than being arbitrarily compressed to fit a fixed grid.

Not every Domain requires Widgets.

Widgets may also be surfaced as appropriate within the user's Sidebar; this does not change their permission or Workspace rules.

### Patient Flow

Patient Flow remains an independent system and Sidebar item when explicitly enabled/authorized. It continues to use Queue and the existing patient movement mechanism.

Patient Flow has three interfaces to one system:

- Operations
- Clinical
- Administrative

The role name or Workspace type alone must never activate Patient Flow. Clinic Admin must enable/assign it and establish the intended context.

An Operations user may therefore have Operations Workspace without Patient Flow, such as an accountant or follow-up user.

### Overview

Overview is not Workspace and must not become a duplicate operational surface.

### Dashboard

Dashboard is primarily a management/monitoring surface. It is not the user's operational Workspace. Clinic Admin retains broad visibility across relevant Workspaces; delegated administrative access is possible as authorized.

### Global Search

Global Search is a true cross-system discovery mechanism over information the user is authorized to access. It must not bypass tenant isolation, privacy or permissions.

### Patient Context

Contextual access from a patient record may connect authorized work across domains without changing Domain ownership.

### Mobile and language

Arabic/English parity, RTL/LTR correctness and responsive behavior apply equally to Sidebar, Workspace, Widgets, Patient Flow, Search and contextual navigation.

## 4. PJ reconciliation

PJ remains the owner/reference of Patient Journey behavior. Queue and patient movement remain part of the existing Patient Flow implementation. UX reorganization must not duplicate or replace the PJ journey engine.

## 5. AJM reconciliation

AJM domain ownership remains unchanged. UX reorganization changes presentation and discoverability, not business ownership of Financial & Resources, Team & Access, Workforce & Operations, Communications, Journey Coordination or Insights.

## 6. Authorization reconciliation

No new authorization model is introduced. Workspace, Widget, Patient Flow, Search and Dashboard visibility must continue to respect the established effective-permission model and tenant isolation.

## 7. Stage 0 baseline closure

The Stage 0 baseline is recorded in:

- `docs/GLOBAL-UX-IA-STAGE-0-BASELINE-2026-08-28.md`
- `docs/AJM-IMPLEMENTATION-STATUS-MATRIX-2026-08-28.md`

Stage 0 confirms that the repository already contains reusable navigation, Workspace, Widget and Queue foundations, while also recording unresolved reconciliation points including Queue/Patient Flow surface duplication, explicit Patient Flow assignment/context, Global Search absence, Workspace personalization gaps, `/` Dashboard naming and the AJM-1 contradictory validation-status records.

No broad product restructuring was performed as part of Stage 0.

## 8. Implementation gate

Before implementation of UX/IA changes, the implementation agent must inspect repository, database and runtime behavior and identify the authoritative existing implementation for each affected capability.

The sequence is:

**READ → INSPECT → MAP → RECONCILE → RESEARCH → VALIDATE → IMPLEMENT**

and:

**Inspect → Reuse → Extend → Reconcile → Create**.

## 9. Documentation integrity rule

Every subsequent UX/IA implementation must update its stage record and the relevant master/reference document in the same change set or immediately linked documentation change.

No implementation is considered documented merely because code was committed.

## 10. Historical-document rule

Older documents are not deleted solely because they are historical. When they describe superseded UX/IA behavior, the conflict must be explicit so that future agents cannot mistake historical wording for the current decision.

**End of reconciliation register.**
