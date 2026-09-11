# CORE SYSTEM — WORKSPACE × PATIENT FLOW ENGINEERING SPECIFICATION
## Final architectural-decision implementation contract

**Date:** 2026-09-01  
**Status:** ENGINEERING SPECIFICATION — READY FOR IMPLEMENTATION — RECONCILED 2026-09-11  
**Scope authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  
**Canonical surface interpretation:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`  
**Target branch:** `main`

> **2026-09-11 clarification:** This engineering specification must distinguish five separate concerns that older generic “Workspace” language could blur: **Role Workspace**, **My Workspace**, **Home**, **Sidebar**, and **Header**. The stable primary relationship is `Primary Role → Primary Work Context → Role Workspace`. Effective permissions are a separate axis and may expand authorized Sidebar Domains, Widgets and My Workspace content without redefining Role Workspace. Home is an independent global starting/awareness surface. Header is a persistent global access layer. This clarification does not redesign Clinical/Operational Workspace content.

---

## 0. PURPOSE

This document converts only the decisions contained in the 2026-09-01 Workspace / Patient Flow architecture decision document into a complete engineering contract.

It does **not** replace the system architecture, PJ Master Docs, Permission Engine, Queue architecture, Module/Domain contracts, or Clinic Admin architecture. Existing architecture remains authoritative unless a direct conflict with the 2026-09-01 decision document is proven and the conflict concerns a decision explicitly covered by that document.

No implementation item in this contract may be used to silently redesign unrelated parts of CORE SYSTEM.

---

## 1. NON-NEGOTIABLE SCOPE LOCK

The implementation MUST enforce the following and only the following architectural changes covered by the 2026-09-01 decision document and the 2026-09-11 global-surface clarification:

1. Workspace is a user work surface/environment, not a Role.
2. Workspace is not a permission set, capability, or Patient Flow owner.
3. `Clinical / Operational / Administration` are work classifications used by the system; they are not required to be displayed as the user's Role or identity.
4. The **Role Workspace** is the user's primary professional work environment associated with the Primary Role / Primary Work Context.
5. Additional/effective permissions do not redefine the Primary Role, Primary Work Context or Role Workspace.
6. A user may have authorized Domains/capabilities outside the primary work context; these may appear in Sidebar, Widgets and My Workspace without changing Role Workspace.
7. `My Workspace` is the user's personal working/presentation surface associated with the primary Role Workspace; it is not a second role and must not become a second authorization system.
8. Home is the independent post-login/global starting and awareness surface; it is not Role Workspace and not My Workspace.
9. Sidebar is complete authorized navigation, not a mirror of Role Workspace.
10. Header is persistent global access, not Home, My Workspace, or universal business execution.
11. Clinical Workspace remains the existing primary clinical working environment; this clarification does not redesign it.
12. Operational Workspace remains the existing primary operational working environment; this clarification does not redesign it.
13. Administration Workspace remains a separate administration work area and is not silently redesigned here.
14. Patient Flow remains the workflow/state owner. Workspace presents/enters Flow work but does not redefine it.
15. Queue/handoff behavior remains part of the existing Patient Flow architecture.
16. Module/Domain routes remain full Domains. Authorization controls access/actions; primary work context must not hide an otherwise authorized Domain.
17. Clinic Admin is not to be converted into an ordinary-user Workspace model.
18. Widgets never grant authorization.
19. Global Chat, when implemented, must reuse the existing Communications authority and must not create a parallel communication system.
20. Notifications remain separate from Communications and Follow-up.
21. My Settings remains a Sidebar destination.
22. No unrelated old architectural decision is considered cancelled by this contract.

---

## 2. SYSTEM MODEL

The required relationship is:

```text
User
  ├── Primary Role / function
  │      └── Primary Work Context / classification
  │              └── Role Workspace
  │
  ├── Effective permissions / capabilities
  │      └── Authorized Domains / Actions
  │              ├── Sidebar
  │              ├── Widgets
  │              └── My Workspace
  │
  ├── My Workspace presentation/personalization
  │
  ├── My Settings
  │
  └── Home
         └── global starting / awareness surface

