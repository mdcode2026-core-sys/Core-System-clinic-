# CORE SYSTEM — Workforce & Operations Engineering Blueprint

**Status:** Final pre-implementation engineering reference — reconciled with PJ, Workforce & Operations and Team & Access  
**Domain:** Workforce & Operations  
**Scope:** Tenant / Clinic operational environment  
**Authority:** This document governs the Workforce & Operations domain unless a later explicit architectural decision supersedes it.  
**Current Global Surfaces interpretation:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

> **2026-09-11 reconciliation:** Workforce must distinguish employment/job/skills from Team & Access authorization and from the user's primary Role Workspace. Workforce data may influence availability, routing or operational capability, but it does not redefine the user's Primary Role, Primary Work Context or Role Workspace. Additional platform permissions may expand Sidebar, Widgets and My Workspace without changing the primary work environment.

## 1. Product position

The complete Patient Journey remains the primary objective. Workforce & Operations provides the people, availability, capacity, resources and operational intelligence needed to deliver that journey sustainably.

It is not a full HR suite, not a replacement for Agenda, and not a second Patient Journey.

The target outcome is:

**Patient Journey Outcome + Team Sustainability + Clinic Business Performance**

subject to:

**Clinical + Administrative + Financial + Legal/Compliance controls.**

The goal is a reliable and satisfactory patient journey that can retain patients over time without treating the clinic team as disposable capacity.

Super Admin is outside the tenant operating environment.

## 2. Domain structure

```text
Workforce & Operations
├── Staff
├── Employment
├── Recruitment
├── Attendance
├── Leave / Absence
├── Payroll
├── Benefits
├── Commissions / Incentives
├── Availability
├── Staff Scheduling
├── Capacity
├── Productivity
├── Operational Performance
└── Resource Coordination
```

These are one consolidated operating domain with clear internal boundaries; they must not duplicate Agenda, Team & Access, Financial & Resources or Clinical/PJ domains.

## 3. Critical boundary: Workforce vs Agenda

Workforce and Agenda are separate domains.

### Workforce owns

- Employee identity and employment context.
- Position/job information.
- Employment status.
- Working patterns.
- Staff availability inputs.
- Staff scheduling/working schedules.
- Capacity.
- Attendance/time.
- Leave/absence.
- Compensation context.
- Payroll.
- Benefits.
- Commissions/incentives.
- Workforce productivity/performance.
- Workforce skills when the Advanced capability is activated.

### Agenda owns

- Appointment scheduling.
- Appointment lifecycle.
- Booking timing.
- Provider/resource conflicts.
- Operational agenda behavior.
- Appointment availability calculation.

Therefore:

> **Staff Scheduling is not Appointment Scheduling.**

Workforce answers **who can work, when they are employed/available and what capacity exists**. Agenda answers **when patient-facing scheduled work occurs**.

Workforce must not create a second calendar or appointment scheduling engine.

## 4. Existing repository foundations — reuse

### Users

Existing User structures remain the system-account/access identity.

**User ≠ Employee.**

### Roles & Permissions

Existing Team & Access / Permission Engine architecture remains the authorization foundation.

**REUSE + EXTEND.**

Job/Position, Employee and System Role remain distinct concepts.

### Agenda

Existing Agenda remains canonical.

**REUSE + EXTEND.**

### Availability

Existing availability logic around working hours, blocked periods and agenda conflicts remains canonical for booking.

**REUSE + EXTEND.**

### Queue

Existing Queue remains canonical for current patient movement.

**REUSE + INTEGRATE.**

### Rooms / Resources

Existing Room/Resource domain remains canonical.

**REUSE + EXTEND.**

### Reporting / KPIs

Existing analytics/reporting infrastructure remains canonical.

**REUSE + EXTEND.**

No second workforce analytics engine.

## 5. Staff and Employment

### Core

Create an Employee entity distinct from User.

Support:

- Employment status.
- Position/job.
- Employment type.
- Start/end dates.
- Working pattern.
- Compensation context.
- Manager/supervisor context where useful.
- Historical/effective-dated employment changes.

Employment/Contracts are part of the Workforce domain, not Team & Access.

## 6. Recruitment — Core clinic-sized capability

Recruitment is important but must remain clinic-sized rather than becoming a recruitment marketplace.

```text
Staffing Need
 → Position
 → Candidate
 → Evaluation
 → Offer
 → Employment
```

Recruitment should eventually connect staffing gaps with capacity and budgeting.

## 7. Attendance / Time — Core

Attendance is operational data, not only HR data.

