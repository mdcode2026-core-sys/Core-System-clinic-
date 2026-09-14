# CORE SYSTEM — Experience Decision Registry
## 2026-09-14

**Status:** ACTIVE — EXECUTION OPEN
**Authority:** Product Owner decisions recorded below
**Purpose:** Prevent approved decisions from being lost, reinterpreted, or silently replaced during implementation or future conversations.

## 1. Status vocabulary

- **APPROVED** — Product Owner has explicitly accepted the decision. Implementation must comply.
- **OPEN** — Execution/visual detail remains unresolved. No silent invention is allowed.
- **PROPOSED** — Assistant/research recommendation only; not approved.
- **SUPERSEDED** — Replaced by a newer approved decision; historical record remains.
- **CLOSED** — Decision and its execution obligations are completed and objectively verified. This status is not permitted merely because documentation exists.

## 2. Binding decisions

| ID | Decision | Status | Execution consequence |
|---|---|---|---|
| EXP-001 | One adaptive experience system: Horizon + Vertex + Zenith | APPROVED | Do not create three visual systems. Apply one system with different complexity/context emphasis. |
| EXP-002 | Horizon controls simplicity; Vertex provides capability; Zenith adapts experience | APPROVED | Surface design must express the appropriate balance without changing the product into separate themes. |
| EXP-003 | Information Density must follow Work Complexity | APPROVED | Do not use density or visual complexity merely to make the product look enterprise/serious. |
| EXP-004 | Login, Header, and Home establish the visual foundation | APPROVED | These surfaces must be aligned before propagating a visual language broadly. |
| EXP-005 | Home is Simple + Contextual | APPROVED | Home is awareness/orientation, not a specialist work engine. |
| EXP-006 | Home ≠ My Workspace ≠ Role Workspace ≠ Work Center | APPROVED | Do not merge their concepts, routes, or ownership. |
| EXP-007 | Work Center is removed from Home | APPROVED | Remove it from Home; do not reinterpret this decision as a redesign mandate for Work Center. |
| EXP-008 | Notifications are removed from Home and remain in Header | APPROVED | Home must not duplicate notification authority. |
| EXP-009 | Communications are removed from Home and remain globally accessible from Header | APPROVED | Communications is clinic-wide internal team communication, not doctor-only. |
| EXP-010 | Quick Actions are removed from Home and remain in Header | APPROVED | Do not restore a Home quick-action dashboard. |
| EXP-011 | Patient Portal information is removed from Home | APPROVED | Portal information is not a global Home element. |
| EXP-012 | Widgets/personalized widgets are deferred from current Home work | APPROVED | Do not mix widget-system design into the current Home execution without a new decision. |
| EXP-013 | Header is persistent global shell | APPROVED | Header is not a dashboard, module directory, or universal business-action launcher. |
| EXP-014 | Chat is a compact surface over Communications | APPROVED | No second messaging engine or authority. |
| EXP-015 | Communications is global across authorized clinic accounts | APPROVED | It is not a physician-only communication system. |
| EXP-016 | Notifications remain distinct from Communications | APPROVED | Do not merge notification/feed semantics into chat/communications. |
| EXP-017 | Agenda remains authoritative planning/availability domain | APPROVED | Calendar must not become a second scheduling engine. |
| EXP-018 | Calendar is a visual/operational representation of Agenda | APPROVED | Calendar presentation cannot redefine scheduling authority. |
| EXP-019 | Patient Flow is a workflow concept, not ordinary sidebar domain | APPROVED | Do not turn Patient Flow into a normal standalone navigation module. |
| EXP-020 | Mobile is a focused work surface, not shrunken desktop | APPROVED | Responsive implementation must transform presentation intentionally. |
| EXP-021 | Personalization cannot grant authorization | APPROVED | Personalization must remain subordinate to effective permissions. |
| EXP-022 | User identity banner is part of Home direction | APPROVED | Clinic identity + user identity + contextual welcome are valid Home elements; exact styling remains OPEN. |
| EXP-023 | Welcome message disappears after first navigation | APPROVED | Do not keep a persistent login welcome block unless explicitly reopened. |
| EXP-024 | Today's appointments must preserve relevant user/context when entering Agenda | APPROVED | Generic tenant-wide routing that discards intended context is an implementation defect. |
| EXP-025 | Repository documentation is durable source of truth | APPROVED | Do not rely on memory/chat as the durable implementation authority. |
| EXP-026 | Product Owner alone approves product/visual decisions | APPROVED | Assistant recommendations cannot silently become decisions. |
| EXP-027 | No document closes before execution obligations are verified | APPROVED | Use OPEN / IN PROGRESS status until implementation and acceptance evidence exist. |
| EXP-028 | Inspect → Reuse → Extend → Create | APPROVED | New primitives/engines require objective justification after inspection. |

## 3. Open execution decisions

These are not failures of the constitution. They are deliberately left open for Product Owner decision during execution.

| ID | Open item | Required decision/evidence before closure |
|---|---|---|
| OPEN-001 | Exact Login visual language: dimensions, typography, color, spacing, brand treatment | Product Owner visual approval + runtime verification |
| OPEN-002 | Exact Header visual refinement: grouping, spacing, hierarchy, responsive treatment | Product Owner visual approval + runtime verification |
| OPEN-003 | Exact Home ordering and final visual hierarchy | Product Owner approval + runtime verification |
| OPEN-004 | Exact Home identity-banner visual treatment | Product Owner approval + runtime verification |
| OPEN-005 | Exact Home daily-awareness composition without scattered card-grid behavior | Product Owner approval + runtime verification |
| OPEN-006 | Home → Workspace transition treatment | Product Owner approval + runtime verification |
| OPEN-007 | Shared semantic visual tokens/primitives after Login/Header/Home are tuned | Evidence from the three foundation surfaces + explicit approval |
| OPEN-008 | Desktop/tablet/mobile/RTL/LTR final visual verification | Runtime evidence across required modes |
| OPEN-009 | Accessibility/focus/keyboard/touch-target verification for foundation surfaces | Objective test evidence |
| OPEN-010 | Visual regression coverage appropriate to the foundation surfaces | Test/verification evidence |

## 4. Known implementation defects/findings that must not be mistaken for new product decisions

1. Current Home still contains surfaces later explicitly removed from Home.
2. Current Home's Today/appointments route is too generic and loses relevant context.
3. Current Header control group can visually read as one combined tool block even though the architecture distinguishes functions.
4. Login is functionally clear but visually separate from the authenticated experience; alignment is required without importing the authenticated shell.
5. PR #123 is not a final visual foundation and remains unmerged/provisional.

These findings identify work; they do not authorize silent visual design decisions.

## 5. Change-control rule

If implementation discovers a conflict:

- Do not silently reinterpret an APPROVED decision.
- Do not close an OPEN decision by assumption.
- Record the conflict and its evidence.
- Ask the Product Owner for the required decision when product/visual judgment is necessary.
- If the issue is technical and does not require product judgment, resolve it without changing the product decision.

## 6. Closure rule

An individual decision may move to CLOSED only when:

1. the approved intent is implemented,
2. the relevant automated checks pass,
3. required runtime verification passes,
4. the result matches the approved decision,
5. evidence is recorded in the appropriate execution record.

The Registry itself remains **ACTIVE** while any related execution item is OPEN.
