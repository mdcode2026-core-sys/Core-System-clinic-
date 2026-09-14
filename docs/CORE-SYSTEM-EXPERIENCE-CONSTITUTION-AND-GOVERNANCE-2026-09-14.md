# CORE SYSTEM — Experience Constitution & Governance
## 2026-09-14

**Status:** APPROVED FOUNDATION — EXECUTION OPEN
**Authority:** Product Owner-approved decisions
**Scope:** Login, Header, Home, Workspace transition, shared experience foundation, and their governing boundaries.

> This is the durable experience foundation. Detailed visual execution is governed by the approved Clinical Precision Visual Design Constitution.

## 1. Purpose

CORE SYSTEM has undergone repeated UX/architecture investigations. The purpose of this constitution is to prevent established decisions from being lost, reinterpreted, or silently replaced during implementation or future conversations.

The repository is the durable source of truth. Chat discussion is not a permanent authority unless explicitly promoted into the repository.

## 2. One Experience System

CORE SYSTEM uses one adaptive experience system:

- **Horizon = Foundation:** simplicity, clarity, hierarchy, learnability, consistency, accessibility, and avoidance of unnecessary complexity.
- **Vertex = Work Engine:** professional work capability, appropriate density, advanced workflows, monitoring, management, and analytics where complexity requires it.
- **Zenith = Experience Layer:** contextual presentation, personalization within authorization, adaptive emphasis, and human-centered presentation.

These are not three visual themes or three design systems.

### Governing principle

> **Information Density must follow Work Complexity.**

Plain-language model:

> **Horizon controls simplicity. Vertex provides capability. Zenith adapts the experience.**

## 3. Approved Visual Foundation — Clinical Precision

The Product Owner approved **Concept 01 — Clinical Precision** as the visual foundation for the entire CORE SYSTEM.

The visual language is defined as:

- deep ink + clinical azure + diagnostic cyan + quiet neutrals;
- calm, precise, professional, premium;
- clinical without medical clichés;
- light and visually quiet surfaces;
- hierarchy led by typography and spacing;
- restrained borders and purposeful depth;
- disciplined radius;
- density that follows work complexity;
- native RTL/LTR;
- intentional mobile transformation;
- independent Header capabilities rather than a single mega-pill;
- cards used selectively;
- gradients, glass, glow, and decorative treatment are not the default identity.

The executable visual rules live in:

- `docs/CORE-SYSTEM-VISUAL-DESIGN-CONSTITUTION.md`
- `docs/CORE-SYSTEM-VISUAL-TOKEN-SPEC.md`
- `docs/CORE-SYSTEM-SURFACE-VISUAL-APPLICATION-MATRIX.md`
- `docs/CORE-SYSTEM-VISUAL-EXECUTION-CONTRACT.md`

These documents govern visual expression; they do not override functional or surface contracts.

## 4. Visual Foundation Surfaces

The system's visual foundation is established through:

1. Login
2. Header
3. Home

They must be tuned as one experience foundation before the resulting language is propagated broadly.

## 5. Login

Login is Horizon-dominant: simple, calm, clear, confident, and easy to understand.

It must remain a dedicated authentication experience; do not put the authenticated Header/Sidebar into authentication or create a second authentication architecture.

**Status: OPEN for execution/visual approval/runtime verification.**

## 6. Header

Header is a persistent global shell, not a dashboard, module directory, workspace, or universal business-action launcher.

Canonical conceptual order:

`Brand / Home | Global Search | Communications | Chat | Notifications | Quick Actions`

The Header reuses authoritative domain infrastructure. Chat is a compact surface over Communications; Notifications remain distinct from Communications.

Quick Actions remain narrow and global; current approved scope is Language + Logout.

**Status: OPEN for visual refinement/runtime verification.**

## 7. Home

Home is the global starting/awareness surface.

Home must be **Simple + Contextual** and must route users to authoritative work surfaces rather than becoming another work engine.

Home is distinct from:

- Role Workspace
- My Workspace
- Work Center
- Communications
- Notifications
- Agenda / Calendar
- Patient Flow
- module/domain work surfaces

