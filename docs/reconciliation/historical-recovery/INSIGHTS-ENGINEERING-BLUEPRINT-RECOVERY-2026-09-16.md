# CORE SYSTEM — Insights Engineering Blueprint Recovery
## Historical source: `docs/insights-reconciliation-blueprint`
## 2026-09-16

**Classification:** HISTORICAL SOURCE / CURRENT ARCHITECTURAL REFERENCE
**Source branch:** `docs/insights-reconciliation-blueprint`
**Source head:** `5fef57cae763b3b629b7bcd8364879c29cade4ab`
**Source commit:** `docs: add final Insights engineering blueprint`
**Relationship to main:** source branch diverges from `main` and contributes one documentation artifact: `docs/INSIGHTS-ENGINEERING-BLUEPRINT.md`.

## 1. Why this artifact matters

The source blueprint defines Insights as an intelligence layer over existing CORE operational domains rather than a new business engine or enterprise BI replacement. Its architecture is:

```text
Operational Events
      ↓
Domain Data
      ↓
Canonical Metrics / KPI Layer
      ↓
Analytics Engine
      ↓
Reports / Dashboards / Analysis
      ↓
Insights
      ↓
Signals / Recommendations
      ↓
Future AI
```

Ownership remains in the source domain. Insights consumes canonical domain outputs and must not duplicate domain business logic.

## 2. Core analytical model retained

The recovered blueprint establishes the following as the intended common analytical foundation:

- one canonical KPI/metric definition;
- metric identifier, name, source, semantics, unit/format and time basis;
- practical date presets and custom ranges;
- current-vs-previous/baseline comparisons where meaningful;
- compact trend presentation;
- useful domain-specific breakdowns;
- lightweight targets where they add decision value;
- data-quality/coverage metadata for analytical results;
- focused dashboards rather than a wall of charts;
- unified Reports consuming the same metric definitions;
- explainable Core Insights;
- progressively richer Advanced Insights such as drivers, anomaly detection and forecasting.

The same metric must not be independently redefined by Dashboard, Reports or domain-specific widgets.

## 3. Core / Advanced / Add-on distinction

### Core

- canonical KPI/metric layer;
- KPI registry/catalog;
- practical date ranges;
- comparisons and trends;
- basic breakdowns;
- focused dashboards;
- unified Reports;
- basic cross-domain analysis;
- simple explainable signals/insights;
- analytical data-quality metadata;
- tenant isolation;
- existing permission/entitlement enforcement.

### Advanced

- contributor/driver analysis;
- multi-dimensional breakdowns;
- anomaly detection;
- forecasting;
- advanced workforce/financial/inventory intelligence;
- richer goal/target analysis;
- recommendation layer.

### Independent add-ons / future-ready

- Predictive Intelligence;
- specialized financial/workforce/inventory intelligence;
- future AI analytical capabilities;
- narrative analytics, AI analyst/agent and controlled recommendations.

Commercial packaging remains a product/commercial decision; it must not split the canonical analytical architecture.

## 4. Domain boundaries

Insights does not own or redefine:

- Patient Journey or clinical workflow;
- Agenda scheduling/availability;
- Queue / Patient Flow execution;
- Financial & Resources transaction logic;
- Workforce/HR/payroll authority;
- Communications message delivery;
- Follow-up execution;
- Team & Access authorization.

Insights may analyse relationships across these domains, for example workload vs waiting time, follow-up completion vs return behavior, or financial/resource friction vs operational conditions. Correlation must not be presented as an established clinical/managerial fact without appropriate qualification.

## 5. Platform-level analytical boundary

A future Platform Governance / Super Admin environment may consume **Final Analytical Outputs** such as KPI, trend, pattern, comparison, insight, forecast or aggregated signal. The blueprint explicitly does not imply unrestricted access to raw patient, clinical, invoice, payment, staff or operational transaction records.

Super Admin must remain outside the tenant operating environment and must not become a tenant Sidebar/permission role merely because platform-level analytics may eventually exist.

## 6. UX rules retained

- one obvious Insights entry point;
- few useful dashboards rather than many;
- plain-language explanations;
- progressive disclosure;
- consistent metric definitions;
- ordinary clinic users should not need BI/SQL/data-modelling knowledge;
- advanced complexity remains in the background until needed;
- mobile and RTL/LTR follow the global experience constitution.

## 7. Important implementation gaps identified by the source

The blueprint identifies, for a future Insights workstream:

1. extend/normalize the analytics date/comparison engine;
2. establish one canonical metric contract across KPI, Dashboard and Reports;
3. add trend/comparison presentation without duplicated calculation logic;
4. add controlled basic breakdowns;
5. evolve Reports as a coherent user experience while retaining the report registry as authority;
6. build focused dashboards over the same canonical metrics;
7. introduce a rule-based explainable Insights layer before AI;
8. add cross-domain analytical composition without transferring domain ownership;
9. attach data-quality/coverage metadata;
10. prepare advanced contributor/anomaly/forecasting capability behind entitlement/permission gates;
11. preserve future Platform Governance analytical-output separation;
12. reconcile analytical permissions with the canonical permission/entitlement model;
13. verify tenant scoping and server enforcement for every analytical query.

These are implementation requirements for a future governed Insights workstream, not authorization to modify the current Experience Foundation branch scope.

## 8. Recovery conclusion

This document is preserved in #129 because its source branch contributes a documentation artifact that is genuinely absent from `main`. It is **not** promoted as a new Experience Foundation decision and does not override newer approved Experience/Architecture documents.

The exact source remains traceable through the source branch and commit listed above.
