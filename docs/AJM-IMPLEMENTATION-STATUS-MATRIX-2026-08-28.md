# CORE SYSTEM — AJM Implementation Status Matrix
## Global UX/IA Stage 2 Reconciliation Snapshot — 2026-08-28

**Purpose:** Keep the AJM status interpretation synchronized with actual repository evidence while Global UX/IA Stage 2 establishes the user-surface contract. This matrix does not silently reopen or close an AJM stage.

## Status vocabulary

- COMPLETED
- PARTIALLY COMPLETED
- IMPLEMENTED — VALIDATION PENDING
- IN PROGRESS
- BLOCKED
- NOT STARTED
- NEEDS RECONCILIATION

A document, page or component existing in the repository is not sufficient evidence of completion.

## Current matrix

| Stage | Scope | Current status | Evidence / reason | Stage 2 impact |
|---|---|---|---|---|
| AJM-0 | Baseline & Readiness | COMPLETED | `docs/AJM-0-BASELINE-READINESS.md` explicitly records CLOSED | Reused as baseline; no reopen |
| AJM-1 | Team & Access Foundation | NEEDS RECONCILIATION | Stage authority/index records CLOSED, while `docs/AJM-1-VISIBILITY-VALIDATION-FOLLOWUP.md` records manual acceptance pending | Reused as the authorization foundation; Role remains separate from Permission and Workspace remains presentation-only |
| AJM-2 | Financial & Resources Foundation | IN PROGRESS | `docs/AJM-2-IMPLEMENTATION-LOG.md` explicitly remains in authenticated E2E / closure-gate work | Financial & Resources hierarchy and permission model are preserved; no duplicate surface or engine created |
| AJM-3 | Workforce & Operations Foundation | NOT STARTED / GATED | Current AJM stage records do not establish implementation start | Stage 2 introduces no Workforce ownership or role-label authorization rules |
| AJM-4 | Communications Foundation | NOT STARTED / GATED | Current AJM stage records do not establish completed implementation | Stage 2 introduces no Communications ownership |
| AJM-5 | Journey Coordination Foundation | NOT STARTED / GATED | Current AJM stage records do not establish completed implementation | Stage 2 keeps Workspace presentation separate from future Journey Coordination ownership |
| AJM-6 | Insights & Analytics | NOT STARTED / GATED | Current AJM stage records do not establish completed implementation | Analytics permission remains capability-driven; Dashboard work remains deferred |
| AJM-7 | PJ & Cross-Domain Integration | NOT STARTED / GATED | Current AJM stage records do not establish completed implementation | PJ ownership, Queue and Patient Flow are untouched |
| AJM-8 | Final Validation & Closure | NOT STARTED / GATED | Final AJM closure evidence not present | Stage 2 does not claim final AJM/runtime closure |

## Stage 2 user-surface impact

The Global UX/IA Stage 2 implementation establishes a presentation contract using existing access architecture:

- Role templates remain advisory starting points.
- Custom roles remain tenant-owned and permission-configurable.
- Permission categories are not restricted by conventional role labels.
- Sidebar remains the complete authorized navigation surface and continues to use the canonical navigation registry.
- Workspace remains a presentation/work surface and is not a security boundary.
- Implemented workspace surfaces are offered from effective permissions rather than role labels.
- Workspace preferences do not grant permissions.
- Direct Operations and Clinical routes remain server-authorized.
- Administration Workspace is recorded as a declared model surface but is not exposed until a canonical implementation exists; Settings is not relabeled as a fake Workspace.

## AJM-1 reconciliation note

Stage 2 does not resolve the contradictory AJM-1 acceptance records. The current matrix status remains `NEEDS RECONCILIATION`. This does not reopen AJM-1 and does not invalidate its implementation.

## AJM-2 note

Stage 2 does not change AJM-2 domain ownership, financial permissions, tenant isolation, RLS, auditability, or its existing Financial & Resources navigation hierarchy.

## Future-stage compatibility

No future AJM stage is blocked by the Stage 2 presentation model. Future AJM implementations must continue to derive authorization from permissions/capabilities rather than conventional role labels and must not turn Workspace into a security boundary.

## Update rule

If a later UX/IA or AJM stage changes the interpretation or implementation status of an AJM stage, update this matrix with the new evidence. Do not infer completion from UI visibility alone.
