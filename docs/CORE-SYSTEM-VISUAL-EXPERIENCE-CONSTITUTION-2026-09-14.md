# CORE SYSTEM — Visual / Experience Constitution
## Version 0.1 — 2026-09-14

**Status:** DRAFT — GOVERNING WORKING DOCUMENT
**Authority:** Derived from the approved Design / UX / Architecture Constitution, the approved Integrated Work / Execution Contract, and the approved Adaptive Hybrid Experience Model Decision dated 2026-09-14.
**Purpose:** Define the single visual and interaction language that will govern CORE SYSTEM before product-wide visual implementation proceeds.

> This document is the required bridge between the approved Adaptive Hybrid Experience Model and implementation. It does not authorize implementation of unresolved visual decisions.

---

## 1. Constitutional Position

CORE SYSTEM uses **one Visual / Experience System**.

The approved Adaptive Hybrid Experience Model is:

```text
Horizon = Foundation
Vertex  = Work Engine
Zenith  = Experience Layer
```

This Constitution translates those three governing layers into one product language.

It explicitly rejects:

```text
Horizon design + Vertex design + Zenith design
```

as three separate visual systems.

The governing rule is:

> **Horizon controls simplicity. Vertex provides capability. Zenith adapts the experience.**

And:

> **Information Density must follow Work Complexity.**

---

## 2. Scope

This Constitution governs the user-visible experience across:

- global shell and global access surfaces;
- Login;
- Home;
- My Workspace;
- Role Workspaces;
- Administrative Workspace;
- Modules / Domains;
- Analytics;
- responsive Desktop / Tablet / Mobile behavior;
- Arabic / English and RTL / LTR presentation;
- interaction states;
- feedback states;
- accessibility-sensitive visual behavior;
- shared UI primitives and semantic tokens;
- page composition patterns;
- future visual specifications built from this Constitution.

It does not redefine:

- roles;
- permissions;
- entitlements;
- tenant security;
- domain ownership;
- Agenda architecture;
- Communications / Chat architecture;
- Patient Journey / Patient Flow semantics;
- backend or database structure.

Those remain governed by the approved architectural and execution authorities.

---

## 3. Constitutional Hierarchy of Visual Decisions

Visual decisions must be resolved in this order:

```text
Product meaning
    ↓
Surface purpose
    ↓
User outcome / task
    ↓
Information hierarchy
    ↓
Interaction hierarchy
    ↓
Density
    ↓
Layout / composition
    ↓
Typography
    ↓
Surfaces / borders / radius / elevation
    ↓
Color / status semantics
    ↓
Responsive adaptation
    ↓
Component implementation
```

A lower-level visual decision must never contradict a higher-level meaning decision.

A component must not define product meaning by itself.

---

## 4. Experience Layers by Surface

| Surface | Horizon | Vertex | Zenith | Constitutional intent |
|---|---:|---:|---:|---|
| Login | Dominant | Minimal | Minimal | Low friction, clear entry |
| Home | Dominant | Limited | Strong | Simple + contextual |
| My Workspace | Strong | Limited | Dominant | Personal work surface |
| Clinical Workspace | Strong | Dominant | Supporting | Professional clinical work |
| Operational Workspace | Strong | Dominant | Strong | Operational execution |
| Administrative Workspace | Strong | Dominant | Strong | Management + oversight + intervention |
| Modules / Domains | Dominant in navigation | Dominant in work | Supporting | Clear entry, capable domain work |
| Analytics | Supporting | Dominant | Strong | Analysis + interpretation |
| Mobile | Dominant | Task-required | Strong | Focused Work Surface |

The ratios are qualitative governance guidance, not literal UI measurements.

---

## 5. Surface Identity Rules

### 5.1 Login

Login must communicate one primary outcome: **enter the system successfully**.

It must not behave as a product dashboard, marketing surface, or information hub for authenticated work.

### 5.2 Home

Home is the authenticated starting and awareness surface.

Its constitutional job is to answer:

```text
What matters to me now?
What needs attention?
Where should I go to do the work?
```

Home is **Simple + Contextual**.

Home must not become:

- a specialist workspace;
- the full Agenda;
- the Queue;
- the Communications store;
- the Notifications center;
- the Work Center;
- a second analytics engine;
- a universal dashboard containing every available capability.

Exact Home ordering and final visual hierarchy are intentionally **OPEN** until Product Owner visual decisions are recorded.

### 5.3 My Workspace

