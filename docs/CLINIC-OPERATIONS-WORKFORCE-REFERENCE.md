# CORE SYSTEM — Clinic Operations & Workforce Domain Reference

**Status:** Conceptual reference / domain baseline
**Scope:** Clinic Operations and Workforce only
**Integration references:** Patient Journey (PJ) and Financial & Resources
**Platform Governance:** Explicitly outside this domain

## 1. Purpose

This document records the approved conceptual direction and repository reconciliation for the **Clinic Operations / Workforce** domain.

The domain exists to help the clinic operate the patient journey efficiently and sustainably. It is not an HR product and it is not a replacement for Patient Journey, Agenda or Financial & Resources.

The central principle is:

> The complete patient journey remains the primary objective. Clinic Operations provides the people, capacity, resources, administrative controls and operational intelligence required to deliver that journey reliably.

The system should favor patient outcomes while preserving the operational, financial, administrative, legal and compliance requirements needed to protect the clinic and its team.

## 2. Boundary with Patient Journey

Patient Journey is the anchor.

Clinic Operations supports the journey from first clinic contact/appointment through arrival, queue, clinical work, treatment, payment and continuing follow-up.

Typical relationship:

Appointment → Agenda → Arrival/Queue → Workforce/Resource → Clinical Work → Treatment → Financial → Follow-up.

Clinic Operations must not become a separate journey competing with PJ.

## 3. Boundary with Platform Governance

Super Admin is **not part of the tenant operational system**.

The tenant operating environment is used by the clinic and contains its operational users, roles, workforce, agenda, resources, financial functions and patient-journey workflows.

Super Admin belongs to a separate platform-governance layer responsible for the technical product, tenant/platform administration, support, training, maintenance and product development.

It must not be modeled as another clinic operating role merely because it has platform-level access.

## 4. Workforce and Agenda are separate domains

This is an explicit architectural decision.

### Workforce owns

- Employee identity and employment context
- Position/job information
- Employment status
- Working patterns
- Workforce availability inputs
- Capacity
- Attendance/time
- Leave/absence
- Compensation context
- Payroll
- Benefits
- Commissions/incentives
- Workforce performance

### Agenda owns

- Appointment scheduling
- Appointment lifecycle
- Schedule timing
- Provider/resource conflicts
- Operational agenda behavior
- Availability calculation used for booking

### Integration

Workforce determines who can work and what capacity exists.

Agenda determines when scheduled work occurs.

Neither domain replaces the other.

## 5. Repository foundations to reuse

The current repository already contains several capabilities that form the foundation of Clinic Operations.

### Users

Existing user/domain structures provide tenant user identity and system-access context.

**Decision: REUSE.**

User must remain distinct from Employee.

### Roles & Permissions

Existing role and permission architecture was established and improved during PJ work, including role permissions and user-level override concepts.

**Decision: REUSE + EXTEND.**

Workforce should connect job/position context to the existing authorization architecture without conflating Job/Position with System Role.

### Agenda

Agenda is already an independent domain.

**Decision: REUSE + EXTEND.**

Do not create a second calendar or scheduling engine for Workforce.

### Availability

The repository already contains availability logic connected to working hours, blocked periods and agenda conflicts.

**Decision: REUSE + EXTEND.**

Future Workforce capability should provide workforce constraints/capacity inputs to availability rather than replace the existing Agenda logic.

### Queue

Queue already exists as an independent operational domain.

**Decision: REUSE + INTEGRATE.**

Expected relationship:

Agenda → Arrival → Queue → Staff/Resource assignment → Clinical workflow.

### Rooms / Resources

Rooms already exist and Agenda accounts for resource conflicts.

**Decision: REUSE + EXTEND.**

Future resource capability can add resource type, capability, availability, utilization and maintenance where justified.

### Reporting / KPI infrastructure

The repository contains reporting/KPI foundations and domain-specific KPI definitions.

**Decision: REUSE + EXTEND.**

Workforce must feed the existing analytics layer rather than create another reporting system.

## 6. Missing Workforce capabilities

The repository does not currently provide a complete Workforce domain covering the following capabilities as a coherent employment system.

### Employee

**Decision: CREATE.**

