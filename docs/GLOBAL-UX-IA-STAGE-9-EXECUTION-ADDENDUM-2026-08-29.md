# Global UX/IA Stage 9 Execution Addendum — 2026-08-29

## Authority

This addendum records execution against `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`, which defines Stage 9 as **Overview / Dashboard Reconciliation**.

## Reconciliation

The approved model distinguishes three surfaces:

1. **Workspace** — everyday working surface.
2. **Dashboard** — management, monitoring, KPI, analytical and administrative oversight.
3. **Overview** — contextual status/summary information that does not duplicate operational Domain functions.

The repository now implements this distinction without changing Domain ownership or authorization architecture.

## Final placement

- `/` remains the canonical Workspace surface.
- `/dashboard` is the management Dashboard.
- `/financial-resources/overview` remains the contextual financial Overview.
- `/analytics` remains the detailed Analytics surface.
- Global Search remains in the existing Workspace shell.
- Patient Context remains a contextual orchestration surface.
- Patient Flow/Queue remain independent canonical systems.

## Navigation decision

The Dashboard is exposed in the existing Sidebar because the approved Stage 9 model defines it as a management surface and the existing navigation model already supports permission-aware entries. It uses the existing `analytics:read` permission; no new permission or entitlement model was introduced.

## Data / architecture decision

The Dashboard reuses the existing Analytics KPI registry, engine and KPI presentation components. It does not create a parallel KPI aggregation layer, dashboard database, workspace system, or domain-owned duplicate.

## Security decision

Analytics server actions now verify:

- authenticated caller identity;
- clinic membership / tenant resolution;
- effective `analytics:read` permission.

The UI continues to hide unauthorized navigation, while server-side authorization independently protects direct invocation.

## Language / responsive decision

Dashboard labels and descriptions are defined in the existing bilingual i18n architecture. The page follows the existing locale direction model and responsive KPI grid.

## Explicit exclusions

Stage 9 does not:

- redesign Patient Journey;
- replace Patient Flow or Queue;
- create a second Workspace;
- merge Analytics into Dashboard;
- create a duplicate financial Overview;
- create new authorization or entitlement systems;
- introduce a database schema change;
- move Domain ownership.

## Validation reference

The implementation candidate passed the dedicated Stage 9 audit and blocking validation workflow, including TypeScript, i18n parity, Stage 5–8 regression audits, changed-surface ESLint and production build before merge to `main`.
