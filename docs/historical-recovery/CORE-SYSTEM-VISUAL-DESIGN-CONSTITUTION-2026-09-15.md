# CORE SYSTEM — Visual Design Constitution
## Clinical Precision Visual Foundation
### 2026-09-15

**Status:** APPROVED VISUAL FOUNDATION — EXECUTION OPEN  
**Authority:** Product Owner approval recorded through the Experience Decision Registry  
**Applies to:** CORE SYSTEM shared visual language, beginning with F1 Login, F2 Header, F3 Home, F4 Home→Workspace transition.

## 1. Purpose

This constitution translates the approved **Concept 01 — Clinical Precision** direction into an executable visual language for CORE SYSTEM.

It is a visual constitution, not a replacement for the Experience Constitution, Decision Registry, Integrated Experience Work Contract, or surface-specific functional contracts.

The separation is mandatory:

- **Experience Governance:** what the experience means and how it behaves.
- **Visual Design Constitution:** how the approved experience is expressed visually.
- **Surface Contracts:** what each surface contains, owns, routes to, and must not become.
- **Implementation:** the code translation of those authorities.

A visual change may never change authorization, workflow ownership, domain authority, routing semantics, or functional scope.

## 2. Product Owner Visual Decision — CLOSED AS A FOUNDATION DECISION

The Product Owner approved:

> **Concept 01 — Clinical Precision** as the visual foundation for the entire CORE SYSTEM.

Approved qualities:

- calm;
- precise;
- professional;
- premium;
- clinical without medical clichés;
- light and visually quiet;
- deep ink with clinical azure and diagnostic cyan accents;
- neutral surfaces;
- typography and spacing as primary hierarchy tools;
- purposeful borders and restrained depth;
- disciplined radius;
- density that follows work complexity;
- native RTL/LTR behavior;
- intentional mobile transformation;
- independent Header controls rather than one large enclosing control block;
- cards used only where they improve comprehension or execution;
- gradients, glass, glow, and decorative treatment are not the default system language.

Concepts 02–04 are superseded for this workstream and must not be reopened unless the Product Owner explicitly changes the visual foundation.

## 3. Governing Visual Principle

> **Information Density must follow Work Complexity.**

Visual density is therefore a behavioral property of the surface, not a permanent global style. Login and Home remain intentionally calm; work-heavy surfaces may become denser when the underlying task requires it.

## 4. Visual Hierarchy

CORE SYSTEM communicates hierarchy in this order:

1. content meaning;
2. typography;
3. whitespace and grouping;
4. surface separation;
5. semantic color;
6. restrained depth;
7. decorative treatment last.

No component may depend on decoration to communicate its primary meaning when structure, text, icon semantics, or state attributes can do so more clearly.

## 5. Color Constitution

### 5.1 Primitive palette

| Token | Hex | Role |
|---|---|---|
| Ink 950 | `#0F172A` | Primary text, strong anchors |
| Ink 900 | `#172033` | Strong secondary text / dark controls |
| Slate 700 | `#334155` | Secondary text |
| Slate 500 | `#64748B` | Muted text / supporting metadata |
| Slate 300 | `#CBD5E1` | Quiet borders |
| Slate 200 | `#E2E8F0` | Default borders/dividers |
| Slate 100 | `#F1F5F9` | Subtle surfaces |
| Slate 50 | `#F8FAFC` | Page canvas / quiet background |
| White | `#FFFFFF` | Primary surface |
| Clinical Azure 700 | `#1D4ED8` | Strong brand/action state |
| Clinical Azure 600 | `#2563EB` | Primary brand/action |
| Clinical Azure 100 | `#DBEAFE` | Soft action background |
| Diagnostic Cyan 700 | `#0E7490` | Diagnostic/informational emphasis |
| Diagnostic Cyan 600 | `#0891B2` | Diagnostic/informational accent |
| Diagnostic Cyan 100 | `#CFFAFE` | Soft diagnostic background |

### 5.2 Semantic palette

| Semantic role | Default token | Rule |
|---|---|---|
| Primary action | Clinical Azure 600 | Main action / active emphasis |
| Information | Diagnostic Cyan 700 | Informational state, never decoration |
| Success | `#15803D` | Completed / healthy / successful state |
| Warning | `#A16207` | Needs attention / caution |
| Error | `#B91C1C` | Failure / destructive state |

Semantic color must not be repurposed arbitrarily. The same color should not represent unrelated meanings across surfaces.

Color is never the only carrier of status or action meaning.

## 6. Canvas and Surface Constitution

- Primary authenticated canvas: `Slate 50`.
- Primary content surface: `White`.
- Soft grouping surface: `Slate 100`.
- Dark surfaces are allowed only where a surface contract explicitly requires them; they are not the default CORE SYSTEM identity.
- Borders are light and functional.
- Shadows are restrained and used to establish separation or overlay hierarchy, never for ornament.
- Glassmorphism is not the default surface language.
- Gradients are not a primary identity treatment.

Recommended shadow levels:

- `shadow-none`: flat grouped content;
- `shadow-xs`: subtle elevation for important surfaces;
- `shadow-sm`: floating/raised surface;
- `shadow-md`: menus/dialogs/overlays only when separation requires it.

## 7. Radius Constitution

Use a disciplined radius family:

- `4px` — compact controls and dense structures;
- `6px` — standard inputs/small controls;
- `8px` — standard surfaces and buttons;
- `12px` — primary cards/identity surfaces where a softer boundary improves comprehension;
- `16px` — exceptional large foundation surfaces only.

Do not mix arbitrary radii within one component family.

## 8. Typography Constitution

