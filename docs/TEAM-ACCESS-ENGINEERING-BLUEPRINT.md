# CORE SYSTEM — Team & Access Engineering Blueprint

**Status:** Final pre-implementation engineering reference  
**Domain:** Team & Access  
**Scope:** Tenant / Clinic operational environment only  
**Authority:** Domain reconciliation reference; implementation must conform to the decisions in this document unless a later explicit architectural decision supersedes it.

---

## 1. Purpose

Team & Access provides the clinic with a flexible way to organize its users and control what each user can do inside CORE SYSTEM.

The domain must **not prescribe how a clinic is organized**. The clinic decides its own roles, responsibilities, staffing model, and permission distribution.

CORE SYSTEM provides:

- Workspaces as working environments.
- Clinic-defined roles.
- A complete Permission Catalog.
- Suggested Role Templates.
- Permission Bundles / Sets for easier configuration.
- Direct user permissions and overrides.
- Effective-access calculation.
- Administrative visibility and auditability.
- User settings.
- Future-ready foundations for Skills / Capabilities and other advanced access intelligence.

The guiding principle is:

> **CORE SYSTEM provides the structure and capabilities; the Clinic Admin decides how the clinic uses them.**

---

# 2. Architectural Position

## 2.1 Tenant boundary

This domain operates inside the clinic tenant.

**Super Admin is explicitly outside the clinic operating environment.**

Super Admin belongs to the separate future Platform Governance / Subscription stage and is not part of the Team & Access model used by tenant staff.

The clinic must never be modeled as if Super Admin is another employee of the clinic.

---

## 2.2 Clinic Admin

Clinic Admin is the highest operational authority inside the tenant.

Clinic Admin may, subject to non-bypassable platform/security/legal controls:

- Create users.
- Define and rename roles.
- Create additional roles.
- Assign users to roles.
- Assign permissions through roles.
- Grant direct permissions.
- Modify or override permissions.
- Delegate appropriate administrative capabilities.
- Configure user access and settings.
- Review activity and effective access.

The system must not impose an artificial organizational structure on the clinic.

---

# 3. Core Model

The permanent conceptual model is:

```text
User
  ↓
Workspace(s)
  ↓
Clinic-defined Role (optional organizational label)
  ↓
Suggested Template / Permission Bundles
  ↓
Permission Catalog
  ↓
Direct Permissions / Overrides
  ↓
Effective Permissions
  ↓
Available modules + permitted actions
  ↓
Personalized Workspace / Sidebar / Widgets
```

Important distinctions:

```text
Role       ≠ Permission
Workspace  ≠ Permission boundary
Skill      ≠ Permission
Template   ≠ Permission grant by itself
Bundle     ≠ Role
Visibility ≠ Ability to perform every action
```

---

# 4. Workspace Architecture — Reconciled Position

The existing Workspace architecture remains the foundation.

The current repository already establishes Workspace as the primary operational environment and uses permission-driven visibility rather than role-name checks. The Workspace specification also defines Feature Registry integration and widget-level permission validation.

Reference:

- `WORKSPACE_ARCHITECTURE_SPECIFICATION.md`
- `src/core/workspace/`
- `src/core/permissions/`

The three tenant workspaces remain:

```text
Administrative
Operation
Clinical
```

### Critical decision

A Workspace is a **working environment and UX organization mechanism**, not an authorization boundary.

A user may receive permissions that are not traditionally associated with the workspace in which they work.

Example:

```text
Operation user
+ Payments permission
+ Inventory permission
+ Follow-up permission
```

This is valid.

The system must not reject such assignments merely because the permission belongs to another functional area.

---

# 5. Role Model

## 5.1 Roles are clinic-defined

Roles are organizational constructs owned by the clinic.

The Clinic Admin may:

- Create roles.
- Rename roles.
- Duplicate roles.
- Modify roles.
- Retire roles.
- Create as many roles as the product's permitted limits allow.

Examples:

```text
Clinical
  Doctor
  Laser Specialist
  Senior Nurse

Operation
  Front Desk
  Patient Coordinator
  Reception + Inventory

Administrative
  Clinic Manager
  Finance Manager
  Owner
```

These are examples only.

CORE must not assume that a clinic has any of these roles.

## 5.2 No mandatory role hierarchy

CORE must not require a complex role inheritance hierarchy.

Avoid:

```text
Role A → Role B → Role C → Role D
```

because it makes effective access difficult to understand and audit.

The preferred model is explicit and explainable:

```text
Role
+ Permission Bundles
+ Direct Permissions
+ Overrides
→ Effective Access
```

---

# 6. Permission Catalog

The Permission Catalog is a **core architectural component**.

It is the authoritative catalog of capabilities that can be granted inside the tenant.

A permission should be identifiable by a stable key and organized conceptually as:

```text
Workspace / Area
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

The exact key set must be reconciled against the current repository before implementation changes are made.

### Non-negotiable rule

The Clinic Admin may only grant permissions that exist in the CORE Permission Catalog.

The Admin may freely combine them, but cannot invent a permission outside the catalog.

---

# 7. Role Templates

Role Templates are **guidance and acceleration**, not authority.

A template may provide a sensible starting configuration for common clinic jobs.

Example:

```text
Front Desk Template
  → Patient Management
  → Agenda Basic
  → Basic Payments
```

After applying a template, the Clinic Admin may:

- Add permissions.
- Remove permissions.
- Replace permissions.
- Assign a different workspace.
- Rename the role.
- Duplicate and modify it.

Templates must never become a hidden mandatory policy.

---

# 8. Permission Sets / Permission Bundles

Permission Bundles are an approved enhancement inspired by mature modular access models such as Salesforce Permission Sets / Permission Set Groups.

Their purpose in CORE is simplicity of configuration, not additional authorization complexity.

Example:

```text
Inventory Basic Bundle
  inventory.read
  inventory.create

Inventory Advanced Bundle
  inventory.adjust
  inventory.transfer
  inventory.advanced_reports
```

Bundles may be used by Role Templates and by administrators during configuration.

The underlying Permission Catalog remains authoritative.

A Bundle is not a new permission layer that can bypass the catalog.

---

# 9. Direct Permissions and Overrides

The current repository already contains the concept of user permission overrides and an effective-permission calculation path.

The existing `permissionEngine.ts` resolves effective access from role permissions and user overrides.

This architecture is retained and reconciled with the final model.

The conceptual resolution is:

```text
Role Permissions
        +
Direct User Permissions
        +
Explicit Overrides
        ↓
Effective Permissions
```

The implementation must keep the resolution deterministic and explainable.

---

# 10. Effective Access

Effective Access is a **core administrative capability**.

Clinic Admin should be able to inspect a user and understand what the user can actually do without tracing database records manually.

Example:

```text
User: Ahmad
Workspace: Operation
Role: Front Desk

Effective Access
----------------
Patients       ✓
Agenda         ✓
Payments       ✓
Inventory      ✓
Refund         ✕

Source
----------------
Patients       Role
Agenda         Role
Payments       Direct
Inventory      Override
```

The source of access should be explainable wherever technically applicable.

---

# 11. Access Explanation

CORE should answer:

> **Why does this user have this permission?**

Possible explanations:

```text
Granted by Role
Granted directly to User
Granted by Permission Bundle
Added by Override
```

This is a usability feature as much as an administrative feature.

It reduces training requirements and prevents unexplained access configurations.

---

# 12. Delegation

Delegation is an approved capability for the advanced Team & Access model.

Clinic Admin may delegate selected administrative capabilities to another user.

The delegated user cannot grant capabilities that exceed the delegation granted to them or bypass platform-level safety controls.

Delegation must remain explicit and auditable.

CORE should not introduce a large enterprise-style administrative hierarchy merely to support delegation.

---

# 13. User Settings

User Settings belong to Team & Access.

They are conceptually separate from authorization.

```text
User
├── Identity
├── Workspace
├── Role
├── Permissions
├── Overrides
└── Preferences / Settings
```

Changing a preference must not silently change permissions.

Changing permissions must not silently modify personal preferences.

---

# 14. Personalized Sidebar and Workspace

The Sidebar and Workspace content must be driven by the user's effective access and enabled tenant capabilities.

Conceptually:

```text
Tenant Capability Available
          AND
