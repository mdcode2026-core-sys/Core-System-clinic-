# CORE SYSTEM — Global Surfaces Documentation Reconciliation Register
## Header × Home × Role Workspace × My Workspace × Sidebar × Permissions × Widgets
### 2026-09-11

**Status:** ACTIVE RECONCILIATION REGISTER — DOCUMENTATION-ONLY
**Branch:** `docs/reconcile-global-surfaces-2026-09-11`
**No source/database/runtime changes performed in this reconciliation.**

## 1. Purpose

This register exists so the project never again relies on conversation memory to reconstruct the relationship among:

- Primary Role;
- Primary Work Context / Classification;
- Role Workspace;
- My Workspace;
- Sidebar;
- Home;
- Header;
- Widgets;
- Permissions / Entitlements;
- Communications / Chat / Notifications;
- My Settings;
- Patient Flow / Queue where they intersect these surfaces.

The register records the disposition of documentation discovered in the repository. It distinguishes current authority from historical evidence and prevents an older document from silently reintroducing an obsolete interpretation.

## 2. Canonical interpretation

The canonical current model is maintained in:

`docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

The essential model is:

```text
Primary Role / Job Function
        ↓
Primary Work Context / Classification
        ↓
Role Workspace

Effective Permissions
        ↓
Authorized Domains / Capabilities
        ├── Sidebar
        ├── Widgets
        └── My Workspace

