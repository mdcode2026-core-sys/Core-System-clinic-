# CORE SYSTEM — Experience Foundation F1–F4 Execution Ledger
## 2026-09-15

This file records the current Experience Foundation execution cycle separately from the historical root execution ledger. Each work item is recorded only after its implementation was inspected again from the repository branch.

## Governing scope

- Experience Foundation: F1 Login, F2 Header, F3 Home, F4 Home → Workspace.
- Experience model: Horizon + Vertex + Zenith.
- Visual language: Concept 01 — Clinical Precision.
- Canonical workflow: VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE.
- Product meaning, authorization, data ownership, workflow ownership, Communications scope, Agenda authority, and Home surface boundaries are preserved.

## F1 — Login

### Implementation
- Reworked the auth presentation into a calm light Clinical Precision surface.
- Kept authentication architecture and existing redirect behavior.
- Kept language selection, forgot-password, register, password visibility, error, and loading behavior.
- Reused the authoritative ClinicSaaS brand asset.
- Added native email/password autocomplete and accessible association of authentication errors.
- Preserved browser-native required/type validation.

### Verification after implementation
- Re-read `src/app/(auth)/layout.tsx` and `src/app/(auth)/login/page.tsx` from the feature branch.
- Confirmed no authenticated Header/Sidebar is imported into the auth surface.
- Confirmed password visibility remains an explicit button with localized accessible labels.
- Confirmed Login uses only approved Clinical Precision tokens and no medical-cliché imagery.

### Runtime evidence
- Automated Playwright/runtime verification is being executed by unified workflow run #243 against the implementation commit `344a2ebe453a8218e34c56b675bde19fc4a60070`.

## F2 — Header

### Implementation
- Rebuilt the global Header composition rather than only changing colors.
- Preserved Brand/Home, Global Search, Communications, Chat, Notifications, and Quick Actions as independent capabilities.
- Removed the enclosing mega-pill treatment.
- Desktop/tablet use a compact single-row shell.
- Mobile intentionally transforms to two rows: identity/search row followed by a horizontally scrollable utility row, so capabilities are not squeezed or hidden.
- Added shared interaction/focus treatment.
- Added Escape handling and focus restoration in Communications, Notifications, and Quick Actions.
- Preserved existing Search/Communications/Chat/Notifications engines; no duplicate messaging or notification engine introduced.
- Quick Actions remain Language + Logout.
- Chat remains a compact surface over Communications.

### Verification after implementation
- Re-read `src/features/workspace/GlobalHeader.tsx` and the current header control implementations.
- Confirmed `aria-controls="global-sidebar"` resolves to the actual Sidebar ID.
- Confirmed mobile controls are deliberately moved to a second row rather than allowed to overflow the page.
- Confirmed hidden scrollbar affects presentation only; controls remain horizontally accessible.
- Confirmed Chat and Notifications use the approved semantic tokens for interactive/failure states.

### Runtime evidence
- Unified workflow run #243 executes Playwright/runtime suites for the exact implementation revision.

## F3 — Home

### Implementation
Home composition is:

`Identity / Context → Today → Attention when actionable → Next Destinations`

Identity Banner contains:
- clinic identity;
- clinic logo when available, otherwise authoritative ClinicSaaS brand asset;
- user identity;
- approved Welcome-on-entry behavior;
- lightweight Weather/ambient context tied to clinic location;
- Workspace entry.

Today contains:
- context-preserving user's appointments;
- waiting patients;
- active clinical work;
- completed today;
- one coherent list/surface rather than a scattered four-card dashboard.

Attention is conditional and only rendered when there is an actionable waiting condition.

Next Destinations contain direct Workspace and Agenda paths.

Explicit Home exclusions remain absent:
- Notifications;
- Communications;
- Work Center;
- Quick Actions;
- Patient Portal information;
- widgets/personalized widgets.

### Weather implementation
- Added `src/features/home/HomeWeather.tsx` as a server-rendered lightweight weather context.
- Uses clinic address/country information, geocodes the best available clinic locality, retrieves current weather, applies bounded request timeouts/revalidation, localizes condition text for Arabic/English, and gracefully renders an unavailable state.

### Verification after implementation
- Re-read `src/app/(dashboard)/page.tsx`, `src/features/home/HomeIdentityBanner.tsx`, and `src/features/home/HomeWeather.tsx`.
- Confirmed Home no longer contains the approved-removed surfaces.
- Confirmed `no_show` is not silently excluded; only `cancelled` is excluded from today's appointment count.
- Confirmed Today's appointments use `clinic_users.id → master_agenda_events.doctor_id` and preserve `doctorId` when entering Agenda.
- Confirmed Weather is rendered through Identity Banner rather than being omitted or moved into Header.
- Confirmed Weather location candidate resolution does not blindly prioritize the country segment over the clinic locality.
- Confirmed Attention is conditional rather than a duplicate Notifications feed.

### Runtime evidence
- Unified workflow run #243 includes the applicable runtime suites against the implementation revision.

## F4 — Home → Workspace

### Implementation
- Added `src/features/home/HomeWorkspaceTransitionLink.tsx` for explicit awareness-to-work transition feedback.
- Existing `/workspace` route remains authoritative.
- Existing permission resolution remains authoritative.
- Workspace shell records navigation away from Home for the approved Welcome lifecycle and exposes a subtle `cs-work-mode` visual distinction inside Workspace.

### Verification after implementation
- Re-read Home, `HomeWorkspaceTransitionLink.tsx`, and `WorkspaceShell.tsx`.
- Confirmed the transition does not create a new workspace layer or alter authorization.
- Confirmed existing Workspace navigation registry remains the destination authority.
- Confirmed mobile sidebar control is now correctly associated with `global-sidebar`.

### Runtime evidence
- Unified workflow run #243 includes the transition-related application/runtime suites.

## Cross-F1–F4 verification

- Home removals are implemented as explicit exclusions, not merely hidden styling.
- Search, Communications, Chat, Notifications, and Quick Actions remain global Header capabilities.
- Communications remains clinic-wide for authorized accounts and is not doctor-only.
- Chat remains a compact Communications surface.
- Agenda remains the authoritative scheduling domain.
- No DB migration was introduced for this experience cycle.
- No permission model rewrite was introduced.
- No duplicate domain engine was introduced.
- No Work Center redesign was introduced.
- No Patient Flow / Patient Journey boundary was changed.
- Clinical Precision tokens are used as shared visual language rather than separate themes per Horizon/Vertex/Zenith.

## Automated verification

Validation-only PR: #126  
Validation branch: `verify/experience-foundation-f1-f4-2026-09-15`  
Workflow: `CORE SYSTEM Unified Test Execution Engine`  
Run: #243 / `34903128292`  
Implementation revision tested: `344a2ebe453a8218e34c56b675bde19fc4a60070`

Observed completed steps before the final suite result:
- checkout exact candidate — PASS;
- Node setup — PASS;
- dependency install — PASS;
- SETUP execution contract — PASS;
- contract completeness validation — PASS;
- Playwright runtime install — PASS;
- selected test execution — IN PROGRESS at the time of this ledger update.

The tested implementation revision is the code-equivalent revision of the current feature head; later feature commits are documentation reconciliation only.

## Final acceptance gate

Do not treat source inspection alone as runtime closure. The remaining evidence required by the Execution Gate is the terminal automated/runtime result plus desktop/tablet/mobile, RTL/LTR, accessibility/focus/keyboard/touch validation and Product Owner runtime acceptance.
