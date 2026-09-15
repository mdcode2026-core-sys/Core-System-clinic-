# CORE SYSTEM — Global Experience Presentation Rebuild & Repair
## Execution Status — 2026-09-16

**Contract:** `CORE SYSTEM — GLOBAL EXPERIENCE PRESENTATION REBUILD & REPAIR CONTRACT`
**Status:** EXECUTION IN PROGRESS — NOT CLOSED
**Branch:** `repair/global-experience-presentation-rebuild-2026-09-16`
**Pull Request:** #129

## Execution rule

This record is evidence of implementation state only. It does not replace the approved repair contract.

Required cycle:

`VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → CONTRACT CHECK → DOCUMENT → CLOSE`

No closure is claimed until every contract checklist item has objective evidence.

## Implemented in the current pass

- Header rebuilt as a direction-aware Global Control Rail with independent identity, Search, and global-control regions.
- Existing Global Search remains protected and mounted through the existing component.
- Header and Sidebar now establish explicit RTL/LTR direction-aware composition.
- Sidebar/main relationship uses logical inline-start/padding-start behavior rather than hard-coded left/right offsets.
- Mobile Sidebar gained Escape handling and focus restoration.
- Header/Sidebar safe-area spacing was added for mobile/PWA presentation.
- Communications gained trigger focus restoration, Escape handling, explicit `aria-controls`, and safe-area-aware mobile positioning.
- Notifications gained trigger focus restoration, Escape handling, explicit `aria-controls`, safe-area-aware mobile positioning, and overscroll containment.
- Quick Actions gained trigger focus restoration, Escape handling, explicit `aria-controls`, and safe-area-aware mobile positioning.
- Quick Actions remains limited to Language + Logout.
- Communications remains the clinic-wide communications authority; no parallel messaging engine was introduced.
- Concept 01 was not changed.

## Open gates

The PR remains open because the following still require objective verification or further implementation:

- Desktop browser and standalone/PWA verification.
- Tablet browser/PWA portrait and landscape verification.
- Mobile Android/iPhone/Huawei browser/PWA verification.
- Full RTL/LTR visual verification across all global surfaces.
- Chat desktop movable + independently working resize behavior.
- Chat tablet and mobile composition verification.
- Shared overlay positioning/portal/collision ownership verification.
- Touch verification, including scroll-vs-drag and drag-vs-resize.
- Full accessibility verification, including screen-reader and logical tab order.
- Build/typecheck/lint/test evidence.
- Runtime/deployment verification.
- No-regression verification.

## Closure

**NOT CLOSED.** Implementation commits are not closure evidence. The contract checklist must remain open until all required items are verified.
