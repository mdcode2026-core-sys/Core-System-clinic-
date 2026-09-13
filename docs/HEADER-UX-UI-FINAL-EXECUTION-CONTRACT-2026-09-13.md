# CORE SYSTEM — Header UX/UI Final Execution Contract
## Global Header — Final Product Experience
### 2026-09-13

**Status:** APPROVED EXECUTION CONTRACT — IMPLEMENTATION BRANCH BASELINE  
**Scope:** Final UX/UI behavior, visual hierarchy, interaction model, responsive behavior, accessibility, and integration acceptance for the authenticated Global Header.  
**Implementation branch:** `feature/header-ux-ui-final-execution-contract-2026-09-13`  
**Parent authority:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`  
**Technical foundation:** `docs/HEADER-TECHNICAL-FOUNDATION-2026-09-11.md`  
**Master execution authority:** `docs/MASTER-EXECUTION-REPAIR-CONTRACT-GLOBAL-SURFACES-2026-09-11.md`

> This contract converts the already-approved Header technical foundation and Global Surfaces reconciliation into the final user-facing Header experience. It is not an architecture rebuild. It is the UX/UI execution layer over the existing shell, domain authorities, permissions, and data engines.

---

## 1. Objective

Deliver a Global Header that is:

- immediately understandable;
- modern and professional;
- appropriate for a medical/business SaaS product;
- visually calm without looking empty or cheap;
- simple enough for daily clinic use;
- consistent across desktop, tablet, and mobile;
- fully usable in Arabic/RTL and English/LTR;
- accessible by keyboard and assistive technology;
- connected to the existing authoritative domain systems without creating parallel engines.

The Header must provide fast access to genuinely global functions while keeping actual clinical, operational, administrative, communication, and notification work in their authoritative destinations.

---

## 2. Canonical Header contract

The final conceptual order is:

```text
[Brand / Home]
        |
[Global Search]
        |
