# CORE SYSTEM — Experience Foundation F1–F4 / Patient-Creation Verification — Complete Execution Handoff

**Date:** 2026-09-15  
**Purpose:** Full-fidelity handoff for continuation in a new conversation.  
**Status:** **OPEN — NOT CLOSED**  
**Production status:** **NOT DEPLOYED / NOT PRODUCTION CLOSED**  
**Current validation branch:** `verify/experience-foundation-f1-f4-2026-09-15-r2`  
**Current candidate head:** `c2556a9831669126b7a4a7b9f486e635481be2a9`  
**Validation PR:** #127 — `verify: Experience Foundation F1-F4 current candidate`  
**PR state:** OPEN, not merged, validation-only  
**Base:** `main` / `d85a5de23051919fb347e1482bc28f5fe70c0e14`

---

## 1. HANDOFF PURPOSE

This document records the complete work context of the current execution cycle so a new conversation can continue immediately without reconstructing history from memory.

It intentionally records:

- what was investigated;
- what was decided previously and treated as authoritative;
- what was implemented;
- every material repair attempted during this cycle;
- repairs that succeeded;
- repairs that did not solve the problem;
- test runs and their exact status;
- false/inaccurate completion claims that were subsequently corrected;
- current code/branch/PR state;
- current blocker;
- all relevant repository paths and contracts;
- what must happen next;
- what must **not** be changed or reopened.

This is an execution handoff, not a proposal and not a closure document.

---

# 2. GOVERNANCE / OPERATING RULES

## 2.1 Product authority

The Product Owner owns product, UX, visual, functional and architectural decisions.

The assistant may investigate, inspect, compare, recommend and implement approved work, but must not silently convert a recommendation into an approved product decision.

Durable authority belongs in repository documentation under `docs/`. Chat is not a permanent authority unless explicitly promoted into the repository.

## 2.2 Required execution cycle

The established working cycle is:

`VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE`

A phase is not CLOSED merely because code exists or because documentation exists.

## 2.3 Stop conditions

The user explicitly established that work should not stop for ordinary blockers. Stop only for:

1. a genuine architectural/product decision that cannot be inferred from approved contracts;
2. waiting for required test/action completion;
3. actual closure of the phase.

Otherwise the blocker must be investigated and resolved.

## 2.4 Scope Lock

A critical process correction was established during this cycle because broad test execution repeatedly surfaced unrelated issues and diverted the work.

Current rule:

- Fix issues that directly affect the current UX/visual work or block its execution/verification.
- Record unrelated real issues as deferred findings; do not open an unrelated repair track.
- Test infrastructure/test defects should be fixed when they block valid execution.
- Security/data-integrity issues can become blockers when genuinely critical.
- Comprehensive test execution is a health/verification gate; it must not silently redefine the current work plan.

Current working pattern:

`Inspect → Scope Lock → Implement → Targeted Verify → Continue`

---

# 3. CORE SYSTEM PRODUCT CONTEXT

CORE SYSTEM is the multi-tenant ClinicSaaS / Clinic Operating System + Medical CRM + Business Intelligence product.

It is not:

- booking-only software;
- a sales CRM;
- a generic appointment system.

Initial focus:

- aesthetic clinics;
- dermatology;
- laser;
- skin/beauty;
- cosmetic/aesthetic medicine;

with later expansion toward broader medical centers.

Architecture principle:

> **Independent Modules + Integrated Platform**

Modules remain independently meaningful but integrate through relationships, events and shared data.

---

# 4. CORE EXPERIENCE GOVERNANCE ALREADY ESTABLISHED

## 4.1 Adaptive Hybrid Experience Model

Approved model:

- **Horizon = Foundation**
- **Vertex = Work Engine**
- **Zenith = Experience Layer**

They are not three visual themes.

Governing statement:

> **Horizon controls simplicity. Vertex provides capability. Zenith adapts the experience.**

Formal principle:

> **Information Density must follow Work Complexity.**

### Horizon

- simplicity;
- clarity;
- hierarchy;
- learnability;
- consistency;
- accessibility;
- avoid unnecessary complexity.

### Vertex

- professional work capability;
- appropriate density when complexity requires it;
- advanced workflows;
- monitoring;
- management views;
- analytics.

### Zenith

- contextual presentation;
- personalization within authorization;
- adaptive emphasis;
- human-centered presentation.

---

# 5. VISUAL FOUNDATION — CONCEPT 01 / CLINICAL PRECISION

The Product Owner approved **Concept 01 / Clinical Precision** as the visual foundation for CORE SYSTEM.

The current repository constitution describes the visual language as:

- deep ink;
- clinical azure;
- diagnostic cyan;
- quiet neutrals;
- calm;
- precise;
- professional;
- premium;
- clinical without medical clichés;
- light and visually quiet surfaces;
- typography and spacing as primary hierarchy tools;
- restrained borders;
- purposeful depth;
- disciplined radius;
- density following work complexity;
- native RTL/LTR;
- intentional mobile transformation;
- independent Header capabilities rather than one mega-pill;
- selective card use;
- gradients/glass/glow/decorative treatment not used as default identity.

Important boundary:

**Visual Constitution governs visual expression; it does not override approved functional/surface decisions.**

Visual foundation surfaces:

1. Login
2. Header
3. Home

These establish the language for the rest of the system.

---

# 6. HOME — CURRENT APPROVED PRODUCT DIRECTION

Home is one experience system, not three separate Clinical/Operational/Administration Home designs.

Conceptual model:

`Home = Identity + Today + Context`

Home must answer:

> **من أنا؟ ماذا يهمني الآن؟ وما الخطوة التالية المناسبة لي؟**

Home is Horizon + Zenith dominant.

It must not become another authoritative work engine.

Explicitly removed from Home:

- Notifications;
- Communications;
- Work Center;
- Quick Actions;
- Patient Portal Information.

Widgets/personalized widgets are deferred.

Home must remain distinct from:

- My Workspace;
- Role Workspace;
- Work Center;
- Communications;
- Notifications;
- Agenda/Calendar;
- Patient Flow;
- Analytics Dashboard;
- Patient Portal.

Today’s appointments must preserve user/situational context when entering the authoritative Agenda representation.

Agenda remains the authoritative planning/availability domain.

Calendar is a representation of Agenda, not a second scheduling engine.

---

# 7. HEADER — CURRENT APPROVED CONTRACT

Canonical conceptual order:

`Brand / Home | Global Search | Communications | Chat | Notifications | Quick Actions`

Header is:

- persistent global access;
- not Home;
- not Role Workspace;
- not My Workspace;
- not module directory;
- not universal business-action launcher;
- not an authorization boundary;
- not a second Communications engine;
- not a second Notification engine.

Chat is a compact interaction surface over Communications.

Communications is clinic-wide internal communication across authorized accounts, not doctor-only communication.

Notifications are distinct from Communications.

Quick Actions approved initial scope:

- Language;
- Logout.

Responsive direction:

- Desktop: compact global row.
- Tablet: preserve capability/order while reducing search width before removing capability.
- Mobile: preserve authorized capabilities, allow search collapse, provide larger Chat/Notification surfaces and full Communications access.

Accessibility target:

- WCAG 2.2 AA;
- semantic Header;
- accessible labels;
- visible focus;
- logical keyboard order;
- Enter/Space;
- Escape for dismissible overlays;
- focus restoration;
- correct expanded state;
- adequate touch targets;
- unread state not communicated by color alone;
- dynamic announcements where needed;
- no focus traps.

---

# 8. LOGIN — CURRENT DIRECTION

Login is Horizon-dominant:

- simple;
- calm;
- clear;
- confident;
- medically credible without over-design.

It remains a dedicated authentication surface.

Authenticated Header/Sidebar must not be injected into Login.

Existing authentication behavior must be preserved.

Current status: **OPEN for final visual/runtime verification.**

---

# 9. CURRENT EXPERIENCE FOUNDATION EXECUTION PLAN

The approved execution order is:

### Phase A
Experience Foundation implementation-contract verification.

### Phase B
Login refinement.

### Phase C
Header refinement.

### Phase D
Home refinement:

- remove explicitly removed Home elements;
- replace scattered/card-heavy presentation with Simple + Contextual composition;
- preserve Today context;
- implement Identity/banner behavior;
- keep widgets deferred.

### Phase E
Home → Workspace transition.

### Phase F
Runtime verification:

- desktop;
- tablet;
- mobile;
- RTL;
- LTR;
- keyboard;
- accessibility;
- auth;
- tenant isolation;
- overlays/focus;
- routing;
- real runtime.

### Phase G
Closure only after evidence and registry/ledger reconciliation.

**Experience Foundation is NOT CLOSED.**

---

# 10. GOVERNANCE DOCUMENTS USED / REFERENCED

The current cycle has dealt with or depends on the following repository documents.

## Core Experience Governance

- `docs/CORE-SYSTEM-EXPERIENCE-CONSTITUTION-AND-GOVERNANCE-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-DECISION-REGISTRY-2026-09-14.md`
- `docs/CORE-SYSTEM-INTEGRATED-EXPERIENCE-WORK-CONTRACT-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-EXECUTION-GATE-2026-09-14.md`
- `docs/CORE-SYSTEM-UX-ARCHITECTURE-INVESTIGATION-FINAL-HANDOFF-2026-09-14.md`
- `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`
- `docs/CORE-SYSTEM-EXPERIENCE-F1-F4-EXECUTION-LEDGER-2026-09-15.md`
- `docs/CORE-SYSTEM-SURFACE-VISUAL-APPLICATION-MATRIX.md`
- `docs/CORE-SYSTEM-VISUAL-DESIGN-CONSTITUTION.md`
- `docs/CORE-SYSTEM-VISUAL-EXECUTION-CONTRACT.md`
- `docs/CORE-SYSTEM-VISUAL-TOKEN-SPEC.md`

## Header contracts

- `docs/HEADER-TECHNICAL-FOUNDATION-2026-09-11.md`
- `docs/HEADER-UX-UI-PHASE-2-CLOSURE-2026-09-13.md`
- `docs/HEADER-UX-UI-FINAL-EXECUTION-CONTRACT-2026-09-13.md`
- `docs/HEADER-CHAT-INTEGRATION-REPORT-2026-09-12.md`
- `docs/HEADER-QUICK-ACTIONS-EXECUTION-CONTRACT-2026-09-12.md`
- `docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-WAVE-B-CLOSURE-2026-09-12.md`

## Test / execution governance

- `docs/testing/CORE_SYSTEM_MASTER_TEST_EXECUTION_CONTRACT.md`
- `CORE_SYSTEM_EXECUTION_HANDOFF.md`
- `CORE_SYSTEM_EXECUTION_LEDGER.md`
- `tools/test-execution-setup.mjs`
- `tools/test-execution-runner.mjs`
- `.github/workflows/test-execution-contract.yml`
- `package.json`

## Patient Journey / related authoritative source

- `/CORE SYSTEM/Patient Journey/PJ/`
- `PJ-Complete-Source-Documents.zip`

