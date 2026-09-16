# CORE SYSTEM — Financial & Resources Domain

**Document type:** Domain Concept, Decisions & Development Plan  
**Status:** Approved Concept / Development Reference  
**Domain:** Financial & Resources  
**Scope:** Clinic operational system around the Patient Journey  
**Last updated:** 2026-08-26

---

## 1. Purpose

Financial & Resources is a supporting domain of CORE SYSTEM. It exists to enable the complete Patient Journey inside the clinic, not to turn CORE into a general accounting, ERP, procurement, or hospital-finance platform.

The domain must make the financial and resource consequences of the Patient Journey understandable and actionable while keeping daily clinic use simple.

The governing product principle is:

> **Simple clinic-facing operation, rich and structured data in the background, and future-ready capabilities without requiring future rebuilds.**

The domain therefore has two simultaneous responsibilities:

1. Provide the small, practical set of financial/resource operations clinics need every day.
2. Continuously produce structured data that can support automation, intelligence, future add-ons, multi-branch growth, integrations, and future AI agents.

---

## 2. Relationship to the Patient Journey

Financial & Resources is not a separate business system disconnected from the Patient Journey.

The preferred relationship is:

```text
Service / Treatment Plan
        ↓
Treatment / Visit / Session
        ↓
Financial obligation
        ↓
Invoice / Insurance responsibility
        ↓
Payment / Installment
        ↓
Balance / Claim state
        ↓
Follow-up / Portal visibility / Automation
```

The domain must therefore integrate with existing Journey domains rather than create parallel sources of truth.

Important existing relationships include:

- Service Catalog / procedures
- Treatment Plans
- Visit / Session
- Patient Portal
- Patient identity
- Notifications / follow-up
- Inventory consumption
- Purchasing
- User roles and permissions

---

## 3. Domain Boundary

### In scope

- Invoicing
- Payments
- Installments / payment plans at the practical clinic level
- Patient financial responsibility
- Basic insurance financial handling
- Insurance claim register/reporting
- Inventory and consumption
- Purchasing and suppliers
- Receiving and stock movement
- Financial/resource automation
- Financial/resource KPIs and data collection
- Future-ready integration points for e-invoicing, insurers, payment providers, branches/locations, and AI

### Not the current product goal

CORE should **not** become a full accounting or enterprise resource planning system.

The following are outside the present operating scope unless a later product decision explicitly adds them:

- Full general ledger/accounting suite
- Payroll
- Treasury management
- Manufacturing
- Enterprise procurement suite
- Full supply-chain management
- Corporate tax accounting
- Complex hospital finance

External accounting/ERP systems may be integrated later where appropriate.

---

## 4. Core User-Facing Structure

The clinic-facing navigation should remain compact:

```text
Financial & Resources
├── Invoices
├── Payments
├── Purchases
└── Inventory
```

Insurance may appear as a contextual capability where the clinic uses insurance workflows; it must not create unnecessary complexity for a private-pay clinic.

Advanced capabilities should not create a large menu merely because the backend supports them.

The interface should expose the information required for the user's current task and surface useful results automatically.

---

## 5. Core Capabilities — Must Work

### 5.1 Invoicing

The existing invoicing domain is the starting point and must be extended/reconciled rather than replaced.

Current repository foundations include:

- invoice lifecycle: draft, issued, paid, partial, cancelled, refunded
- patient and session linkage
- invoice items
- quantity and pricing
- discount and tax fields
- payment terms
- payment records
- payment methods including insurance
- invoice totals and balances
- invoice creation from a session
- manual invoice creation
- invoice issuing
- payment recording
- discount handling
- cancellation

The current repository model is documented in `src/domain/invoicing/invoicing.types.ts` and related actions/calculator/queries.

The development objective is completion and integration, not replacement.

### 5.2 Payments

Payments are a first-class Core capability.

Minimum supported concepts:

- payment method
- amount
- date/time
- reference where applicable
- receiver/user attribution
- partial payment
- remaining balance
- payment status reflected on the invoice
- refund/correction foundation

### 5.3 Installments — Core

Installments are explicitly **Core**, not an Advanced-only feature.

Reason: they are directly connected to Patient Journey Treatment Plans and Patient Portal.

The model must be able to represent:

- total treatment/financial obligation
- deposit/down payment where applicable
- installment schedule
- due dates
- paid amount
- remaining amount
- installment status
- linkage to the relevant treatment plan/invoice
- patient-visible status where permitted through Patient Portal

The implementation must avoid separate, conflicting financial truths between Treatment Plan, Billing, and Patient Portal.

### 5.4 Insurance — Core Lite

Insurance must have a practical minimum in the base operating system even without external insurer/API integration.

