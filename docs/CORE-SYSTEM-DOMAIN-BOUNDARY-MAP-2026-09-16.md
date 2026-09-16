# CORE SYSTEM — Domain Boundary Map
## 2026-09-16

**Status:** POST-129 ARCHITECTURE BASELINE — ACTIVE
**Source tree:** reconciled baseline `1a1282bcdf59f037c9ef491c51b5425261cd86a9`

## 1. Purpose

This map identifies the business domains already present in the repository before any normalization work is attempted.

It is intentionally a **mapping document**, not a refactoring plan. The existence of a folder or component does not by itself prove complete domain ownership or production closure.

## 2. Repository domain inventory

| Domain | Repository boundary | Current evidence | Boundary assessment |
|---|---|---|---|
| Agenda | `src/domain/agenda` | actions, mutation service, queries, availability, conflict engine | Strong domain boundary; authoritative scheduling candidate |
| Analytics | `src/domain/analytics` | actions, engine, queries, KPI definitions/registry | Strong read/analytics boundary; depends on other domains |
| Audit | `src/domain/audit` | actions, queries, types | Platform audit boundary |
| Communications | `src/domain/communications` | communications actions, chat actions, header actions | Strong domain boundary; Chat remains a surface over Communications |
| Direct Permissions | `src/domain/direct-permissions` | actions, queries | Authorization support boundary; must remain distinct from role/entitlement semantics |
| Financial Resources | `src/domain/financial-resources` | financial actions, workflow actions, payments, purchasing, supplier and insurance actions | Broad integrated domain; requires ownership decomposition without creating duplicate engines |
| Follow-up | `src/domain/followup` | queries/types; automation also exists in DB | Domain exists but lifecycle authority is distributed |
| Inventory | `src/domain/inventory` | actions, queries, types, procedure consumption | Domain exists; cross-domain consumption rules require explicit integration mapping |
| Invoicing | `src/domain/invoicing` | actions, calculator, queries, refunds, billing summary | Strong financial subdomain; overlaps must be reconciled with Financial Resources |
| Journey Coordination | `src/domain/journey-coordination` | domain-event/work actions | Coordination boundary, not owner of other domains' entities |
| Notifications | `src/domain/notifications` | actions, queries, destination, personal notification operations | Platform delivery/read-state boundary; not a business-state owner |
| Overrides | `src/domain/overrides` | actions, queries, types | Authorization override boundary |
| Patient Portal | `src/domain/patient-portal` | portal, access, patient file/message actions | External-facing capability boundary; entitlement-gated |
| Patients | `src/domain/patients` | actions, authorization, queries, types | Core canonical patient domain candidate |
| Procedures | `src/domain/procedures` | actions, queries, types | Medical master candidate; service catalog relationship remains to be reconciled |
| Queue | `src/domain/queue` | actions, engine, queries, hooks, workspace actions | Operational workflow domain; must remain aligned with Patient Flow and Visit |
| Reports | `src/domain/reports` | module/report registries, queries | Read/report presentation boundary; not a second analytics engine |
| Role Templates | `src/domain/role-templates` | query boundary | Configuration support boundary |
| Roles | `src/domain/roles` | actions, queries, types | Authorization domain |
| Rooms | `src/domain/rooms` | actions, queries, types | Resource domain; integrates with Agenda/Workforce |
| Settings | `src/domain/settings` | actions, queries | Tenant/admin configuration boundary |
| Subscriptions | `src/domain/subscriptions` | actions, queries, types | Subscription boundary; must be reconciled with entitlement/license architecture |
| System Preferences | `src/domain/system-preferences` | actions, queries, types | Platform/tenant preference boundary |
| Treatment Plan | `src/domain/treatment-plan` | actions, procedure actions, types | Clinical planning domain; not owner of sessions/Agenda |
| User Settings | `src/domain/user-settings` | actions, queries | Personal configuration boundary |
| Users | `src/domain/users` | actions, queries, types | Tenant user lifecycle domain |
| Visit | `src/domain/visit` | actions, types | Clinical visit boundary; integration with Queue/Treatment Plan requires explicit contracts |
| Workforce | `src/domain/workforce` | workforce, commission, payroll lifecycle/core/actions | Broad operational domain; integrates with Agenda, Revenue, and HR/payroll concerns |

