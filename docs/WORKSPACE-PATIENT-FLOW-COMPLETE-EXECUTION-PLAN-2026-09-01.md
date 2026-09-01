# CORE SYSTEM — COMPLETE EXECUTION PLAN
## Workspace × Patient Flow × Home × Search × Navigation × Widgets
### 2026-09-01

**Status:** PRE-CODE — COMPLETE SCOPE
**Authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`
**Companion:** `docs/WORKSPACE-PATIENT-FLOW-COMPLETE-DECISION-COVERAGE-MATRIX-2026-09-01.md`

## 0. Scope

This plan executes every approved decision in the 2026-09-01 architecture document. It is not permission to redesign the rest of CORE SYSTEM.

The implementation must be complete across UI, workflow, domain integration, authorization, persistence, database, i18n, responsive behavior and runtime validation.

## 1. Pre-code inventory

Before changing any source:

- map all dashboard/shell routes;
- map Home and all Home widgets/cards/data sources;
- map Header and Global Search implementation or missing infrastructure;
- map Sidebar registry, route guards and Domain registry;
- map Workspace resolution/membership and all Workspace routes;
- map My Workspace widgets, registry and persistence;
- map My Settings;
- map Queue/Patient Flow engine and transitions;
- map Visit/session/clinical actions;
- map Room/Procedure/Agenda integration points;
- map Patient Context/contextual navigation;
- map Permission Engine and effective permissions;
- map Clinic Admin routes and administration center;
- map database tables/functions/RLS/migrations;
- map Arabic/English translations and RTL/LTR behavior;
- map mobile/responsive behavior;
- inspect git history for prior correct behavior where current code has regressed.

Output: file-by-file truth map and change/no-change decision for every affected artifact.

## 2. Shell and navigation

### 2.1 Login destination
Change ordinary-user post-login behavior so Home is the landing surface. Do not apply this ordinary-user behavior to Clinic Admin without verifying the existing administrative entry architecture.

### 2.2 Header
Preserve branding, language and user identity presentation. Integrate one Global Search bar into the authenticated shell.

### 2.3 Sidebar
Produce the exact ordinary-user conceptual order:

`Home → Workspace → My Workspace → authorized Domains → My Settings`.

Sidebar Domain visibility must use effective authorization. Primary work classification must not hide an authorized Domain.

Do not delete unrelated existing Domain entries merely because Workspace has changed.

## 3. Home

Reconcile the existing Home implementation into a general clinic-day information surface.

For each current/proposed Home element, classify it as:

- daily information;
- attention/reminder;
- notification/communication;
- patient/clinic activity summary;
- Patient Portal information;
- Work Center information;
- utility/ambient information;
- action that belongs elsewhere.

For every retained Home widget/card identify source, owner, permission, tenant scope, refresh behavior, states, i18n and responsive behavior.

Do not duplicate Workspace operational work or create Home-owned workflow transitions.

## 4. Global Search

Inspect for an existing search implementation before creating anything.

If sufficient infrastructure exists, extend it. If it cannot satisfy the approved multi-domain requirement, create the smallest canonical search service/index/query layer required.

Build one authorization-aware search contract covering the approved record classes where domains/data exist.

Define ranking, result typing, context, direct navigation, loading, empty, error and privacy/no-leak behavior.

Validate Arabic/English search behavior against the actual data model; do not promise linguistic features unsupported by the chosen search mechanism.

## 5. Workspace

Preserve the canonical Workspace engine and assignment model where valid.

Separate internal functional classification from ordinary-user-facing label.

Ensure Workspace content can consume current work from Patient Flow/Domain contexts without becoming the state owner.

Clinical and Operational work surfaces must be genuinely different in work, while remaining one conceptual Workspace model for the ordinary user.

## 6. My Workspace and Widget system

Reconcile the existing Widget registry and persistence.

For every existing Widget:

- map capability;
- permission;
- type;
- context;
- default;
- destination;
- state behavior;
- i18n;
- responsive behavior.

Add missing widgets only where the approved requirements and real workflow justify them.

Implement complete supported personalization: add/remove/show/hide/reorder/drag/drop/reset/scroll.

Ensure presentation persistence is isolated correctly and never changes authorization.

## 7. Clinical Workspace

Replace provider/doctor-only assumptions with clinical-team capability/context resolution where the current implementation still hard-codes the physician as the owner of all clinical work.

Integrate:

`Patient Flow → current patient/visit → required work → clinical capability → permitted actions → handoff`.

Use authoritative Visit/Procedure/Room/Medical record domains instead of copying their business logic into Workspace.

Preserve clinical lock and transition validation.

## 8. Operational Workspace

Expose operational work from the canonical Queue/Patient Flow and operational Domains.

Preserve reception-to-clinical and clinical-to-reception handoffs.

Do not create duplicate Queue/Patient/Agenda/Billing logic.

## 9. Patient Flow / Queue

Inspect and preserve the canonical transition engine.

Validate:

`Arrival → Waiting → Clinical handoff → Clinical work → Pending Close → Operational/Reception → Completed`.

Validate `cancelled` and `no_show` paths where already authoritative.

Any Workspace action must call the canonical transition authority. No client-only state mutation.

Preserve lock, revalidation, audit and invalidation behavior.

## 10. Patient Context

Reconcile contextual navigation so an authorized patient context can reach relevant existing Domains without merging them.

Preserve patient/visit context where appropriate and preserve all route-level authorization.

## 11. Permissions and tenant security

No new authorization engine.

Validate effective permission at every relevant:

- Sidebar entry;
- Workspace Widget;
- Widget action;
- Search result;
- contextual navigation destination;
- Patient Flow mutation;
- Clinic Admin action.

Validate RLS/tenant isolation independently from UI visibility.

## 12. Database and migrations

Inspect actual schema versus repository migrations before writing migrations.

Reuse existing Workspace/widget/patient-flow data structures where valid.

Only create schema objects if the approved requirement cannot be represented safely with the existing model.

Record all schema changes in repository migrations and validate against live schema before deployment.

## 13. i18n and responsive

Validate every affected visible surface in Arabic and English, including empty/loading/error states.

Validate RTL/LTR.

Validate desktop/tablet/mobile.

No post-render translation workaround.

## 14. Clinic Admin

Run separate regression coverage for Clinic Admin.

Ensure the ordinary-user Home/Workspace/My Workspace model does not erase, simplify or replace the tenant administration center.

Ensure Clinic Admin can configure the approved user/Role/permission/Workspace/Domain behavior and test the subscribed system as intended.

## 15. Legacy reconciliation

For every old implementation that appears to conflict:

1. identify exact conflicting rule;
2. determine whether the conflict is actually within the 2026-09-01 scope;
3. preserve non-conflicting behavior;
4. modify only the conflicting part;
5. remove duplicate code only after proving the replacement is canonical;
6. update documentation so obsolete rules cannot later be selected accidentally.

No wholesale deletion of documents or code is permitted merely because one portion conflicts.

## 16. End-to-end execution scenarios

### Ordinary clinical team member
Login → Home → Search/header → Sidebar → Workspace → patient becomes available → clinical work → reports/files/required work → finish clinical work → pending close → handoff → operational continuation.

### Ordinary operational member
Login → Home → Workspace → waiting/queue → prepare/route patient → clinical handoff → return to operational work → completion.

### Mixed-domain permission
Primary clinical/operational work remains unchanged; authorized outside-classification Domain appears normally in Sidebar and exposes only permitted actions.

### My Workspace
Default widgets → personalize → add/remove/hide/reorder → reload → reset defaults → no authorization change.

### Search
Search authorized patient/staff/appointment/etc. → result type/context → direct permitted destination → no unauthorized leakage.

### Clinic Admin
Administrative surface remains distinct and complete; configuration affects ordinary users through the existing authorization/configuration architecture.

## 17. Final validation gates

A stage cannot be marked complete if any of these remain unverified:

- Home;
- Home information/widgets;
- Header;
- Global Search;
- Sidebar;
- Workspace;
- My Workspace;
- Widgets/personalization;
- My Settings;
- Clinical Workspace;
- Operational Workspace;
- Patient Flow;
- Queue;
- handoffs/pending close;
- Patient Context;
- affected Domain integrations;
- effective permissions;
- tenant isolation/RLS;
- Clinic Admin;
- database/persistence;
- Arabic/English;
- RTL/LTR;
- mobile/responsive;
- loading/empty/error states;
- runtime regression.

## 18. Completion evidence

Final closure requires:

- source diff review;
- build/type/test evidence;
- database migration/schema evidence;
- authorization/RLS evidence;
- runtime browser evidence;
- ordinary-user scenario evidence;
- Clinic Admin scenario evidence;
- Arabic/English evidence;
- responsive evidence;
- documentation/index/handoff updates;
- explicit confirmation that no unrelated architecture was changed.

**No partial completion may be declared as final completion.**
