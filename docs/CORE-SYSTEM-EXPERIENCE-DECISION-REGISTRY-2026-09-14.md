# CORE SYSTEM — Experience Decision Registry
## 2026-09-14

**Status:** ACTIVE — EXECUTION OPEN
**Authority:** Product Owner-approved decisions
**Purpose:** The single durable register preventing approved experience decisions from being lost or silently reinterpreted.

## 1. Status vocabulary

- **APPROVED** — Product Owner explicitly accepted; implementation must comply.
- **OPEN** — Execution/visual detail remains unresolved; no silent invention.
- **PROPOSED** — Recommendation only; not approved.
- **SUPERSEDED** — Replaced by a later approved decision.
- **CLOSED** — Implemented and objectively verified; documentation alone cannot create this status.

## 2. Approved decisions

| ID | Decision | Status |
|---|---|---|
| EXP-001 | One adaptive experience system: Horizon + Vertex + Zenith | APPROVED |
| EXP-002 | Horizon controls simplicity; Vertex provides capability; Zenith adapts experience | APPROVED |
| EXP-003 | Information Density must follow Work Complexity | APPROVED |
| EXP-004 | Login, Header, and Home form the current visual foundation | APPROVED |
| EXP-005 | Home is Simple + Contextual | APPROVED |
| EXP-006 | Home ≠ My Workspace ≠ Role Workspace ≠ Work Center | APPROVED |
| EXP-007 | Work Center is removed from Home | APPROVED |
| EXP-008 | Notifications are removed from Home and remain globally accessible from Header | APPROVED |
| EXP-009 | Communications is removed from Home and is global clinic-wide internal communication for authorized clinic accounts | APPROVED |
| EXP-010 | Quick Actions are removed from Home and remain in Header | APPROVED |
| EXP-011 | Patient Portal information is removed from Home | APPROVED |
| EXP-012 | Widgets/personalized widgets are deferred from the current Home work | APPROVED |
| EXP-013 | Header is a persistent global shell | APPROVED |
| EXP-014 | Chat is a compact surface over Communications | APPROVED |
| EXP-015 | Communications is not doctor-only; it serves the authorized clinic team | APPROVED |
| EXP-016 | Notifications remain distinct from Communications | APPROVED |
| EXP-017 | Agenda is the authoritative planning/availability domain | APPROVED |
| EXP-018 | Calendar is a visual/operational representation and not a second scheduling engine | APPROVED |
| EXP-019 | Patient Flow is a workflow concept, not an ordinary standalone sidebar domain | APPROVED |
| EXP-020 | Mobile is a focused work surface, not a shrunken desktop | APPROVED |
| EXP-021 | Personalization cannot grant authorization | APPROVED |
| EXP-022 | Home identity banner direction is approved; exact styling remains open | APPROVED |
| EXP-023 | Welcome message appears on login and disappears after first navigation | APPROVED |
| EXP-024 | Today's appointments must preserve relevant user/context when entering Agenda | APPROVED |
| EXP-025 | Repository documentation is the durable source of truth | APPROVED |
| EXP-026 | Product Owner alone approves product/visual decisions | APPROVED |
| EXP-027 | No related governance document closes before execution obligations are verified | APPROVED |
| EXP-028 | Inspect → Reuse → Extend → Create | APPROVED |

## 3. Explicit execution/open decisions

| ID | Open decision | Required closure evidence |
|---|---|---|
| OPEN-001 | Exact Login visual language: colors, typography, spacing, dimensions, brand treatment | Product Owner approval + runtime verification |
| OPEN-002 | Exact Header grouping, spacing, hierarchy, responsive visual treatment | Product Owner approval + runtime verification |
| OPEN-003 | Exact Home ordering and final visual hierarchy | Product Owner approval + runtime verification |
| OPEN-004 | Exact Home identity-banner visual treatment | Product Owner approval + runtime verification |
| OPEN-005 | Exact Home daily-awareness composition without scattered card-grid behavior | Product Owner approval + runtime verification |
| OPEN-006 | Home → Workspace transition treatment | Product Owner approval + runtime verification |
| OPEN-007 | Shared semantic visual tokens/primitives after foundation surfaces are tuned | Evidence + explicit approval |
| OPEN-008 | Desktop/tablet/mobile/RTL/LTR visual verification | Runtime evidence |
| OPEN-009 | Accessibility/focus/keyboard/touch-target verification | Objective test evidence |
| OPEN-010 | Visual regression coverage for foundation surfaces | Test/verification evidence |

## 4. Current verified findings / implementation defects

These are findings, not new product decisions:

1. Current Home implementation contains surfaces later explicitly removed from Home.
2. Today's appointments can route to generic Agenda and lose relevant context.
3. Current Header control grouping can visually read as one combined tool block even though the architecture distinguishes the functions.
4. Login is functionally clear but visually separate from the authenticated experience; it needs alignment, not shell duplication.
5. PR #123 is provisional/unmerged and is not the final visual foundation.
6. Existing Work Center semantics are independent; removing it from Home does not authorize redesigning Work Center.

## 5. Change-control rule

When implementation encounters a conflict:

1. Identify the exact Decision ID.
2. Do not silently reinterpret APPROVED decisions.
3. Do not silently close OPEN decisions.
4. Resolve technical conflicts without changing product meaning where possible.
5. Return product/visual judgment to the Product Owner when required.
6. Update this Registry only after explicit approval.

## 6. Closure rule

A decision may move to CLOSED only when:

1. approved intent is implemented,
2. relevant automated checks pass,
3. required runtime verification passes,
4. the result matches the approved decision,
5. evidence is recorded.

The Registry remains **ACTIVE** while any related execution decision is OPEN.
