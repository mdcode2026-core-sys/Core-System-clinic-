# CORE SYSTEM — Historical Documentation Audit & Recovery Register
## 2026-09-16

**Purpose:** establish one documentation ledger for closed historical work in the 30-day window 2026-08-18 → 2026-09-16 and prevent authoritative decisions, stage records, handoffs, and contracts from disappearing when unmerged branches are closed.

**Canonical active path:** PR #129 / `repair/global-experience-presentation-rebuild-2026-09-16`
**Canonical head audited:** `754bc51fb3aedf679d04cd99b058801c74a5f3d6`
**Main baseline:** `d85a5de23051919fb347e1482bc28f5fe70c0e14`

## 1. Rules of this audit

1. `main` is the production/release baseline, not the historical archive.
2. A closed PR is not evidence that its contents were merged into `main`.
3. A merged PR is not automatically proof that every documentation artifact remained current; later documents may supersede earlier ones.
4. Validation-only branches are evidence sources, not implementation payloads.
5. Current authoritative decisions must be preserved in the canonical active execution line.
6. Superseded/historical documents are preserved as evidence so later agents can understand project evolution without treating them as current authority.
7. Root `CORE_SYSTEM_EXECUTION_HANDOFF.md` and `CORE_SYSTEM_EXECUTION_LEDGER.md` are live operational records and must not be overwritten with stale historical snapshots merely to preserve history.
8. Every recovered artifact must retain provenance: source PR/branch/commit and classification.

## 2. Closed historical PR window

The closed PRs identified in the 30-day window include the following relevant sequence: #1–#128, with the later work concentrated in #14, #21, #24, #25, #27, #31, #36, #38, #40, #42, #46, #49, #59–#68, #81, #83–#87, #101, #122–#128. Most of the other PRs in the window are merged paths and therefore are not recovery candidates unless a specific documentation artifact was later removed or replaced.

## 3. Documentation-bearing historical paths — audit result

| PR | Documentation payload found | Relationship to main | Action for #129 |
|---|---|---|---|
| #14 | `docs/FINANCIAL_RESOURCES_DOMAIN.md` | Exact file absent from main | RECOVERED SOURCE BLOB; must be reconciled against later Financial/Resources work before treating as current authority |
| #21 | `docs/AJM-2-IMPLEMENTATION-LOG.md`, `docs/AJM-STAGE-INDEX.md` | Later AJM work is represented in main | No duplicate recovery; verify current AJM records remain authoritative |
| #24 | `docs/UX-GLOBAL-IA-AUDIT-2026-08-28.md` | Exact file absent from main | RECOVERED as historical evidence; later 2026-09-11+ global-surface reconciliation governs current interpretation |
| #25 | `docs/AJM-IMPLEMENTATION-STATUS-MATRIX-2026-08-28.md`, `docs/GLOBAL-UX-IA-STAGE-0-BASELINE-2026-08-28.md`, `docs/GLOBAL_UX_IA_DOCUMENTATION_RECONCILIATION_2026-08-28.md` | AJM matrix present in main; Stage 0 baseline/register exact files absent from main | AJM matrix KEEP in main; Stage 0 documents recovered as historical evidence |
| #27 | `docs/GLOBAL-UX-IA-STAGE-4-WORKSPACE-PERSONALIZATION-2026-08-28.md`, `DOCUMENTATION_STATUS.md`, `PROJECT_HANDOFF.md`, `CHANGELOG.md` | Later versions of root status files exist; exact Stage 4 record is absent from main | Stage 4 record recovered as historical evidence |
| #31 | No docs | Code/workflow only | No documentation recovery |
| #36 | No docs | Code/workflow only | No documentation recovery |
| #38/#40 | `docs/STAGE-11-IMPLEMENTATION-RECORD-2026-08-29.md` | Later merged stage path exists | No recovery needed |
| #42 | `docs/STAGE12-IMPLEMENTATION-RECORD-2026-08-29.md` | Later merged stage path exists | No recovery needed |
| #46 | Stage 12/13/14/15 closure and implementation records | Later merged stage path exists for the core closure records checked | No duplicate recovery; retain current main versions |
| #49 | Terminology governance/register/reconciliation | Current terminology governance is present in main | No recovery needed for current authority |
| #59–#61 | No substantive documentation payload | Code/tools only | No documentation recovery |
| #64/#65 | Validation marker documents | Validation-only evidence | Do not promote as active product authority |
| #68 | No docs | Code/i18n only | No documentation recovery |
| #81/#83 | No docs | Code/DB only | No documentation recovery |
| #84/#85 | `CLAUDE.md`, `CORE_SYSTEM_EXECUTION_HANDOFF.md`, `CORE_SYSTEM_EXECUTION_LEDGER.md`, `CORE_SYSTEM_STAGE15_TO_STAGE32_HANDOFF.md` | Paths exist in main, but branch snapshots contain later/branch-specific state | Do not overwrite live root docs; reconcile useful state into current handoff/ledger as needed |
| #87 | No docs | Code/DB only | No documentation recovery |
| #101 | Large Communications/Header/Test-Execution documentation set | Core binding Communications contract and execution plan are present in main | No duplicate recovery unless a path is proven absent after later merged follow-up work |
| #122 | `docs/CORE-SYSTEM-GLOBAL-EXPERIENCE-PRESENTATION-EXECUTION-STATUS-2026-09-16.md` | Present in #129 because #129 now points to the #122 head | KEEP in #129 |
| #123 | Adaptive Hybrid decision/reconciliation + Constitution/Contract governance set | Diverged from #129; exact decision/reconciliation artifacts are not in main | Current decision artifacts must be recovered into #129; see canonical files added by this recovery |
| #124 | Experience Constitution, Decision Registry, Execution Gate, Global Surfaces Reconciliation, Integrated Experience Work Contract, UX Architecture Investigation Final Handoff | In #129 through ancestry | KEEP in #129 |
| #125 | Experience Foundation / Visual Constitution / F1–F4 records and live handoff | In #129 through ancestry | KEEP in #129 |
| #126 | Validation-only copies of Experience governance plus global-surface reconciliation | Validation-only branch; overlapping docs already in #129 | No implementation payload recovery |
| #127 | `docs/CORE-SYSTEM-EXPERIENCE-F1-F4-EXECUTION-HANDOFF-2026-09-15.md` plus overlapping governance docs | Unique current-cycle handoff artifact not inherited by #129 | RECOVER into #129 |
| #128 | Same Experience Foundation documentation set as #125 plus integrated handoff | In #129 through the reconciled implementation line | KEEP in #129 |

