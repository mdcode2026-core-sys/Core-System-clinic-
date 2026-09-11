# CORE SYSTEM — MASTER EXECUTION / REPAIR CONTRACT

## Global Surfaces + Workspace Architecture Reconciliation

**Date:** 2026-09-11  
**Status:** BINDING EXECUTION CONTRACT — created on PR #96 branch  
**Scope:** Documentation reconciliation → runtime repair → validation → controlled promotion to `main`  
**Related PR:** #96 — `docs: canonicalize Home Header Workspace and Sidebar architecture`

---

## 0. Purpose

This document is the single master execution contract for the work discovered and documented through PR #96.

It supersedes fragmented execution interpretation. The documents referenced by PR #96 remain evidence, architecture records, historical records, or specialized contracts; they must not be treated as competing master execution plans.

This contract converts the reconciled architecture and implementation findings into one controlled path:

**VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE**

No implementation item is considered complete merely because it is documented. No documentation item is considered a runtime fix. No runtime fix is considered closed without objective verification.

---

# 1. Canonical Product Model

## 1.1 Role / Work Context / Workspace

The authoritative relationship is:

```text
Clinic Admin assigns:
    Primary Role
    Primary Work Context
          ↓
    Role Workspace

Separately:
    Effective Permissions
          ↓
    Authorized Capabilities / Domains / Actions
          ↓
    Sidebar / Widgets / My Workspace
```

### Primary Role

The user's job/function within the tenant.

### Primary Work Context

The user's primary professional work classification, assigned by Clinic Admin when creating/managing the user account.

Allowed classifications:

- Clinical
- Operational
- Administration

The user cannot change their Primary Work Context.

Primary Work Context does not grant, remove, or redefine permissions.

### Role Workspace

The stable primary professional work environment corresponding to the user's Primary Work Context.

Additional permissions must not silently redefine Role Workspace.

### Effective Permissions

The complete authorization result derived from the applicable role permissions, direct permissions, overrides, and approved access rules.

Permissions determine what the user may access/do; they do not redefine the user's Primary Work Context or Role Workspace.

---

# 2. Canonical Global Surfaces

## 2.1 Home

Home is the global starting/awareness surface.

Home is not:

- Role Workspace
- My Workspace
- a module directory
- Patient Flow
- a full operational dashboard

Home may contain lightweight awareness and utility surfaces such as calendar, weather, compact chat, approved system banners, and user-selected shortcuts.

## 2.2 Header

The Header is global and persistent.

Canonical surfaces include:

- System identity / logo
- Global Search
- Communications
- Chat
- Notifications
- Quick Actions

Global Search remains permission constrained.

Chat is a compact surface over the existing Communications authority/infrastructure. It must not create a parallel messaging engine.

Notifications remain distinct from Communications and Chat.

Quick Actions initially remain limited to approved global utilities, including Language and Logout. They must not become an uncontrolled business-action dump.

## 2.3 My Workspace

My Workspace is the user's personal arrangement of permitted work/tools.

It is:

- personal presentation
- capability-driven
- subordinate to authorization
- unable to grant permissions

It is not:

- another authorization system
- another workspace membership
- a replacement for Role Workspace
- Home

## 2.4 Sidebar

Sidebar navigation is authorization-driven.

It may expose authorized domains outside the user's Primary Work Context when effective permissions allow them.

Canonical ordinary-user order:

```text
LOGIN → HOME → WORKSPACE → MY WORKSPACE → MODULES / DOMAINS → MY SETTINGS
```

Patient Flow must not become an ordinary standalone sidebar module/domain.

## 2.5 My Settings

My Settings contains personal/account preferences and must not become an authorization or Role Workspace assignment surface.

Examples include display name, password, avatar, language, and other approved personal preferences.

---

# 3. Patient Flow Boundary

Patient Flow is an internal clinic workflow concept.

It begins after the patient enters the clinic and is not a standalone ordinary-user product module merely because workflow data exists.

Clinic Admin may use Patient Flow in administrative/background configuration or oversight contexts.

Clinical / Operational / Administration are work classifications, not roles and not permission sets.

Clinical and Operational Workspace architecture is not to be redesigned as part of this contract unless an objective blocker is discovered and explicitly recorded.

Administrative Workspace remains a distinct implementation topic under this contract.

---

# 4. Source-of-Truth Rules

The following precedence applies:

1. Current approved product decisions in this contract and the canonical reconciliation document.
2. Live production database/runtime evidence when validating actual behavior.
3. Current repository implementation and tests.
4. Current architecture/engineering documents that have been reconciled.
5. Historical documents only as historical evidence.
6. Archived material is non-authoritative unless explicitly promoted by a new approved decision.

A historical document must not silently override the canonical model.

---

# 5. Runtime Source-of-Truth Requirements

## 5.1 `clinic_user_workspaces`

The existing user workspace persistence may represent the administrative assignment of the user's Primary Work Context / Role Workspace.

It must not be interpreted as a user-controlled presentation preference.

The runtime must ensure:

- Clinic Admin/approved administrative authority can assign the Primary Work Context.
- Ordinary users cannot modify their own Primary Work Context.
- Role changes do not silently change Primary Work Context unless Clinic Admin explicitly assigns a new context.
- Additional permissions do not change Role Workspace.
- Workspace resolution remains tenant-scoped.

## 5.2 `roles.workspace`

`roles.workspace` may remain a role/template/default source where the existing model requires it.

It must not silently override an explicit Clinic Admin assignment.

Role and Primary Work Context must remain independently representable.

## 5.3 `clinic_user_settings.default_workspace`

This field is a potential competing legacy concept because current runtime resolution uses `clinic_user_workspaces` rather than this setting.

Required action:

- Stop treating `default_workspace` as a source of Role Workspace.
- Verify all readers/writers before changing schema.
- Preserve data until impact is established.
- If retirement is justified, perform it through an explicit migration and verification rather than an undocumented deletion.

Personal settings must not become an alternate authorization or Primary Work Context assignment mechanism.

---

# 6. Global Technical Identity Requirement

The technical key `global` must not be used as a product-level synonym for multiple distinct surfaces.

Current known drift includes `/my-workspace` passing `workspaceKey="global"` while shared workspace surface definitions use `global` for Home/global behavior.

Required outcome:

```text
Home/global technical identity ≠ My Workspace technical identity
```

A dedicated My Workspace identity must be introduced only after all consumers are enumerated and the change is proven non-breaking.

Required investigation before changing the key:

- route consumers
- renderer consumers
- surface registry
- workspace APIs
- persistence
- tests
- navigation
- deep links
- mobile/responsive behavior
- i18n

No blind global rename is permitted.

---

# 7. Authorization and RLS Contract

The authorization model must preserve the separation between:

- Role
- Primary Work Context
- Role Workspace
- Effective Permissions
- personal settings

Database RLS must enforce the same ownership/authority boundary as server actions.

A server action being protected is not sufficient if a lower-level RLS policy still allows a user to bypass that authority.

Specifically, any policy permitting ordinary authenticated users to write their own `clinic_user_workspaces` record must be reviewed and corrected.

The final policy must permit only the approved administrative authority to assign/change another user's Primary Work Context while preserving tenant isolation.

The exact authority must be derived from the current canonical permission/RBAC implementation. No new role or permission may be invented merely to implement this contract.

---

# 8. Server Action Contract

User-management actions must remain the authoritative application path for assignment.

Required invariants:

1. Caller is authenticated.
2. Caller is resolved to the correct tenant.
3. Caller has the approved user-management authority.
4. Target user belongs to the same tenant.
5. Primary Work Context is validated against the canonical enum.
6. Assignment is persisted to the approved source of truth.
7. Role changes do not silently mutate Primary Work Context.
8. Permission overrides are persisted independently.
9. Personal settings cannot mutate Primary Work Context.

---

# 9. UI Contract for User Administration

The Clinic Admin user-management flow must clearly expose Primary Work Context as an administrative assignment.

The UI must not present it as:

- a personal preference
- a user-selectable workspace preference
- a permission preset
- a role synonym

The user must not receive a UI path to change it from My Settings or personal Workspace customization.

---

# 10. My Workspace Contract

My Workspace may be personalized only within the user's effective authorization.

Required invariants:

- personalization cannot grant access
- personalization cannot change Role Workspace
- personalization cannot change Primary Work Context
- personalization cannot create another workspace membership
- personalization cannot make `global` mean Home

---

# 11. Sidebar Contract

Sidebar visibility is determined by effective authorization, not by a simplistic equality check against Primary Work Context.

Therefore:

```text
Primary Work Context = primary professional environment
Effective Permissions = actual authorization
Sidebar = authorized navigation
```

A Clinical user with an explicitly authorized Administration capability may see the relevant authorized Administration domain without becoming an Administration-context user.

