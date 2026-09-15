# CORE SYSTEM — Integrated Experience Constitution
## Experience Foundation + Experience Presentation
### 2026-09-16

**Status:** APPROVED INTEGRATION — IMPLEMENTATION / VERIFICATION OPEN  
**Authority:** Product Owner-approved Experience decisions, Concept 01 — Clinical Precision, and the existing Experience Foundation / Presentation System records  
**Applies to:** CORE SYSTEM experience behavior and presentation across Login, Header, Home, Workspace, My Workspace, clinical, operational, administrative, financial/resource, communication, analytics, reporting and settings surfaces.

---

## 1. Purpose

This document integrates the two previously separated execution layers:

1. **Experience Foundation** — what the CORE SYSTEM experience is, how its major surfaces behave, and which functional boundaries must remain protected.
2. **Experience Presentation** — how different kinds of work and information are presented clearly, compactly, responsively and consistently across the product.

The integration does **not** create a new UX concept, visual concept, navigation model, role model or domain architecture.

It creates one governing execution model so that **experience behavior and experience presentation are designed and implemented together** rather than as two sequential or competing systems.

The target is:

> **One CORE SYSTEM experience: behavior, information hierarchy, interaction and presentation expressed as one coherent system inside Concept 01 — Clinical Precision.**

---

## 2. What Is Being Merged

The previous relationship was effectively:

```text
Experience Foundation
        ↓
Visual / Presentation System
        ↓
Implementation
```

The integrated model is:

```text
Approved Product / UX Decisions
            ↓
Experience Constitution / Work Contract
            ↓
CORE SYSTEM Integrated Experience Constitution
       ┌──────────────┴──────────────┐
       ↓                             ↓
Experience Behavior           Experience Presentation
       │                             │
       └──────────────┬──────────────┘
                      ↓
              Surface Contracts
                      ↓
                Implementation
                      ↓
        VERIFY → REVIEW → CLOSE
```

Every surface must therefore answer both questions before implementation is considered complete:

- **Behavior:** What does this surface mean, own, route to, and allow?
- **Presentation:** How should that meaning and work be organized visually and responsively?

A presentation decision may never silently change the behavioral answer.

---

## 3. Protected Product Decisions

The following remain closed and are not reopened by this integration:

- Experience model: **Horizon + Vertex + Zenith**.
- Visual foundation: **Concept 01 — Clinical Precision**.
- Functional ownership, authorization, role meaning and workspace meaning.
- Patient Flow remains a workflow concept, not a sidebar domain.
- Patient Journey remains a separate authoritative journey system.
- Communications is clinic-wide internal communication for authorized clinic accounts; it is not doctor-only.
- Agenda remains the authoritative scheduling engine and calendar representation.
- Existing authoritative engines and data relationships must be reused before creating alternatives.
- Mobile transforms presentation; it does not remove authorized capability.
- RTL/LTR is native system behavior, not a screenshot-level adaptation.
- Home remains awareness/orientation rather than a duplicate Work Center, Notifications center, Communications center, Patient Portal center or personalized workspace.

No presentation refactor may alter these decisions.

---

## 4. Integrated Experience Principles

### 4.1 Meaning before decoration

Content meaning, task priority and state must remain understandable before visual decoration is considered.

### 4.2 Presentation follows work

CORE SYSTEM does not use one universal page composition. Presentation follows the work purpose, information density and decision requirements of the surface.

### 4.3 One visual language, many compositions

Concept 01 remains the common visual identity while surfaces may use different compositions such as queues, workbenches, lists, KPI groups, contextual panels or analytical layouts.

### 4.4 Action follows understanding

The user should be able to understand the current state and then identify the appropriate next action without unnecessary navigation or visual noise.

### 4.5 Context remains subordinate

Contextual information supports the current task. It must not become a duplicate authoritative domain surface.

### 4.6 Density follows work complexity

Login and Home remain calm. Agenda, Clinical Workspace, Work Center, Communications and other execution-heavy surfaces may become denser when that density improves the actual task.

### 4.7 Responsive behavior is part of the experience

Desktop, tablet and mobile are deliberate compositions of the same experience, not one desktop layout compressed through breakpoints.

---

## 5. Visual Foundation — Concept 01

All integrated presentation inherits **Concept 01 — Clinical Precision**.

### Core qualities

- calm;
- precise;
- professional;
- premium;
- clinical without medical clichés;
- light and visually quiet;
- deep ink with clinical azure and diagnostic cyan accents;
- neutral surfaces;
- typography and spacing as primary hierarchy tools;
- purposeful borders and restrained depth;
- disciplined radius;
- density that follows work complexity;
- native RTL/LTR behavior;
- intentional mobile transformation;
- independent Header controls;
- cards only where they improve comprehension or execution;
- gradients, glass, glow and decorative treatment are not default identity.

