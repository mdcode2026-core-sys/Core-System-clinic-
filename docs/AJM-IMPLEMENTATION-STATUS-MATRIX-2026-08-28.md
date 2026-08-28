# CORE SYSTEM — AJM Implementation Status Matrix
## Global UX/IA Stage 1 Reconciliation Snapshot — 2026-08-28

**Purpose:** Keep the AJM status interpretation synchronized with the actual repository evidence while Global UX/IA Stage 1 changes navigation presentation. This matrix does not silently reopen or close an AJM stage.

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

| Stage | Scope | Current status | Evidence / reason | Stage 1 impact |
|---|---|---|---|---|
| AJM-0 | Baseline & Readiness | COMPLETED | `docs/AJM-0-BASELINE-READINESS.md` explicitly records CLOSED | Reused only as baseline; no reopen |
| AJM-1 | Team & Access Foundation | NEEDS RECONCILIATION | Stage authority/index records CLOSED, while `docs/AJM-1-VISIBILITY-VALIDATION-FOLLOWUP.md` records manual acceptance pending | Navigation keeps Team & Access under Settings; no authorization redesign |
| AJM-2 | Financial & Resources Foundation | IN PROGRESS | Current AJM implementation records remain in progress/closure-gate work | Financial & Resources hierarchy is preserved, not rebuilt |
| AJM-3 | Workforce & Operations Foundation | NOT STARTED / GATED | Current AJM stage records do not establish implementation start | Stage 1 creates no Workforce navigation ownership |
| AJM-4 | Communications Foundation | NOT STARTED / GATED | Current AJM stage records do not establish completed implementation | Stage 1 creates no second Communications surface |
| AJM-5 | Journey Coordination Foundation | NOT STARTED / GATED | Current AJM stage records do not establish completed implementation | Stage 1 does not create a coordination navigation system |
| AJM-6 | Insights & Analytics | NOT STARTED / GATED | Current AJM stage records do not establish completed implementation | Reports/Analytics remain visible capabilities; management IA is deferred to later UX stages |
| AJM-7 | PJ & Cross-Domain Integration | NOT STARTED / GATED | Current AJM stage records do not establish completed implementation | PJ ownership remains unchanged |
| AJM-8 | Final Validation & Closure | NOT STARTED / GATED | Final AJM closure evidence not present | Stage 1 does not claim global runtime closure |

## Stage 1 navigation impact

The following are presentation decisions, not AJM ownership changes:

- Workspace remains the principal working surface.
- Operations and Clinical remain protected contextual routes rather than Sidebar domains.
- Queue remains a compatibility/contextual route and is not falsely promoted as the independent Patient Flow system.
- Financial & Resources remains an AJM-owned domain and retains its existing parent/child hierarchy.
- Settings remains the Team & Access/administration surface.

## Important AJM-1 reconciliation note

Stage 1 does not decide that the contradictory AJM-1 records are resolved. The current status is therefore `NEEDS RECONCILIATION` for this matrix. This does not reopen AJM-1 and does not invalidate its existing implementation.

## Update rule

If a later UX/IA stage changes the interpretation or implementation status of an AJM stage, update this matrix with the new evidence. Do not infer completion from UI visibility alone.
