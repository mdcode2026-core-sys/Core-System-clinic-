# CORE SYSTEM — Insights Engineering Blueprint

**Status:** Final pre-implementation engineering reference — reconciled with PJ and existing tenant domains
**Domain:** Insights
**Scope:** Tenant / Clinic operating environment, with future Platform Governance analytical access explicitly separated
**Authority:** This document governs Insights unless a later explicit architectural decision supersedes it.

## 1. Purpose

Insights converts operational data produced by CORE into understandable information that helps a clinic understand what is happening, what changed, and where attention may be useful.

Insights is not the Patient Journey engine, not a replacement for domain business logic, and not a full enterprise BI platform. It is an intelligence layer over the clinic's existing operational domains.

The governing product principle is:

> **Keep the user experience simple while allowing the analytical capability and data foundation behind it to be substantially richer.**

CORE remains a Patient Journey system. Administrative and operational data are analysed because they can explain conditions affecting the journey and clinic performance; Insights does not own or redefine those workflows.

## 2. Architectural position

```text
Patient / Operational Events
          ↓
Domain Data
          ↓
Canonical Metrics Layer
          ↓
Analytics Engine
          ↓
┌─────────┼───────────┐
│         │           │
Reports  Dashboards  Analysis
          │
          ↓
       Insights
          ↓
 Signals / Recommendations
          ↓
 Future AI
```

The owning domain remains responsible for its business rules and data semantics. Insights consumes those outputs through stable contracts and must not duplicate domain logic.

## 3. Core implementation already present

The repository already contains a meaningful Analytics foundation:

- `src/domain/analytics/analytics.engine.ts`
- `src/domain/analytics/analytics.actions.ts`
- `src/domain/analytics/analytics.queries.ts`
- `src/domain/analytics/analytics.types.ts`
- `src/domain/analytics/date/date.engine.ts`
- `src/domain/analytics/date/date.ranges.ts`
- `src/domain/analytics/kpi/kpi.registry.ts`
- `src/domain/analytics/kpi/kpi.calculator.ts`
- `src/domain/analytics/kpi/kpi.formatter.ts`
- KPI definition modules for patients, appointments, queue, revenue, invoices, inventory and follow-up
- `src/features/analytics/AnalyticsDashboard.tsx`
- `src/features/analytics/KpiCard.tsx`
- `src/features/analytics/KpiGrid.tsx`
- Analytics API routes for overview and category retrieval

The KPI registry currently covers patient, appointment, queue, revenue, invoice, inventory and follow-up measurements. The analytics engine resolves a KPI, calculates it for a tenant/date preset and returns a formatted result; the full registry is evaluated concurrently for overview data. Tenant identity is supplied explicitly to the engine.

The historical Analytics build record states that the initial implementation reached build/deployment completion and that Tenant A vs Tenant B isolation was verified with separate patient counts. That record also identified build/runtime verification as a separate responsibility and should not be treated as proof that all future Insights capabilities are complete.

## 4. Existing Reports foundation

The repository also contains a Reports domain:

- `src/domain/reports/reportRegistry.ts`
- `src/domain/reports/moduleRegistry.ts`
- `src/domain/reports/reports.queries.ts`
- `src/features/reports/reports-shell.tsx`
- `src/features/reports/report-viewer.tsx`
- `src/app/(dashboard)/reports/page.tsx`

The current report registry contains 18 reports across Patients, Agenda, Queue, Billing, Inventory and Follow-up, with explicit data-source contracts and date-range requirements.

Reports and KPIs must converge on canonical definitions rather than becoming two independent calculation systems.

## 5. Existing Dashboard foundation

The repository has a dashboard shell and an Analytics dashboard/KPI grid. The current model is suitable as the presentation foundation but is not considered the final Insights experience.

Dashboard is a presentation surface, not a separate analytical domain and not a second KPI engine.

## 6. Core analytical model

### 6.1 Canonical Metrics / KPI Catalog — Core

Every metric must have one authoritative definition covering at least:

- identifier
- human-readable name
- domain/category
- source
- calculation semantics
- unit/format
- time basis
- supported filters/breakdowns
- data-quality/coverage metadata when applicable

The same metric must not be independently redefined in Dashboard, Reports and domain-specific widgets.

### 6.2 Time and comparison engine — Core

The analytical date model must support a practical set of presets and custom ranges, including:

- Today
- Yesterday
- This Week
- Last Week
- This Month
- Last Month
- This Quarter
- Custom Range

Where meaningful, metrics should support current-vs-previous/baseline comparisons and trend direction.

The current repository date engine is the foundation; it must be extended rather than replaced.

### 6.3 Basic breakdowns — Core

Metrics should support a small, useful set of domain-appropriate breakdowns without exposing an enterprise BI interface.

