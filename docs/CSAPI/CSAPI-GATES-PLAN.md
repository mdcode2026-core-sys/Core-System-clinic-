# CSAPI — Decision Gates Plan

**Canonical branch:** `architecture/csapi-decision-gates-2026-09-16`
**Status:** ACTIVE
**Current Gate:** 01 — Patient Flow

## Operating principle

CSAPI is a sequential product/architecture decision process. Each Gate studies one coherent system area, verifies the current reality, reconciles prior decisions against implementation, identifies only genuine unresolved product decisions, obtains approval, then implements and verifies the approved outcome.

The Gate sequence is a working plan. It may change only through an explicit recorded decision.

## Gate lifecycle

OPEN → UNDER REVIEW → DECISION READY → APPROVED → IMPLEMENTED → VERIFIED → CLOSED → NEXT GATE

## Gates

### Gate 01 — Patient Flow
Patient movement/work inside the clinic visit: Queue, Clinical Visit, Pending Close, Reception Workflow, Completed, Procedure/Session boundaries, Treatment Plan relationship, Next Action, and Follow-up boundaries.

**Known baseline:** Queue → Clinical Visit → Pending Close → Reception Workflow → Completed.

### Gate 02 — Patient Journey
Longitudinal patient lifecycle over time, distinct from Patient Flow. Reconcile first contact, patient identity, appointment, visit, treatment, follow-up, and next journey action.

### Gate 03 — Patient & Identity
Canonical patient identity, clinic relationship, search, duplicates, history, insurance relationship, and portal relationship.

### Gate 04 — Agenda & Scheduling
Agenda as authoritative scheduling domain; Calendar as representation; provider/resource/room availability, conflicts, cancel/reschedule/no-show, and context preservation.

### Gate 05 — Clinical Care
Clinical Visit, clinical decisions, medical record, medical files, measurements, photos, procedures, sessions, and clinical documentation boundaries.

### Gate 06 — Treatment Planning
Treatment Plan lifecycle, stages, next actions, visit/session linkage, appointment linkage, and relationships to packages and financial commitments. A Treatment Plan is not required for every visit.

### Gate 07 — Procedures / Services / Packages / Offers
Reconcile Procedure, Service, Package, Offer, clinic customization, and commercial/clinical ownership boundaries against the live schema and ADR-005.

### Gate 08 — Financial & Commercial Flow
Commercial commitment, financial plan, installment, invoice, payment, refund, insurance, expense, revenue, and separation of financial concepts.

### Gate 09 — Workforce & Resource Eligibility
Employees/providers, skills, qualifications, availability, schedules, leave, rooms, devices, and procedure eligibility.

### Gate 10 — Inventory & Procurement
Clinical/resource consumption, inventory, lots/ledger, reorder, procurement, suppliers, receiving, obligations, and supplier payment.

### Gate 11 — Follow-up & Retention
Clinical/business events, follow-up, communication/notification, operational work, completion, and next journey action without creating a second workflow engine.

### Gate 12 — Communications & Chat
Clinic-wide authorized internal communication. Chat is a compact surface over Communications. Reconcile requests, attachments, directory, realtime, permissions, and audit.

### Gate 13 — Notifications & Operational Work
Explicit separation of Communication, Notification, and Operational Work; define event-to-output behavior and actor/completion boundaries.

### Gate 14 — Medical Files & Patient Portal
File metadata/storage, clinical relationship, annotations, measurements, AI analysis, portal release/access, permissions, and audit.

### Gate 15 — Analytics & Reports
Business Analytics and Clinical Analytics as distinct analytical views over integrated source data; unified report viewer; metric source-of-truth.

### Gate 16 — Subscription / Entitlement / Capability
Tenant, subscription, enabled modules, entitlements, capabilities, permission/access ceilings, feature flags, resource limits, and license lifecycle.

### Gate 17 — Security / Authorization
Authentication, roles, permissions, overrides, subscription ceilings, RLS, RPC security, tenant/branch isolation, and authorization boundaries.

### Gate 18 — Workflow / Automation / Events
Domain events, transitions, automation, cron, triggers, operational work, notifications, audit, idempotency/retry. Do not assume a centralized Workflow Engine is required; decide from evidence.

### Gate 19 — API / Integration Architecture
Server Actions, API Routes, Realtime, Storage, external integrations, future webhooks, and the rule that transport layers must not become a second business-logic engine.

### Gate 20 — Global Experience
Login, Home, Header, Sidebar, Workspace, My Workspace, Modules, responsive behavior, RTL/LTR, accessibility, Chat, Notifications, and context preservation. This Gate consumes prior domain decisions rather than redefining them.

## Gate change rule

If investigation reveals that a Gate must be split, merged, reordered, or supplemented, the change must be recorded in the CSAPI decision ledger with the reason, impact, and approval status.
