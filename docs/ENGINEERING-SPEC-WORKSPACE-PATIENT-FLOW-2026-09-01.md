# CORE SYSTEM — WORKSPACE × PATIENT FLOW ENGINEERING SPECIFICATION
## Final architectural-decision implementation contract

**Date:** 2026-09-01  
**Status:** ENGINEERING SPECIFICATION — READY FOR IMPLEMENTATION  
**Scope authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`  
**Target branch:** `main`

---

## 0. PURPOSE

This document converts only the decisions contained in the 2026-09-01 Workspace / Patient Flow architecture decision document into a complete engineering contract.

It does **not** replace the system architecture, PJ Master Docs, Permission Engine, Queue architecture, Module/Domain contracts, or Clinic Admin architecture. Existing architecture remains authoritative unless a direct conflict with the 2026-09-01 decision document is proven and the conflict concerns a decision explicitly covered by that document.

No implementation item in this contract may be used to silently redesign unrelated parts of CORE SYSTEM.

---

## 1. NON-NEGOTIABLE SCOPE LOCK

The implementation MUST enforce the following and only the following architectural changes covered by the 2026-09-01 decision document:

1. Workspace is a user work surface/environment, not a Role.
2. Workspace is not a permission set, capability, or Patient Flow owner.
3. `Clinical / Operational / Administration` are work classifications used by the system; they are not required to be displayed as the user's Workspace name.
4. Ordinary users receive a primary/default work context while authorized Domains outside that context remain visible in the Sidebar normally.
5. `My Workspace` is the user's personalized surface within the assigned/default Workspace; it is not a second role and must not become a second authorization system.
6. Home is the clinic-system landing surface and is distinct from Workspace and My Workspace.
7. Clinical Workspace is the evolution of the previous provider/doctor board into a clinical-team work surface. It must not hard-code the identity "doctor" as the owner of all clinical work.
8. Patient Flow remains the workflow/state owner. Workspace exposes the appropriate work surface; it does not redefine the patient journey.
9. Queue/handoff behavior remains part of the existing Patient Flow architecture. Clinical work ends in the defined handoff state and returns responsibility to the operational/reception workflow; it does not close the entire visit merely because clinical work ended.
10. Module/Domain routes remain full Domains. Authorization controls access and actions; primary work classification must not hide an otherwise authorized Domain.
11. Clinic Admin is not to be converted into an ordinary-user Workspace model.
12. Widgets never grant authorization. Their visibility/actions derive from effective authorization and the relevant work surface.
13. Examples in the decision document that define required baseline behavior are minimum requirements, not optional examples.
14. No unrelated old architectural decision is considered cancelled by this contract.

---

## 2. SYSTEM MODEL

The required relationship is:

```text
User
  ├── Role / function
  ├── Effective permissions / capabilities
  ├── Primary/default work context
  └── Workspace presentation
         └── My Workspace personalization

Patient Journey
  └── Patient Flow
        ├── operational work
        ├── clinical work
        ├── handoffs
        └── completion states

Modules / Domains
  └── independent full-domain surfaces
      └── access/actions governed by authorization
