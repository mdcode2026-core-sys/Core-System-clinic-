# CORE SYSTEM — Historical Documentation Audit & Recovery Register
## 2026-09-16

**Purpose:** establish one documentation ledger for closed historical work in the 30-day window 2026-08-18 → 2026-09-16 and prevent authoritative decisions, stage records, handoffs, and contracts from disappearing when unmerged branches are closed.

**Canonical active path:** PR #129 / `repair/global-experience-presentation-rebuild-2026-09-16`
**Canonical implementation head at audit start:** `754bc51fb3aedf679d04cd99b058801c74a5f3d6`
**Main baseline:** `d85a5de23051919fb347e1482bc28f5fe70c0e14`

## Audit rule

A closed PR is not evidence of merge into `main`. Documentation must be classified independently from implementation. Validation-only branches are evidence paths, not implementation payloads. Current authority must be preserved in the canonical active line; historical/superseded evidence must remain traceable without being mistaken for current authority.

## Content-level audit method

This audit does not classify a branch from its name, PR title, commit message, or file name alone. For documentation-bearing refs, the audit compares the actual document content against the current `main` version where one exists and against the canonical #129 line when the branch contains later Experience work.

A historical document is treated as:

- **CURRENT / RECOVER** when it contains current authority or a current-cycle decision not represented in the canonical line.
- **MAIN-CURRENT** when `main` contains the same or later authoritative content.
- **HISTORICAL** when its content records useful project evolution but is no longer current authority.
- **SUPERSEDED** when a later explicit decision changes its meaning.
- **VALIDATION-ONLY** when its main value is test/runtime evidence tied to a historical candidate.
- **DUPLICATE** when the content is already represented without material loss elsewhere.

The audit deliberately avoids blind restoration of older snapshots.

## Closed PR scope

The closed PR history for the 30-day window was enumerated through the sequence ending at #128. Documentation-bearing and non-trivial historical paths were then examined at content level. Merged paths were treated as integration candidates; non-merged paths and independent documentation refs were treated as recovery candidates.

## First-pass PR findings

| PR | Documentation finding | Current relationship | #129 action |
|---|---|---|---|
| #14 | `docs/FINANCIAL_RESOURCES_DOMAIN.md` | Exact source artifact absent from main | Preserved under historical recovery; current authority reconciliation remains required before reuse |
| #21 | AJM-2 implementation/index documentation | Later/current AJM material represented in main | No duplicate recovery |
| #24 | `docs/UX-GLOBAL-IA-AUDIT-2026-08-28.md` | Exact source artifact absent from main | Preserved under historical recovery |
| #25 | Stage 0 baseline + documentation reconciliation; AJM status matrix | AJM matrix is in main; Stage 0 source artifacts are not fully represented there | Stage 0 source recovered as historical evidence; AJM matrix remains canonical in main |
| #27 | Stage 4 Workspace Personalization record | Current reconciled version exists in main | No recovery of old snapshot into active path |
| #38/#40 | Stage 11 implementation record | Later merged version present | No recovery |
| #42 | Stage 12 implementation record | Later merged version present | No recovery |
| #46 | Stage 12–15 closure/implementation documentation | Core closure records represented in main | No duplicate recovery |
| #49 | Terminology governance/register/reconciliation | Current terminology authority represented in main | No recovery of stale variants |
| #59–#61 | No substantive documentation | Code/tools only | No recovery |
| #64/#65 | Validation marker docs | Validation-only evidence | Preserve only as evidence where useful |
| #68 | No docs | Code/i18n only | No recovery |
| #81/#83 | No docs | Code/DB only | No recovery |
| #84/#85 | Root handoff/ledger snapshots and Stage 15→32 handoff | Live root paths exist in later state; branch snapshots contain additional execution context | Reconcile useful information into live Handoff/Ledger, never overwrite with stale snapshot |
| #87 | No docs | Code/DB only | No recovery |
| #101 | Communications/Header/Test-Execution documentation set | Core binding contract and execution plan are already in main; several branch docs are also present in main | No blind duplicate recovery |
| #122 | Global Experience execution status | In #129 through the consolidated head | Keep |
| #123 | Adaptive Hybrid decision/reconciliation + governance artifacts | Diverged from #129; exact Adaptive Hybrid decision/reconciliation were not in main | Current decision/reconciliation restored into #129 |
| #124 | Experience Constitution / Decision Registry / Execution Gate / Global Surfaces reconciliation / Integrated Work Contract / UX investigation handoff | In #129 through ancestry | Keep |
| #125 | Experience Foundation / Visual Constitution / F1–F4 records | In #129 through ancestry | Keep |
| #126 | Validation-only copies of Experience governance | Overlapping artifacts already represented | No implementation payload recovery |
| #127 | F1–F4 execution handoff plus overlapping governance | Unique current-cycle handoff not safely represented in main | Restored into #129 |
| #128 | Experience Foundation documentation | In #129 through reconciled implementation line | Keep |

