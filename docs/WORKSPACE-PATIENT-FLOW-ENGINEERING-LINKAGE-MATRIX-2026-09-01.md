# CORE SYSTEM — WORKSPACE / PATIENT FLOW ENGINEERING LINKAGE MATRIX
## Architecture → UX/IA → Engineering → Execution → Runtime Preservation Map
### 2026-09-01

**Status: DRAFT FOR REVIEW — NOT AN IMPLEMENTATION AUTHORIZATION**

> This document is a traceability and reconciliation artifact. It does not create, delete, supersede, or authorize any product/architecture decision by itself. It translates the approved architectural decisions and the user's explicit ordinary-clinic-user daily workflow into an engineering linkage map. Any unresolved conflict is recorded rather than resolved by invention.

## 0. Scope and governing boundary

This matrix is specifically concerned with the decisions in:

`ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`

and the following explicit operating model for an **ordinary clinic user**:

`LOGIN → HOME → WORKSPACE → MY WORKSPACE → AUTHORIZED MODULES/DOMAINS → MY SETTINGS`

The ordinary-user model **does not apply to Clinic Admin**. Clinic Admin is explicitly excluded from this flow and must retain its separate administrative model.

The matrix must preserve the distinction between:

- Patient Journey
- Patient Flow
- Work classification
- Role
- Permission / effective permission
- Workspace
- My Workspace
- Module / Domain
- Widget
- Home
- My Settings
- Global Search
- Queue / operational state
- Clinical visit / medical work

No concept may be collapsed merely because another implementation appears simpler.

## 1. Source-of-authority rules used by this matrix

1. The 2026-09-01 approved architecture document is the direct authority for the decisions it explicitly contains.
2. Existing architecture and engineering documents are evidence of prior decisions and implementation contracts; they are not silently deleted or treated as wholly invalid when only one decision conflicts.
3. A conflicting individual decision is classified as **CONFLICT / REQUIRES SUPERSESSION**, while unrelated material in the same document remains preserved.
4. Existing working workflow is preserved by default: Inspect → Reuse → Extend → Create only when genuinely required.
5. No route, component, database object, state, module, domain, or workflow may be removed solely because its surrounding document contains a superseded decision.
6. This matrix does not invent missing product decisions. Where the architecture specifies a boundary but engineering detail is absent, the status is **ENGINEERING GAP**, not an invented implementation.

## 2. Canonical ordinary-user experience

| Order | User-visible element | Architectural meaning | Must NOT be confused with | Engineering linkage required |
|---|---|---|---|---|
| 1 | Login | Authentication entry | Workspace / Role | Auth → tenant/user context |
| 2 | Header | Global shell | Home / Workspace | Search, language, user identity, system branding |
| 3 | Home | Clinic/system daily information context | Workspace / My Workspace | Daily information; generally non-executive/non-primary execution surface |
| 4 | Workspace | Functional work environment determined by work classification/default assignment | My Workspace / Role / Permission / Patient Flow | Must open the appropriate functional workflow surface |
| 5 | My Workspace | Personal widget work surface inside the assigned/default Workspace | Workspace / My Settings | Default useful widgets + user personalization within granted capabilities |
| 6 | Modules / Domains | Full authorized domain surfaces | Workspace / Widget | Effective permissions determine access and actions |
| 7 | My Settings | Personal account/preferences | My Workspace / work permissions | User-level settings only |

## 3. Work classification → Workspace

| Decision | Required interpretation | Evidence / linkage target | Status |
|---|---|---|---|
| Clinical / Operational / Administration are work classifications | They describe the user's primary work area; they are not Roles and not permission sets | Workspace architecture + role/permission architecture | **ALIGNED** |
| Classification provides default Workspace | The user's assigned/default classification selects the appropriate functional Workspace | Workspace architecture / user assignment model | **ALIGNED ARCHITECTURALLY; ENGINEERING TRACE REQUIRED** |
| Workspace is genuinely different daily work | Clinical, Operational, Administration must not be three labels over one generic dashboard | ClinicalWorkspace / OperationWorkspace / administration surface | **ALIGNED IN EXISTING WORKSPACE ARCHITECTURE; UX RECONCILIATION REQUIRED** |
| Extra permissions do not change primary classification | A user can receive additional permissions without changing their primary work environment | Effective permission model | **ALIGNED** |

## 4. Clinical Workspace — required daily workflow

For a user assigned a medical function, the Workspace must support the medical portion of the patient workflow after operational handoff.

Required conceptual sequence:

`Operational handoff / waiting → Clinical Workspace → patient medical context → examination/procedures/actions → finish clinical work → pending_close → return to operational/reception workflow`

It must **not** be interpreted as:

`Clinical Workspace → completed visit`

The clinical user completes the clinical portion; the operational workflow completes the broader patient-flow process.

### Required clinical surface contents from the user's explicit model

