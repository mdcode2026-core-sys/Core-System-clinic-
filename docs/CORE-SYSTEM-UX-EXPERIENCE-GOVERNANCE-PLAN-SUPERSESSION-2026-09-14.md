# CORE SYSTEM — UX / Experience Governance PLAN Supersession
## 2026-09-14

**Status:** APPROVED GOVERNANCE CORRECTION
**Supersedes:** The implementation-transition portions of `docs/CORE-SYSTEM-UX-EXPERIENCE-GOVERNANCE-PLAN-2026-09-14.md`.
**Branch:** `visual-experience-constitution-2026-09-14`
**Authority:** Product Owner decision that the Adaptive Hybrid Experience Model is approved but the Visual / Experience Constitution must be defined before visual implementation proceeds.

## 1. Purpose

The existing UX / Experience Governance PLAN correctly identified the need for a product-wide experience governance layer, but its sequencing allowed transition to IMPLEMENT before the required Visual / Experience Constitution had been defined and reviewed.

This record corrects that sequencing.

## 2. Current Governing Sequence

The required sequence is now:

```text
Adaptive Hybrid Experience Model
        ↓
Visual / Experience Constitution
        ↓
Surface-by-Surface Visual Decisions
        ↓
Implementation Planning / Reconciliation
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

The Adaptive Hybrid Experience Model is approved.

The Visual / Experience Constitution is currently a governed working draft and is the active next-stage artifact.

## 3. Implementation Gate Correction

The previous PLAN statement that implementation could begin after PLAN completion is superseded for the visual/experience workstream.

No product-wide visual implementation is authorized until:

1. the Visual / Experience Constitution is reviewed;
2. material visual decisions are explicitly marked APPROVED;
3. unresolved visual decisions required by the implementation scope are resolved;
4. the Constitution is promoted to implementation authority;
5. the implementation scope is reconciled against the approved Constitution.

## 4. PR #123 Status

PR #123 remains:

**OPEN / UNMERGED / VISUALLY NOT CLOSED**

Its CI status does not constitute visual acceptance.

Its existing visual implementation must not be treated as the final realization of the approved Adaptive Hybrid Experience Model.

The correct next action is reconciliation against the Visual / Experience Constitution, not further uncontrolled visual tweaking.

## 5. Active Constitution

The active working document is:

`docs/CORE-SYSTEM-VISUAL-EXPERIENCE-CONSTITUTION-2026-09-14.md`

It establishes the approved governing principles and explicitly records unresolved visual decisions rather than guessing them.

## 6. No-Guessing Rule

Until a visual decision is explicitly approved, implementation must not infer it from:

- the current source styling;
- an existing component appearance;
- a screenshot;
- a common UI convention;
- an assumed “best practice”;
- the Adaptive Hybrid layer names themselves.

An unresolved visual/product decision remains OPEN.

## 7. Result

**Governance state:** CORRECTED.

**Adaptive Hybrid Model:** APPROVED.

**Visual / Experience Constitution:** DRAFT — ACTIVE GOVERNING WORK ITEM.

**Visual implementation:** NOT AUTHORIZED BY CURRENT CONSTITUTION STATE.

**Next stage:** Product Owner review and closure of the required Visual / Experience Constitution decisions.

**End of Supersession Record.**