## Second-pass independent documentation refs

The audit was expanded beyond PRs to independent branch refs whose names indicate documentation work. Their contents were inspected directly.

### `docs/ideal-operational-architecture-audit-2026-08-30`

Content-level comparison showed that this branch's apparent missing documents are largely already promoted to `main` in later, more complete forms.

Verified examples:

- `IDEAL-OPERATIONAL-ARCHITECTURE-AUDIT-2026-08-30.md` → `main` contains a later reconciled version with R01–R12 documentation closure.
- `IDEAL-OPERATIONAL-SCENARIOS-2026-08-30.md` → `main` contains the same 42-scenario baseline with an updated documentation-closed state.
- `IDEAL-SCENARIO-TRACEABILITY-MATRIX-2026-08-30.md` → `main` contains a more detailed scenario-by-scenario matrix and explicit documentary completion gate.
- `IMPLEMENTATION-DOCUMENT-REMEDIATION-MASTER-MATRIX-2026-08-30.md` → `main` contains a later closure version with owner/source-of-truth fields and historical classification.
- `IMPLEMENTATION-DOCUMENT-REMEDIATION-PLAN-2026-08-30.md` → `main` contains the executed/closed form of the same plan.
- `IMPLEMENTATION-DOCUMENT-REMEDIATION-RUNBOOK-2026-08-30.md` → `main` contains the executed/closed version.
- `GLOBAL-UX-IA-STAGE-5-WIDGET-LIBRARY-2026-08-28.md` → `main` contains the same stage plus later 2026-09-11 terminology reconciliation.

**Classification:** `MAIN-CURRENT / DUPLICATE` for the checked documents. No blind restoration required.

### `docs/header-chat-closure-2026-09-13`

Content-level checks included:

- `ADR-014-FOLLOW-UP-COMMUNICATIONS-COORDINATION-BOUNDARIES.md` → exact same current content exists in main.
- `ADR-015-CROSS-DOMAIN-TENANT-INTEGRITY-20260910.md` → exact same current content exists in main.
- `COMMUNICATIONS-CHAT-PATIENT-PORTAL-HISTORICAL-DOC-RECONCILIATION-2026-09-12.md` → exact same current content exists in main.
- `HEADER-TECHNICAL-FOUNDATION-NOTES-2026-09-11.md` → current content exists in main.
- `AJM-1-TEAM-ACCESS-USER-CONFIGURATION-ADDENDUM-2026-09-01.md` → exact same final addendum exists in main.

**Classification:** `MAIN-CURRENT / DUPLICATE` for the checked documents.

### `docs/global-ux-ia-final-reconciliation-2026-08-28`

The ref retains a broad historical documentation tree, but the inspected baseline documents are already represented in current `main` or superseded by later authority. This ref remains useful as historical lineage, not as an active execution base.

**Classification:** `HISTORICAL / MAIN-CURRENT MIXED`; further blind promotion is prohibited.

### `docs/insights-reconciliation-blueprint`

The branch exists independently of the PR sequence and therefore proves that PR enumeration alone cannot discover all historical documentation refs. Its branch head was separately inspected. No claim is made that every file on that ref has been content-diffed yet; it remains in the residual content-audit set below.

**Classification:** `AUDIT-CONTINUATION REQUIRED`.

### `docs/constitution-contract-2026-09-14`, `docs/ux-experience-constitution-work-contract-2026-09-14`, `docs/ux-experience-governance-foundation-2026-09-14`, `docs/reconcile-global-surfaces-2026-09-11`, `docs/terminology-governance-reconciliation-2026-08-29`

These refs were identified as independent documentation branches. The current #129 line already contains the corresponding Experience Constitution / Contract / Global Surfaces / Terminology authorities where verified, so these refs must be treated as provenance sources rather than parallel current authorities. Detailed file-by-file content comparison remains part of the residual audit where a branch contains unique dated artifacts.

**Classification:** `MIXED — CURRENT AUTHORITY ALREADY REPRESENTED; RESIDUAL CONTENT AUDIT REQUIRED`.