- Patient information/context.
- Procedures/actions required or available to the clinician.
- Medical reports.
- Medical photos/files where authorized.
- Access to the patient's clinic medical record where authorized.
- Examination actions.
- Clinical procedure/action recording.
- Clinical completion action that hands the patient back to the operational/reception workflow.

### Engineering linkage

Existing Clinical Workspace and Queue/visit state structures must be inspected and reused. The matrix does not authorize replacing them with a new workflow.

## 5. Operational Workspace — required daily workflow

Operational Workspace is the environment for the clinic's operational work around patient movement and handoffs, including reception/queue responsibilities.

Required linkage:

`patient arrival / operational work → waiting → handoff to clinical → pending_close return → operational completion`

The exact operational actions must continue to be driven by the existing Queue/Patient Flow contract rather than duplicated in a second workflow engine.

## 6. Administration work classification

Administration is a work classification for ordinary clinic users whose primary work is administrative. It is not the same thing as Clinic Admin.

**Critical boundary:**

`Administration work classification ≠ Clinic Admin`

Clinic Admin is explicitly outside the ordinary-user Workspace model defined here and retains tenant-level administrative authority.

## 7. My Workspace — widget contract

My Workspace is the user's personal working surface inside the assigned/default Workspace.

### Required behavior

1. The system supplies default widgets selected from important granted capabilities/permissions.
2. Defaults are not final or immutable.
3. The user may show/hide/reorder/add available widgets as supported.
4. Personalization cannot grant authorization.
5. A widget must respect the user's effective permission level/type.
6. A read-only permission cannot expose a write/edit action.
7. Create/write access can expose creation actions without silently exposing edit/higher actions.
8. Edit/higher access can expose the corresponding actions.
9. If no relevant permission exists, the capability is normally absent; intentional locked presentation is only a presentation choice and never authorization.

### Linkage

`Effective Permissions → available capabilities → eligible widgets → user personalization → My Workspace`

No separate widget authorization engine is permitted.

## 8. Modules / Domains contract

After Workspace/My Workspace, authorized Modules/Domains remain complete domain surfaces.

Examples are not exhaustive; `Patients` is one example.

A Module/Domain shown to the user:

- remains a general domain/module,
- is not renamed into artificial `My <Domain>` concepts merely because it is personalized by access,
- is governed by effective permissions,
- exposes read/create/edit/higher actions only according to the actual permission level.

Workspace does not replace Modules/Domains.
My Workspace does not replace Modules/Domains.
Widgets do not replace Modules/Domains.

## 9. Home contract

Home is the clinic/system-level landing information surface after login.

The user's explicit examples include:

- patients waiting,
- today's appointments,
- reminders/alerts concerning today's work,
- notifications/messages,
- useful general clinic daily context,
- clock/weather widgets as examples,
- other general information approved in later detailed design.

Home is **not** the user's Workspace and is generally not the primary execution surface for the user's assigned work.

If an implementation uses a shared renderer internally, that implementation detail must not collapse the product concepts `Home` and `Workspace`.

## 10. Header / Global Search

Header-level elements are global shell concerns:

- system branding/logo,
- global search bar,
- language control,
- current user identity.

Global Search is system-wide, authorization-constrained, and is not a Home widget, Workspace, or Module/Domain.

## 11. Sidebar contract for ordinary clinic users

Canonical order:

```text
Home
Workspace
My Workspace
──────────────
Authorized Modules / Domains
──────────────
My Settings
```

`Patient Flow` must not be introduced as a standalone Module/Domain item for ordinary clinic users merely because Patient Flow exists architecturally.

Patient Flow remains a real workflow concept and must remain available to the appropriate workflow surfaces/context.

## 12. Patient Flow / Queue / Clinical handoff linkage

Patient Flow is the internal workflow concept. Queue is the operational state mechanism used to coordinate patient movement through the workflow.

Existing canonical clinical/queue states identified in the repository include:

`waiting → in_consultation → pending_close → completed`

with cancellation/no-show as separate terminal outcomes where already defined.

For the clinical handoff:

`waiting → in_consultation → pending_close`

belongs to the clinical portion, while:

`pending_close → completed`

returns to operational/reception responsibility.

This preserves the user's explicit distinction:

> The clinician finishes the examination/clinical work, not the entire visit/patient-flow completion.

## 13. Role / Permission / Classification / Workspace relationship

```text
Role
  = job/function

Primary work classification
  = Clinical / Operational / Administration work area

Effective permissions
  = what the user is actually authorized to read/create/edit/etc.

Workspace
  = functional environment for the user's primary work area

My Workspace
  = personal widget surface within that environment

Modules / Domains
  = complete authorized domain surfaces

Widgets
  = presentation/action entry points constrained by effective permission
```

No layer may become the authorization source for another layer merely by UI convenience.

## 14. Clinic Admin boundary

The ordinary-user flow in this document is explicitly **NOT** the Clinic Admin flow.

Clinic Admin remains the tenant-level administrative authority and can manage clinic-level users, roles, permissions, configuration, modules/domains and other administrative capabilities permitted by the platform.

