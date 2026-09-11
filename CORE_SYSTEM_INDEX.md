# CORE_SYSTEM_INDEX.md

> Version: 1.4.1
> Status: Authoritative Reference
> Project: CORE SYSTEM
> Architecture: SaaS
> Owner: Yazeed Waleed
> Last Updated: 2026-09-11

---

# 2026-09-11 GLOBAL SURFACES CANONICAL RECONCILIATION

The canonical interpretation for **Header, Home, Role Workspace, My Workspace, Sidebar, Role, Primary Work Context, Permissions, Widgets and My Settings** is defined in:

`docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

That document is a reconciliation of existing approved architecture. It does not create a second architecture.

The following rules are mandatory across all current and future engineering documentation:

- **Primary Role / Job Function** identifies the user's primary professional function.
- **Primary Work Context / Classification** identifies the user's primary work area.
- **Role Workspace** is the user's primary professional work environment for that context.
- Additional/effective Permissions do **not** redefine Role, Primary Work Context or Role Workspace.
- Additional/effective Permissions may expand authorized Sidebar Domains, Widgets, My Workspace content and permitted actions.
- **My Workspace** is the user's personal working arrangement and personalization surface associated with the user's work context. It is not a second Role Workspace and not an authorization system.
- **Sidebar** is authorization/capability-driven navigation. Primary work classification must not suppress an otherwise authorized Domain.
- **Home** is an independent global starting/awareness surface. It is not Role Workspace and not My Workspace.
- **Header** is a persistent global access layer, not a work execution surface.
- **My Settings** remains a Sidebar destination for personal/account preferences.
- Clinical and Operational Workspaces remain their existing primary work environments; this reconciliation does not redesign them.
- Administrative Workspace remains a separate product work area and is not silently redesigned here.
- Technical identifiers such as `global` must not be treated as product-level synonyms for both Home and My Workspace.

When any older document uses broader or ambiguous Workspace terminology, it must be interpreted and, where necessary, marked/reconciled using the 2026-09-11 canonical document.

---

# IMPORTANT

This document is the official engineering reference for the project.

Every new development session MUST begin by reading this document before writing a single line of code.

No assumption is allowed.

No file may be modified without understanding its dependencies.

If information is missing, STOP and ask.

Never invent architecture.

Never invent routes.

Never invent database structures.

The repository is always the primary source of truth.

---

# 2026-09-01 WORKSPACE × PATIENT FLOW ENGINEERING PACKAGE

The following documents form the binding engineering package for the architectural decisions in `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`:

1. `docs/ENGINEERING-SPEC-WORKSPACE-PATIENT-FLOW-2026-09-01.md`
   - Complete engineering specification.
   - Defines ownership boundaries, required relationships, required changes, required non-changes, acceptance tests, and definition of done.

2. `docs/WORKSPACE-PATIENT-FLOW-ENGINEERING-TRACEABILITY-2026-09-01.md`
   - Architecture → engineering → execution → validation matrix.
   - Must be used to prevent isolated Workspace implementation and cross-layer regressions.

3. `docs/IMPLEMENTATION-PLAN-WORKSPACE-PATIENT-FLOW-FULL-2026-09-01.md`
   - Full implementation preparation and execution sequence.
   - Covers shell, Workspace, My Workspace, Patient Flow, clinical/operational work, Domains, permissions, database, security, regression and closure.

4. `docs/WORKSPACE-PATIENT-FLOW-FINAL-ENGINEERING-READINESS-REPORT-2026-09-01.md`
   - Final engineering readiness report and implementation boundary.

### Scope lock

These documents implement **only** the architectural decisions explicitly covered by the 2026-09-01 Workspace/Patient Flow decision document. They do not cancel unrelated architecture and do not authorize destructive deletion of older documentation containing unrelated valid material.

### Core invariants

- Workspace ≠ Role.
- Workspace ≠ Permission.
- Workspace ≠ Patient Flow.
- My Workspace is personal presentation inside Workspace, not a second authorization system.
- Home is distinct from Workspace and My Workspace.
- Authorized Domains remain visible in Sidebar even when outside the user's primary work context.
- Patient Flow remains the canonical workflow/state authority.
- Clinical Workspace evolves the previous provider/doctor board into a clinical-team work surface.
- Clinical completion hands off to the operational/reception workflow; it does not automatically close the entire visit.
- Clinic Admin remains outside the ordinary-user Workspace presentation model.

---

# PROJECT OVERVIEW

Project Name

CORE SYSTEM

Full Name

ClinicSaaS™ Multi-Tenant Clinic Management Platform

Project Type

Software as a Service (SaaS)

Current State

Under active development.

Target

A complete operating system for aesthetic clinics, dermatology clinics, laser centers and expandable to other medical specialties.

---

# PROJECT PHILOSOPHY

CORE SYSTEM is NOT:

- Appointment booking software.
- CRM only.
- Medical records only.
- Billing software only.

CORE SYSTEM combines:

- Clinic Operations
- Medical Workflow
- Reception
- Queue Management
- Scheduling
- Billing
- Inventory
- Patient Journey
- Staff Evaluation
- Business Intelligence
- Analytics
- Subscription Management

---

# ADR INDEX

- `ADR-013-OPERATIONAL-CAPABILITY-MODEL.md` — Operational Capability Model (Role / Permission / Capability / Skill / Qualification / Specialty Separation)
