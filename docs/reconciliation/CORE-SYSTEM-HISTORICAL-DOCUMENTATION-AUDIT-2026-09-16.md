# CORE SYSTEM — Historical Documentation Audit & Recovery Register
## 2026-09-16

**Purpose:** establish one documentation ledger for closed historical work in the 30-day window 2026-08-18 → 2026-09-16 and prevent authoritative decisions, stage records, handoffs, and contracts from disappearing when unmerged branches are closed.

**Canonical active path:** PR #129 / `repair/global-experience-presentation-rebuild-2026-09-16`
**Canonical implementation head before this audit commit:** `754bc51fb3aedf679d04cd99b058801c74a5f3d6`
**Main baseline:** `d85a5de23051919fb347e1482bc28f5fe70c0e14`

## Audit rule

A closed PR is not evidence of merge into `main`. Documentation must be classified independently from implementation. Validation-only branches are evidence paths, not implementation payloads. Current authority must be preserved in the canonical active line; historical/superseded evidence must remain traceable without being mistaken for current authority.

## Closed PR scope

The repository's closed PR history for the 30-day window was enumerated, covering the sequence through #128. Documentation-bearing/non-trivial historical paths were inspected at the changed-file level; merged paths were treated as integration candidates and non-merged paths as primary recovery candidates.

## Documentation findings

| PR | Documentation finding | Current relationship | #129 action |
|---|---|---|---|
| #14 | `docs/FINANCIAL_RESOURCES_DOMAIN.md` | Exact artifact absent from main | Preserved as source recovery; reconcile against later Financial/Resources authority before treating as current |
| #21 | AJM-2 implementation/index documentation | Later AJM material is represented in main | No duplicate recovery |
| #24 | `docs/UX-GLOBAL-IA-AUDIT-2026-08-28.md` | Exact artifact absent from main | Preserved under historical recovery |
| #25 | Stage 0 baseline + documentation reconciliation; AJM status matrix | AJM matrix is in main; Stage 0 artifacts are not both present in main | Stage 0 baseline recovered; AJM matrix kept canonical in main |
| #27 | Stage 4 Workspace Personalization record | **Present in main** as the reconciled historical Stage 4 record | No recovery required; use current main version, which explicitly binds it to My Workspace and the 2026-09-11 reconciliation |
| #38/#40 | Stage 11 implementation record | Later merged path present | No recovery |
| #42 | Stage 12 implementation record | Later merged path present | No recovery |
| #46 | Stage 12–15 closure/implementation documentation | Core closure records checked in main | No duplicate recovery |
| #49 | Terminology governance/register/reconciliation | Current terminology governance is present in main | No recovery of current authority |
| #59–#61 | No substantive docs | Code/tools only | No recovery |
| #64/#65 | Validation marker docs | Validation-only evidence | Do not promote to current authority |
| #68 | No docs | Code/i18n only | No recovery |
| #81/#83 | No docs | Code/DB only | No recovery |
| #84/#85 | Root handoff/ledger snapshots plus stage handoff | Corresponding live root paths exist in main but current contents differ | Do not overwrite live root docs; reconcile useful current-cycle information into the canonical handoff/ledger |
| #87 | No docs | Code/DB only | No recovery |
| #101 | Communications/Header/Test-Execution documentation set | Binding Communications contract and execution plan are present in main; later merged work carries the core current artifacts | No duplicate recovery unless a specific unique artifact is subsequently proven absent |
| #122 | Global Experience execution status | Present in #129 through its current head | Keep |
| #123 | Adaptive Hybrid decision/reconciliation + governance artifacts | Branch diverged from #129; exact Adaptive Hybrid decision/reconciliation were absent from main | Current decision/reconciliation restored into #129 |
| #124 | Experience Constitution / Decision Registry / Execution Gate / Global Surfaces reconciliation / Integrated Work Contract / UX investigation handoff | In #129 through ancestry | Keep |
| #125 | Experience Foundation / Visual Constitution / F1–F4 records | In #129 through ancestry | Keep |
| #126 | Validation-only copies of Experience governance | Overlapping artifacts already in #129; branch itself is validation-only | No implementation payload recovery |
| #127 | `docs/CORE-SYSTEM-EXPERIENCE-F1-F4-EXECUTION-HANDOFF-2026-09-15.md` | Unique current-cycle handoff artifact not inherited by #129 | Restored into #129 |
| #128 | Experience Foundation documentation | In #129 through the reconciled implementation line | Keep |

## Protected in #129

### Current/authoritative recovered artifacts
- `docs/CORE-SYSTEM-ADAPTIVE-HYBRID-EXPERIENCE-MODEL-DECISION-2026-09-14.md`
- `docs/CORE-SYSTEM-ADAPTIVE-HYBRID-EXPERIENCE-RECONCILIATION-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-F1-F4-EXECUTION-HANDOFF-2026-09-15.md`

### Historical/source evidence recovered
- `docs/FINANCIAL_RESOURCES_DOMAIN.md` (source #14; pending authority reconciliation)
- `docs/reconciliation/historical-recovery/UX-GLOBAL-IA-AUDIT-2026-08-28.md` (source #24)
- `docs/reconciliation/historical-recovery/GLOBAL-UX-IA-STAGE-0-BASELINE-2026-08-28.md` (source #25)
- `docs/reconciliation/historical-recovery/GLOBAL-UX-IA-STAGE-4-WORKSPACE-PERSONALIZATION-2026-08-28.md` (source snapshot #27; preserved separately even though the reconciled version is present in main)

## Root handoff / ledger warning

`CORE_SYSTEM_EXECUTION_HANDOFF.md` and `CORE_SYSTEM_EXECUTION_LEDGER.md` exist in main and in later branches. They are living operational documents, not archival snapshots. Historical branch versions must be compared and their useful state reconciled into the current canonical handoff/ledger rather than blindly overwriting the current files.

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

## Current status

**Documentation recovery:** active/high-value gaps identified and protected in #129.

**Important scope note:** this is a documentation reconciliation artifact; it does not convert historical stage records into current authority and does not claim any production/runtime closure.

**Next required action:** reconcile the recovered historical artifacts and the branch snapshots of `CORE_SYSTEM_EXECUTION_HANDOFF.md` / `CORE_SYSTEM_EXECUTION_LEDGER.md` against the current #129 implementation, then promote the resulting canonical documentation to `main` only when #129 itself passes the normal execution gates.
