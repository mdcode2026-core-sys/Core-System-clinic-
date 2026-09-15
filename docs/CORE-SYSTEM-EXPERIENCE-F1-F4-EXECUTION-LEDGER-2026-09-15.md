# CORE SYSTEM — Experience Foundation F1–F4 Execution Ledger
## 2026-09-15

## Governing scope

- Experience Foundation: F1 Login, F2 Header, F3 Home, F4 Home → Workspace.
- Experience model: Horizon + Vertex + Zenith.
- Visual language: Concept 01 — Clinical Precision.
- Canonical workflow: VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE.
- Functional boundaries, authorization, data ownership, Communications scope, Agenda authority, and Home boundaries remain protected.
- **Scope freeze:** unrelated technical-debt, patient/RLS, runtime-error, and non-Experience investigations are paused until F1–F4 closure.
- **Validation freeze:** no new automated test execution is initiated during this freeze. Existing validation evidence is retained as historical evidence only and does not authorize closure.

## F1 — Login

Implemented and source-verified:
- dedicated authentication experience without authenticated Header/Sidebar;
- calm Clinical Precision presentation;
- preserved auth/redirect/language/reset/register/password visibility/loading/error behavior;
- native validation, autocomplete and accessible error association.

Post-implementation verification: re-read auth layout and Login source; confirmed authentication architecture and required behaviors remain intact.

## F2 — Header

Implemented and source-verified:
- independent Brand/Home, Global Search, Communications, Chat, Notifications, Quick Actions;
- no mega-pill and no duplicate engines;
- **three deliberate viewport compositions**, not one layout merely reordered/scaled:
  - Mobile: navigation/identity/tools row + dedicated search row;
  - Tablet: navigation/identity/search row + dedicated utility row;
  - Desktop: single compact global row;
- consistent 40px header control geometry;
- mobile Quick Actions menu viewport-anchored so it cannot be clipped by the utility row;
- Communications remains clinic-wide; Chat remains a compact Communications surface; Notifications remain independent; Quick Actions remain Language + Logout;
- Escape/focus restoration preserved for interactive panels;
- RTL/LTR uses logical positioning/order.

Post-implementation verification: re-read GlobalHeader, Quick Actions, Communications, Notifications, Chat and WorkspaceShell; confirmed mobile sidebar control targets the actual `global-sidebar` element and header controls have independent hit targets.

## F3 — Home

Implemented and source-verified:

### Identity / Context
- clinic identity and logo/brand fallback;
- user identity;
- approved Welcome lifecycle;
- **Weather/ambient context inside Identity Banner**;
- Weather is now an open context presentation, not a compressed nested card;
- Identity Banner no longer contains an Open Workspace action, preventing duplicate Workspace entry.

### Weather behavior
Weather uses the clinic address/country information, resolves the best available locality through Open-Meteo geocoding, retrieves current weather, localizes the condition text, uses bounded request timeouts/revalidation, and shows a clear fallback when the clinic address cannot resolve. No browser/user location is used as a substitute for clinic location.

### Today
The previous large four-card presentation was replaced with a compact actionable surface:
- Today's appointments;
- Waiting;
- In clinical work;
- Completed.

Each item is a direct link; the icon is part of the actionable target. Decorative navigation arrows were removed. The layout is compact 2×2 on narrow screens and four compact columns on wider screens.

### Destinations
- Workspace remains a direct execution destination.
- **Calendar** is presented as the visual scheduling destination and uses the existing Agenda calendar representation with preserved `doctorId` context.
- No `/calendar` scheduling engine or second calendar engine was introduced.

### Protected removals
Home remains free of Notifications, Communications, Work Center, Quick Actions, Patient Portal information and personalized widgets.

### Appointment context
Today's appointments continue to use `clinic_users.id → master_agenda_events.doctor_id`; only cancelled appointments are excluded from the Home count. No-show is not silently excluded.

Post-implementation verification: re-read Home, Identity Banner and Weather source; confirmed the above structures and exclusions directly in the current branch.

## F4 — Home → Workspace

Implemented and source-verified:
- explicit Workspace entry in the Next/Attention destinations;
- lightweight entering-work feedback;
- existing `/workspace` and authorization semantics preserved;
- WorkspaceShell records navigation away from Home for Welcome lifecycle;
- subtle work-mode distinction inside Workspace;
- no duplicate Workspace layer.

## Cross-F1–F4 correction cycle

Product Owner runtime review identified concrete defects. The following were implemented and individually source-verified after each change:
1. Mobile Quick Actions not opening/usable → menu changed to viewport-anchored mobile presentation.
2. Mobile/tablet/desktop were previously treated too similarly → Header rebuilt with three viewport-specific compositions.
3. Header Communications/Notifications/Chat control geometry inconsistent → normalized control sizing and spacing.
4. Identity Workspace action duplicated the lower Workspace destination → removed from Identity Banner.
5. Home destination incorrectly introduced as Agenda → changed to Calendar terminology while reusing the existing Agenda calendar representation.
6. Weather was visually compressed under identity content → moved to a dedicated Identity context column/row and removed nested-card treatment.
7. Today was an oversized replacement container → converted to compact directly actionable metric tiles with icon targets and no arrows.
8. Obsolete Identity Banner workspace prop → removed and verified.
9. Undefined Home hover token `--cs-azure-200` → replaced with the defined `--cs-azure-100` token to keep the Concept 01 visual token system internally valid.

## Validation state during scope freeze

Validation-only PR #127 was closed deliberately to stop further automated executions while the Experience Foundation is completed. It was not merged and remains historical only.

Run #247 (`34945834228`) completed with failure on 2026-09-15. The run was attached to an earlier state of the verification branch; the branch subsequently moved to `0a3bca...`. Therefore that run is **not evidence for the current implementation head** and is not being repaired or rerun during the freeze.

A dedicated implementation PR #128 now contains the Experience Foundation feature branch only and is intentionally draft while the closure work continues.

The current implementation head at the time of this ledger reconciliation is `8a8037f84d66c354e69e496e18ec56bd34b95212`, which contains the handoff reconciliation and ledger update. The prior implementation correction head was `acc765047d95ffb18caf0f409aaef1b484285011`.

## Final closure evidence still required after the freeze is lifted

- authoritative automated execution against the final Experience Foundation head;
- runtime visual verification of F1–F4;
- Desktop/Tablet/Mobile;
- RTL/LTR;
- accessibility/focus/keyboard/touch;
- Home/Agenda authorization and context;
- Product Owner runtime acceptance;
- final repository documentation and closure record.

No Vercel deployment is used as validation evidence for this phase.

**Current status: EXPERIENCE FOUNDATION NOT CLOSED — implementation/source review is advanced, but required closure evidence is intentionally deferred by the active freeze.**
