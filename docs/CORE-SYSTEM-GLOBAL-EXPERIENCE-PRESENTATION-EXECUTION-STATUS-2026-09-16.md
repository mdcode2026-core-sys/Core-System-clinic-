# CORE SYSTEM — Global Experience Presentation Rebuild & Repair
## Execution Status — 2026-09-16

**Contract:** `CORE SYSTEM — GLOBAL EXPERIENCE PRESENTATION REBUILD & REPAIR CONTRACT`
**Status:** EXECUTION IN PROGRESS — NOT CLOSED
**Single execution branch:** `fix/global-surfaces-desktop-box-geometry-2026-09-14`
**Pull Request:** #122
**Stacked base:** `feat/visual-design-constitution-f1-f4-2026-09-15` (PR #128)
**Current reviewed head:** `e51bca46c41c8365a8f9d43002bdaccdc4f0d8e0`

## Branch discipline

This contract is executed only on PR #122. No parallel implementation branch is being used. The temporary branch `repair/global-experience-presentation-rebuild-2026-09-16` and PR #129 were closed without merge after reconciliation; its implementation history was retained on this branch.

PR #122 is intentionally stacked on PR #128 so the repair diff is the delta above the approved F1–F4 Experience Foundation rather than a second implementation of the same foundation.

## Stage execution scope

The Global Experience Presentation phase covers the global shell, Header, Sidebar, global overlays, Communications/Notifications/Quick Actions presentation, Chat presentation, responsive compositions, RTL/LTR, touch, keyboard/focus/Escape, safe areas, accessibility, and no-regression verification required by the approved contract.

**Patient Journey E2E is outside this phase.** Patient Journey implementation and its related failures remain frozen for its later execution stream and must not block this phase.

The phase scope is applied in the GitHub Actions **job setup** after the normal Unified Test Execution Engine plan is generated: `patient-journey` is removed from the selected suites for this phase only. This does not modify the engine's suite-discovery or execution logic.

## Unified Test Execution Engine integrity

The Unified Test Execution Engine itself has been restored to its pre-scope-change behavior:
- `tools/test-execution-setup.mjs` restored to the behavior present at `d3ce47476ed44362bfa5f31bd49d06408bf692e8`.
- `tools/test-execution-runner.mjs` restored to the behavior present at `d3ce47476ed44362bfa5f31bd49d06408bf692e8`.
- Unauthorized `docs/testing/workstream-contracts/global-experience-presentation.execution.json` was removed.
- No engine-level excluded-suite handling is used.
- No test is converted from FAIL to PASS by the phase setup. Out-of-scope Patient Journey is simply not selected for this phase's execution job.
- `authenticated-e2e` has **not** been excluded by this correction and remains subject to the normal engine selection logic.

The workflow job setup is therefore the only phase-specific test selection layer added for this workstream.

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

The latest completed Unified Test Execution Engine run previously available was **Run #296**. It executed against head `d3ce47476ed44362bfa5f31bd49d06408bf692e8`, before the unauthorized phase-scope modifications were introduced.

Run #296:
- `typecheck` — PASS
- `lint` — PASS
- `build` — PASS
- i18n parity — PASS
- `authorization-runtime` — PASS
- `cross-domain-runtime` — PASS
- `database-integrity` — PASS
- `authenticated-route-e2e` — FAIL
- `real-world-clinic-journey-e2e` — FAIL; this is the frozen/out-of-scope Patient Journey stream and is not being remediated here.

The current corrected head is `e51bca46c41c8365a8f9d43002bdaccdc4f0d8e0`.

A direct compare against the pre-scope-change head confirms the current delta contains the approved workflow job-scope adjustment and execution-status documentation changes; the Unified Test Execution Engine setup/runner files themselves are restored to their prior versions.

No current-head Unified Test Execution Engine workflow run has been generated in the connected GitHub environment yet. Therefore no current-head automated PASS/FAIL is claimed.

## Deployment verification state

Current Vercel preview deployment for the reviewed head `e51bca46c41c8365a8f9d43002bdaccdc4f0d8e0`:
- Deployment: `dpl_C5fxEQTHymnZG7pvVb3G9jsWBawQ`
- State: READY
- TypeScript compilation completed successfully.
- Static generation completed successfully: 55/55 pages.
- Deployment output completed successfully.
- Current preview runtime query returned no `error`/`fatal` logs for this deployment during the inspected 24-hour window.

This is build/deployment evidence only. Interactive browser/device/PWA verification is still required for closure.

## Open gates — NOT CLOSED

- Exact-current-head Unified Test Execution Engine evidence with Patient Journey excluded only by approved phase job setup.
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

**NOT CLOSED.** Patient Journey is frozen and excluded only at the phase job setup; it is not treated as a pass and the Unified Test Execution Engine remains unchanged. PR #122 remains the single execution path until every applicable contract item has objective verification evidence.
