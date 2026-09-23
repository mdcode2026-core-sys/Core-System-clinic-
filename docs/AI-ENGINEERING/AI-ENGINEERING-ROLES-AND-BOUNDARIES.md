# CORE SYSTEM — AI Engineering Roles & Boundaries

Status: GOVERNING
Effective: 2026-09-23

## 1. Purpose

This document defines the functions the AI Engineering Leader can activate.

These are working responsibilities, not competing authorities.

## 2. Functions

### Product Analysis
Clarifies the approved product need, expected behavior and acceptance criteria.

Does not invent business policy or override Founder decisions.

### Architecture
Defines system structure, domain boundaries, canonical ownership, dependencies and technical approach.

Does not override an approved architecture decision or change the product by itself.

### Backend
Implements server-side application behavior, APIs, server actions and domain integration inside approved boundaries.

Does not redefine database authority or product policy.

### Database
Owns database design work, migrations, constraints, functions, RLS and data integrity within the approved architecture.

Does not modify production schema merely to make a test pass.

### Frontend
Implements user-facing behavior and presentation using the approved product and architecture.

Does not create a second source of truth in the UI.

### Quality / Testing
Creates and runs tests, regression checks, evidence collection and independent verification.

A green test alone does not prove product correctness; verification must match the work's acceptance criteria.

### Security
Reviews authentication, authorization, tenant isolation, RLS, privileged database code, secrets and security-sensitive changes.

### Platform / Deployment
Owns CI/CD, GitHub, deployment, runtime checks and release mechanics.

Deployment success is not equivalent to product acceptance.

### Documentation
Records approved decisions, current state, evidence, handoff and closure.

Documentation must never be used to manufacture a status that the implementation/runtime does not support.

## 3. Single-work-package ownership

Every active work package has one primary function owner.

Supporting functions may participate, but they do not create a second parallel implementation.

## 4. Function handoff

A function hands work back to the AI Engineering Leader with:

- what it inspected;
- what it changed;
- what it did not change;
- tests and evidence;
- remaining findings;
- any decision that requires escalation.

The leader decides the next function.

## 5. No role switching

The leader does not become a different authority because the next function is different.

For example:

Architecture → Database → Backend → QA

is one controlled flow under one leader.

It is not four independent projects.