My Workspace must feel like the user's own working place rather than a smaller copy of the entire product.

It may present:

- personal priorities;
- assigned work;
- shortcuts;
- alerts;
- current tasks;
- contextual widgets;
- authorized cross-domain work relevant to the user.

Personalization changes presentation only and never grants authorization.

### 5.4 Role Workspace

Role Workspace is where professional work becomes the primary visual concern.

Vertex may introduce greater density, deeper information structures and more powerful controls when the work itself requires them.

Horizon remains responsible for keeping that power understandable.

Zenith may adapt emphasis to user role, context and current work without changing authorization.

### 5.5 Administrative Workspace

Administrative Workspace is a **Management + Oversight + Intervention Control Center**.

The visual hierarchy should make it possible to understand:

```text
What is happening?
Where is the problem / opportunity?
What needs intervention?
What outcome is expected?
```

The exact information architecture remains **OPEN**.

### 5.6 Modules / Domains

Navigation must remain simple and recognizable.

Inside a domain, the interface may become more capable and information-dense according to task complexity.

Contextual emphasis may expose relevant alerts, trends, or next actions without creating a second domain engine.

### 5.7 Analytics

Analytics is allowed to be materially denser than Home or Login when the analysis task requires:

- comparisons;
- trends;
- segmentation;
- filtering;
- drill-down;
- tables;
- charts;
- interpretation.

Density must still be structured by clear hierarchy.

### 5.8 Mobile

Mobile is not a compressed Desktop layout.

The constitutional target is:

> **Focused Work Surface**

Mobile should preserve only the information and controls necessary for the current context while using Horizon for simplicity and Zenith for adaptation. Vertex appears where the task genuinely requires professional work capability.

---

## 6. Page Anatomy

Every governed page must establish a recognizable hierarchy before individual components are considered.

At minimum, where applicable:

```text
Global context
    ↓
Page identity
    ↓
Primary purpose / outcome
    ↓
Primary action(s)
    ↓
Primary information
    ↓
Secondary information
    ↓
Supporting context
```

Not every page requires every layer.

The constitution does not require a title, subtitle, card, or hero treatment on every page. Surface purpose determines the anatomy.

---

## 7. Header and Global Access

Header is a persistent global surface and is **not Home**.

It must remain visually distinguishable from page content while belonging to the same CORE SYSTEM visual language.

The Header may provide global access such as:

- identity/context;
- global navigation access where defined;
- search where authorized;
- notifications;
- communications / chat entry where authorized;
- other globally governed access points.

Header must not become:

- a second Home;
- a universal business-action launcher;
- a duplicate Sidebar;
- a duplicate Notifications or Communications domain.

**Important:** exact Header composition, element ordering, dimensions and responsive transformation are **OPEN visual decisions** unless already explicitly specified by a current approved Header decision record.

The current Governance PLAN prohibition on Header redesign does not override this Constitution. Header participates in the product-wide visual language and therefore must be reconciled against this Constitution before final visual closure, while avoiding unauthorized semantic or architectural changes.

---

## 8. Sidebar and Navigation

Sidebar represents authorized Domain / Module entry.

It is not authorization itself.

Navigation must visually communicate:

- current location;
- available authorized destinations;
- hierarchy between primary and secondary navigation where applicable;
- active state;
- collapsed / expanded state where applicable.

It must not manufacture artificial domains such as `My Financial` or `My Agenda` merely to represent cross-domain permissions.

Exact Sidebar dimensions, collapse behavior, iconography and mobile transformation are **OPEN** unless already explicitly approved.

---

## 9. Information Hierarchy

Visual hierarchy is not decoration. It must communicate importance and action priority.

The system should provide an explicit hierarchy between:

```text
Primary
Secondary
Supporting
Background / contextual
```

Hierarchy must be perceivable through more than color alone.

No page should become visually flat merely because all components use the same emphasis treatment.

No page should become visually noisy by giving every available object primary emphasis.

---

## 10. Typography Constitution

Typography is governed semantically rather than page-by-page.

The system requires named semantic levels for applicable uses, such as:

- page identity;
- section identity;
- primary content;
- secondary content;
- supporting/meta information;
- labels;
- helper text;
- status text;
- numeric emphasis.

The exact font family, font sizes, line heights, weights, letter spacing rules and Arabic-specific typographic decisions are **OPEN** and must be decided before final token closure.

No screen may invent an unrelated local typography scale.

