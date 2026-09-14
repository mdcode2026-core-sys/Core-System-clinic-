# CORE SYSTEM — EXECUTION HANDOFF

**Date:** 2026-09-15
**Current Branch:** `feat/visual-design-constitution-f1-f4-2026-09-15`
**Base:** `docs/ux-experience-governance-foundation-2026-09-14`
**Current Candidate:** PR #125 / `84da2d1371ebc231f78cc6bedd2c671b198ce379`
**Latest implementation commit before handoff reconciliation:** `84da2d1371ebc231f78cc6bedd2c671b198ce379`

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

`EXP-001`–`EXP-029` and `VIS-001`–`VIS-002` govern approved product/experience decisions. Runtime acceptance remains subject to the execution gates.

## F1–F4 Implementation

### F1 — Login
- Dedicated authentication experience; authenticated Header/Sidebar are not imported.
- Clinical Precision light/calm presentation with existing ClinicSaaS brand asset.
- Authentication behavior, redirect, language, forgot-password, register, password visibility, error handling, and loading behavior preserved.
- Native browser validation retained; email/password autocomplete and accessible error association added.

### F2 — Header
- Persistent global shell with independent Brand/Home, Global Search, Communications, Chat, Notifications, and Quick Actions.
- Mega-pill/container treatment removed.
- Desktop/tablet use a single compact row; mobile intentionally transforms to a two-row shell so authorized capabilities remain accessible rather than being squeezed or hidden.
- Mobile utility row is horizontally scrollable without visible scrollbar when necessary.
- Communications remains clinic-wide for authorized clinic accounts.
- Chat remains a compact surface over Communications.
- Notifications remain independent.
- Quick Actions remain limited to Language + Logout.
- Existing Search/Communications/Chat/Notifications engines were reused rather than duplicated.
- Escape/focus behavior and explicit interactive states are applied to header controls.

### F3 — Home
Home is implemented as a simple contextual awareness surface, not a dashboard/card wall:

`Identity / Context → Today → Attention when actionable → Next Destinations`

Identity Banner now contains:
- clinic identity;
- clinic logo when available, otherwise the authoritative ClinicSaaS brand asset;
- user identity;
- Welcome behavior (first entry, then hidden after first navigation);
- lightweight current Weather/ambient context tied to clinic address/location.

Today now contains:
- user-context-aware Today's Appointments;
- waiting patients;
- current clinical work;
- completed today;
- a single coherent list/surface rather than four scattered cards.

Today's Appointments use the authenticated `clinic_users.id` with the existing `master_agenda_events.doctor_id` relationship and route to Agenda with `doctorId` preserved.

Attention is contextual and only renders when a genuinely actionable waiting condition exists; it routes into Workspace rather than creating a second work engine.

The following remain intentionally absent from Home under approved decisions:
- Notifications;
- Communications;
- Work Center;
- Quick Actions;
- Patient Portal information;
- widgets/personalized widgets.

### F4 — Home → Workspace
- Workspace entry is explicit from Home.
- The transition now provides lightweight entering-work feedback while preserving the existing `/workspace` destination and authorization behavior.
- Workspace shell records the transition away from Home for Welcome behavior without introducing a second workspace layer.
- `cs-work-mode` provides a subtle shell-level visual distinction once inside Workspace.

## Functional Boundary
Agenda remains the authoritative scheduling/planning engine. No second scheduling engine was introduced. No database migration or permission-model rewrite was introduced. Work Center itself was not redesigned.

## Documentation State
The current Experience and Visual governance documents are reconciled with the latest Home Weather/Attention requirements. The registry now records `EXP-029` for the approved Weather/ambient Home identity context.

The historical root `CORE_SYSTEM_EXECUTION_LEDGER.md` still requires a safe current-cycle append/reconciliation before final closure.

## Verification Execution
A validation-only PR was created against `main` so the repository's mandatory unified execution workflow can execute against the exact candidate:

- Validation PR: #126
- Validation branch: `verify/experience-foundation-f1-f4-2026-09-15`
- Latest validation head: `344a2ebe453a8218e34c56b675bde19fc4a60070`
- Latest unified workflow run observed: Run #243 / `34903128292`
- Workflow performs the repository execution contract and Playwright runtime validation.

The validation workflow has successfully completed setup prerequisites in observed runs, but the final execution result for the final candidate is not yet recorded here until the run reaches a terminal conclusion.

No Vercel deployment is used as validation evidence for this phase.

## Required Final Evidence
Before final closure the current candidate must have:
- automated engineering/execution pass;
- runtime verification for Login, Header, Home, Home→Workspace;
- desktop/tablet/mobile verification;
- RTL/LTR verification;
- accessibility/focus/keyboard/touch verification;
- authorization/data-scope confirmation for Home and Agenda context;
- exact reviewed implementation head recorded;
- execution ledger reconciliation;
- Product Owner runtime acceptance.

## Current Review Points
1. Confirm Weather resolves to the intended clinic locality from the available tenant address, with graceful unavailable fallback.
2. Confirm Agenda `doctorId` context matches the intended authorized clinic-user scope at runtime.
3. Confirm the Home Welcome state changes exactly once per session/navigation path as intended.
4. Confirm the mobile two-row Header remains usable at narrow widths and that no authorized control becomes inaccessible.

These are verification points, not new product decisions.

## Closure Rule
F1–F4 close only after all required evidence above passes and the supporting registry/ledger/handoff are reconciled with the exact reviewed implementation head.

**Current implementation state: F1–F4 rebuilt across the Experience Foundation; final automated/runtime acceptance remains pending evidence.**