Patient Journey stage state remains:

- stages 0–10 closed;
- stage 11 provisional;
- stage 12 implementation/production verification.

Do not restart the Patient Journey UX investigation.

---

# 11. VALIDATION BRANCH / PR STATE

## Branch

`verify/experience-foundation-f1-f4-2026-09-15-r2`

## Current head

`c2556a9831669126b7a4a7b9f486e635481be2a9`

Commit message:

`fix: pass tenant context to patient list editor`

## PR #127

Title:

`verify: Experience Foundation F1-F4 current candidate`

State:

- OPEN;
- not merged;
- validation-only;
- base `main`;
- no production deployment.

PR body explicitly defines it as a validation-only PR and states it must not be merged as the implementation PR.

PR merge ref used by Run 261:

`2365d60e324dec49761aef5385101601f7499fc9`

The workflow checked out that merge candidate, not the raw branch tip directly.

---

# 12. WHAT WAS DONE BEFORE THE CURRENT PATIENT-CREATION BLOCKER

## 12.1 Home blocking-load issue

The Home page had a runtime problem where it could render briefly and then show:

> `لا يمكن تحميل الصفحة`

Investigation identified Weather as a blocking server-render dependency.

### Repair

Commit:

`7044030081aa43579f91c615f4e90ffdd9e5d793`

The Weather surface was moved out of the blocking server render path.

The intent was to make ambient weather context non-blocking so failure/loading of Weather could not destroy Home.

---

## 12.2 Home lint/runtime state update repair

Commit:

`4e58756d6800c89821620d294516fbab8760641a`

Problems addressed:

- `HomeIdentityBanner.tsx` had a state update pattern inside `useEffect` that violated the repository lint rule.
- `HomeWeather.tsx` had a similar pattern.

Repair:

- `HomeIdentityBanner` moved away from the problematic effect-driven state initialization toward `useSyncExternalStore`.
- `HomeWeather` was converted to TanStack Query/non-blocking behavior.

This repair was successful at the lint level and was required to allow the broader candidate to pass engineering gates.

---

# 13. PATIENT CREATION — ORIGINAL PROBLEM

The critical blocker became the Patient Journey E2E / Patients flow.

The test repeatedly failed around patient creation.

Initial symptom:

- Add Patient action was not reliably available in the automated runtime.

The investigation first showed that the client was relying on client-side permission/auth state in a way that could fail or load too slowly for the test.

---

# 14. PATIENT PERMISSION INVESTIGATION

The following facts were verified before changing authorization behavior:

- `clinic_admin` has `patients:create` in `role_permissions`.
- No active deny override for `patients:create` was found.
- Current clinic admin subscription has full/all modules.
- At least one clinic-admin user exists.

Conclusion:

**The problem was not missing business authorization.**

Therefore the following were explicitly rejected:

- granting extra RBAC permission merely to make the test pass;
- changing `hasPermission()` to always return true;
- removing permission gating;
- weakening server authorization.

---

# 15. SERVER-SIDE PATIENT AUTHORIZATION REPAIR

The Patients page was aligned with the InventoryPage server-side permission pattern.

The page now resolves server-side:

- authenticated user;
- tenant;
- effective permissions.

The route is gated by:

`patients:read`

The create capability is derived server-side:

`permissions.includes("patients:create")`

The authoritative tenant ID and create permission are passed into the client.

The actual create operation remains server-authorized.

This avoided making the UI dependent on a slow/unreliable client permission query for a critical action.

Relevant earlier commits:

- `bad9875a12294a9255b2aab9b89f4360d3b93ed4`
- `e17fb664c3c44f67ff69a2800cdbeec0b64b4d2a`

These changes were part of the current validation candidate history.

---

# 16. PATIENT CREATE TEST INSTRUMENTATION

Commit:

`2dbf1877d6134e0639f3ff684cede3901a74db50`

Purpose:

- adjust Patient Portal route/test exclusion so the relevant E2E path could be isolated correctly.

Commit:

`f2ccb9e945535e28ae23cef072c7827d34cb2478`

Purpose:

- instrument patient-create response behavior.

This instrumentation was important because the test symptom changed from “button unavailable” to a more specific create-flow failure.

---

# 17. PATIENT CREATE — SECONDARY FAILURE DISCOVERY

After the server-side permission correction, the E2E flow progressed farther.

The next observed failure was:

- the create interaction happened;
- the test then waited for the newly created patient to appear;
- the expected patient was not observed.

A Supabase query around the test timestamp did not show a matching inserted row in one of those runs.

At this point it was incorrect to conclude that the problem was merely React Query/cache invalidation.

Further instrumentation was required.

---

# 18. CRITICAL ROOT-CAUSE DISCOVERY — `patient:create|no-response`

The latest meaningful E2E log before Run 261 showed:

`FAIL|patient:create|no-response`

This was a critical distinction.

It means the test listener never observed a response to:

`POST /api/patients`

Therefore this was **not simply a stale-list/cache-visibility problem**.

Inspection of:

`src/features/patients/patient-form.tsx`

found the actual client-side root cause.

The form previously used:

`useAuth()`

for its `tenantId`.

The submit path contained a guard equivalent to:

```text
if (!tenantId) {
  setServerError(...)
  setIsSubmitting(false)
  return
}
```

Therefore if the client AuthContext had not populated tenant ID at submit time:

- no POST was sent;
- the response listener saw no response;
- the E2E test reported `patient:create|no-response`.

This was the strongest root-cause finding in the current patient-create investigation.

---

# 19. PATIENT FORM TENANT-CONTEXT REPAIR