RTL / LTR must preserve hierarchy without relying on mirroring alone.

---

## 11. Spacing and Layout Constitution

CORE SYSTEM requires one semantic spacing rhythm.

Spacing must communicate grouping and hierarchy rather than simply add visual whitespace.

The system requires defined semantic spacing roles for, where applicable:

- page edges;
- section separation;
- component separation;
- control internal spacing;
- dense data regions;
- touch targets;
- modal / drawer internal layout.

Exact spacing scale, page gutters, max widths, breakpoint values and grid rules are **OPEN** until decided and recorded.

Local one-off spacing values must not become an undeclared second spacing system.

---

## 12. Surfaces, Containers, Borders, Radius and Elevation

Surfaces must communicate hierarchy and grouping.

The visual system must not equate “CORE SYSTEM surface” with “rounded card + shadow.”

A governed surface may use:

- background contrast;
- border;
- radius;
- elevation;
- spacing;
- typography;
- sectioning;
- or a deliberately flat treatment

according to the context.

The system must prefer semantic surface roles over local stylistic choices.

Examples of semantic roles include:

```text
Page surface
Section surface
Interactive surface
Elevated surface
Overlay surface
Inset / dense data surface
```

Exact radius families, elevation levels, border weights and surface treatments are **OPEN**.

---

## 13. Color Constitution

Color must communicate meaning, hierarchy and state.

The final system must define semantic—not component-specific—color roles for applicable purposes such as:

- page/background;
- surface;
- text primary;
- text secondary;
- border;
- primary action;
- secondary action;
- focus;
- selected/active;
- success;
- warning;
- error/destructive;
- informational;
- disabled;
- status categories where clinically/operationally justified.

Color must never be the only carrier of critical meaning.

The exact palette, contrast targets, light/dark behavior and semantic token names/mapping are **OPEN**.

---

## 14. Actions and Controls

The interface must communicate action hierarchy.

Applicable action roles should distinguish:

```text
Primary action
Secondary action
Tertiary / low-emphasis action
Destructive action
Contextual action
```

Actions must reflect the outcome of the surface rather than exposing every technically available capability at equal emphasis.

Exact button dimensions, shapes, icon placement, control heights and variants remain **OPEN** until visually decided.

---

## 15. Components

Shared components must express semantic behavior, not force one visual appearance onto every context.

A reusable component must document, where applicable:

- purpose;
- allowed contexts;
- semantic variants;
- interaction states;
- accessibility behavior;
- responsive behavior;
- RTL/LTR behavior;
- density behavior.

A component must not be created solely because a single page needs a unique visual arrangement when a composition pattern is sufficient.

---

## 16. States

Governed surfaces must explicitly account for applicable:

- default;
- hover;
- focus-visible;
- active/selected;
- disabled;
- loading;
- empty;
- success;
- warning;
- error;
- unavailable/restricted;
- permission-denied states.

State communication must remain understandable without relying on color alone.

Empty, loading and error states are part of the experience, not afterthoughts.

Exact visual treatments remain **OPEN**.

---

## 17. Responsive Constitution

Responsive behavior is part of the experience definition, not a final CSS patch.

The system must define intentional behavior for:

- Desktop;
- Tablet;
- Mobile.

Each surface must answer:

- what remains fixed;
- what reflows;
- what collapses;
- what becomes scrollable;
- what changes hierarchy;
- what is removed from immediate view;
- what becomes a focused action.

Mobile must not simply preserve every Desktop element at smaller dimensions.

Exact breakpoints and per-surface transformations remain **OPEN**.

---

## 18. RTL / LTR Constitution

The experience must be natively correct in both Arabic and English contexts.

RTL/LTR behavior must cover more than text alignment, including:

- directional icons;
- navigation placement;
- control grouping;
- tables and dense data;
- drawers / panels;
- breadcrumbs;
- pagination;
- charts where directional interpretation exists;
- motion where applicable.

Exact language-specific visual decisions remain **OPEN**.

---

## 19. Accessibility Constitution

Accessibility is constitutional.

Applicable surfaces must provide:

- keyboard access;
- visible focus;
- semantic interactive controls;
- readable hierarchy;
- sufficient contrast;
- meaningful labels;
- non-color-only status communication;
- responsive usability;
- correct RTL/LTR behavior;
- accessible state changes.

No visual decision may intentionally create an avoidable accessibility failure.

Accessibility compliance must be verified; it may not be inferred solely from a component's existence.

---

## 20. Density Constitution

