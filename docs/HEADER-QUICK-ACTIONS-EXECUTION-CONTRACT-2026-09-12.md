# CORE SYSTEM — Header Quick Actions Execution Contract

**Date:** 2026-09-12  
**Status:** BINDING WORKSTREAM CONTRACT  
**Workstream:** Header / Quick Actions  
**Parent authority:** `docs/MASTER-EXECUTION-REPAIR-CONTRACT-GLOBAL-SURFACES-2026-09-11.md`  
**Supporting report:** `docs/HEADER-QUICK-ACTIONS-INTEGRATION-REPORT-2026-09-12.md`  
**SETUP descriptor:** `docs/testing/workstream-contracts/header-quick-actions.execution.json`

## 1. Purpose

This contract defines the exact implementation and verification boundary for **Quick Actions** in the authenticated Global Header.

It is a workstream contract. It does **not** modify, replace, or redefine the CORE SYSTEM Unified Test Execution Engine.

The Unified Test Execution Engine remains the single execution authority and must execute the verification scope applicable to this contract without requiring changes to the engine itself.

The machine-readable SETUP descriptor is the delivery adapter for this contract: SETUP resolves it when the changed-file applicability rules match, records the workstream contract in `test-execution-plan.json`, and preserves the existing PR-level impact classification for all other changed workstreams.

## 2. Product boundary

Quick Actions are a **Global Header utility surface**.

Initial approved actions:

- Language
- Logout

Quick Actions must not become a business-action launcher.

The following are explicitly outside this workstream:

- Clinical actions
- Operational actions
- Administration actions
- Patient Flow actions
- Communications actions
- Chat actions
- Notifications actions
- Financial actions
- Inventory / Purchasing actions
- Workforce actions
- Follow-up actions
- Patient actions
- Appointment actions
- Any domain-specific create/edit/delete/management action

Mobile navigation remains Header shell/navigation behavior and is not a Quick Action.

## 3. Existing-system reuse

Quick Actions must reuse existing authoritative infrastructure.

### Language

Use the existing canonical `LanguageSwitcher` / i18n provider path.

No Header-specific locale state, translation catalog, persistence mechanism, or parallel language subsystem may be introduced.

### Logout

Use the existing authenticated Supabase sign-out path and existing `/login` redirect behavior.

No new authentication engine, session store, authorization model, logout permission, or account-management subsystem may be introduced.

## 4. Authorization boundary

Quick Actions do not grant permissions and do not expose domain capabilities.

Language is a personal presentation preference.

Logout is an authenticated account/session utility.

No Clinic Admin permission is required merely to view or use these global utilities.

No Quick Action may be used to bypass domain authorization.

## 5. Implementation invariants

The implementation must satisfy all of the following:

1. Quick Actions is mounted within the existing Global Header boundary.
2. Language uses the existing canonical i18n implementation.
3. Logout uses the existing authenticated sign-out implementation.
4. No new business-action registry is introduced.
5. No new permission model is introduced.
6. No new authentication/session subsystem is introduced.
7. No duplicate Language/Logout utility is retained elsewhere in the same user-facing shell when the Header becomes the canonical location.
8. The menu remains bounded and utility-only.
9. The control remains accessible by keyboard and exposes correct accessible state/name.
10. RTL/LTR behavior follows the existing application direction model.
11. Responsive behavior remains usable on desktop, tablet, and mobile.
12. Existing Header/global navigation behavior remains intact.

## 6. Verification applicability

The verification scope must follow the **actual Quick Actions impact**, not the existence of unrelated test suites in the Unified engine.

### Required

- Repository engineering baseline:
  - typecheck
  - lint
  - build
- Targeted Global Header / Quick Actions structural contract checks.

### Required when touched by the implementation

- i18n audit/parity when the canonical LanguageSwitcher/i18n path is changed or affected.
- Header accessibility/responsive/RTL/LTR checks when those behaviors are changed or part of the current Header validation gate.

### Not required solely because Quick Actions exists

The following are not Quick Actions test dependencies unless an actual implementation change crosses their authority boundary:

- Communications data/read-state tests
- Notifications data/feed/read-state tests
- Chat tests
- Patient Journey tests
- Financial tests
- Inventory/Purchasing tests
- Workforce tests
- Retention/follow-up tests
- Database integrity tests
- RLS tests
- Broad authorization/RBAC regression suites
- Patient/appointment operational E2E suites

### Important distinction

The word `Logout` in this contract does **not** mean that the authentication/authorization architecture was changed.

Reusing an existing sign-out action is an integration dependency, not an authorization-model change.

Likewise, mounting the control through an existing workspace/shell component does **not** by itself mean that Role Workspace, Primary Work Context, workspace authority, or workspace RLS were changed.

A suite becomes applicable only when the implementation actually changes or crosses that suite's authority boundary.

## 7. Failure interpretation

A test failure must first be classified against this contract before it is treated as a Quick Actions defect.

Examples:

- Targeted Quick Actions/Header contract failure → directly relevant and blocking.
- i18n parity failure after changing the canonical language path → relevant and blocking.
- Build/typecheck failure → relevant and blocking because the engineering baseline is mandatory.
- Patient Journey failure with no Patient Journey dependency → not evidence that Quick Actions is defective.
- Database-integrity failure with no database/data change → not evidence that Quick Actions is defective.
- Authorization failure caused by a real change to auth/RBAC → relevant; otherwise not a Quick Actions authorization change merely because Logout is present.

## 8. Prohibited scope expansion

Do not expand Quick Actions in response to unrelated test failures by:

- adding business actions to the menu;
- creating new permission checks;
- creating new auth/session infrastructure;
- creating a second i18n system;
- creating a new notification or communications store;
- modifying unrelated domains merely to make their tests pass;
- changing the Unified Test Execution Engine to force this workstream into unrelated suites.

## 9. Acceptance criteria

Quick Actions is accepted as a workstream when:

1. The approved utility scope is preserved.
2. Existing Language and Logout authority is reused.
3. No parallel subsystem is introduced.
4. Targeted Header/Quick Actions checks pass.
5. Required engineering checks pass.
6. Applicable i18n/accessibility/responsive/RTL/LTR checks pass where affected.
7. No unrelated domain behavior is modified to satisfy this workstream.
8. The final evidence identifies the exact candidate and the tests actually applicable to this workstream.

## 10. Closure rule

**Quick Actions workstream closure is not equivalent to PR #100 closure.**

This contract closes only the Quick Actions workstream. Global Header, Communications, Notifications, Chat, final visual/UX work, and PR-level integration remain governed by their respective contracts and the master Global Surfaces execution contract.