The repair changed the data-flow so the form receives authoritative tenant context from its parent rather than independently resolving tenant state from AuthContext.

`src/features/patients/patient-form.tsx`

Changes:

- `tenantId` became a required input from the caller in the intended architecture;
- `useAuth()` dependency was removed from the form;
- submit uses the passed tenant ID;
- the API call remains `/api/patients`;
- authorization is still performed server-side;
- client-provided tenant context is not treated as an authorization boundary;
- after success, the React Query cache keyed by `['patients', tenantId]` is updated;
- `onSuccess` and `onClose` are called;
- `invalidateAll(tenantId)` is retained to reconcile broader query state.

The file was verified at SHA:

`e7c34f4f4ea7ab4b5d66efbb035a43987d19f7cb`

This was a correct architectural direction because it removed an unnecessary asynchronous client dependency from a critical form while preserving server-side authority.

---

# 20. PATIENT PAGE PROPAGATION REPAIR

`src/features/patients/PatientsPageClient.tsx`

The authoritative tenant ID is passed into `PatientForm`.

Verified file SHA:

`6541f7ff29a689679214a9b0b3a4101c1f8a0eb4`

The intended invocation is equivalent to:

```tsx
<PatientForm
  tenantId={tenantId}
  isOpen={isFormOpen}
  onClose={() => setIsFormOpen(false)}
  onSuccess={() => setIsFormOpen(false)}
/>
```

---

# 21. PATIENT DETAIL EDIT PATH REPAIR

`src/features/patients/patient-detail.tsx`

Commit:

`29cf7da108ce28118491042a6d831c8b599de341`

Purpose:

- ensure the edit form receives tenant context from `patient.tenant_id`.

This prevents the same tenant-context failure from reappearing through the detail/edit path.

---

# 22. PATIENT LIST EDIT PATH REPAIR

`src/features/patients/patient-list.tsx`

Commit:

`c2556a9831669126b7a4a7b9f486e635481be2a9`

Commit message:

`fix: pass tenant context to patient list editor`

The existing `tenantId` from `useAuth()` was passed into the edit `PatientForm` invocation.

The current line is effectively:

```tsx
<PatientForm
  patient={selectedPatient}
  tenantId={tenantId ?? undefined}
  ...
/>
```

This repair was intended to close the last known `PatientForm` tenant-context call path.

**However, this exact implementation introduced a TypeScript error because `PatientForm` now expects `tenantId: string`, while the expression is `string | undefined`.**

This is the current Run 261 blocker.

---

# 23. PATIENT API — CURRENT AUTHORITY

Current file:

`src/app/api/patients/route.ts`

Current architecture:

- imports `createClient` from `@/infrastructure/supabase/server`;
- imports `getAuthorizedTenantId` from `@/domain/patients/patients.authorization`;
- POST validates/parses request body;
- tenant is derived server-side using the authenticated session;
- insert targets `clinic_patients`;
- response selects the inserted record;
- POST returns `{ data }` with HTTP 201;
- PATCH/DELETE also derive/verify authorized tenant server-side.

Latest known file SHA:

`5b9652b1bd9e2c5319d1dc759a1367036c3fedcd`

Important:

**Do not weaken this API authorization.**

The client tenant ID exists to provide deterministic UI/query context, not to bypass server authorization.

---

# 24. ALL KNOWN PATIENT FILE PATHS TO REVIEW

The current patient-create/edit investigation touched or depended on:

- `src/app/(dashboard)/patients/page.tsx`
- `src/app/api/patients/route.ts`
- `src/features/patients/PatientsPageClient.tsx`
- `src/features/patients/patient-form.tsx`
- `src/features/patients/patient-list.tsx`
- `src/features/patients/patient-detail.tsx`
- `src/domain/patients/patients.authorization`
- `src/domain/patients/patients.queries`
- `src/domain/patients/patients.types`
- `src/core/auth/AuthContext`
- `src/core/permissions/usePermissions`

Also related E2E/instrumentation paths:

- `tools/ajm-production-auth-e2e.spec.mjs`
- `tools/clinic-admin-real-world-e2e-v2.mjs`

---

# 25. TEST HISTORY — RUNS THAT MUST NOT BE FORGOTTEN

## Earlier baseline failure / Run #252

Run:

`#252`

Workflow ID:

`34959878067`

Job:

`104350659959`

Result:

FAIL.

It established the recurring patient-journey problem and the need for deeper diagnosis.

---

## Run #229

Run #229 is **not comparable** to the current comprehensive contract because it executed only a small engineering subset (three engineering tests).

Do not use Run #229 as evidence that the current candidate was fully validated.

---

## Run #254

Run:

`#254`

Workflow ID:

`34960967957`

Head:

`f2ccb9e945535e28ae23cef072c7827d34cb2478`

Result:

- engineering: PASS;
- authenticated-e2e: FAIL;
- authorization: PASS;
- cross-domain: PASS;
- database-integrity: PASS;
- patient-journey: FAIL.

This run is important because it showed the broad engineering/security/data gates could pass while the actual patient journey remained broken.

---

## Run #257

A previous assistant statement claimed that a new Run #257 had been executed.

The user explicitly reported:

> “لم يظهر أي اختبار جديد.”

The assistant subsequently acknowledged that the claim was inaccurate.

**This must remain in the handoff.**

No new test run should ever be reported unless the GitHub Actions run has been independently verified.

---

# 26. RUN #261 — VERIFIED CURRENT RESULT

Run:

`#261`

Workflow ID:

`34964993406`

Validation candidate:

`c2556a9831669126b7a4a7b9f486e635481be2a9`

PR merge candidate checked out by the workflow:

`2365d60e324dec49761aef5385101601f7499fc9`

Job:

`104367233477`

Job name:

`UNIFIED — Test Execution Engine`

Overall:

**FAIL**

Summary from the execution report:

- total tests: 8;
- passed: 1;
- failed: 7.

The single passing engineering test was lint.

The seven failures were:

1. engineering / typecheck — FAIL;
2. engineering / build — FAIL;
3. authenticated-e2e — BLOCKED by failed build;
4. authorization — BLOCKED by failed build;
5. cross-domain — BLOCKED by failed build;
6. database-integrity — BLOCKED by failed build;
7. patient-journey — BLOCKED by failed build.

Therefore Run 261 **did not execute the runtime patient-create journey**.

This distinction is critical.

---

# 27. EXACT RUN #261 ROOT FAILURE

TypeScript failure:

```text
src/features/patients/patient-list.tsx(30,2826): error TS2322:
Type 'string | undefined' is not assignable to type 'string'.
Type 'undefined' is not assignable to type 'string'.
```

The same TypeScript failure caused production build failure.

Build command:

`npm run i18n:parity && next build --webpack`

The i18n parity check itself passed:

> I18N catalog integrity passed for 26 catalog files (AR/EN keys, non-empty values, duplicates, and placeholders).

Next.js compiled with warnings, then failed at TypeScript validation.

Warnings included circular dependency warnings in webpack runtime chunks, but these were **not** the failure that stopped the build.

The stopping error was the patient-list TypeScript mismatch.

---

# 28. WHY RUN #261 LOOKED LIKE “ALL TESTS FAILED”

The user correctly observed that all tests failed through Run 261.

Technically, Run 261 reports seven failed test entries, but six of those were not independently executed runtime failures.

The workflow explicitly reported:

`Runtime suites require a successful production build`

for:

- authenticated-e2e;
- authorization;
- cross-domain;
- database-integrity;
- patient-journey.

Therefore:

**Run 261 has one primary engineering blocker and six downstream blocked suites.**

This must not be misreported as seven unrelated product defects.

---

# 29. IMPORTANT DISCOVERY FROM RUN #261 ABOUT THE TEST CONTRACT

Run #261 confirmed the execution contract is valid.

Contract version:

`2.0`

Regression level:

`R3`

Required suites:

- authenticated-e2e;
- authorization;
- cross-domain;
- database-integrity;
- engineering;
- patient-journey.

Required engineering:

- build;
- lint;
- typecheck.

The contract setup itself passed.

Therefore the current blocker is application TypeScript, not test-contract setup.

---

# 30. RUN #261 CHANGED-FILE IMPACT SET

The execution setup recorded these changed files for the candidate:

- `CORE_SYSTEM_EXECUTION_HANDOFF.md`
- `docs/CORE-SYSTEM-EXPERIENCE-CONSTITUTION-AND-GOVERNANCE-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-DECISION-REGISTRY-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-EXECUTION-GATE-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-F1-F4-EXECUTION-LEDGER-2026-09-15.md`
- `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`
- `docs/CORE-SYSTEM-INTEGRATED-EXPERIENCE-WORK-CONTRACT-2026-09-14.md`
- `docs/CORE-SYSTEM-SURFACE-VISUAL-APPLICATION-MATRIX.md`
- `docs/CORE-SYSTEM-UX-ARCHITECTURE-INVESTIGATION-FINAL-HANDOFF-2026-09-14.md`
- `docs/CORE-SYSTEM-VISUAL-DESIGN-CONSTITUTION.md`
- `docs/CORE-SYSTEM-VISUAL-EXECUTION-CONTRACT.md`
- `docs/CORE-SYSTEM-VISUAL-TOKEN-SPEC.md`
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(dashboard)/agenda/page.tsx`
- `src/app/(dashboard)/page.tsx`
- `src/app/(dashboard)/patients/page.tsx`
- `src/app/api/patients/route.ts`
- `src/app/globals.css`
- `src/core/search/GlobalSearch.tsx`
- `src/features/home/HomeIdentityBanner.tsx`
- `src/features/home/HomeWeather.tsx`
- `src/features/home/HomeWorkspaceTransitionLink.tsx`
- `src/features/patients/PatientsPageClient.tsx`
- `src/features/patients/patient-detail.tsx`
- `src/features/patients/patient-form.tsx`
- `src/features/patients/patient-list.tsx`
- `src/features/workspace/CommunicationsHeaderControl.tsx`
- `src/features/workspace/GlobalChatHeaderControl.tsx`
- `src/features/workspace/GlobalHeader.tsx`
- `src/features/workspace/NotificationsHeaderControl.tsx`
- `src/features/workspace/QuickActionsHeaderControl.tsx`
- `src/features/workspace/WorkspaceShell.tsx`
- `tools/ajm-production-auth-e2e.spec.mjs`
- `tools/clinic-admin-real-world-e2e-v2.mjs`

Impact declared by the execution contract:

- `CROSS_IMPACT`
- `INTEGRATED`
- `ROLE_IMPACT`
- `SECURITY_IMPACT`
- `TARGET`

Roles selected by the contract:

- Clinic Admin;
- Doctor;
- Finance/Accounting;
- Follow-up Staff;
- Nurse/Assistant;
- Receptionist;
- Super Admin boundary.

---

# 31. WORKSTREAM CONTRACTS INCLUDED IN THE CURRENT EXECUTION GATE

The execution plan records:

### communications-wave-b

Contract:

`docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-WAVE-B-CLOSURE-2026-09-12.md`

Check:

`npm run test:communications-wave-b`

### header-chat

Contract:

`docs/HEADER-CHAT-INTEGRATION-REPORT-2026-09-12.md`

Check:

`npm run test:header-chat`

### header-quick-actions

Contract:

`docs/HEADER-QUICK-ACTIONS-EXECUTION-CONTRACT-2026-09-12.md`

Check:

`npm run test:header-technical-foundation`

These contracts are part of the current validation gate and must not be silently removed to make a run pass.

---

# 32. OTHER RELEVANT EXPERIENCE IMPLEMENTATION PATHS

The current candidate includes or depends on:

## Authentication

- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/login/page.tsx`