Density is determined by work complexity.

```text
Low-complexity awareness
    → lower density

Professional execution
    → purposeful density

Management / monitoring
    → controlled higher density

Deep analysis
    → higher analytical density
```

Density may increase only when it improves the user's ability to perform the intended work.

More information is not automatically better information.

---

## 21. Personalization and Context

Zenith may adapt:

- emphasis;
- ordering where governed;
- selected contextual information;
- relevant shortcuts;
- user-specific work signals;
- context-sensitive presentation.

Personalization must not:

- grant access;
- remove required security controls;
- redefine the user's primary role;
- silently change domain ownership;
- create a second workflow engine.

The constitution distinguishes **personalization** from **authorization** at all times.

---

## 22. Global Communication and Feedback Surfaces

Communications is clinic-wide internal communication across authorized clinic accounts.

Chat is a compact interaction surface over Communications.

Notifications are distinct from Communications and Follow-up.

Visual treatment must make these concepts distinguishable without creating unrelated mini-products.

Exact Header entry treatment, unread indicators, chat compact-surface dimensions and mobile behavior remain **OPEN** unless already explicitly approved in current surface decisions.

---

## 23. Clinical / Operational / Administrative Visual Character

The product may express different work demands through hierarchy, density, information structures and interaction patterns.

It must not become three unrelated brands or three disconnected visual systems.

### Clinical

Prioritize clarity, clinical information hierarchy, professional confidence, focused decision support and safe task progression.

### Operational

Prioritize execution status, queues, tasks, coordination, timing, dependencies and visible operational outcomes.

### Administrative

Prioritize oversight, exceptions, intervention, outcomes, financial/business context and management signals.

These are experience priorities, not role or authorization definitions.

Exact surface-level visual distinctions remain **OPEN** unless approved separately.

---

## 24. Dashboard / Overview / Analytics

The Constitution preserves the semantic distinction:

- Workspace = everyday work.
- Overview = contextual summary.
- Dashboard = monitoring / management.
- Analytics = deeper analysis / intelligence.

The final UI relationship, placement and exact boundaries are **OPEN**.

A page must not be labeled “Dashboard” merely because it contains cards or metrics.

---

## 25. Visual Anti-Patterns

The following are constitutionally disallowed unless an explicit Product Owner decision overrides them:

- one visual treatment applied to every surface regardless of work complexity;
- every page becoming a card grid;
- every page becoming a giant dashboard;
- information density increased without work justification;
- Home becoming a specialist workspace;
- Home duplicating authoritative domains;
- components defining product semantics instead of the reverse;
- local token systems that contradict the shared visual language;
- color being the only indicator of critical state;
- responsive behavior implemented only as shrinkage;
- mobile treated as Desktop at a smaller width;
- personalization presented as authorization;
- three separate visual identities for Horizon / Vertex / Zenith;
- visual polish used to conceal unresolved product meaning;
- silent resolution of OPEN visual decisions.

---

## 26. Decision Status Model

Every material visual rule must carry one of these states:

| State | Meaning |
|---|---|
| APPROVED | Explicit Product Owner decision or approved governing authority |
| PROPOSED | Candidate presented for Product Owner decision |
| OPEN | Not yet decided; implementation must not guess |
| PROVEN | Verified in current runtime/tooling evidence |
| UNVERIFIED | Insufficient evidence to claim correctness |
| SUPERSEDED | Replaced by a later approved decision |

Documentation must not use source implementation as proof that an OPEN visual decision has been approved.

---

## 27. Current Approved Visual/Experience Decisions

The following are currently approved and may be treated as governing direction:

1. CORE SYSTEM uses one Adaptive Hybrid Experience System.
2. Horizon is the Foundation.
3. Vertex is the Work Engine.
4. Zenith is the Experience Layer.
5. Horizon controls simplicity.
6. Vertex provides capability.
7. Zenith adapts the experience.
8. Information Density follows Work Complexity.
9. Home is Simple + Contextual.
10. Home is distinct from My Workspace and Role Workspace.
11. Header is distinct from Home and Workspaces.
12. Mobile is a Focused Work Surface, not a compressed Desktop.
13. The visual system must use one shared language rather than three designs.
14. Personalization does not grant authorization.
15. Accessibility, RTL/LTR and responsive behavior are constitutional requirements.

---

## 28. Open Visual Decisions Before Implementation Closure

The following must be explicitly decided before the Constitution can become implementation authority for the corresponding visual areas:

### Global system
- final visual token taxonomy;
- semantic color mapping;
- typography family and semantic scale;
- spacing scale;
- page width / container rules;
- radius families;
- elevation / shadow rules;
- border rules;
- icon system and sizing;
- control heights and touch targets;
- interaction-state visuals;
- overlay / modal / drawer language;
- light/dark behavior, if applicable.

### Header
- exact structure;
- element order;
- dimensions;
- alignment;
- identity presentation;
- search treatment;
- notifications treatment;
- communications/chat treatment;
- responsive transformation;
- mobile behavior.

### Sidebar
- exact width(s);
- grouping;
- icon treatment;
- active-state treatment;
- collapsed behavior;
- mobile transformation;
- hierarchy between global/workspace/module entries.

### Home
- exact information hierarchy;
- exact ordering;
- exact page anatomy;
- what appears above the fold;
- action hierarchy;
- contextual information model;
- widget treatment;
- card vs section vs list usage;
- responsive structure.

### My Workspace
- exact composition;
- personal priority model;
- widget placement;
- customization affordance;
- density behavior.

### Role Workspaces
- clinical visual hierarchy;
- operational visual hierarchy;
- administration-oriented work presentation;
- workspace navigation treatment;
- density patterns.

### Administrative Workspace
- exact information architecture;
- intervention hierarchy;
- management/oversight visual model;
- exceptions and critical-state presentation.

### Analytics
- chart language;
- filtering/control patterns;
- dense table patterns;
- drill-down behavior;
- interpretation/context treatment.

### Mobile
- navigation model;
- Header transformation;
- primary action placement;
- scrolling rules;
- dense data behavior;
- modal/drawer behavior;
- per-surface adaptation rules.

No implementation may silently convert any item above from OPEN to APPROVED.

---

## 29. Relationship to Existing PR #123

PR #123 is **not visually closed** by this Constitution.

Its work remains provisional/frozen for visual acceptance until the implementation is reconciled against this Constitution.

Existing work must be classified:

```text
KEEP
ADAPT
REPLACE
UNVERIFIED
```

and the classification must be based on evidence and the approved visual rules.

The previous PR's CI success cannot establish visual acceptance.

---

## 30. Implementation Gate

No product-wide visual implementation may begin merely because:

- the Adaptive Hybrid Experience Model is approved;
- CI is green;
- shared primitives exist;
- a pilot page renders;
- a screenshot looks improved.

Before visual implementation of a governed area, the corresponding visual decisions must be **APPROVED** or explicitly marked as governed behavior already defined elsewhere.

Where a required visual decision remains OPEN:

```text
STOP → RECORD OPEN DECISION → PRODUCT OWNER DECISION → UPDATE CONSTITUTION → IMPLEMENT
```

Ordinary implementation defects after visual decisions are closed are not decision blockers; they must be fixed under the Execution Contract.

---

## 31. Verification Requirements

A future implementation claiming compliance with this Constitution must verify, as applicable:

- desktop behavior;
- tablet behavior;
- mobile behavior;
- Arabic / English;
- RTL / LTR;
- accessibility;
- loading / empty / error / success states;
- focus / active / selected / disabled states;
- hierarchy and density;
- consistency with shared tokens;
- absence of local contradictions;
- preservation of domain ownership and authoritative routes;
- no authorization change caused by presentation.

Static CI proves only source-level checks that actually ran.

Visual and interaction claims require interactive evidence where static checks cannot establish them.

---

## 32. Documentation Rule

This Constitution is the repository authority for approved visual / experience decisions.

Any later visual decision must either:

1. update this Constitution; or
2. be recorded in a dedicated surface specification that explicitly references and does not contradict this Constitution.

Documentation must remain under `docs/`.

A chat discussion is not sufficient repository authority for a permanent visual rule until the decision is recorded in the repository.

---

## 33. Current Status

**Adaptive Hybrid Experience Model:** APPROVED.

**Visual / Experience Constitution:** DRAFT — GOVERNING WORKING DOCUMENT.

**Product-wide visual implementation authorization:** NOT GRANTED BY THIS DOCUMENT YET.

**Reason:** The governing principles are defined, but material visual decisions remain OPEN and must be resolved before the corresponding implementation is accepted.

**Next required activity:** Review this Constitution section-by-section with the Product Owner, record explicit visual decisions, then promote the document to an approved implementation authority.

**End of Visual / Experience Constitution.**
