# CORE_SYSTEM_INDEX.md

> Version: 1.1
> Status: Authoritative Reference
> Project: CORE SYSTEM
> Architecture: SaaS
> Owner: Yazeed Waleed

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
- Multi-Tenant SaaS Platform

Every future decision must preserve this philosophy.

---

# CORE ENGINEERING PRINCIPLES

These rules are mandatory.

1.

The system remains SaaS permanently.

No architectural decision may convert it into a single-clinic application.

---

2.

Every clinic is an isolated tenant.

No clinic may access another clinic's data.

Tenant isolation is mandatory.

---

3.

Database is the single source of truth.

Business logic must never duplicate database rules.

---

4.

Architecture is more important than speed.

Never choose shortcuts that weaken scalability.

---

5.

Every solution must be scalable.

If the solution only works today, reject it.

---

6.

Backward compatibility must always be preserved.

---

7.

Never break working code to solve another problem.

---

8.

Every modification must be justified.

---

9.

Never modify files that you do not fully understand.

---

10.

If repository code conflicts with assumptions:

Repository always wins.

---

# CURRENT PROJECT STATUS

Current Phase

Phase 5 — Invoicing

Status

Design

Reason

Phase 1, 2, 3, 4 Core Implementation complete.

Phase 4 remains in Progressive Validation with 2 suspended items.

Phase 5 design begins.

---

# CURRENT TECHNOLOGY STACK

Frontend

- Next.js App Router
- React
- TypeScript
- TailwindCSS

Backend

- Supabase

Authentication

- Supabase Auth

Database

- PostgreSQL

Hosting

- Vercel

Repository

- GitHub

Development Environment

- GitHub Codespaces

---

# PROJECT DIRECTORY RULES

The repository is the only authoritative reference.

Documentation never overrides code.

Every path must be verified inside the repository.

Never guess folder names.

Never recreate folders.

Never duplicate routes.

Never create "temporary" folders.

---

# ROUTING RULES

Current dashboard route

src/app/(dashboard)/page.tsx

This is the official dashboard page.

The following route is considered INVALID unless the repository changes:

src/app/(dashboard)/dashboard/page.tsx

This mistake already happened during development.

It caused multiple routing failures.

Before modifying routing:

Verify repository structure.

Do not assume.

---

# DEVELOPMENT RULES

Before editing any file:

Read it completely.

Read every imported dependency.

Understand where it is used.

Understand what depends on it.

Only then modify it.

Never edit files blindly.

---

# MODIFICATION POLICY

Before changing any file the developer MUST answer:

What does this file do?

Who imports it?

What imports will break?

What routes depend on it?

What database tables depend on it?

What authentication logic depends on it?

What middleware depends on it?

If these answers are unavailable:

STOP.

Ask.

Do not modify.

---

# FILE CREATION POLICY

Never create new files unless ALL conditions are met.

Condition 1

No existing file already performs the same task.

Condition 2

The new file integrates correctly with the project.

Condition 3

The file naming follows project conventions.

Condition 4

Dependencies are verified.

Condition 5

Repository owner approves.

Otherwise:

Do not generate files.

---

# DATABASE POLICY

The database already exists.

Never recreate it.

Never redesign it.

Never generate schema from imagination.

Always inspect the current schema first.

Existing objects include:

Tables

Foreign Keys

Indexes

Functions

Triggers

Policies

RLS

JWT Hook

These are considered production assets.

Changes require verification.

---

# AUTHENTICATION POLICY

Authentication uses:

Supabase Auth

Project users are created through the official signup flow.

Authentication must never bypass Supabase.

Never store passwords manually.

Never duplicate authentication tables.

---

# MULTI TENANT POLICY

Every business entity belongs to one tenant.

Tenant isolation is mandatory.

Every protected query must respect tenant boundaries.

No exception.

---

# SUBSCRIPTION MODEL

Project type:

SaaS

Every clinic owns exactly one active subscription.

Registration starts a free trial.

Trial duration

14 days.

When the trial expires

Clinic access is suspended unless activated.

Activation occurs only through Super Admin.

Subscriptions are part of the architecture.

They are NOT optional.

---

# SUPER ADMIN RESPONSIBILITIES

Only Super Admin may

Activate subscriptions.

Reactivate expired clinics.

Suspend clinics.

Manage subscription lifecycle.

Override tenant status.