## 3. Platform/core boundaries

The repository also has platform-level execution services outside `src/domain`:

- `src/core/auth` — identity and tenant context resolution;
- `src/core/permissions` — effective permission evaluation and guards;
- `src/core/entitlements` — capability/subscription entitlement evaluation;
- `src/core/features` — feature registry/flags;
- `src/core/navigation` — navigation registry;
- `src/core/workspace` — workspace state, domain surface catalog, widgets, and workspace engine;
- `src/core/search` — Global Search;
- `src/core/realtime` — realtime provider;
- `src/infrastructure/supabase` — persistence/auth infrastructure;
- `src/infrastructure/pwa` — PWA infrastructure.

These are platform boundaries and must not become accidental business-domain owners.

## 4. Feature/UI layer

`src/features` contains presentation and feature composition for domains. It is not automatically an alternative business authority.

Examples:

- `src/features/agenda` → Agenda presentation;
- `src/features/patients` → Patient presentation;
- `src/features/financial-resources` → Financial Resources presentation;
- `src/features/workspace` → global shell/workspace presentation;
- `src/features/medical-files/domain` → requires boundary review because it introduces domain-like logic outside `src/domain`.

When feature code performs business mutations, it must be mapped to the authoritative domain operation rather than becoming a second mutation engine.

## 5. Highest-priority boundary questions

### A. Financial Resources ↔ Invoicing

Both have mutation/query logic. The next audit must determine which entity lifecycle belongs to Invoicing and which belongs to the broader Financial Resources orchestration layer.

### B. Queue ↔ Visit ↔ Patient Flow

Queue owns flow ordering and transitions while Visit owns clinical visit operations. Patient Flow is a workflow concept and UI workspace, not an independent security boundary. Transition authority must be explicit.

### C. Workforce ↔ Agenda ↔ Rooms

Workforce availability, rooms/resources, and Agenda scheduling are related but must not duplicate scheduling engines.

### D. Follow-up ↔ Journey Coordination ↔ Communications ↔ Operational Work

Follow-up creates downstream coordination and notification/work behavior. Domain event ownership and handler responsibility must be explicit.

### E. Procedures ↔ Services ↔ Treatment Plan ↔ Inventory

Procedures exist in the repository, while the broader Medical Master / Service Catalog architecture requires reconciliation against live schema and existing migrations before new entities are introduced.

### F. Subscriptions ↔ Entitlements ↔ Feature Flags ↔ Permissions

These layers exist independently. Their runtime ordering and authority must be mapped before additional capability gating is implemented.

### G. Medical Files

Medical Files currently has domain-like code under `src/features/medical-files/domain` plus API routes and database foundations. This is a direct candidate for boundary normalization, but only after caller and persistence mapping.

## 6. API boundary inventory

Current API routes visible in the reconciled tree include:

- `/api/agenda/events`;
- `/api/analytics/category`;
- `/api/analytics/overview`;
- `/api/build-info`;
- `/api/medical-files/agent`;
- `/api/patients`.

The first normalization candidate is `/api/patients`, because the current architecture evidence indicates direct table mutation alongside the Patients domain actions. This is an audit target, not an immediate refactor instruction.

## 7. Ownership rules

The following are now mandatory mapping rules:

1. A domain owns its canonical entity and lifecycle.
2. A feature component may render or request a domain operation but must not silently redefine its business rules.
3. An API route is a transport boundary, not a new business domain.
4. A workflow coordinator may coordinate domain actions but must not own the underlying domain entities.
5. Analytics and Reports are consumers/read models, not owners of operational state.
6. Notifications communicate state; they do not become the source of business truth.
7. Workspace determines work presentation; it does not determine authorization.
8. Entitlements determine capability access; permissions determine actor authority.

## 8. Next audit

The next concrete artifact is the **Business Rule Ownership Map**, which will trace high-value rules to their current authority across:

- TypeScript actions/services;
- API routes;
- PostgreSQL functions/RPCs;
- triggers;
- scheduled automation;
- RLS;
- permission/entitlement engines.

Only after that map is complete should mutation boundaries be normalized.

**Status: ACTIVE — domain boundaries mapped; no business behavior changed by this document.**
