# CORE SYSTEM — Terminology Application Register

**Date:** 2026-08-29  
**Status:** AUTHORITATIVE RECONCILIATION CONTROL  
**Applies to:** AJM, UX/IA, PJ, domain blueprints and implementation plans

## Purpose

This register converts the terminology governance decision into an execution control. It prevents historical wording from silently redefining current architecture and identifies the specific corrections that must be applied when a document is next edited.

## 1. Binding current distinctions

| Term | Current CORE meaning | Do not use as |
|---|---|---|
| Domain | Business-responsibility boundary owning rules and authoritative records | Module, Workspace |
| Module | Coherent product/functional unit that may be configured, licensed, permission-controlled and activated | Domain, Page, Widget |
| Feature | Specific user/system functionality | Module, Permission, Feature Flag |
| Capability | Platform/product/tenant-available ability | Skill, Qualification, Permission, Entitlement |
| Skill | Human learned competence | Capability, Qualification, Role |
| Qualification | Formal credential/certification/license/degree | Skill, Role, Permission |

## 2. Mandatory corrections identified in current AJM material

### AJM Implementation Plan

Current wording in AJM-1 and AJM-3 uses `Skill / Capability` for the human/workforce context.

Required interpretation:

- `Skill` = human competence.
- `Qualification` = formal evidence/credential.
- `Capability` = platform/business/tenant capability.

Where workforce eligibility is discussed, use `Skill` and, where appropriate, `Qualification`. Use `Capability` only when referring to a capability provided or enabled by the platform/business.

### Journey Coordination Engineering Blueprint

The existing section titled `Skill / Capability` currently defines:

`Skill = capability/qualification`

This is no longer an acceptable current definition.

The governing interpretation is:

```text
Skill        = human competence
Qualification = formal credential/evidence
Capability   = platform/business/tenant capability
```

Advanced routing may use `Skill` and `Qualification` as workforce inputs. A platform `Capability` may determine whether a routing function is available/enabled, but it is not a person's skill.

### Team & Access

Any historical use of `Skill / Capability` as a single person attribute must be treated as `RECONCILE` and split according to the governing glossary when the document is next updated.

## 3. ADR-006 treatment

ADR-006 is **HISTORICAL + RECONCILED**, not deleted.

Its `Module` concept remains valid as a product/functional unit. The later Domain model adds a distinct business-ownership boundary.

Therefore:

> Domain ≠ Module.

No document may infer a one-to-one Domain → Module hierarchy unless a future explicit architecture decision establishes that relationship.

## 4. UX application rule

UX/IA may expose modules, features, capabilities, workspaces and widgets as needed for user experience, but the visual hierarchy does not redefine business ownership or authorization.

```text
Domain ownership
      ↓
Business/product capabilities and modules
      ↓
Features
      ↓
UX surfaces: Workspace / Page / Widget / Quick Action
```

This is a conceptual separation, not an assertion of a mandatory implementation hierarchy.

## 5. Authorization rule

The following are distinct:

```text
Entitlement → whether the tenant/user may have a licensed capability
Capability  → what the platform/product can provide
Permission  → what the authorized user may do
Role        → organizational/configuration label
```

No UX visibility decision may be treated as a permission grant merely because an element is visible.

## 6. Clinical terminology rule

CORE uses:

```text
Appointment = planned booking
Visit       = actual CORE patient visit
Encounter   = external/medical-standard mapping when applicable
Treatment Plan = CORE patient-care planning concept
CarePlan      = external interoperability mapping when applicable
```

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

Before beginning any new AJM or UX implementation stage:

1. Read `CORE-SYSTEM-TERMINOLOGY-GOVERNANCE.md`.
2. Read this register.
3. Check the stage documents for prohibited conflations.
4. If a conflict is found, resolve the terminology before implementation proceeds.
5. Do not create a new synonym for an existing governed concept.

**End of register.**
