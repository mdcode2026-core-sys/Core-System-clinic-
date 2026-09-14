# CORE SYSTEM — Integrated Experience Work Contract
## 2026-09-14

**Status:** BINDING EXECUTION CONTRACT — OPEN
**Scope:** Login + Header + Home + Home→Workspace transition + shared experience foundation
**Authority:** Experience Constitution + Decision Registry

## 1. Purpose

This contract turns the approved experience foundation into an executable control system. It exists to prevent the recurring failure mode where established UX/architecture decisions are rediscovered but lost during implementation.

It does not close the work. It remains OPEN until its obligations are implemented and verified.

## 2. Mandatory lifecycle

**VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE**

No implementation item is complete merely because it is documented. No runtime fix is closed without objective verification.

## 3. Mandatory pre-flight

Before implementation, record:

- current repository state;
- current runtime behavior where available;
- applicable Decision Registry IDs;
- OPEN decisions;
- affected files/routes/components;
- authoritative existing systems to reuse;
- duplicate-engine risks;
- explicit non-changes;
- whether any Product Owner decision is required.

An OPEN product/visual decision may not be invented by implementation.

## 4. Workstream F1 — Login

Target: simple, calm, clear, confident Horizon-dominant Login.

Preserve authentication authority, language selection, reset/register behavior where applicable, accessibility, and keyboard behavior.

Do not import authenticated Header/Sidebar or create a second auth architecture.

**Status: OPEN.**

## 5. Workstream F2 — Header

Target: polished, persistent global shell that is modern, professional, clean, calm, usable, and medically credible.

Preserve Search, Communications, Chat, Notifications, Quick Actions, authorization, RTL/LTR, and responsive behavior.

Do not turn Header into a dashboard, module directory, second communication/notification engine, or authorization boundary.

**Status: OPEN.**

## 6. Workstream F3 — Home

Target: coherent **Simple + Contextual** global starting/awareness surface.

Remove from Home:

- Notifications
- Communications
- Work Center
- Quick Actions
- Patient Portal information

Keep widgets/personalized widgets deferred.

Home must not duplicate specialist work engines or become a scattered dashboard/card grid.

**Status: OPEN.**

## 7. Workstream F4 — Home → Workspace transition

Target: entering Workspace should feel like entering work mode.

The exact visual treatment is OPEN and requires Product Owner approval before closure.

**Status: OPEN.**

## 8. Routing invariant

Today's appointments must preserve relevant user/context when entering Agenda. A generic route that discards intended context is an implementation defect.

Agenda remains authoritative. No second scheduling engine may be introduced.

## 9. Visual implementation boundary

Infrastructure may be made reusable when neutral and compatible with the approved model.

Implementation must not silently lock final:

- colors,
- typography,
- spacing,
- dimensions,
- radius/border/elevation language,
- Home ordering,
- Header grouping,
- token semantics,

unless explicitly approved.

## 10. Required evidence

For each workstream record:

- changed files and reason;
- satisfied Decision IDs;
- decisions intentionally left OPEN;
- exact automated validation results;
- runtime evidence;
- responsive findings;
- RTL/LTR findings;
- accessibility findings;
- visual approval where required;
- residual issues.

## 11. Acceptance matrix

| Area | Acceptance condition |
|---|---|
| Login | Clear, calm, aligned, accessible, authentication unchanged |
| Header | Persistent, coherent global shell; functions remain semantically distinct |
| Home | Simple + Contextual; approved removals absent; authoritative routing preserved |
| Home identity | Clinic/user identity is clear without dominating work |
| Daily awareness | Coherent hierarchy, not scattered dashboard |
| Appointment routing | Relevant context preserved entering Agenda |
| Mobile | Focused work surface, not desktop shrink |
| Tablet | Conceptual hierarchy preserved |
| RTL/LTR | Semantic and visual order correct |
| Accessibility | Focus, keyboard, labels, touch targets, and state communication verified |
| Shared foundation | No duplicate engines or unauthorized semantics |

## 12. Prohibited shortcuts

The following do not constitute closure:

- documentation-only completion;
- green CI without required runtime visual verification;
- source review that assumes visual correctness;
- screenshot evidence without comparison to approved decisions;
- PR description claiming completion while Registry items remain OPEN;
- silently changing a visual decision to avoid a blocker;
- closing a document because execution is inconvenient.

## 13. Change-control protocol

If implementation conflicts with an approved decision:

1. identify the Decision ID;
2. identify the conflict;
3. do not implement the conflicting behavior;
4. resolve technically if no product judgment is required;
5. otherwise return the decision to the Product Owner;
6. update the Registry only after explicit approval;
7. continue implementation.

## 14. Closure protocol

The Experience Foundation cannot close until:

- required Product Owner visual decisions are approved;
- Login/Header/Home match approved decisions;
- Home → Workspace transition is verified;
- automated validation passes;
- runtime desktop/tablet/mobile verification passes;
- RTL/LTR verification passes;
- accessibility checks pass;
- no known contract violation remains;
- Decision Registry is updated with evidence;
- affected supporting documents are reconciled;
- exact reviewed implementation head is identified.

**Overall status: NOT CLOSED.**
