# CORE SYSTEM — Team & Access — Canonical 28-Scenario Evidence Matrix

**Date:** 2026-09-02  
**Scope:** Production Team & Access lifecycle  
**Status:** **VALIDATION BASELINE — RUNTIME CLOSURE NOT YET CLAIMED**

## Evidence policy

- **PASS** = directly observed on Production or proven by a deterministic Production DB invariant.
- **CODE PASS / RUNTIME PENDING** = implementation is present, but the complete Production scenario was not executable/observable in this run.
- **BLOCKED** = a required Production interaction needs authenticated/email access that was not available to this execution context.
- A successful Build/Deploy is never treated as Runtime evidence by itself.

## Matrix

| # | Canonical scenario | Current evidence | Status |
|---:|---|---|---|
| 1 | Clinic Admin creates a new employee | Create action now forces `account_status=pending`, `is_active=false`, generates CORE UUID, creates Auth invite, links `auth_user_id`, workspace and access with compensation paths. | CODE PASS / RUNTIME PENDING |
| 2 | New employee receives invitation | `inviteUserByEmail` is wired to production `/activate`; actual email receipt not observable here. | CODE PASS / RUNTIME PENDING |
| 3 | Employee follows invitation to production `/activate` | Production `/activate` returns HTTP 200 and renders the activation experience. | PASS — route evidence |
| 4 | Employee sets initial password | `/activate` calls Supabase Auth `updateUser({password})`; complete employee interaction not executed. | CODE PASS / RUNTIME PENDING |
| 5 | Employee becomes Active | Activation action explicitly transitions `pending → active` and synchronizes `is_active=true`; DB contains no active-without-auth mismatch. | CODE/DB PASS / RUNTIME PENDING |
| 6 | Employee logs in through same `/login` | Production `/login` is reachable and is the canonical login; authenticated employee login was not executed. | CODE PASS / RUNTIME PENDING |
| 7 | Correct tenant/workspace/role/effective access | Identity/workspace/access code and DB relationships are present; full employee runtime context not executed. | CODE/DB PASS / RUNTIME PENDING |
| 8 | Profile edit without reactivation | User update path changes profile fields without activation/password operations. | CODE PASS / RUNTIME PENDING |
| 9 | Role/workspace/access edit without password handling | Unified User Form submits role/workspace/direct permissions/overrides without password fields; protected Clinic Admin excluded. | CODE PASS / RUNTIME PENDING |
| 10 | Pending user can Resend Invitation | Canonical lifecycle manager exposes Resend Invitation for `pending`; latest production deployment now contains the lifecycle manager. Actual resend/email receipt was not executed. | CODE + DEPLOY PASS / RUNTIME PENDING |
| 11 | Active user can Deactivate | Action synchronizes Auth ban + `account_status=inactive` + `is_active=false`; destructive runtime interaction not executed. | CODE PASS / RUNTIME PENDING |
| 12 | Deactivated user cannot authenticate | Auth ban is implemented; actual sign-in denial not executed. | CODE PASS / RUNTIME PENDING |
| 13 | Inactive user can Reactivate without new invitation/password | Reactivate unbans Auth and sets active state; runtime interaction not executed. | CODE PASS / RUNTIME PENDING |
| 14 | Reactivated user retains existing password | Reactivate does not call password reset or invitation; runtime proof not executed. | CODE PASS / RUNTIME PENDING |
| 15 | Forgot Password sends secure recovery email | Production `/login` visibly links to `/forgot-password`; production `/forgot-password` returns HTTP 200. Actual email delivery not observable. | PASS — route / CODE; email pending |
| 16 | Employee can set new password through recovery | Latest production deployment is READY and `/reset-password` now returns HTTP 200 with the recovery password UI. Actual recovery-token/email interaction was not executed. | PASS — route; token runtime pending |
| 17 | Staff email change requires new-email verification | Admin request stores `pending_email`; employee-side Auth `updateUser({email})` sends verification. Actual confirmation not executed. | CODE PASS / RUNTIME PENDING |
| 18 | Old staff email retires only after successful verification | Auth-trigger sync updates CORE `email` only when Auth email changes to the matching pending address. Runtime confirmation not executed. | CODE/DB PASS / RUNTIME PENDING |
| 19 | Staff email change preserves IDs | Email-change path never creates tenant/user/Auth identity; DB model uses existing `auth_user_id`. Runtime proof not executed. | CODE/DB PASS / RUNTIME PENDING |
| 20 | Clinic Admin changes email from account settings | `UserSettingsManager` exposes Clinic Admin email-change path outside Users. Runtime interaction not executed. | CODE PASS / RUNTIME PENDING |
| 21 | Clinic Admin email change preserves IDs | Same verified Auth identity path; no replacement IDs in implementation. Runtime proof not executed. | CODE PASS / RUNTIME PENDING |
| 22 | Clinic Admin cannot be reduced/deactivated/deleted/authority-reduced | Server-side target protection rejects Clinic Admin changes. Production DB has one active Clinic Admin in the operational test tenant; audit-test tenant contains two stale pending Clinic Admin records and is excluded from operational acceptance. | CODE/DB PASS; cleanup review required |
| 23 | Login Show/Hide password works | Production `/login` HTML visibly contains the Show password control. | PASS — Production UI evidence |
| 24 | Activation/Recovery Show/Hide password works | Production `/activate` visibly contains both password fields and Show/Hide controls; Production `/reset-password` now returns HTTP 200 and renders the recovery route. | PASS — Production route/UI evidence |
| 25 | Production links never use localhost | Invitation/activation/recovery code derives redirects from configured production URL and no hardcoded localhost is present in the repaired paths. Actual received email links not observed. | CODE PASS / RUNTIME PENDING |
| 26 | Duplicate tenant-active email rejected | Production query found `0` duplicate active-email groups; create/edit code checks tenant email uniqueness. | PASS — DB + CODE |
| 27 | Employee-code collision safely resolved | Production query found `0` duplicate employee-code groups; create retries unique-code collision up to five attempts. | PASS — DB + CODE |
| 28 | Failed Create/Edit leaves no inconsistent required state | Compensation paths exist; Production invariant query returned `0` CORE→missing-Auth, `0` pending-with-Auth, `0` active-without-Auth. Injected failure scenario was not executed. | DB PASS / RUNTIME FAILURE-INJECTION PENDING |