The system uses a modern neutral sans-serif stack with Arabic-capable fallbacks. Typography must remain readable at mobile sizes and support bilingual content without manual per-language redesign.

Core hierarchy:

| Role | Size | Weight | Line-height |
|---|---:|---:|---:|
| Display | 32px | 700 | 1.2 |
| Page title | 28px | 700 | 1.25 |
| Section title | 20px | 650 | 1.35 |
| Body | 15px | 400 | 1.55 |
| Body strong | 15px | 600 | 1.5 |
| Caption | 13px | 500 | 1.45 |
| Micro | 12px | 500 | 1.4 |

Rules:

- Use typography to establish hierarchy before adding boxes.
- Avoid all-caps as a primary Arabic hierarchy mechanism.
- Do not introduce per-surface type scales that contradict this system.
- Arabic and English use the same semantic hierarchy even where glyph metrics differ.

## 9. Spacing Constitution

Base rhythm: 4px.

Preferred steps: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64`.

Primary rules:

- `8–12px` for related controls/content;
- `16px` for compact component padding;
- `24px` for standard content grouping;
- `32px` for major section separation;
- `40–48px` for foundation-level breathing room;
- `64px` reserved for large, intentional composition.

Avoid arbitrary one-off values unless required by an existing component contract or platform constraint.

## 10. Interaction Constitution

All interactive elements must provide an obvious state model where applicable:

- idle;
- hover;
- focus-visible;
- pressed/open;
- loading;
- disabled;
- error;
- unread/attention.

Focus visibility is mandatory. Touch targets should remain comfortable on mobile. State changes must be understandable without color alone.

Use logical CSS properties (`start/end`, `ms/me`, etc.) rather than hard-coded left/right positioning for shared RTL/LTR components.

## 11. Information Density Constitution

Density follows task complexity:

| Surface | Default density |
|---|---|
| Login | Low |
| Header | Low / compact |
| Home | Low / contextual |
| My Workspace | Medium |
| Role Workspace | Medium–High |
| Work Center | High where coordination requires it |
| Agenda | High where scheduling requires it |
| Analytics | Medium–High |
| Communications | Medium–High |

A surface must not become dense merely because more content is available.

## 12. Responsive Constitution

### Desktop

Use available horizontal space to establish hierarchy and reduce unnecessary vertical scrolling.

### Tablet

Preserve the same semantic order while collapsing secondary spacing and width before removing meaningful capabilities.

### Mobile

Mobile is a focused work surface, not a scaled desktop page.

The transformation may change grouping, orientation, density, and overlays while preserving authorized capabilities and semantic order.

Never hide an authorized capability solely to make desktop code fit a smaller viewport.

## 13. RTL / LTR Constitution

- Semantic order is logical, not visual-mirroring by accident.
- Use logical layout properties.
- Badge placement follows the reading direction while preserving component meaning.
- Navigation, breadcrumb, icon + text relationships, and focus order must be verified in both directions.
- Long Arabic strings must not break layout assumptions.

## 14. Brand Constitution

ClinicSaaS identity is expressed through restraint, precision, and consistent use of the approved Clinical Precision language.

- Brand color directs attention; it does not flood the UI.
- The system must not depend on medical clichés such as stethoscope imagery as a primary identity device.
- Brand and product marks remain consistent across Login and authenticated surfaces.
- Existing authoritative brand assets should be reused before new artwork is created.

## 15. Component Rules

Cards are one component type, not the universal visual language.

Prefer, in order:

1. semantic layout and spacing;
2. plain content regions;
3. dividers/surface changes where needed;
4. bordered surfaces;
5. elevated cards only when they improve grouping or interaction.

Header controls remain independent semantic functions.

Forms prioritize label clarity, predictable spacing, strong focus states, and visible validation.

## 16. Non-Negotiable Rules

1. Concept 01 — Clinical Precision is the approved visual foundation.
2. No alternate global visual theme may be introduced for Horizon, Vertex, or Zenith.
3. Visual styling cannot change functional/authorization meaning.
4. Do not turn every content region into a card.
5. Do not add decorative gradients/glow/glass as default identity.
6. Do not use semantic colors decoratively.
7. Do not introduce arbitrary typography scales.
8. Do not introduce arbitrary spacing/radius systems.
9. Preserve native RTL/LTR behavior.
10. Preserve mobile capability; transform presentation instead of deleting authorized functionality.
11. Reuse authoritative engines and components before creating new ones.
12. A surface contract remains authoritative over the visual constitution for content, routing, workflow, and ownership.

## 17. Foundation Surface Rules — F1–F4

### F1 — Login

Horizon-dominant. Light/calm canvas, clear authentication surface, restrained azure focus, no authenticated shell inside the auth surface.

### F2 — Header

Persistent global shell. Light surface, compact height, independent functions, no enclosing mega-pill, clear focus/unread states, responsive preservation of capability.

### F3 — Home

Simple + Contextual. Identity/Context first, Today/Situation second, Attention only when truly necessary, then Next Destinations. Removed Home elements remain removed. No scattered card dashboard.

### F4 — Home → Workspace

The transition should visually signal entry from awareness into work without introducing a duplicate workspace layer or changing the existing destination semantics.

## 18. Governance Relationship

This constitution is subordinate to explicit Product Owner decisions and the Experience Constitution/Work Contract for functional behavior. When a visual conflict is discovered:

1. preserve approved product meaning;
2. solve the visual problem technically where possible;
3. do not reopen a closed decision;
4. record any genuinely new visual/product decision in the Decision Registry before treating it as final.

**Foundation visual language: APPROVED.  
F1–F4 implementation: OPEN until verified.**
