# CORE SYSTEM — Stage 8 Implementation Record

**Date:** 2026-08-29
**Stage:** 8 — Global Search
**Status:** IMPLEMENTED — VALIDATION CANDIDATE

## Official scope

Stage 8 is the Global Search stage defined by `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`.

The approved requirement is a genuine system-wide search surface available from a clear and consistent location, searching authorized information across Domains while respecting tenant isolation, permissions, privacy, Arabic/English behavior, and direct navigation to the appropriate record.

## Inspection

Inspected the current repository navigation registry, Workspace shell, permission engine, Supabase server client, existing i18n architecture, and live production schema before implementation.

The live database contains canonical sources including patients, staff, invoices, agenda events, treatment plans, procedures, inventory, suppliers, purchase orders, and patient portal messages.

## Reuse

- Existing `WorkspaceShell` is the stable global navigation surface.
- Existing Supabase server client is reused.
- Existing `getEffectivePermissions` is reused; no second authorization engine was created.
- Existing canonical Domain tables are queried directly.
- Existing i18n architecture is preserved through a dedicated bilingual message catalog module.

## Implementation

Added:

- `src/core/search/actions.ts`
- `src/core/search/GlobalSearch.tsx`
- `src/core/i18n/globalSearchMessages.ts`
- `tools/global-search-stage8-audit.mjs`

Extended:

- `src/features/workspace/WorkspaceShell.tsx`
- `package.json`
- `.github/workflows/ux-stages-0-4-ci.yml`

## Security model

Every search starts from the authenticated Supabase session, resolves the current tenant, resolves effective permissions, and only queries Domain sources for which the user has the corresponding read capability.

No service-role client is used by the search action.

No Sidebar item was added. Global Search is a stable Workspace shell surface as required by the UX authority.

## Search coverage

Current implementation covers:

- Patients
- Staff
- Invoices
- Appointments
- Treatment plans
- Services/procedures
- Inventory
- Suppliers
- Purchase orders
- Patient portal communication context

Results identify their type and provide direct navigation to the relevant existing Domain surface.

## Database

No migration was required. Stage 8 uses existing canonical tables and existing RLS/tenant boundaries.

## Validation

The repository CI now contains a dedicated `ux:global-search-stage8` audit and a Stage 8 changed-surface ESLint gate. Production build remains a mandatory gate.

## Closure criteria

Stage 8 is not considered closed until GitHub CI passes, the deployed production candidate is verified, Global Search is tested with authorized and unauthorized contexts, Arabic/English behavior is verified, and final documentation is reconciled.