## 4. Recovered into canonical #129

The following documentation is now protected in the canonical #129 line:

### Current/authoritative
- `docs/CORE-SYSTEM-ADAPTIVE-HYBRID-EXPERIENCE-MODEL-DECISION-2026-09-14.md`
- `docs/CORE-SYSTEM-ADAPTIVE-HYBRID-EXPERIENCE-RECONCILIATION-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-F1-F4-EXECUTION-HANDOFF-2026-09-15.md`

### Historical/source evidence recovered without promoting it to current authority
- `docs/reconciliation/historical-recovery/FINANCIAL_RESOURCES_DOMAIN.md` (source #14)
- `docs/reconciliation/historical-recovery/UX-GLOBAL-IA-AUDIT-2026-08-28.md` (source #24)
- `docs/reconciliation/historical-recovery/GLOBAL-UX-IA-STAGE-0-BASELINE-2026-08-28.md` (source #25)
- `docs/reconciliation/historical-recovery/GLOBAL_UX_IA_DOCUMENTATION_RECONCILIATION_2026-08-28.md` (source #25)
- `docs/reconciliation/historical-recovery/GLOBAL-UX-IA-STAGE-4-WORKSPACE-PERSONALIZATION-2026-08-28.md` (source #27)

These recovered historical artifacts are evidence, not authorization to reopen superseded product decisions.

## 5. Important current finding

The audit confirms a recurring failure mode:

```text
Branch created
   ↓
Documentation written
   ↓
Implementation continues on branch
   ↓
Branch/PR closed as superseded or abandoned
   ↓
No controlled documentation promotion/reconciliation
   ↓
main loses the authoritative artifact
   ↓
Future work reconstructs context from incomplete memory
   ↓
Implementation drift / repeated corrections
```

This is a documentation-governance problem, not merely a Git branching problem.

## 6. Required future rule

No branch/PR may be considered historically disposable until its documentation has been classified as:

- PROMOTE TO MAIN
- PROMOTE TO CURRENT CANONICAL EXECUTION BRANCH
- HISTORICAL ARCHIVE
- SUPERSEDED — RETAIN PROVENANCE
- VALIDATION-ONLY — RETAIN AS EVIDENCE
- DUPLICATE — POINT TO CANONICAL ARTIFACT

Closing a PR must never be treated as documentation closure.

## 7. Current status

**Documentation audit status:** ACTIVE RECOVERY COMPLETE FOR THE IDENTIFIED HIGH-VALUE DOCUMENTATION GAPS.

**Important limitation:** this register does not claim that every historical prose sentence from every merged PR is still current. It establishes provenance and prevents identified documentation loss; each artifact remains subject to authority and supersession rules.

**Next mandatory step:** reconcile the recovered historical documents against current main/#129 authority and then update the live `CORE_SYSTEM_EXECUTION_HANDOFF.md` / `CORE_SYSTEM_EXECUTION_LEDGER.md` with the resulting canonical map. Do not merge #129 to main until this reconciliation and the normal execution gates are complete.