No clinic administrator may perform these actions.

---

# PROJECT OWNERSHIP

The project owner is NOT a programmer.

Therefore:

Every explanation must be written in simple language.

Avoid unnecessary technical jargon.

Explain decisions before implementation.

Never assume programming knowledge.
# PROJECT STATUS

## Current Development Status

Project State

Active Development

Architecture

Stable

Production

NO

Current Phase

Phase 5 — Invoicing

Completion

Design (0%)

Phase 5 cannot begin implementation until design is approved.

---

## Phase 1 Objectives

Status: CLOSED

Authentication works.

Database exists.

Subscription bootstrap exists.

Dashboard routing stable.

Middleware validated.

JWT Claims validated.

RLS production verified.

---

## Phase 2 Objectives

Status: CLOSED

Patients Module complete.

---

## Phase 3 Objectives

Status: Progressive Validation

Agenda Module Core Implementation 85%.

Pending real data testing.

---

## Phase 4 Objectives

Status: Progressive Validation

Queue Module Core Implementation 85%.

Build successful.

RLS bugs resolved.

Legacy tables unified.

2 items suspended pending MyQueueView readiness.

---

## Phase 5 Objectives

Status: Design

Invoicing Module.

Pending design approval.

---

## Phase Completion Rule

A phase is NOT completed because code exists.

A phase is completed only when

Code exists.

Architecture is correct.

Dependencies are verified.

Manual testing passes.

Regression testing passes.

Documentation updated.

Only then may the next phase begin.

---

# CURRENT KNOWN PROBLEMS

The following issues are officially recognised.

They must never be forgotten.

---

Issue 001

Dashboard Routing

Description

Dashboard route repeatedly failed because incorrect path assumptions were made.

Correct route

src/app/(dashboard)/page.tsx

Incorrect route

src/app/(dashboard)/dashboard/page.tsx

This mistake already consumed many development hours.

Before changing routing

Verify repository.

Never assume.

Status: RESOLVED

---

Issue 002

Repeated Solutions

Several fixes were proposed repeatedly although they had already failed.

This is prohibited.

Whenever a solution fails

Record it.

Understand why.

Never suggest it again without new evidence.

---

Issue 003

Blind File Modification

Files were modified without fully understanding dependencies.

Result

New problems appeared.

New Rule

No file may be edited before dependency analysis.

---

Issue 004

Console Dependency

The project owner develops almost entirely from a mobile phone.

Developer must NOT depend on

Browser Console

Developer Tools

Network Tab

Local debugging

unless absolutely unavoidable.

Whenever possible

Create server-side diagnostics.

Explain exactly what information is required.

---

Issue 005

Artificial File Creation

Temporary files were repeatedly generated.

This increases project complexity.

New Rule

Never create helper files unless they become permanent project assets.

---

Issue 006

RLS Bugs

Description

3 RLS policies had critical flaws.

Status: RESOLVED

Policies fixed:

- rls_sessions_write_role_check
- rls_invoices_doctor_read
- rls_audit_read (includes receptionist)

---

Issue 007

Legacy Tables

Description

users vs clinic_users and tenants vs master_tenants caused data inconsistency.

Status: RESOLVED

AuthProvider now reads from clinic_users.

subscriptions and subscription_events FKs now point to master_tenants.

---

Issue 008

isDoctor Manual Flag

Description

queue/page.tsx uses isDoctor = false manually.

Status: SUSPENDED

Will be resolved when MyQueueView is production ready.

---

# OWNER CONSTRAINTS

Project Owner

Yazeed Waleed

Programming Experience

Limited

Preferred Communication

Simple Arabic.

No unnecessary technical language.

Explain decisions before implementation.

---

Available Devices

Primary Device

Android Phone

Computer

Limited availability.

Developer must minimise any requirement that depends on desktop debugging.

---

Decision Making

Developer provides

Options

Advantages

Disadvantages

Recommendation

Owner makes final decision.

No architectural decision may be taken without approval.

---

# COMMUNICATION RULES

Every answer must follow this order.

1.

Problem Summary

2.

Root Cause

3.

Evidence

4.

Recommended Solution

5.

Expected Impact

6.

Risk Level

7.

Files Affected

8.

Waiting For Approval

Never skip this structure.

---

If information is missing

Do not guess.

Ask.

Wait.

Continue only after receiving clarification.

