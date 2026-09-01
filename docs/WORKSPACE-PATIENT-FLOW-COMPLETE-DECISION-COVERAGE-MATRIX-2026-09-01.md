# CORE SYSTEM — COMPLETE DECISION COVERAGE MATRIX
## Workspace × Patient Flow × Role × Permissions × Widgets × Navigation × Home × Search
### 2026-09-01

**Authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`
**Purpose:** Prove that every approved architectural decision is carried into engineering and execution without dropping small UI, workflow, integration, data, security, or operational details.
**Scope:** ONLY the 2026-09-01 decision set and explicit clarifications made while approving it. Unrelated architecture is not redesigned.

---

## 0. MASTER RULE

A decision is not implementation-ready until all of these are identified:

`Decision → visible behavior → actor → trigger → source → domain owner → workflow/state → permission → persistence/API → integration → loading/empty/error → responsive/i18n → acceptance test → regression impact`.

No item may be downgraded to "later" merely because it is visually small.

Examples in the approved discussion that establish baseline behavior are treated as minimum acceptance requirements. Engineering may add necessary supporting behavior but may not remove or reinterpret the baseline.

---

# 1. PATIENT JOURNEY / PATIENT FLOW

### Approved decision
Patient Journey is the complete clinic journey. Patient Flow is an internal workflow beginning with patient entry into the clinic. Clinical, Operational and Administration are work classifications within Patient Flow.

### Engineering obligations
- Preserve existing PJ ownership.
- Preserve canonical Patient Flow/Queue state authority.
- Identify every state transition used by Workspace surfaces.
- Identify every handoff and responsible area.
- Do not create a Workspace state machine.
- Do not make Patient Flow an ordinary-user Sidebar Domain.
- Keep Patient Flow available to Clinic Admin in the administrative/background context required by the architecture.

### Execution impact
Audit Queue engine, Patient Flow UI, transition actions, locks, visit/session references, invalidation/revalidation, audit records, and all Workspace entry/exit actions.

### Acceptance
A patient can move through the existing operational/clinical chain without Workspace creating a competing workflow.

---

# 2. ROLE

### Approved decision
Role represents job/function. Role is not Clinical/Operational/Administration, not Workspace, and not permission. Permissions can extend outside primary classification without changing Role/classification.

### Engineering obligations
- Role may provide defaults/templates only.
- Effective permissions are the actual authorization source.
- Workspace resolution must not be `Role = Workspace`.
- Sidebar Domain visibility must not be filtered by primary classification.
- Mixed-domain permissions must remain usable.

### Acceptance
A clinical user with financial permission still has the same primary Workspace and sees the authorized Financial Domain normally in Sidebar.

---

# 3. CLINIC ADMIN

### Approved decision
Clinic Admin is a distinct tenant administrative authority, not an ordinary user with a larger permission set.

### Engineering obligations
- Keep Clinic Admin administration center intact.
- Do not force Clinic Admin through ordinary-user Workspace behavior.
- Preserve user/Role/permission/Workspace/Domain administration.
- Preserve clinic-wide oversight and configuration.
- Preserve the open test Clinic Admin account's ability to test the subscribed system during implementation.

### Acceptance
Ordinary-user changes cannot accidentally remove Clinic Admin administration capability, and Clinic Admin is not reduced to an ordinary user's Workspace surface.

---

# 4. WORKSPACE

### Approved decision
Workspace is a user's work environment. It is not Role, permission set, Patient Flow, or a security boundary. Its internal functional environments are Clinical, Operational and Administration, but those names must not be forced into the ordinary user's visible identity.

### Engineering obligations
- Maintain one canonical Workspace system.
- Resolve a deterministic default/assigned context.
- Separate internal classification from user-facing label.
- Make daily work genuinely different by work context.
- Do not duplicate Domain logic in Workspace.
- Do not infer authorization from Workspace.
- Preserve Workspace as a work surface rather than a generic dashboard.

### Acceptance
An ordinary user experiences "Workspace" as their work environment, while the system internally knows the relevant functional context.

---

# 5. MY WORKSPACE

### Approved decision
My Workspace is the user's personal working surface within the assigned/default Workspace. It is not a second Workspace.

### Engineering obligations
- Provide system-selected default Widgets.
- Defaults emphasize action/executive daily work.
- Permit useful informational Widgets.
- Support add/remove/show/hide/reorder as supported.
- Support drag-and-drop ordering.
- Support continuous vertical scrolling.
- Preserve intended Widget sizes.
- Provide reset/restore defaults.
- Scope presentation persistence correctly by user/surface/context.
- Never change authorization through personalization.

### Acceptance
A user can customize their working surface and reload without losing configuration, while authorization remains exactly unchanged.

---

# 6. WIDGETS

### Approved decision
Widget = interface to a capability/useful information. Widget is not authorization.

### Engineering obligations
Every Widget record must map to:

- capability/domain;
- effective permission(s);
- entitlement/feature dependency if applicable;
- type;
- supported context;
- default status;
- size;
- action;
- destination;
- patient/visit context dependency if any;
- AR/EN labels;
- loading/empty/error states;
- unauthorized behavior.

Required classes:

- Information;
- Action;
- Operational;
- Contextual;
- Quick Action;
- Full-page capability;
- No-Widget capability.

### Permission matrix

`Read → information/read actions only`

`Create/Write → corresponding create action`

`Edit/Modify → corresponding additional modification actions`

`No relevant permission → normally absent`

Locked presentation is allowed only when useful and must not imply access.

### Acceptance
No Widget can perform an action that the underlying capability and effective permission do not allow.

---

# 7. HOME — INCLUDING HOME INFORMATION/WIDGET SURFACES

### Approved decision
Home is the post-login landing page and is not Workspace.

### Minimum content requirements from the approved user scenario
Home must be capable of presenting useful daily clinic context, including as applicable:

- today's appointments / appointment counts;
- patients currently waiting / daily activity summary;
- reminders;
- notifications;
- internal messages/communications;
- Patient Portal information;
- Work Center information;
- other general daily clinic context;
- optional utility information such as clock/weather only where retained by final product design.

### Engineering obligations for every Home Widget/information card

For each candidate Home element define:

1. authoritative data source;
2. owning Domain/service;
3. required permission;
4. tenant scope;
5. refresh/invalidation trigger;
6. whether it is informational or actionable;
7. destination if actionable;
8. whether action belongs in Workspace/Domain instead;
9. loading state;
10. empty state;
11. error/stale-data state;
12. Arabic/English label/content;
13. mobile behavior;
14. accessibility;
15. relationship to Patient Flow where applicable.

### Important boundary
Home must not become a second operational Workspace or a hidden workflow controller.

Quick Registration and Quick Appointment are not automatically Home items merely because they are useful. Their placement must be determined by the approved Widget/Workspace model and the existing capability owner.

### Acceptance
After login the user lands on Home and receives daily context without Home taking ownership of operational or clinical workflow.

---

# 8. HEADER + GLOBAL SEARCH

### Approved decision
Global Search is a system-wide search capability presented as a header search bar. It is neither a Home Widget nor Workspace.

### Header obligations
Preserve the approved global shell containing, as applicable:

- Search;
- language control;
- user display name/identity presentation;
- system branding/logo;
- existing approved shell controls.

### Search record classes
Where corresponding Domains exist and expose searchable records, support:

- Patients/identifiers;
- doctors/staff;
- appointments;
- invoices/payments;
- financial plans/installments;
- treatment plans;
- services/procedures;
- inventory;
- suppliers/purchase orders;
- tasks/requests;
- communications;
- events;
- other authorized searchable records.

### Search engineering obligations
- One coherent global search entry point.
- Authorization at query/data layer.
- Tenant isolation.
- No leakage via autocomplete, counts, snippets, ranking, recent results or metadata.
- Result type/context identification.
- Direct navigation to authorized record context.
- Arabic/English behavior.
- Loading, empty, no-result, unauthorized, partial/error states.
- Mobile/header responsiveness.
- Reuse existing search/data infrastructure where viable.
- No duplicate search engine without proof of necessity.

### Acceptance
From any major authenticated surface, an authorized record can be found without the user knowing which Domain owns it, and an unauthorized record cannot be inferred from search behavior.

---

# 9. SIDEBAR / NAVIGATION

### Approved order for ordinary users

`Home → Workspace → My Workspace → authorized Modules/Domains → My Settings`

### Engineering obligations
- Sidebar is complete authorized navigation, not a Workspace shortcut list.
- Primary classification does not suppress an authorized Domain.
- Authorized external Domains retain their normal names.
- Do not create `My Financial`, `My Agenda`, etc. as artificial duplicates.
- Patient Flow is not a standalone ordinary-user Sidebar item.
- Sidebar is not a security boundary.
- Route-level authorization remains mandatory.
- Do not remove a capability solely because its current location is inconvenient; first establish its natural surface.
- Remove/reconcile only proven duplicate/obsolete navigation registrations.

### Acceptance
A user with authorized Patients + Agenda + Billing sees all three as normal Domains regardless of primary classification, while unauthorized Domains remain absent/inaccessible.

---

# 10. MY SETTINGS

### Approved decision
My Settings is personal account/preferences, not My Workspace.

### Required behavior
- Edit display name, not immutable user ID.
- Change password through the existing secure authentication flow.
- Add/change personal profile image using existing storage/security architecture.
- Other user-level preferences already supported by the platform.

### Acceptance
Changes affect the user's personal account presentation/settings and do not modify Workspace authorization or Domain access.

---

# 11. CLINICAL WORKSPACE

### Approved decision
Clinical Workspace evolves the previous doctor/provider board into a clinical-team working surface.

### Required visible working context
When relevant and authorized:

- patient information;
- current visit/session context;
- required clinical work/procedures;
- reports;
- medical images/files;
- medical record context;
- permitted clinical actions;
- completion/handoff action.

### Engineering dependency chain

`Patient Flow state + Visit/session context + required work + Room/Procedure context + effective permission → clinical work surface`.

### Boundary
Visit, Room, Procedure, Service Catalog, Treatment Plan, Medical Photos, Follow-up and other clinical domain logic remains owned by those domains. Workspace integrates them; it does not reproduce their business logic.

### Acceptance
Clinical team members other than physicians can receive the appropriate clinical work without the system hard-coding "doctor" as the universal owner of clinical work.

---

# 12. OPERATIONAL WORKSPACE

### Approved decision
Operational Workspace supports daily operational/reception work and integrates with Patient Flow/Queue.

### Engineering obligations
- Present actual operational work.
- Integrate with Queue/Patient Flow state.
- Support handoff to clinical work.
- Support return from clinical `pending_close` to operational/reception work.
- Do not create duplicate Patients/Agenda/Billing mini-apps.

### Acceptance
Reception can see and act on the work required at the current point in the patient flow without needing to operate the clinical Workspace as a substitute.

---

# 13. PATIENT CONTEXT / CROSS-DOMAIN INTEGRATION

### Approved decision
Patient Context is a presentation/orchestration mechanism, not a Domain.

### Required contextual destinations where authorized
- Patient;
- Visit;
- Appointment;
- Treatment Plan;
- Financial Plan;
- Payments/Installments;
- Follow-up;
- Communication;
- Medical records/files/photos;
- Portal-related information;
- resources/consumption where owned by a Domain.

### Engineering obligations
- Preserve Domain ownership.
- Preserve route/action authorization.
- Preserve tenant isolation.
- Maintain patient/visit context when navigating where appropriate.
- Avoid unnecessary return-to-list navigation.
- Do not create a second patient-data store.

---

# 14. INTEGRATION RELATIONSHIP MATRIX

| Element | Depends on | Must not own | Must update/reflect |
|---|---|---|---|
| Home | daily authoritative data, permissions | workflow state machine | current daily context |
| Global Search | authorized searchable domain data | domain business logic | current authorized results |
| Sidebar | effective authorization + navigation registry | security itself | available Domains |
| Workspace | primary work context + permissions + workflow context | Patient Flow state machine | current work |
| My Workspace | Workspace + Widget catalogue + user presentation state | authorization | personal arrangement |
| Clinical Workspace | Patient Flow + Visit/session + clinical capability | Visit/Procedure business logic | clinical work/handoff |
| Operational Workspace | Patient Flow + operational domains | Queue state machine | operational work |
| Widget | capability + permission | authorization | capability state |
| Patient Context | authorized patient/visit context | Domain ownership | contextual navigation |
| My Settings | user account | Workspace configuration | personal account data |
| Clinic Admin | tenant administration architecture | ordinary-user Workspace semantics | tenant configuration/oversight |

---

# 15. IMPLEMENTATION ORDER

1. Freeze this coverage matrix as the completeness checklist.
2. Inspect current shell, routes and navigation.
3. Inspect current Workspace resolution and membership.
4. Inspect Widget registry, persistence and renderer.
5. Inspect Home and current Home widgets/data sources.
6. Inspect Global Search infrastructure and all searchable Domain sources.
7. Inspect Sidebar authorization and Domain registry.
8. Inspect My Settings.
9. Inspect Queue/Patient Flow transition authority.
10. Inspect Visit/session/clinical/room/procedure integration points.
11. Inspect Clinic Admin routes and permissions.
12. Inspect database/RLS/migrations for all affected surfaces.
13. Produce file-by-file change list.
14. Implement only approved changes.
15. Validate every matrix row end-to-end.
16. Validate ordinary users, mixed permissions and Clinic Admin separately.
17. Validate Arabic/English and responsive behavior.
18. Validate production/runtime behavior.
19. Only after successful validation remove proven obsolete duplicates.
20. Update documentation and close.

---

# 16. COMPLETENESS GATE

The work is BLOCKED from closure if any of the following is unverified:

- Home;
- Home daily information/widgets;
- Header;
- Global Search;
- Sidebar;
- Workspace;
- My Workspace;
- Widgets and personalization;
- My Settings;
- Clinical Workspace;
- Operational Workspace;
- Patient Flow;
- Queue/handoff;
- Patient Context;
- Domain integrations;
- permissions;
- tenant isolation;
- Clinic Admin separation;
- database/persistence;
- i18n/RTL/LTR;
- mobile/responsive behavior;
- loading/empty/error states;
- runtime regression.

**No partial implementation may be reported as complete.**

---

# 17. SCOPE LOCK

This matrix does not authorize redesign of unrelated CORE SYSTEM architecture. Existing architecture outside the 2026-09-01 decision set remains unchanged unless an actual dependency is discovered. Such dependency must be documented rather than silently changed.

**End of Complete Decision Coverage Matrix.**