The test Clinic Admin account's broader visibility during implementation is a separate implementation/test concern and must not be used to infer the ordinary-user Sidebar or Workspace model.

## 15. Engineering artifact linkage matrix

| Architectural concern | Existing artifact family to inspect/reuse | Required verification | Forbidden shortcut |
|---|---|---|---|
| Workspace | Workspace architecture + ClinicalWorkspace + OperationWorkspace + related routes/components | Route, rendering, actions, assignment/default selection | Create a second Workspace engine |
| Patient Flow | Patient Flow architecture/board + workflow docs | Workflow states, handoffs, contextual access | Delete/rebuild because navigation changed |
| Queue | Queue engine/state model + queue UI | waiting/in_consultation/pending_close/completed transitions | Duplicate state machine |
| Clinical visit | Clinical visit/domain artifacts | Clinical actions and close semantics | Mark full visit completed from clinical close without operational handoff |
| My Workspace | Widget registry/persistence/personalization | Defaults, add/hide/reorder, permission filtering | Treat widgets as permissions |
| Modules/Domains | Existing domain routes/navigation | Visibility + effective permission behavior | Rename domains into artificial My-* surfaces |
| Home | Existing home route/components | Information-only/general daily context boundary | Make Home a disguised job Workspace |
| My Settings | Existing user settings route/components | Personal account settings | Put work widgets/permissions here |
| Global Search | Existing search/header artifacts | Authorized global search | Implement as a Home widget |
| Roles | Team/access architecture + role model | Role/function separation | Equate role with work classification |
| Permissions | Effective permission engine | Read/create/edit/higher enforcement | Create widget-based authorization |
| Clinic Admin | Admin center/admin routes | Separate admin experience | Apply ordinary-user flow to Clinic Admin |

## 16. Documentation conflict handling

The following rule applies to all older documents:

- If an older document agrees with the 2026-09-01 architecture, retain it as supporting authority/evidence.
- If one decision conflicts, mark only that decision as superseded/requires reconciliation.
- Preserve all unrelated decisions and implementation information in that document.
- Do not delete an entire document because of a partial conflict.
- Before changing code, create/update an engineering contract that maps the decision to every affected route/component/domain/state and explicitly identifies what must remain unchanged.

## 17. Known reconciliation points requiring explicit engineering treatment

These are not new decisions; they are traceability items surfaced by the comparison:

1. **Patient Flow navigation exposure:** older Global UX material permits Patient Flow as a Sidebar surface when enabled; the 2026-09-01 architecture explicitly removes it as a standalone Sidebar item for ordinary users. The conflict must be resolved at the individual decision level, while unrelated UX decisions remain preserved.
2. **Home vs Workspace:** some implementation paths use shared rendering infrastructure. The product concepts must remain distinct even if rendering infrastructure is shared.
3. **Workspace vs My Workspace:** Workspace is the functional job environment; My Workspace is the personal widget surface. Documentation and implementation must preserve both levels.
4. **Clinical completion vs visit completion:** clinical close must hand the patient back to operational workflow rather than silently completing the entire patient-flow process.
5. **Clinic Admin exception:** ordinary-user navigation/workspace assumptions must not be applied to Clinic Admin.
6. **Existing modules/domains:** changes to navigation must not remove already implemented authorized domain surfaces merely because their placement changes.

## 18. Acceptance trace — ordinary medical user

A future validation pass must be able to demonstrate, without inventing new product behavior:

1. User logs in with clinic credentials.
2. Header shows global search, language, branding, and user identity.
3. Home shows general clinic daily context rather than becoming the medical Workspace.
4. Sidebar exposes Home → Workspace → My Workspace → authorized Modules/Domains → My Settings.
5. Workspace opens the user's medical functional environment.
6. A patient handed over from operational waiting can enter the clinical work state.
7. Clinical Workspace exposes authorized patient/medical context and clinical actions.
8. Clinical work ends in the defined clinical handoff state (`pending_close` where applicable), not premature full completion.
9. Operational/reception workflow can receive the patient back and complete the appropriate operational step.
10. My Workspace contains useful default widgets and allows permitted personalization.
11. Widget actions never exceed effective permissions.
12. Authorized Modules/Domains remain accessible as full domain surfaces according to permissions.
13. My Settings contains personal account settings and is not used as a work surface.
14. Patient Flow remains operationally real even though it is not exposed as a standalone ordinary-user Sidebar Module/Domain.
15. Clinic Admin is tested separately and is not judged against this ordinary-user flow.

## 19. Final status

**This matrix is a linkage/reconciliation baseline, not a code-change authorization.**

Before implementation changes are made, every row marked `ENGINEERING TRACE REQUIRED`, `UX RECONCILIATION REQUIRED`, or `CONFLICT / REQUIRES SUPERSESSION` must be mapped to concrete existing repository artifacts and acceptance tests. No artifact should be deleted merely because a decision within its source document has been superseded.

**End of Matrix.**