## Current high-value recovery set

The documents that were actually proven to be missing from the current canonical path and worth preserving are:

### Current-cycle authority / execution
- `docs/CORE-SYSTEM-ADAPTIVE-HYBRID-EXPERIENCE-MODEL-DECISION-2026-09-14.md`
- `docs/CORE-SYSTEM-ADAPTIVE-HYBRID-EXPERIENCE-RECONCILIATION-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-F1-F4-EXECUTION-HANDOFF-2026-09-15.md`

### Historical source evidence
- `docs/reconciliation/historical-recovery/FINANCIAL_RESOURCES_DOMAIN.md` (source #14)
- `docs/reconciliation/historical-recovery/UX-GLOBAL-IA-AUDIT-2026-08-28.md` (source #24)
- `docs/reconciliation/historical-recovery/GLOBAL-UX-IA-STAGE-0-BASELINE-2026-08-28.md` (source #25)
- `docs/reconciliation/historical-recovery/GLOBAL_UX_IA_DOCUMENTATION_RECONCILIATION_2026-08-28.md` (source #25)
- `docs/reconciliation/historical-recovery/GLOBAL-UX-IA-STAGE-4-WORKSPACE-PERSONALIZATION-2026-08-28.md` (historical source snapshot; the reconciled current version already exists in main)

## Living Handoff / Ledger reconciliation

`CORE_SYSTEM_EXECUTION_HANDOFF.md` and `CORE_SYSTEM_EXECUTION_LEDGER.md` are living records. Historical branch copies were not promoted as replacements.

Material continuity information has been reconciled into #129, including:

- Stage 15→32 forensic execution state;
- inventory canonical-path and legacy-RPC findings;
- subscription/permission ceiling reconciliation;
- provider availability ownership correction;
- treatment-plan lifecycle proof and UI correction;
- procurement/receiving/inventory and supplier-payment reconciliation;
- follow-up automation-rule duplicate repair;
- analytics semantic checks;
- tenant-consistency/RLS evidence;
- tenant-local Agenda timezone repair;
- Unified Test Execution Contract installation;
- historical Experience Foundation/F1–F4 implementation corrections;
- explicit rule that historical validation results do not become current-head evidence.

The current living documents are therefore the continuity point for new work; historical snapshots remain evidence only.

## Root cause confirmed

The recurring failure mode is:

```text
Documentation written on branch
        ↓
Implementation / validation evolves elsewhere
        ↓
PR closed as superseded / validation-only / abandoned
        ↓
No explicit documentation promotion/reconciliation
        ↓
main loses or lags the artifact
        ↓
Future work reconstructs context
        ↓
Decision drift / repeated corrections / unrelated remediation
```

This is a documentation-governance failure, not merely a branching problem.

## Mandatory rule going forward

Before a branch/PR becomes disposable, every documentation artifact must be classified as:

- PROMOTE TO MAIN
- PROMOTE TO CURRENT CANONICAL EXECUTION BRANCH
- HISTORICAL ARCHIVE
- SUPERSEDED — RETAIN PROVENANCE
- VALIDATION-ONLY — RETAIN AS EVIDENCE
- DUPLICATE — POINT TO CANONICAL ARTIFACT

Closing a PR is never documentation closure.

## Residual deep-audit set

The audit is intentionally **not declared complete for every historical ref** yet. The following independent documentation refs have been identified and require remaining content-level comparison before the historical-doc program itself can be called exhaustive:

- `docs/insights-reconciliation-blueprint`
- `docs/constitution-contract-2026-09-14`
- `docs/ux-experience-constitution-work-contract-2026-09-14`
- `docs/ux-experience-governance-foundation-2026-09-14`
- `docs/reconcile-global-surfaces-2026-09-11`
- `docs/terminology-governance-reconciliation-2026-08-29`
- any remaining `restore/*`, `reconciliation/*`, or `docs/*` refs discovered by branch enumeration that contain documentation not already compared by content.

These are not assumed to contain missing authority; they are explicitly marked as **not yet exhaustively content-diffed** rather than silently treated as clean.

## Current status

**Recovery of identified high-value missing documentation:** COMPLETE.

**Living Handoff/Ledger reconciliation:** COMPLETE for the currently inspected historical execution lineage.

**Exhaustive all-ref content audit:** OPEN — residual independent documentation refs remain to be content-diffed.

**No merge to `main` is authorized on the basis of this audit.**
