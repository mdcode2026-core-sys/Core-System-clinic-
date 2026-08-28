# CORE SYSTEM — Global UX / Information Architecture / Interaction Audit

**Date:** 2026-08-28  
**Status:** Active audit baseline / implementation in progress  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`

## 1. Governing references

This audit follows the current architecture hierarchy and the explicit UX brief. The current repository confirms that `src/core/navigation/navigationRegistry.ts` is intended as the navigation source of truth, while the Workspace architecture specification defines a persistent global header and Global Search. AJM-2 additionally defines Financial & Resources as one coherent tenant-facing surface with Overview as summary-only.

Relevant repository authorities:

- `WORKSPACE_ARCHITECTURE_SPECIFICATION.md`
- `docs/CORE-SYSTEM-ADMINISTRATIVE-JOURNEY-MANAGEMENT-BLUEPRINT.md`
- `docs/AJM-IMPLEMENTATION-PLAN.md`
- `docs/AJM-STAGE-INDEX.md`
- `docs/AJM-2-FINANCIAL-RESOURCES.md`
- `src/core/navigation/navigationRegistry.ts`

## 2. Current UX architecture — observed

### Global surface

- The authenticated root `/` renders the current Widget-based Workspace through `WorkspaceRenderer`.
- `navigationRegistry.ts` defines the current tenant-facing navigation hierarchy.
- `WorkspaceShell.tsx` renders the sidebar and mobile menu.
- The current shell does **not** implement the Global Header contract described by `WORKSPACE_ARCHITECTURE_SPECIFICATION.md`: there is no persistent desktop header containing Global Search, notifications, user menu, tenant/current-workspace context.
- The current shell also does not expose a real Global Search.

### Workspace surfaces

There are currently three different workspace-like concepts exposed by routes/components:

1. Root Widget Workspace (`/` → `WorkspaceRenderer` + `widgetRegistry`).
2. Operation Workspace (`/operation` → `OperationWorkspace.tsx`).
3. Clinical Workspace (`/clinical` → `ClinicalWorkspace.tsx`).

The latter two are substantial standalone workflow surfaces with their own search, state handling, queue refresh and operational interactions. They are not implemented as Widget Registry surfaces. This is a genuine architecture/UX reconciliation finding, not merely a sidebar styling issue.

### Administration

`/settings` is a consolidated administration surface with grouped internal navigation and settings search. This is materially closer to progressive disclosure than exposing each setting as a root navigation item.

The database currently contains user-workspace assignments for `administration`, `clinical`, and `operation`, while the current navigation registry exposes `operation` and `clinical` but not `administration` as a root workspace. This requires reconciliation against the Team & Access/workspace contract before any workspace model is changed.

## 3. Current navigation map

```text
Workspace /
├── Operation
│   └── standalone OperationWorkspace
├── Clinical
│   └── standalone ClinicalWorkspace
├── Treatment Plans
├── Patients
├── Agenda
├── Queue
├── Financial & Resources
│   ├── Overview
│   ├── Invoices            (reused canonical route)
│   ├── Payments
│   ├── Financial Plans
│   │   └── Installments
│   ├── Insurance
│   │   └── Claims
│   ├── Inventory           (reused canonical route)
│   │   └── Consumption
│   └── Purchasing
│       ├── Suppliers
│       └── Receiving
├── Reports
├── Analytics
├── Follow-up
└── Settings
```

The Financial & Resources tree is structurally coherent and is the correct current product hierarchy. AJM-2 explicitly defines this hierarchy and removes the former root duplicates.

## 4. Domain surface map — current

| Surface | Current presentation | Finding |
|---|---|---|
| Patients | List + inline create + appointment action | Keep; strong operational entry point |
| Agenda | Calendar + appointment modal/detail | Keep; appointment authority remains here |
| Queue | Dedicated operational queue | Keep; relationship with Operation/Clinical needs reconciliation |
| Clinical | Full clinical workflow page | Core capability, but separate workspace philosophy from root Widget Workspace |
| Operation | Full queue/workflow page | Core capability, but separate workspace philosophy from root Widget Workspace |
| Treatment Plans | Dedicated domain page | Keep; integrates with Clinical/Financial rather than being absorbed by either |
| Financial & Resources | Root surface plus nested child routes | Hierarchy correct; root landing behavior currently conflicts with AJM-2 Overview contract |
| Settings | Grouped administration center | Keep and extend rather than multiplying root navigation |
| Reports | Dedicated reporting surface | Keep; distinct from Analytics |
| Analytics | Dedicated analytics surface | Keep; distinct from Reports |
| Follow-up | Dedicated operational surface | Keep pending PJ/AJM reconciliation |

## 5. Parent / child map

Current confirmed parent relationships:

```text
Financial & Resources
├── Financial Plans
│   └── Installments
├── Insurance
│   └── Claims
├── Inventory
│   └── Consumption
└── Purchasing
    ├── Suppliers
    └── Receiving
