# CORE SYSTEM — Terminology Application Register

**Date:** 2026-08-29  
**Status:** AUTHORITATIVE RECONCILIATION CONTROL — EXTENDED 2026-09-11  
**Applies to:** AJM, UX/IA, PJ, domain blueprints and implementation plans

## Purpose

This register converts terminology governance into an execution control. It prevents historical wording from silently redefining current architecture and identifies corrections that must be applied when a document is edited.

## 1. Binding current distinctions

| Term | Current CORE meaning | Do not use as |
|---|---|---|
| Domain | Business-responsibility boundary owning rules and authoritative records | Module, Workspace |
| Module | Coherent product/functional unit that may be configured, licensed, permission-controlled and activated | Domain, Page, Widget |
| Feature | Specific user/system functionality | Module, Permission, Feature Flag |
| Capability | Platform/product/tenant-available ability | Skill, Qualification, Permission, Entitlement |
| Skill | Human learned competence | Capability, Qualification, Role |
| Qualification | Formal credential/certification/license/degree | Skill, Role, Permission |
| Primary Role | User's primary professional/job function | Permission set, Workspace |
| Primary Work Context | User's primary work classification | Role, Permission set, Sidebar filter |
| Role Workspace | Stable primary professional work environment | Role, Permission set, Home, My Workspace |
| My Workspace | Personal working/presentation arrangement associated with Role Workspace | Role Workspace, Home, authorization |
| Home | Independent global starting/awareness surface | Role Workspace, My Workspace, Dashboard |
| Sidebar | Complete authorization-aware navigation surface | Role Workspace, My Workspace |
| Header | Persistent global access layer | Home, Work Center, Workspace |
| Communications | Full authoritative communication domain | Chat, Notifications |
| Chat | Compact interaction surface over Communications | Independent domain |
| Notifications | Separate attention/delivery capability | Communications, Follow-up |
| Workspace Quick Action | Small executable work capability/widget classification | Global Header Quick Actions |
| Global Header Quick Actions | Global interface/account actions, initially Language + Logout | Workspace Quick Actions, business launcher |

## 2. Mandatory corrections identified in current AJM material

### AJM Implementation Plan

Current AJM wording may use `Skill / Capability` for human/workforce context.

Required interpretation:

- `Skill` = human competence.
- `Qualification` = formal evidence/credential.
- `Capability` = platform/business/tenant capability.

Where workforce eligibility is discussed, use `Skill` and, where appropriate, `Qualification`. Use `Capability` only when referring to a capability provided or enabled by the platform/business.

### Journey Coordination Engineering Blueprint

Existing `Skill / Capability` wording must not be interpreted as a single person attribute.

Advanced routing may use `Skill` and `Qualification` as workforce inputs. A platform `Capability` may determine whether a routing function is available/enabled, but it is not a person's skill.

### Team & Access

Historical use of `Skill / Capability` as a single person attribute must be reconciled and split according to the governing glossary when the document is next updated.

## 3. ADR-006 treatment

ADR-006 is **HISTORICAL + RECONCILED**, not deleted.

Its `Module` concept remains valid as a product/functional unit. The later Domain model adds a distinct business-ownership boundary.

Therefore:

> Domain ≠ Module.

## 4. UX application rule

UX/IA may expose modules, features, capabilities, workspaces and widgets as needed for user experience, but visual hierarchy does not redefine business ownership or authorization.

```text
Domain ownership
      ↓
Business/product capabilities and modules
      ↓
Features
      ↓
UX surfaces: Role Workspace / My Workspace / Home / Page / Widget / Header
```

This is a conceptual separation, not a mandatory implementation hierarchy.

## 5. Authorization rule

```text
Entitlement → whether the tenant/user may have a licensed capability
Capability  → what the platform/product can provide
Permission  → what the authorized user may do
Role        → organizational/configuration label
```

No UX visibility decision grants permission.

## 6. Global surface application rule

The relationship below is mandatory for current and future documentation:

```text
Primary Role / Job Function
        ↓
Primary Work Context / Classification
        ↓
Role Workspace
```

Effective permissions are a separate axis:

```text
Effective Permissions
        ↓
Authorized Domains / Capabilities / Actions
        ├── Sidebar
        ├── Widgets
        └── My Workspace
```

Additional permissions do not redefine Primary Role, Primary Work Context or Role Workspace.

A clinical-primary user remains in Clinical Role Workspace when additional Financial, Operational, Administrative, Reporting or other permissions are granted. The additional access may appear in Sidebar, Widgets and My Workspace according to authorization.

Home is independent from this primary-work relationship, and Header is a persistent global access layer.

## 7. Historical-document handling

Do not perform blind global replacement.

Classify historical wording as:

- KEEP
- CLARIFY
- RENAME
- RECONCILE
- SUPERSEDE
- HISTORICAL

The original historical decision must remain recoverable.

## 8. Implementation gate

Before beginning any new AJM, PJ or UX implementation stage:

1. Read `CORE-SYSTEM-TERMINOLOGY-GOVERNANCE.md`.
2. Read this register.
3. Read `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md` for Home/Header/Workspace/Sidebar interpretation.
4. Check the stage documents for prohibited conflations.
5. If a conflict is found, resolve terminology before implementation proceeds.
6. Do not create a new synonym for an existing governed concept.

**End of Register.**
