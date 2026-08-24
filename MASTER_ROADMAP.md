# MASTER_ROADMAP.md

> CORE SYSTEM — ClinicSaaS™ Multi-Tenant Clinic Platform

**Status:** APPROVED / CURRENT ROADMAP FRAMEWORK
**Last reconciled:** 2026-08-24

## 1. Purpose

This document defines product direction and sequencing. It is not a replacement for the Patient Journey stage workflow. PJ stages are the active execution track for Patient Journey work.

## 2. Source-of-truth rule

For implementation reality, the repository and live Supabase database are authoritative. Accepted ADRs govern architecture unless superseded. PJ-MASTER-DOCS and approved PJ decisions govern Patient Journey scope. This roadmap governs product direction only.

## 3. Current Product State

The project has moved from the historical Milestone 1/2/3 session workflow into the PJ stage-based execution workflow for Patient Journey completion and reconciliation.

### PJ status

- Stages 0–10: closed.
- Stage 11: closed.
- Stage 12: phase-closed after manual verification; Patient Portal architecture is governed by `ADR-012-PATIENT-PORTAL.md`.
- Stage 13: completed.
- Stage 14: completed; temporary test seed removed.
- Stage 15: completed for current scope; persistent integrated E2E data established for subsequent administrative stages.

## 4. Product Architecture

CORE SYSTEM remains a multi-tenant clinic platform built around:

- tenant isolation;
- Clinic Admin as tenant administrator;
- Super Admin as platform owner/lessor;
- permission-driven capabilities;
- independently activatable modules;
- subscription-controlled modules/capabilities;
- Patient Internal Journey as a core platform journey;
- Patient Portal as an external patient-facing layer controlled by subscription and the approved portal architecture.

`clinic_owner` is retired and must not be reintroduced.

## 5. Patient Journey

Patient Journey is the current implementation stream. The canonical Patient Journey documentation is maintained outside this roadmap and reconciled with actual implementation at every stage closure.

The persistent E2E dataset is documented in `PJ_E2E_DEMO_DATASET.md` and is retained for future administrative and regression work.

## 6. Historical Milestones

The older Milestone 1/2/3 material remains valuable as architectural history but is not an active implementation queue. Historical Milestone 3 / Session 11 documents have been archived.

The old Milestone 2 gap and the old "Milestone 3 current" statement are therefore no longer active planning blockers. Future administrative work should be defined against the current PJ state and accepted architecture, not by reopening archived packages.

## 7. Product Direction After PJ

Following Patient Journey closure, remaining platform work is expected to proceed through administrative, operational, reporting, subscription and production-readiness stages as separately approved scopes.

Potential areas include:

- Tenant Administration Center completion and reconciliation;
- users, permissions and overrides administration;
- system and notification settings;
- subscription and entitlement administration;
- operational reporting and analytics expansion;
- inventory and catalog enhancements;
- clinical/business module expansion;
- platform administration;
- integrations and realtime capabilities;
- production readiness and final QA.

No item above is an implementation instruction until its current scope is approved and reconciled against repository/database reality.

## 8. Transition Policy

A stage or milestone is closed only after its accepted scope is implemented and reconciled against the actual repository and database, with appropriate build/runtime/manual verification and documentation updated.

A historical document cannot reopen a closed stage or override a later accepted architectural decision.

## 9. Documentation

The documentation authority and freshness registry is `DOCUMENTATION_STATUS.md`. The living operational state is `PROJECT_HANDOFF.md`. Historical changes are recorded in `CHANGELOG.md`.

Before any future schema-sensitive work, use the current `DATABASE_SCHEMA.md` and verify against live Supabase.