Examples:

```text
Revenue → procedure / provider / payment type
No-show → day / provider / service
Inventory consumption → item / category / period
Waiting time → day / provider / service
```

### 6.4 Trends — Core

A current value should be distinguishable from its historical direction. Trend presentation should remain compact and understandable.

### 6.5 Targets — Core, lightweight

Where useful, clinics may define a simple target and see:

```text
Actual
Target
Gap / Status
Trend
```

This is not a separate enterprise goal-management product.

## 7. Reports — Core

Reports remain a single unified reporting capability, grouped by domain rather than exposed as many unrelated sidebar modules.

The preferred model is:

```text
Reports
├── Patient Journey
├── Operations
├── Financial
├── Inventory
├── Workforce
└── Management
```

A report should support appropriate filters, comparisons, drill-down and export subject to permissions and entitlement.

The report registry remains the source of report definitions; report calculations should reuse canonical metrics/domain queries.

## 8. Dashboards — Core

The clinic should have a focused overview dashboard and domain-oriented dashboards where justified.

The primary dashboard should answer:

> **How is the clinic doing?**

It should not become a wall of charts. Detailed investigation belongs in Reports/Analysis.

Dashboard visibility is governed by tenant capability and user effective permission; it is never a separate authorization system.

## 9. Core Insights — Core

Core Insights should answer:

1. What is happening?
2. What changed?
3. Where is attention potentially needed?

Core examples include:

- KPI values
- period comparisons
- trends
- basic breakdowns
- operational signals
- basic cross-domain relationships
- simple, explainable insights

Core must remain useful to a small clinic that does not want a complex BI experience.

## 10. Cross-domain analysis — Core foundation, progressively exposed

CORE domains must remain independent owners of their business logic, but Insights must be able to analyse relationships across them.

Relevant domains include:

- Patient Journey / Patients
- Agenda
- Queue
- Clinical domains
- Financial & Resources
- Workforce & Operations
- Team & Access
- Communications
- Follow-up

Examples:

```text
Appointment volume ↑
Waiting time ↑
Workforce capacity unchanged
→ operational pressure signal
```

```text
Follow-up completion ↓
Patient return rate ↓
→ continuity signal
```

The analytical layer may correlate data, but it must not silently convert a correlation into a clinical or managerial fact.

## 11. Data quality and confidence — Core backend foundation

Analytical outputs should retain sufficient metadata to distinguish robust results from results based on incomplete or sparse data.

The platform should be able to represent concepts such as:

- data coverage
- completeness
- sample size where relevant
- calculation timestamp
- confidence/quality state where appropriate
- known limitations

This is particularly important because the same analytical foundation will later support automation and AI.

The user-facing presentation should remain simple; technical data-quality metadata may be available on demand.

## 12. Advanced Insights

Advanced Insights increase interpretation rather than simply increasing the number of charts.

### 12.1 Contributor / driver analysis

Example:

```text
Revenue ↓ 8%
Main contributors:
- Procedure A ↓ 17%
- Provider B ↓ 12%
- Collections ↓ 9%
```

### 12.2 Advanced breakdowns

Multi-dimensional exploration may be supported when it produces meaningful operational value.

### 12.3 Anomaly detection

Detect unusual deviations from expected patterns and present them as signals rather than unexplained alarms.

### 12.4 Forecasting

Forecasting should be available as an Advanced capability when data quality and historical depth support it. Lack of sufficient history must not produce misleading certainty.

### 12.5 Advanced workforce, financial and inventory intelligence

These may combine multiple domain measures to expose higher-value management signals without turning CORE into a full ERP/BI suite.

## 13. Independent Advanced Add-ons

Some analytical capabilities may be commercial add-ons rather than merely part of the Advanced subscription tier.

Examples include:

- Predictive Intelligence
- Advanced Financial Intelligence
- Advanced Workforce Intelligence
- advanced inventory/cost intelligence
- future AI analytical capabilities

The exact packaging is a commercial decision and must not contaminate the canonical data/analytics architecture.

## 14. Future AI readiness

The system must collect and preserve useful operational history from the beginning even when the corresponding analytical capability is not exposed to the clinic.

The intended progression is:

```text
Data
 → Metrics
 → Analysis
 → Insights
 → Signals
 → Recommendations
 → AI
```

Future AI may use the same canonical analytical layer for narrative explanation, root-cause assistance, prediction, recommendations and controlled actions.

AI must not require rebuilding the historical data model later.

## 15. Subscription / entitlement principle

A tenant's subscription determines which analytical capabilities are exposed to that tenant.

It must not unnecessarily determine whether useful underlying data is collected or whether the analytics architecture is capable of producing a result.

Conceptually:

```text
Operational Data
      ↓
Analytics Engine
      ↓
Analytical Output
      ↓
Tenant entitlement + user permission
      ↓
What the clinic may see/use
```

Therefore Basic, Advanced and independent add-ons are primarily capability-exposure layers over a shared analytical foundation.

## 16. Platform-level analytical access — future Platform Governance

Super Admin is not part of the tenant operating environment and must not be added to the tenant Sidebar or tenant authorization model as an operating role.

A future independent Platform Governance environment may access **Final Analytical Outputs** for tenants, including analytical capabilities not exposed to that tenant's subscription.

Purpose may include:

- technical/support assistance
- training
- coaching
- customer-success work
- demonstrating unused analytical value
- product intelligence
- identifying adoption opportunities

This does **not** mean unrestricted access to tenant operational records.

The intended distinction is:

```text
Allowed Platform-level analytical output:
KPI / Trend / Pattern / Comparison / Insight / Forecast / Aggregated signal

Not implied by this decision:
Patient records / clinical notes / raw invoices / raw payments /
individual staff records / raw operational transactions
```

The final security, privacy and access model belongs to the future Platform Governance/Super Admin domain. The current Insights implementation must only preserve the architectural ability to support this separation.

## 17. Relationship to Patient Journey

Insights is not part of the Patient Journey execution engine.

The relationship is:

```text
Patient Journey + Clinic Operations
            ↓
        Operational Data
            ↓
          Insights
            ↓
Understanding of factors affecting journey and clinic outcomes
```

Insights may expose relationships such as workforce pressure, waiting time, follow-up performance, financial friction or inventory constraints that can affect journey outcomes.

It must not duplicate or redefine PJ workflow rules, clinical rules, Agenda rules, treatment-plan rules or follow-up ownership.

## 18. Relationship to Financial & Resources

Financial data must support at least the current and approved future analytical foundation for:

- invoices
- payments
- revenue
- installments
- insurance-related financial status/claims reporting
- purchasing
- inventory
- consumption
- supplier/resource information where implemented

Financial Automation and richer financial intelligence may operate in the background even before all advanced views are exposed.

Insights must use financial domain outputs rather than recreate billing/payment logic.

## 19. Relationship to Workforce & Operations

Workforce remains responsible for workforce/employment/availability/capacity data and operations remains responsible for operational execution.

Insights may analyse:

- workload
- capacity
- productivity
- attendance/availability where available
- performance indicators
- staffing pressure
- relationships between workforce capacity and operational outcomes

Insights must not become an HR/payroll engine.

## 20. Relationship to Team & Access

Team & Access determines who may access or act on Insights.

```text
Tenant capability
AND
User effective permission
→ Effective analytical access
```

Roles remain independent from permissions. Workspace remains a UX organization mechanism rather than an authorization boundary.

The Analytics domain must reuse the existing permission/entitlement architecture and must not create a second authorization system.

## 21. Relationship to Agenda and Queue

Agenda remains distinct from Calendar and owns appointment scheduling/business rules. Queue owns live operational flow.

Insights consumes their events and measures outcomes such as:

- appointment volume
- attendance/cancellation/no-show
- waiting time
- throughput
- utilization-related signals

Insights must not become the owner of appointment conflict, availability or queue execution logic.

## 22. Relationship to Communications and Follow-up

Communication remains the owner of message delivery and communication workflows. Follow-up remains the owner of follow-up execution.

Insights may analyse:

- communication activity trends
- follow-up completion
- response rates
- overdue follow-up
- retention-related indicators

It must not silently send communications or perform follow-up actions merely because an insight exists.

## 23. UX principles

1. One obvious entry point for Insights.
2. Few useful dashboards, not dozens.
3. Plain-language explanations.
4. Progressive disclosure: simple first, detail on demand.
5. Consistent metric names and definitions.
6. No requirement for users to understand BI terminology.
7. No SQL, data modelling or enterprise report-builder requirement for ordinary users.
8. Advanced complexity stays in the background unless explicitly requested.
9. Mobile and RTL/LTR behavior must follow the established system-wide foundations.

## 24. Core / Advanced / Add-on / Future classification

### Core

- Canonical KPI/metric layer
- KPI catalog/registry
- practical date ranges
- period comparisons
- trends
- basic breakdowns
- focused dashboards
- unified Reports
- basic cross-domain analysis
- simple operational insights/signals
- data quality/coverage metadata in the backend
- tenant isolation
- permission/entitlement enforcement

### Advanced

- contributor/driver analysis
- advanced breakdowns
- anomaly detection
- forecasting
- advanced workforce intelligence
- advanced financial intelligence
- advanced inventory intelligence
- richer goal/target analysis
- recommendation layer

### Independent Add-ons