Global Header
  ├── Search
  ├── Communications access
  ├── compact Chat over Communications
  ├── Notifications
  └── Quick Actions (initially Language + Logout)
```

The implementation MUST NOT collapse these concepts into one model.

### 2.1 Ownership rules

| Concern | Owner |
|---|---|
| Patient journey semantics | PJ / Patient Journey architecture |
| Patient Flow state machine | Queue / Patient Flow domain |
| User function | Role architecture |
| Primary work context | Workspace/Patient Flow classification model |
| Authorization | Permission Engine |
| Role Workspace presentation | Workspace/UI architecture |
| Personal widget arrangement | My Workspace presentation state |
| Global entry/awareness | Home |
| Authorized navigation | Sidebar/navigation architecture |
| Global access controls | Header/shell |
| Domain business logic | Individual Module/Domain |
| Clinic administration | Clinic Admin / tenant administration architecture |

---

## 3. USER ENTRY AND GLOBAL SHELL

After successful authentication, ordinary-user shell behavior MUST expose:

1. Persistent Header/global access.
2. Home as the landing surface.
3. Sidebar containing, in the approved conceptual order:
   - Home
   - Workspace
   - My Workspace
   - authorized Modules/Domains
   - My Settings
4. The user's primary Role Workspace when Workspace is selected.
5. Existing RTL/LTR/i18n architecture.

### 3.1 Home

Home is a global starting/awareness surface. It is not the user's Role Workspace or My Workspace.

It may consume authoritative daily information and lightweight global utilities. It must not become the full Patient Flow controller or a duplicate Work Center/Role Workspace.

### 3.2 Header

Header is persistent global access. It remains available across authenticated surfaces.

The approved conceptual functions are:

- system identity/branding;
- existing Global Search;
- Communications access;
- compact Chat over Communications;
- Notifications;
- Quick Actions such as Language and Logout.

My Settings remains in Sidebar.

---

## 4. ROLE WORKSPACE CONTRACT

### 4.1 Workspace semantics

The user's Role Workspace is the primary professional working environment for the user's Primary Role / Primary Work Context.

It is not:

- the user's complete permission set;
- the complete Sidebar;
- Home;
- My Workspace;
- a security boundary.

### 4.2 Workspace stability

The Role Workspace remains stable while additional permissions change.

Example:

```text
Doctor
Primary Work Context = Clinical
Role Workspace = Clinical

Additional permissions:
Financial Read
Operational capability
Administration capability
Reports Read

RESULT:
Role Workspace remains Clinical.
```

A different Role Workspace requires an intentional change in Primary Work Context/assignment, not a permission override alone.

### 4.3 Workspace selection

The implementation must preserve the existing workspace membership/default model if present. The current/default primary Role Workspace must not be inferred from total permissions merely because permissions are broad.

### 4.4 Workspace must not infer authorization

The following are prohibited:

```text
Role → automatic full Workspace authorization
Workspace → automatic Domain authorization
Primary classification → hide unrelated authorized Domain
Widget → grant permission
Patient Flow state → change Role Workspace
Additional permission → change Role Workspace
```

---

## 5. MY WORKSPACE CONTRACT

`My Workspace` is the user's personal working/presentation surface associated with the primary Role Workspace.

It MUST:

- start with system-provided default widgets;
- allow the user to add/remove/hide/reorder supported widgets according to the existing personalization architecture;
- allow authorized cross-context tools/widgets where supported;
- preserve authorization boundaries;
- preserve tenant boundaries;
- preserve the distinction between Home and Role Workspace;
- preserve the distinction between presentation and business-domain ownership.

It MUST NOT:

- create permissions;
- create a new Role;
- change Primary Work Context;
- change Role Workspace merely because widgets/permissions changed;
- change Patient Flow ownership;
- hide an authorized Domain from Sidebar;
- become a substitute for the full Domain route;
- become Home.

---

## 6. SIDEBAR / DOMAIN CONTRACT

Sidebar visibility for Modules/Domains MUST be authorization-driven.

Primary work classification is not a visibility filter for authorized Domains.

Example:

```text
Primary work context: Clinical
Authorized domains: Patients, Agenda, Billing(read), Reports(read)

