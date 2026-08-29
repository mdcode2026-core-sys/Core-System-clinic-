# AJM-3 — Workforce & Operations Execution Log — 2026-08-29

## Status

`IMPLEMENTED ON BRANCH / ACCEPTANCE PENDING`

This document records the current acceptance-reset execution state. It is not a historical CLOSED claim.

## Pre-Stage Audit

### AJM contract
The AJM full execution prompt is authoritative. AJM-3 is treated as unexecuted for this acceptance cycle.

### UX / IA
A canonical `/workforce` surface was added to the single navigation registry. The surface is explicitly a core sidebar capability and uses the same tenant permission engine as the rest of the application. No duplicate Workspace/Agenda navigation model was introduced.

### PJ
Workforce is an enabling operational domain. It does not replace Patient, Visit, Agenda, Queue, Treatment Plan or Follow-up. Staffing schedules provide capacity inputs; appointment scheduling remains owned by Agenda.

### Current code / database
Existing Team & Access remains the system-user/role authority. Workforce employees are separate employment records and may optionally reference an existing clinic user. Existing financial and agenda domains are reused rather than duplicated.

## Implementation

### Database
Created tenant-scoped workforce structures for:
- positions;
- employees;
- employment records;
- staff schedules/capacity inputs;
- attendance;
- leave types and requests;
- payroll periods and entries;
- benefits;
- commission rules and entries;
- staffing needs and candidates.

All tables use tenant-scoped RLS. Core leave types are seeded for existing tenants.

### Authorization
Added explicit workforce permissions:
- workforce:read
- workforce:manage
- workforce:attendance
- workforce:leave
- workforce:payroll
- workforce:commission
- workforce:recruitment

Server actions re-check authorization and tenant context before mutation.

### UI
Added bilingual `/workforce` surface with operational views/forms for:
- employees;
- positions;
- attendance;
- leave;
- payroll periods;
- commissions/incentives.

### Integration boundary
No second appointment/calendar engine was introduced. Staff schedules are capacity inputs only.

## Validation in progress

GitHub PR #55 has triggered the repository's existing Stage 5–15 validation workflows, including TypeScript, I18N, production-build and runtime-gate checks.

Production deployment is intentionally not used as debugging. Current Vercel build-rate limiting prevents a new production candidate from being deployed; tracked as Issue #54.

Authenticated runtime acceptance is also blocked by the absence of an approved production test identity/session; tracked as Issue #53.

## Closure rule

AJM-3 must not be marked CLOSED until:
1. PR validation passes;
2. the migration is applied to the live Supabase database and reconciled;
3. authenticated runtime scenarios pass;
4. tenant isolation and permissions are verified;
5. production deployment uses the accepted commit;
6. production runtime is verified;
7. documentation and stage index are updated with evidence.
