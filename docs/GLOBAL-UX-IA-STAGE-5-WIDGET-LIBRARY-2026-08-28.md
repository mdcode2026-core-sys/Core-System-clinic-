# CORE SYSTEM — Global UX / IA / Interaction
## Stage 5 — Widget Library & Classification — 2026-08-28

**Status:** CLOSED — PRODUCTION READINESS PASSED
**Final validation commit:** `da664f81d4f4cb84a829ea7186c6b08f80560f54`
**GitHub Actions:** `UX Stages 0-5 CI` Run #32 — SUCCESS
**Authority:** `GLOBAL-UX-IA-FINAL-AUTHORITY-2026-08-28.md`
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
- domain ownership identification;
- purpose and bilingual description;
- supported Workspace/patient/visit contexts;
- natural Widget size;
- distinction between information, action, operational and contextual surfaces;
- distinction between Quick Actions and full Widget surfaces;
- whether a capability also has a Sidebar representation;
- domain-to-surface decisions for the governed navigation domains;
- automated completeness/consistency validation.

Stage 5 does not create a second authorization engine, duplicate Domain logic, replace Patient Flow, or turn Widgets into miniature Domains.

## 3. Governing model

The approved relationship remains:

`Permission → Widget available → User chooses Widget → Workspace`

Widget availability remains enforced by the existing effective permission and feature/entitlement checks. The Stage 5 catalogs are descriptive metadata and do not grant access.

## 4. Repository inspection

Inspected the current `main` implementation and governing sources before modification, including the Global UX/IA authority, implementation plan, validation governance, Workspace Architecture, Stages 1–4, AJM/PJ reconciliation, Widget Registry, Workspace engine, persistence, Renderer, Toolbar, and existing permission/feature definitions.

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

## 6. Domain surface decisions

The governed domain catalog now records one explicit Stage 5 decision for each of these 12 surfaces:

- Workspace
- Patients
- Agenda
- Treatment Plans
- Financial & Resources
- Reports
- Analytics
- Follow-up
- Patient Flow
- Operations
- Clinical
- Settings

The catalog explicitly records whether a Widget is appropriate and why. Domains that are not suitable for a Widget remain authoritative full/contextual surfaces rather than being forced into Widget form.

## 7. Implementation

### 7.1 Widget catalog

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

### 7.2 Domain surface catalog

Created:

`src/core/workspace/domainSurfaceCatalog.ts`

This records the approved relationship between each governed domain and Workspace/Sidebar/contextual/settings surfaces. It deliberately does not grant permissions and does not move business logic.

### 7.3 Existing Registry reused

The existing `widgetRegistry.ts` remains the canonical implementation registry and is not duplicated. The Stage 5 Widget catalog is one-to-one with that registry.

### 7.4 Existing Workspace behavior preserved

Stage 4 personalization remains the presentation mechanism. Stage 5 does not replace add/remove/reorder/persistence behavior and does not introduce another Workspace state owner.

### 7.5 Domain ownership preserved

The catalogs identify ownership for clarity but do not move business logic into Workspace. Widgets continue to use existing Domain behavior and do not recreate Domain rules.

## 8. Classification decisions

- **Quick Registration:** Quick Action because registration is a high-frequency action and Patients remains the full authoritative domain.
- **Quick Appointment:** Quick Action because booking is high-frequency and Agenda remains authoritative.
- **Queue:** Contextual because it is a surface of the existing Patient Flow/Queue capability and must never replace Patient Flow.
- **Follow-up:** Operational because it leads directly to actionable follow-up work; the full Follow-up capability remains available through Sidebar.
- **Medical Files:** Contextual because the useful interaction is tied to patient/clinical/visit context and must not become a miniature medical-record domain.
- **Billing Summary:** Information because Workspace needs concise financial context while full financial operations remain within Financial & Resources.
- **Analytics Overview:** Information because it provides management context while full Analytics remains authoritative.

## 9. Authorization invariants

Stage 5 does not modify authorization.

The existing Workspace engine remains authoritative for:

1. effective permission for the Widget's required capability;
2. enabled feature/module state.

The catalog cannot make an unauthorized Widget available.

## 10. AJM / PJ compatibility

AJM ownership remains unchanged. Financial & Resources, Follow-up and other domains remain their own capabilities.

PJ ownership remains unchanged. Queue is explicitly classified as a contextual surface of Patient Flow and not a replacement Patient Flow implementation.

## 11. Validation

### GitHub pre-deployment gate

Final Run #32 passed completely on commit `da664f81d4f4cb84a829ea7186c6b08f80560f54`:

- lockfile synchronization — PASS;
- `npm ci` — PASS;
- TypeScript — PASS;
- I18N audit — PASS, 0 candidate user-facing literals;
- I18N parity — PASS, 24 catalog files;
- Widget Catalog audit — PASS, 7 registry Widgets / 7 classifications;
- Domain Surface audit — PASS, 12 governed domains;
- changed-surface ESLint — PASS;
- Production build — PASS.

### Runtime/deployment applicability

Stage 5 adds governed classification metadata and validation tooling; it does not alter runtime rendering, routing, authorization, persistence, or business behavior. Therefore a new Vercel deployment was not required to establish Stage 5 correctness. Vercel remains the runtime gate for stages that change deployed runtime behavior.

This avoids consuming a Hobby deployment merely to validate static governance metadata that GitHub CI already validates completely.

## 12. Definition of Done

- [x] Existing Widget Registry inventoried.
- [x] Every registered Widget classified.
- [x] Domain ownership recorded without changing Domain ownership.
- [x] Purpose recorded in Arabic and English.
- [x] Supported contexts recorded.
- [x] Natural size recorded.
- [x] Quick Action distinction recorded.
- [x] Sidebar capability distinction recorded.
- [x] Classification rationale recorded.
- [x] Governed domain surface decisions recorded.
- [x] Widget catalog does not grant authorization.
- [x] Existing permission/feature engine remains authoritative.
- [x] Existing Workspace personalization remains the presentation mechanism.
- [x] Patient Flow/Queue is not recreated.
- [x] AJM/PJ ownership remains unchanged.
- [x] GitHub final pre-deployment gate passed.
- [x] Static/contract validation passed.
- [x] Production build passed.
- [x] Vercel deployment not required for this metadata-only Stage 5 change.

## 13. Closure

**Stage 5 is CLOSED.**

The final candidate passed the complete GitHub pre-deployment gate and is Production Ready under the applicable Stage 5 definition. Runtime deployment validation remains governed by the same GitHub-first/Vercel-only-when-required policy for subsequent stages that introduce runtime behavior.