Employee should capture workforce identity and employment context while remaining separate from the authentication User.

### Employment / Contracts

**Decision: CREATE.**

The clinic needs employment status, position, employment type, dates, working terms, compensation context and effective dates.

### Recruitment

**Decision: CREATE.**

Recruitment should be clinic-sized rather than a general-purpose recruiting platform.

Suggested flow:

Staffing need → Position → Candidate → Evaluation → Offer → Employment.

Recruitment should eventually connect to workforce capacity and staffing requirements.

### Attendance / Time

**Decision: CREATE.**

Attendance is operational data, not only HR data.

It should support working-time evidence, overtime, absence, payroll inputs, capacity and Agenda availability.

### Leave / Absence

**Decision: CREATE.**

Minimum capability should include leave types, entitlement/balance, approval, public holidays, partial leave where needed and impact on availability/payroll.

### Payroll

**Decision: CREATE.**

CORE should provide clinic-sized payroll capability rather than attempt to become an enterprise payroll suite.

Core concepts:

- Salary
- Salary components
- Allowances
- Deductions
- Overtime
- Bonuses
- Commissions
- Leave/absence effects
- Payroll periods
- Payslips
- Employer cost
- Auditability
- Period locking

Country-specific legal rules should be localized rather than embedded into a universal payroll model.

### Benefits

**Decision: CREATE.**

Benefits should support the clinic's employment-cost and employee package picture without requiring enterprise benefits administration.

### Commissions / Incentives

**Decision: CREATE.**

This is especially important for clinics where doctors, reception/coordinators or other staff may receive commissions, percentages or bonuses tied to patient activity or collected revenue.

A commission calculation must preserve the rule that determines eligibility and attribution.

Example:

Patient → Appointment/Visit → Procedure → Invoice → Collected Revenue → Attribution → Commission Rule → Eligible Commission.

### Workforce Performance

**Decision: CREATE + INTEGRATE WITH EXISTING ANALYTICS.**

Performance must not be reduced to patient count.

Potential dimensions include:

- Workload
- Productivity
- Reliability
- Attendance
- Operational contribution
- Financial contribution
- Patient-flow contribution
- Compliance
- Quality indicators

The system should distinguish activity, contribution and outcome instead of collapsing everything into a single simplistic employee score.

## 7. Workforce ↔ Patient Journey

The team is an operating component of the journey.

Workforce data should help answer:

- Was the clinic sufficiently staffed?
- Was the required skill available?
- Was workload reasonable?
- Did staffing affect waiting time or flow?
- Did absence affect the journey?
- Was work performed as expected?
- What operational factors affected the patient experience?

The purpose is not to maximize patient convenience at the expense of staff sustainability.

## 8. Patient/team balance

CORE should optimize for a sustainable outcome:

**Patient Journey Outcome + Team Sustainability + Clinic Business Performance**

subject to:

**Clinical + Administrative + Financial + Legal/Compliance controls.**

The patient remains the primary objective, but the team remains a necessary operational resource and stakeholder.

The target is not "the happiest patient at any cost". The target is a patient who receives a reliable, satisfactory journey and remains connected to the clinic for as long as possible, while the clinic maintains a sustainable and compliant operation.

## 9. Workforce ↔ Financial & Resources

The domains must remain separate but form an operational loop:

Workforce → Work performed → Attribution → Revenue/Cost → Compensation → Payroll → Performance.

Examples:

- Doctor salary + procedure commission
- Reception incentive + patient conversion/collection rules
- Overtime affecting payroll and capacity
- Absence affecting Agenda capacity
- Staff cost compared with attributable collected revenue
- Resource usage affecting treatment cost

Financial contribution must not automatically be interpreted as employee profitability.

## 10. Workforce ↔ Resources

Workforce capacity must be considered together with physical resources.

Examples:

- Doctor + treatment room
- Technician + device
- Nurse/assistant + procedure capacity
- Staff availability + room availability
- Staff skill + resource capability

A person being available does not guarantee that the required operational resource is available, and vice versa.

## 11. Operational intelligence

Workforce should produce structured historical data that can feed the existing reporting and KPI layer.

Target flow:

Workforce Events → Operational Data → KPIs → Insights → Automation → Future AI.

