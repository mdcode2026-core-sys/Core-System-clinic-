---

# Appendix B — Official Project Phases & Scope Definition

## 1. Purpose

This appendix defines the official project phases of CORE SYSTEM.

Its objective is to ensure that every engineer works on the correct scope at the correct time.

A task belonging to a future phase must never be implemented during an earlier phase unless explicitly approved by the project owner.

Scope discipline is mandatory.

---

# 2. Project Philosophy

CORE SYSTEM is designed to grow gradually.

Each phase builds upon the previous one.

A later phase must never become a dependency for an earlier phase.

Every phase must be stable before moving to the next.

---

# 3. Phase 0 — Vision & Architecture

### Objective

Define the product before writing production code.

### Includes

- Product vision
- SaaS philosophy
- Multi-Tenant architecture
- Engineering Constitution
- Technology stack
- Folder strategy
- Database philosophy
- Project roadmap
- ADR decisions

### Exit Criteria

Architecture approved.

Repository created.

Documentation completed.

---

# 4. Phase 0.5 — Foundation

### Objective

Build the project's technical foundation.

### Includes

- Repository structure
- Next.js App Router
- TypeScript configuration
- Supabase connection
- Authentication foundation
- Database foundation
- Initial migrations
- RLS foundation
- GitHub repository
- Vercel deployment
- Engineering documentation

### Does NOT Include

Patients

Appointments

Billing

Analytics

Inventory

AI

Business Intelligence

Financial Simulator

### Exit Criteria

The project compiles successfully.

Repository structure is stable.

Database foundation is complete.

Authentication foundation exists.

Deployment works.

---

# 5. Phase 1 — Core Platform

### Objective

Build a usable SaaS platform.

### Includes

Authentication

Registration

Tenant creation

Subscription creation

Trial activation

Dashboard

Protected routes

RBAC foundation

Session management

Subscription lifecycle

Basic navigation

Dashboard shell

Basic settings

### Does NOT Include

Patients

Appointments

Invoices

Inventory

Analytics

AI

Business Intelligence

Financial Simulator

Medical Evaluations

Queue optimization

### Exit Criteria

A clinic can register.

Owner can log in.

Dashboard opens successfully.

Tenant isolation works.

Trial subscription works.

Protected routes work.

Authentication verified.

---

# 6. Phase 2 — Clinic Operations

### Objective

Begin real clinic management.

### Includes

Patients

Appointments

Agenda

Medical records

Reception workflow

Waiting queue

Doctors

Staff

Basic notifications

Search

Basic reporting

### Exit Criteria

A clinic can perform daily operations using the platform.

---

# 7. Phase 3 — Financial Operations

### Includes

Invoices

Payments

Expenses

Income

Subscriptions

Accounting integration

Financial reports

---

# 8. Phase 4 — SaaS Billing

### Includes

Paid subscriptions

Subscription renewal

License activation

Payment providers

Grace periods

Subscription upgrades

Downgrades

Billing events

Automatic suspension

Automatic reactivation

---

# 9. Phase 5 — Analytics

### Includes

KPIs

Operational dashboards

Performance metrics

Clinic reports

Financial dashboards

Executive dashboards

---

# 10. Phase 6 — Business Intelligence

### Includes

Cross-module analytics

Benchmarking

Forecasting

Decision support

Advanced reporting

Executive insights

---

# 11. Phase 7 — Artificial Intelligence

### Includes

Medical recommendations

Business recommendations

Predictive analytics

Natural language reports

AI assistant

Automation

Smart alerts

Optimization engine

---

# 12. Phase 8 — Enterprise Expansion

### Includes

Multiple branches

Franchise management

Corporate clinics

Advanced permissions

API integrations

Marketplace

Third-party integrations

White-label support

---

# 13. Scope Protection Rule

Engineers must never implement features outside the current phase.

Future ideas may be documented.

They must not be implemented.

---

# 14. Deferred Features

Deferred features must be recorded.

Example:

Feature

Reason for postponement

Target phase

Dependencies

Expected impact

Nothing should simply be forgotten.

---

# 15. Cross-Phase Dependencies

If a task depends on a future phase,

implementation must stop.

Instead,

design a temporary architecture that allows future expansion without implementing future functionality.

---

# 16. Phase Completion Criteria

A phase is complete only when:

All mandatory objectives are finished.

Verification passed.

Documentation updated.

Known issues documented.

Owner approves closure.

Only then may the next phase begin.

---

# 17. No Phase Jumping

The following behavior is prohibited:

Implementing Analytics during Authentication.

Implementing AI during Dashboard work.

Implementing Billing during Registration.

Implementing Queue optimization before Patients exist.

Each phase has its own objectives.

---

# 18. Reality Over Percentage

Progress percentages must reflect verified work.

Examples:

Implemented but not tested ≠ Completed.

Designed ≠ Implemented.

Implemented ≠ Verified.

Verified ≠ Production Ready.

Progress reporting must always describe reality.

---

# 19. Engineering Discipline

Every implementation request must begin by confirming:

Current Phase

Current Objective

Requested Task

Whether the task belongs to the current phase

If not,

implementation must not begin until approved.

---

# 20. Final Principle

CORE SYSTEM will succeed because it advances in controlled, verified phases.

Not because it implements many features quickly.

Stable progress is always preferred over rapid expansion.

---

