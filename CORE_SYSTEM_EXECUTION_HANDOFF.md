# CORE SYSTEM — EXECUTION HANDOFF

**Date:** 2026-09-15
**Current Branch:** `feat/visual-design-constitution-f1-f4-2026-09-15`
**Base:** `docs/ux-experience-governance-foundation-2026-09-14`
**Current Candidate:** PR #125 / `b6f4f2cd865e8e3be34f1195412c16862f18ee86`
**Code-equivalent implementation revision verified by unified workflow:** `344a2ebe453a8218e34c56b675bde19fc4a60070`

## Current Objective
Implement the Product Owner-approved **Experience Foundation** across F1–F4 as one adaptive experience system, using Clinical Precision as its approved visual language and without reopening closed decisions.

## Authority
The active authority stack is:
1. Experience Constitution & Governance
2. Experience Decision Registry
3. Integrated Experience Work Contract
4. Experience Execution Gate
5. Visual Design Constitution
6. Visual Token Specification
7. Surface Visual Application Matrix
8. Visual Execution Contract

The repository also contains the current-cycle execution ledger:
`docs/CORE-SYSTEM-EXPERIENCE-F1-F4-EXECUTION-LEDGER-2026-09-15.md`.

## F1–F4 Implementation

### F1 — Login
- Dedicated authentication experience; authenticated Header/Sidebar are not imported.
- Clinical Precision light/calm presentation with authoritative ClinicSaaS brand asset.
- Authentication behavior, redirect, language, forgot-password, register, password visibility, error handling, loading behavior, and native validation preserved.
- Email/password autocomplete and accessible authentication-error association added.

### F2 — Header
- Persistent global shell with independent Brand/Home, Global Search, Communications, Chat, Notifications, and Quick Actions.
- Mega-pill/container treatment removed.
- Desktop/tablet use a compact single row.
- Mobile intentionally transforms to a second utility row with horizontal capability access instead of squeezing/hiding controls.
- Existing Search/Communications/Chat/Notifications authorities are reused; no duplicate engines.
- Communications remains clinic-wide for authorized clinic accounts.
- Chat remains a compact Communications surface.
- Notifications remain distinct.
- Quick Actions remain Language + Logout.
- Focus-visible and Escape/focus-restoration behavior added to relevant header controls.

### F3 — Home
Home composition is:
`Identity / Context → Today → Attention when actionable → Next Destinations`

Identity Banner contains:
- clinic identity;
- clinic logo when available, otherwise authoritative ClinicSaaS asset;
- user identity;
- approved Welcome behavior;
- lightweight current Weather/ambient context based on clinic location;
- Workspace entry.

Today contains a coherent awareness list with:
- user-context-aware Today's Appointments;
- patients waiting;
- current clinical work;
- completed today.

Today's Appointments use `clinic_users.id → master_agenda_events.doctor_id` and preserve `doctorId` into Agenda.

Attention is conditional and only appears when a genuinely actionable waiting condition exists.

The following remain absent from Home:
- Notifications;
- Communications;
- Work Center;
- Quick Actions;
- Patient Portal information;
- widgets/personalized widgets.

Weather is an explicit approved Home decision recorded as `EXP-029`.

### F4 — Home → Workspace
- Workspace entry is explicit from Home.
- Entry provides lightweight entering-work feedback.
- Existing `/workspace` destination and authorization behavior remain authoritative.
- Workspace shell records navigation away from Home for Welcome lifecycle and applies a subtle work-mode distinction.
- No second workspace layer was introduced.

## Functional Boundary
Agenda remains the authoritative scheduling/planning engine. Calendar remains a representation, not a second engine.

No database migration or permission-model rewrite was introduced by the Experience Foundation work. Work Center was not redesigned. Patient Flow and Patient Journey boundaries were not changed.

## Documentation State
- Experience Constitution, Decision Registry, Integrated Work Contract, Execution Gate, Visual Constitution, Token Spec, Visual Matrix, and Visual Execution Contract are reconciled with current implementation.
- Current-cycle F1–F4 execution evidence is recorded in `docs/CORE-SYSTEM-EXPERIENCE-F1-F4-EXECUTION-LEDGER-2026-09-15.md`.
- The historical root `CORE_SYSTEM_EXECUTION_LEDGER.md` remains unchanged to preserve its historical record; the current-cycle ledger is the authoritative detailed execution supplement for this F1–F4 cycle.

## Verification Execution
Validation-only PR: #126  
Validation branch: `verify/experience-foundation-f1-f4-2026-09-15`  
Unified workflow: `CORE SYSTEM Unified Test Execution Engine`  
Observed run: #243 / `34903128292`  
Implementation revision executed: `344a2ebe453a8218e34c56b675bde19fc4a60070`

Observed passed gates before final suite completion:
- exact candidate checkout;
- Node setup;
- dependencies;
- execution-contract setup;
- contract completeness validation;
- Playwright runtime installation.

Final selected test execution was still running at the latest observation. No terminal pass/fail is claimed until GitHub reports it.

No Vercel deployment is used as validation evidence for this phase.

## Required Final Evidence
The remaining objective gates are:
- terminal automated execution result;
- runtime visual checks for Login/Header/Home/Home→Workspace;
- Desktop/Tablet/Mobile verification;
- RTL/LTR verification;
- accessibility/focus/keyboard/touch verification;
- authorization/data-scope confirmation for Home and Agenda context;
- Product Owner runtime acceptance.

**Current implementation state: F1–F4 rebuilt and source-verified; final automated/runtime acceptance awaits terminal evidence.**
