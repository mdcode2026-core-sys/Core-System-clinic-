# CORE SYSTEM — Workspace × Patient Flow
## Architecture ↔ Engineering Decision Boundary
### 2026-09-01

**Status:** FINAL BOUNDARY / PRE-CODE — RECONCILED 2026-09-11
**Authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`
**Canonical surface interpretation:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

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
- The **Role Workspace** is the user's primary professional work environment associated with the user's Primary Role / Primary Work Context.
- Additional permissions do not redefine the Role, Primary Work Context or Role Workspace.
- My Workspace is a personal surface inside the primary Workspace context.
- Home is separate from Workspace and My Workspace.
- Home is the ordinary-user post-login landing / global starting and awareness surface.
- Global Search is a system-wide capability in the header.
- Sidebar Domains are authorization-driven and are not suppressed by primary classification.
- Clinical / Operational / Administration are internal work classifications, not mandatory user-facing Workspace names.
- Clinic Admin is not an ordinary user.
- Patient Flow remains the workflow/state authority.
- Widgets do not grant authorization.
- Header is a persistent global access layer, not a second Home, My Workspace, or universal work dashboard.
- Communications and Chat are distinct presentation surfaces over the existing Communications authority.
- Notifications remain separate from Communications and Follow-up.
- My Settings remains a Sidebar destination.

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
- adapters between Workspace and authoritative Domains;
- Header popover/compact-panel implementation;
- compact Chat presentation over existing Communications services;
- Quick Actions presentation and menu mechanics.

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
- It is independent of the user's Role Workspace; it is not selected by Role and is not a role dashboard.
- It provides general/global daily context and awareness.
- Home may include lightweight global utilities and information in addition to clinic daily context when retained by the final product design.
- Candidate/approved global utility classes include calendar/date-oriented utility, weather/ambient information from an external service, user-selected shortcuts, optional system-managed/partner content, and summarized actionable information that routes to authoritative work destinations.
- Home may provide lightweight actions such as creating a reminder/event or initiating a request, while the authoritative workflow remains owned by its Domain.
- Home may summarize appointment/waiting/work/communication/portal information, but it does not own those workflows.
- Home does not own Patient Flow transitions and is not a replacement for Workspace.

The architecture does not freeze an immutable visual list of every possible future Home card. That omission is **not a deferred architectural decision**. Concrete card/widget composition is engineering/product-detail work inside the approved boundary.

Engineering may not remove the approved minimum daily information categories or move operational/clinical workflow ownership into Home merely for convenience.

## 4. Global Search boundary

The architectural decision for Global Search is COMPLETE.

Mandatory architectural meaning:
- Search is global/system-wide.
- Search is presented in the authenticated header.
- Search is not a Home Widget.
- Search is not Workspace.
- Results are authorization-constrained.
- Authorized records may navigate to their permitted context.

## 5. Role Workspace boundary

The Role Workspace is the user's **primary professional work environment**.

The canonical relation is:

```text
Primary Role / Job Function
        ↓
Primary Work Context / Classification
        ↓
Role Workspace
```

Actual/effective permissions are a separate axis:

```text
Effective Permissions
        ↓
Authorized Domains / Capabilities / Actions
        ├── Sidebar
        ├── Widgets
        └── My Workspace
```

Granting additional permissions must not recalculate or replace the user's Role Workspace.

Example:

```text
Doctor
Primary Work Context = Clinical
Role Workspace = Clinical

+ Financial read
+ Operational permission
+ Administration read
+ Reports read

Role Workspace remains Clinical.
```

A different Role Workspace requires an intentional change to the user's primary work context/assignment, not merely an additional permission grant.

## 6. My Workspace boundary

My Workspace is the personal working/presentation surface associated with the user's assigned/default Role Workspace.

It is not a second Role Workspace, not a Role selector, and not an authorization mechanism.

It may contain authorized tools/widgets from outside the user's primary work classification. Such cross-classification content does not change the primary Role Workspace.

Personalization affects presentation only.

## 7. Sidebar boundary

The Sidebar is authorized navigation, not a representation of the user's Role Workspace.

Primary work classification must not be used as a visibility filter for an otherwise authorized Domain.

Example:

```text
Primary Work Context: Clinical
Authorized: Patients, Agenda, Financial(read), Reports(read)

Sidebar may show:
Patients
Agenda
Financial
Reports
```

The fact that a Domain is outside the primary Role Workspace does not make it a different Workspace.

`My Financial`, `My Agenda`, or similar artificial duplicate labels must not be introduced for this purpose.

## 8. Header boundary

The Header is a persistent global access layer.

It is separate from Home, My Workspace and Role Workspace.

The current approved conceptual Header functions are:

- system identity/branding;
- existing Global Search;
- Communications access;
- separate compact Chat access backed by Communications;
- Notifications access;
- Quick Actions for global interface/account actions such as Language and Logout.

The Header must not become a universal business-action launcher or second Workspace.

### 8.1 Communications / Chat

Communications is the authoritative full communication domain.

Chat is a compact Messenger-style surface that reuses the Communications authority.

No parallel chat database, conversation engine or authorization model may be introduced.

Communications and Chat are different interaction intents:

- Communications → broader communication activity/domain.
- Chat → immediate conversation.

### 8.2 Notifications

Notifications are separate from Communications and operational Follow-up.

The Header provides global access to Notifications.

Home may summarize important attention state but does not become the notification system.

### 8.3 Quick Actions

Quick Actions are a compact global interface/account action surface, not a generic place for all business actions.

Initial scope:

- Language
- Logout

Logout must remain quickly accessible because clinic devices may be shared by multiple users and user attribution must remain correct.

My Settings remains in the Sidebar.

## 9. UI completeness rule

Small visible details are not automatically "later".

For every approved visible element, engineering must identify:

`surface → content → source → owner → permission → state → action → destination → integration → persistence → i18n → responsive → acceptance test`.

If an item is required by the approved scenario, it is a minimum acceptance requirement even if the architecture document describes it as an example.

## 10. No architectural drift

Engineering must not:

- turn Workspace into Role;
- let additional permissions redefine the Role Workspace;
- expose internal classification as a user identity merely for implementation convenience;
- use primary classification to hide authorized Domains;
- make My Workspace a second authorization layer;
- make Home a workflow controller;
- make Search bypass authorization;
- create duplicate Domain business logic;
- create a second Patient Flow state machine;
- create a parallel Chat/Communications system;
- turn Header into a universal work dashboard;
- move My Settings into Header merely for visual convenience;
- simplify Clinic Admin by forcing it into the ordinary-user model;
- delete unrelated legacy documentation/code merely because one portion conflicts.

## 11. Reconciliation rule

When an older document or implementation contains both conflicting and non-conflicting material:

1. isolate the exact conflict;
2. apply the 2026-09-01 decision and 2026-09-11 canonical surface clarification only to that conflict;
3. preserve all non-conflicting material;
4. migrate/remove only proven duplicate or superseded material;
5. record the reason and affected artifact.

## 12. Final status

After this boundary is applied:

- **Approved architectural decisions in this scope:** not deferred.
- **Engineering mechanisms:** may remain to be selected until implementation planning, but they must stay inside the approved architecture.
- **Unresolved architecture:** only a genuine semantic/product choice requiring owner approval; it must never be disguised as an engineering detail.
- **Implementation authorization:** this document does not itself authorize source/database/runtime changes.

**End of Architecture ↔ Engineering Decision Boundary.**