The same principle applies to Operational and other approved domains.

---

# 12. Header / Communications / Chat / Notifications Contract

These surfaces must remain distinct but integrated.

### Communications

Full communications domain and its existing authority/infrastructure.

### Chat

Compact direct-chat surface using existing Communications infrastructure/authority.

No parallel messaging engine.

### Notifications

Personal unread/feed behavior must be validated against the existing notification architecture.

The header bell must not be treated as merely a visual icon without verified personal unread/feed behavior.

---

# 13. Documentation Contract

All documentation touched by this work must obey these rules:

- Current canonical decisions are authoritative.
- Historical records remain historically accurate.
- Historical language may be annotated rather than falsely rewritten.
- Findings must not be mistaken for implementation.
- Plans must not be mistaken for completed work.
- A repair contract must not be mistaken for a completed repair.
- Runtime verification must be documented separately from documentation reconciliation.
- No new competing terminology may be introduced.

The following existing records remain supporting artifacts under this master contract:

- `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`
- `docs/GLOBAL-SURFACES-DOCUMENTATION-RECONCILIATION-REGISTER-2026-09-11.md`
- `docs/GLOBAL-SURFACES-IMPLEMENTATION-DRIFT-FINDINGS-2026-09-11.md`
- `docs/ROLE-WORKSPACE-SOURCE-OF-TRUTH-FINDING-2026-09-11.md`
- `docs/PRIMARY-WORK-CONTEXT-RUNTIME-REPAIR-CONTRACT-2026-09-11.md`
- `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`
- `PJ_STAGE6_WORKSPACE_ARCHITECTURE.md`
- relevant Global UX/IA, Team Access, Workforce, terminology, traceability, coverage, readiness, and historical closure records reconciled by PR #96.

These documents provide evidence and specialized detail; this document is the master execution authority for the repair phase.

---

# 14. Required Implementation Workstreams

## Workstream A — Primary Work Context authority

- Verify current RBAC function semantics.
- Verify current user-management permission boundary.
- Harden `clinic_user_workspaces` RLS.
- Verify tenant isolation.
- Verify Clinic Admin assignment path.
- Verify ordinary-user denial.

## Workstream B — Workspace source cleanup

- Verify every reader/writer of `clinic_user_settings.default_workspace`.
- Remove competing runtime semantics.
- Preserve data until migration impact is proven.
- Create migration only if required.

## Workstream C — Global / My Workspace technical separation

- Inventory all `global` consumers.
- Introduce dedicated My Workspace key where required.
- Update renderer/registry/navigation/API consumers.
- Preserve Home/global behavior.
- Verify deep links and existing authorized surfaces.

## Workstream D — User administration UI

- Verify Primary Work Context is assigned only through authorized administration.
- Verify labels and semantics.
- Ensure My Settings cannot change it.

## Workstream E — Authorization-driven navigation

- Verify Sidebar uses effective permissions.
- Verify cross-context permissions do not mutate Role Workspace.
- Verify Patient Flow remains outside ordinary sidebar module classification.

## Workstream F — Header/global surfaces

- Verify Global Search authorization.
- Verify Communications authority reuse.
- Verify Chat does not introduce a second messaging engine.
- Verify personal notification unread/feed behavior.
- Verify Quick Actions boundary.

## Workstream G — Documentation and traceability

- Update implementation findings after repairs.
- Record each changed file and reason.
- Record tests and evidence.
- Update status only after verification.

---

# 15. Mandatory Acceptance Tests

The following cases are required before closure.

### Access / assignment

1. Clinic Admin can assign Clinical Primary Work Context.
2. Clinic Admin can assign Operational Primary Work Context.
3. Clinic Admin can assign Administration Primary Work Context.
4. Ordinary user cannot modify their own Primary Work Context through the application.
5. Ordinary user cannot modify their own Primary Work Context through direct database/RLS access.
6. Cross-tenant assignment is rejected.

### Role separation

7. Changing Role without explicit Primary Work Context change does not change Role Workspace.
8. Additional permissions do not change Role Workspace.
9. Direct permission grants do not change Primary Work Context.
10. Overrides do not change Primary Work Context.

### Settings separation

11. `clinic_user_settings.default_workspace` cannot alter Role Workspace.
12. My Settings cannot change Primary Work Context.
13. My Workspace personalization cannot change Primary Work Context.

### Navigation