```

These relationships are already codified in AJM-2 and should not be flattened back into root navigation.

No conclusion is made yet that other domains should adopt the same exact URL shape; that requires domain-by-domain inspection.

## 6. Overview assessment

The current dedicated Financial & Resources Overview is summary-only and therefore conforms to the AJM-2 Overview contract.

However, the root `/financial-resources` route currently renders `FinancialResourcesCenter`, which contains operational forms/actions for payments, financial plans, insurance, suppliers, purchasing and receiving. This means the **domain root currently behaves as an operational hub while the canonical Overview is a child route**.

This is a navigation/entry-point inconsistency. The lowest-risk correction is to make the domain root enter through Overview while retaining the existing operational center behind its contextual child routes. This does not change domain ownership or backend architecture.

## 7. Duplication / reconciliation findings

### Confirmed

- AJM-2 previously had duplicate root routes for subordinate Financial & Resources capabilities. The recent AJM-2 commits removed those root duplicates and established the canonical nested tree.
- The current navigation registry now contains one Financial & Resources root and explicit children.
- The current root `/financial-resources` operational center remains a reusable implementation for child sections; it should not be duplicated.

### Architecture-level duplication

- `WorkspaceRenderer`/Widget Registry and `OperationWorkspace`/`ClinicalWorkspace` represent two different workspace implementation philosophies.
- This is more important than merely having two visual layouts: the frozen Workspace specification says Workspace capabilities should be registered Widgets, while Operation/Clinical are still standalone page components.
- No destructive migration is performed in this audit step because converting these workflows into Widgets requires careful runtime and interaction regression validation.

## 8. Discoverability findings

### P0 / CORE

1. **Global Search is missing from the authenticated shell.**
   - The Workspace specification explicitly requires it in the Global Header.
   - Users currently need to know the domain containing the record.
   - This is the largest confirmed discoverability gap.

2. **The persistent Global Header contract is not implemented.**
   - Current desktop shell is sidebar + content only.
   - Current mobile shell has only the mobile menu trigger.

### P1 / CORE

3. **Financial & Resources root opens an operational center instead of its canonical Overview.**
   - Conflicts with the AJM-2 Overview contract.
   - Fix is low-risk and does not change domain ownership.

4. **Operation and Clinical have their own page-level search, but no system-wide search.**
   - Local search is useful and should remain where task-specific.
   - It must not be mistaken for Global Search.

### P1 / reconciliation

5. **Workspace model is split between Widget Workspace and standalone Operation/Clinical workspaces.**
   - Needs a controlled reconciliation rather than a visual patch.
   - The existing business logic must be reused.

## 9. Reference research — first pass

### Jane

Jane emphasizes task-oriented top-level surfaces and contextual patient access. Patient search is available in multiple operational contexts and can search by name, email, patient number and phone. Access to patient search is constrained by staff access level.

Useful pattern for CORE: search should be available close to workflows, but a system-wide search should not replace context-specific lists/filters.

### Pabau

Pabau's current client search can locate clients, leads, appointments, invoices and setup destinations from a single search field. Pabau also supports Ctrl/Cmd+K in its Engage inbox for fast cross-context search. Its Home page is a personalized summary with quick links rather than a replacement for operational pages.

Useful pattern for CORE: a persistent search entry point plus contextual search; results should identify the record type and preserve the user's current workflow context.

### ERPNext / Frappe

ERPNext's Workspace model groups a module's dashboard, shortcuts and masters rather than putting every record type into the persistent navigation. Its Awesomebar provides global navigation/search and can search records while respecting permissions. The system distinguishes navigation to a DocType from broader record search.

Useful pattern for CORE: keep the navigation hierarchy shallow, use a global command/search surface to bypass menu depth, and keep permissions authoritative at the search layer.

## 10. Reference comparison — current recommendation

The strongest combined pattern is:

```text
Persistent Global Header
        ↓
