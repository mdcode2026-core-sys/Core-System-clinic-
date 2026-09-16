# CORE SYSTEM — Unified Execution Architecture
## 2026-09-16

**Status:** ARCHITECTURE BASELINE — ACTIVE
**Baseline:** Post-129 reconciled implementation head `1a1282bcdf59f037c9ef491c51b5425261cd86a9`

## 1. Architectural objective

CORE SYSTEM is not a collection of independent screens or CRUD modules. It is a multi-tenant clinic operating platform in which independent business domains cooperate through explicit relationships, events, permissions, and workflows.

The architecture must therefore answer four questions for every operation:

1. **Who owns the business entity?**
2. **Where is the authoritative business rule executed?**
3. **How does another domain request or react to the operation?**
4. **How is authorization, tenant integrity, history, and failure behavior enforced?**

## 2. Target model

```text
                    CORE SYSTEM
                         │
          ┌──────────────┴──────────────┐
          │                             │
   BUSINESS DOMAINS              PLATFORM SERVICES
          │                             │
   canonical entities            authorization
   lifecycle rules               tenant isolation
   mutation boundaries           audit/history
   domain queries                notifications
          │                      scheduling/automation
          └──────────────┬──────────────┘
                         │
                 WORKFLOW COORDINATION
                         │
          events → handlers → actions/tasks
                         │
             ┌───────────┴───────────┐
             │                       │
          INGRESS                  EGRESS
       Web / API / Actions      Webhooks / Integrations
```

This is an execution architecture, not a mandate to introduce a new framework immediately.

## 3. Domain contract

Every major domain must eventually document:

| Concern | Required answer |
|---|---|
| Entity | What does this domain own? |
| Lifecycle | What states and transitions does it control? |
| Mutation boundary | Which function/service/action is authoritative? |
| Query boundary | Which queries/read models are authoritative? |
| Authorization | Which permissions and tenant rules apply? |
| Events | Which facts may be emitted to other domains? |
| Integrations | Which other domains may depend on those events/actions? |
| Audit | What must be recorded as an administrative or business history? |
| Failure | What is transactional, retryable, compensatable, or terminal? |

No domain should silently become the owner of another domain's canonical entity.

## 4. Current implementation reality

The repository already contains real domain/application logic. Examples include Agenda mutation services and conflict handling, patient actions, analytics engines/queries, financial actions/queries, PostgreSQL financial RPCs, follow-up automation, operational work creation, notification queues, workforce/agenda interaction, RLS, and permission functions.

The problem is distribution, not absence.

Business behavior currently crosses several execution mechanisms:

- TypeScript domain actions/services;
- API routes;
- Server Actions;
- PostgreSQL functions/RPCs;
- database triggers;
- scheduled jobs/cron;
- notification queue;
- operational work items;
- RLS and permission functions.

Therefore the architecture work must map existing behavior before moving it.

## 5. Rule ownership model

For each significant rule, classify it as exactly one of these primary authorities:

- **Domain rule** — owns business meaning and lifecycle.
- **Authorization rule** — decides whether an actor may perform an operation.
- **Tenant-integrity rule** — guarantees cross-tenant boundaries.
- **Persistence invariant** — database-level invariant that must never be bypassed.
- **Workflow coordination** — reacts to a domain fact and coordinates another operation.
- **Presentation rule** — controls how an already-authorized capability is shown.

A single behavior may have supporting enforcement in multiple layers, but it must have one identifiable business authority.

## 6. Event model

CORE SYSTEM should distinguish:

### Domain event
A fact that has happened in an owning domain.

Example: `invoice.payment.recorded`.

### Command/action
An authorized request to perform an operation.

Example: `record_invoice_payment`.

### Operational task/work item
Work that must be completed by an authorized human or operational process.

Example: a follow-up-generated operational work item.

### Notification
A delivery mechanism informing an actor about a relevant fact or task.

### History
Business timeline information describing lifecycle progression.

### Audit
Security/administrative evidence of an action or mutation, including actor/context where required.

These records must not be collapsed into one generic "event" table merely for convenience.

## 7. Workflow coordination

The current system already contains workflow-like mechanisms. The next step is not to replace them with a universal engine in one rewrite.

Instead:

1. inventory existing workflows;
2. identify their current authority;
3. identify duplicate or competing transitions;
4. define event names and ownership;
5. add explicit handlers only where integration is currently implicit or fragile;
6. preserve existing behavior;
7. migrate incrementally when objective evidence shows a benefit.

The desired result is a **workflow registry and handler model**, not an uncontrolled second engine.

## 8. API boundary rule

API routes are transport boundaries.

They may:

- authenticate the request;
- resolve actor/tenant context;
- validate transport input;
- call the authoritative application/domain operation;
- map domain results to HTTP responses.

They should not independently reimplement domain mutation rules that already belong to a domain service/action/RPC.

The current `/api/agenda/events` pattern is closer to the target than routes that directly mutate domain tables. Those direct routes become candidates for normalization only after their existing behavior, authorization, transactionality, and callers are mapped.

## 9. Database boundary rule

PostgreSQL remains authoritative for persistence and database invariants.

Use database-level enforcement for invariants that must survive every application path, including:

- tenant integrity;
- referential integrity;
- state invariants that cannot safely be bypassed;
- security-sensitive RLS enforcement.

Use domain/application services for orchestration and business operations that require readable application-level policy.

Do not move a rule merely because it currently lives in PostgreSQL, and do not move a rule merely because TypeScript is easier to edit.

## 10. Authorization and entitlement

The execution path must distinguish:

```text
Identity
   ↓
Tenant context
   ↓
Role / permissions / overrides
   ↓
Subscription / entitlement / capability
   ↓
Domain operation
   ↓
RLS / persistence invariants
```

None of these layers replaces another.

In particular:

- visibility is not authorization;
- permission is not subscription entitlement;
- entitlement is not resource capacity;
- role is not workspace;
- workspace is not a security boundary.

The existing permission engine and subscription ceiling work must be reconciled against the four-layer license architecture before new module gating is proliferated.

## 11. Cross-domain integration rule

A cross-domain operation must state:

- source domain;
- source entity/event;
- target domain;
- target action;
- authorization boundary;
- tenant relationship;
- transaction boundary;
- retry/idempotency behavior;
- audit/history expectation;
- failure/compensation behavior.

This is especially important for Agenda ↔ Workforce, Patient ↔ Treatment Plan, Treatment Plan ↔ Sessions, Follow-up ↔ Communications/Operational Work, Revenue ↔ Commission/Payroll, Procurement ↔ Inventory/Financial obligations, and Subscription ↔ Capability access.

## 12. Integration anti-patterns prohibited

The following are prohibited in new work unless explicitly justified and approved:

- a second canonical entity for an existing domain object;
- direct writes from a presentation component into business tables;
- an API route duplicating a domain mutation engine;
- a trigger silently becoming an undocumented business workflow;
- notification logic becoming the source of business state;
- using UI visibility as a security decision;
- using `subscription_tier` as a substitute for the full license model;
- cross-tenant references without explicit integrity enforcement;
- adding a generic event bus before existing events/workflows are mapped;
- reviving superseded branches because they contain convenient code.

## 13. Migration strategy

Architecture normalization must be incremental:

**Inspect → Map → Protect → Normalize → Verify → Deprecate**

### Inspect
Find all callers, rules, database functions, triggers, tests, and docs.

### Map
Assign ownership and identify duplicates.

### Protect
Add tests/invariants before moving behavior.

### Normalize
Route new execution through the authoritative boundary.

### Verify
Run contract, type, build, database, authorization, tenant, and runtime checks.

### Deprecate
Remove the old path only after callers are migrated and evidence is captured.

## 14. First implementation targets

The first implementation stream after architecture mapping should prioritize high-risk inconsistencies rather than broad refactoring:

1. migration/repository/live-schema lineage reconciliation;
2. cross-domain tenant integrity findings;
3. API routes that directly mutate canonical domain tables;
4. distributed workflows with multiple competing authorities;
5. permission/entitlement boundary mismatches;
6. medical master/service catalog gaps;
7. only then broader workflow/event normalization.

## 15. Verification contract

Every architecture change must provide:

- exact base SHA;
- changed files;
- affected domains;
- authority before and after;
- migration impact, if any;
- authorization impact;
- tenant-isolation impact;
- automated results;
- runtime evidence when behavior changes;
- rollback/recovery path;
- documentation reconciliation.

No green build alone proves architectural correctness.

## 16. Final target

The mature CORE SYSTEM execution model is:

```text
Independent Domains
        │
        ├── own entities
        ├── own business rules
        ├── own lifecycle
        └── explicit application boundaries
                │
                ▼
       Workflow / Event Coordination
                │
        ┌───────┴────────┐
        ▼                ▼
     Ingress            Egress
  Web/API/Actions   Webhooks/Integrations
        │                │
        └───────┬────────┘
                ▼
       Canonical Supabase DB
       + RLS + tenant integrity
       + permissions + audit
```

This architecture preserves CORE SYSTEM's independent-module principle while making cross-domain execution explicit, testable, and maintainable.

**Status: ACTIVE — architecture established; implementation follows the post-129 execution order.**
