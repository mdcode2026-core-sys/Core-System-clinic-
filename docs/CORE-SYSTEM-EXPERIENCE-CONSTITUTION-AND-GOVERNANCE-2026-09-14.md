# CORE SYSTEM — Experience Constitution & Governance Baseline
## 2026-09-14

**Status:** APPROVED FOUNDATION — EXECUTION OPEN
**Authority:** Product Owner approved decisions recorded in this document and the Decision Registry
**Purpose:** Permanent foundation for the unified CORE SYSTEM experience; prevents interpretation drift between investigations, implementation sessions, PRs, and future conversations.

> This document is a governing foundation, not a completed visual design specification. Detailed visual values remain open until explicitly approved by the Product Owner.

## 1. Why this constitution exists

CORE SYSTEM has undergone repeated UX/architecture investigations. The failure mode to prevent is not lack of research; it is loss of already-established decisions during implementation or across later conversations.

Therefore, this constitution establishes a repository-level source of truth for the experience model and its non-negotiable boundaries.

The assistant/implementation process MUST read and reconcile against this document and the linked Decision Registry before proposing or implementing changes within its scope.

## 2. Product Experience Model

CORE SYSTEM uses one adaptive experience system:

- **Horizon = Foundation** — simplicity, clarity, hierarchy, learnability, consistency, accessibility, and avoidance of unnecessary complexity.
- **Vertex = Work Engine** — professional work capability, appropriate density, advanced workflows, monitoring, management, and analytics where work complexity requires it.
- **Zenith = Experience Layer** — contextual presentation, personalization within authorization, adaptive emphasis, and human-centered presentation.

These are not three visual themes and must never become three disconnected design systems.

### Governing principle

> **Information Density must follow Work Complexity.**

Plain-language interpretation:

> **Horizon controls simplicity. Vertex provides capability. Zenith adapts the experience.**

## 3. Global Experience Surfaces

### 3.1 Login

Login is Horizon-dominant: simple, calm, clear, confident, and easy to understand.

Login must align with the product's broader visual language without copying the authenticated shell or importing Header/Sidebar into authentication.

### 3.2 Header

Header is a persistent global shell, not a dashboard, module directory, workspace, or universal business-action launcher.

Canonical conceptual order:

`Brand / Home | Global Search | Communications | Chat | Notifications | Quick Actions`

The Header must reuse authoritative domain infrastructure. Chat is a compact surface over Communications and must not create a second messaging engine. Notifications remain distinct from Communications.

Quick Actions remain within the approved global scope; they are not an uncontrolled business-action launcher.

### 3.3 Home

Home is the global starting/awareness surface.

Home must be **Simple + Contextual** and must route users into authoritative work surfaces rather than becoming another work engine.

Home is distinct from:

- Role Workspace
- My Workspace
- Work Center
- Communications
- Notifications
- Agenda / Calendar as a scheduling engine
- Patient Flow
- module/domain work surfaces

Home is not a full operational dashboard.

### 3.4 Workspace transition

Entering a Role Workspace should feel like entering work mode. The transition is conceptually:

**Awareness → Work Mode → Authoritative Domain Work**

The exact visual treatment remains an execution decision and is therefore OPEN until explicitly approved.

## 4. Canonical Surface Boundaries

The following meanings are protected:

| Surface | Canonical meaning | Must not become |
|---|---|---|
| Home | Global starting / awareness | Work engine or specialist workspace |
| My Workspace | Personal arrangement of authorized work/tools | Authorization system or Role Workspace replacement |
| Role Workspace | Primary professional work environment | Personal preference or generic dashboard |
| Work Center | Coordinated work items: ownership, assignment, handoff, escalation | Home widget or communication engine |
| Communications | Clinic-wide internal team communication | Doctor-only communication system |
| Chat | Compact interaction surface over Communications | Second messaging backend/authority |
| Notifications | Personal attention/feed surface | Communications replacement |
| Header | Persistent global access shell | Dashboard/module directory |
| Agenda | Authoritative planning/availability domain | Calendar-only presentation |
| Calendar | Visual/operational representation of scheduling | Second scheduling engine |
| Patient Flow | Internal clinic workflow concept | Ordinary standalone sidebar domain |

### Explicit Home decision

**Work Center is removed from Home.**

