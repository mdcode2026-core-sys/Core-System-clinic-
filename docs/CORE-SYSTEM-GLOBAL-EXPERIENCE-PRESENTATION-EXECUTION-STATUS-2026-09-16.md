# CORE SYSTEM — Global Experience Presentation Rebuild & Repair
## Execution Status — 2026-09-16

**Contract:** `CORE SYSTEM — GLOBAL EXPERIENCE PRESENTATION REBUILD & REPAIR CONTRACT`
**Status:** EXECUTION IN PROGRESS — NOT CLOSED
**Single execution branch:** `fix/global-surfaces-desktop-box-geometry-2026-09-14`
**Pull Request:** #122
**Base:** `main`

## Branch discipline

This contract is executed only on PR #122. No parallel implementation branch is being used. The temporary branch `repair/global-experience-presentation-rebuild-2026-09-16` and PR #129 were closed without merge after reconciliation; their implementation history was retained on this branch.

## Required cycle

`VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → CONTRACT CHECK → DOCUMENT → CLOSE`

No closure is claimed until every contract checklist item has objective evidence.

## Implemented in the current execution path

- Header rebuilt as a direction-aware Global Control Rail with independent identity, Search, and global-control regions.
- Existing Global Search remains protected and mounted through the existing component.
- Header and Sidebar establish explicit RTL/LTR direction-aware composition.
- Sidebar/main relationship uses logical inline-start/padding-start behavior.
- Mobile Sidebar has Escape handling, focus restoration, overlay handling, and safe-area spacing.
- Communications, Notifications, and Quick Actions retain their existing data/authority boundaries while gaining focus restoration, accessible controls, Escape behavior, and safe-area-aware presentation.
- Quick Actions remains limited to Language + Logout.
- Chat now has explicit Desktop / Tablet / Mobile presentation modes.
- Chat Desktop now has pointer-based movement and an independent resize handle with viewport clamping and persisted user geometry.
- Chat Tablet uses an independent centered composition and does not expose Desktop drag/resize interaction.
- Chat Mobile uses a dedicated full-viewport conversation composition with directory/conversation transitions and mobile-safe bottom input spacing.
- A shared `GlobalOverlayPortal` now owns portal mounting, viewport anchoring, boundary clamping, collision-aware top positioning, outside-interaction dismissal, and shared Escape handling for anchored global overlays.
- Concept 01 — Clinical Precision was not changed.
- Adaptive Hybrid Experience Model (Horizon + Vertex + Zenith) was not changed.
- Approved functional ownership, authorization, Communications scope, Agenda authority, Patient Flow / Patient Journey boundaries, and other settled UX decisions were not changed.

## Current automated verification state

The unified CORE SYSTEM Test Execution Engine has been triggered on the latest implementation path. Setup, dependency installation, execution-contract construction/validation, and Playwright installation have previously completed successfully on the active run; final suite/decision status must be read from the terminal workflow result and is not inferred from an in-progress run.

## Open gates — NOT CLOSED

- Verify Chat geometry and RTL/LTR movement/resizing at runtime.
- Verify Chat Tablet and Mobile interaction flows at runtime.
- Verify shared overlay positioning in Desktop, Tablet, and Mobile modes.
- Verify desktop/tablet/mobile browser and standalone/PWA presentation.
- Verify RTL and LTR across all global surfaces.
- Verify Touch behavior, including scroll-vs-drag and drag-vs-resize.
- Verify Keyboard navigation, focus-visible behavior, focus restoration, Escape, and logical tab order.
- Verify safe-area behavior across browser/PWA environments and device orientations.
- Verify Brand dimensions/aspect/clickable area and Sidebar-trigger relationship.
- Verify Global Search regression behavior.
- Complete Build/typecheck/lint/test evidence.
- Complete runtime/deployment verification.
- Complete no-regression verification.
- Complete final contract checklist with objective evidence for every item.

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

**NOT CLOSED.** Implementation commits, successful setup steps, or a non-terminal workflow state are not closure evidence. PR #122 remains the single execution path until every contract item is implemented and objectively verified.