User Effective Permission
          ↓
Available Module / Action
          ↓
Relevant Sidebar + Workspace content
```

The user should see only what is relevant and permitted.

However, the Clinic Admin's ability to configure access must not be constrained by a predefined job title.

This supports both:

### Small clinic

```text
Owner / Doctor / Clinic Admin
+
One Receptionist
```

The receptionist may legitimately receive a combination of Patient, Agenda, Payments, Inventory, and Follow-up permissions if the clinic chooses that operating model.

### Larger clinic

A clinic may have many clinical specialists and reception staff while having no dedicated inventory or finance employee. Existing employees can be assigned those responsibilities without creating artificial users or departments.

---

# 15. Administrative Oversight

Clinic Admin must have tenant-wide operational visibility appropriate to their authority.

This does not mean that Administrative Workspace is the only place where administrative capabilities exist.

The Admin should be able to understand activity across:

- Administrative Workspace.
- Operation Workspace.
- Clinical Workspace.

### Important distinction

```text
Visibility ≠ Action
```

An Admin may need to see an operation performed by another user without the system assuming that every visible item grants the same action permission to every user.

Clinic Admin's own broad authority is a separate matter from ordinary user access.

---

# 16. Audit and Accountability

Audit is part of the domain's foundation.

The system must preserve accountability for important Team & Access changes, including where applicable:

- User creation.
- User activation/deactivation.
- Role creation/modification/retirement.
- Permission assignment changes.
- Direct permission changes.
- Overrides.
- Delegation.
- Sensitive administrative actions.

The purpose is not to police the clinic's organizational decisions.

The purpose is to provide a reliable history of **who changed what, when, and where applicable why**.

---

# 17. Advanced Skill / Capability Model

**Skill / Capability is approved as an Advanced feature.**

It must remain separate from Role and Permission.

```text
Role
  = organizational function

Permission
  = system capability

Skill / Capability
  = what the person is qualified / capable of performing
```

Example:

```text
Role:
Procedure Specialist

Permissions:
agenda.update
patients.read
followup.manage

Skills:
Laser
RF
Device X
Skin Procedure A
```

This model is intended to support future:

- Scheduling.
- Capacity optimization.
- Task assignment.
- Workforce intelligence.
- Patient Journey coordination.
- AI-assisted recommendations.

The advanced Skills system should not be implemented as part of the basic Team & Access scope unless a later implementation plan explicitly activates it.

---

# 18. Advanced Change Impact Preview

Change Impact Preview is an approved advanced usability enhancement.

Before a significant access change is saved, CORE may show its expected impact.

Example:

```text
Removing: payments.refund

Affected users: 3
Affected roles: 1
Affected workspace views: 1

[Confirm Change]
```

This is advisory, not a policy engine.

The Admin remains the decision maker.

---

# 19. Groups — Future Ready, Not Core

Groups may become useful for larger clinics, team communication, task routing, or future workforce capabilities.

However, Groups are **not a mandatory authorization layer** in the current model.

Do not introduce:

```text
User → Group → Role → Permission
```

as the required access path.

The architecture should remain extensible enough to add groups later without replacing the core model.

---

# 20. Features Explicitly Rejected

The following are intentionally outside the current Team & Access architecture:

### Complex Role Hierarchy

Rejected because it makes effective access difficult to understand.

### Enterprise IAM / Policy Engine

Rejected as unnecessary complexity for the clinic operating model.

### Workspace-based Security Boundaries

Rejected. Workspaces organize work; permissions control capabilities.

### Mandatory Organizational Departments

Rejected. Clinics define their own structure.

### Fixed Job-role Authorization

Rejected. A role is an organizational label and suggested configuration, not an immutable permission boundary.

### Super Admin inside tenant operations

Rejected. Super Admin belongs to Platform Governance outside the tenant operating cycle.

---

# 21. Relationship to Patient Journey (PJ)

Team & Access is an **administrative domain**.

It does not define the Patient Journey and does not prescribe how the patient journey should operate.

Its relationship to PJ is indirect and outcome-oriented.

Example:

```text
Clinic decision
   ↓