## Home

- `src/app/(dashboard)/page.tsx`
- `src/features/home/HomeIdentityBanner.tsx`
- `src/features/home/HomeWeather.tsx`
- `src/features/home/HomeWorkspaceTransitionLink.tsx`

## Header / global shell

- `src/features/workspace/GlobalHeader.tsx`
- `src/features/workspace/WorkspaceShell.tsx`
- `src/features/workspace/CommunicationsHeaderControl.tsx`
- `src/features/workspace/GlobalChatHeaderControl.tsx`
- `src/features/workspace/NotificationsHeaderControl.tsx`
- `src/features/workspace/QuickActionsHeaderControl.tsx`
- `src/core/search/GlobalSearch.tsx`

## Agenda

- `src/app/(dashboard)/agenda/page.tsx`
- existing authoritative Agenda/Calendar implementation under `src/features/agenda/`

## Patients

- `src/app/(dashboard)/patients/page.tsx`
- `src/app/api/patients/route.ts`
- `src/features/patients/PatientsPageClient.tsx`
- `src/features/patients/patient-form.tsx`
- `src/features/patients/patient-list.tsx`
- `src/features/patients/patient-detail.tsx`

## Test tooling

- `tools/test-execution-setup.mjs`
- `tools/test-execution-runner.mjs`
- `tools/ajm-production-auth-e2e.spec.mjs`
- `tools/clinic-admin-real-world-e2e-v2.mjs`
- `.github/workflows/test-execution-contract.yml`

---

# 33. DOCUMENTATION / GOVERNANCE BRANCHES AND PRS

## Governance documentation branch

`docs/ux-experience-governance-foundation-2026-09-14`

Governance PR:

#124

Title:

`docs: establish UX experience constitution and execution governance`

Status:

- OPEN;
- Draft;
- documentation only;
- not merged;
- no Vercel deployment.

The governance package was created specifically to prevent repeated UX investigations from being forgotten and to turn approved UX decisions into enforceable execution contracts.

## Current visual/experience implementation branches visible in repository

Important branch names encountered during the cycle include:

- `feat/visual-design-constitution-f1-f4-2026-09-15`
- `verify/experience-foundation-f1-f4-2026-09-15`
- `verify/experience-foundation-f1-f4-2026-09-15-r2`
- `ux-experience-governance-verify-2026-09-14`
- `visual-experience-constitution-2026-09-14`

The current validation branch is the `-r2` branch listed at the top of this document.

---

# 34. WHAT WAS NOT DONE / WHAT MUST NOT BE CLAIMED

The following must remain explicitly OPEN:

1. Patient creation E2E is not proven fixed.
2. Run 261 did not reach runtime patient creation.
3. The current `patient-list.tsx` tenant prop repair does not typecheck.
4. Experience Foundation F1–F4 is not closed.
5. No production deployment has been used as proof of this cycle.
6. PR #127 has not been merged.
7. No runtime acceptance should be claimed from Run 261.
8. The earlier unverified Run #257 claim was incorrect and must not be repeated.

---

# 35. CURRENT PRIMARY BLOCKER

## Blocker A — TypeScript mismatch in PatientList

File:

`src/features/patients/patient-list.tsx`

Current invocation effectively passes:

`tenantId={tenantId ?? undefined}`

But `PatientForm` expects:

`tenantId: string`

Therefore TypeScript reports:

`string | undefined` → `string`

This is the exact blocker that stopped Run 261.

### Correct architectural handling

Do **not** weaken the `PatientForm` prop back to optional simply to satisfy TypeScript if the intended architecture requires authoritative tenant context.

The next implementation must make the parent-child contract explicit and safe.

Possible implementation approaches must be judged against the existing auth/page contract rather than selected blindly:

- ensure `PatientList` receives a guaranteed tenant ID from its authoritative parent and type it as `string`;
- or guard rendering of the form until a valid tenant ID exists;
- or restructure the list component contract so tenant ID is required and supplied by the server-authoritative page/client boundary.

Do not use a fake fallback tenant ID.

Do not make authorization depend on the client tenant prop.

Do not remove server-side authorization.

---

# 36. CURRENT SECONDARY BLOCKER — NOT YET VERIFIED

After the TypeScript error is fixed, the next required question is whether the previously identified runtime root cause is actually resolved:

`patient:create|no-response`

The fix was applied, but **Run 261 did not reach it**.

Therefore it remains:

**IMPLEMENTED — NOT VERIFIED**

The next successful build/run must verify:

1. Add Patient is visible to the authorized actor.
2. Form opens.
3. Form submits.
4. Browser emits `POST /api/patients`.
5. A response is observed.
6. Response is successful.
7. `clinic_patients` receives the new row.
8. Tenant ID is correct.
9. The newly created patient becomes visible in the list.
10. No duplicate patient is created by retry/invalidation behavior.
11. Authorization remains server-enforced.

