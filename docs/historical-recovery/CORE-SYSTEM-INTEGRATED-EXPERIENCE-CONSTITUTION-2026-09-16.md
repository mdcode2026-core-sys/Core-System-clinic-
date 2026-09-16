# CORE SYSTEM — Integrated Experience Constitution
## Experience Foundation + Experience Presentation
### 2026-09-16

**Status:** APPROVED INTEGRATION — IMPLEMENTATION / VERIFICATION OPEN  
**Authority:** Product Owner-approved Experience decisions, Concept 01 — Clinical Precision, and the existing Experience Foundation / Presentation System records  
**Applies to:** CORE SYSTEM experience behavior and presentation across Login, Header, Home, Workspace, My Workspace, clinical, operational, administrative, financial/resource, communication, analytics, reporting and settings surfaces.

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
- tables for high-density comparison;
- lists for scanning;
- compact cards for narrow/mobile contexts;
- split views where list persistence matters;
- contextual panels when selected context should remain visible;
- full detail when concentrated work requires it.

Record summary priority:

1. identity;
2. state/status;
3. most important contextual fact;
4. time/date/ownership where relevant;
5. primary action;
6. supporting metadata.

Contextual panels remain subordinate to their work surface and must not reproduce a full duplicate domain page.

---

## 10. Queue / Process Presentation

Queue-driven surfaces should make visible:
- current state;
- identity;
- elapsed/target time where meaningful;
- owner/assignee;
- exception/attention state;
- next permitted action.

Patient Flow remains a workflow authority and is not turned into a generic dashboard.

The established clinical flow remains:

`Queue → Clinical Visit → Pending Close → Reception Workflow → Completed`

Presentation may transform by viewport, but state meaning and ownership may not.

---

## 11. Scheduling Presentation

Agenda prioritizes time, resource/doctor/room context, appointment identity/status, density, navigation, filtering and selected context.

Agenda remains authoritative. Calendar is its visual/operational representation and must not become a second scheduling engine.

Mobile scheduling should transform into a focused day/time/resource representation instead of shrinking an unusable desktop calendar.

---

## 12. Clinical Presentation

Clinical surfaces prioritize patient identity, task context and clear execution.

Clinical Workspace preferred composition:

`Patient Context → Current Clinical Task → Required Clinical Information → Actions/Next Step → Supporting Context`

Treatment Plans preferred composition:

`Patient Identity → Plan Status/Progress → Treatment Phases → Sessions/Procedures → Next Action`

Progress visualization must remain informative, not decorative.

---

## 13. Home vs Work Surfaces

### Home

Purpose: **awareness and orientation**.

Presentation:

`Identity/Context → Today indicators → Attention when necessary → Next destinations`

Home remains calm and does not become a duplicate Work Center, Notifications center, Communications center, Patient Portal center or personalized workspace.

### Workspace

Purpose: **execution**.

Workspace presentation may be denser and more task-oriented.

---

## 14. Communications / Chat / Notifications

### Communications

Use **Conversation Workspace**: conversation list → active conversation → composer.

It is clinic-wide internal communication for authorized clinic accounts and is not doctor-only.

### Chat

Use **Compact Interaction Surface** as a focused layer over the Communications capability. No parallel communication/authorization engine is introduced.

### Notifications

Use **Attention Feed**: what happened → when → why it matters → open/action.

Notifications do not become a generic dashboard or a second store.

---

## 15. Operational Presentation

### Work Center

Preferred composition:

`Attention indicators → Owned/due/overdue/exception work → Execution queue → Context + action`

### Workforce

Preferred composition:

`Operational indicators → Attendance/workforce state → Employee/work records → Context/management action`

Operational surfaces may use higher density than Home because coordination is an execution task.

---

## 16. Financial / Resource Presentation

Financial/resource surfaces share the visual family but retain domain-specific workflows.

Common structure:

`Relevant indicators → Primary records/transactions → Status/exceptions → Selected detail/action`