## Production database evidence captured 2026-09-02

### Lifecycle distribution

- Active + `is_active=true`: 2
- Inactive + `is_active=false`: 2
- Pending + `is_active=false`: 6

### Identity consistency

- CORE users pointing to missing Auth identities: **0**
- Pending users with Auth identities: **0**
- Active users without Auth identities: **0**
- Active/`is_active` mismatch: **0**
- Non-active/`is_active=true` mismatch: **0**

### Email uniqueness

- Duplicate tenant-scoped active email groups: **0**

### Employee code

- Duplicate employee-code groups: **0**

### Clinic Admin note

The operational test tenant has one active Clinic Admin. A historical audit-test tenant named `Dr. Khaled Al-Dajah Clinic (AUDIT TEST TENANT)` contains two pending Clinic Admin records and no active Clinic Admin. Those records are test artifacts, not the operational Clinic Admin, and must be handled as a separate cleanup/data-governance item rather than silently deleted as part of lifecycle validation.

## Production deployment evidence

Latest tested `main` deployment:

- Commit: `1f1f9aad73289c5a1b5ee525f0d88ecddca78d9f`
- Vercel state: **READY**
- Production alias: `core-system-clinic.vercel.app`
- Build completed successfully.
- `/activate`: HTTP 200
- `/forgot-password`: HTTP 200
- `/reset-password`: HTTP 200
- `/login`: HTTP 200
- Vercel runtime error clusters for the recent validation window: none reported.

## Closure decision

**NOT CLOSED.**

The implementation and documentation are aligned and the latest deployment is READY, but full closure requires authenticated end-to-end execution of the lifecycle scenarios that depend on a controlled employee account and real email verification.

Remaining evidence work:

1. Execute controlled Production Create → Invitation → Activation → Login.
2. Observe the actual invitation email/link and verify it resolves to Production `/activate`.
3. Execute Resend Invitation and verify a fresh usable link.
4. Execute Deactivate → blocked login → Reactivate → existing-password login.
5. Execute Forgot Password → recovery email → `/reset-password` → new password → login.
6. Execute staff email-change verification and confirm Tenant/User/Auth IDs are unchanged.
7. Execute Clinic Admin email-change verification from account settings and confirm IDs are unchanged.
8. Execute failure-injection/compensation tests.
9. Update each remaining row to `PASS` only when direct evidence exists.
