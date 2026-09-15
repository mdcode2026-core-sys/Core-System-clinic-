# CORE SYSTEM — Global Experience Presentation Rebuild & Repair
## Execution Status — 2026-09-16

**Contract:** `CORE SYSTEM — GLOBAL EXPERIENCE PRESENTATION REBUILD & REPAIR CONTRACT`
**Status:** EXECUTION IN PROGRESS — NOT CLOSED
**Prerequisite implementation branch:** `feat/visual-design-constitution-f1-f4-2026-09-15` (PR #128)
**Single repair execution branch:** `fix/global-surfaces-desktop-box-geometry-2026-09-14` (PR #122)
**Repair PR base:** `feat/visual-design-constitution-f1-f4-2026-09-15`

## Branch discipline

PR #122 is intentionally stacked on the prerequisite F1–F4 implementation in PR #128. This removes the previous file-level duplication between the two workstreams: #122 contains the repair delta only, while #128 remains the prerequisite implementation layer. No new parallel implementation branch is being used for this contract.

The temporary branch `repair/global-experience-presentation-rebuild-2026-09-16` and PR #129 were closed without merge after reconciliation; their implementation history was retained on the #122 branch.

## Required cycle

`VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → CONTRACT CHECK → DOCUMENT → CLOSE`

No closure is claimed until every contract checklist item has objective evidence.

## Implemented in the current repair delta

- Header rebuilt as a direction-aware Global Control Rail with independent identity, Search, and global-control regions.
- Existing Global Search remains protected and mounted through the existing component.
- Header and Sidebar establish explicit RTL/LTR direction-aware composition.
- Sidebar/main relationship uses logical inline-start/padding-start behavior.
- Mobile Sidebar has Escape handling, focus restoration, overlay handling, and safe-area spacing.
- Communications, Notifications, and Quick Actions retain their existing data/authority boundaries while gaining focus restoration, accessible controls, Escape behavior, and shared anchored overlay infrastructure.
- Quick Actions remains limited to Language + Logout.
- Chat now has explicit Desktop / Tablet / Mobile presentation modes.
- Chat Desktop has pointer-based movement and an independent resize handle with viewport clamping and user-specific persistence.
- Chat Tablet uses an independent centered composition and does not expose Desktop drag/resize interaction.
- Chat Mobile uses a dedicated full-viewport conversation composition with explicit directory/conversation transition and mobile-safe bottom input spacing.
- `GlobalOverlayPortal` owns portal mounting, anchored positioning, viewport boundary clamping, collision-aware top positioning, outside-interaction dismissal, and shared Escape handling for anchored global overlays.
- Chat geometry is stored as a logical inline-start offset so LTR/RTL placement and movement remain direction-aware.
- Concept 01 — Clinical Precision was not changed.
- Adaptive Hybrid Experience Model (Horizon + Vertex + Zenith) was not changed.
- Approved functional ownership, authorization, Communications scope, Agenda authority, Patient Flow / Patient Journey boundaries, and other settled UX decisions were not changed.

## Current automated verification state

The unified CORE SYSTEM Test Execution Engine has been triggered against the active PR candidate. The latest visible run is still **in progress**; setup, dependency installation, contract construction/validation, and Playwright installation have completed successfully. Final suite results and execution decision remain unverified until the run reaches a terminal state for the current reviewed head.

## Open gates — NOT CLOSED

- Runtime verification of Chat geometry, movement, resize, and RTL/LTR behavior.
- Runtime verification of Chat Tablet and Mobile interaction flows.
- Runtime verification of shared overlay boundaries, anchoring, and collision behavior.
- Desktop/tablet/mobile browser and standalone/PWA verification.
- Full RTL and LTR verification across all global surfaces.
- Touch verification, including scroll-vs-drag and drag-vs-resize.
- Full accessibility verification including logical tab order and screen-reader behavior.
- Safe-area verification across browser/PWA environments and orientations.
- Brand dimensions/aspect/clickable-area verification.
- Global Search regression verification.
- Build/typecheck/lint/test terminal evidence for the exact reviewed head.
- Runtime/deployment verification.
- No-regression verification.
- Final contract checklist and closure documentation.

## Contract checklist

- [ ] Brand
- [ ] Search
- [ ] Communications
- [ ] Chat Desktop
- [ ] Chat Tablet
- [ ] Chat Mobile
- [ ] Notifications
- [ ] Quick Actions
- [ ] Sidebar
- [ ] My Settings
- [ ] Desktop composition
- [ ] Tablet composition
- [ ] Mobile composition
- [ ] RTL
- [ ] LTR
- [ ] Browser
- [ ] PWA
- [ ] Touch
- [ ] Keyboard
- [ ] Focus
- [ ] Escape
- [ ] Overlay boundaries
- [ ] Safe areas
- [ ] Accessibility
- [ ] No regression
- [ ] Concept 01 preserved
- [ ] Existing UX decisions preserved

## Closure

**NOT CLOSED.** Implementation commits, successful setup steps, or an in-progress workflow are not closure evidence. PR #122 remains the single repair execution path, stacked on the prerequisite PR #128, until every contract item is implemented and objectively verified.