14. Sidebar is permission-driven.
15. Authorized cross-context domain access is visible without changing Role Workspace.
16. Unauthorized domains remain hidden/inaccessible.
17. Patient Flow is not exposed as an ordinary standalone sidebar module.

### Global surfaces

18. Home remains distinct from Role Workspace.
19. Home remains distinct from My Workspace.
20. My Workspace no longer resolves through the Home/global identity.
21. Existing Home/global consumers remain functional.
22. Global Search remains permission constrained.
23. Chat reuses Communications authority/infrastructure.
24. Notifications provide verified personal unread/feed behavior.
25. Quick Actions remain within approved global scope.

### Regression

26. Login/logout remains functional.
27. Tenant isolation remains intact.
28. Existing Clinical and Operational Workspace behavior remains intact.
29. Administration Workspace behavior remains intact for authorized users.
30. i18n EN/AR behavior remains intact.
31. Responsive/mobile behavior remains intact.
32. Existing tests and build remain green.

---

# 16. Verification Gates

## Gate 1 — Repository inspection

Before implementation:

- enumerate all affected files
- enumerate all `global` consumers
- enumerate workspace readers/writers
- verify RBAC function semantics
- verify RLS policies
- verify user-admin UI path

**Failure:** do not implement.

## Gate 2 — Implementation correctness

After implementation:

- inspect diff
- verify no unrelated changes
- verify no schema drift
- verify no undocumented database behavior
- verify canonical semantics in code/comments

**Failure:** repair before proceeding.

## Gate 3 — Automated validation

Run applicable repository checks, including:

- typecheck
- lint
- unit/integration tests
- targeted authorization/RLS tests
- build

No claim of success without actual results.

## Gate 4 — Runtime validation

Where connected execution is available:

- verify deployed/runtime behavior
- verify Supabase RLS behavior
- verify Vercel build/deployment
- verify key user journeys

No production closure claim from repository checks alone.

## Gate 5 — Documentation verification

Verify:

- master contract reflects actual implementation
- supporting findings are updated
- historical documents are not falsely presented as current
- evidence is recorded

## Gate 6 — Promotion

Only after Gates 1–5 pass:

- update PR status appropriately
- merge/promote the exact reviewed head into `main`
- verify `main` points to the expected commit
- run final post-promotion verification

If a gate cannot be objectively verified, status remains **NOT CLOSED**.

---

# 17. Prohibited Actions

The following are prohibited without an explicit new decision:

- direct modification of `main` before validation
- undocumented Supabase changes
- creating a second authorization system
- creating a second messaging engine
- making My Workspace a second workspace membership
- letting users self-change Primary Work Context
- allowing `clinic_user_settings.default_workspace` to compete with the canonical source
- blindly renaming every `global` occurrence
- redesigning Clinical/Operational Workspace while this contract is focused on reconciliation/repair
- changing Patient Flow into an ordinary sidebar module
- inventing new roles solely to solve implementation convenience
- deleting legacy columns/data without impact analysis and migration
- claiming tests passed without evidence
- claiming production closure without live verification
- rewriting historical documents in a way that destroys historical truth

---

# 18. Evidence Ledger Requirements

Every completed workstream must record:

- commit SHA
- changed files
- reason for change
- tests executed
- test result
- runtime verification result where applicable
- known limitations
- rollback/recovery consideration

The final closure record must identify the exact commit promoted to `main`.

---

# 19. Closure Definition

This contract is CLOSED only when all of the following are true:

1. Canonical architecture is represented consistently.
2. Primary Work Context authority is enforced in application and database layers.
3. Role Workspace remains independent from additional permissions.
4. Personal settings cannot mutate Role Workspace.
5. Home and My Workspace have distinct technical identities.
6. Sidebar remains authorization-driven.
7. Communications / Chat / Notifications boundaries remain correct.
8. Patient Flow boundary remains correct.
9. Required tests pass.
10. Build/type/lint checks pass.
11. Runtime verification passes where required.
12. Documentation and evidence are updated.
13. The reviewed commit is promoted to `main`.
14. Post-promotion verification passes.

Otherwise:

**STATUS = NOT CLOSED**

---

# 20. Final Authority Statement

This contract is the master execution/repair contract for the Global Surfaces / Workspace reconciliation work originating from PR #96.

It does not authorize unrelated product redesign.

It does not declare any repair complete merely because the repair is specified.

It establishes one controlled path from the reconciled documentation and findings to verified implementation and, only after objective evidence, promotion to `main`.

**No completion claim may be made without evidence.**