### Explicit Home removals

The following are removed from Home under the current approved direction:

- Notifications
- Communications
- Work Center
- Quick Actions
- Patient Portal information

Widgets/personalized widgets are deferred from the current Home execution.

### Work Center boundary

The removal of Work Center from Home is an explicit Product Owner decision. It has no direct conceptual relationship to redesigning Home's purpose and must not be used to trigger redesign of Work Center.

### Today / Agenda

Today's appointments must preserve relevant user/context when entering Agenda. A generic route that discards that context is an implementation defect. Agenda remains the authoritative planning/availability domain; Calendar must not become a second scheduling engine.

**Status: OPEN for execution/visual approval/runtime verification.**

## 8. Protected Surface Boundaries

| Surface | Meaning | Must not become |
|---|---|---|
| Home | Global starting / awareness | Specialist work engine |
| My Workspace | Personal arrangement of authorized work/tools | Authorization or Role Workspace |
| Role Workspace | Primary professional work environment | Personal preference |
| Work Center | Coordinated work: ownership, assignment, handoff, escalation | Home surface or communication engine |
| Communications | Clinic-wide internal team communication | Doctor-only system |
| Chat | Compact interaction over Communications | Second messaging engine |
| Notifications | Personal attention/feed | Communications replacement |
| Header | Persistent global access | Dashboard/module directory |
| Agenda | Authoritative planning/availability | Presentation-only calendar engine |
| Calendar | Visual/operational scheduling representation | Second scheduling engine |
| Patient Flow | Internal workflow concept | Ordinary standalone sidebar domain |

## 9. Responsive / Accessibility Foundation

Mobile is a focused work surface, not a shrunken desktop.

- Desktop/tablet may use more expansive presentation when complexity justifies it.
- Mobile must deliberately transform presentation while preserving authorized capability.
- RTL/LTR must preserve semantic order and clarity.
- Accessibility, focus, keyboard, touch targets, state communication, and overlays are part of the foundation.

**Status: OPEN pending runtime verification.**

## 10. Personalization and Authorization

Personalization never grants authorization, changes Primary Work Context, changes Role Workspace, or creates another workspace membership.

## 11. Governance Rules

1. Product Owner alone moves product/visual decisions from OPEN/PROPOSED to APPROVED.
2. Assistant recommendations must never be silently converted into product decisions.
3. Documentation is durable only when stored in the repository.
4. Historical documents remain historical; they are not silently rewritten as current authority.
5. No duplicate engines for Search, Communications, Chat, Notifications, Agenda, authorization, or other authoritative domains.
6. Use **Inspect → Reuse → Extend → Create**.
7. A document is CLOSED only after its execution obligations are implemented and objectively verified.
8. A governance foundation can remain active while execution remains OPEN.
9. If an implementation conflict requires product/visual judgment, do not invent the decision; return it to the Product Owner.

## 12. Mandatory Records

Before implementation within this scope, the execution owner MUST read:

- `docs/CORE-SYSTEM-EXPERIENCE-DECISION-REGISTRY-2026-09-14.md`
- `docs/CORE-SYSTEM-INTEGRATED-EXPERIENCE-WORK-CONTRACT-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-EXECUTION-GATE-2026-09-14.md`
- `docs/CORE-SYSTEM-VISUAL-DESIGN-CONSTITUTION.md`
- `docs/CORE-SYSTEM-VISUAL-TOKEN-SPEC.md`
- `docs/CORE-SYSTEM-SURFACE-VISUAL-APPLICATION-MATRIX.md`
- `docs/CORE-SYSTEM-VISUAL-EXECUTION-CONTRACT.md`

## 13. Current Closure State

**Experience foundation:** APPROVED FOUNDATION / EXECUTION OPEN.

**Visual foundation:** APPROVED — Clinical Precision.

**Detailed F1–F4 implementation:** OPEN.

**Runtime visual verification:** OPEN.

**Overall Experience Foundation:** **NOT CLOSED.**
