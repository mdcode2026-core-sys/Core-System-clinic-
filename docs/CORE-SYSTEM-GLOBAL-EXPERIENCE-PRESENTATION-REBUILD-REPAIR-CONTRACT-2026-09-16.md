# CORE SYSTEM — GLOBAL EXPERIENCE PRESENTATION REBUILD & REPAIR CONTRACT

**Status:** APPROVED — EXECUTION CONTRACT  
**Date:** 2026-09-16

## 1. Purpose

This contract governs the rebuild/repair of the Global Shell, Header, Sidebar, global overlays, responsive presentation, RTL/LTR behavior, touch, safe areas, browser/PWA presentation, and accessibility.

The implementation is not protected. Existing code may be repaired, refactored, split, replaced, or rebuilt where required. The governing standard is the approved experience and the observable result, not preservation of an old implementation.

## 2. Independent presentation environments

Desktop, Tablet, and Mobile are independent presentation environments. Desktop includes browser windows and standalone/PWA. Tablet includes Android/iPadOS/Huawei, browser/PWA, portrait/landscape. Mobile includes Android/iOS/Huawei, browser/PWA, portrait/landscape where applicable.

The environments share the Experience Contract, not a requirement to scale one composition into another.

## 3. RTL / LTR — P0

Arabic uses RTL and English uses LTR. Direction changes must affect direction-aware composition, including ordering, alignment, header grouping, sidebar relationship, button/tool grouping, popovers, panels, logical spacing, icon/text relationships, breadcrumbs, forms, tables where applicable, cards, contextual panels, Chat, Communications, Notifications, Quick Actions, viewport anchoring, and focus/navigation order where direction affects it.

CSS logical properties are preferred: `margin-inline`, `padding-inline`, `inset-inline`, `border-inline`, and `text-align: start/end`.

RTL is not blind mirroring. Charts, media controls, directional symbols, timestamps/numeric representations, and specific clinical/technical visualizations may retain semantic fixed direction.

## 4. Brand

Revalidate logo dimensions, intrinsic ratio, visual size, clickable area, relationship with the Sidebar trigger, alignment, spacing, Desktop/Tablet/Mobile presentation, RTL/LTR, long clinic/user names, and narrow viewports.

## 5. Global Search

Global Search is protected/reference behavior. Preserve its current experience and authority. Do not regress Mobile search. Verify Desktop/Tablet/Mobile and RTL/LTR.

## 6. Communications

Verify trigger, anchor, panel dimensions, max-height, content-driven sizing, unread/request content, viewport collision, clipping, header relationship, RTL/LTR, Desktop/Tablet/Mobile, keyboard, touch, focus restoration, Escape, and scrolling.

No compressed, clipped, off-screen, or directionally inconsistent panel is acceptable.

## 7. Chat

Desktop retains a floating, movable, resizable conversation window. Resize is an independent feature and must not destabilize the rest of the surface.

Mobile is a dedicated Mobile conversation surface, not a shrunken desktop. Tablet is independently composed and is not derived by assumption from Desktop or Mobile.

Chat continues to use the authoritative Communications infrastructure and authority; no parallel messaging engine may be introduced.

## 8. Notifications

Preserve notification data architecture. Verify trigger, unread indicator, panel dimensions/position, content, scrolling, RTL/LTR, Desktop/Tablet/Mobile, focus, Escape, and viewport boundaries. Personal unread/feed behavior must be real and verified.

## 9. Quick Actions

Quick Actions must work on Desktop/Tablet/Mobile and RTL/LTR. Its approved content remains Language and Logout. It is not a business-action launcher.

## 10. Sidebar

My Settings remains in Sidebar. Sidebar must be independently verified for Desktop/Tablet/Mobile, RTL/LTR, open/close, overlay behavior, focus, touch targets, relationship with Header, selected state, scrolling, and safe viewport.

Navigation remains authorization-driven. Patient Flow remains contextual rather than an ordinary standalone sidebar module.

## 11. Header architecture

Header is a Global Control Rail, not one undifferentiated Flex row. Each environment owns its composition. Every global control has ownership, geometry, interaction area, responsive contract, direction contract, and overlay contract.

## 12. Shared overlay architecture

Communications, Chat, Notifications, and Quick Actions must not accumulate arbitrary independent positioning systems. Shared overlay behavior must define portal strategy, stacking, viewport boundary/collision handling, RTL/LTR anchoring, focus restoration, Escape, outside interaction, and mobile behavior while preserving each surface's functional/visual identity.

## 13. Touch, Browser/PWA, Safe Areas

Touch targets, spacing, accidental activation, scroll-vs-drag, drag-vs-resize, overlay interaction, and mobile keyboard behavior are part of Definition of Done.

Each environment must be considered in Browser and standalone/PWA presentation. Mobile/Tablet must account for top/bottom safe areas and device cutouts, especially Header, Sidebar, Chat, bottom interaction surfaces, and overlays.

## 14. Accessibility

Keyboard operation, focus-visible, focus restoration, Escape, semantic roles, accessible names, `aria-expanded`, `aria-controls`, screen-reader order, logical tab order, and touch accessibility are mandatory.

## 15. Protected product decisions

Concept 01 — Clinical Precision, the Adaptive Hybrid Experience Model, and the approved Experience Foundation remain protected. This contract implements those decisions; it does not replace them.

## 16. Definition of Done

Nothing in this contract is deferred as later, optional, minor, cosmetic, or unimportant. Every listed requirement is a closure requirement.

Mandatory contract checklist:

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

## 17. Mandatory execution cycle

Every implementation stage follows:

**VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → CONTRACT CHECK → DOCUMENT → CLOSE**

Contract Check is point-by-point. A stage cannot close while any contract item remains objectively unverified.

## 18. Evidence and promotion

Repository inspection, automated validation, runtime validation, documentation verification, and promotion are separate gates. Production closure is not claimed from repository checks alone. No direct modification of `main` is permitted before validation and review.

The exact reviewed candidate must be promoted only after all applicable gates pass.