[Communications] [Chat] [Notifications] [Quick Actions]
```

The authenticated shell may additionally retain the existing mobile navigation trigger required by the application shell. That trigger is navigation infrastructure, not a Quick Action.

The Header must remain persistent across authenticated surfaces.

The Header must not become:

- a second Home;
- a Role Workspace;
- My Workspace;
- a Module directory;
- a universal business-action launcher;
- a second Communications engine;
- a second notification engine;
- an authorization boundary.

---

## 3. Comparative best-practice basis and adopted decisions

The final UX decisions are informed by established patterns rather than invented in isolation.

| Reference pattern | Observed best practice | CORE SYSTEM decision |
|---|---|---|
| ServiceNow enterprise navigation | Persistent global shell; stable placement of search, notifications, identity/account controls; restrained primary navigation; logo/home as a stable escape point | Adopt persistent Header, stable control order, clickable brand/Home, and limited global functions |
| Oracle SaaS / Oracle Health patterns | Notifications are tied to meaningful workflow/context rather than being isolated informational decoration; notification lists remain useful until acted on/read according to product behavior | Adopt notification items as actionable entries that route to the associated work destination |
| Microsoft Teams | Unread activity is represented by a numeric count/badge; reading clears unread state; Mark all as read is available; read items are not implicitly deleted | Adopt personal unread count, immediate count decrement after reading, persistent read history in the visible feed, and Mark all as read |
| Enterprise application shell/accessibility patterns | Progressive disclosure: compact global controls reveal richer panels only when needed; keyboard/focus parity and responsive adaptation are required | Adopt compact Header controls with owned panels/popovers and full keyboard/responsive support |

These references are design evidence only. CORE SYSTEM does not copy their branding, visual identity, or information architecture.

### 3.1 What is explicitly adopted

1. **Persistent global Header** — global functions stay in one predictable location.
2. **Brand/Home anchor** — the system identity is always visually identifiable and returns to Home.
3. **Limited global controls** — only functions that genuinely belong globally remain in the Header.
4. **Progressive disclosure** — panels open on demand instead of permanently occupying the Header.
5. **Actionable notifications** — notification content leads to the relevant work location.
6. **Unread numeric count** — count represents personal unread items, not total historical items.
7. **Read does not delete** — reading changes state; it does not remove the notification from the feed.
8. **Mark all as read** — explicit bulk read-state action is available.
9. **Compact Chat interaction** — Chat behaves as a quick conversation surface, not a navigation detour.
10. **Responsive adaptation** — mobile changes density/interaction pattern while preserving access to authorized functions.
11. **Accessibility parity** — icon-based controls have accessible names and complete keyboard/focus behavior.

---

## 4. Brand / Home

### 4.1 Required visual treatment

The Header must display the existing current system branding as an actual visual image/asset, not as a text-only label and not as an empty image placeholder.

Until the final approved logo asset exists, the implementation must create an image representation of the currently used `ClinicSaaS™` branding so the Header visibly shows the current name/mark in the same intended appearance.

This is an implementation responsibility. The user must never see an empty reserved logo box.

The asset must be replaceable later without changing the Header contract.

### 4.2 Interaction

- Brand is clickable.
- Clicking the brand returns to authenticated Home.
- Brand is not a business-action control.
- Brand must have an accessible name indicating Home/system identity.
- The visual asset must remain legible at desktop, tablet, and mobile sizes.
- Long clinic/user names must not force the brand out of the Header layout.

### 4.3 Prohibition

Do not reintroduce the current sidebar text branding as the sole Header identity.

Do not display a decorative placeholder such as an empty image frame, `Logo`, or broken-image fallback.

---

## 5. Global Search

Global Search remains the existing authoritative search capability.

The Header must:

- reuse the existing `GlobalSearch` implementation;
- preserve existing authorization and server/domain constraints;
- provide an obvious search affordance;
- use the available horizontal space efficiently without dominating the Header;
- support keyboard focus and selection;
- adapt to mobile through a compact trigger or equivalent responsive presentation;
- avoid duplicating search state/query/authorization logic.

The Header UX layer owns presentation and invocation only.

---

## 6. Communications

Communications is the authoritative clinic communication domain.

### 6.1 Header interaction

Clicking the Communications control opens the existing Communications destination/surface. It must not create a second communication system.

The Communications control must remain available as a common domain surface; read access is not to be incorrectly restricted to Clinic Admin. Write/edit capabilities remain permission-controlled inside the authoritative domain.

### 6.2 Message behavior

When the Communications experience presents a message/activity item that has an associated work context:

1. The user can select the item.
2. The item is marked/read state updated according to the authoritative Communications behavior where applicable.
3. The user is routed to the authoritative work location associated with that item.
4. The destination performs the actual work.

Communications itself does not become the owner of the underlying clinical/operational/administrative workflow.

### 6.3 Missing destination

If an item has no valid work destination, the system must not invent a route. It must open the authoritative Communications context or otherwise provide a safe fallback defined by the existing domain contract.

---

## 7. Chat

Chat is a compact interaction surface over Communications.

### 7.1 Final interaction model

Clicking Chat MUST NOT navigate to the internal Communications page.

Instead, it opens a compact Chat panel comparable in interaction intent to a lightweight WhatsApp-style conversation surface:

- compact conversation list;
- unread indication;
- conversation open/view;
- message send/receive using existing Communications authority;
- clear close/minimize controls;
- no full-page navigation for normal Chat use.

The panel may be minimized while remaining available from the Header.

### 7.2 Authority rules

Chat must reuse:

- existing Communications data;
- existing communication authorization;
- existing tenant isolation;
- existing read/unread authority where available;
- existing message sending infrastructure.

Chat must not create:

- a parallel conversation database;
- a second messaging engine;
- a separate permission model;
- a second communication domain.

### 7.3 Panel behavior

- Opening Chat does not replace the current page.
- Only one Header-owned overlay interaction should visually compete for attention at a time unless a defined nested interaction requires otherwise.
- Escape closes the active Chat panel/interaction.
- Close returns focus to the Chat control.
- Minimize hides the expanded panel while retaining the Header Chat affordance and unread state.
- On mobile, the panel may become a full-width or near-full-width interaction surface while remaining a Chat overlay rather than a route navigation.

---

## 8. Notifications

Notifications are separate from Communications and separate from Follow-up.

The Header Notifications control is the global access point to the existing personal notification feed.

### 8.1 Unread count / badge

A **badge** means the small numeric indicator associated with a Header icon/control that communicates how many personal items are currently unread.

Example:

```text
Notifications  [4]

User reads one notification

Notifications  [3]

User reads all remaining notifications