Examples include invoices, payments, financial plans, insurance/claims, inventory, purchasing and expenses.

The shared presentation family must not collapse their distinct business workflows.

---

## 17. Analytics / Dashboard / Reports

Keep them distinct:

- **Dashboard — Executive Overview:** concise management state.
- **Analytics — Analytical Surface:** KPI → comparison → trend → drilldown.
- **Reports — Evidence Surface:** filtered evidence, tables and export/detail operations.

Numbers alone do not make two surfaces equivalent.

---

## 18. Administration / Settings

Administration uses **Control Center** for administrative control and oversight.

Settings use **Configuration Workspace**:

`Settings category → Setting group → Field/control → Validation/state → Save/confirmation`

Settings should favor predictability over dashboard-like density.

---

## 19. Responsive / Mobile / Tablet Constitution

Mobile is a focused work surface, not a scaled desktop page.

Approved transformations include:

- horizontal KPI strip → compact grid;
- multi-column table → prioritized list/cards;
- split view → sequential/sheet/detail;
- contextual panel → bottom sheet/full-screen detail;
- dense toolbar → prioritized actions + overflow;
- desktop calendar → focused schedule/day representation;
- multi-column workspace → vertical task flow.

Tablet is an intermediate deliberate composition: reduce column count, preserve semantic hierarchy, retain primary actions, collapse secondary detail before removing meaningful capability.

Bottom navigation may be used only when the navigation contract permits it and must not create a second navigation authority.

---

## 20. RTL / LTR

Every presentation pattern must work natively in Arabic and English:

- use logical CSS properties;
- preserve semantic order;
- adapt icon/text relationships without changing meaning;
- move badges/context logically;
- verify focus order in both directions;
- protect long Arabic labels;
- do not treat RTL as mirrored screenshots only.

---

## 21. Accessibility / Interaction States

Reusable presentation patterns support, where applicable:

- idle;
- hover;
- focus-visible;
- pressed/open;
- loading;
- disabled;
- error;
- unread/attention;
- selected/current.

Status and action meaning must not depend on color alone. Keyboard navigation, focus restoration, accessible names, semantic headings and comfortable touch behavior are part of the contract.

---

## 22. Implementation Rules

For every future surface:

1. Read the authoritative surface contract.
2. Identify the work purpose.
3. Select the appropriate presentation pattern.
4. Inspect existing components/engines.
5. Reuse before creating.
6. Apply Concept 01 tokens.
7. Preserve authorization, workflow and routing.
8. Define desktop/tablet/mobile behavior.
9. Define RTL/LTR behavior.
10. Verify accessibility and interaction states.
11. Validate the real runtime surface.
12. Record any new precedent as a governed presentation decision.

No visual work should be a generic "make it prettier" pass.

---

## 23. Protected Boundaries

This constitution does not authorize changes to:

- approved Experience Foundation functional decisions;
- Patient Journey decisions;
- sidebar/role/workspace architecture;
- authorization or permission behavior;
- tenant isolation;
- domain ownership;
- routing contracts;
- Patient Flow authority;
- Agenda/calendar authority;
- Communications clinic-wide scope;
- Treatment Plan authority;
- Patient Portal entitlement decisions.

When visual and functional contracts conflict, the functional contract wins and presentation adapts.

---

## 24. Governance / Closure

This document is subordinate to Product Owner decisions and the approved Experience Constitution / Work Contract for functional behavior.

Its existence does not mean that every surface has already been visually refactored.

Current status:

- Concept 01: approved foundation.
- Integrated Experience Constitution: approved integration direction.
- F1–F4: implementation/verification open.
- Other surfaces: apply this constitution when their governed implementation work is scheduled.

## 25. Decision Summary

> **CORE SYSTEM retains Concept 01 — Clinical Precision as one visual foundation and integrates Experience Foundation + Experience Presentation into one governing experience model so behavior, hierarchy, interaction, responsive composition and presentation are implemented together without changing domain ownership or authorization.**