```

The implementation MUST NOT collapse these concepts into one model.

### 2.1 Ownership rules

| Concern | Owner |
|---|---|
| Patient journey semantics | PJ / Patient Journey architecture |
| Patient Flow state machine | Queue / Patient Flow domain |
| User function | Role architecture |
| Authorization | Permission Engine |
| Workspace presentation | Workspace/UI architecture |
| Personal widget arrangement | My Workspace presentation state |
| Domain business logic | Individual Module/Domain |
| Clinic administration | Clinic Admin / tenant administration architecture |

---

## 3. USER ENTRY AND GLOBAL SHELL

After successful authentication, the ordinary-user shell MUST expose:

1. Header/search area.
2. Language control.
3. User identity/presentation name.
4. System/clinic branding as already defined by the existing shell architecture.
5. Home as the landing surface.
6. Sidebar containing, in the approved conceptual order:
   - Home
   - Workspace
   - My Workspace
   - authorized Modules/Domains
   - My Settings

The implementation must preserve the existing RTL/LTR/i18n architecture.

### 3.1 Home

Home is a clinic-system daily-information surface, not a replacement for Workspace.

The Home engineering contract must support daily operational information from authoritative system sources, such as:

- current waiting count where available;
- today's appointments;
- actionable reminders/notifications relevant to the user;
- clinic-wide information the user is authorized to see;
- optional non-clinical utility widgets already approved by the product direction.

Home must not become a second Patient Flow controller.

---

## 4. WORKSPACE CONTRACT

### 4.1 Workspace semantics

The visible concept is simply **Workspace** for ordinary users.

Internal classification may distinguish operational, clinical, and administrative work contexts, but the UI must not force a user-facing label such as "Clinical Workspace" solely to explain the classification.

### 4.2 Workspace selection

The implementation must preserve the existing workspace membership/default model if present. `My Workspace` must not be interpreted as an additional workspace membership.

The engineering layer must resolve a deterministic current/default work surface for the ordinary user and then evaluate the content of that surface against effective authorization and Patient Flow state.

### 4.3 Workspace must not infer authorization

The following are prohibited:

```text
Role → automatic full Workspace authorization
Workspace → automatic Domain authorization
Classification → hide unrelated authorized Domain
Widget → grant permission
Patient Flow state → change Role
```

---

## 5. MY WORKSPACE CONTRACT

`My Workspace` is a personalized presentation surface inside the user's assigned/default Workspace.

It MUST:

- start with system-provided default widgets;
- allow the user to add/remove/hide/reorder supported widgets according to the existing personalization architecture;
- preserve authorization boundaries;
- preserve tenant boundaries;
- preserve the distinction between Home and Workspace;
- preserve the distinction between presentation and business-domain ownership.

It MUST NOT:

- create permissions;
- create a new Role;
- change Patient Flow ownership;
- hide an authorized Domain from the Sidebar;
- become a substitute for the full Domain route.

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

No "My Billing", "My Reports", or classification-specific duplicate Domain route may be introduced to solve this.

---

## 7. CLINICAL WORKSPACE CONTRACT

Clinical Workspace is the successor to the previous provider/doctor board pattern.

It MUST be capable of serving different authorized clinical team members without hard-coding the clinical work surface to the job title "doctor".

The clinical work surface must be derived from:

```text
current Patient Flow state
+
current visit/session context
+
work required at that point in the workflow
+
room/visit/procedure context where those domains provide it
+
effective permissions/capabilities
```

The details of room allocation, procedure execution, medical service definitions, treatment plan, photos, and other clinical sub-workflows remain owned by their respective domains. This contract defines the integration surface only.

### 7.1 Clinical work lifecycle

The existing system-level lifecycle remains authoritative:

```text
waiting
   ↓
in_consultation
   ↓
pending_close
   ↓
operational/reception completion
   ↓
