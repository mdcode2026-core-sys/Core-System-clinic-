# CORE SYSTEM — Adaptive Hybrid Experience Reconciliation
## 2026-09-14

**Stage:** VERIFY → PLAN → EXECUTION BASELINE
**Status:** OPEN — FOUNDATION RECORDED, EXECUTION NOT CLOSED
**Branch:** `docs/ux-experience-constitution-work-contract-2026-09-14`
**Authority:** Product Owner-approved Experience Constitution + Decision Registry

## 1. Purpose

This record captures the current reconciliation of the CORE SYSTEM experience model and now remains open until the resulting execution decisions are implemented and objectively verified.

The previous wording that treated the reconciliation itself as complete is superseded by this status update. The investigation findings are established; the implementation work is not.

Authoritative governance records:

- `docs/CORE-SYSTEM-EXPERIENCE-CONSTITUTION-AND-GOVERNANCE-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-DECISION-REGISTRY-2026-09-14.md`
- `docs/CORE-SYSTEM-INTEGRATED-EXPERIENCE-WORK-CONTRACT-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-EXECUTION-GATE-2026-09-14.md`

## 2. Approved Adaptive Hybrid Experience Model

The Product Owner approved one adaptive experience system:

- Horizon = Foundation
- Vertex = Work Engine
- Zenith = Experience Layer

This is one Experience System, not three visual designs.

Governing principle:

> **Information Density must follow Work Complexity.**

Plain-language model:

> **Horizon controls simplicity. Vertex provides capability. Zenith adapts the experience.**

## 3. Foundation Surface Decisions

The visual foundation is established through three surfaces:

1. Login
2. Header
3. Home

These surfaces must be tuned as one experience foundation before their language is propagated broadly.

This does **not** mean their final visual details are already approved. Exact colors, typography, spacing, dimensions, ordering, grouping, and component styling remain execution decisions unless explicitly listed as approved in the Decision Registry.

## 4. Login findings

Current Login is functionally clear and structurally separate from the authenticated shell.

Required direction:

- Horizon-dominant.
- Simple, calm, clear, confident.
- Visually aligned with the authenticated product language without importing Header/Sidebar into authentication.
- Authentication authority and existing auth behavior remain unchanged.

**Execution status: OPEN.**

## 5. Header findings

The existing Header architecture is aligned with the global-shell contract.

Canonical conceptual order:

`Brand / Home | Global Search | Communications | Chat | Notifications | Quick Actions`

Key findings:

- Header remains persistent and global.
- Search, Communications, Chat, Notifications and Quick Actions reuse their authoritative systems.
- Chat is a compact surface over Communications.
- Communications is clinic-wide internal communication for authorized clinic accounts, not doctor-only communication.
- Current control grouping can visually read as one combined tool block even though the architecture distinguishes the functions. This is a visual refinement issue, not a reason to create separate engines.

**Execution status: OPEN.**

## 6. Home findings and approved removals

Home is the global starting/awareness surface and must be **Simple + Contextual**.

Approved removals from Home:

- Notifications
- Communications
- Work Center
- Quick Actions
- Patient Portal information

Widgets/personalized widgets remain deferred from the current Home execution.

### Work Center decision

The removal of Work Center from Home is an explicit Product Owner decision.

It has **no direct conceptual relationship to redesigning Home's purpose** and must not be used to reopen or redesign Work Center.

### Current Home defect

Today's appointments currently route to a generic Agenda destination and can lose the relevant user/context. This is an implementation defect.

The repair must preserve Agenda as the authoritative scheduling/planning domain and must not create a second scheduling engine.

**Execution status: OPEN.**

## 7. Surface boundaries protected by the reconciliation

- Home ≠ My Workspace.
- Home ≠ Role Workspace.
- Home ≠ Work Center.
- Home ≠ Communications.
- Header ≠ Home.
- Header ≠ dashboard.
- Communications ≠ Chat.
- Chat ≠ second messaging engine.
- Notifications ≠ Communications.
- Agenda ≠ Calendar presentation only; Agenda remains authoritative planning/availability.
- Calendar ≠ second scheduling engine.
- Patient Flow ≠ ordinary standalone sidebar domain.

## 8. Mobile / responsive direction

Mobile is a focused work surface, not a shrunken desktop page.

Desktop/tablet may use more expansive presentation when justified by complexity, while mobile must deliberately transform presentation and preserve authorized capability.

RTL/LTR, accessibility, focus, keyboard, touch-target, overlay, and state behavior remain part of the execution contract.

**Execution status: OPEN pending runtime verification.**

## 9. PR #123 reconciliation

PR #123 remains a provisional/unmerged implementation artifact and must not be treated as the final visual foundation.

Its useful architectural evidence may be reused, but the final implementation must be judged against the current Constitution, Decision Registry, Work Contract, and Execution Gate.

The following are not silently promoted from PR #123 into approved visual decisions:

- exact Home ordering,
- exact card/container language,
- exact visual tokens,
- final Header grouping,
- final responsive composition.

## 10. Verification requirements

Before any closure claim, verify:

- repository implementation against Decision Registry,
- automated checks,
- runtime desktop/tablet/mobile behavior,
- RTL/LTR behavior,
- accessibility behavior,
- Login/Header/Home visual alignment,
- Home → Workspace transition,
- appointment context routing,
- absence of duplicate engines,
- no unauthorized semantic changes.

Evidence must be recorded.

## 11. Closure state

This document is intentionally **NOT CLOSED**.

The investigation findings are established and protected. The execution decisions remain open until implemented, reviewed, and verified.

No future conversation may restart the investigation as if these established findings did not exist. Any new work must begin from the governance records listed in Section 1 and update them when an explicit new decision is made.
