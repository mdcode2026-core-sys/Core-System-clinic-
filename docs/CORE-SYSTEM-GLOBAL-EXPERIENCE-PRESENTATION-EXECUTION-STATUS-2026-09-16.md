# CORE SYSTEM — Global Experience Presentation Rebuild & Repair
## Execution Status — 2026-09-16

**Contract:** `CORE SYSTEM — GLOBAL EXPERIENCE PRESENTATION REBUILD & REPAIR CONTRACT`
**Status:** EXECUTION IN PROGRESS — NOT CLOSED
**Single execution branch:** `fix/global-surfaces-desktop-box-geometry-2026-09-14`
**Pull Request:** #122
**Stacked base:** `feat/visual-design-constitution-f1-f4-2026-09-15` (PR #128)
**Current reviewed head:** `1f3ee3b47608d971badd47e90f9c08c70eeb44a2`

## Branch discipline

This contract is executed only on PR #122. No parallel implementation branch is being used. The temporary branch `repair/global-experience-presentation-rebuild-2026-09-16` and PR #129 were closed without merge after reconciliation; its implementation history was retained on this branch.

PR #122 is intentionally stacked on PR #128 so the repair diff is the delta above the approved F1–F4 Experience Foundation rather than a second implementation of the same foundation.

## Stage execution scope

The Global Experience Presentation phase covers the global shell, Header, Sidebar, global overlays, Communications/Notifications/Quick Actions presentation, Chat presentation, responsive compositions, RTL/LTR, touch, keyboard/focus/Escape, safe areas, accessibility, and no-regression verification required by the approved contract.

**Patient Journey E2E is outside this phase.** Patient Journey implementation and its related failures remain frozen for its later execution stream and must not block this phase.

The authenticated-route E2E currently points at a protected financial-installments route and is likewise outside this presentation phase. Unrelated authentication/runtime remediation remains frozen; the in-scope `authorization-runtime` gate remains required.

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

## Exact automated verification evidence

The latest completed Unified Test Execution Engine run previously available was **Run #296**. It executed against head `d3ce47476ed44362bfa5f31bd49d06408bf692e8`, before the later scope/test-engine changes.

Engineering gates on Run #296:
- `typecheck` — PASS
- `lint` — PASS
- `build` — PASS
- i18n catalog parity — PASS

Runtime/domain suites on Run #296:
- `authorization-runtime` — PASS
- `cross-domain-runtime` — PASS
- `database-integrity` — PASS
- `authenticated-route-e2e` — FAIL
- `real-world-clinic-journey-e2e` — FAIL

The authenticated-route failure was the unrelated financial-installments authorization flow described above.

The Patient Journey failure occurred during appointment booking. That suite is now explicitly excluded from this phase by contract scope, so it is not an in-scope closure gate.

There is currently **no Unified Test Execution Engine run for reviewed head `1f3ee3b47608d971badd47e90f9c08c70eeb44a2`**. The GitHub connector has not produced a pull-request workflow run for the commits written through the connected repository API, so no current-head automated test result is claimed.

## Deployment verification state

Vercel created a preview deployment for the updated PR branch after the scope changes. The latest observed deployment is for head `1f3ee3b47608d971badd47e90f9c08c70eeb44a2`; its deployment was still queued at the latest status check. A previous deployment for head `818fc8a7c998129f8afadc31d353b25bea79bb87` reached `READY` and completed a production build successfully, including TypeScript compilation and static generation. This is build evidence only, not runtime closure evidence.

## Open gates — NOT CLOSED

- Obtain exact-current-head unified test evidence after the scope exclusion is applied.
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

**NOT CLOSED.** Excluded suites are explicitly out of scope; they are not recorded as passes and do not alter the in-scope contract. PR #122 remains the single execution path until every applicable contract item is implemented and objectively verified.