Sidebar:
Home
Workspace
My Workspace
Patients
Agenda
Billing
Reports
My Settings
```

The user may see Billing and Reports even though they are outside the primary clinical context. Their available actions remain permission-controlled.

No `My Billing`, `My Reports`, `My Agenda`, or similar classification-specific duplicate Domain route may be introduced.

---

## 7. CLINICAL WORKSPACE CONTRACT

Clinical Workspace is the clinical user's primary professional work environment.

This reconciliation does not authorize broadening it simply because the user gained additional permissions elsewhere. Cross-domain capabilities should be exposed through Sidebar/My Workspace/Widgets or the full owning Domain as appropriate.

Patient Flow, Visit/session, clinical context, room/procedure information and effective permissions continue to determine which clinical work is actionable inside the existing clinical environment.

The existing Clinical Workspace remains an authoritative asset and must be reused/extended only where required by its own approved domain workflow.

---

## 8. OPERATIONAL WORKSPACE CONTRACT

Operational Workspace is the operational user's primary professional work environment.

This reconciliation does not authorize broadening it because the user gained additional permissions elsewhere.

The existing reception/operational workflow remains authoritative.

---

## 9. PATIENT FLOW / QUEUE INTEGRATION CONTRACT

Workspace actions must call the existing Patient Flow transition authority rather than maintaining a second state machine.

The canonical states currently represented in execution are:

- `waiting`
- `in_consultation`
- `pending_close`
- `completed`
- `cancelled`
- `no_show`

Clinical completion means completion of the current clinical work/handoff, not automatic closure of the entire visit unless the authoritative visit workflow determines it is complete.

No UI-only state mutation is permitted.

---

## 10. VISIT / ROOM / PROCEDURE INTEGRATION BOUNDARY

The Workspace layer MUST NOT create duplicate representations of:

- Visit
- Room
- Procedure
- Service
- Treatment Plan
- Medical Photos
- Follow-up
- Agenda
- Patient record

The Workspace layer consumes authoritative data from those domains.

---

## 11. PERMISSION CONTRACT

All Workspace, My Workspace, Widget, Sidebar and Domain actions MUST resolve effective permissions through the existing Permission Engine.

Authorization must be evaluated server-side for mutations.

Client visibility is convenience only; it is never security.

The existing permission naming convention must remain `resource:action`.

No second permission engine, workspace ACL, widget ACL, or classification ACL may be created.

---

## 12. GLOBAL SEARCH / HEADER CONTRACT

Global Search remains a global Header capability and must reuse the existing infrastructure. It must be authorization-constrained and tenant-safe.

Compact Chat and Communications access must reuse the existing Communications domain and permissions.

Notifications remain a separate notification/attention capability.

Quick Actions must not become a generic business launcher. Initial scope is Language + Logout.

Logout remains easily accessible for shared clinic workstations because user accountability depends on separate authenticated sessions.

---

## 13. CLINIC ADMIN BOUNDARY

Clinic Admin is explicitly outside the ordinary-user Workspace presentation contract.

The implementation must not reduce Clinic Admin to an ordinary user with every permission, and must preserve tenant administration capabilities.

---

## 14. DATA / DATABASE IMPACT

Before adding any schema object, implementation must inspect existing:

- workspace membership/default data;
- user/tenant relations;
- Role and permission tables;
- Patient Flow session tables;
- visit/session references;
- agenda/room references;
- widget/presentation state;
- Communications data;
- notification data;
- audit tables.

Expected principle:

```text
Reuse → Extend → Create only if genuinely required
```

No duplicate workspace, role, permission, Patient Flow, Communications or widget authorization tables may be created.

---

## 15. REQUIRED IMPLEMENTATION / VALIDATION MAP

The implementation investigation MUST cover:

### Core/UI
- `src/app/(dashboard)/**`
- dashboard layout/shell
- navigation registry
- Sidebar
- Home
- Header
- Role Workspace surfaces
- My Workspace surfaces
- widget registry/renderer/persistence

### Global services
- Global Search
- Communications
- Notifications
- authentication/session/logout
- i18n/language controls
- Quick Actions

### Queue/Patient Flow
- `src/domain/queue/**`
- transition actions
- queue engine/types
- Patient Flow UI
- locks/audit/revalidation

### Visit/clinical
- `src/domain/visit/**`
- Clinical Workspace
- patient chart entry points
- procedure actions

### Authorization
- `src/core/permissions/**`
- route guards
- server actions
- role/permission resolution

### Data
- workspace/user/role/permission/session/visit migrations
- RLS policies
- audit tables
- generated database types

### Documentation
- root architecture documents
- PJ documents
- UX/IA documents
- implementation contracts
- stage validation documents
- handoffs/changelogs
- archived implementation packages where they contain still-valid evidence
- canonical terminology/reconciliation documents

---

## 16. ACCEPTANCE TESTS

### A. Ordinary user shell
- Login lands on Home.
- Sidebar contains Home, Workspace, My Workspace, authorized Domains, My Settings.
- Header remains persistent.
- No unauthorized Domain is visible.
- An authorized Domain outside primary classification remains visible.

### B. Role Workspace stability
- Doctor/Clinical user receives Clinical Role Workspace.
- Additional Financial/Operational/Administration/Reporting permissions do not change the Role Workspace.
- An intentional primary-context change does change the Role Workspace according to the authoritative assignment model.

### C. My Workspace
- Defaults exist.
- User can personalize supported Widgets.
- Authorized cross-context Widget/tool can appear where supported.
- Personalization does not grant/revoke authorization.
- Personalization does not alter Role Workspace.

### D. Clinical workflow
- Existing clinical workflow remains intact.
- Waiting patient becomes available through the appropriate Patient Flow path.
- Clinical work is performed under existing authorization/lock rules.
- Clinical close produces pending_close where the approved flow requires it.

### E. Sidebar
- Full authorized Domains remain visible independent of primary work classification.
- Artificial `My <Domain>` duplicates do not appear.

### F. Header
- Global Search remains functional.
- Communications access is distinct from Chat.
- Chat uses existing Communications authority.
- Notifications remain separate.
- Quick Actions include Language and Logout.
- Logout works correctly on shared workstations.

### G. Clinic Admin
- Clinic Admin retains administration capabilities.
- Ordinary-user surface simplification does not remove tenant administration.

### H. Security
- Cross-tenant access is rejected.
- Unauthorized mutations are rejected server-side.
- Client-side surface selection cannot bypass authorization.

---

## 17. DEFINITION OF DONE

This specification is complete only when:

1. every requirement is mapped to repository locations;
2. every required change has an implementation plan;
3. all existing dependencies are preserved or deliberately migrated;
4. database/RLS paths are validated;
5. Home is distinct from Role Workspace and My Workspace;
6. Role Workspace remains stable under permission expansion;
7. Sidebar remains complete authorized navigation;
8. My Workspace remains personal presentation and personalization;
9. Header remains global access;
10. Communications/Chat/Notifications remain properly separated;
11. Patient Flow remains canonical;
12. Clinical and Operational Workspaces remain their established work environments;
13. Clinic Admin remains functional;
14. all acceptance scenarios pass;
15. runtime evidence matches the implementation;
16. documentation matches the final state.

---

## 18. IMPLEMENTATION AUTHORITY

The implementation team must treat this document as the engineering contract for the 2026-09-01 Workspace/Patient Flow decisions, interpreted through the 2026-09-11 global-surface reconciliation.

If implementation discovers a conflict outside the explicit scope of those decisions, it must not silently resolve it. It must record the conflict, preserve the existing behavior, and escalate for an architectural decision.

**End of Engineering Specification.**