Only after these are proven can the patient blocker be closed.

---

# 37. WHAT MUST HAPPEN NEXT IN THE NEW CONVERSATION

The new conversation must start from this exact state.

## Step 1 — Inspect current branch/head

Verify:

- branch = `verify/experience-foundation-f1-f4-2026-09-15-r2`;
- head = `c2556a9831669126b7a4a7b9f486e635481be2a9` or the later verified repair commit;
- PR #127 remains validation-only.

## Step 2 — Fix the Run 261 TypeScript blocker

Fix only the `PatientForm` tenant prop contract issue.

Do not broaden the repair.

## Step 3 — Run engineering validation

At minimum:

- typecheck;
- lint;
- build.

The full unified contract remains mandatory after engineering validation is clean.

## Step 4 — Run the full unified test contract

Do not claim a run until GitHub Actions confirms it.

Required suites remain:

- authenticated-e2e;
- authorization;
- cross-domain;
- database-integrity;
- engineering;
- patient-journey.

## Step 5 — If runtime reaches patient creation

Investigate the exact result of:

`patient:create|no-response`

If the no-response failure is gone, continue through DB persistence and UI visibility.

If it remains, inspect the exact request/response path rather than assuming cache behavior.

## Step 6 — Only after patient flow closes

Resume the Experience Foundation execution work.

Do not jump into unrelated defects revealed by the broad test gate.

Apply Scope Lock.

---

# 38. PATIENT-CREATION CLOSURE CRITERIA

The patient blocker is CLOSED only when all of the following are true:

- [ ] TypeScript passes.
- [ ] Build passes.
- [ ] Patient Journey E2E reaches create.
- [ ] Add Patient is available to the authorized actor.
- [ ] `POST /api/patients` is actually emitted.
- [ ] Response is observed.
- [ ] API returns success.
- [ ] DB row exists in the correct tenant.
- [ ] Patient appears in UI.
- [ ] No duplicate row is created.
- [ ] Authorization tests still pass.
- [ ] Tenant isolation still passes.
- [ ] Full unified test contract passes.
- [ ] Evidence is recorded in the execution ledger.

Until all are true:

**PATIENT CREATION = OPEN**

---

# 39. EXPERIENCE FOUNDATION CLOSURE CRITERIA

After patient blocker closure, F1–F4 cannot be closed merely from automated tests.

Required:

- [ ] Login visual/runtime verification.
- [ ] Header desktop verification.
- [ ] Header tablet verification.
- [ ] Header mobile verification.
- [ ] Home desktop verification.
- [ ] Home tablet verification.
- [ ] Home mobile verification.
- [ ] RTL verification.
- [ ] LTR verification.
- [ ] keyboard/focus verification.
- [ ] accessibility verification.
- [ ] overlay/focus restoration verification.
- [ ] Home → Workspace transition verification.
- [ ] Agenda context preservation verification.
- [ ] tenant isolation verification.
- [ ] authorization verification.
- [ ] final reviewed implementation head recorded.
- [ ] execution ledger reconciled.
- [ ] decision registry reconciled.
- [ ] Product Owner acceptance obtained.

Then, and only then:

**Experience Foundation = CLOSED**

---

# 40. IMPORTANT PRODUCT / ARCHITECTURE BOUNDARIES TO PRESERVE

Do not regress any of the following while fixing the current blocker:

### Communications

Communications is for internal communication among all authorized clinic accounts.

It is not doctor-only.

### Chat

Chat is a compact interaction surface over Communications.

No parallel chat database/engine/permission model.

### Notifications

Notifications are separate from Communications.

### Agenda / Calendar

Agenda remains authoritative planning/availability.

Calendar is a representation, not a second scheduling engine.

### Patient Flow

Patient Flow is a workflow concept, not a sidebar domain.

It starts after the patient enters the clinic.

### Patient Journey

Patient Journey is separate from Patient Flow.

### Roles

- Super Admin = platform owner/lessor.
- Clinic Admin = tenant/main clinic admin.
- `clinic_owner` should be retired.
- Clinical/Operational/Administration are work-context classifications, not authorization roles.

### Personalization

Personalization never grants authorization.

### Home

Home must not absorb specialist engines.

### Mobile

Mobile is a focused work surface, not a compressed desktop.

---

# 41. BROADER SYSTEM AUDIT CONTEXT — DO NOT MIX INTO CURRENT REPAIR

A read-only cross-domain audit from 2026-09-10 found:

- 5 tenants;
- 290 patients;
- 285 agenda events;
- 139 visit sessions;
- 138 invoices;
- 82 payments;
- 700 follow-ups;
- 705 notification queue records;
- 17 communication requests;
- 17 operational work items;
- 122 inventory ledger records;
- 8 workforce employees;
- 66 payroll records;
- 103 commission records;
- 1,540 attendance records;
- 264 analytics snapshots.

Migration ledger issue:

- latest version `20260909175027`;
- name/version mismatch involving `20260909204800_restore_effective_permission_rpc_acl` was flagged.

Tenant-integrity audit:

Allowed relationships included:

- Agenda → Patient;
- Treatment Plan → Session;
- Inventory Ledger → Session.

Rejected relationships included:

- Invoice → Session — `Session tenant mismatch`;
- Follow-up → Session — `FOLLOWUP_SESSION_TENANT_MISMATCH` / trigger `enforce_followup_tenant_integrity`.

Advisor findings:

- 144 unindexed foreign keys;
- 14 auth/RLS initialization warnings;
- 158 multiple permissive policies.

