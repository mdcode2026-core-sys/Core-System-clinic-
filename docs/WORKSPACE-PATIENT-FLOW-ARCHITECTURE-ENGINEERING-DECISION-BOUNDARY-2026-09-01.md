# CORE SYSTEM — Workspace × Patient Flow
## Architecture ↔ Engineering Decision Boundary
### 2026-09-01

**Status:** FINAL BOUNDARY / PRE-CODE
**Authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`

## 1. Purpose

This document removes ambiguity between an approved architectural decision and the engineering mechanism used to implement it.

It does not create or change an architectural decision. It is a control document for the engineering specification and execution plan.

## 2. Binding classification

Every item in the Workspace / Patient Flow scope MUST belong to exactly one of these classes:

### A. Approved architectural requirement
Mandatory. Engineering must implement it without changing its meaning.

Examples:
- Workspace is not Role.
- Workspace is not authorization.
- Workspace is a work environment.
- My Workspace is a personal surface inside Workspace.
- Home is separate from Workspace.
- Home is the ordinary-user post-login landing surface.
- Global Search is a system-wide capability in the header.
- Sidebar Domains are authorization-driven and are not suppressed by primary classification.
- Clinical / Operational / Administration are internal work classifications, not mandatory user-facing Workspace names.
- Clinic Admin is not an ordinary user.
- Patient Flow remains the workflow/state authority.
- Widgets do not grant authorization.

### B. Engineering decision
Permitted only when it implements A without changing its meaning.

Examples:
- component boundaries;
- service/API contracts;
- query/index mechanism for Search;
- ranking and matching implementation;
- refresh/invalidation strategy;
- persistence representation for presentation state;
- responsive breakpoints;
- loading/empty/error implementations;
- adapters between Workspace and authoritative Domains.

Engineering decisions are not new product or architecture decisions.

### C. Existing unrelated architecture
Preserve it. Do not redesign it merely because this work touches an adjacent surface.

If a dependency is discovered, document the exact dependency and change only what is necessary to satisfy A.

### D. True unresolved architectural choice
If a requirement cannot be implemented without choosing between two materially different product/architecture meanings, STOP and return that exact choice to the system owner.

No such choice may be silently made by engineering.

## 3. Home boundary

The architectural decision for Home is COMPLETE.

Mandatory architectural meaning:
- Home exists.
- It is the ordinary-user landing surface after login.
- It is separate from Workspace and My Workspace.
- It provides general daily clinic context.
- Its approved minimum information categories include the daily appointment context, waiting/activity context, reminders, notifications, internal communications, Patient Portal information, Work Center information and similar general daily context.
- Home does not own Patient Flow transitions and is not a replacement for Workspace.

The architecture does not freeze an immutable visual list of every possible future Home card. That omission is **not a deferred architectural decision**. Concrete card composition is engineering/product-detail work inside the approved boundary.

Engineering may not remove the approved minimum categories or move operational/clinical workflow ownership into Home.

## 4. Global Search boundary

The architectural decision for Global Search is COMPLETE.

Mandatory architectural meaning:
- Search is global/system-wide.
- Search is presented in the authenticated header.
- Search is not a Home Widget.
- Search is not Workspace.
- Results are authorization-constrained.
- Authorized records may navigate to their permitted context.

The following are explicitly engineering decisions, not unresolved architecture:
- adapters;
- query contract;
- indexing/search mechanism;
- ranking;
- matching;
- debounce/request behavior;
- result grouping/type presentation;
- context preservation;
- destination routing;
- loading/empty/error states;
- supported Arabic/English matching behavior;
- performance/caching;
- data-layer privacy enforcement.

Engineering must resolve these before code implementation. Choosing them does not require a new architectural approval unless the choice changes the meaning of Global Search itself.

## 5. UI completeness rule

Small visible details are not automatically "later".

For every approved visible element, engineering must identify:

`surface → content → source → owner → permission → state → action → destination → integration → persistence → i18n → responsive → acceptance test`.

If an item is required by the approved scenario, it is a minimum acceptance requirement even if the architecture document describes it as an example.

## 6. No architectural drift

Engineering must not:

- turn Workspace into Role;
- expose internal classification as a user identity merely for implementation convenience;
- use primary classification to hide authorized Domains;
- make My Workspace a second authorization layer;
- make Home a workflow controller;
- make Search bypass authorization;
- create duplicate Domain business logic;
- create a second Patient Flow state machine;
- simplify Clinic Admin by forcing it into the ordinary-user model;
- delete unrelated legacy documentation/code merely because one portion conflicts.

## 7. Reconciliation rule

When an older document or implementation contains both conflicting and non-conflicting material:

1. isolate the exact conflict;
2. apply the 2026-09-01 decision only to that conflict;
3. preserve all non-conflicting material;
4. migrate/remove only proven duplicate or superseded material;
5. record the reason and affected artifact.

## 8. Final status

After this boundary is applied:

- **Approved architectural decisions in this scope:** not deferred.
- **Engineering mechanisms:** may remain to be selected until implementation planning, but they must stay inside the approved architecture.
- **Unresolved architecture:** only a genuine semantic/product choice requiring owner approval; it must never be disguised as an engineering detail.
- **Implementation authorization:** this document does not itself authorize source/database/runtime changes.

**End of Architecture ↔ Engineering Decision Boundary.**
