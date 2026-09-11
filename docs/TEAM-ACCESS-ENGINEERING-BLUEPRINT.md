# CORE SYSTEM — Team & Access Engineering Blueprint

**Status:** Final pre-implementation engineering reference — reconciled with PJ, Workforce & Operations and Financial & Resources  
**Domain:** Team & Access  
**Scope:** Tenant / Clinic operational environment only  
**Authority:** This document governs Team & Access unless a later explicit architectural decision supersedes it.  
**Current Global Surfaces interpretation:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

> **2026-09-11 reconciliation:** Team & Access must distinguish Primary Role / Primary Work Context / Role Workspace from Effective Permissions. A user may receive additional permissions outside their primary context without changing their Role Workspace. Such permissions may expand Sidebar Domains, Widgets and My Workspace. Home is independent. Header is global. This clarification does not redefine Team & Access ownership of authorization.

## 1. Purpose

Team & Access gives the clinic a flexible way to organize users and control what each user can do inside CORE SYSTEM.

CORE must not prescribe the clinic's organizational structure. The Clinic Admin decides roles, staffing models, responsibilities and permission distribution.

The guiding principle is:

> **CORE provides structure and capabilities; the Clinic Admin decides how the clinic uses them.**

Super Admin is outside this tenant operating environment and belongs to the separate Platform Governance stage.

## 2. Core model

```text
User
 ↓
Primary Role / Job Function
 ↓
Primary Work Context / Classification
 ↓
Primary Role Workspace

Separately:
Effective Permissions
 ↓
Authorized Domains / Capabilities / Actions
 ↓
Sidebar + Widgets + My Workspace
```

Permanent distinctions:

```text
Role             ≠ Permission
Role Workspace   ≠ Permission boundary
Primary Context  ≠ Sidebar filter
My Workspace     ≠ Role Workspace
Home             ≠ Workspace
Employee         ≠ User
Job/Skill        ≠ Role
Skill            ≠ Permission
Template         ≠ Permission authority
Visibility       ≠ Authorization
```

## 3. Workspaces

The three tenant work environments remain:

```text
Administrative
Operation
Clinical
```

A **Role Workspace** is the user's primary professional working environment associated with the Primary Role / Primary Work Context. It is not an authorization boundary and is not the complete inventory of the user's capabilities.

A user may receive permissions that cross functional/workspace expectations. Those permissions do not automatically change the user's Primary Role, Primary Work Context or Role Workspace.

**My Workspace** is a personal working/presentation arrangement associated with the primary Role Workspace. It may expose authorized cross-context tools/widgets.

The existing Workspace architecture remains the foundation and must be reused. Widget/Sidebar visibility remains driven by effective authorization/capability and must not be reduced to fixed job titles.

## 4. Clinic Admin

Clinic Admin is the highest operational authority inside the tenant, subject only to non-bypassable platform, security and legal controls.

Clinic Admin may:

- Create, activate and deactivate users.
- Define, rename, duplicate, modify and retire roles.
- Create new roles.
- Assign users to roles.
- Assign permissions through roles.
- Grant direct permissions.
- Apply overrides.
- Configure user settings.
- Delegate appropriate administrative capabilities.
- Review effective access and audit activity.
- Set or change the user's primary work context/Workspace assignment where supported by the governing Workspace model.

The system must not artificially constrain a small clinic because it lacks specialized staff, nor a larger clinic because responsibilities are combined.

## 5. Roles — independent from permissions

Roles are organizational constructs owned by the clinic.

Examples are only templates/guidance:

```text
Clinical: Doctor, Procedure Specialist
Operation: Front Desk, Patient Coordinator
Administrative: Clinic Manager, Finance Manager
```

The Admin may modify permissions, add/remove permissions and create additional roles.

There is **no mandatory role hierarchy**.

Avoid:

```text
Role A → Role B → Role C → Role D
```

because it makes access difficult to explain.

The preferred model is explicit:

```text
Role
+ Permission Bundles
+ Direct Permissions
+ Overrides
→ Effective Access
```

System-provided roles are editable starting templates, not immutable definitions. The previously retired `clinic_owner` concept must not return as a second operational tenant-admin role; `clinic_admin` remains the tenant primary administrator.

## 6. Permission Catalog — Core

The Permission Catalog is the authoritative catalog of permissions that can be granted.

Conceptually:

```text
Area / Work Context
 → Domain
   → Resource
     → Action
```

The area/context is explanatory metadata only; a permission's authorization meaning is the resource/action contract, not Workspace membership.

Examples:

```text
patients.read
agenda.read
agenda.update
billing.read
billing.create
payments.refund
inventory.update
reports.view
analytics.read
users.manage
roles.manage
```

The Clinic Admin may freely combine catalogued permissions but may not invent permissions outside the catalog.

Permissions are security boundaries. UI hiding is not authorization; protected operations must enforce authorization at the server/data/action boundary.

## 7. Role Templates — Core

Role Templates are editable starting configurations for common clinic jobs.

They exist to reduce setup/training effort, not to dictate clinic organization.

After applying a template, the Admin can:

- Add permissions.
- Remove permissions.
- Replace permissions.
- Change primary work context/Workspace assignment intentionally.
- Rename the role.
- Duplicate it.

Changing Workspace assignment is a distinct administrative decision. It is not inferred merely from adding or removing permissions.

Templates are advisory and never immutable policy.

## 8. Permission Sets / Bundles

Permission Bundles are an approved modular configuration mechanism inspired by mature systems such as Salesforce Permission Sets / Permission Set Groups.

They simplify configuration without becoming a new authorization engine.

The Permission Catalog remains authoritative.

## 9. Direct permissions and overrides

The existing repository permission architecture and effective-permission calculation are retained and extended.

Conceptually:

```text
Role Permissions
 + Direct User Permissions
 + Explicit Overrides
 → Effective Permissions
```

Resolution must be deterministic and explainable.

A second permission engine must never be introduced.

A permission override is **not** a Role Workspace change unless the administrator explicitly changes the user's primary work context/assignment through the appropriate Workspace administration mechanism.

## 10. Effective Access — Core

Clinic Admin should be able to inspect what a user can actually do.

Example:

```text
User: Ahmad
Primary Work Context: Operation
Role: Front Desk

Effective Access
Patients ✓
Agenda ✓
Payments ✓
Inventory ✓
Refund ✕

Source
Patients  → Role
Agenda    → Role
Payments  → Direct
Inventory → Override
```

The system should answer:

> **Why does this user have this permission?**

Possible sources:

- Role.
- Direct assignment.
- Permission Bundle.
- Override.

## 11. Delegation — Advanced

Clinic Admin may delegate selected administrative capabilities to another user.

Delegation must be explicit, bounded and auditable. A delegated user cannot exceed the capabilities delegated to them or bypass platform safety controls.

CORE does not need a complex enterprise administrative hierarchy to achieve this.

## 12. User Settings — Core

User Settings belong inside Team & Access but are separate from authorization.

Personal/account settings are not a Workspace or Role representation.

Changing a preference must not change permissions, and changing permissions must not silently change preferences.

## 13. Personalized Sidebar and Workspace

The canonical relation is:

```text
Tenant Capability Available
        AND
User Effective Permission
        ↓
Authorized Module / Domain / Action
        ↓
Sidebar + My Workspace + appropriate Widget
```

The Sidebar is not a second permission system and is not a mirror of the Role Workspace.

My Workspace is a personal presentation surface and may include authorized cross-context capabilities without changing the primary Role Workspace.

## 14. Administrative Oversight

Clinic Admin should have tenant-wide visibility appropriate to their authority across:

- Administrative.
- Operation.
- Clinical.

Important distinction:

```text
Visibility ≠ Action
```

Admin-wide visibility must not be confused with granting every action to every user.

## 15. Audit and accountability — Core

Reuse the existing audit architecture; do not create a parallel audit system.

The objective is reliable accountability: who changed what and when, with reason where applicable.

## 16. Skill / Capability — Advanced

For current terminology, this section must be read as **Skill / human competence**. The platform **Capability** concept remains separate.

```text
Role       = organizational function
Permission = system authorization
Skill      = human competence
Qualification = formal credential/evidence
Capability = platform/business ability
```

Example:

```text
Role: Procedure Specialist
Permissions: agenda.update, patients.read
Skills: Laser, RF, Device X
```

Skills may later support workforce scheduling, capacity, resource matching, task assignment, Patient Journey coordination and AI recommendations.

Basic Team & Access must not require Skills.

## 17. Change Impact Preview — Advanced

Before significant access changes, CORE may show the expected impact:

```text
Removing payments.refund
→ 3 users affected
→ 1 role affected
→ related authorized views may be affected
```

