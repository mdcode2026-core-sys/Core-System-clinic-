# CORE SYSTEM — Header Technical Foundation

**Date:** 2026-09-11  
**Status:** PROPOSED / FOUNDATION IMPLEMENTATION CONTRACT  
**Scope:** Authenticated global Header technical architecture only  
**Parent authority:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`  
**Master execution authority:** `docs/MASTER-EXECUTION-REPAIR-CONTRACT-GLOBAL-SURFACES-2026-09-11.md`

## 1. Purpose

Establish a reusable, domain-neutral technical foundation for the authenticated global Header before visual redesign. The foundation must support a polished, modern enterprise product without coupling the Header to any specialist workflow.

This is not a visual redesign specification. It defines the component boundaries, authority rules, responsive behavior, accessibility baseline, state model, and integration contracts needed so UX/UI work can be implemented safely afterward.

## 2. Design principles selected after comparative review

The foundation adopts the following cross-product principles:

1. **Persistent global shell:** the Header remains available across authenticated surfaces.
2. **Stable location for global functions:** search, communication access, notifications, and global/account actions remain predictably located instead of moving between screens.
3. **Progressive disclosure:** compact controls reveal richer panels only on demand; the Header itself must remain visually calm.
4. **Domain ownership:** specialist work stays in its authoritative Domain/Workspace; the Header routes to work but does not own it.
5. **Permission-aware exposure:** controls and destinations are derived from effective authorization and tenant context.
6. **Keyboard and assistive-technology parity:** every interactive Header capability must have an equivalent keyboard/focus path and correct accessible naming/state.
7. **Responsive adaptation:** mobile reduces density and changes interaction pattern rather than simply shrinking desktop controls.
8. **Performance by default:** stable shell content renders immediately; secondary panels/data may load on demand without blocking the primary page.
9. **Visual restraint:** no marketing-style banners, oversized cards, excessive gradients, or business-action clutter in the global Header.
10. **No parallel engines:** Chat reuses Communications authority/infrastructure; Notifications reuses the existing notification architecture.

## 3. Canonical component architecture

```text
AuthenticatedAppShell
└── GlobalHeader
    ├── HeaderBrand
    ├── HeaderSearch
    ├── HeaderGlobalControls
    │   ├── CommunicationsAccess
    │   ├── ChatAccess
    │   ├── NotificationsAccess
    │   └── QuickActionsAccess
    └── HeaderAccountIdentity (when approved by final UX)
