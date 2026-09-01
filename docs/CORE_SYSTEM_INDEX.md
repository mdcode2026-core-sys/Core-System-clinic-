# CORE SYSTEM — Governed Documentation Index

**Date:** 2026-09-01  
**Status:** CURRENT — documentation navigation authority  
**Scope:** Documentation navigation and authority routing. This index does not override domain decisions.

## Authority model

1. Current architectural/product decisions: the current accepted architecture/PJ/UX/terminology authorities listed below.
2. Current documentation/status authority: `DOCUMENTATION_STATUS.md`.
3. This file is the canonical navigation index for the remediation/documentation bundle.
4. Historical documents remain retained evidence and never regain authority merely because they are newer in filename or marked CLOSED.
5. A closure is authoritative only when its exact evidence chain is recorded under the current closure policy.

## 2026-09-01 Workspace / Patient Flow decision package

### Architectural authority
- `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md` — APPROVED / BINDING for its defined scope.

### Engineering authority
- `docs/ENGINEERING-SPEC-WORKSPACE-PATIENT-FLOW-2026-09-01.md` — complete pre-code engineering contract for the approved decisions.
- `docs/WORKSPACE-PATIENT-FLOW-COMPLETE-DECISION-COVERAGE-MATRIX-2026-09-01.md` — completeness/traceability gate covering every approved decision and every affected visible/background concern.

### Execution authority
- `docs/WORKSPACE-PATIENT-FLOW-COMPLETE-EXECUTION-PLAN-2026-09-01.md` — full implementation sequence, dependencies, validation and closure gates.
- `docs/WORKSPACE-PATIENT-FLOW-PRE-CODE-EXECUTION-CONTRACT-2026-09-01.md` — pre-code gate and observed repository implementation constraints.

**Scope lock:** These documents implement only the 2026-09-01 Workspace/Patient Flow decision set. They do not cancel unrelated architecture. Conflicting older rules are superseded only where the conflict concerns an approved 2026-09-01 decision.

## Current remediation bundle

### Architecture and scenario baseline
- `docs/IDEAL-OPERATIONAL-ARCHITECTURE-AUDIT-2026-08-30.md`
- `docs/IDEAL-OPERATIONAL-SCENARIOS-2026-08-30.md`
- `docs/IDEAL-SCENARIO-TRACEABILITY-MATRIX-2026-08-30.md`
- `docs/CORE-SYSTEM-SCENARIO-REGISTER-2026-08-30.md`

### Implementation documentation remediation
- `docs/IMPLEMENTATION-DOCUMENT-REMEDIATION-PLAN-2026-08-30.md`
- `docs/IMPLEMENTATION-DOCUMENT-REMEDIATION-RUNBOOK-2026-08-30.md`
- `docs/CROSS-DOMAIN-IMPLEMENTATION-CONTRACTS-2026-08-30.md`
- `docs/IMPLEMENTATION-DOCUMENT-REMEDIATION-MASTER-MATRIX-2026-08-30.md`
- `docs/FINAL-IMPLEMENTATION-DOCUMENTATION-REMEDIATION-REPORT-2026-08-30.md`

### Reality implementation evidence
- `docs/IDEAL-SCENARIO-IMPLEMENTATION-GAP-MATRIX-2026-08-30.md`
- `docs/IDEAL-SCENARIO-REALITY-VALIDATION-2026-08-30.md`
- `docs/FINAL-IDEAL-SCENARIO-CLOSURE-REPORT-2026-08-30.md`

### Terminology and historical governance
- `docs/CORE-SYSTEM-TERMINOLOGY-GOVERNANCE.md`
- `DOCUMENTATION_STATUS.md`
- `PROJECT_HANDOFF.md`
- `CHANGELOG.md`

### PJ / UX / implementation authorities
- Current PJ-MASTER-DOCS and approved PJ decision records.
- `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`
- Current AJM status/acceptance records under `docs/`.

## R12 status authority

`DOCUMENTATION_STATUS.md` remains the repository-wide status/freshness authority. R12 adds the remediation-specific rule that each R-item and each closure must carry an explicit evidence classification. This index is not a competing status ledger.

Allowed remediation states:

`UNEXECUTED → PRECHECK → RECONCILED → IMPLEMENTING → VALIDATED → PRODUCTION VERIFIED → DOCUMENTATION CLOSED → CLOSED`

For this implementation phase, `VALIDATED` and `PRODUCTION VERIFIED` require actual runtime evidence; deployment success alone is insufficient.

## Historical handling

Historical AJM, Stage, UX/IA, PJ and implementation documents are retained. When they conflict with the current bundle, the current bundle must state the supersession/reconciliation relationship; historical files are not silently rewritten or deleted.

## Navigation rule

Every new documentation artifact under `docs/` must be linked from this index and classified as current, reconciled, historical, superseded, or contradictory where applicable.