### Visual hierarchy

1. content meaning;
2. typography;
3. whitespace and grouping;
4. surface separation;
5. semantic color;
6. restrained depth;
7. decoration last.

### Visual primitives

- authenticated canvas: Slate 50 where applicable;
- primary content surface: White;
- quiet grouping: Slate 100;
- Ink-first typography;
- Clinical Azure for primary action/emphasis;
- Diagnostic Cyan for informational/diagnostic emphasis;
- Success / Warning / Error only for their semantic meanings;
- 4px spacing rhythm;
- disciplined radius family: 4 / 6 / 8 / 12 / 16px;
- restrained borders and elevation;
- clear focus-visible states.

The detailed primitive values remain defined by `docs/CORE-SYSTEM-VISUAL-DESIGN-CONSTITUTION.md`.

---

## 6. Integrated Surface Classification

Each surface must select a presentation pattern according to its work purpose.

| Surface | Integrated presentation pattern | Primary purpose |
|---|---|---|
| Login | Focused Surface | Authentication |
| Header | Global Control Rail | Global navigation/context/actions |
| Home | Context + KPI + Destination | Awareness/orientation |
| My Workspace | Personal Launchpad | Personal execution entry |
| Role Workspace | Work Surface | Role-based work |
| Patients | Record List + Context | Find/inspect/act on patient records |
| Agenda | Scheduling Workbench | Schedule/resource execution |
| Patient Flow / Queue | Process / Queue | State-based workflow |
| Treatment Plans | Longitudinal Clinical Surface | Longitudinal plan/progress |
| Clinical Workspace | Clinical Workbench | Clinical task execution |
| Communications | Conversation Workspace | Clinic-wide internal communication |
| Chat | Compact Interaction Surface | Focused communication interaction |
| Notifications | Attention Feed | Events requiring awareness/action |
| Work Center | Execution Queue | Owned work, exceptions and next actions |
| Workforce | Operations Dashboard | Workforce operations |
| Financial / Resources | Financial Work Surface | Financial/resource execution |
| Inventory | Control Workbench | Stock/resource control |
| Purchasing | Process + List | Ordered purchasing process |
| Insurance & Claims | Case Management | Case/claim workflow |
| Reports | Evidence Surface | Filtered evidence/records/export |
| Analytics | Analytical Surface | KPI/comparison/trend/drilldown |
| Dashboard | Executive Overview | High-level management state |
| Administration | Control Center | Administrative control |
| Settings | Configuration Workspace | Configuration and validation |

These are **presentation contracts**, not new navigation domains or functional authorities.

---

## 7. Reusable Information Indicators

Indicators/KPIs are system-wide patterns, not Home-only components.

A useful indicator may contain:

1. semantic label;
2. primary value;
3. optional unit;
4. contextual qualifier;
5. semantic icon;
6. optional trend/comparison;
7. optional status;
8. destination/action when actionable.

Every indicator should answer quickly:

> What is this? What is its current value? Does it need attention? What can I do next?

Do not turn every database count into a KPI.

### Responsive KPI behavior

- Desktop: horizontal strip or multi-column grid when useful.
- Tablet: reduced columns while preserving priority.
- Mobile: compact 2-column grid is preferred for four high-value indicators; larger sets require explicit justification.

Status uses **icon + label + semantic color + optional context**, never color alone.

Exact status vocabulary remains owned by each domain/surface contract.

---

## 8. Action Hierarchy

Actions are ranked by purpose:

- **Primary:** dominant action for the current task.
- **Secondary:** supporting actions.
- **Context:** actions on a selected record/item.
- **Global:** Header/account actions that remain independent.

On mobile, primary actions remain discoverable without requiring desktop-style horizontal toolbars. Secondary actions may move to menus/sheets when the surface contract permits.

Authorized actions may not disappear solely because the viewport is smaller.

---

## 9. Record and Context Presentation

Record-heavy surfaces use the representation most appropriate to the task:

- table for comparison/high-density operations;
- list for scanning;
- compact record card for mobile/low-width contexts;
- split view when list context should remain visible;
- contextual panel when detail can remain subordinate to the primary work surface;
- full detail surface when the task requires concentration.

Record summary priority:

1. identity;
2. state/status;
3. most important contextual fact;
4. time/date/ownership where relevant;
5. primary action;
6. secondary metadata.

Contextual panels must remain subordinate, task-relevant and non-duplicative of the authoritative domain surface.

---

## 10. Queue and Process Presentation

Queue/process surfaces must make visible:

- current state;
- identity;
- elapsed/target time where meaningful;
- owner/assignee;
- exception/attention state;
- next permitted action.

The established clinical flow remains:

```text
Queue → Clinical Visit → Pending Close → Reception Workflow → Completed
```

Presentation may transform by viewport, but state meaning and ownership cannot change.

Patient Flow remains a workflow authority and must not be visually converted into an ordinary dashboard or sidebar domain.

---

## 11. Scheduling Presentation

Agenda is a scheduling workbench, not a KPI dashboard.

Priority:

- time;
- resource/doctor/room context;
- appointment identity;
- status;
- schedule density;
- navigation/filtering;
- selected appointment context.

The existing Agenda/calendar representation remains authoritative. No duplicate `/calendar` scheduling engine may be introduced.

Mobile must use a focused day/time/resource representation rather than an unusable shrunken desktop calendar.

---

## 12. Clinical Presentation

Clinical surfaces require the highest clarity around patient identity and the active clinical task.

### Clinical Workspace

```text
Patient Context
      ↓
Current Clinical Task
      ↓
Required Clinical Information
      ↓
Actions / Save / Next Step
      ↓
Supporting Context
```

### Treatment Plans

```text
Patient Identity
      ↓
Plan Status / Progress
      ↓
Treatment Phases
      ↓
Sessions / Procedures
      ↓
Next Action
```

Progress indicators explain longitudinal state; they must not become decorative graphics.

---

## 13. Home and Workspace Boundary

### Home — awareness

```text
Identity / Context
        ↓
Today indicators
        ↓
Attention only when necessary
        ↓
Next destinations
```

Home remains calm and intentionally limited.

It must not become a duplicate Work Center, Notifications center, Communications center, Patient Portal center or personalized workspace.

### Workspace — execution

Workspace may be denser and more task-oriented because its purpose is active work.

The visual distinction must communicate a transition from **awareness → execution** without creating a duplicate workspace layer.

---

## 14. Communications, Chat and Notifications

### Communications

```text
Conversation list → Active conversation → Composer
```

Communications is clinic-wide internal communication for authorized clinic accounts.

### Chat

Chat is a compact interaction layer over the broader Communications capability where the existing contract allows it.

### Notifications

```text
What happened → When → Why it matters → Open / action
```

Notifications remain an Attention Feed and are not duplicated into Home merely for visual completeness.

---

## 15. Operational, Financial and Resource Surfaces

### Work Center

```text
Attention indicators
        ↓
Owned / due / overdue / exception work
        ↓
Execution queue
        ↓
Context + action
```

### Workforce

```text
Operational indicators
        ↓
Attendance / workforce state
        ↓
Employee/work records
        ↓
Context / management action
```

### Financial / Resource family

```text
Relevant indicators
        ↓
Primary records / transactions
        ↓
Status / exceptions
        ↓
Selected detail / action
```

The family shares presentation grammar without forcing identical dashboards onto invoices, payments, financial plans, insurance/claims, inventory, purchasing or expenses.

---

## 16. Analytics, Dashboard and Reports

These remain distinct.

### Dashboard
**Executive Overview:** concise high-level state and important indicators.

### Analytics
**Analytical Surface:** KPI → comparison → trend → drilldown/evidence.

### Reports
**Evidence Surface:** filtered records/evidence with table, export and detail operations.

Numbers alone do not make three surfaces equivalent.

---

## 17. Administration and Settings

### Administration — Control Center

Use grouped administrative capabilities, clear control entry points and administrative state where useful.

### Settings — Configuration Workspace

```text
Settings category
      ↓
Setting group
      ↓
Field / control
      ↓
State / validation
      ↓
Save / confirmation
```

Settings favor predictability over dashboard-like density.

---

## 18. Responsive Experience Constitution

### Desktop

Use horizontal space to establish hierarchy and reduce unnecessary vertical scrolling.

### Tablet

Use an intentional intermediate composition. Reduce columns and spacing before removing meaningful capability.

### Mobile

Mobile is a focused work surface, not a scaled desktop page.

Approved presentation transformations include:

- horizontal KPI strip → compact grid;
- multi-column table → priority list/compact records;
- split view → sequential list/detail or sheet;
- contextual side panel → bottom sheet/full-screen detail;
- dense toolbar → prioritized actions + overflow;
- desktop calendar → focused schedule/day representation;
- multi-column workspace → vertical task flow;
- secondary metadata → collapsible/secondary presentation;
- large cards → compact content blocks.

Bottom navigation may be used only where the canonical navigation contract permits it and may never create a second navigation authority.

---

## 19. RTL / LTR Constitution

Every integrated pattern must work natively in Arabic and English.

