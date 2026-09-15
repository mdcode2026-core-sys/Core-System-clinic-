# CORE SYSTEM — Global Experience Presentation Rebuild & Repair
## Execution Status — 2026-09-16

**Contract:** `CORE SYSTEM — GLOBAL EXPERIENCE PRESENTATION REBUILD & REPAIR CONTRACT`
**Status:** EXECUTION IN PROGRESS — NOT CLOSED
**Single execution branch:** `fix/global-surfaces-desktop-box-geometry-2026-09-14`
**Pull Request:** #122
**Stacked base:** `feat/visual-design-constitution-f1-f4-2026-09-15` (PR #128)
**Current reviewed head:** `8a07800cff7af61ada887e7b1600082443c4a7ee`

## Branch discipline

This contract is executed only on PR #122. No parallel implementation branch is being used. The temporary branch `repair/global-experience-presentation-rebuild-2026-09-16` and PR #129 were closed without merge after reconciliation; its implementation history was retained on this branch.

PR #122 is intentionally stacked on PR #128 so the repair diff is the delta above the approved F1–F4 Experience Foundation rather than a second implementation of the same foundation.

## Stage execution scope

The Global Experience Presentation phase covers the global shell, Header, Sidebar, global overlays, Communications/Notifications/Quick Actions presentation, Chat presentation, responsive compositions, RTL/LTR, touch, keyboard/focus/Escape, safe areas, accessibility, and no-regression verification required by the approved contract.

**Patient Journey E2E is outside this phase.** Patient Journey implementation and its related failures remain frozen for its later execution stream and must not block this phase.

The authenticated-route E2E currently targets a protected financial-installments route and is likewise outside this presentation phase. Unrelated authentication/runtime remediation remains frozen; the in-scope `authorization-runtime` gate remains required.

This scope is encoded in `docs/testing/workstream-contracts/global-experience-presentation.execution.json`. The Unified Test Execution Engine now records excluded suites explicitly rather than silently treating them as passes.

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

## Automated verification evidence

The latest completed Unified Test Execution Engine run previously available was **Run #296**. It executed against head `d3ce47476ed44362bfa5f31bd49d06408bf692e8`, before the stage-scope test-engine changes.

Run #296:
- `typecheck` — PASS
- `lint` — PASS
- `build` — PASS
- i18n parity — PASS
- `authorization-runtime` — PASS
- `cross-domain-runtime` — PASS
- `database-integrity` — PASS
- `authenticated-route-e2e` — FAIL (out-of-scope financial-installments route)
- `real-world-clinic-journey-e2e` — FAIL (out-of-scope Patient Journey appointment booking)

No Unified Test Execution Engine run has been generated for current head `8a07800cff7af61ada887e7b1600082443c4a7ee` in the connected GitHub environment. The repository-API commit path used here does not create a pull-request workflow run through the available connector, so no current-head automated PASS/FAIL is claimed.

The stage-scope contract is now explicitly represented in `docs/testing/workstream-contracts/global-experience-presentation.execution.json`: `patient-journey` and `authenticated-e2e` are excluded from this phase, while `authorization-runtime` remains required.

## Deployment verification state

Vercel preview deployment for current head `8a07800cff7af61ada887e7b1600082443c4a7ee`:
- Deployment: `dpl_6wMASjX9PEGK2KxTmd8Xghu3n7xE`
- State: `READY`
- Build: completed successfully
- i18n catalog parity: PASS
- TypeScript compilation: completed
- Static generation: 55/55 pages completed
- Deployment output completed successfully
- Vercel preview runtime error query for the inspected hour returned no `error`/`fatal` logs.

This is deployment/build evidence only. Interactive browser/device/PWA verification was not completed because the connected environment could not obtain an interactive browser session for the protected preview deployment; therefore those contract gates remain open.

## Open gates — NOT CLOSED

- Exact-current-head Unified Test Execution Engine evidence.
- Runtime verification of Chat movement/resize and responsive compositions.
- Runtime verification of shared overlay boundaries and RTL/LTR behavior.
- Desktop/tablet/mobile browser verification.
- Standalone/PWA verification.
- Touch verification, especially scroll-vs-drag and drag-vs-resize.
- Keyboard navigation, focus-visible behavior, focus restoration, Escape, and logical tab order verification.
- Safe-area behavior across browser/PWA environments and device orientations.
- Brand dimensions/aspect/clickable area and Sidebar-trigger relationship verification.
- Global Search regression verification.
- No-regression verification.
- Final contract checklist with objective evidence for every item.

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

**NOT CLOSED.** The phase-scoped exclusions are explicit and do not count as passes. PR #122 remains the single execution path until every applicable contract item has objective verification evidence.