Notifications  [0]  → badge may be hidden when zero
```

This is functional state, not decoration.

The unread count must be personal to the authenticated user and tenant-aware.

### 8.2 Notification list

Opening Notifications displays the available personal notification items, including unread and previously read items within the feed window.

Unread items must remain available after being read.

Reading an item changes its read state; it does not delete it from the list.

### 8.3 Clicking a notification

When a notification has a valid associated work destination:

1. User selects the notification.
2. The notification is marked read.
3. The unread count updates immediately in the Header (for example `4 → 3`).
4. The user is routed to the authoritative work location associated with the notification.
5. The destination owns the actual work.

Read-state update and navigation should feel atomic from the user's perspective. A navigation failure must not silently restore an incorrect unread state.

### 8.4 Mark all as read

The notification panel must provide **Mark all as read**.

Its behavior:

- all currently unread personal notifications become read;
- unread count becomes `0` immediately after successful completion;
- notifications remain in the visible feed/history window;
- no notification is deleted merely because it was marked read.

### 8.5 Invalid/missing destination

The current notification architecture does not yet expose a verified universal work-destination field in the personal notification feed contract. The implementation must therefore inspect and bind to the authoritative notification producer/destination metadata before adding routing.

Do not invent route formats from notification titles, message text, or guessed IDs.

If a notification has no valid destination, the safe fallback is to retain the notification in the feed and present its authoritative notification context without fabricating navigation.

### 8.6 Feed authority

The existing personal notification feed and read-receipt architecture remains authoritative. Header code must not create a second unread store or derive unread state from UI-only memory.

---

## 9. Quick Actions

Quick Actions remain deliberately narrow.

Approved scope:

- Language;
- Logout.

No business action is added merely because it could be convenient.

Quick Actions must continue to reuse:

- the existing LanguageSwitcher/i18n behavior;
- the existing authenticated sign-out behavior.

No duplicate language state or logout mechanism is permitted.

---

## 10. Visual design direction

The final Header visual language is:

**modern + professional + clean + calm + clearly usable + medically credible**.

It must be neither:

- over-designed/marketing-heavy;
- nor so minimal that it looks unfinished, cheap, or like a basic prototype.

### 10.1 Visual hierarchy

Priority from highest to lowest:

1. system identity / Home;
2. search;
3. global communication/notification access;
4. user/interface actions.

Controls must be visually grouped without large cards or excessive containers.

### 10.2 Icons and labels

- Use familiar, semantically correct icons.
- Icon-only controls require accessible labels/tooltips where appropriate.
- Text labels may be shown at wider breakpoints when they improve comprehension.
- Do not rely on icon recognition alone for unfamiliar actions.
- Avoid unnecessary decorative icons.

### 10.3 Spacing and density

The Header should feel compact enough for a dense clinic application while preserving comfortable click/touch targets and clear separation between functions.

Do not use oversized vertical padding or oversized controls merely to make the Header appear premium.

### 10.4 States

Every applicable control must have visually distinguishable:

- idle;
- hover;
- focus-visible;
- pressed/open;
- loading;
- unread/attention;
- disabled where meaningful;
- error where applicable.

The unread state must not depend on color alone.

---

## 11. Responsive behavior

### Desktop

Preferred arrangement:

```text
Brand/Home | Search ---------------- | Communications | Chat | Notifications | Quick Actions
```

Search receives flexible width; global controls remain compact and consistently ordered.

### Tablet

- Preserve the same conceptual order.
- Reduce search width before removing global functions.
- Prefer icon + tooltip/accessible label where text labels no longer fit.
- Preserve touch target size.

### Mobile

- Preserve access to all authorized Header functions.
- Mobile navigation trigger remains separate from Quick Actions.
- Search may collapse to a dedicated trigger.
- Chat and Notifications may open larger overlay surfaces suitable for touch.
- Communications may route to its full authoritative mobile surface.
- Brand remains visible and clickable.
- Do not hide an authorized capability solely because the viewport is narrow; change the interaction pattern instead.

---

## 12. RTL / LTR / Arabic

The Header must support both Arabic/RTL and English/LTR through the unified i18n system.

Rules:

- mirror layout relationships appropriately in RTL;
- preserve familiar icon meaning;
- avoid hard-coded left/right positioning where logical properties are appropriate;
- support long Arabic notification titles/messages;
- support long user and clinic names without breaking the shell;
- ensure badges remain correctly positioned in both directions;
- verify keyboard navigation and focus order in both directions.

---

## 13. Accessibility

Target WCAG 2.2 AA-compatible interaction patterns.

Required:

- semantic Header landmark;
- accessible name for every icon-only control;
- visible focus indicator;
- logical tab sequence;
- Enter/Space activation;
- Escape closes active panel;
- focus returns to invoking control after dismissal;
- correct `aria-expanded` and related state attributes;
- sufficient touch target size;
- no color-only communication of unread/attention state;
- dynamic unread count updates are announced appropriately;
- no keyboard trap;
- panels have appropriate heading/label semantics;
- mobile interaction remains keyboard/screen-reader operable where the platform supports it.

---

## 14. Authorization and tenant safety

The Header is never an authorization boundary.

Each capability must preserve its existing server/domain authorization and tenant isolation.

Specific rules:

- Communications visibility/action rules remain owned by Communications.
- Chat inherits Communications authority.
- Notifications are personal to the authenticated user and tenant-aware.
- Search retains existing authorization constraints.
- Header UI must not expose unauthorized counts, previews, message snippets, patient data, or destinations.
- A hidden control is not a substitute for server-side authorization.

---

## 15. Data and routing requirements

The final UX requires a reliable relationship between an actionable item and its authoritative destination.

Before implementing notification/message routing, inspect and document the existing producer/data contract for:

- notification destination/context;
- communication message context;
- entity/domain type;
- target record identifier;
- tenant identity;
- destination authorization.

Preferred model:

```text
Item
  ↓
