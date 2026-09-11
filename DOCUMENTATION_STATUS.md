# Documentation Status & Authority

**Status:** ACTIVE — documentation reconciliation in progress; current architecture/runtime closure remains governed by its applicable evidence gates  
**Last reviewed:** 2026-09-11

This file remains the repository-wide documentation status/freshness authority. `CORE_SYSTEM_INDEX.md` is the canonical navigation index for the current remediation bundle.

## 2026-09-11 Global Surfaces Documentation Reconciliation

A repository-wide targeted reconciliation was performed for all documentation that defines or materially references:

- Header
- Home
- Role Workspace / Workspace
- My Workspace
- Sidebar / Navigation
- Role / Primary Work Context
- Permissions / Entitlements
- Widgets / Quick Actions
- Communications / Chat / Notifications
- My Settings
- Patient Flow where it intersects these surfaces

The canonical interpretation is recorded in:

`docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

### Canonical relationship

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

### Mandatory interpretation

Additional permissions do **not** redefine the user's Primary Role, Primary Work Context or Role Workspace. They may expand authorized Domains, Widgets and My Workspace content/actions.

Home is independent from the primary Role Workspace and My Workspace.

Clinical and Operational Workspaces remain their established primary work environments. Administrative Workspace remains separately tracked work.

### Documentation dispositions

Current authority/engineering documents were updated directly. Historical stage records received explicit reconciliation notices where rewriting historical facts would be misleading. A historical document must not be treated as current authority merely because it still exists in the repository.

This reconciliation is documentation-only. No source/database/runtime behavior was changed by it.

## Authority

When documentation and implementation disagree, use:
1. Implemented repository + live Supabase state for implementation/runtime facts.
2. Accepted architectural/product decisions.
3. PJ-MASTER-DOCS / approved PJ decisions.
4. `PROJECT_HANDOFF.md`.
5. `CHANGELOG.md`.
6. Historical reports only as evidence.
7. `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md` for the current Header/Home/Role Workspace/My Workspace/Sidebar relationship.
8. `docs/CORE-SYSTEM-TERMINOLOGY-GOVERNANCE.md` for canonical terminology.
9. `GLOBAL_UX_IA_FINAL_AUTHORITY-2026-08-28.md` / its actual current repository equivalent as the current UX/IA authority, to be interpreted through the current reconciliation where naming overlaps.
10. For implementation-document remediation requirements, `docs/CROSS-DOMAIN-IMPLEMENTATION-CONTRACTS-2026-08-30.md` and its linked matrices are the current contract authority.
11. For current scenario reality state, the applicable current reality/evidence documents are authoritative for their defined scope.

## Current remediation bundle

The existing remediation bundle remains active. The 2026-09-11 reconciliation documents are additional interpretation/authority documents, not replacements for unrelated domain contracts.

## Documentation remediation state

- R12 — Documentation authority / closure: DOCUMENTATION CLOSED.
- R01 — Procedure / Service / Package / Treatment Plan: DOCUMENTATION CLOSED; implementation remediation active.
- R02 — Treatment Plan → Next Action → Appointment: DOCUMENTATION CLOSED; implementation blocker recorded.
- R03 — Package / Financial Plan / Installments / Sessions: DOCUMENTATION CLOSED; implementation blocker recorded.
- R04 — Workforce → Availability → Agenda: DOCUMENTATION CLOSED; implementation repair applied.
- R05 — Staff + Room + Device + Procedure: DOCUMENTATION CLOSED; skill/qualification foundation and eligibility repair applied.
- R06 — Insurance lifecycle: DOCUMENTATION CLOSED; reconciliation blocker recorded.
- R07 — Procurement lifecycle: DOCUMENTATION CLOSED; supplier obligation/payment foundation added; integration blocker remains.
- R08 — Revenue → Commission → Payroll: DOCUMENTATION CLOSED; collected-payment commission path added; validation pending.
- R09 — Communication → Request → Work: DOCUMENTATION CLOSED; implementation exists; validation pending.
- R10 — Domain Event → Coordination → Authorized Actor → Completion: DOCUMENTATION CLOSED; permission repair applied; universal event handoff blocker remains.
- R11 — Skill / Qualification / Permission: DOCUMENTATION CLOSED; implementation foundation added; seeded/E2E validation pending.

## Current production-readiness gate

`Production SHA = final main SHA` remains mandatory for Production Readiness. Deployment success or a READY deployment does not prove scenario validation.

## Findings governance

Every warning, defect, security issue or architecture conflict must be investigated. Safe/authorized defects are fixed; cross-workstream items are documented with evidence, owner, severity and disposition. Real defects must not be hidden to make CI green.

## PJ / AJM state

PJ status remains governed by PJ-MASTER-DOCS and current implementation records. AJM status remains governed by current AJM status/acceptance records. This reconciliation does not silently change those domain statuses.

## Schema freshness

`DATABASE_SCHEMA.md` remains the structural schema reference and must be reconciled against live schema when affected by implementation changes.

## Maintenance rule

Every new reconciliation/authority document must be linked from `CORE_SYSTEM_INDEX.md`. Historical documentation remains preserved and does not regain current authority without an explicit current decision/evidence chain.

**End of Documentation Status & Authority.**
