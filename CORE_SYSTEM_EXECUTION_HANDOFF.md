# CORE SYSTEM — EXECUTION HANDOFF

**Date:** 2026-09-16
**Canonical Branch:** `repair/global-experience-presentation-rebuild-2026-09-16`
**Canonical PR:** #129
**Current Canonical Head:** `e596b359e8abfc242017fa084a587a4197359352`
**Main Baseline:** `d85a5de23051919fb347e1482bc28f5fe70c0e14`
**Status:** DOCUMENTATION RECONCILIATION ACTIVE — IMPLEMENTATION / VERIFICATION NOT CLOSED

## 1. Objective

Maintain one conversation-independent execution handoff for CORE SYSTEM. This file is the live continuity record for the current canonical execution path and must be updated when material execution state changes.

Historical branch snapshots are evidence. They must not replace this live record with stale branch-specific state.

## 2. Governing Execution Sequence

```text
VERIFY
  ↓
PLAN
  ↓
IMPLEMENT
  ↓
BUILD
  ↓
VERIFY
  ↓
REVIEW
  ↓
DOCUMENT
  ↓
CLOSE
```

The sequence may iterate inside a stage. No stage is skipped merely because a previous branch or PR was closed.

## 3. Current Canonical Path

PR #129 is the single active execution path for the consolidated Global Experience work.

The canonical consolidation intentionally does **not** mean that every historical branch was merged wholesale. Surviving compatible implementation and documentation are retained; superseded, contradictory, validation-only and stale branch snapshots are not revived as execution bases.

### Historical sources already reconciled into the canonical line

- PRs/branches `#122–#128` — current Experience Foundation / Global Experience lineage.
- Earlier historical branches in the 30-day audit window were reviewed for documentation and branch-vs-main drift, including AJM, Global UX/IA, Workspace, I18N, Patient Journey, Financial & Resources, Communications/Header and validation paths.
- Independent documentation/reconciliation refs were also inspected, including `docs/insights-reconciliation-blueprint`, `reconciliation/decision-log-2026-09-08`, `docs/ideal-operational-architecture-audit-2026-08-30`, `docs/header-chat-closure-2026-09-13`, and Workspace/Global-Surfaces documentation refs.

## 4. Documentation Recovery Finding

The historical audit confirmed a recurring documentation-loss pattern:

```text
Branch / PR created
   ↓
Decision / contract / handoff documented
   ↓
Implementation continues on branch
   ↓
PR closed or superseded
   ↓
No controlled documentation promotion/reconciliation
   ↓
main lacks the latest decision/context
   ↓
Future work reconstructs context incorrectly
   ↓
Implementation drift / repeated corrections
```

Closing a PR is therefore **not** documentation closure.

The repository now uses explicit classification for historical artifacts:

- PROMOTE TO MAIN
- PROMOTE TO CURRENT CANONICAL EXECUTION BRANCH
- HISTORICAL ARCHIVE
- SUPERSEDED — RETAIN PROVENANCE
- VALIDATION-ONLY — RETAIN AS EVIDENCE
- DUPLICATE — POINT TO CANONICAL ARTIFACT

The detailed 30-day audit and provenance map is recorded in:

`docs/reconciliation/CORE-SYSTEM-HISTORICAL-DOCUMENTATION-AUDIT-2026-09-16.md`

## 5. Current Documentation Authority Recovered

The following current-cycle artifacts are now protected in #129 where they were not reliably represented in `main`:

- `docs/CORE-SYSTEM-ADAPTIVE-HYBRID-EXPERIENCE-MODEL-DECISION-2026-09-14.md`
- `docs/CORE-SYSTEM-ADAPTIVE-HYBRID-EXPERIENCE-RECONCILIATION-2026-09-14.md`
- `docs/CORE-SYSTEM-CONSTITUTION-CONTRACT-RECONCILIATION-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-CONSTITUTION-AND-GOVERNANCE-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-DECISION-REGISTRY-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-EXECUTION-GATE-2026-09-14.md`
- `docs/CORE-SYSTEM-INTEGRATED-EXPERIENCE-WORK-CONTRACT-2026-09-14.md`
- `docs/CORE-SYSTEM-DESIGN-UX-ARCHITECTURE-CONSTITUTION-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-F1-F4-EXECUTION-LEDGER-2026-09-15.md`
- `docs/CORE-SYSTEM-EXPERIENCE-FOUNDATION-SCOPE-FREEZE-2026-09-15.md`
- `docs/CORE-SYSTEM-INTEGRATED-EXPERIENCE-CONSTITUTION-2026-09-16.md`
- `docs/reconciliation/historical-recovery/INSIGHTS-ENGINEERING-BLUEPRINT-RECOVERY-2026-09-16.md`
- `docs/reconciliation/historical-recovery/BRANCH-RECONCILIATION-DECISION-LOG-2026-09-08.md`

The Experience Presentation System and the remaining Visual Foundation artifacts from the #128 source line are identified as current-cycle documentation that still require exact-source promotion/reconciliation if they are not already represented in #129. The audit must not close until this source-vs-canonical check is complete.

Historical source evidence has been preserved under:

`docs/reconciliation/historical-recovery/`

Their presence does not reopen superseded product decisions.

## 6. Living Handoff / Ledger Rule

`CORE_SYSTEM_EXECUTION_HANDOFF.md` and `CORE_SYSTEM_EXECUTION_LEDGER.md` are **living operational records**.