These are important system-health findings but are **not automatically part of the current visual foundation repair**.

Apply Scope Lock before touching them.

---

# 42. ANALYTICS DEMO DATA CONTEXT — SEPARATE WORKSTREAM

A separate product/data request exists for complete active demo clinic data from 2026-01-01, linked to the main Clinic Admin test account.

Requirements include:

- all areas including Workforce;
- Inventory/purchasing/consumables tied to dermatology/laser/aesthetic/cosmetic/skin-beauty procedures;
- cancelled/rescheduled included;
- no-show separate;
- Business Analytics and Clinical Analytics separate but integrated.

This is not part of the current patient-create blocker unless a test directly requires it.

---

# 43. VERCEL / PRODUCTION RULE FOR THIS CYCLE

Vercel is not validation evidence for this current phase.

The current PR is validation-only.

No production deployment should be made merely to test whether the patient creation issue is fixed.

Production deployment belongs to the approved deployment stage after validation and closure requirements are satisfied.

---

# 44. KNOWN FALSE/INVALID COMPLETION PATTERN TO AVOID

The previous cycle exposed a serious process failure:

A repair was described as “fixed” before a new test run actually proved it.

The Run #257 claim is the explicit example.

The new conversation must enforce this rule:

> **Code change ≠ verified fix.**

Also:

> **A workflow run existing ≠ the relevant test executing.**

And:

> **A test entry marked FAIL because it is blocked by build failure is not evidence of an independent runtime defect.**

Every future status statement must distinguish:

- IMPLEMENTED;
- TYPECHECKED;
- BUILT;
- TEST EXECUTED;
- TEST PASSED;
- RUNTIME VERIFIED;
- PRODUCTION VERIFIED;
- CLOSED.

---

# 45. EXACT CURRENT STATUS MATRIX

| Area | Status | Evidence / reason |
|---|---|---|
| Experience Governance | APPROVED FOUNDATION / OPEN execution | Governance docs exist; implementation not closed |
| Visual Constitution | APPROVED foundation | Concept 01 / Clinical Precision established |
| Login | OPEN | Implementation exists; final runtime/visual verification pending |
| Header | OPEN | F1–F4 candidate implementation exists; final runtime/visual verification pending |
| Home | OPEN | Repairs applied; final integrated verification pending |
| Home Weather blocking issue | IMPLEMENTED | Commit `7044030081aa...` |
| Home lint state-update issue | IMPLEMENTED | Commit `4e58756d...` |
| Patient permission investigation | CLOSED finding | RBAC was not root cause |
| Server-side patient permission resolution | IMPLEMENTED | Earlier patient-page commits |
| Patient create response instrumentation | IMPLEMENTED | Commit `f2ccb9e...` |
| Patient Form tenant dependency repair | IMPLEMENTED | `e7c34f4...` |
| Patient Detail tenant propagation | IMPLEMENTED | `29cf7da...` |
| Patient List tenant propagation | IMPLEMENTED but TYPE ERROR | `c2556a9...` |
| Patient API authorization | PRESERVED | Server derives authorized tenant |
| Patient runtime create | NOT VERIFIED | Run 261 blocked before runtime |
| Run 261 | FAIL | TypeScript/build failure |
| Full Experience Foundation | NOT CLOSED | Required verification remains |
| Production deployment | NOT DONE | Correctly deferred |
| PR #127 | OPEN | Validation-only |

---

# 46. FILES CREATED / UPDATED BY THIS HANDOFF

This handoff itself is being stored at:

`docs/CORE-SYSTEM-EXPERIENCE-F1-F4-EXECUTION-HANDOFF-2026-09-15.md`

It is intended to become the durable starting point for the next conversation.

---

# 47. FIRST MESSAGE / FIRST ACTION IN THE NEXT CONVERSATION

The next conversation should not restart discovery.

The correct opening operational statement is effectively:

> Continue from `docs/CORE-SYSTEM-EXPERIENCE-F1-F4-EXECUTION-HANDOFF-2026-09-15.md`. Verify the current branch/head, fix the Run #261 TypeScript blocker in `src/features/patients/patient-list.tsx` without weakening tenant/auth architecture, then run the unified execution contract. Do not move to Experience Foundation continuation until the patient-create blocker is verified closed. Apply Scope Lock to unrelated test findings.

Then immediately inspect the repository state and continue execution.

---

# 48. FINAL HANDOFF STATE

**Current branch:**

`verify/experience-foundation-f1-f4-2026-09-15-r2`

**Current head:**

`c2556a9831669126b7a4a7b9f486e635481be2a9`

**Current PR:**

#127 — OPEN / validation-only

**Latest verified workflow:**

Run #261 — `34964993406` — FAIL

**Primary current blocker:**

TypeScript `TS2322` in:

`src/features/patients/patient-list.tsx`

**Underlying runtime issue already discovered but not yet reverified:**

`patient:create|no-response`, caused by `PatientForm` depending on client AuthContext tenant state and exiting before sending `POST /api/patients` when tenant ID was unavailable.

**Repair status for underlying runtime issue:**

Implemented, but not yet proven by a successful runtime run.

**Production status:**

Not deployed / not closed.

**Experience Foundation status:**

**NOT CLOSED.**

**Next action:**

Fix the exact TypeScript contract error → obtain successful build → run full unified test contract → verify actual patient creation/persistence/UI visibility → close patient blocker → resume F1–F4 runtime verification.

**Do not restart UX investigation.**

**Do not weaken authorization.**

**Do not treat blocked suites as independent runtime defects.**

**Do not claim completion without a verified run.**

---

## END OF HANDOFF