Authoritative context reference
  ↓
Domain-owned destination resolver
  ↓
Authorization check
  ↓
Authoritative work location
```

Do not use brittle client-side route guessing based on free-text title/message.

If a universal destination resolver does not yet exist, implement the smallest additive domain-owned resolver required by the existing architecture rather than a Header-specific routing engine.

---

## 16. Overlay and focus model

All Header panels/popovers use the existing common overlay strategy established by the technical foundation.

Rules:

- one deterministic layer/portal strategy;
- Escape closes the active overlay;
- appropriate outside interaction closes it;
- focus is restored after close;
- mobile Sidebar/navigation must not visually conflict with Header panels;
- panels must not produce uncontrolled nested overlays;
- Chat minimize/close semantics are distinct and deterministic;
- Notification and Communications panel interactions must not leave stale open overlays after navigation.

---

## 17. Performance

The Header must not delay the authenticated page because a secondary panel is loading.

Requirements:

- stable shell renders immediately;
- notification unread state uses the existing lightweight feed authority;
- Chat loads conversation details on demand as appropriate;
- no duplicate polling for the same authority;
- existing Global Search debounce remains intact;
- no full domain data prefetch merely to render an icon.

---

## 18. Testability

Stable semantic roles/test selectors are required for:

- Header root;
- Brand/Home;
- Global Search;
- Communications;
- Chat;
- Notifications;
- Quick Actions;
- mobile navigation trigger;
- Chat panel;
- Notifications panel;
- Communications destination/surface where applicable;
- Mark all as read;
- notification unread item;
- notification read item;
- notification destination action where applicable.

Tests must verify behavior, not only element presence.

---

## 19. Required implementation phases

### Phase 1 — Repository/domain verification

Before UI implementation:

1. Verify the existing Header technical foundation and all related integration contracts.
2. Inspect Communications message schema/query/producer context.
3. Inspect notification producers and `notification_queue` metadata/schema.
4. Determine the authoritative work-destination representation for each actionable item type.
5. Confirm whether a domain-owned destination resolver already exists.
6. If no resolver exists, define the smallest additive resolver contract without creating a Header-specific engine.

### Phase 2 — Header visual implementation

1. Add the real image-based current branding asset.
2. Make Brand/Home clickable.
3. Finalize spacing, sizing, grouping, iconography, focus, and responsive layout.
4. Preserve Global Search authority.
5. Preserve existing Communications integration.
6. Replace Chat route-navigation behavior with the approved compact Chat panel.
7. Finalize Notifications panel behavior and unread badge semantics.
8. Preserve Quick Actions scope.

### Phase 3 — Action routing integration

1. Bind notification items to verified authoritative destinations.
2. Bind communication items to verified work context where supported.
3. Mark individual notification read before/with navigation using the authoritative read-state mechanism.
4. Update unread count immediately after successful read-state mutation.
5. Implement Mark all as read.
6. Keep read items visible.
7. Provide safe fallback for missing/invalid destinations.

### Phase 4 — Responsive/accessibility/i18n verification

Verify:

- desktop;
- tablet;
- mobile;
- Arabic/RTL;
- English/LTR;
- keyboard;
- screen-reader semantics;
- long labels/messages;
- unread/read transitions;
- panel open/close/minimize/focus restoration.

### Phase 5 — Full regression and production verification

Run the project’s authoritative test execution contract.

Then verify in the actual deployed environment:

- Header appears as intended;
- branding is visible as an image;
- controls are ordered correctly;
- Chat opens as a compact panel and does not navigate;
- Notifications count is personal and accurate;
- reading one item changes count `N → N-1`;
- read items remain visible;
- Mark all as read sets count to zero without deleting items;
- clicking actionable items routes to the correct work destination;
- tenant isolation is preserved;
- no console/runtime regression is introduced.

---

## 20. Documentation requirements

During implementation, update only the documentation required to preserve a single authoritative model.

At minimum the final implementation must be traceable to:

- this contract;
- the canonical Global Surfaces reconciliation;
- the Header Technical Foundation;
- Communications integration/binding contract;
- Notifications architecture/read-state contract;
- Quick Actions execution contract;
- Master Global Surfaces execution/repair contract.

Historical documents must not silently override this contract.

If implementation discovers an existing document that materially conflicts with this contract, reconcile that document explicitly rather than leaving the conflict undocumented.

---

## 21. Non-goals

This contract does not authorize:

- redesign of Home;
- redesign of Clinical Workspace;
- redesign of Operational Workspace;
- redesign of Administration Workspace unless separately approved;
- Patient Flow redesign;
- creation of a new Communications engine;
- creation of a new Chat backend;
- creation of a second Notifications store;
- moving My Settings into Header;
- adding arbitrary business actions to Quick Actions;
- weakening permission checks to make Header behavior appear functional;
- modifying tests merely to bypass implementation failures.

---

## 22. Acceptance criteria — Definition of Done

The Header UX/UI phase is **NOT COMPLETE** until all of the following are true:

### Product UX

- [ ] Header is understandable without explanatory text.
- [ ] Current branding appears as a real image/visual asset.
- [ ] Branding is clickable and returns Home.
- [ ] Global Search is obvious and functional.
- [ ] Communications, Chat, Notifications, and Quick Actions are clearly distinct.
- [ ] Chat opens as a compact interaction panel and does not navigate for normal use.
- [ ] Header remains visually calm, modern, professional, and not over-designed.

### Notifications

- [ ] Unread count is personal and tenant-aware.
- [ ] Numeric badge communicates unread count.
- [ ] Reading one item changes the count immediately (`N → N-1`).
- [ ] Read notifications remain available in the feed.
- [ ] Mark all as read exists and works.
- [ ] Mark all as read sets unread count to zero without deleting items.
- [ ] Actionable notifications route to authoritative work destinations.
- [ ] Invalid/missing destinations never produce guessed/broken routes.

### Communications / Chat

- [ ] Communications remains the authoritative domain.
- [ ] Chat uses Communications authority.
- [ ] No parallel communication store/engine/permission model exists.
- [ ] Communications items with verified work context can route to the authoritative work location.

### Technical / security

- [ ] No Header-specific authorization model exists.
- [ ] Tenant isolation remains intact.
- [ ] Unauthorized counts/previews/destinations are not exposed.
- [ ] Existing Global Search authority remains intact.
- [ ] Existing Quick Actions authority remains intact.
- [ ] No duplicate polling/store/engine is introduced.

### Accessibility / responsive

- [ ] Desktop verified.
- [ ] Tablet verified.
- [ ] Mobile verified.
- [ ] Arabic/RTL verified.
- [ ] English/LTR verified.
- [ ] Keyboard navigation verified.
- [ ] Escape/focus restoration verified.
- [ ] Dynamic unread state is accessible.

### Validation

- [ ] Authoritative test execution contract passes.
- [ ] Build/type/lint gates pass according to repository rules.
- [ ] Production deployment is verified after merge/deploy.
- [ ] Final implementation report and execution ledger are updated.
- [ ] No unrelated work is mixed into the branch.

---

## 23. Branch / merge policy

This phase is isolated on:

`feature/header-ux-ui-final-execution-contract-2026-09-13`

The branch must remain unmerged until the complete Header UX/UI objective is implemented, tested, reviewed, documented, and production-verified.

If implementation discovers a genuinely independent workstream that cannot safely remain on this branch, create a separate purpose branch and document the dependency. Do not create parallel branches merely for convenience.

No merge is considered complete merely because the build passes. The user-visible objective and the full acceptance criteria above must be verified.

---

## 24. Execution rule

The implementation sequence is:

```text
VERIFY
  ↓
PLAN / CONFIRM DATA CONTRACTS
  ↓
IMPLEMENT
  ↓
BUILD
  ↓
AUTHORITATIVE TEST EXECUTION
  ↓
RUNTIME / PRODUCTION VERIFY
  ↓
REVIEW
  ↓
DOCUMENT
  ↓
CLOSE / MERGE ONLY WHEN COMPLETE
```

The next action after this contract is **repository/domain verification**, specifically the authoritative notification and Communications work-destination contracts. No UI routing implementation should begin until those contracts are verified.

**End of Header UX/UI Final Execution Contract.**
