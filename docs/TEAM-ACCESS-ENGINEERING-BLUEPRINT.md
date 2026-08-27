# CORE SYSTEM — Team & Access Engineering Blueprint

**Status:** Final pre-implementation engineering reference — reconciled with PJ, Workforce & Operations and Financial & Resources
**Domain:** Team & Access
**Scope:** Tenant / Clinic operational environment only
**Authority:** This document governs Team & Access unless a later explicit architectural decision supersedes it.

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
Workspace(s)
 ↓
Clinic-defined Role (organizational label)
 ↓
Role Template / Permission Bundles
 ↓
Permission Catalog
 ↓
Direct Permissions / Overrides
 ↓
Effective Permissions
 ↓
Enabled Tenant Capabilities
 ↓
Personalized Workspace / Sidebar / Widgets
```

Permanent distinctions:

```text
Role       ≠ Permission
Workspace  ≠ Permission boundary
Employee   ≠ User
Job/Skill  ≠ Role
Skill      ≠ Permission
Template   ≠ Permission authority
Bundle     ≠ Role
Visibility ≠ Authorization
```

## 3. Workspaces

The three tenant workspaces remain:

```text
Administrative
Operation
Clinical
```

A Workspace is a working environment and UX organization mechanism, not an authorization boundary.

A user may receive permissions that cross functional/workspace expectations when the Clinic Admin chooses that model.

The existing Workspace architecture remains the foundation and must be reused. Widget/sidebar visibility remains permission-driven and must not depend on fixed job titles.

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
Area / Workspace
 → Domain
   → Resource
     → Action
```

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
- Change workspace.
- Rename the role.
- Duplicate it.

Templates are advisory and never immutable policy.

## 8. Permission Sets / Bundles

Permission Bundles are an approved modular configuration mechanism inspired by mature systems such as Salesforce Permission Sets / Permission Set Groups.

They simplify configuration without becoming a new authorization engine.

```text
Inventory Basic Bundle
 → inventory.read
 → inventory.create

Inventory Advanced Bundle
 → inventory.adjust
 → inventory.transfer
 → inventory.advanced_reports
```

The Permission Catalog remains authoritative.

Bundles are **advanced as an exposed administrative capability**, but may be used behind Role Templates from the beginning to simplify setup.

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

## 10. Effective Access — Core

Clinic Admin should be able to inspect what a user can actually do.

Example:

```text
User: Ahmad
Workspace: Operation
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

```text
User
├── Identity
├── Workspace
├── Role
├── Permissions
├── Overrides
└── Preferences / Settings
```

Changing a preference must not change permissions, and changing permissions must not silently change preferences.

## 13. Personalized Sidebar and Workspace

```text
Tenant Capability Available
        AND
User Effective Permission
        ↓
Relevant Module / Action
        ↓
Sidebar + Workspace + Widgets
```

The Sidebar is not a second permission system. It is a presentation of capabilities the user is actually entitled and permitted to use.

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

Clinic Admin may delegate selected capabilities where appropriate.

## 15. Audit and accountability — Core

Reuse the existing audit architecture; do not create a parallel audit system.

Important Team & Access changes must remain auditable, including:

- User creation/activation/deactivation.
- Role creation/modification/retirement.
- Permission assignment changes.
- Direct permissions.
- Overrides.
- Delegation.
- Sensitive administrative actions.

The objective is reliable accountability: who changed what and when, with reason where applicable.

## 16. Skill / Capability — Advanced

Skill / Capability is an **Advanced** feature and is deliberately separate from Role and Permission.

```text
Role       = organizational function
Permission = system authorization
Skill      = qualification/capability of the person
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
→ related workspace views affected
```

This is advisory. The Clinic Admin remains the decision maker.

## 18. Groups — Future-ready only

Groups may later help with team communication, task routing or larger-clinic administration, but they are not a mandatory authorization layer now.

Do not require:

```text
User → Group → Role → Permission
```

The architecture should remain extensible without making Groups a prerequisite.

## 19. Entitlement vs Permission

Two separate questions must always remain separate:

```text
Tenant Capability
= Is the capability available to this clinic?

User Permission
= Is this user allowed to perform the action?
```

Effective use requires both where applicable:

```text
Tenant Entitlement
 AND
User Effective Permission
 → Effective Capability
```

A permission must not bypass tenant entitlement, and an enabled tenant capability must not automatically grant every user permission.

## 20. Relationship to Workforce & Operations

Team & Access answers:

> **Who is this person and what are they allowed to do?**

Workforce answers:

> **What is this person's employment/availability/capacity/work reality?**

Employee ≠ User.

Job/Position ≠ Role.

Skill ≠ Permission.

Skills/Capabilities are the future bridge between Team & Access and Workforce, but Workforce remains the owner of workforce capability data and Team & Access remains the owner of authorization.

## 21. Relationship to Financial, Clinical and Agenda domains

Team & Access supplies authorization to other domains; it does not own their business logic.

```text
Financial → who may view/create/adjust/refund
Agenda    → who may view/create/update/manage
Clinical  → who may access protected clinical functions
Inventory → who may perform catalogued inventory actions
```

Business rules remain in the owning domain.

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

## 23. Features explicitly rejected

- Complex role inheritance hierarchy.
- Enterprise IAM/policy-engine complexity.
- Workspace-based security boundaries.
- Mandatory organizational departments.
- Fixed job-role authorization.
- Super Admin as a tenant operating role.
- A second permission engine.
- A second audit system.

## 24. Core / Advanced / Future-ready

### Core
Users; Workspaces; clinic-defined Roles; Role Templates; Permission Catalog; permission assignment; direct permissions/overrides; Effective Access; Access Explanation; User Settings; dynamic Sidebar/Workspace; Audit; tenant/security enforcement.

### Advanced
Permission Bundles as exposed configuration tools; Delegation; Skill/Capability; Change Impact Preview; advanced access analysis.

### Future-ready
Groups; advanced access review; skill-based assignment; AI access analysis; richer scoped administration.

## 25. Final reconciliation decisions

1. **Roles are fully independent from Permissions.**
2. **Clinic Admin may create and name roles freely within the selected Workspace.**
3. **Role templates are advisory and editable.**
4. **Permission Catalog is authoritative and Core.**
5. **Admin may grant any catalogued permission available to the tenant; the role name does not restrict the permission set.**
6. **Workspace is UX/work organization, not a security boundary.**
7. **Permission Bundles simplify templates/configuration; they do not replace the Permission Catalog.**
8. **Direct permissions and overrides remain supported.**
9. **Effective Access must be explainable.**
10. **Delegation is Advanced.**
11. **Skill/Capability is Advanced and belongs conceptually with Workforce, while remaining integrated with Team & Access.**
12. **User Settings belong to Team & Access.**
13. **Clinic Admin retains broad tenant operational authority; Super Admin remains outside tenant operations.**
14. **No enterprise IAM hierarchy is required.**
15. **No Team & Access capability may duplicate another domain's business logic.**

## 26. Implementation rule

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