Branch snapshots from historical PRs #84/#85/#125/#127 and related paths must be reconciled into these files rather than copied over them.

Historical snapshots may preserve:

- earlier baseline SHAs;
- stage-by-stage forensic findings;
- migration lineage discoveries;
- runtime/CI evidence;
- unresolved blockers;
- branch-control decisions;
- exact handoff context;

but their old branch/date/current-head claims must not override the current #129 state.

## 7. Integrated Historical Execution Knowledge

The live ledger now carries forward the material execution knowledge from the September 9 reconciliation lineage, including:

- baseline reconstruction and branch-only change control;
- live DB vs repository schema reconciliation;
- appointment→visit causality checks;
- inventory canonical-path repair and legacy RPC investigation;
- subscription/permission ceiling reconciliation;
- provider availability ownership correction;
- treatment-plan lifecycle proof and UI correction;
- procurement→receipt→inventory reconciliation;
- follow-up automation-rule duplicate reconciliation;
- supplier payment and procurement financial reconciliation;
- analytics semantic comparison;
- tenant-consistency and RLS checks;
- tenant-local timezone boundary repair for Agenda booking;
- installation of the Unified Test Execution Contract;
- evidence that CI success is not equivalent to runtime or production closure.

These items are historical execution evidence, not an instruction to reopen already completed repairs blindly.

## 8. Current Experience Foundation Context

The current canonical Experience Foundation is governed by:

- Adaptive Hybrid Experience Model: Horizon + Vertex + Zenith.
- Visual language: Concept 01 — Clinical Precision.
- F1 Login, F2 Header, F3 Home, F4 Home → Workspace.
- Information density follows Work Complexity.
- Home remains Simple + Contextual and is not a specialist work engine.
- Header controls remain independent semantic functions.
- Communications is clinic-wide; Chat is a compact Communications surface; Notifications remain separate.
- Calendar remains a representation over the authoritative Agenda; no second scheduling engine.
- RTL/LTR changes experience direction where logically appropriate; semantic-direction elements retain fixed semantic orientation where required.
- Experience Foundation and Experience Presentation must now be treated as one integrated execution model, not competing or sequential design systems.

## 9. F1–F4 Current Evidence Context

The F1–F4 historical execution ledger records source-verified implementation corrections including:

- dedicated Login shell separation;
- three deliberate Header viewport compositions;
- consistent Header control geometry;
- mobile Quick Actions viewport anchoring;
- Home Identity/Context + Today + Attention + Next Destinations composition;
- Weather treated as open context rather than a nested card;
- Calendar terminology with existing Agenda representation;
- removal of duplicate Home Workspace action;
- compact actionable Today states;
- preservation of Home exclusions for Notifications, Communications, Work Center, Quick Actions, Patient Portal information and personalized widgets;
- RTL/LTR logical positioning;
- correction of undefined visual token usage.

The F1–F4 work remains **NOT CLOSED** until current-head automated/runtime evidence is complete. The historical Run #280 result is evidence for the older candidate only and cannot be promoted to the current #129 head.

## 10. Historical PR / Main Reconciliation Principles

Content-level review has demonstrated several important classes:

### Already represented in main — do not duplicate

Examples include later/current versions of:

- Communications/Portal reconciliation records;
- Header technical foundation records;
- Quick Actions execution contract;
- terminology governance;
- Stage 12–15 closure/implementation records;
- current Global Surfaces reconciliation;
- many August operational architecture/remediation documents where `main` contains a later executed/reconciled version.

The existence of an older branch copy is not a reason to restore a duplicate file.

### Unique/high-value historical documentation — preserve/reconcile

Examples include:

- Financial & Resources domain source from the historical branch;
- Global UX/IA audit and Stage 0 source records;
- Adaptive Hybrid decision/reconciliation records;
- Experience Constitution / Decision Registry / Execution Gate;
- F1–F4 execution handoff/ledger/scope freeze;
- Insights engineering blueprint;
- historical branch reconciliation decision log.

### Validation-only paths

Validation PRs/branches such as #126/#127 are evidence paths. Their test observations may inform the canonical handoff/ledger, but their branch state is not itself the implementation baseline.

## 11. Current Closure Gate

#129 is **NOT CLOSED**.

No merge to `main` is authorized until applicable gates are evidenced for the current canonical head.

Required current-cycle evidence includes, as applicable:

- current-head TypeScript/lint/build;
- Unified Test Execution Contract / SETUP applicability;
- relevant automated E2E;
- runtime browser verification;
- Login/Header/Home/Home→Workspace behavior;
- Desktop/Tablet/Mobile;
- Arabic/English;
- RTL/LTR;
- accessibility, keyboard, focus and touch behavior;
- overlay/panel stacking and dismissal behavior;
- adjacent-surface regression;
- exact current-head documentation reconciliation;
- production verification where the final claim requires it.

CI/build/deployment success alone does not establish product closure.

## 12. Immediate Next Execution

1. Complete exact-source promotion/reconciliation for the remaining #128 Visual Foundation / Presentation artifacts.
2. Complete content-level comparison of the residual independent documentation refs identified by the historical audit.
3. Reconcile resulting findings into the live Handoff/Ledger and recovery register.
4. Verify the resulting #129 tree and exact documentation diffs.
5. Run the current Experience/Global-Surfaces validation gates against the exact #129 head.
6. Only after evidence is complete, perform REVIEW → DOCUMENT finalization → CLOSE.

**End of Live Execution Handoff.**
