# CORE SYSTEM — AJM ↔ UX/IA Unified Execution Plan
## Next Execution Path — 2026-08-29

**Baseline:** current `main` plus the reconciliation fixes in `ajm-ux-reconciliation-2026-08-29`

## 1. Execution rule

AJM and UX/IA are now one dependency chain for execution closure:

`AJM capability → UX surface → authorization/entitlement → runtime → evidence → closure`

No AJM stage advances on documentation alone, and no UX surface is accepted merely because a route/component exists.

## 2. Phase A — Reconciliation closure

Before resuming new AJM feature work:

1. Verify the reconciliation branch against current `main`.
2. Confirm the obsolete fixed Workspace surface navigator is absent from active source.
3. Run the full relevant GitHub validation gates.
4. Merge only the verified reconciliation change.
5. Establish a single current AJM/UX status snapshot on `main`.
6. Reconcile the AJM-1 contradictory closure records into one explicit status.

## 3. Phase B — AJM-1 closure

Do not rebuild AJM-1.

Run authenticated acceptance against the current implementation for:

- Clinic Admin access to Team & Access;
- custom role creation;
- permission assignment;
- direct permission override;
- explicit revoke;
- unauthorized route/action denial;
- tenant isolation;
- Sidebar visibility derived from effective permissions;
- Workspace surface visibility derived from effective permissions;
- Arabic/English parity;
- mobile behavior.

Close AJM-1 only after the evidence and status documents agree.

## 4. Phase C — AJM-2 closure

Resume AJM-2 from the existing implementation, not from zero.

Verify the canonical Financial & Resources product surface:

- Overview;
- Invoices;
- Payments;
- Financial Plans;
- Installments;
- Insurance;
- Claims;
- Inventory;
- Consumption;
- Purchasing;
- Suppliers;
- Receiving.

Verify:

- correct permissions/entitlements;
- tenant isolation;
- create/edit/payment/issue/cancel behavior where applicable;
- financial plan/installment persistence;
- inventory and purchasing relationships;
- auditability;
- patient context links;
- Portal relationship where applicable;
- Analytics consumption;
- Arabic/English and mobile behavior;
- no duplicate root navigation competing with the canonical hierarchy.

Then execute the authenticated E2E closure gate.

## 5. Phase D — AJM-3

Only after AJM-2 closure:

1. Re-read AJM-3 blueprint and current UX authority.
2. Map Workforce requirements to actual repository surfaces.
3. Identify canonical reuse before creating anything.
4. Define Staff, Availability, Leave, Attendance, Payroll and Capacity ownership.
5. Define UX surfaces before implementation.
6. Implement server authorization and tenant isolation together with the Domain.
7. Validate desktop/mobile and Arabic/English.
8. Close documentation before advancing.

Workforce must remain independent from Agenda and Journey Coordination.

## 6. AJM-4 through AJM-8

Proceed sequentially only after the preceding stage satisfies its Definition of Done.

### AJM-4 Communications

Create/reconcile communications surfaces without creating a second workflow engine. Requests/tasks belong to Coordination when action is required.

### AJM-5 Journey Coordination

Create the general Work layer for Tasks, Requests, Handoffs, Next Actions and Escalation while preserving PJ, Agenda, Workforce and Communications ownership.

### AJM-6 Insights

Consume canonical Domain data. Do not create a competing source of financial, workforce or journey truth.

### AJM-7 Integration

Validate the complete cross-domain workflow, including patient context, financial commitments, appointments, resources, operational work, follow-up, communication, portal and insights.

### AJM-8 Final Closure

Perform the final security, privacy, tenant isolation, auditability, data integrity, runtime and documentation gate.

## 7. Mandatory per-stage reconciliation matrix

For each AJM stage maintain:

| Check | Required evidence |
|---|---|
| Domain owner | AJM blueprint + repository owner |
| UX surface | canonical route/navigation/workspace surface |
| Permission | permission key + server enforcement |
| Entitlement | feature/module capability if applicable |
| Data owner | canonical tables/functions/RLS |
| Reuse | existing implementation identified |
| Duplicate check | no competing implementation |
| Runtime | authenticated workflow evidence |
| i18n | Arabic/English parity |
| Mobile | responsive verification |
| Documentation | stage record + handoff updated |
| Closure | explicit final status and SHA |

## 8. Branch policy

Historical UX/AJM branches are not automatically mergeable because several are materially behind `main`.

For every candidate branch:

`compare → inspect changed files → identify unique intent → port only required delta → validate on current main`

Never merge an old branch wholesale merely because its stage name matches the current task.

## 9. Vercel policy

GitHub is the first engineering gate. Vercel Production is the runtime gate when deployed behavior changes.

Preview-only configuration debt must not be converted into a false production blocker, and no environment secret may be invented.

Production readiness requires the final tested candidate SHA to be the deployed SHA when the applicable stage Definition of Done requires runtime deployment.

## 10. Immediate next sequence

```text
Reconciliation branch validation
        ↓
Merge verified reconciliation
        ↓
AJM-1 acceptance/status closure
        ↓
AJM-2 authenticated E2E closure
        ↓
AJM-2 CLOSED
        ↓
AJM-3 Workforce
        ↓
AJM-4 Communications
        ↓
AJM-5 Journey Coordination
        ↓
AJM-6 Insights
        ↓
AJM-7 Cross-domain Integration
        ↓
AJM-8 Final Closure
```

No stage is skipped because a later UX implementation exists. Later UX work is evidence/input and must be reconciled to the current AJM state before use.

## 11. Completion criterion for this plan

The plan is successful when a future agent can determine the next AJM action directly from repository evidence without relying on conversation history, and when every AJM capability has one clear user-facing surface, one authorization source, one canonical implementation and one closure record.
