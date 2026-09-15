# CORE SYSTEM — Experience Foundation F1–F4 Execution Ledger
## 2026-09-15

## Governing scope

- Experience Foundation: F1 Login, F2 Header, F3 Home, F4 Home → Workspace.
- Experience model: Horizon + Vertex + Zenith.
- Visual language: Concept 01 — Clinical Precision.
- Canonical workflow: VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE.
- Functional boundaries, authorization, data ownership, Communications scope, Agenda authority, and Home boundaries remain protected.
- **Scope freeze:** unrelated technical-debt, patient/RLS, runtime-error, and non-Experience investigations are paused until F1–F4 closure.
- **Important clarification:** the scope freeze does **not** freeze testing, investigation, fixes, build verification, runtime verification, accessibility verification, responsive verification, or documentation that directly belongs to Experience Foundation F1–F4.

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

## Authoritative automated validation — Run #280

Run **#280** / GitHub Actions ID `35004429741` executed against the PR merge candidate generated from head `0bfbfb5cf684aa77331bfa7c043ac506b9418e01` before the latest lint correction.

Results:
- execution contract: PASS;
- typecheck: PASS;
- build: PASS;
- authenticated-route E2E: PASS (2/2);
- authorization runtime: PASS;
- cross-domain runtime: PASS;
- database-integrity suite: PASS;
- patient-journey suite: FAIL;
- lint: FAIL.

The lint failure was directly within F1–F4 scope: `src/features/home/HomeIdentityBanner.tsx` called `setShowWelcome(...)` synchronously inside `useEffect`, triggering the React `set-state-in-effect` rule. This was corrected on the Experience Foundation branch in commit `31bac2e7547fa0cf05b48200ce374b6f9e09251c` by replacing the effect-driven state update with `useSyncExternalStore`, preserving the approved Welcome lifecycle without the lint violation.

The Patient Journey failure is **not being treated as an Experience Foundation implementation defect**. Its failure was in the broader real-world clinic journey test while waiting for the Patient entry/add-patient control on `/patients`; `/patients` is outside F1–F4 and remains quarantined under the scope freeze. It must not be silently marked resolved or used to claim Experience Foundation closure.

Run #280 also emitted the pre-existing/repeated `destination stream closed early` runtime error across multiple routes. That broader runtime investigation remains frozen because it is not established as an F1–F4 defect by this run. The affected route checks still recorded PASS where their explicit route assertions completed.

## Current implementation head

The Experience Foundation branch currently points to `31bac2e7547fa0cf05b48200ce374b6f9e09251c`, which contains the HomeIdentityBanner lint correction. PR #128 remains OPEN/DRAFT and unmerged.

## Validation continuation

The phase is **not closed**. The next required action is a fresh authoritative execution against the exact current head `31bac2e7547fa0cf05b48200ce374b6f9e09251c` so the lint correction is actually evidenced. Testing is explicitly active within F1–F4 despite the unrelated-work freeze.

After the engineering gate is green, continue with the remaining F1–F4 runtime evidence:
- Login;
- Header;
- Home;
- Home → Workspace;
- Desktop/Tablet/Mobile;
- RTL/LTR;
- accessibility/focus/keyboard/touch;
- Home/Agenda authorization and context;
- final visual comparison against Concept 01;
- Product Owner runtime acceptance;
- repository documentation and closure record.

No Vercel deployment is used as validation evidence for this phase.

## System-wide presentation specification recorded

A system-wide presentation specification has now been added:

`docs/CORE-SYSTEM-EXPERIENCE-PRESENTATION-SYSTEM-2026-09-15.md`

This is an extension of the approved Concept 01 visual foundation, not a replacement or a new visual concept. It records how the same Clinical Precision language should be composed differently across the entire CORE SYSTEM according to work purpose and information density.

The specification establishes reusable presentation patterns including:

- Focused Surface;
- Global Control Rail;
- Context + KPI + Destination;
- Personal Launchpad;
- Work Surface;
- Record List + Context;
- Scheduling Workbench;
- Process / Queue;
- Longitudinal Clinical Surface;
- Clinical Workbench;
- Conversation Workspace;
- Compact Interaction Surface;
- Attention Feed;
- Execution Queue;
- Operations Dashboard;
- Financial Work Surface;
- Control Workbench;
- Process + List;
- Case Management;
- Evidence Surface;
- Analytical Surface;
- Executive Overview;
- Control Center;
- Configuration Workspace.

It also records the system-wide rules for compact indicators/KPIs, actionable status presentation, contextual panels, record/table/list transformation, queue presentation, calendar presentation, clinical presentation, financial/resource presentation, Analytics vs Dashboard vs Reports, mobile/tablet transformation, RTL/LTR and accessibility.

The reference systems supplied by the Product Owner are treated as **composition/presentation references only**. Their branding, styling, information architecture or product behavior are not adopted automatically.

The target is explicitly:

> **Reference-grade information presentation inside Concept 01 — Clinical Precision.**

This documentation update does not mean all surfaces have already been visually refactored. It establishes the presentation authority that future surface work must follow while preserving each surface's existing functional contract.

**Current status: EXPERIENCE FOUNDATION NOT CLOSED — active verification continues.**
