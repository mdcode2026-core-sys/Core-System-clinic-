# CORE SYSTEM — EXECUTION HANDOFF

**Date:** 2026-09-16
**Canonical Branch:** `repair/global-experience-presentation-rebuild-2026-09-16`
**Canonical PR:** #129
**Current Canonical Head:** `c055edc10cbd8e0cddc2bf2eea94db0bad28e29e`
**Main Baseline:** `d85a5de23051919fb347e1482bc28f5fe70c0e14`
**Status:** HISTORICAL RECOVERY INTEGRATED — IMPLEMENTATION / VERIFICATION NOT CLOSED

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

### Historical recovery now integrated into the canonical line

The following recovery PRs were integrated into #129:

- **PR #130** — historical UX, visual, terminology and governance artifact recovery.
- **PR #131** — complete 2026-09-14 UX / Architecture Investigation Final Handoff recovery.
- **PR #132** — compatible F1–F4 Home implementation promotion.
- **PR #133** — compatible Login, Agenda context and Global Search promotion.
- **PR #134** — Home welcome dismissal correctness repair.

### Current canonical recovery outcome

The canonical line now preserves historical artifacts under `docs/historical-recovery/` and also contains compatible implementation work recovered from older branches. Historical artifacts are not treated as disposable merely because their source PR was closed.

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
- COMPATIBLE IMPLEMENTATION CANDIDATE — REVIEW / TEST / PROMOTE

The detailed 30-day audit and provenance map is recorded in:

`docs/reconciliation/CORE-SYSTEM-HISTORICAL-DOCUMENTATION-AUDIT-2026-09-16.md`

## 5. Current Documentation Authority Recovered

The current canonical line now protects, either as active authority or historical source with provenance, the Experience Foundation/Presentation record set including:

- Adaptive Hybrid Experience Model Decision and Reconciliation.
- Experience Constitution, Decision Registry, Execution Gate and Integrated Work Contract.
- Design / UX / Architecture Constitution.
- UX / Architecture Investigation Final Handoff.
- UX Experience Governance VERIFY and PLAN records.
- F1–F4 Execution Ledger.
- F1–F4 Foundation Scope Freeze.
- Integrated Experience Constitution dated 2026-09-16.
- Visual Design Constitution.
- Visual Execution Contract.
- Visual Token Specification.
- Surface Visual Application Matrix.
- Experience Presentation System.
- Insights engineering blueprint recovery.
- Branch reconciliation decision log.
- Terminology Governance, Application Register and Historical Reconciliation.

Exact historical source artifacts are preserved under:

`docs/historical-recovery/`

Their presence does not reopen superseded product decisions.

## 6. Compatible Implementation Recovery Now Integrated

### Home

Recovered and integrated from historical F1–F4 work:

- clinic/user identity context;
- approved welcome behavior;
- clinic weather as lightweight contextual information;
- user-context-aware Today appointments;
- Agenda destination preserving `doctorId` context where available;
- compact Today indicators;
- Attention state for waiting work;
- direct Home → Workspace transition;
- Home exclusion of Notifications, Communications, Work Center, Patient Portal information, Quick Actions and personalized widgets.

The recovery deliberately retained Next.js navigation and shared token usage rather than blindly copying historical anchor/styling choices.

### Home correctness repair

Historical implementation used a session flag for the welcome state but did not mark it on navigation. This was corrected through:

- `src/features/home/homeWelcome.ts`;
- navigation-time welcome dismissal in Home and Workspace/transition actions.

### Login

Compatible Clinical Precision authentication presentation is now integrated while preserving the existing Supabase Auth flow and dedicated auth shell boundary.

### Agenda

Compatible context-aware Agenda work is now integrated:

- doctor context via `doctorId` query parameter;
- context filtering and clear-context behavior;
- user-specific Home appointment destination remains within authoritative Agenda.

Agenda remains the authoritative scheduling/planning domain; no second scheduling engine was introduced.

### Global Search

Compatible Clinical Precision presentation and responsive/focus behavior are now integrated into `src/core/search/GlobalSearch.tsx` while reusing the existing `globalSearch()` action/engine.

### Visual foundation

The Clinical Precision semantic token and shared surface/focus layer is now integrated into `src/app/globals.css` without replacing the existing Tailwind/shadcn HSL variable compatibility layer.

## 7. Current Experience Foundation Context

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
- Experience Foundation and Experience Presentation are now treated as one integrated execution model.

## 8. Historical Implementation Candidates Not Blindly Revived

The historical PR #123 Home implementation remains preserved as a superseded implementation snapshot because it contained Home sections later explicitly removed by approved decisions. Its reusable Experience primitives remain a separate review candidate rather than an automatic replacement for the current canonical UI.

The PR #128 historical Header implementation was inspected against the current `GlobalHeader.tsx` in #129. The current #129 Header includes additional geometry/focus/shell work and is therefore treated as the current implementation baseline; the older #128 Header snapshot is retained as historical evidence rather than blindly promoted.

## 9. Historical Audit Status

The audit is broader than PR #122–#128. Independent refs and reconciliation refs are being classified by actual content/diff.

Confirmed examples of content already represented in main/current form include many August operational-architecture documents and the header/communications closure artifacts.

Confirmed unique/recovered sources include:

- Insights Engineering Blueprint.
- Branch Reconciliation Decision Log.
- 2026-09-14 Constitution/Contract source artifacts.
- 2026-09-14 UX Architecture Investigation Handoff.
- 2026-08-29 Terminology Governance source set.
- 2026-09-15 Visual Foundation source set.

The audit remains open for remaining independent refs and for direct comparison of any residual implementation-bearing refs that may contain compatible work.

## 10. Current Closure Gate

#129 is **NOT CLOSED**.

No merge to `main` is authorized until applicable gates are evidenced for the current canonical head `c055edc10cbd8e0cddc2bf2eea94db0bad28e29e`.

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

## 11. Immediate Next Execution

1. Run and review the current #129 automated execution gates on the exact head `c055edc10cbd8e0cddc2bf2eea94db0bad28e29e`.
2. Perform targeted runtime verification of Login, Header, Home, Home→Workspace, Agenda-context routing and Global Search in desktop/tablet/mobile and Arabic/English.
3. Review remaining independent documentation/implementation refs against #129 by actual changed content, not ref names.
4. Promote additional compatible work only after content-level review and applicable tests.
5. Update the live Handoff/Ledger and recovery register with each promotion/rejection.
6. Only after evidence is complete, perform REVIEW → DOCUMENT finalization → CLOSE.

**End of Live Execution Handoff.**