User / Role / Permission assignment
   ↓
Operational execution
   ↓
Operational data
   ↓
Performance / Analytics
   ↓
Patient Journey outcome
```

Therefore:

> Team & Access must enable the clinic's chosen operating model without embedding Patient Journey rules into its authorization model.

PJ-related outcomes may consume Team & Access data for analysis, accountability, workforce optimization, and future AI assistance.

---

# 22. Relationship to Workforce & Operations

Team & Access and Workforce & Operations are separate domains.

Team & Access answers:

> **Who is this person and what are they allowed to do?**

Workforce & Operations answers questions such as:

> **When are they available?**  
> **What capacity do they have?**  
> **What work are they assigned?**  
> **How productive is the operation?**

The domains integrate but must not duplicate one another.

Skills / Capabilities are the principal future bridge between them.

---

# 23. Relationship to Financial, Clinical, Agenda and Other Domains

Team & Access supplies authorization to those domains but does not own their business logic.

Examples:

```text
Financial
  → Team & Access decides who may view/create/adjust/refund.

Agenda
  → Team & Access decides who may view/create/update/manage.

Clinical
  → Team & Access decides which users may access permitted clinical functions.

Inventory
  → Team & Access decides which users may perform catalogued actions.
```

The target architecture is:

```text
Domain business logic
        ↑
Permission enforcement
        ↑
Team & Access
```

not duplicated business logic inside Team & Access.

---

# 24. Subscription / Entitlement Relationship

Subscription / entitlement determines whether a capability is available to the tenant.

Team & Access determines whether a particular user may use an available capability.

Conceptually:

```text
Tenant Entitlement
       AND
User Effective Permission
       ↓