It should support:

- Working-time evidence.
- Overtime.
- Absence.
- Payroll inputs.
- Capacity.
- Agenda availability.
- Productivity analysis.
- Auditability.

## 8. Leave / Absence — Core

Minimum capability:

- Leave types.
- Entitlement/balance.
- Accrual where applicable.
- Approval.
- Public holidays.
- Partial leave where required.
- Impact on availability.
- Impact on payroll.

Leave may be initiated through an approved global/lightweight entry point, such as Home Calendar or another authorized surface, but the authoritative leave workflow remains within Workforce & Operations. A leave request does not imply administrative approval merely because the request was created.

## 9. Payroll — Core clinic-sized capability

CORE should provide useful clinic-sized payroll, not an enterprise payroll suite.

Core concepts:

- Salary.
- Salary components.
- Allowances.
- Deductions.
- Overtime.
- Bonuses.
- Commissions.
- Leave/absence effects.
- Payroll periods.
- Payslips.
- Employer cost.
- Auditability.
- Period locking.

Country-specific legal rules should be localized rather than hard-coded into a universal model.

## 10. Benefits — Core

Benefits should provide the clinic's employment-package and employment-cost picture without becoming enterprise benefits administration.

## 11. Commissions / Incentives — Core

This is particularly important for clinics where doctors, reception/coordinators or other staff receive percentages, commissions or bonuses related to patient activity or collected revenue.

Canonical relationship:

```text
Patient
 → Appointment / Visit / Procedure
 → Invoice
 → Collected Revenue
 → Attribution
 → Commission Rule
 → Eligible Commission
 → Payroll / Performance
```

Commission rules must preserve the basis of calculation. Invoice value must not be treated as collected revenue when the clinic rule is collection-based.

## 12. Productivity and Performance — Core + Analytics integration

Performance must not be reduced to patient count or revenue alone.

Useful dimensions include:

- Workload.
- Productivity.
- Reliability.
- Attendance.
- Operational contribution.
- Financial contribution.
- Patient-flow contribution.
- Quality indicators.
- Compliance.

The system should distinguish:

**Activity ≠ Contribution ≠ Financial Attribution ≠ Outcome.**

Workforce performance feeds the existing Insights/Analytics domain; it must not create a duplicate reporting system.

## 13. Staff Scheduling

Staff Scheduling is a Workforce capability and is distinct from Agenda scheduling.

It describes workforce working patterns and planned staff coverage.

Examples:

```text
Doctor → Monday 09:00–17:00
Reception → Monday 08:00–16:00
Technician → Tuesday 10:00–18:00
```

Agenda then uses relevant availability/capacity information when determining patient-facing appointment opportunities.

No second appointment scheduler is permitted.

## 14. Availability and Capacity

Workforce provides inputs to operational availability.

Conceptually:

```text
Employee
 + Working Pattern
 + Attendance / Leave
 + Skill when enabled
 + Capacity
 + Required Resource
        ↓
Operational Availability
        ↓
Agenda
```

A person being available does not guarantee that a room/device/resource is available.

A resource being available does not guarantee that qualified staff are available.

Capacity is therefore a combined operational concept, while ownership remains separated by domain.

## 15. Advanced Skill / Capability

`Skill` is a **human/workforce competence**. `Capability` is a **platform/product/business ability**.

They are not interchangeable.

```text
Role       = organizational function
Permission = system authorization
Skill      = human competence
Qualification = formal credential/evidence
Capability = platform/business ability
```

Example:

```text
Role: Procedure Specialist

Permissions:
  agenda.update
  patients.read
  followup.manage

Skills:
  Laser
  RF
  Device X
  Skin Procedure A
```

Advanced Skills may later support:

- Staff scheduling.
- Capacity optimization.
- Task assignment.
- Resource matching.
- Workforce intelligence.
- Patient Journey coordination.
- AI recommendations.

The basic system must not require Skills to function.

## 16. Workforce ↔ Patient Journey

Workforce is not part of PJ ownership, but its events explain operational conditions around the journey.

```text
Appointment
 → Agenda
 → Arrival / Queue
 → Workforce / Resource
 → Clinical Work
 → Treatment
 → Payment
 → Follow-up
```

Workforce data should help answer:

- Was the clinic adequately staffed?
- Was required capacity available?
- Did absence affect the journey?
- Did workload affect waiting time or flow?
- Was the work performed as expected?
- Which operational factors affected patient continuity?

The patient remains the primary objective without sacrificing team sustainability or controls.

## 17. Workforce ↔ Financial & Resources

