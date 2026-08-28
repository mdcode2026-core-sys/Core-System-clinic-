# CORE SYSTEM — Global UX / IA / Interaction
## Stage 5 — Widget Library & Classification — 2026-08-28

**Status:** IMPLEMENTED — CI VALIDATION IN PROGRESS
**Authority:** `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
**Execution plan:** `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`
**Validation governance:** `docs/UX-IA-VALIDATION-GOVERNANCE.md`

## 1. Objective

Stage 5 establishes the Widget Library as a governed catalog of reusable Workspace tools and classifies every currently registered Widget according to its actual user-facing purpose.

The implementation follows:

`READ → INSPECT → MAP → RECONCILE → RESEARCH → VALIDATE → IMPLEMENT → DOCUMENT → COMMIT → RECHECK`

and:

`Inspect → Reuse → Extend → Reconcile → Create`.

## 2. Scope

Stage 5 covers:

- inventory of the existing Widget Registry;
- classification of every registered Widget;
- Domain ownership identification;
- purpose and bilingual description;
- supported Workspace/patient/visit contexts;
- natural Widget size;
- distinction between information, action, operational and contextual surfaces;
- distinction between Quick Actions and full Widget surfaces;
- whether a capability also has a Sidebar representation;
- automated completeness/consistency validation.

Stage 5 does not create a second authorization engine, duplicate Domain logic, replace Patient Flow, or turn Widgets into miniature Domains.

## 3. Governing model

The approved relationship remains:

`Permission → Widget available → User chooses Widget → Workspace`

Widget availability remains enforced by the existing effective permission and feature/entitlement checks. The Stage 5 catalog is descriptive metadata and does not grant access.

## 4. Repository inspection

Inspected the current `main` implementation and governing sources before modification, including:

- `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
- `CORE-SYSTEM-GLOBAL-UX-IA-MASTER-EXECUTION.md`
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`
- `docs/GLOBAL_UX_IA_DOCUMENTATION_RECONCILIATION_2026-08-28.md`
- `WORKSPACE_ARCHITECTURE_SPECIFICATION.md`
- `docs/GLOBAL-UX-IA-STAGE-3-WORKSPACE-FOUNDATION-2026-08-28.md`
- `docs/GLOBAL-UX-IA-STAGE-4-WORKSPACE-PERSONALIZATION-2026-08-28.md`
- `docs/AJM-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md`
- `docs/AJM-IMPLEMENTATION-STATUS-MATRIX-2026-08-28.md`
- `docs/PJ-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md`
- `src/core/workspace/widgetRegistry.ts`
- `src/core/workspace/workspace.types.ts`
- `src/core/workspace/workspaceEngine.ts`
- `src/core/workspace/hooks/useWorkspace.ts`
- `src/core/workspace/hooks/useWidgetPersistence.ts`
- `src/features/workspace/WorkspaceRenderer.tsx`
- `src/features/workspace/WidgetContainer.tsx`
- `src/features/workspace/WidgetToolbar.tsx`
- existing permission and feature type definitions.

## 5. Current Widget inventory

The current registry contains seven Widgets:

| Widget | Domain owner | Classification | Quick Action | Sidebar capability | Contexts |
|---|---|---|---|---|---|
| Quick Registration | Patients | Quick Action | Yes | No | Global, Operations |
| Quick Appointment | Agenda | Quick Action | Yes | No | Global, Operations, Agenda |
| Queue | Patient Flow | Contextual | No | No | Global, Operations, Clinical, Patient, Visit |
| Follow-up | Follow-up | Operational | No | Yes | Global, Operations, Clinical, Patient, Follow-up |
| Medical Files | Medical Files | Contextual | No | No | Global, Clinical, Patient, Visit |
| Billing Summary | Financial & Resources | Information | No | Yes | Global, Operations, Financial |
| Analytics Overview | Analytics | Information | No | Yes | Global, Analytics |

## 6. Implementation

### 6.1 Catalog metadata

Created:

`src/core/workspace/widgetCatalog.ts`

The catalog records for every registered Widget:

- `surfaceKind`;
- `domainOwner`;
- bilingual purpose;
- supported contexts;
- natural size;
- Sidebar capability indicator;
- Quick Action indicator;
- rationale for the classification.

This is intentionally separate from authorization. The existing `WidgetDefinition.requiredPermission` and `moduleKey` remain authoritative for availability.

### 6.2 Existing Registry reused

The existing `widgetRegistry.ts` remains the canonical implementation registry and is not duplicated. The Stage 5 catalog is keyed one-to-one against that registry.

### 6.3 Existing Workspace behavior preserved

Stage 4 personalization remains the presentation mechanism. Stage 5 does not replace add/remove/reorder/persistence behavior and does not introduce another Workspace state owner.

### 6.4 Domain ownership preserved

The catalog identifies ownership for clarity but does not move business logic into the Workspace layer. Widgets continue to render existing Domain components and are not permitted to recreate Domain rules.

## 7. Classification decisions

- **Quick Registration:** Quick Action because registration is a high-frequency action and the authoritative Patients page remains the full Domain surface.
- **Quick Appointment:** Quick Action because booking is high-frequency and the authoritative Agenda remains the full scheduling surface.
- **Queue:** Contextual because it is a surface of the existing Patient Flow/Queue capability and must never replace Patient Flow.
- **Follow-up:** Operational because it leads directly to actionable follow-up work; the full Follow-up capability remains available through Sidebar.
- **Medical Files:** Contextual because the useful interaction is strongly tied to patient/clinical/visit context and must not become a miniature medical-record domain.
- **Billing Summary:** Information because the Workspace needs concise financial context while full invoices/payments/plans remain within Financial & Resources.
- **Analytics Overview:** Information because it provides management context while full analytics remains a management/monitoring surface.

## 8. Authorization invariants

Stage 5 does not modify authorization.

The existing Workspace engine continues to require both:

1. effective permission for the Widget's required capability;
2. enabled feature/module state.

The catalog cannot make an unauthorized Widget available.

## 9. AJM / PJ compatibility

AJM ownership remains unchanged. The catalog identifies Financial & Resources, Follow-up and other domains without transferring ownership into Workspace.

PJ ownership remains unchanged. Queue is explicitly classified as a contextual surface of Patient Flow and not a replacement Patient Flow implementation. The Patient Flow/Queue behavior remains governed by the PJ reconciliation rules.

## 10. Validation

A dedicated repository audit was added:

`tools/widget-catalog-audit.mjs`

It verifies:

- every Widget Registry key has exactly one classification;
- no orphaned classification exists;
- no duplicate registry key exists;
- every classification contains all required metadata fields.

The shared GitHub pre-deployment workflow now includes:

- dependency/lockfile installation;
- TypeScript;
- i18n audit/parity;
- Stage 5 Widget Catalog audit;
- changed-surface ESLint;
- production build.

Vercel remains reserved for deployed-runtime evidence after the complete pre-deployment gate passes.

## 11. Definition of Done

- [x] Existing Widget Registry inventoried.
- [x] Every registered Widget classified.
- [x] Domain ownership recorded without changing Domain ownership.
- [x] Purpose recorded in Arabic and English.
- [x] Supported contexts recorded.
- [x] Natural size recorded.
- [x] Quick Action distinction recorded.
- [x] Sidebar capability distinction recorded.
- [x] Classification rationale recorded.
- [x] Widget catalog does not grant authorization.
- [x] Existing permission/feature engine remains authoritative.
- [x] Existing Workspace personalization remains the presentation mechanism.
- [x] Patient Flow/Queue is not recreated.
- [x] AJM/PJ ownership remains unchanged.
- [ ] GitHub Actions run for final Stage 5 candidate passes.
- [ ] Required interactive/local validation passes.
- [ ] If deployed behavior is required, final Vercel runtime evidence passes.

## 12. Closure rule

Stage 5 is not Production Ready until the final candidate passes all applicable pre-deployment gates and any required interactive/runtime evidence is recorded. The presence of this catalog or its audit script is not itself evidence of a passing validation run.