Effective Capability
```

A permission must never be used to bypass a tenant-level entitlement.

Conversely, an enabled tenant feature must not automatically grant every user permission to operate it.

---

# 25. Existing Repository Baseline

The repository already contains significant foundations that must be reused rather than rebuilt.

### Existing foundations identified

- Workspace Architecture Specification.
- Permission Engine.
- `getEffectivePermissions()` path.
- Role permissions.
- User permission overrides.
- Permission-driven Workspace / Widget visibility.
- Feature Registry integration.
- User/tenant access structures.
- Permission verification tooling/checklists.

The Workspace specification explicitly states that widget visibility is permission-driven and must not check role names or employee types. It also establishes Feature Registry integration and widget-level permission checks.

The current permission engine already resolves effective permissions from role permissions and user overrides.

### Reconciliation requirement

Existing fixed role/type definitions and any role-name assumptions must be reviewed during implementation so they do not conflict with the approved clinic-defined Role model.

No wholesale rewrite of the existing Workspace architecture is intended.

---

# 26. Basic vs Advanced Scope

## Basic — Required

```text
Users
Workspaces
Clinic-defined Roles
Role Templates
Permission Catalog
Permission assignment
Direct user permissions
Overrides
Effective Access
Access explanation
User Settings
Audit
Tenant entitlement enforcement
Permission-driven Sidebar / Workspace
Clinic Admin oversight
```

## Advanced — Planned capability

```text
Permission Bundles / Sets
Delegation
Change Impact Preview
Advanced access analysis
Skill / Capability
```

## Future-ready only

```text
Groups
Advanced access review
Skill-based assignment
Workload-aware access intelligence
AI access analysis
```

The system may prepare architectural/data foundations for future capabilities without exposing unnecessary complexity in the current user experience.

---

# 27. UX Principle

The central UX requirement is:

> **Simple on the surface, powerful underneath.**

A new employee should be able to understand their available workspace and actions without learning an enterprise IAM system.

Clinic Admin should be able to configure sophisticated combinations of responsibilities without needing technical knowledge.

The complexity should live primarily in:

- Permission resolution.
- Catalog structure.
- Audit history.
- Effective-access calculation.
- Data relationships.
- Future analytics and AI readiness.

It should not live in daily navigation.

---

# 28. AI Readiness

Team & Access must preserve structured data sufficient for future AI agents to understand:

- Who works in the clinic.
- Which workspace they use.
- What role the clinic assigned them.
- Which permissions they possess.
- Which permissions were direct or inherited from a template/bundle.
- Which overrides exist.
- Which changes occurred over time.
- Which operational domains they interact with.
- Future skills/capabilities.

The objective is to allow future AI systems to reason about the clinic's operating model from the beginning rather than waiting for years of specially formatted data to accumulate.

AI must not become a hidden authorization authority. Authorization remains deterministic and system-controlled.

---

# 29. External Benchmarking — Adopted Principles

External benchmarking was used for patterns, not for copying another product's organizational model.

### Salesforce

Useful pattern adopted:

- Modular Permission Sets / Permission Set Groups.
- Reusable permission configuration rather than relying exclusively on one rigid role/profile.

CORE simplifies this into Permission Bundles and Templates while retaining explicit permissions.

### Microsoft Entra

Useful pattern adopted:

- Separation between permission definitions and assignments.
- Clear distinction between what a role/capability means and where it is assigned.

CORE applies this through the Permission Catalog and explicit user/role assignments.

### ServiceNow

Useful patterns adopted selectively:

- Delegation.
- Effective administrative access concepts.
- Skills as a distinct capability from roles.
- Administrative visibility and auditability.

Patterns rejected:

- Enterprise-scale role/group complexity as a requirement for normal clinic use.
- Deep role hierarchies that make access difficult to understand.

The benchmark therefore **supports and refines the CORE model; it does not replace it.**

---

# 30. Implementation Guardrails

When implementation begins:

1. Inspect the current repository implementation first.
2. Reuse existing Workspace, Permission Engine, Feature Registry and override mechanisms wherever possible.
3. Do not rebuild existing architecture without evidence that reconciliation requires it.
4. Remove fixed role assumptions that conflict with clinic-defined roles.
5. Build the Permission Catalog as the authoritative capability vocabulary.
6. Keep Role and Permission independent.
7. Keep Workspace and Permission independent.
8. Keep Skills separate from Permissions.
9. Keep Super Admin outside the tenant operating model.
10. Keep domain business logic outside Team & Access.
11. Preserve auditability for access changes.
12. Keep the daily UX simple even when the backend model is sophisticated.
13. Ensure Sidebar/Workspace rendering responds dynamically to effective access.
14. Ensure entitlement gating and user authorization remain separate checks.
15. Do not introduce enterprise IAM complexity unless a later explicit decision requires it.

---

# 31. Final Architectural Statement

The approved Team & Access philosophy is:

> **CORE SYSTEM does not tell a clinic how to organize its people. It gives the Clinic Admin the freedom to define the clinic's own roles, assign responsibilities, and distribute permissions according to the actual operating model of that clinic. Workspaces organize the user experience; the Permission Catalog defines what the system can authorize; roles provide organizational context and reusable templates; direct permissions and overrides provide flexibility; effective access makes the result understandable; audit provides accountability; and advanced Skills / Capabilities prepare the system for workforce intelligence and future AI.**

The clinic owns the operational decision.

CORE owns the integrity, security, traceability, and consistency of the system that executes that decision.

This document is the engineering reference to use when the Team & Access implementation plan is opened.