Useful data includes:

- Planned work
- Actual work
- Planned vs actual duration
- Attendance
- Absence
- Leave
- Workload
- Capacity
- Resource usage
- Revenue attribution
- Compensation rules
- Overrides/approvals
- Compliance events

## 12. Core vs Advanced vs Future-ready

### Core

The minimum complete clinic operating capability should cover:

- Employee records
- Employment basics
- Roles/permissions integration
- Working patterns
- Attendance
- Leave
- Core payroll
- Core commissions/incentives
- Agenda integration
- Capacity basics
- Resource/room integration
- Operational workforce KPIs
- Audit and control mechanisms

### Advanced

Potential higher-value capabilities include:

- Advanced workforce planning
- Complex commission rules
- Advanced performance analytics
- Capacity forecasting
- Advanced resource optimization
- Advanced compensation modeling
- Workforce cost/revenue analysis
- Predictive staffing

### Future-ready

The data architecture should support later:

- Predictive capacity
- Workforce optimization
- Automated staffing recommendations
- Workforce risk detection
- AI performance analysis
- AI operational recommendations
- Controlled AI actions

The underlying sophistication must not make the daily user interface complex.

## 13. Administrative, financial and legal controls

Patient/team balance must never become an excuse to weaken controls.

The domain should support, as applicable:

- Permission enforcement
- Approval boundaries
- Audit trails
- Effective-dated employment/compensation rules
- Payroll period locking
- Traceable commission calculations
- Historical adjustments instead of silent overwrites
- Country-specific legal/localization layers
- Separation of duties where appropriate
- Tenant isolation

The goal is to make correct operation easy while preserving required controls.

## 14. Reuse / Extend / Create map

| Capability | Repository baseline | Direction |
|---|---|---|
| Users | Existing | REUSE |
| Roles | Existing | REUSE |
| Permissions | Existing/PJ | EXTEND |
| Agenda | Existing | REUSE + EXTEND |
| Availability | Existing | REUSE + EXTEND |
| Queue | Existing | REUSE + INTEGRATE |
| Rooms | Existing | REUSE + EXTEND |
| Reporting/KPIs | Existing | REUSE + EXTEND |
| Patient Journey | Existing/PJ | REUSE + INTEGRATE |
| Treatment Plans | Existing/PJ | REUSE + INTEGRATE |
| Patient Portal | Existing/PJ | REUSE + INTEGRATE |
| Follow-up | Existing/PJ | REUSE + INTEGRATE |
| Employee | Missing | CREATE |
| Employment/Contracts | Missing | CREATE |
| Recruitment | Missing | CREATE |
| Attendance | Missing as Workforce capability | CREATE |
| Leave | Missing | CREATE |
| Payroll | Missing | CREATE |
| Benefits | Missing | CREATE |
| Commissions | Missing | CREATE |
| Incentives | Missing | CREATE |
| Workforce Performance | Missing | CREATE + ANALYTICS INTEGRATION |
| Workforce Analytics | Existing analytics foundation | EXTEND |
| Compliance controls | Shared foundation | EXTEND |
| Audit | Existing foundation | REUSE + EXTEND |

## 15. Non-goals

Clinic Operations / Workforce is not intended to become:

- A full enterprise HR suite
- A standalone workforce marketplace
- A replacement for Agenda
- A replacement for Patient Journey
- A replacement for the Financial & Resources domain
- An autonomous employee-management AI

The product should provide the smallest complete clinic-operating capability that materially improves patient-journey delivery and clinic performance.

## 16. Implementation principle

For every future implementation:

1. Inspect the existing PJ/repository capability.
2. Reuse valid existing entities and workflows.
3. Extend foundations before creating duplicates.
4. Create a new domain only when a real capability is missing.
5. Preserve PJ behavior, tenant isolation, permissions and auditability.
6. Keep Workforce and Agenda independent but integrated.
7. Keep complex calculations in the background and keep daily workflows simple.
8. Capture structured historical data from day one for reporting, automation and future AI.

## 17. Status

This is a domain reference baseline. Individual Workforce capabilities remain subject to detailed scope and implementation decisions before coding.

It should be updated when final domain decisions are approved or when implementation materially changes the architecture.
