# CORE SYSTEM — F1–F4 Execution Handoff
## Historical Recovery from validation PR #127

**Date:** 2026-09-15
**Source PR:** #127
**Source branch:** `verify/experience-foundation-f1-f4-2026-09-15-r2`
**Source implementation head recorded by the handoff:** `a23761bebd9b23869ff1afcc1a1a0ca193aed5a3`
**Status in source:** implementation head source-verified; final acceptance dependent on required runtime/automated evidence.

## Purpose

This document preserves the current-cycle F1–F4 handoff that existed on validation PR #127 and was not inherited automatically by canonical PR #129. It is retained so the exact review corrections, validation boundary and required evidence are not lost when the validation branch is closed.

## F1 — Login

- Dedicated authentication experience; authenticated Header/Sidebar are not imported.
- Calm Clinical Precision presentation with existing authentication behavior preserved.
- Redirect, language, reset/register, password visibility, loading/error behavior, native validation, autocomplete and accessible error association preserved/implemented.

## F2 — Header

- Canonical capabilities remain: Brand/Home, Global Search, Communications, Chat, Notifications, Quick Actions.
- No mega-pill and no duplicate domain engines.
- Three deliberate viewport compositions:
  - Mobile: navigation/identity/tools row + dedicated search row.
  - Tablet: navigation/identity/search row + dedicated utility row.
  - Desktop: single compact global row.
- Header controls use a consistent 40px interaction geometry.
- Mobile Quick Actions menu is viewport-anchored so it cannot be clipped by the utility row.
- Communications is clinic-wide for authorized accounts; Chat remains a compact Communications surface; Notifications remain independent; Quick Actions remain Language + Logout.
- RTL/LTR uses logical positioning and independent control order.

## F3 — Home

Home composition:
`Identity / Context → Today → Attention when actionable → Next Destinations`

Identity Banner contains clinic identity, clinic logo/brand fallback, user identity, approved Welcome lifecycle, and Weather/ambient context. Weather is presented as open identity context rather than a nested compressed card.

Today's appointments preserve `clinic_users.id → master_agenda_events.doctor_id` and pass `doctorId` into the existing authoritative Agenda/Calendar representation.

Today is a compact action surface: relevant states remain directly actionable without explanatory arrows or a large replacement card wall.

Next destinations contain Workspace and Calendar. Calendar routes to the existing Agenda calendar representation; no second scheduling engine or `/calendar` engine was invented.

The following remain absent from Home: Notifications, Communications, Work Center, Quick Actions, Patient Portal information, and personalized widgets.

Workspace is intentionally not duplicated inside the Identity Banner; its entry remains in the dedicated Next/Attention destinations.

## F4 — Home → Workspace

- Workspace entry is explicit in the Home destination/Attention surfaces.
- Entering-work feedback is retained.
- Existing `/workspace` and authorization semantics remain authoritative.
- Workspace shell uses the transition state for Welcome lifecycle and a subtle work-mode distinction.
- No second workspace layer.

## Review corrections preserved

- Fixed mobile Quick Actions interaction/clipping.
- Rebuilt Header as three viewport-specific compositions.
- Normalized Communications/Notifications control geometry.
- Removed duplicate Identity Banner Workspace action.
- Replaced the unintended Home Agenda destination presentation with Calendar terminology and the existing Agenda calendar representation.
- Reworked Weather placement and presentation.
- Reworked Today from a large descriptive container into a compact actionable surface.
- Removed obsolete Identity Banner workspace prop.

## Validation boundary

Validation-only PR #127 was used against `main` so the mandatory unified execution workflow could run against the exact candidate without deploying to production.

Observed successful prerequisites for unified run #245 / `34945623748` included exact candidate checkout, Node setup and Playwright cache setup. At the recorded handoff point the workflow was still installing dependencies, so no final test result was claimed.

No Vercel deployment was used as validation evidence.

## Required final evidence

- terminal automated execution result;
- runtime Login/Header/Home/Home→Workspace checks;
- Mobile/Tablet/Desktop checks;
- RTL/LTR checks;
- accessibility/focus/keyboard/touch checks;
- Home/Agenda authorization and context confirmation;
- exact reviewed implementation head;
- current-cycle ledger reconciliation;
- Product Owner runtime acceptance.

**Recovery classification:** CURRENT-CYCLE HISTORICAL HANDOFF / preserve in canonical execution history; do not interpret as proof of closure or production readiness.