At minimum the system must be able to identify that a patient's financial responsibility is:

- Self-pay
- Insurance
- Mixed

And retain, where applicable:

- insurer
- member/policy identifier
- coverage status/validity
- insurance responsibility
- patient responsibility
- claim/reference state

The base system must support a usable insurance claims/settlement report so a clinic can prepare and reconcile claims with its approved insurers manually.

Full electronic eligibility, authorization, claim submission, adjudication, remittance, and insurer integrations are future capabilities, not prerequisites for Core operation.

### 5.5 Inventory — Core

Inventory is a clinic operational resource system, not a warehouse ERP.

Core concepts:

- item/service-related resource definition
- stock quantity
- stock movement
- receipt/addition
- consumption
- adjustment
- basic low-stock indication
- linkage to treatment/service consumption where data is available

Inventory data must be usable for reporting and future intelligence even if the clinic does not use advanced inventory workflows.

### 5.6 Purchasing — Core

Core purchasing should cover the normal clinic cycle:

```text
Need / Purchase
   ↓
Supplier
   ↓
Purchase
   ↓
Receive
   ↓
Inventory
```

Minimum concepts:

- supplier
- purchased item
- quantity
- price/cost
- purchase date
- expected/received state where applicable
- receiving
- stock update
- basic purchasing history

The system should not require an enterprise procurement workflow for ordinary clinic purchasing.

---

## 6. Financial & Resource Intelligence — Active From Day One

A key architectural/product decision is that important data must be collected and calculated from the first day, even when the corresponding advanced operational capability is not yet exposed as a full workflow.

This is **not** feature gating and is **not** "backend placeholder" behavior.

The data layer should actively produce useful results and KPIs.

Examples include:

- revenue
- payments
- outstanding balances
- installment exposure
- insurance exposure
- insurance pending claims
- treatment/service financial value
- inventory movement
- consumption
- consumption related to treatment plans where data permits
- purchasing volume and cost
- stock level and low-stock indicators
- purchase/consumption relationships
- basic treatment/resource economics

These results may initially be approximate where the clinic has not configured detailed operational assumptions. Approximation is acceptable as an indicator, provided it is clearly represented and does not pretend to be audited accounting data.

The objective is to establish a valuable data foundation early and improve accuracy as the clinic's usage and configuration mature.

---

## 7. Financial Automation — Active Core Layer

Financial Automation is not a future-only feature. A useful baseline must operate now, while its architecture must support much richer future automation.

The fundamental model is:

```text
Event → Rule/Condition → Action → Recorded Result
```

Initial examples:

- invoice becomes overdue → reminder/task/notification
- payment received → update invoice/balance state
- treatment/session completed → financial charge/invoice flow where configured
- stock falls below threshold → alert
- purchase received → update stock
- insurance claim changes state → follow-up task/notification

Future automation can expand into:

- automated replenishment
- advanced collection workflows
- supplier/purchasing recommendations
- insurance exception handling
- advanced billing schedules
- predictive demand
- multi-location resource optimization

Automation should be mostly invisible in the daily UI. The user should experience the result, not the underlying engine complexity.

---

## 8. Future-Ready Capabilities

Capabilities that are larger than the current clinic operating requirement must still be architecturally present and data-ready where practical. They must not be discarded merely because they are not exposed as a complete feature today.

### Billing

Future-ready concepts include:

- treatment packages
- package/session balances
- richer installment/payment plans
- advanced pricing
- price lists
- credits/refunds
- recurring billing where relevant
- advanced billing automation
- treatment financial estimates

### Inventory

Future-ready concepts include:

- batch/lot
- expiry tracking
- multiple storage locations
- multi-branch inventory
- transfers
- valuation/cost analysis
- advanced replenishment
- consumption forecasting

### Purchasing / Suppliers

Future-ready concepts include:

- supplier price history
- preferred suppliers
- supplier performance
- advanced approval flows
- purchase recommendations
- three-way matching
- automated procurement assistance

### Insurance

Future-ready concepts include:

- eligibility integration
- pre-authorization
- electronic claim submission
- claim status integration
- adjudication/response
- remittance/reconciliation
- insurer-specific adapters

### E-Invoicing / Fiscal Compliance

The Core invoice model should remain jurisdiction-neutral.

Country-specific compliance should be implemented through adapters/integration layers rather than embedding one country's fiscal rules into the universal invoice domain.

Conceptually:

```text
CORE Invoice
     ↓
Compliance / Fiscal Adapter
     ↓
Country / Jurisdiction / Network
```

This keeps CORE ready for future national e-invoicing requirements without rebuilding Billing.

### Multi-Branch / Multi-Location

