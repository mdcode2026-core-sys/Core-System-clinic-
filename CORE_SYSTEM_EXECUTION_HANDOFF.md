# CORE SYSTEM — EXECUTION HANDOFF

**Date:** 2026-09-15
**Current Branch:** `feat/visual-design-constitution-f1-f4-2026-09-15`
**Current Implementation Head:** `acc765047d95ffb18caf0f409aaef1b484285011`
**Base:** `main` (`d85a5de23051919fb347e1482bc28f5fe70c0e14`)

## Objective
Implement the Product Owner-approved **Experience Foundation** across F1–F4 as one adaptive experience system, using Clinical Precision as its visual language and preserving all functional/surface boundaries.

## Governing scope
- F1 — Login
- F2 — Header
- F3 — Home
- F4 — Home → Workspace
- Experience model: Horizon + Vertex + Zenith.
- Visual language: Concept 01 — Clinical Precision.
- Canonical workflow: `VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE`.

## Current F1–F4 implementation

### F1 — Login
- Dedicated authentication experience; authenticated Header/Sidebar are not imported.
- Clinical Precision presentation with existing authentication behavior preserved.
- Redirect, language, reset/register, password visibility, loading/error behavior, native validation, autocomplete and accessible error association preserved/implemented.

### F2 — Header
- Canonical capabilities remain: Brand/Home, Global Search, Communications, Chat, Notifications, Quick Actions.
- No mega-pill and no duplicate domain engines.
- Three deliberate viewport compositions:
  - Mobile: navigation/identity/tools row + dedicated search row.
  - Tablet: navigation/identity/search row + dedicated utility row.
  - Desktop: single compact global row.
- Header controls use consistent 40px interaction geometry.
- Mobile Quick Actions is viewport-anchored.
- Communications is clinic-wide for authorized accounts; Chat remains a compact Communications surface; Notifications remain independent; Quick Actions remain Language + Logout.
- RTL/LTR uses logical positioning and independent control order.

### F3 — Home
Home composition:
`Identity / Context → Today → Attention when actionable → Next Destinations`

- Identity Banner contains clinic identity, logo/brand fallback, user identity, approved Welcome lifecycle, and Weather/ambient context.
- Weather is open identity context rather than a compressed nested card and uses clinic address/country rather than browser/user location.
- Today's appointments preserve `clinic_users.id → master_agenda_events.doctor_id` and pass `doctorId` into the existing authoritative Agenda/Calendar representation.
- Today is a compact actionable surface: appointments, waiting, in clinical work, completed.
- Next destinations contain Workspace and Calendar; Calendar reuses the existing Agenda representation and does not create a second scheduling engine.
- Home remains free of Notifications, Communications, Work Center, Quick Actions, Patient Portal information, and personalized widgets.
- Workspace is not duplicated inside Identity Banner.

### F4 — Home → Workspace
- Workspace entry is explicit in Next/Attention destinations.
- Entering-work feedback is retained.
- Existing `/workspace` and authorization semantics remain authoritative.
- WorkspaceShell records navigation away from Home for Welcome lifecycle and provides a subtle work-mode distinction.
- No duplicate Workspace layer.

## Review corrections applied
1. Mobile Quick Actions interaction/clipping corrected.
2. Header rebuilt as three viewport-specific compositions.
3. Communications/Notifications/Chat control geometry normalized.
4. Duplicate Identity Banner Workspace action removed.
5. Home scheduling destination presented as Calendar while reusing the existing Agenda representation.
6. Weather placement changed to dedicated Identity context.
7. Today changed from a large descriptive container to a compact actionable surface.
8. Obsolete Identity Banner workspace prop removed.
9. Undefined Home hover token corrected from `--cs-azure-200` to the defined `--cs-azure-100` token.

## Scope and validation freeze
The current work cycle is restricted to Experience Foundation F1–F4. Unrelated technical-debt, patient/RLS, runtime-error, database, and cross-domain investigations are frozen until F1–F4 closure.

**No new automated test execution or unrelated investigation is initiated during the current freeze.** Historical validation runs remain historical only and do not authorize closure.

Validation PR #127 was deliberately closed and not merged. It is not an active execution path.

No Vercel deployment is used as validation evidence for this phase.

## Required closure evidence after the freeze is lifted
- authoritative automated execution against the final Experience Foundation head;
- runtime Login/Header/Home/Home→Workspace verification;
- Desktop/Tablet/Mobile;
- RTL/LTR;
- accessibility/focus/keyboard/touch;
- Home/Agenda authorization and context confirmation;
- exact reviewed implementation head;
- repository documentation and ledger reconciliation;
- Product Owner runtime acceptance.

**Current status: EXPERIENCE FOUNDATION NOT CLOSED — implementation/source review is advanced, but required closure evidence is intentionally deferred by the active freeze.**
