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
- `WorkspaceShell.tsx` owns the persistent sidebar and now also contains a persistent header foundation with Global Search, current surface context, language control and authenticated user context.
- Global Search is implemented as a server-side, permission- and tenant-aware provider layer with a bilingual command/search surface and Ctrl/Cmd+K shortcut.
- Notifications are not fabricated into the header; the existing notification domain remains the source for a future integrated notification control.

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
| Financial & Resources | Root operational surface plus nested child routes | Hierarchy correct; root intentionally remains a coherent operational surface because it currently contains create/execute actions that are not yet equivalently surfaced in all child list pages |
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

The current dedicated Financial & Resources Overview is summary-only and conforms to the AJM-2 Overview contract.

The root `/financial-resources` route currently renders `FinancialResourcesCenter`, which contains operational forms/actions for payments, financial plans, insurance, suppliers, purchasing and receiving. This is not treated as a duplicate of the Overview: it is the current operational entry surface and contains capabilities that are not all reproduced as create/execute controls in the child list pages.

Therefore **no redirect or hiding patch is applied**. The correct next reconciliation step is to determine the canonical placement of those actions while preserving functionality. This is a UX/interaction decision, not a reason to remove the existing operational capability.

## 7. Duplication / reconciliation findings

### Confirmed

- AJM-2 previously had duplicate root routes for subordinate Financial & Resources capabilities. The recent AJM-2 commits removed those root duplicates and established the canonical nested tree.
- The current navigation registry now contains one Financial & Resources root and explicit children.
- The current root `/financial-resources` operational center is a real capability surface and is not removed merely because a summary Overview also exists.

### Architecture-level duplication

- `WorkspaceRenderer`/Widget Registry and `OperationWorkspace`/`ClinicalWorkspace` represent two different workspace implementation philosophies.
- This is more important than merely having two visual layouts: the frozen Workspace specification says Workspace capabilities should be registered Widgets, while Operation/Clinical are still standalone page components.
- No destructive migration is performed in this audit step because converting these workflows into Widgets requires careful runtime and interaction regression validation.

## 8. Discoverability findings

### P0 / CORE — addressed in implementation

1. **Global Search was missing from the authenticated shell.**
   - Addressed by adding a persistent Global Search control to the Workspace header.
   - Supports Ctrl/Cmd+K.
   - Results are labeled by record type and context.
   - Patient results can open the existing Patient Detail surface through the canonical Patients route.

2. **Persistent Global Header foundation was missing.**
   - Addressed by adding a shared header to the authenticated Workspace shell.
   - The implementation intentionally reuses the existing language and auth controls rather than introducing another security or navigation system.

### P1 / CORE

3. **Financial & Resources root is an operational surface while Overview is a child summary surface.**
   - Kept intentionally because moving it to Overview without relocating create/execute actions would remove usable capability.
   - Requires a later interaction-placement decision based on the full AJM-2 workflow audit.

4. **Operation and Clinical have their own page-level search, but Global Search is now separate and system-wide.**
   - Local search remains useful and should remain task-specific.

### P1 / reconciliation

5. **Workspace model is split between Widget Workspace and standalone Operation/Clinical workspaces.**
   - Needs controlled reconciliation rather than a visual patch.
   - Existing business logic must be reused.

## 9. Reference research — first pass

### Jane

Jane uses a top-level Patients surface with focused patient search and deliberately limits the initial patient list for performance. Its documentation also emphasizes opening a patient profile directly from search/results and showing contextual information such as phone and date of birth to disambiguate similar names. Jane's recent changelog documents direct jumps from reports to patient profiles and a searchable Settings surface.

Useful pattern for CORE: global discovery and contextual search should coexist; search results should provide enough context to identify the correct patient and should jump directly into the relevant record surface. citeturn8search0turn8search13

### Pabau