completed
```

Clinical completion means completion of the current clinical work/handoff, not automatic closure of the entire visit unless the existing visit workflow explicitly determines that no further operational work is required.

---

## 8. PATIENT FLOW INTEGRATION CONTRACT

Workspace actions must call the existing Patient Flow transition authority rather than maintaining a second state machine.

The canonical states currently represented in execution are:

- `waiting`
- `in_consultation`
- `pending_close`
- `completed`
- `cancelled`
- `no_show`

The current implementation already centralizes transition validation in the queue engine and uses permission checks before state changes. This pattern MUST be preserved and extended rather than duplicated.

### 8.1 Handoff

The clinical handoff must:

1. validate the current state;
2. validate the user's effective authority;
3. validate clinical ownership/lock rules where required;
4. record the transition;
5. release the clinical lock when the clinical work is handed off;
6. make the patient available to the next operational/reception step;
7. revalidate all affected work surfaces.

No UI-only status mutation is permitted.

---

## 9. VISIT / ROOM / PROCEDURE INTEGRATION BOUNDARY

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

When a future module/domain workflow introduces a new clinical step, the Workspace must expose it through an integration contract rather than embedding its business logic in the Workspace shell.

---

## 10. PERMISSION CONTRACT

All Workspace and Domain actions MUST resolve effective permissions through the existing Permission Engine.

Authorization must be evaluated server-side for mutations.

Client visibility is convenience only; it is never security.

The existing permission naming convention must remain `resource:action`.

No second permission engine, workspace-specific ACL, widget ACL, or classification ACL may be created.

---

## 11. CLINIC ADMIN BOUNDARY

Clinic Admin is explicitly outside the ordinary-user Workspace presentation contract.

The implementation must not:

- reduce Clinic Admin to an ordinary user with every permission;
- force Clinic Admin into the ordinary user's Home → Workspace → My Workspace mental model;
- delete existing tenant-administration capabilities merely to simplify Workspace UX.

Clinic Admin may manage users, Roles, permissions, Patient Flow classifications, Workspace configuration, Modules/Domains and clinic-level administration as allowed by the existing platform architecture.

---

## 12. DATA / DATABASE IMPACT

Before adding any schema object, implementation must inspect existing:

- workspace membership/default data;
- user/tenant relations;
- Role and permission tables;
- Patient Flow session tables;
- visit/session references;
- agenda/room references;
- widget/presentation state;
- audit tables.

Expected principle:

```text
Reuse → Extend → Create only if genuinely required
```

No duplicate workspace, role, permission, patient-flow, visit, or widget tables may be created.

Any migration must be additive/reversible where feasible, tenant-scoped, RLS-aware, and accompanied by data/backfill validation.

---

## 13. ROUTE / UI IMPACT INVENTORY

The implementation investigation MUST cover at minimum:

### Shell/navigation
- dashboard layout/shell;
- navigation registry;
- Sidebar renderer;
- Home route;
- Workspace route/surface;
- My Workspace route/surface;
- My Settings route;
- global search.

### Workspace/presentation
- workspace registry/types;
- workspace membership/default resolution;
- widget registry;
- widget renderer/toolbar;
- presentation persistence;
- responsive/mobile behavior;
- RTL/LTR behavior.

### Patient Flow / Queue
- `src/domain/queue/workspace.actions.ts`;
- queue engine;
- queue types;
- Patient Flow UI;
- transition validation;
- locks;
- handoff/revalidation.

### Clinical / visit
- `src/domain/visit/*`;
- clinical route/surface;
- visit save actions;
- procedure actions;
- patient chart integration.

### Authorization
- Permission Engine;
- permission types;
- route guards;
- server actions;
- Sidebar authorization.

### Data
- workspace-related migrations;
- `clinic_visit_sessions` and related objects;
- user/Role/permission objects;
- widget presentation state;
- RLS/policies;
- audit trail.

---

## 14. REQUIRED ENGINEERING CHANGES

The implementation phase must produce, at minimum:

1. A single Workspace context resolver used consistently by shell, Workspace, My Workspace, and relevant widgets.
2. A single authorization path through the existing Permission Engine.
3. A single Patient Flow transition authority through the existing queue engine/domain.
4. A Sidebar registry driven by authorized Domains, independent of primary classification.
5. A Home surface that consumes authoritative daily data without owning workflow transitions.
6. A My Workspace personalization layer that does not mutate authorization.
7. Clinical Workspace content driven by Patient Flow/visit/session context and effective capability rather than a hard-coded doctor-only model.
8. Explicit integration adapters/interfaces for visit, room, procedure, agenda and other domains when needed; no duplicated domain logic.
9. Consistent revalidation/invalidation after workflow transitions so Home, Workspace, Queue and affected Domains converge on the same state.
10. Auditability for significant workflow transitions and administrative changes.

---

## 15. REQUIRED NON-CHANGES

The implementation must NOT, as part of this contract:

- redesign unrelated Modules/Domains;
- change the approved Patient Journey model;
- invent a new Role architecture;
- replace the existing Permission Engine;
- create a new Queue engine;
- turn Patient Flow into a Sidebar Domain for ordinary users;
- remove old documentation merely because one section is superseded;
- remove Clinic Admin functionality;
- implement detailed Visit/Room/Procedure workflows before their dedicated domain contracts are authoritative;
- change subscription/entitlement architecture unless a direct dependency proves it is required for the decisions in this contract.

---

## 16. ACCEPTANCE TESTS

### A. Ordinary user shell
- Login lands on Home.
- Sidebar contains Home, Workspace, My Workspace, authorized Domains, My Settings.
- No unauthorized Domain is visible.
- An authorized Domain outside primary classification remains visible.

### B. Workspace
- Workspace is not labeled as a Role.
- User sees the relevant work for the current/default context.
- Patient Flow state is not duplicated in a Workspace-specific state machine.

### C. My Workspace
- Defaults exist.
- User can personalize supported widgets.
- Personalization does not grant/revoke authorization.
- Personalization does not alter Patient Flow.

### D. Clinical workflow
- Waiting patient becomes available to the appropriate clinical work surface.
- Clinical user starts the existing clinical transition.
- Clinical lock/ownership rules remain enforced.
- Clinical completion moves to `pending_close` rather than silently closing the whole visit.
- Reception/operations can continue the workflow.

### E. Domain access
- Read-only Domain shows read-only UI/actions.
- Write-enabled Domain exposes permitted write actions.
- Primary classification does not suppress authorized Domain visibility.

### F. Clinic Admin
- Clinic Admin retains tenant administration capabilities.
- Ordinary-user Workspace restrictions do not accidentally remove Clinic Admin capabilities.

### G. Security
- All mutations are server-authorized.
- Cross-tenant access is rejected.
- Client-side visibility cannot bypass server authorization.

### H. Regression
- Existing Queue transitions remain valid.
- Existing visit save/procedure actions remain valid.
- Existing i18n/RTL behavior remains valid.
- Existing subscription/entitlement behavior remains unchanged unless directly required.

---

## 17. DEFINITION OF DONE

This contract is complete only when:

1. every requirement above is mapped to a repository location;
2. every required change has an implementation contract;
3. every existing dependency is preserved or deliberately migrated;
4. all affected database/RLS paths are validated;
5. all ordinary-user UX paths are validated;
6. all Patient Flow transitions are validated end-to-end;
7. Clinic Admin remains functional;
8. authorized Domains outside the primary context remain visible;
9. no duplicate state/authorization/workflow engines exist;
10. production/runtime evidence proves the implementation matches this contract.

---

## 18. EXTERNAL ENGINEERING PRINCIPLES USED AS SUPPORTING EVIDENCE

External references are supporting engineering evidence only; they do not override CORE SYSTEM architectural decisions.

- OpenEMR models the clinical encounter as a sequence of events performed by different clinic staff, with roles allowed to perform work through ACLs. This supports keeping the overall encounter workflow distinct from any single user's role. citeturn0search1
- OpenEMR's patient-flow documentation demonstrates explicit arrival/status/check-out transitions and room-aware workflow. This supports stateful workflow ownership outside the presentation shell. citeturn0search9turn0search8
- Medplum uses workflow Tasks with a patient/encounter focus and an owner that can be an individual or group, illustrating a scalable pattern for routing work to the responsible clinical actor without redefining the patient encounter itself. citeturn0search0turn0search6
- Medplum PlanDefinition/Task patterns demonstrate separating workflow definitions from generated executable work items. CORE SYSTEM should use the same separation principle without importing Medplum's data model wholesale. citeturn0search2turn0search11

---

## 19. IMPLEMENTATION AUTHORITY

The implementation team must treat this document as the engineering contract for the 2026-09-01 Workspace/Patient Flow decisions.

If implementation discovers a conflict outside the explicit scope of those decisions, it must not silently resolve it. It must record the conflict, preserve the existing behavior, and escalate for an architectural decision.
