# CORE SYSTEM — Governed Documentation Index

Date: 2026-09-21
Status: CURRENT — documentation navigation authority
Scope: Documentation navigation and authority routing. This index does not override domain decisions.

## Authority model

1. Current architectural/product decisions: the current accepted architecture/PJ/UX/terminology authorities listed below.
2. Current documentation/status authority: DOCUMENTATION_STATUS.md.
3. This file is the canonical navigation index for the remediation/documentation bundle.
4. Historical documents remain retained evidence and never regain authority merely because they are newer in filename or marked CLOSED.
5. A closure is authoritative only when its exact evidence chain is recorded under the current closure policy.
6. For the relationship among Home, Header, Role Workspace, My Workspace, Sidebar, Role/Primary Work Context and Permissions, the current interpretation is docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md.
7. Current terminology is governed by docs/CORE-SYSTEM-TERMINOLOGY-GOVERNANCE.md.

## 2026-09-21 CSAPI decision-gate authority

CSAPI is now represented as a current repository-level decision-gate workstream.

### Current CSAPI state
- docs/CSAPI/README.md
- docs/CSAPI/CSAPI-MASTER-STATE.md
- docs/CSAPI/CSAPI-GATES-PLAN.md
- docs/CSAPI/CSAPI-HISTORICAL-BASELINE.md
- docs/CSAPI/CSAPI-DECISION-AND-ACTION-LEDGER.md
- docs/CSAPI/CSAPI-CURRENT-EXECUTION-HANDOFF-2026-09-21.md

### Gate 01 — closed evidence
- docs/CSAPI/GATES/GATE-01-CSAPI-MASTER-EXECUTION-ROADMAP-2026-09-19.md
- docs/CSAPI/GATES/GATE-01-INTEGRATED-PATIENT-FLOW-VERIFICATION-2026-09-21.md
- docs/CSAPI/GATES/GATE-01-FINAL-RELEASE-PRODUCTION-VERIFICATION-2026-09-21.md
- docs/testing/workstream-contracts/csapi-gate01-integrated-patient-flow.execution.json
- docs/testing/workstream-contracts/csapi-gate01-final-release.execution.json

### Gate 02 — current precheck
- docs/CSAPI/GATES/GATE-02-PATIENT-JOURNEY.md
- docs/testing/workstream-contracts/csapi-gate02-patient-journey.execution.json

Gate 01 is closed. Gate 02 is OPEN — PRECHECK READY. Gate 02 concerns longitudinal patient lifecycle, next actions and continuity; it does not rebuild Patient Journey or reopen Patient Flow.

## 2026-09-11 Global Surfaces reconciliation

### Canonical interpretation

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

Additional permissions do not redefine Role, Primary Work Context or Role Workspace. They may expand authorized Sidebar Domains, Widgets and My Workspace content/actions.

## 2026-09-01 Workspace / Patient Flow decision package

### Architectural authority
- docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md

### Engineering authority
- docs/ENGINEERING-SPEC-WORKSPACE-PATIENT-FLOW-2026-09-01.md
- docs/WORKSPACE-PATIENT-FLOW-COMPLETE-DECISION-COVERAGE-MATRIX-2026-09-01.md

### Execution authority
- docs/WORKSPACE-PATIENT-FLOW-COMPLETE-EXECUTION-PLAN-2026-09-01.md
- docs/WORKSPACE-PATIENT-FLOW-PRE-CODE-EXECUTION-CONTRACT-2026-09-01.md
- docs/WORKSPACE-PATIENT-FLOW-PRECODE-BASELINE-IMPACT-ORDER-2026-09-01.md
- docs/WORKSPACE-PATIENT-FLOW-FINAL-ENGINEERING-READINESS-REPORT-2026-09-01.md
- docs/WORKSPACE-PATIENT-FLOW-FINAL-EXECUTION-CLOSURE-2026-09-01.md

## Global UX / IA records

### Current/reconciled
- docs/CORE-SYSTEM-TERMINOLOGY-GOVERNANCE.md
- docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28.md
- docs/CORE-SYSTEM-GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28.md
- docs/GLOBAL-UX-IA-VALIDATION-PROTOCOL-2026-08-28.md
- docs/UX-IA-VALIDATION-GOVERNANCE.md

### Historical stage records with reconciliation notices
- docs/GLOBAL-UX-IA-STAGE-3-WORKSPACE-FOUNDATION-2026-08-28.md
- docs/GLOBAL-UX-IA-STAGE-4-WORKSPACE-PERSONALIZATION-2026-08-28.md
- docs/GLOBAL-UX-IA-STAGE-5-WIDGET-LIBRARY-2026-08-28.md
- docs/GLOBAL-UX-IA-EXECUTION-PLAN-STAGE-5-UPDATE-2026-08-28.md
- docs/TERMINOLOGY-HISTORICAL-RECONCILIATION-2026-08-29.md

## Current remediation bundle

### Architecture and scenario baseline
- docs/IDEAL-OPERATIONAL-ARCHITECTURE-AUDIT-2026-08-30.md
- docs/IDEAL-OPERATIONAL-SCENARIOS-2026-08-30.md
- docs/IDEAL-SCENARIO-TRACEABILITY-MATRIX-2026-08-30.md
- docs/CORE-SYSTEM-SCENARIO-REGISTER-2026-08-30.md

### Implementation documentation remediation
- docs/IMPLEMENTATION-DOCUMENT-REMEDIATION-PLAN-2026-08-30.md
- docs/IMPLEMENTATION-DOCUMENT-REMEDIATION-RUNBOOK-2026-08-30.md
- docs/CROSS-DOMAIN-IMPLEMENTATION-CONTRACTS-2026-08-30.md
- docs/IMPLEMENTATION-DOCUMENT-REMEDIATION-MASTER-MATRIX-2026-08-30.md
- docs/FINAL-IMPLEMENTATION-DOCUMENTATION-REMEDIATION-REPORT-2026-08-30.md

### Reality implementation evidence
- docs/IDEAL-SCENARIO-IMPLEMENTATION-GAP-MATRIX-2026-08-30.md
- docs/IDEAL-SCENARIO-REALITY-VALIDATION-2026-08-30.md
- docs/FINAL-IDEAL-SCENARIO-CLOSURE-REPORT-2026-08-30.md

### PJ / AJM / implementation authorities
- Current PJ master/decision records.
- Current AJM status/acceptance records.
- PJ_FINAL_IMPLEMENTATION_STATE.md
- PJ_STAGE15_CLOSURE.md
- Current UX/IA records as interpreted through the 2026-09-11 canonical reconciliation.

## Status authority

DOCUMENTATION_STATUS.md remains the repository-wide status/freshness authority. This index is navigation/authority routing, not a competing status ledger.

Allowed remediation lifecycle:

UNEXECUTED → PRECHECK → RECONCILED → IMPLEMENTING → VALIDATED → PRODUCTION VERIFIED → DOCUMENTATION CLOSED → CLOSED

For this implementation phase, VALIDATED and PRODUCTION VERIFIED require actual runtime evidence; deployment success alone is insufficient.

## Historical handling

Historical AJM, Stage, UX/IA, PJ, implementation and CSAPI documents are retained. When they conflict with current authority, the current record must state the reconciliation relationship. Historical files do not regain current authority merely because they still exist.

## Navigation rule

Every new documentation artifact under docs/ must be linked from this index and classified appropriately.