Global Search / Command surface
        ↓
Search across authorized record types
        ↓
Results labeled by type + context
        ↓
Direct navigation to canonical route

while preserving:

Sidebar = stable product/domain navigation
Contextual search = task-specific filtering
Workspace = daily work surface
Settings = configuration, not daily operations
```

This is compatible with the existing CORE architecture and does not require turning Workspace into a security boundary.

## 11. Global Search assessment

### Current state

**Not implemented as a real system-wide search.**

There is no current global search provider, search endpoint, or persistent shell search control. Existing searches are local to domains/pages.

### Target model

The implementation should use a provider/registry model rather than a single giant query tied to UI pages. Each provider owns:

- result type;
- canonical route;
- searchable fields;
- permission key;
- tenant scoping;
- concise result context.

The first implementation can safely use indexed/filtered canonical tables without changing the database architecture. The provider model leaves room for PostgreSQL full-text/GIN or a dedicated search index later when scale requires it.

## 12. Runtime / deployment evidence

- The latest production deployment on 2026-08-28 is READY and corresponds to commit `29bc42989807335ead90e18b66bb52fff4e4579f`.
- The latest production build passed TypeScript and static generation.
- The current build emits two webpack circular-dependency warnings; they are not currently blocking deployment.
- No production error logs were returned for the last six-hour window at the time of this audit.
- Historical runtime errors still include feature-flag permission failures and older missing-Supabase-client errors. These are tracked as runtime reconciliation evidence and are not silently treated as UX-only problems.

## 13. Database evidence

The current Supabase project contains structured sources for patients, users, appointments, treatment plans, invoices/payments, financial plans/installments, insurance/claims, inventory, suppliers/purchasing and medical files. This is sufficient to support an extensible first Global Search layer without introducing a new database architecture.

The database also contains user workspace assignments for `administration`, `clinical`, and `operation`. This must be reconciled with the current navigation/workspace surface before changing workspace ownership or visibility.

## 14. Immediate implementation actions authorized by the audit

1. Make `/financial-resources` enter through its canonical Overview. **FIX**.
2. Add the persistent Global Search surface to the authenticated shell. **BUILD / CORE**.
3. Add a permission- and tenant-aware Global Search provider layer over canonical existing records. **BUILD / CORE**.
4. Keep local searches in Patients, Agenda, Operation and Clinical; Global Search complements them rather than replacing them. **KEEP**.
5. Do not yet migrate Operation/Clinical into Widgets. Record this as an architecture reconciliation item requiring runtime validation and staged execution. **RECONCILE / DECISION GATE**.

## 15. Open architectural decision gate

The following item is not silently decided by this audit:

> Should Operation and Clinical remain named first-class workspace destinations, or should they become contextual operational surfaces/widgets under the single Workspace architecture?

The repository currently contains both models. A final answer requires a complete runtime/task analysis of their role, discoverability, personalization and cross-domain behavior. No ownership or security boundary should be changed until that reconciliation is explicit.
