# CORE SYSTEM — Global Experience Presentation Rebuild & Repair
## Execution Status — 2026-09-16

**Contract:** `CORE SYSTEM — GLOBAL EXPERIENCE PRESENTATION REBUILD & REPAIR CONTRACT`
**Status:** EXECUTION IN PROGRESS — NOT CLOSED
**Single execution branch:** `fix/global-surfaces-desktop-box-geometry-2026-09-14`
**Pull Request:** #122
**Stacked base:** `feat/visual-design-constitution-f1-f4-2026-09-15` (PR #128)

## Branch discipline

This contract is executed only on PR #122. No parallel implementation branch is being used. The temporary branch `repair/global-experience-presentation-rebuild-2026-09-16` and PR #129 were closed without merge after reconciliation; its implementation history was retained on this branch.

PR #122 is intentionally stacked on PR #128 so the repair diff is the delta above the approved F1–F4 Experience Foundation rather than a second implementation of the same foundation.

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

## Exact automated verification evidence

The latest completed Unified Test Execution Engine run was **Run #296**. It executed against the then-current PR merge candidate based on head `d3ce47476ed44362bfa5f31bd49d06408bf692e8`, not the later documentation-only head.

Engineering gates on that run:
- `typecheck` — PASS
- `lint` — PASS
- `build` — PASS
- i18n catalog parity — PASS

Runtime/domain suites:
- `authorization-runtime` — PASS
- `cross-domain-runtime` — PASS
- `database-integrity` — PASS
- `authenticated-route-e2e` — FAIL
- `real-world-clinic-journey-e2e` — FAIL

The authenticated-route failure was an existing authentication/runtime gate: the E2E authentication request returned HTTP 200 and cookies were issued, but a protected financial-installments route redirected to `/login`.

The patient-journey failure occurred during appointment booking: the POST to `/api/agenda/events` produced no response at the attempted slot and the E2E runner stopped instead of accepting it as a retryable conflict.

Therefore Run #296 concluded **FAIL: 6 passed / 2 failed**. These failures are objective verification blockers and are not being reclassified as successful merely because the engineering gates passed.

A new verification run for the exact current head is still required. No current-head test result is claimed until such a run completes.

## Open gates — NOT CLOSED

- Fix/reconcile the failed authenticated-route E2E gate and verify the protected route remains authorized.
- Fix/reconcile the appointment-booking E2E failure and rerun Patient Journey.
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
- Complete current-head Build/typecheck/lint/test evidence.
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

**NOT CLOSED.** Successful engineering gates, partial runtime passes, implementation commits, or a non-terminal workflow state are not closure evidence. PR #122 remains the single execution path until every contract item is implemented and objectively verified.
