# Documentation Status & Authority

**Status:** ACTIVE
**Last reviewed:** 2026-08-24

This file establishes how repository documentation is to be interpreted while CORE SYSTEM remains under active construction.

## 1. Authority rule

Documentation is not the source of truth for implementation reality.

When documentation and the implemented repository/database disagree:

1. **Implemented repository + live Supabase state** = current implementation reality.
2. **Accepted architectural decisions** = governing intent, unless a later accepted decision supersedes them.
3. **PJ-MASTER-DOCS / approved PJ decisions** = governing Patient Journey scope and workflow.
4. **Current handoff/status documents** = operational summary only.
5. Historical reports, dated progress logs, implementation packages and old plans must never be used as instructions for new work.

A document may therefore be historically valid while being operationally obsolete.

## 2. Current canonical documents

| Document | Classification | Use |
|---|---|---|
| `ENGINEERING_CONSTITUTION.md` | Canonical / governing | Engineering rules and documentation governance |
| `ARCHITECTURE_DECISIONS.md` | Canonical decision history | Architectural decisions; newer decisions override older ones |
| `MASTER_ROADMAP.md` | Canonical product roadmap, **requires current-status reconciliation** | Product direction; not a substitute for PJ stage execution |
| `PROJECT_HANDOFF.md` | Canonical living handoff, **requires refresh** | Current implementation/handoff state |
| `CHANGELOG.md` | Canonical historical change log | What changed and when |
| `DATABASE_SCHEMA.md` | Structural reference, **stale snapshot** | Useful historical schema reference; must be regenerated from live DDL before schema-sensitive work |
| `ADR-012-PATIENT-PORTAL.md` | Canonical accepted ADR | Patient Portal architecture and Stage 12 foundation decisions |
| `PJ_E2E_DEMO_DATASET.md` | Canonical PJ test-data contract | Persistent synthetic E2E data and scenario coverage |
| `PJ_STAGE15_CLOSURE.md` | Stage-specific closure record | Stage 15 implementation/closure evidence |
| `DOCUMENTATION_STATUS.md` | **This document** | Documentation authority and freshness registry |

## 3. Patient Journey current state

The repository is now in the PJ stage-based execution track. Older Milestone/Session documents were created before this operating model became the active workflow.

Current PJ status relevant to documentation:

- Stages 0–10: closed.
- Stage 11: closed.
- Stage 12: provisionally/phase-closed after manual verification; `ADR-012-PATIENT-PORTAL.md` remains the architectural reference.
- Stage 14: completed work retained only where it contributes to current implementation history; temporary Stage 14 test seed was removed.
- Stage 15: implementation and E2E dataset work completed to the current accepted scope; persistent synthetic data is retained for later administrative stages.

The exact stage closure records are authoritative for their respective stage; do not infer current status from old Milestone 3 or Session documents.

## 4. Root documents identified as stale / historical

The following root-level documents describe one-time work, dated snapshots, or implementation packages that must not be treated as current instructions:

- `Handoff_Daily_Report_2026-07-29.md`
- `ANALYTICS_BUILD_PROGRESS.md`
- `QUEUE_DEBUG_PROGRESS.md` (including the filename variant with trailing whitespace if present)
- `QUEUE_FIX_PROGRESS.md`
- `KIMI_IMPLEMENTATION_CONTRACT.md`
- `KIMI_IMPLEMENTATION_PACKAGE.md`
- `KIMI_SESSION_PLAN_MILESTONE_3.md`
- `IMPLEMENTATION_PACKAGE_MILESTONE_3.md`
- `MILESTONE_2_SCOPE_PROPOSAL.md`
- `SECURITY_HOTFIX_PLAN.md`
- `SECURITY_AUDIT_REPORT.md`
- `PRODUCT_COMPLETION_ROADMAP_V2.md`
- `REVISED_DESIGN_DOCUMENT_v2.md`
- `supabase Data info.md`

These are historical artifacts or superseded planning material. They should be moved out of the repository root into `/archive/` when the repository archival pass is executed. Their existence must not cause engineers to reopen completed work or follow obsolete instructions.

## 5. Documents requiring refresh before being used as implementation references

### `PROJECT_HANDOFF.md`
The existing copy contains extensive August 8 status and open items that are now obsolete. It must be regenerated from the current repository/live-system state rather than incrementally patched.

### `MASTER_ROADMAP.md`
The document contains historical Milestone 3 status and older role/roadmap statements. In particular, older references must not override later PJ decisions or the current implementation. The roadmap should be reconciled with the PJ stage track before being used for future sequencing.

### `ARCHITECTURE_DECISIONS.md`
The chronological ADR history must remain intact, but later approved decisions must be recorded as superseding older statements where reality changed. Historical ADR text must not be silently rewritten.

### `DATABASE_SCHEMA.md`
The document explicitly describes itself as a snapshot. Its 2026-08-04 structural state predates subsequent PJ migrations and therefore is not sufficient for current schema work. Regenerate it from live Supabase DDL before any future schema-sensitive implementation.

## 6. Known obsolete statements that must not be reused

Older documents contain statements that are no longer current, including:

- the old `clinic_owner` architecture;
- old legacy `tenants` / `users` assumptions;
- old Milestone 3 / Session 11 sequencing;
- old queue and analytics verification statuses;
- old claims about empty permission mappings;
- old assumptions about Patient Portal scope before the two-layer portal decision;
- temporary/demo data descriptions that predate `PJ15_E2E_EXPANDED`.

These statements are retained only as historical evidence where the source document itself is retained. They are not current requirements.

## 7. E2E data documentation

`PJ_E2E_DEMO_DATASET.md` is the current documentation for the persistent synthetic Patient Journey dataset. It covers the expanded patient, appointment, visit, procedure, treatment-plan, treatment-plan-stage, medical-file, follow-up and notification scenarios.

The dataset is intentionally retained for future administrative stages. Random disposable test data must not be added when the persistent E2E dataset can be extended with a labelled scenario.

## 8. Documentation maintenance rule

Every completed PJ stage must update, at minimum:

- the stage closure record;
- `CHANGELOG.md`;
- the current handoff/status reference when the implementation state changes materially;
- relevant ADRs when an architectural decision was added or changed;
- `PJ_E2E_DEMO_DATASET.md` when test-data coverage changes.

Do not create another dated root-level handoff/progress document for routine work. Update the canonical document or place historical evidence under `/archive/`.

## 9. Required cleanup pass

The documentation cleanup is not complete until:

1. stale root documents listed above are moved to `/archive/`;
2. `PROJECT_HANDOFF.md` is regenerated with the current PJ stage state;
3. `MASTER_ROADMAP.md` is reconciled with the PJ stage track and current architecture;
4. `ARCHITECTURE_DECISIONS.md` receives explicit superseding decisions where required;
5. `DATABASE_SCHEMA.md` is regenerated from current live Supabase DDL;
6. `DOCUMENTATION_CONSOLIDATION_PLAN.md` is converted from an old proposal into a completed archival record;
7. no root document presents obsolete work as an active task.

Until those actions are completed, this status file is the index that identifies which documents are safe to use and which are historical.