This is advisory. The Clinic Admin remains the decision maker.

## 18. Groups — Future-ready only

Groups may later help with team communication, task routing or larger-clinic administration, but they are not a mandatory authorization layer now.

## 19. Entitlement vs Permission

Two separate questions must always remain separate:

```text
Tenant Capability
= Is the capability available to this clinic?

User Permission
= Is this user allowed to perform the action?
```

Effective use requires both where applicable.

## 20. Relationship to Workforce & Operations

Team & Access answers:

> **Who is this person and what are they allowed to do?**

Workforce answers:

> **What is this person's employment/availability/capacity/work reality?**

Employee ≠ User.

Job/Position ≠ Role.

Skill ≠ Permission.

Skills and platform capabilities are related but not synonymous.

## 21. Relationship to Financial, Clinical and Agenda domains

Team & Access supplies authorization to other domains; it does not own their business logic.

## 22. Relationship to Patient Journey

Team & Access is an administrative domain. It does not define PJ rules.

Its relationship is outcome-oriented:

```text
Clinic decision
 → User / Role / Permission assignment
 → Operational execution
 → Operational data
 → Performance / Insights
 → Patient Journey outcome
```

PJ must not be embedded into authorization logic merely because permissions influence who performs a journey step.

## 23. Global Surfaces Boundary

For any Team & Access documentation or implementation touching user presentation:

- Role Workspace = primary professional work environment.
- Additional permissions = expanded authorization, not Role Workspace reclassification.
- My Workspace = personal working/presentation arrangement.
- Sidebar = complete authorized navigation.
- Home = independent global starting/awareness surface.
- Header = persistent global access.
- My Settings = personal account/preferences destination.

Team & Access owns authorization and user/Role administration. It does not own Home/Header presentation semantics merely because permissions influence what those surfaces may display.

## 24. Features explicitly rejected

- Complex role inheritance hierarchy.
- Enterprise IAM/policy-engine complexity.
- Workspace-based security boundaries.
- Mandatory organizational departments.
- Fixed job-role authorization.
- Super Admin as a tenant operating role.
- A second permission engine.
- A second audit system.

## 25. Core / Advanced / Future-ready

### Core

Users; Workspaces; clinic-defined Roles; Role Templates; Permission Catalog; permission assignment; direct permissions/overrides; Effective Access; Access Explanation; User Settings; dynamic Sidebar/Workspace; Audit; tenant/security enforcement.

### Advanced

Permission Bundles as exposed configuration tools; Delegation; Skill/Capability; Change Impact Preview; advanced access analysis.

### Future-ready

Groups; advanced access review; skill-based assignment; AI access analysis; richer scoped administration.

## 26. Final reconciliation decisions

1. **Roles are fully independent from Permissions.**
2. **Clinic Admin may create and name roles freely within the clinic's organizational model.**
3. **Role templates are advisory and editable.**
4. **Permission Catalog is authoritative and Core.**
5. **Admin may grant any catalogued permission available to the tenant; the role name does not restrict the permission set.**
6. **Primary Role / Primary Work Context determines the user's primary Role Workspace; additional permissions do not redefine it.**
7. **Workspace is UX/work organization, not a security boundary.**
8. **Permission Bundles simplify templates/configuration; they do not replace the Permission Catalog.**
9. **Direct permissions and overrides remain supported.**
10. **Effective Access must be explainable.**
11. **Delegation is Advanced.**
12. **Skill is a human/workforce concept and Capability is a platform/product concept; they are not interchangeable.**
13. **User Settings remain separate from Workspace/presentation.**
14. **Clinic Admin retains broad tenant operational authority; Super Admin remains outside tenant operations.**
15. **No enterprise IAM hierarchy is required.**
16. **No Team & Access capability may duplicate another domain's business logic.**

## 27. Implementation rule

```text
Approved Access Decision
 → Inspect Repository
 → Inspect Live Database
 → Inspect PJ Contract
 → Reuse Permission Engine / Workspace
 → Extend
 → Integrate with owning domains
 → Validate server-side authorization + tenant isolation
 → Validate UI behavior
 → Document
```

No implementation is considered complete merely because a screen renders or a permission record exists. Protected operations require real authorization enforcement, tenant isolation, workflow validation, persistence and runtime verification as applicable.

**End of Team & Access Engineering Blueprint.**
