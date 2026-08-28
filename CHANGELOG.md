# CHANGELOG.md

Reconstructed baseline as of 2026-07-31 from committed migration files and archived handoff records. Maintained going forward per change — not regenerated from scratch each time.

---

## 2026-08-28 — Global UX/IA Stage 3 — Workspace Foundation
- Reused the existing canonical Workspace engine, renderer, shell, registry and persistence instead of creating a second Workspace system.
- Established the existing `/` surface as an explicit working surface with bilingual context/title/description and separated Quick Actions from Status/Analytics presentation.
- Added explicit default Workspace contexts to the existing Widget registry so the same Widget catalogue can be presented appropriately across Global/Home, Operations and Clinical contexts.
- Scoped existing Workspace presentation state to authenticated user + Workspace surface, preventing Home preferences from bleeding into Operations or Clinical.
- Threaded Workspace context through the existing Widget renderer/toolbar path without changing authorization or Domain ownership.
- Added bilingual Working Surface messaging through the existing render-time i18n catalogue.
- No database schema/data migration was required; live production Workspace permissions were verified directly.
- No PJ Patient Flow/Queue logic, AJM Domain ownership, authorization engine, Global Search, Dashboard, or Administration Workspace route was changed.
- Runtime/production validation remains the final closure gate for Stage 3.

## 2026-08-08 — Session 11 Recovery (Workspace Architecture)
- **Root cause of build failure:** `workspaceEngine.ts` called the async `isFeatureEnabled()` (from `featureRegistry.ts`) synchronously — a `Promise<boolean>` passed where `boolean` was expected, rejected by `tsconfig strict:true`. Confirmed against real Vercel build log (previous deployment failed at this exact type-check line).
- **`src/core/workspace/workspaceEngine.ts`:** reduced to only the pure, synchronous `resolveWidgetVisibility()` — no Supabase, no async, no React. Matches WORKSPACE_ARCHITECTURE_SPECIFICATION.md §21.
- **New `src/core/features/useFeatureFlags.ts` + `types.ts`:** Feature Engine had a server function but no client Hook counterpart (Permission Engine has both). Closes that structural gap; consumed by the new `useWorkspace.ts` orchestration hook, not by the Engine itself.
- **New `src/core/auth/useTenantId.ts` (client) + `resolveTenantId.ts` (server):** single source of truth for `tenant_id`, reading `clinic_users` — not `user_metadata`/`app_metadata`. Repo-wide grep found 12 files using the metadata-based anti-pattern (5 Session 11 widgets + `usePermissions.ts` + 4 dashboard route pages + `queue.queries.ts`/`queue.actions.ts`/`reports.queries.ts`); all 12 now use the shared resolver.
- **`src/app/layout.tsx`:** was a verbatim, mistaken copy of `(dashboard)/layout.tsx` — missing `<html>`/`<body>`, wrapped every route (including public `/login`) in an auth guard + `WorkspaceShell`. Replaced with a correct minimal root layout; `<Toaster />` (sonner) mounted here.
- **`(dashboard)/layout.tsx`:** `AuthProvider` was defined (`src/core/auth/AuthProvider.tsx`) but never mounted anywhere. 6 real components already called `useAuth()` and would have thrown at render. Now wrapped, scoped to the `(dashboard)` route group.
- **`package.json`:** added missing `sonner` dependency (Vercel build: `Module not found`).
- **`src/domain/invoicing/invoicing.queries.ts`:** added missing `"use server"` (Server/Client boundary violation — `next/headers` reached the client bundle via `BillingSummaryWidget`).
- **New `src/domain/queue/queue.hooks.ts`:** `QueueWidget.tsx` imported a `useQueueStats` hook that never existed. Added as a thin wrapper around the existing `getQueueStats()` server action. Also fixed 4 field-name mismatches against the real `QueueStats` type.
- **`src/features/workspace/widgets/agenda/QuickAppointmentWidget.tsx`:** `useDoctors/useRooms/useProcedures` called without the required `tenantId` argument; `createAgendaEvent` called with a plain object where the real (and elsewhere-used) contract is `FormData`. Widget fixed to match the real contracts — `createAgendaEvent`'s signature was not changed (still used by `agenda-event-form.tsx` with real `FormData`).
- **New `src/domain/invoicing/useBillingSummary.ts`:** `BillingSummaryWidget` referenced a nonexistent `useInvoiceSummary`. Wired instead to the existing, documented Reports catalog queries (`getRevenueSummary`/`getPaidInvoices`/`getOutstandingInvoices` — see ARCHITECTURE_DECISIONS.md Billing report list). No new aggregation logic. `average_invoice` figure dropped (no definition exists anywhere) — flagged as decision required, not invented.
- **`AnalyticsOverviewWidget.tsx`:** real `useAnalyticsOverview(authUserId, datePreset)` returns `KpiResult[]` from the existing KPI registry, not a summary object. Widget now filters for `patients.total`/`appointments.total`/`revenue.total`, which already exist in `kpi.definitions/*.ts`. `conversion_rate` figure dropped (no matching KPI or definition exists) — flagged as decision required.
- **Database — `feature_flags` seed:** `analytics` and `reports` module keys were missing from the 2026-08-04 seed (only 6 of the 8 keys `WORKSPACE_ARCHITECTURE_SPECIFICATION.md` §9 lists were seeded). Added via `supabase/migrations/20260808_seed_analytics_reports_feature_flags.sql`, same pattern as the existing 6 rows (globally-enabled, `tenant_id = NULL`).
- **Removed `src/core/workspace/hooks/useWidgetVisibility.ts`:** confirmed dead code (zero imports anywhere) — a duplicate, unused implementation of the same widget-visibility logic now correctly living in `workspaceEngine.ts` + `useWorkspace.ts`.
- **Removed `src/app/page.tsx`:** duplicate route — both this file and `src/app/(dashboard)/page.tsx` resolved to `/`, and this one additionally `redirect("/dashboard")`ed to a route that doesn't exist (`(dashboard)` is a route group, excluded from the URL).
- **Not fixed — flagged as decision required:** `infrastructure/supabase/server.ts` still resolves the RLS tenant context from `user_metadata`/`app_metadata` internally (used by 19+ files across the whole app — changing it touches the authentication/RLS foundation, out of mechanical-fix scope).
- **Verified pending:** `npm run build` / `npm run lint` — not executed (no Node/network in the working environment used for this recovery). All fixes verified by manual import/signature/type cross-referencing plus live Supabase queries instead.