```

The GlobalHeader is a shell component. Child controls are capability adapters, not independent business domains.

## 4. Integration rules

### 4.1 Global Search

Reuse `GlobalSearch` and its existing server/domain implementation. Do not duplicate search state, authorization, or query logic in Header.

HeaderSearch owns only presentation, trigger/open state, focus management, and responsive invocation.

### 4.2 Communications

The Header control must route to the existing Communications domain and permission model. No new conversation store or communication authority may be introduced.

### 4.3 Chat

Chat is a compact interaction surface over Communications. The Header control may open a popover/drawer/panel, but message retrieval/send must use the existing Communications authority/infrastructure.

### 4.4 Notifications

The Header control must use the existing Notifications architecture. Unread state must be personal to the authenticated user and tenant-aware. Header code must not invent a second notification cache/store.

### 4.5 Quick Actions

Initial actions are limited to Language and Logout. The technical foundation must make the action registry extensible but deny arbitrary business actions by default.

## 5. State model

Each interactive Header control should have explicit states where applicable:

- unavailable / hidden by authorization
- available / idle
- hover
- focus-visible
- pressed/open
- loading
- unread / attention
- empty
- error
- disabled (only where a meaningful disabled state exists)

State must not be inferred purely from icon styling.

## 6. Overlay / panel ownership

All Header popovers/drawers must:

- have one owner and one portal/layer strategy;
- close on Escape;
- close when focus is moved outside when appropriate;
- restore focus to the invoking control when dismissed;
- avoid overlapping the mobile navigation drawer incorrectly;
- maintain a deterministic stacking hierarchy.

No control may open a nested panel that conflicts with another Header panel without an explicit interaction rule.

## 7. Responsive foundation

Desktop, tablet, and mobile are separate layout states of the same Header contract.

Desktop may expose a wider search field and separate global controls.

Mobile may collapse Search to an icon/trigger, reduce visible global controls, and use full-width or bottom-anchored interaction surfaces where appropriate. The reduction must preserve access, not silently remove authorized capability.

The mobile navigation trigger belongs to shell/navigation behavior, not to the business-action Quick Actions registry.

## 8. Accessibility baseline

The foundation must target WCAG 2.2 AA-compatible interaction patterns and include:

- semantic header landmark;
- accessible names for icon-only controls;
- visible focus indication;
- logical tab order;
- keyboard open/close behavior;
- Escape handling for popovers;
- correct `aria-expanded` / `aria-controls` / selected state where applicable;
- sufficient target size for touch interaction;
- no information conveyed by color alone;
- screen-reader announcements for dynamically changing unread counts where appropriate;
- skip-to-main-content support at application-shell level.

## 9. Internationalization / RTL

The Header must consume the unified i18n system. No inline language hacks or post-render translation substitutions.

RTL must mirror layout relationships where semantically appropriate while preserving familiar iconography and action meaning.

Long Arabic labels and long clinic/user names must not break the shell.

## 10. Security / authorization boundaries

The Header is not an authorization boundary.

Each child capability must independently enforce its existing permission and tenant rules server-side.

A hidden Header control is only a presentation outcome; the underlying route/action remains protected.

Global Search, Communications, Chat and Notifications must not leak existence, counts, previews, or snippets for unauthorized records.

## 11. Performance foundation

The Header should not block authenticated page rendering on data that is not required to display the shell.

Recommended implementation behavior:

- render stable shell immediately;
- lazy-load heavy interaction panels;
- fetch unread counts using lightweight requests;
- avoid polling by default when an existing realtime/subscription mechanism is available and appropriate;
- avoid duplicate fetches between Header and destination Domain;
- debounce active search input using the existing search implementation rules.

## 12. Observability / testability

Expose deterministic test selectors or semantic roles for:

- Header root
- brand/home control
- search trigger/input
- Communications control
- Chat control
- Notifications control
- Quick Actions control
- mobile navigation trigger
- every opened panel/drawer

Tests must validate behavior and authorization, not only DOM presence.

## 13. Required foundation implementation sequence

1. Extract a dedicated `GlobalHeader` shell from the current `WorkspaceShell` top bar without changing business behavior.
2. Mount existing `GlobalSearch` through a dedicated `HeaderSearch` adapter.
3. Add capability slots/interfaces for Communications, Chat, Notifications, and Quick Actions without inventing parallel domain logic.
4. Add common overlay/focus/keyboard primitives for Header panels.
5. Add responsive breakpoints/variants and semantic landmarks.
6. Add i18n/RTL-safe labels and accessible names.
7. Add targeted tests for persistence across authenticated routes, authorization, keyboard behavior, responsive layout, and tenant/user isolation.
8. Only after foundation validation proceed to final UX/UI visual specification and styling.

## 14. Non-goals for this foundation stage

- No redesign of Home.
- No redesign of Sidebar.
- No redesign of Role Workspaces.
- No creation of a new Communications or Chat backend.
- No new notification store.
- No universal business-action launcher.
- No migration of My Settings out of Sidebar.

## 15. Acceptance criteria

The foundation is accepted only when:

- one authenticated GlobalHeader is used consistently across authenticated surfaces;
- Global Search remains functional and permission-constrained;
- Communications and Chat are distinct controls backed by the existing authority;
- Notifications has a verified personal unread source;
- Quick Actions expose only approved global actions;
- keyboard, focus, Escape, responsive, AR/EN, RTL/LTR behavior is verified;
- Header does not change Role Workspace, permissions, or domain ownership;
- existing shell behavior remains regression-safe;
- no duplicate engine/store/permission model is introduced.

## 16. External comparative basis

The foundation was informed by current enterprise patterns from ServiceNow Unified Navigation / Employee Center, Salesforce Lightning Experience, Microsoft Power Apps / Dynamics patterns, Carbon Design System UI shell, MUI responsive application shell guidance, GOV.UK navigation/accessibility patterns, and current ONC/SAFER guidance emphasizing usability, safety, consistent interaction, contextual information, and testing across roles and devices.

These sources are used as design evidence only; CORE SYSTEM must not copy their visual identity or information architecture.

**End of Header Technical Foundation.**