Pabau's current client search can locate clients, leads, appointments, invoices and setup destinations from a single search field. Its client card then centralizes appointments, EMR/chart, financials, communications and other related patient information. Pabau also keeps task-specific list filtering/views inside domains such as Invoices and Appointments.

Useful pattern for CORE: a persistent search entry point plus contextual domain filtering; the search result should identify the record type and the user should be able to continue inside a coherent record context. citeturn7search0turn7search4

### ERPNext / Frappe

ERPNext's Workspace model groups dashboards, shortcuts, masters and reports for a module instead of treating every underlying record type as a persistent root navigation item. Frappe's workspace blocks explicitly support shortcuts and quick lists, while current ERPNext guidance distinguishes workspace visibility from actual permissions: hiding a workspace/shortcut is not a security boundary. The Awesome Bar is used as a global navigation/search surface.

Useful pattern for CORE: keep persistent navigation focused on domains/workspaces, use global search to bypass menu depth, and keep authorization server-side and independent from navigation visibility. citeturn5search0turn5search2turn5search4

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

**Implemented as the first CORE global search layer; final Definition-of-Done expansion remains open.**

The new search layer provides:

- persistent shell access;
- Ctrl/Cmd+K;
- bilingual Arabic/English UI;
- tenant scoping;
- permission-gated provider queries;
- labeled results;
- canonical navigation targets;
- current implemented record coverage across patients, staff, appointments, invoices/payments, financial plans/installments, insurance/claims, treatment plans, services/procedures, inventory, suppliers/purchase orders and medical files.

The provider layer is intentionally extensible. It does not introduce a new search database or replace domain-local search.

The remaining completion work is to expand coverage to additional operational record types as their canonical routes/permissions become stable, and to validate search behavior against real authenticated tenant accounts.

## 12. Runtime / deployment evidence

- The latest production deployment before this branch is READY and corresponds to commit `29bc42989807335ead90e18b66bb52fff4e4579f`.
- The branch is receiving automatic Vercel preview deployments.
- The first Global Search provider build failed on a TypeScript inference issue; the issue was corrected by introducing explicit provider-row typing.
- The corrected branch deployment is currently rebuilding on Vercel; final preview/runtime verification remains pending until the deployment reaches READY.
- The production build currently emits two webpack circular-dependency warnings; they are not blocking deployment.
- Historical runtime errors still include feature-flag permission failures and older missing-Supabase-client errors. These are tracked as runtime reconciliation evidence and are not silently treated as UX-only problems.

## 13. Database evidence

The current Supabase project contains structured sources for patients, users, appointments, treatment plans, invoices/payments, financial plans/installments, insurance/claims, inventory, suppliers/purchasing and medical files. This is sufficient to support the current extensible Global Search layer without introducing a new database architecture.

The database also contains user workspace assignments for `administration`, `clinical`, and `operation`. This must be reconciled with the current navigation/workspace surface before changing workspace ownership or visibility.

## 14. Implementation status

### Implemented on `ux-global-ia-audit`

- Global UX/IA audit baseline document.
- Persistent shell header foundation.
- Bilingual Global Search UI.
- Ctrl/Cmd+K search invocation.
- Permission- and tenant-aware search provider layer.
- Canonical result navigation for the current implemented record set.
- Patient result deep-linking into the existing Patient Detail modal.
- Patient local search now also honors Arabic names and file number, and accepts Global Search query parameters.

### Intentionally not changed

- Authorization model.
- Tenant isolation model.
- Domain ownership.
- PJ architecture.
- Financial & Resources backend ownership.
- Existing local search behavior in operational domains.
- Operation/Clinical business logic.

## 15. Open architectural decision gate

The following item is not silently decided by this audit:

> Should Operation and Clinical remain named first-class workspace destinations, or should they become contextual operational surfaces/widgets under the single Workspace architecture?

The repository currently contains both models. A final answer requires a complete runtime/task analysis of their role, discoverability, personalization and cross-domain behavior. No ownership or security boundary should be changed until that reconciliation is explicit.