- use logical CSS properties;
- preserve semantic order;
- preserve icon/text meaning while adapting reading direction;
- move contextual panels and badges logically where appropriate;
- verify focus order independently of visual direction;
- protect against long Arabic labels;
- do not treat RTL as visual mirroring only.

---

## 20. Accessibility and Interaction States

Reusable patterns must support applicable states:

- idle;
- hover;
- focus-visible;
- pressed/open;
- loading;
- disabled;
- error;
- unread/attention.

Focus visibility is mandatory. Touch targets must remain comfortable. Status and action meaning must not depend on color alone.

---

## 21. Surface Implementation Rule

Before changing a surface, implementation must follow:

```text
1. Inspect existing surface contract
2. Inspect existing authoritative engine/components
3. Identify work purpose
4. Select presentation pattern
5. Map information hierarchy
6. Define responsive transformation
7. Implement inside Concept 01
8. Preserve authorization/routing/workflow/data ownership
9. Build and verify
10. Review visually and functionally
11. Document
12. Close
```

The rule is **Inspect → Reuse → Extend → Create**.

Creating a new component/engine is justified only when an authoritative existing capability cannot satisfy the required presentation without violating its contract.

---

## 22. F1–F4 Foundation Application

The current Experience Foundation work remains the first verified application of this integrated constitution.

### F1 — Login

Focused Surface; calm Clinical Precision canvas; dedicated authentication experience; no authenticated Header/Sidebar inside the auth surface; preserve auth, redirect, language, reset, register, password visibility, loading/error, native validation and accessible error association.

### F2 — Header

Global Control Rail; independent Brand/Home, Global Search, Communications, Chat, Notifications and Quick Actions; no mega-pill; responsive compositions are deliberately different across mobile, tablet and desktop; preserve clinic-wide Communications, compact Chat, independent Notifications, Language + Logout Quick Actions, Escape/focus restoration and RTL/LTR behavior.

### F3 — Home

Context + KPI + Destination; clinic identity/context first; weather/ambient context remains open contextual information; Today uses compact actionable indicators for appointments, waiting, in clinical work and completed; Workspace and Calendar remain explicit destinations; Calendar reuses the existing Agenda representation; protected Home removals remain removed.

### F4 — Home → Workspace

The transition moves the user from awareness into execution using the existing `/workspace` destination and authorization semantics, without creating a duplicate workspace layer.

The detailed implementation/validation record remains in:
`docs/CORE-SYSTEM-EXPERIENCE-F1-F4-EXECUTION-LEDGER-2026-09-15.md`.

---

## 23. Validation Constitution

Experience is not considered complete because code exists or because a source file looks correct.

Verification must cover, where applicable:

- behavior and routing;
- authorization;
- responsive composition;
- desktop/tablet/mobile;
- RTL/LTR;
- keyboard/focus/touch;
- loading/error/empty/unread states;
- information hierarchy;
- reuse of authoritative engines;
- visual consistency with Concept 01;
- no accidental functional changes.

The canonical engineering workflow remains:

**VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE**.

Unrelated technical debt, Patient/RLS work, runtime investigations and other frozen domains must not be silently absorbed into Experience work unless evidence establishes a direct dependency or defect.

---

## 24. Governance and Source Documents

This integrated constitution is the execution synthesis of the following existing authorities:

- `docs/CORE-SYSTEM-VISUAL-DESIGN-CONSTITUTION.md` — visual primitives and Concept 01 authority;
- `docs/CORE-SYSTEM-EXPERIENCE-PRESENTATION-SYSTEM-2026-09-15.md` — system-wide presentation patterns;
- `docs/CORE-SYSTEM-EXPERIENCE-F1-F4-EXECUTION-LEDGER-2026-09-15.md` — F1–F4 implementation and validation evidence;
- approved Experience Constitution / Decision Registry / Work Contract;
- surface-specific functional contracts.

The source documents remain preserved for traceability. This integrated constitution becomes the **single execution synthesis for Experience Foundation + Experience Presentation**.

If a conflict is discovered:

1. preserve Product Owner-approved product meaning;
2. preserve surface/domain ownership;
3. preserve authorization and workflow semantics;
4. solve the presentation problem technically where possible;
5. do not reopen closed decisions without an explicit Product Owner decision;
6. document genuinely new decisions before treating them as final.

---

## 25. Current Status

**Integration decision: CLOSED.**

**Implementation status: OPEN.**

This document does not claim that all CORE SYSTEM surfaces have already been refactored to the integrated presentation system.

The next work is therefore not to redesign Experience Foundation and Presentation separately. It is to apply this integrated constitution surface-by-surface, starting from the current F1–F4 verified implementation and then extending the same experience grammar across the remaining CORE SYSTEM surfaces without changing their functional contracts.
