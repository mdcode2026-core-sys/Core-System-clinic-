# CORE SYSTEM — WORKSPACE × PATIENT FLOW
## PRE-CODE EXECUTION CONTRACT — EXACT CURRENT GAP → TARGET BEHAVIOR

**Date:** 2026-09-01  
**Status:** PRE-CODE GATE — HISTORICAL EXECUTION CONTRACT — RECONCILED 2026-09-11  
**Architecture authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  
**Engineering authority:** `docs/ENGINEERING-SPEC-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  
**Current canonical surface interpretation:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

> **2026-09-11 reconciliation notice:** This document records the pre-code target that existed on 2026-09-01. Where it used generic “Workspace” language, the current product meaning is now explicit: **Role Workspace = primary professional environment; My Workspace = personal work/presentation surface; Home = independent global starting/awareness surface; Sidebar = authorized navigation; Header = global access.** Historical target statements must not be reinterpreted to collapse these concepts.

---

## 0. PURPOSE

This document is the historical final gate before the 2026-09-01 source modification sequence.

It records what the repository was understood to do at that time, what the complete implementation was required to change, and what the user was expected to see after the implementation.

It does not introduce architectural decisions. The current canonical interpretation of the relevant surfaces is maintained by the 2026-09-11 reconciliation.

No source-code modification is authorized by this document alone.

---

## 1. CURRENT GAP / TARGET INTERPRETATION

### G1 — Login / Home boundary

The ordinary-user entry target is:

`successful authentication → Home`

Home is independent from Role Workspace and My Workspace.

### G2 — Sidebar boundary

The target Sidebar model is:

`Home → Workspace → My Workspace → authorized Domains → My Settings`

Sidebar is authorized navigation, not a representation of the user's Role Workspace.

### G3 — Role Workspace boundary

The primary relation is:

```text
Primary Role
   ↓
Primary Work Context
   ↓
Role Workspace
```

The Role Workspace remains the primary professional work environment. It is not recalculated merely because the user's permissions expand.

### G4 — My Workspace boundary

My Workspace is the personal work/presentation layer associated with the user's Role Workspace. It can contain permitted cross-context Widgets/tools. Personalization never changes authorization or Role Workspace.

### G5 — Home boundary

Home is the global starting/awareness surface. It may summarize work and provide global/lightweight utilities, but it does not own the specialist workflows performed in Workspaces and Domains.

### G6 — Header boundary

The authenticated Header is persistent global access. Global Search remains existing functionality. Communications, compact Chat, Notifications and Quick Actions are global access surfaces, not Home/Workspace replacements.

### G7 — Clinical/Operational Workspace boundary

Clinical and Operational Workspaces remain their primary professional environments. Additional capabilities do not cause unrelated work to be injected into them merely because the user can access those capabilities elsewhere.

### G8 — Patient Flow boundary

Patient Flow remains the workflow/state authority. Workspace consumes it; Home summarizes it where useful; Widgets may surface it where authorized. None becomes the owner of Flow state.

---

## 2. CROSS-CONTEXT PERMISSION TEST

Example:

```text
User = Doctor
Primary Context = Clinical
Role Workspace = Clinical

Additional permissions:
Financial Read
Operational capability
Administration capability
Reports Read
```

Expected result:

```text
Role Workspace = Clinical              [UNCHANGED]
My Workspace = may expand with allowed tools/widgets
Sidebar = may expand with authorized Domains
Widgets = may expand according to effective permission
Home = remains Home; content may remain permission/relevance-aware
```

A permission grant is not a Role change and not a Role Workspace change.

---

## 3. DETAILED TARGET EXPERIENCE

### 3.1 First login

After successful login, ordinary users land on Home.

Header provides global access according to the current Header contract.

Home provides global/daily orientation and does not become the user's clinical or operational execution board.

### 3.2 Sidebar

Opening the Sidebar shows:

1. Home
2. Workspace
3. My Workspace
4. Authorized Domains
5. My Settings

Cross-context authorized Domains remain visible under their normal names.

### 3.3 Role Workspace

Selecting Workspace opens the user's primary professional work environment for the assigned/default Primary Work Context.

The visible user-facing concept may remain simply “Workspace”; internal Clinical/Operational/Administration classification is not itself a permission set.

### 3.4 My Workspace

Selecting My Workspace opens the user's personal working arrangement.

The user may configure permitted Widgets/tools. A user can place a permitted capability from another functional area here without changing the user's Role Workspace.

### 3.5 Full Domains

Selecting a Domain opens its complete authoritative surface.

A Workspace/Widget shortcut does not replace the full Domain.

---

## 4. CLINICAL DAILY EXPERIENCE

Clinical Workspace remains focused on clinical work required by the Patient Journey.

The system may use effective capability/permission to control actions, but additional non-clinical capabilities do not turn Clinical Workspace into a mixed-domain dashboard.

Clinical work follows the existing Patient Flow/Visit lifecycle and hands off to the operational/reception workflow according to the authoritative state machine.

---

## 5. OPERATIONAL DAILY EXPERIENCE

Operational Workspace remains focused on operational/reception work required by Patient Flow.

It does not become a generic permission dashboard because the user has additional capabilities.

---

## 6. CLINIC ADMIN EXPERIENCE

Clinic Admin remains outside the ordinary-user Workspace presentation contract.

Tenant administration capabilities must be preserved.

---

## 7. BACKGROUND BEHAVIOR

### 7.1 Authorization

All mutation authorization remains server-side through the existing Permission Engine.

### 7.2 Patient Flow

All workflow transitions remain centralized in the Queue/Patient Flow domain.

### 7.3 Role Workspace

Role Workspace resolves the primary professional context. It does not grant permission.

### 7.4 My Workspace

My Workspace stores presentation/personalization state only.

### 7.5 Sidebar

Sidebar exposes authorized Domains independently of primary work classification.

### 7.6 Home

Home consumes authoritative data and may provide global/lightweight utilities and entry points; it does not own specialist workflows.

### 7.7 Header

Header provides global Search, Communications, Chat, Notifications and approved Quick Actions without creating parallel domain logic.

---

## 8. DATABASE TARGET

Before any migration, inspect the current live/repository schema relationship for:

- `clinic_user_workspaces`;
- `clinic_users`;
- `roles`;
- `permissions`;
- `role_permissions`;
- `clinic_visit_sessions`;
- `clinic_rooms`;
- `master_agenda_events`;
- widget/presentation persistence;
- audit tables;
- RLS policies.

The expected implementation principle remains:

```text
Reuse → Extend → Create only when genuinely required
```

No duplicate authorization or workflow state model is permitted.

---

## 9. FINAL PRE-CODE ACCEPTANCE GATE

Code modification may begin only when the implementation owner can demonstrate that:

- the exact affected files have been inspected;
- each modification has a traced reason;
- each new object has a proven necessity;
- no unrelated architecture is being changed;
- Home / Role Workspace / My Workspace / authorized Domains / My Settings are mapped distinctly;
- Header global access is mapped distinctly;
- Clinical and Operational work are mapped;
- Clinic Admin is mapped separately;
- permissions and RLS are mapped;
- the final expected user-visible result is understood;
- rollback/recovery impact is understood.

At that point the work is **READY TO START CODE MODIFICATION**.

**End of historical pre-code contract.**
