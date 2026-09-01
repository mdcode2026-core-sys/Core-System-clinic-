# CORE SYSTEM — Team & Access — Implementation Reconciliation

**Date:** 2026-09-02  
**Purpose:** Close only the genuine documentation gaps between the final architecture and the implemented lifecycle.

## 1. Canonical lifecycle storage

The architectural states remain:

```text
Pending → Active → Inactive
Inactive → Active
```

Production implementation stores the canonical state in:

`clinic_users.account_status = pending | active | inactive`

`clinic_users.is_active` remains synchronized for compatibility/authorization:

- Pending → false
- Active → true
- Inactive → false

The existence of `clinic_users.auth_user_id` does not mean Active. An invited user can have an Auth identity while remaining Pending; Production currently has zero pending users with Auth identities after the baseline migration.

## 2. Email-change staging

`clinic_users.pending_email` is the staging field for a requested but unverified email.

The existing canonical `email` remains unchanged until Supabase Auth verification succeeds.

The Auth identity is retained. A trigger synchronizes the verified Auth email into CORE only when it matches the stored pending email.

For staff, User Management initiates the request and the employee completes verification while authenticated. For Clinic Admin, the request is initiated from account settings.

## 3. Resend Invitation

The canonical UI action is `Resend Invitation` and is exposed only for Pending users.

The current implementation uses Supabase Auth's resend mechanism against the existing unconfirmed invited identity rather than creating another user. This preserves the Identity Model and prevents duplicate Auth/CORE records.

Final runtime acceptance still requires observing the actual fresh email/link and completing `/activate`.

## 4. Recovery

The recovery flow is explicitly separate from Activation and Reactivation:

`/login → /forgot-password → Auth recovery → /reset-password → /login`

The latest Production deployment exposes both recovery routes successfully.

## 5. Acceptance-count governance

The architecture document's **28 scenarios are the sole canonical acceptance set**.

The Engineering Contract's 18 rows are grouped engineering verification categories mapped to the 28 scenarios.

The former 36-row closure list was decomposed from the same scenarios and is no longer an independent acceptance set.

## 6. Runtime closure rule

The latest deployment is READY and the public authentication routes are reachable, but this reconciliation does not convert code/route/DB evidence into runtime scenario evidence.

Authenticated employee flows, actual email delivery/verification, lifecycle transitions, ID-preservation during email change, and failure-injection must still be directly exercised before declaring final Runtime Closure.