Home = independent global starting / awareness surface
Header = persistent global access layer
My Settings = personal account/preferences destination
```

### Non-negotiable interpretation

**Additional permissions do not redefine the user's Primary Role, Primary Work Context or Role Workspace.**

A Clinical-primary user remains in Clinical Role Workspace after gaining additional financial, operational, administrative, reporting or other permissions. Those permissions may expand authorized Domains, Sidebar entries, Widgets and My Workspace content/actions.

## 3. Disposition rules

### UPDATED
The current document was directly revised on the reconciliation branch.

### VERIFIED-ALIGNED
The document was inspected and its current meaning is already compatible with the canonical model; no rewrite is required for this reconciliation.

### HISTORICAL-NOTICE
The document records a past implementation decision/state. Historical facts are preserved, but a prominent reconciliation notice is required/added so obsolete wording cannot be mistaken for current architecture.

### MISSING-REFERENCE
Another document refers to an authority artifact that could not be found at the referenced path in the current repository. The reference must not be treated as current authority until resolved.

### OUTSIDE-SCOPE
The document was inspected as context but does not define or materially affect the surfaces covered by this reconciliation.

## 4. Repository documentation in scope

### Core authority / governance

| Document | Disposition | Reason |
|---|---|---|
| `CORE_SYSTEM_INDEX.md` | UPDATED | Added canonical Global Surfaces interpretation and terminology gate. |
| `DOCUMENTATION_STATUS.md` | UPDATED | Added reconciliation status and current authority. |
| `PROJECT_HANDOFF.md` | UPDATED | Added canonical user/surface model for future sessions. |
| `ARCHITECTURE_DECISIONS.md` | VERIFIED-ALIGNED / GOVERNED | Chronological ADR history was inspected. It remains historical decision evidence; the 2026-09-11 reconciliation is the current interpretation layer for surface terminology and does not rewrite prior ADR history. |
| `ENGINEERING_CONSTITUTION.md` | VERIFIED-ALIGNED / GOVERNED | Engineering principles and authority rules were inspected; no conflicting current surface definition was found. The constitution remains the highest engineering governance layer. |
| `MASTER_ROADMAP.md` | VERIFIED-ALIGNED / GOVERNED | Product sequencing/roadmap authority was inspected; it does not define the detailed Home/Header/Role Workspace/My Workspace relationship. |
| `DATABASE_SCHEMA.md` | VERIFIED-ALIGNED / STRUCTURAL | Structural schema reference is not a product-surface authority; it remains governed separately and must be reconciled against live schema when implementation changes affect it. |
| `CHANGELOG.md` | HISTORICAL-NOTICE / EVIDENCE | Changelog is an execution history. Historical entries are not rewritten to retroactively express the 2026-09-11 architecture. |
| `docs/CORE-SYSTEM-TERMINOLOGY-GOVERNANCE.md` | UPDATED | Added Role Workspace/My Workspace/Home/Header/Sidebar terminology. |
| `docs/TERMINOLOGY-HISTORICAL-RECONCILIATION-2026-08-29.md` | UPDATED | Extended historical terminology reconciliation to global surfaces. |
| `DOCUMENTATION_CONSOLIDATION_PLAN.md` | UPDATED | Added reconciliation notice while preserving the historical consolidation record. |
| `archive/README.md` | UPDATED | Added explicit archive/historical authority governance. |

### Workspace / Patient Flow architecture

| Document | Disposition | Reason |
|---|---|---|
| `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md` | UPDATED | Added explicit canonical relationship and stability rule. |
| `PJ_STAGE6_WORKSPACE_ARCHITECTURE.md` | UPDATED | Corrected role/capability/workspace ambiguity; aligned permission expansion behavior. |
| `docs/ENGINEERING-SPEC-WORKSPACE-PATIENT-FLOW-2026-09-01.md` | UPDATED | Added complete engineering model and boundaries. |
| `docs/WORKSPACE-PATIENT-FLOW-ARCHITECTURE-ENGINEERING-DECISION-BOUNDARY-2026-09-01.md` | UPDATED | Added surface/permission/role workspace boundary. |
| `docs/WORKSPACE-PATIENT-FLOW-COMPLETE-DECISION-COVERAGE-MATRIX-2026-09-01.md` | UPDATED | Added full coverage for Home/Header/Role Workspace/My Workspace/Sidebar. |
| `docs/WORKSPACE-PATIENT-FLOW-ENGINEERING-TRACEABILITY-2026-09-01.md` | UPDATED | Traced the separation and mixed-permission behavior. |
| `docs/IMPLEMENTATION-PLAN-WORKSPACE-PATIENT-FLOW-FULL-2026-09-01.md` | UPDATED | Updated implementation sequence and user model. |
| `docs/WORKSPACE-PATIENT-FLOW-COMPLETE-EXECUTION-PLAN-2026-09-01.md` | UPDATED | Reconciled generic Workspace terminology and added Header/Home/Role Workspace/My Workspace boundaries. |
| `docs/WORKSPACE-PATIENT-FLOW-PRE-CODE-EXECUTION-CONTRACT-2026-09-01.md` | UPDATED | Added current separation and mixed-permission expectations; preserved historical target context. |
| `docs/WORKSPACE-PATIENT-FLOW-PRECODE-BASELINE-IMPACT-ORDER-2026-09-01.md` | UPDATED | Added canonical model and reconciliation findings. |
| `docs/WORKSPACE-PATIENT-FLOW-FINAL-ENGINEERING-READINESS-REPORT-2026-09-01.md` | UPDATED | Added current surface interpretation and stability rule. |
| `docs/WORKSPACE-PATIENT-FLOW-FINAL-EXECUTION-CLOSURE-2026-09-01.md` | UPDATED | Preserved historical closure while preventing outdated `global` interpretation. |

### Global UX / IA

| Document | Disposition | Reason |
|---|---|---|
| `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28.md` | UPDATED | Added complete user/surface model and Header/Home boundaries. |
| `docs/CORE-SYSTEM-GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28.md` | UPDATED | Reconciled duplicate Global UX/IA plan. |
| `docs/GLOBAL-UX-IA-STAGE-3-WORKSPACE-FOUNDATION-2026-08-28.md` | UPDATED | Historical notice added for shared `global` renderer interpretation. |
| `docs/GLOBAL-UX-IA-STAGE-4-WORKSPACE-PERSONALIZATION-2026-08-28.md` | UPDATED | Recast generic Workspace personalization as My Workspace presentation. |
| `docs/GLOBAL-UX-IA-STAGE-5-WIDGET-LIBRARY-2026-08-28.md` | UPDATED | Distinguished Workspace Quick Action from Global Header Quick Actions. |
| `docs/GLOBAL-UX-IA-EXECUTION-PLAN-STAGE-5-UPDATE-2026-08-28.md` | UPDATED | Added historical terminology/global-surface notice. |
| `docs/GLOBAL-UX-IA-VALIDATION-PROTOCOL-2026-08-28.md` | UPDATED | Added mandatory global-surface validation scenarios. |
| `docs/UX-IA-VALIDATION-GOVERNANCE.md` | UPDATED | Added global-surface invariants and mixed-permission/shared-device tests. |

### Historical / supporting UX documents

| Document / reference | Disposition | Reason |
|---|---|---|
| `docs/STAGE-7-IMPLEMENTATION-RECORD-2026-08-28.md` | VERIFIED-ALIGNED / HISTORICAL | Patient Context ownership is consistent; its runtime closure claims remain historical evidence. No direct current-surface conflict was found requiring a rewrite. |
| `CORE_SYSTEM_FORENSIC_AUDIT(1).md` | HISTORICAL-NOTICE / EVIDENCE | Historical audit; not rewritten into current state. Its findings remain evidence and must be revalidated before action. |
| `/archive/*` implementation packages, prompts and execution records | HISTORICAL / GOVERNED | Archive governance now explicitly prevents historical files from regaining current authority through terminology reuse. |

### Cross-domain documentation inventory

The following additional repository documentation areas were inspected because they can indirectly define Role, Permission, Capability, Workspace, navigation or user-surface semantics:

| Area | Disposition | Current rule |
|---|---|---|
| `docs/TEAM-ACCESS-ENGINEERING-BLUEPRINT.md` | UPDATED | Authorization remains separate from Primary Role/Primary Work Context/Role Workspace; cross-context permissions do not reclassify the primary workspace. |
| `docs/CLINIC-OPERATIONS-WORKFORCE-REFERENCE.md` | UPDATED | Workforce/job/skill data remains distinct from authorization and Role Workspace; lightweight global requests do not transfer domain ownership. |
| AJM / Journey Coordination documentation under `docs/` | GOVERNED BY TERMINOLOGY + CANONICAL RECONCILIATION | Existing domain ownership remains authoritative; any ambiguous surface wording must be interpreted through the current terminology and global-surface documents. No blind historical rewrite was performed. |
| Patient Journey master/decision documentation | GOVERNED / OUTSIDE THIS SURFACE REDESIGN | PJ remains the workflow authority. Patient Flow remains contextual/background for ordinary users as already approved; this reconciliation does not redesign PJ. |
| Financial, Inventory, Agenda and other Domain blueprints | GOVERNED / OUTSIDE THIS SURFACE REDESIGN | Domain ownership is preserved. Cross-context authorization may expose normal Domain navigation without changing Role Workspace. |

## 5. Referenced authority artifacts not found at current paths

Several older documents refer to filenames such as:

- `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
- `GLOBAL-UX-IA-FINAL-AUTHORITY-2026-08-28.md`
- `GLOBAL_UX_IA_IMPLEMENTATION_PLAN_2026-08-28.md`
- `CORE-SYSTEM-GLOBAL-UX-IA-MASTER-EXECUTION.md`

Targeted repository lookups did not establish these exact filenames as current repository files at the referenced paths.

This is a documentation-governance issue, not permission to invent a replacement silently.

For the specific Global Surfaces relationship addressed here, the current canonical source is:

`docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

Any remaining document that references a missing historical authority should be updated on its next controlled documentation synchronization so that future agents do not attempt to read a nonexistent authority artifact.

## 6. Important historical conflict found

The historical Stage 6 workspace document said:

> A user's role/template and individual permission assignments determine which workspace(s) and actions are available.

That wording is too broad for the current model because it can be interpreted as permissions redefining the user's Workspace.

The corrected interpretation is:

> Primary Role / Primary Work Context determines the primary Role Workspace. Effective permissions determine authorized capabilities/actions. Additional permissions do not create or redefine the primary Role Workspace.

This was corrected in `PJ_STAGE6_WORKSPACE_ARCHITECTURE.md` and propagated into the current engineering/UX documents.

## 7. Important implementation drift identified

The current implementation historically reused a technical `global` renderer/context for Home and My Workspace while the product model now requires those surfaces to be distinct.

This is an implementation reconciliation item, not an architectural reason to collapse Home and My Workspace.

No source code was modified by this documentation stage.

## 8. Documentation rule going forward

For every new document that references Workspace, the author MUST qualify which concept is intended:

- Role Workspace;
- My Workspace;
- Home;
- technical Workspace/rendering context.

The words `Workspace`, `Global`, `Dashboard`, `Home`, `Quick Action`, `Communication`, and `Notification` must not be used ambiguously when multiple product layers exist.

## 9. Closure of this reconciliation phase

This register closes the **documentation reconciliation phase** only when all documents currently classified as UPDATED have been reviewed on the reconciliation branch and the remaining historical documents are explicitly classified as evidence rather than current authority.

It does not close any code/runtime work.

**Current phase status:** DOCUMENTATION RECONCILIATION — CANDIDATE READY FOR OWNER REVIEW.

**End of Register.**