The architecture must not assume permanently that a tenant has only one branch or one storage location.

Where practical, location context should be extensible so future multi-branch operation does not require a fundamental rewrite.

---

## 9. AI Readiness and Data Strategy

Financial & Resources data is also a future input to CORE AI agents.

The system should therefore preserve structured, attributable, time-aware relationships rather than only storing display-ready totals.

A future AI agent should be able to understand a tenant from the beginning through available structured context such as:

- services and procedures
- treatment plans
- visits/sessions
- invoices
- payments
- installments
- balances
- insurance relationships
- claims
- inventory
- consumption
- purchasing
- suppliers
- alerts/events
- operational KPIs

The goal is to avoid an AI agent entering a tenant with an empty context window and waiting months for useful operational history.

The data collected today is therefore both operational data and future intelligence context.

---

## 10. Commercial/Product Strategy

The distinction between Core and Advanced is not simply a subscription restriction.

Core means the clinic must have enough capability to operate its Patient Journey correctly.

Advanced means additional operational power, automation, scale, integrations, or intelligence can later be exposed as an add-on, higher package, or optional capability.

However, useful underlying data should continue to be collected and used from day one.

This gives CORE SYSTEM the ability to make future product decisions from evidence rather than assumptions.

Examples of future product evidence:

- which clinics actually use inventory data
- which clinics have meaningful insurance activity
- how often installment plans are used
- which consumption KPIs matter
- where purchasing friction occurs
- which automation recommendations would provide measurable value

This allows future capabilities to be selected, priced, bundled, or promoted based on observed tenant needs.

---

## 11. UX Principles

The Financial & Resources domain must follow these non-negotiable principles:

1. **Simple daily workflow.**
2. **No accounting-ERP complexity exposed to ordinary clinic users.**
3. **Reuse existing Patient Journey data instead of duplicate entry.**
4. **Automate silently whenever the system can safely infer the action.**
5. **Show useful results without forcing users to understand the underlying engine.**
6. **Advanced backend capability must not automatically mean advanced UI complexity.**
7. **Role and permission design determines what each clinic user can operate.**
8. **Patient Portal receives only the financial information intended for patient visibility.**
9. **Financial state must remain consistent across Treatment Plan, Visit, Billing, and Portal.**
10. **The system should favor guided actions and contextual information over configuration-heavy screens.**

---

## 12. Data Quality Principle

The system should distinguish between:

- recorded facts
- calculated values
- estimates/indicators
- externally reconciled/confirmed values

Where a KPI is based on incomplete clinic configuration or inferred consumption/cost assumptions, it may still be displayed as an operational indicator, but it must not be represented as audited financial accounting.

This permits early intelligence without misleading users.

---

## 13. Development Strategy

The implementation sequence should follow:

### Phase FR-0 — Repository Reconciliation

Audit the current repository/database/runtime for:

- invoicing
- payments
- installment support
- insurance fields/workflows
- inventory
- consumption
- purchasing
- suppliers
- permissions
- navigation
- Patient Journey integration
- Treatment Plan integration
- Patient Portal integration
- existing notifications/automation

Classify every capability as:

- Working
- Partial
- Incorrect
- Disconnected
- Placeholder
- Missing
- Future-ready but incomplete

### Phase FR-1 — Core Financial Completion

Complete and integrate:

- invoice lifecycle
- payments
- balances
- installments
- patient financial responsibility
- basic insurance
- claims/settlement report

### Phase FR-2 — Core Resources Completion

Complete and integrate:

- inventory
- consumption
- purchasing
- suppliers
- receiving
- stock movement

### Phase FR-3 — Automation & Intelligence Foundation

Implement the minimum event/rule/action layer and establish reliable financial/resource KPIs.

### Phase FR-4 — Future-Ready Architecture

Validate that the current data model and domain boundaries can support without major rewrite:

- packages
- advanced payment plans
- advanced inventory
- advanced purchasing
- insurance integrations
- e-invoicing
- multi-branch/multi-location
- richer financial intelligence
- AI agent context

### Phase FR-5 — Runtime Reconciliation

Verify actual behavior through the real application and production data boundaries. No capability is considered complete solely because its types, UI, or database objects exist.

---

## 14. Architectural Rules

### Rule 1 — Reuse before creation

Reuse existing domains, tables, actions, queries, and Patient Journey relationships wherever they already represent the correct concept.

### Rule 2 — One financial truth

Invoice, payment, installment, insurance responsibility, and balance states must not be independently duplicated across modules.

### Rule 3 — Journey-first integration

Financial operations should attach to the Patient Journey rather than becoming an unrelated accounting workflow.

### Rule 4 — Data now, complexity later

Collect and structure valuable data now even when the advanced workflow is not yet exposed.

