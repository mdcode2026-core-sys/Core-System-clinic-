# CSAPI — Historical Investigation Baseline

**Purpose:** Preserve the useful conclusions from the pre-CSAPI / post-129 investigation without making that work the CSAPI branch lineage.

## 1. Lineage rule

The historical investigation is knowledge input only.

CSAPI is independently based on `main` through:

`architecture/csapi-decision-gates-2026-09-16`

PR #129, #136, and their descendant/recovery branches are not CSAPI execution dependencies.

## 2. Why this baseline exists

The work around the Global Experience reconciliation exposed a broader system need: CORE SYSTEM has many implemented domains, cross-domain contracts, database workflows, permission layers, automation paths, and documentation decisions, but their relationships are not uniformly expressed as one product-level architecture.

The post-129 reconciliation work therefore became a useful source of evidence for a new, independent decision-gate track.

## 3. System-level findings carried into CSAPI

### Architecture

- CORE SYSTEM follows the principle **Independent Modules + Integrated Platform**.
- Domains are expected to be independently understandable while integrating through relationships, events, and shared source-of-truth data.
- Existing domain/application code, PostgreSQL functions/RPCs, triggers, cron, notifications, operational work, and RLS already implement significant business behavior.
- There is no single universal Workflow Engine/Registry today. Workflow behavior is distributed. CSAPI must decide whether consolidation is needed rather than assume that a new engine is required.
- API architecture exists but is not uniformly implemented as a pure transport boundary over application/domain services.

### Patient Flow / Patient Journey

- **Patient Flow** is the official product term for the patient's workflow during a clinic visit.
- Patient Flow is not a sidebar domain and not a new database engine.
- **Patient Journey** is distinct: it represents the longitudinal lifecycle of the patient across visits and time.
- Approved visit lifecycle baseline: **Queue → Clinical Visit → Pending Close → Reception Workflow → Completed**.
- Reception owns the reception workflow completion/drag-drop portion where applicable.
- Treatment Plan is an optional clinical planning construct and does not belong as a mandatory step in every visit.
- Follow-up is a cross-domain process and should not create a duplicate workflow engine.

### Agenda

- Agenda is the authoritative scheduling domain.
- Calendar is a representation of scheduled information, not a second scheduling engine.
- Availability, provider/resource/room constraints and conflict handling belong to scheduling/agenda logic.

### Communications

- Communications is clinic-wide internal communication among authorized clinic accounts.
- It is not a doctor-only system.
- Chat is a compact interaction surface over Communications.
- Notifications are a distinct system and should not be conflated with chat/communications.

### Permissions / subscription

- The permission model uses roles, permissions, role-permissions, clinic-user permissions/overrides and effective-permission functions.
- Subscription/entitlement architecture is intended to separate plan, entitlement, capability, and access rather than rely on one subscription-tier check.
- Live permission/RPC ACL and migration lineage require verification whenever a Gate touches authorization.

### Cross-domain integrity

The investigation identified many meaningful cross-domain relationships and several areas where tenant integrity, implementation coverage, migration history, or validation needed reconciliation. These findings are prompts for Gate verification, not automatic declarations that the current system is broken.

### Documentation

A recurring issue was documentation drift: older status documents can describe an earlier branch, PR, or implementation path even after later work changed reality. CSAPI therefore requires every Gate to distinguish current verified reality from historical documentation.

## 4. Important source categories

The previous investigation referenced or reconciled material including:

- Engineering Constitution
- Architecture Decisions / ADRs
- Master Roadmap
- Documentation Status
- Integrated Experience Work Contract
- Experience Decision Registry
- Experience F1–F4 Execution Handoff
- Scenario Register
- Cross-Domain Implementation Contracts
- Post-129 Complete System Reconciliation and Build Plan

These sources remain historical/reference material until their relevant statements are verified for the current CSAPI Gate.

## 5. Known architectural decisions relevant to future Gates

- `master_tenants` / `clinic_users` are the active tenant/user model; legacy tables are not to be reused simply because they exist physically.
- Permission engine is additive to RLS rather than a replacement for RLS.
- Subscription architecture is four-layered conceptually: Base Plan + Add-ons + Resource Limits + License Engine, with a lifecycle from Trial through Active/Grace/Suspended/Reactivated/Cancelled as previously designed.
- Branch-ready architecture exists conceptually; current operational tables remain tenant-scoped until a future multi-branch implementation decision.
- Procedure/Service/Package/Treatment Plan ownership is distinct and governed by the relevant cross-domain contracts.
- Everything is treated as a module conceptually, with feature/licensing/permission/configuration controls expected to evolve.
- Reports use a unified viewer rather than becoming a separate analytics system.

## 6. How to use this document

This file answers **"What valuable context came from the earlier investigation?"**

It does not answer **"What is the current implementation?"**. That must be verified for each Gate.

It does not authorize implementation.

It does not override a later approved CSAPI decision.