- Predictive Intelligence
- specialized advanced financial/workforce/inventory intelligence
- future AI analytical capabilities

### Future-ready foundation

- historical/time-series depth
- analytical output versioning/traceability
- richer confidence models
- natural-language analytics
- AI analyst/agent
- predictive patient-retention intelligence
- AI-assisted root-cause analysis
- AI recommendations and controlled actions

## 25. Decisions explicitly rejected

- Full enterprise BI replacement.
- Power-BI-style self-service data modelling for ordinary clinic users.
- User-authored SQL reports.
- Dozens of chart types as a product goal.
- Separate KPI engines for Dashboard and Reports.
- Insights owning domain business logic.
- AI chatbot as a prerequisite for Insights.
- Subscription gating that prevents useful historical data from being collected when legally and operationally appropriate.
- Super Admin being added to the tenant operating environment.
- Super Admin receiving raw tenant operational data merely because they can access platform-level analytical outputs.

## 26. Reconciliation findings and implementation gaps

The current repository demonstrates a strong initial KPI/Reports foundation, but the final Insights model is not fully implemented.

The principal gaps to address in the implementation phase are:

1. Extend the date engine beyond the current basic presets and make comparison semantics consistent.
2. Establish one canonical metric contract shared by KPI cards, Reports and future Insights.
3. Add trend/comparison presentation without duplicating calculations.
4. Add controlled basic breakdown support.
5. Evolve Reports from a fixed report registry into a consistent user experience while retaining the registry as authority.
6. Add focused dashboard composition over the same canonical metrics.
7. Introduce a rule-based, explainable Insights layer rather than starting with AI.
8. Add cross-domain analytical composition without moving domain ownership into Insights.
9. Add data-quality/coverage metadata to analytical outputs.
10. Prepare advanced contributor, anomaly and forecasting interfaces behind capability gates, while preserving the shared data foundation.
11. Preserve the future Platform Governance analytical-output boundary without creating Super Admin access inside tenant routes.
12. Reconcile analytics/report permissions with the existing Permission Catalog and entitlement model.
13. Ensure every analytical query remains tenant-scoped and server-enforced.

These are implementation tasks, not permission to reopen settled architectural decisions.

## 27. Validation requirements

An Insights implementation is not complete because a dashboard renders.

Validation must include, as applicable:

- build/typecheck/lint
- real tenant data checks
- tenant-isolation verification
- metric correctness against source/domain data
- date-range correctness
- comparison correctness
- report/KPI consistency
- permission enforcement at server/action boundary
- entitlement enforcement
- RTL/LTR behavior
- mobile behavior
- empty/sparse data behavior
- failure/error states
- performance for multi-KPI overview loading
- no leakage of raw tenant data through analytical APIs

## 28. Implementation rule

```text
Approved Insights Decision
        ↓
Inspect current repository + live schema/runtime
        ↓
Reuse canonical domain data and existing analytics/report foundations
        ↓
Extend only where a real gap exists
        ↓
Integrate with Financial, Workforce, Team & Access, Agenda,
Clinical, Follow-up and Communications
        ↓
Enforce tenant isolation + entitlement + permission
        ↓
Validate runtime and analytical correctness
        ↓
Document final implementation
```

The governing engineering principle remains:

> **Inspect → Reuse → Extend → Create only when genuinely required.**

## 29. Final decisions

1. Insights is an analytical layer over CORE's operational domains, not a replacement for them.
2. CORE remains centered on the complete Patient Journey; Insights supports understanding of factors affecting it but does not own PJ rules.
3. The existing KPI/Analytics foundation is retained and extended rather than replaced.
4. Reports, Dashboards and KPI cards must share canonical metric definitions.
5. Core Insights must be simple enough for clinics that want minimal complexity.
6. Advanced Insights should add interpretation, detection and prediction rather than merely more charts.
7. Independent analytical add-ons may be commercial capabilities above the Advanced tier.
8. Data collection/history must be sufficiently rich from day one to support later automation and AI.
9. Subscription controls tenant exposure of analytical capabilities; it should not unnecessarily cripple the underlying analytical/data foundation.
10. Super Admin remains outside the tenant operating environment.
11. A future independent Platform Governance environment may access final analytical outputs across tenants, including outputs not exposed to a tenant, for support/training/coaching/product purposes, without implying access to raw tenant operational data.
12. Platform-level analytical access is a future governance concern and must not be implemented as tenant Super Admin permissions.
13. Analytics must never become a second business-rule or authorization engine.
14. The final user experience must follow progressive disclosure: simple default experience, powerful depth on demand.
15. Advanced analytical capability must be designed now so that future AI can consume the same canonical data and analytical outputs without architectural rework.

**End of Insights Engineering Blueprint.**