This is an explicit Product Owner decision. It must not be reinterpreted as a statement about the conceptual purpose of Home or used to trigger redesign of Work Center itself.

The following are also removed from Home under the current approved direction:

- Notifications
- Communications
- Quick Actions
- Patient Portal information

Widgets / personalized widgets are deferred to a separate workstream and must not be mixed into the current Home execution unless explicitly reopened.

## 5. Identity and Personalization

User identity on Home may include clinic identity, clinic logo, user name, welcome/contextual information, and a light weather/ambient element where appropriate.

The approved direction is:

- Desktop/tablet: identity banner remains within Home page bounds.
- Welcome message is shown on login and disappears after first navigation/page change.
- Mobile must feel like a focused phone-app experience, not a shrunken desktop page.

Exact visual dimensions, typography, color, spacing, and component styling are OPEN until explicitly approved.

Personalization must never grant authorization or alter Role Workspace / Primary Work Context.

## 6. Home Daily Awareness

Home must not devolve into a scattered dashboard card grid.

Daily awareness should be presented as a coherent hierarchy. Desktop/tablet may use more space than mobile, but the experience must remain intentional rather than a collection of disconnected cards.

"Today's appointments" must preserve the user's relevant context when routing to Agenda. A generic tenant-wide Agenda destination that discards the user's intended context is an implementation defect.

## 7. Responsive and Accessibility Foundation

Responsive behavior is not a CSS-only shrinking exercise.

- Desktop: richer presentation where justified by complexity.
- Tablet: preserve conceptual hierarchy while adapting density.
- Mobile: focused work surface; preserve authorized capability; collapse or transform presentation deliberately.
- RTL/LTR must preserve semantic order and interaction clarity.
- Accessibility, keyboard behavior, focus states, touch targets, and readable labels are part of the experience foundation.

## 8. Governance Rules

### 8.1 Product Owner authority

Only the Product Owner may move a product/visual decision from `OPEN` or `PROPOSED` to `APPROVED`.

The assistant may recommend, reconcile, inspect, and report. It must not silently convert a recommendation into an approved decision.

### 8.2 Documentation authority

Repository documents are the durable record. Chat discussion is not a permanent source of truth unless explicitly promoted into the repository through the approved governance process.

### 8.3 No false closure

A document may be marked **CLOSED** only when its execution obligations and acceptance criteria have been completed and objectively verified.

A constitution can remain an active foundation while implementation decisions remain OPEN.

A reconciliation record must not be marked COMPLETE if it still contains execution decisions that have not been implemented/verified. Where necessary, status must be **OPEN — EXECUTION IN PROGRESS**.

### 8.4 No silent supersession

A new document must explicitly identify what it supersedes, what it preserves, and what remains open. Historical records must not be silently rewritten to make incomplete work appear complete.

### 8.5 No duplicate engines

Visual work must not create parallel engines for Search, Communications, Chat, Notifications, Agenda, authorization, or other authoritative domains.

### 8.6 Inspect → Reuse → Extend → Create

Before creating a new primitive, surface, route, data path, or engine:

1. Inspect the existing authority.
2. Reuse when sufficient.
3. Extend when necessary.
4. Create only when objectively required.

## 9. Mandatory Pre-Implementation Check

Before any implementation touching Login, Header, Home, Workspace transition, global surfaces, or shared experience primitives, the execution owner MUST:

1. Read this constitution.
2. Read `docs/CORE-SYSTEM-EXPERIENCE-DECISION-REGISTRY-2026-09-14.md`.
3. Read `docs/CORE-SYSTEM-INTEGRATED-EXPERIENCE-WORK-CONTRACT-2026-09-14.md`.
4. Identify every applicable decision ID.
5. Identify every OPEN execution decision.
6. State how the proposed implementation preserves each approved invariant.
7. Stop rather than inventing a product decision when an OPEN item is encountered.

## 10. Current Status

**Foundation:** APPROVED.

**Detailed visual system:** OPEN.

**Login execution:** OPEN.

**Header execution/refinement:** OPEN.

**Home execution:** OPEN.

**Home → Workspace transition:** OPEN.

**Runtime visual verification:** OPEN.

**Overall Experience Foundation closure:** NOT CLOSED.

This status is intentional and must remain so until the implementation decisions are executed and verified.
