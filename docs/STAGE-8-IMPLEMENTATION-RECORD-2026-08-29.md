# CORE SYSTEM — Stage 8 Implementation Record

**Date:** 2026-08-29
**Stage:** 8 — Global Search
**Status:** IMPLEMENTED — PRODUCTION VERIFICATION BLOCKED

## Official scope

Stage 8 is the Global Search stage defined by `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`.

The approved requirement is a genuine system-wide search surface available from a clear and consistent location, searching authorized information across Domains while respecting tenant isolation, permissions, privacy, Arabic/English behavior, and direct navigation to the appropriate record.

## Inspection and reconciliation

Inspected the current repository navigation registry, Workspace shell, permission engine, Supabase server client, existing i18n architecture, AJM/PJ domain ownership, and live production schema before implementation.

No parallel Patient Journey, Queue, authorization, entitlement, workspace, or registry architecture was created.

## Implementation

Added:

- `src/core/search/actions.ts`
- `src/core/search/GlobalSearch.tsx`
- `src/core/i18n/globalSearchMessages.ts`
- `tools/global-search-stage8-audit.mjs`
- `.github/workflows/stage8-validation.yml`
- `docs/STAGE-8-IMPLEMENTATION-RECORD-2026-08-29.md`
- `docs/STAGE-8-UNRESOLVED-FINDINGS-REGISTER-2026-08-29.md`

Extended:

- `src/features/workspace/WorkspaceShell.tsx`
- `package.json`
- `.github/workflows/ux-stages-0-4-ci.yml`

## Security model

Every search starts from the authenticated Supabase session, resolves the current tenant, resolves effective permissions, and only queries Domain sources for which the user has the corresponding read capability.

No service-role client is used by the search action.

No Sidebar item was added. Global Search is a stable Workspace shell surface.

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

## Database

No Stage 8 migration was required. Canonical tables, tenant boundaries, and existing RLS are reused.

## Final engineering validation

Validated commit:

`56ca3452a7b6023e5bdde645fc169f4e2b840a6c`

GitHub UX 0-8 validation gates:

- lockfile synchronization — PASS
- npm ci — PASS
- dependency audit diagnostic — PASS as a non-blocking diagnostic; findings recorded
- TypeScript — PASS
- I18N audit — PASS
- I18N parity — PASS
- Stage 5 Widget audit — PASS
- Stage 5 Domain Surface audit — PASS
- Stage 6 Patient Flow audit — PASS
- Stage 7 Patient Context audit — PASS
- Stage 8 Global Search audit — PASS
- Stage 8 changed-surface ESLint — PASS
- production build — PASS

Repository-wide ESLint remains a diagnostic only and reports pre-existing findings outside Stage 8; the blocking changed-surface gate passes.

## External production blocker

Vercel reports the GitHub status `Vercel` as failed with `build-rate-limit` and does not currently create a production deployment for the validated Stage 8 commit.

The Vercel deployment API exposed to this session is also schema-inconsistent: its backend requires `target`, `name`, and `files` while the available invocation schema exposes none of them. The Git Integration path is therefore the only working production route available, and it is currently rate-limited.

The latest known READY production deployment predates Stage 8. Therefore production runtime verification of the Stage 8 commit cannot be truthfully claimed.

## Supabase cross-workstream finding

Supabase Preview reports remote migration versions not found in the repository migrations directory. Live production contains migration history not fully mirrored locally. This predates Stage 8 and is unrelated to the Stage 8 schema because Stage 8 introduced no migration. Fabricating placeholder migrations would violate migration discipline, so the finding is recorded for the migration-governance owner.

## Closure

Stage 8 is **NOT CLOSED** until a production deployment of the validated Stage 8 commit is available and runtime verification passes. No false Production Ready declaration is made.
