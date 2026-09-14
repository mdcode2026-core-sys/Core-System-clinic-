# CORE SYSTEM — Integrated Experience Work Contract
## 2026-09-14

**Status:** BINDING EXECUTION CONTRACT — OPEN
**Scope:** Login + Header + Home + Workspace transition + shared experience foundation
**Authority:** `CORE-SYSTEM-EXPERIENCE-CONSTITUTION-2026-09-14.md` + `CORE-SYSTEM-EXPERIENCE-DECISION-REGISTRY-2026-09-14.md`

## 1. Purpose

This contract converts the approved experience foundation into an executable, verifiable control system.

It exists specifically to prevent a recurring failure mode: discovering the same UX/architecture principles repeatedly and then losing them during implementation.

This contract does not close the work. It remains OPEN until its implementation decisions and acceptance gates are completed.

## 2. Mandatory execution sequence

Every work item in scope follows:

**VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE**

A phase may not be marked closed merely because code exists, tests are green, or a document has been written.

## 3. Pre-flight gate — mandatory before implementation

The implementation owner must produce an evidence-based pre-flight record containing:

1. current repository state,
2. current relevant runtime behavior where available,
3. applicable Decision Registry IDs,
4. applicable OPEN decisions,
5. files/components/routes affected,
6. existing authorities to reuse,
7. risks of creating duplicate semantics/engines,
8. explicit confirmation that no approved decision is being changed.

If an OPEN product/visual decision is encountered, implementation must not invent the decision. The work stops only for that decision; unrelated technical blockers must be resolved normally.

## 4. Foundation workstreams

### F1 — Login

Objective: make Login the simplest expression of the CORE SYSTEM experience while retaining the correct authentication architecture.

Must preserve:

- authentication authority,
- password/reset behavior,
- language selection,
- registration behavior where applicable,
- accessibility and keyboard behavior.

Must not:

- import authenticated Header/Sidebar into Login,
- introduce a second auth architecture,
- become marketing-heavy or visually overdesigned.

Status: **OPEN**

### F2 — Header

Objective: establish the persistent global shell as a polished, calm, professional, medically credible global access layer.

Must preserve:

- existing Search authority,
- existing Communications authority,
- Chat as compact Communications surface,
- Notifications authority/feed behavior,
- Quick Actions scope,
- authorization,
- RTL/LTR,
- responsive capability.

Must not:

- become a dashboard,
- become a module directory,
- become a second communications/notification engine,
- hide authorized capability solely due to viewport width.

Status: **OPEN**

### F3 — Home

Objective: establish Home as the system's simple, contextual, coherent starting surface.

Must preserve:

- tenant/authentication boundaries,
- authorization-aware content,
- authoritative domain routes,
- clear awareness → action flow.

Must remove from Home:

- Notifications,
- Communications,
- Work Center,
- Quick Actions,
- Patient Portal information.

Widgets/personalized widgets remain deferred.

Must not:

- become a scattered dashboard/card grid,
- duplicate Agenda, Communications, Notifications, Work Center, or Workspace engines,
- silently invent final ordering or visual tokens.

Status: **OPEN**

### F4 — Home → Workspace transition

Objective: make entering Workspace feel like entering work mode rather than merely changing pages.

Must preserve surface boundaries and authorization.

Status: **OPEN**

## 5. Technical routing invariant

Today's appointments must route to Agenda with the user's intended/relevant context. The current generic `/agenda` behavior is a known implementation defect where it discards context.

Fixing this defect must not create a second scheduling engine.

## 6. Visual implementation rule

The constitution governs experience principles, not unapproved pixel values.

Therefore implementation may establish reusable infrastructure only when it is neutral and compatible with the approved model. It must not silently lock:

- final color palette,
- final typography scale,
- final spacing system,
- exact component dimensions,
- exact border/radius/elevation language,
- final Home ordering,
- final Header grouping,

unless those details have been explicitly approved.

## 7. Required evidence after implementation

For each foundation workstream record:

- changed files,
- why each change was required,
- Decision Registry IDs satisfied,
- decisions intentionally left OPEN,
- tests executed and exact results,
- runtime verification results,
- screenshots/evidence where visual validation is required,
- accessibility findings,
- responsive findings,
- RTL/LTR findings,
- known residual issues.

## 8. Acceptance matrix

| Area | Acceptance condition | Closure required |
|---|---|---|
| Login | Clear, calm, aligned, accessible, authentication unchanged | Product Owner visual approval + runtime verification |
| Header | Persistent, coherent global shell; independent global functions remain clear | Product Owner visual approval + runtime verification |
| Home | Simple + Contextual; removed surfaces absent; authoritative routing preserved | Product Owner visual approval + runtime verification |
| Home identity | Clinic/user identity is clear without dominating work | Product Owner visual approval |
| Daily awareness | Coherent hierarchy, not scattered dashboard | Product Owner visual approval + runtime verification |
| Appointment routing | Relevant context preserved when entering Agenda | Automated + runtime verification |
| Mobile | Focused work surface; no desktop-shrink failure | Runtime verification |
| Tablet | Conceptual hierarchy preserved | Runtime verification |
| RTL/LTR | Semantic and visual order remain correct | Runtime verification |
| Accessibility | Focus, keyboard, labels, touch targets and state communication verified | Objective evidence |
| Shared foundation | No duplicate engines or unauthorized semantics | Code review + tests |

## 9. Prohibited completion shortcuts

The following do not constitute closure:

- documentation-only completion,
- green CI without runtime visual verification when visual behavior is in scope,
- a source-code review that assumes visual correctness,
- a screenshot without comparison to approved decisions,
- a PR description claiming completion while Registry items remain OPEN,
- changing a visual decision silently to avoid a blocker,
- closing a document because a phase is inconvenient to continue.

## 10. Change-control protocol

If an implementation request conflicts with an approved decision:

1. identify the exact Decision Registry ID,
2. identify the conflict,
3. do not implement the conflicting behavior,
4. resolve technically if no product judgment is required,
5. otherwise return the decision to the Product Owner,
6. update the Registry only after explicit approval,
7. then continue implementation.

## 11. Closure protocol

The Experience Foundation cannot be marked closed until:

- all required Product Owner visual decisions are approved,
- Login/Header/Home implementations match those decisions,
- Home → Workspace transition is verified,
- automated validation passes,
- required runtime validation passes,
- responsive and RTL/LTR checks pass,
- accessibility checks pass,
- no known contract violation remains,
- Decision Registry statuses are updated accurately,
- supporting documents are reconciled,
- the exact reviewed implementation head is identified.

Until then:

**OVERALL STATUS = NOT CLOSED.**