The domains remain separate but form an operational loop:

```text
Workforce
 → Work Performed
 → Attribution
 → Revenue / Cost
 → Compensation
 → Payroll
 → Performance
```

Financial contribution must not automatically be interpreted as employee profitability.

Financial rules remain owned by Financial & Resources; employment/compensation execution remains owned by Workforce.

## 18. Workforce ↔ Resources

Workforce capacity must be considered with physical resources.

Examples:

- Doctor + treatment room.
- Technician + device.
- Nurse/assistant + procedure capacity.
- Staff availability + room availability.
- Skill + resource capability.

Workforce does not replace the canonical Room/Resource domain.

## 19. Operational intelligence and future AI

Capture structured historical data from day one:

- Who performed work.
- Required work.
- Actual work.
- Planned vs actual duration.
- Attendance/absence.
- Leave.
- Workload.
- Capacity.
- Resource used.
- Patient-journey context.
- Financial attribution.
- Compensation rule.
- Approval/override history.
- Compliance events.
- Operational outcomes.

Target:

```text
Workforce / Operations Events
 → Existing Data Layer
 → KPIs / Insights
 → Automation
 → Future AI
```

Complex calculations may remain in the background while the daily UI stays simple.

## 20. Core / Advanced / Future-ready

### Core

- Employee records.
- Employment basics.
- Roles/permissions integration.
- Working patterns.
- Staff scheduling.
- Attendance.
- Leave.
- Core payroll.
- Benefits basics.
- Core commissions/incentives.
- Agenda integration.
- Capacity basics.
- Resource/room integration.
- Productivity/performance basics.
- Audit/control mechanisms.

### Advanced

- Skill / workforce competence.
- Advanced workforce planning.
- Complex commission plans.
- Advanced performance analytics.
- Capacity forecasting.
- Advanced resource optimization.
- Advanced compensation modeling.
- Workforce cost/revenue analysis.
- Predictive staffing.

### Future-ready

- Predictive capacity.
- Workforce optimization.
- Automated staffing recommendations.
- Workforce risk detection.
- AI performance analysis.
- AI operational recommendations.
- Controlled AI actions.

Advanced/future classification does not prevent collection of the underlying data when the architecture requires it.

## 21. Controls

Patient/team balance must never weaken:

- Permission enforcement.
- Approval boundaries.
- Audit trails.
- Effective-dated employment/compensation rules.
- Payroll period locking.
- Traceable commission calculations.
- Historical adjustments.
- Country-specific legal controls.
- Separation of duties where appropriate.
- Tenant isolation.

## 22. Global surface relationship

Workforce owns employment, attendance, leave, capacity and workforce reality. It does not own Home/Header/Sidebar/Role Workspace semantics.

A lightweight Leave action may be initiated from a global surface, but the authoritative request, approval, balance and availability effects remain Workforce-owned.

Workforce availability or Skill data may influence Domain workflows and future routing, but must not automatically reclassify a user's Primary Role or Role Workspace.

## 23. Final reconciliation decisions

1. **Workforce and Agenda remain separate domains.**
2. **Staff Scheduling is distinct from Appointment Scheduling.**
3. **Employee is distinct from User.**
4. **Employee/Job/Position is distinct from System Role.**
5. **Team & Access owns authorization; Workforce owns employment/operational workforce reality.**
6. **Primary Role / Primary Work Context determines the user's primary Role Workspace; additional permissions do not redefine it.**
7. **Skills and platform capabilities are different concepts.**
8. **Agenda remains the canonical appointment scheduler.**
9. **Availability is integrated: Workforce supplies staff constraints/capacity; Agenda owns booking availability.**
10. **Rooms/Resources remain canonical and are not recreated inside Workforce.**
11. **Workforce Performance feeds the shared Insights/Analytics domain rather than creating a second analytics system.**
12. **Payroll, Recruitment, Benefits, Leave and Commissions are important Core clinic capabilities but remain clinic-sized.**
13. **Patient outcome is prioritized, but financial, administrative, legal and team-sustainability controls are not weakened.**
14. **No enterprise HR suite is being built.**

## 24. Implementation rule

```text
Approved Workforce Decision
 → Inspect Repository
 → Inspect PJ Contract
 → Inspect Agenda / Resources / Financial / Team & Access boundaries
 → Reuse
 → Extend
 → Integrate
 → Validate
 → Document
```

No duplicate scheduling, permission, analytics, resource or Patient Journey systems may be introduced.

**End of Workforce & Operations Engineering Blueprint.**