### Rule 5 — Capability without UI burden

Backend richness must not force frontend complexity.

### Rule 6 — Country-specific logic behind adapters

National fiscal and insurance integrations must not contaminate the universal CORE financial model.

### Rule 7 — Future-ready, not overbuilt

Prepare extension points and data relationships; do not prematurely implement enterprise workflows that have no current clinic value.

### Rule 8 — AI-readable data

Important operational facts must remain structured, attributable, and queryable so future AI agents can use them as tenant context.

### Rule 9 — No hidden feature-gating of data collection

Subscription/entitlement decisions may later control access to advanced capabilities, but they must not prevent CORE from collecting legitimate operational data required for system intelligence, reporting, and future product decisions.

### Rule 10 — Runtime reality is the final authority

Documentation and code structure are not sufficient evidence of completion. Runtime behavior and production data boundaries must be reconciled before closure.

---

## 15. Success Criteria

Financial & Resources is complete for the current scope when:

- a clinic can handle normal invoicing and payments without accounting-system complexity;
- installment plans can support Treatment Plans and Patient Portal;
- insurance patients can be identified and financially separated from self-pay patients;
- insurance claim/settlement information can be prepared and reconciled manually;
- basic inventory and purchasing work together;
- treatment/service consumption can contribute to resource data;
- useful financial/resource KPIs are generated from real system data;
- basic automation operates without creating unnecessary UI burden;
- the underlying model is extensible for future advanced capabilities;
- multi-branch/multi-location expansion does not require fundamental domain replacement;
- future e-invoicing and insurance integrations have clean extension boundaries;
- financial/resource data can become reliable context for future CORE AI agents;
- permissions and role boundaries remain consistent with the existing CORE authorization model;
- all user-facing workflows remain simple enough for rapid onboarding.

---

## 16. Decision Record

The following decisions are fixed unless a genuine architectural conflict is discovered during reconciliation:

| Decision | Status |
|---|---|
| Financial & Resources is a Patient-Journey-enabling domain, not a general ERP | Approved |
| Invoices are Core | Approved |
| Payments are Core | Approved |
| Installments are Core | Approved |
| Treatment Plan ↔ Installment ↔ Patient Portal relationship is required | Approved |
| Basic insurance identity/responsibility is Core | Approved |
| Manual insurance claims/settlement reporting is Core | Approved |
| Full insurer integrations are future capabilities | Approved |
| Basic Inventory is Core | Approved |
| Basic Purchasing/Suppliers/Receiving are Core | Approved |
| Financial Automation is an active foundational layer | Approved |
| Advanced capabilities should be architecturally/data ready | Approved |
| Advanced data/KPIs should be collected and surfaced where meaningful | Approved |
| Advanced capability data is not to be suppressed merely by subscription entitlement | Approved |
| Multi-branch/multi-location readiness should be preserved | Approved |
| E-invoicing must use jurisdiction-specific integration/adapters | Approved |
| CORE should not become a full accounting/ERP system | Approved |
| Financial data is future AI-agent context | Approved |
| UI simplicity is non-negotiable | Approved |

---

## 17. Reference Implementation Starting Point

Current repository evidence shows an established invoicing domain under:

```text
src/domain/invoicing/
├── invoicing.types.ts
├── invoicing.actions.ts
├── invoicing.queries.ts
└── invoicing.calculator.ts
```

The current types already include invoice lifecycle states, payment methods, payment terms including `installment`, invoice/payment entities, balances, and session linkage. The current actions already cover session/manual invoice creation, issuing, payment recording, discount handling, and cancellation.

This document therefore governs **reconciliation and evolution of the existing implementation**, not replacement with a new financial architecture.

Inventory and purchasing should be audited against the same principle before any implementation contract is produced.

---

## 18. Relationship to Future Domains

Financial & Resources must integrate cleanly with, but not absorb:

- Patient Journey / Clinical workflow
- Treatment Planning
- Patient Portal
- Agenda / Appointment
- Staff / Workforce
- Notifications
- Reporting / Analytics
- Platform Subscription / Entitlements
- Super Admin / Platform Governance

Super Admin and platform governance are outside the clinic operational financial domain. They govern the product as a platform and must not be mixed into the tenant's day-to-day Financial & Resources workspace.

---

## 19. Final Product Principle

> **CORE SYSTEM should know the clinic's financial and resource reality from the first day, while asking the clinic user to do only what is necessary to operate the Patient Journey.**

The system may become increasingly intelligent, automated, predictive, multi-location, integration-rich, and AI-assisted in the background. The daily clinic experience should remain simple.

That balance is a deliberate product requirement, not a temporary implementation compromise.
