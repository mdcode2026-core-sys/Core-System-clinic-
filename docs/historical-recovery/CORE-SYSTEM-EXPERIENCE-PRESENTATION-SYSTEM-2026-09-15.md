# CORE SYSTEM — Experience Presentation System
## System-wide UI Composition & Surface Presentation Specification
### 2026-09-15

**Status:** APPROVED DIRECTION — IMPLEMENTATION/RECONCILIATION OPEN  
**Parent visual authority:** `docs/CORE-SYSTEM-VISUAL-DESIGN-CONSTITUTION.md`  
**Parent UX / IA authority:** `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28.md` and the approved Experience Constitution / Decision Registry  
**Scope:** System-wide presentation of CORE SYSTEM surfaces, including desktop, tablet, mobile, RTL/LTR, information indicators, work surfaces, lists, records, contextual panels, queues, calendars, communication surfaces, financial/resource surfaces, analytics, administration and settings.

---

## 1. Purpose

This specification records the system-wide presentation implications discovered while comparing the approved **Concept 01 — Clinical Precision** foundation with the visual composition patterns visible in the supplied reference systems.

The purpose is **not** to introduce a new visual concept.

The purpose is to define how CORE SYSTEM should use the approved Concept 01 language to present different kinds of information and work with the clarity, hierarchy, compact indicators, contextual panels, responsive transformation and professional information density expected from mature clinical/operational software.

The central decision is:

> **Concept 01 remains the visual identity. This document defines the presentation architecture used inside that identity.**

Reference systems are treated as **composition and presentation references only**. Their branding, palette, decorative treatment, component styling, information architecture, terminology and product-specific behavior are not adopted automatically.

---

## 2. Relationship to Concept 01

Concept 01 — Clinical Precision remains closed as the approved visual foundation.

Nothing in this specification reopens Concepts 02–04 or changes the approved palette, typography, spacing, radius, surface, interaction, RTL/LTR or responsive constitution.

The relationship is:

```text
Approved Product / UX Decisions
            ↓
Experience Constitution / Work Contract
            ↓
Concept 01 — Clinical Precision
            ↓
Visual Design Constitution
            ↓
Experience Presentation System   ← this document
            ↓
Surface-specific contracts
            ↓
Implementation
```

A presentation improvement may not change:

- authorization;
- role or workspace meaning;
- domain ownership;
- workflow ownership;
- routing semantics;
- Patient Journey authority;
- capability entitlement;
- existing authoritative engines;
- approved functional content.

---

## 3. Core Presentation Decision

CORE SYSTEM must not use one universal page composition.

Instead, every surface is classified by its **work purpose** and receives the appropriate presentation pattern while remaining visually consistent with Concept 01.

The system therefore uses a shared visual language with multiple presentation patterns.

### 3.1 Presentation patterns

| Pattern | Purpose | Typical surfaces |
|---|---|---|
| Focused Surface | One primary task with minimal distraction | Login, focused forms |
| Global Control Rail | Persistent global controls and account/context tools | Header |
| Context + KPI + Destination | Awareness followed by actionable information and entry points | Home |
| Personal Launchpad | Personal work overview and authorized shortcuts/widgets | My Workspace |
| Work Surface | Primary work area with optional contextual support | Role Workspace |
| Record List + Context | Find records, inspect selected context, execute actions | Patients |
| Scheduling Workbench | Time/resource scheduling with contextual appointment detail | Agenda |
| Process / Queue | State-based work progression | Patient Flow, Queue |
| Longitudinal Clinical Surface | Persistent plan/progress/history around a patient | Treatment Plans |
| Clinical Workbench | Dense professional task execution with clinical context | Clinical Workspace |
| Conversation Workspace | Communication list + active conversation | Communications |
| Compact Interaction Surface | Focused transient communication interaction | Chat |
| Attention Feed | Events requiring awareness or action | Notifications |
| Execution Queue | Owned tasks, requests, exceptions and next actions | Work Center |
| Operations Dashboard | Operational metrics plus management work | Workforce |
| Financial Work Surface | Financial/resource indicators + records + detail | Financial & Resources |
| Control Workbench | Resource status/control + records + context | Inventory |
| Process + List | Ordered business process with status and records | Purchasing |
| Case Management | Case status + queue + case detail | Insurance & Claims |
| Evidence Surface | Filtered records/evidence with export/detail | Reports |
| Analytical Surface | KPI + comparison + trend + drilldown | Analytics |
| Executive Overview | High-level management snapshot | Dashboard |
| Control Center | Administrative status + configuration entry | Administration |
| Configuration Workspace | Structured settings navigation and forms | Settings |

These patterns are compositional contracts, not new visual themes.

---

## 4. Shared Visual Grammar

All patterns inherit Concept 01:

- Slate 50 authenticated canvas where applicable;
- White primary content surfaces;
- Slate 100 for quiet grouping;
- Ink-first typography;
- Clinical Azure for primary action/emphasis;
- Diagnostic Cyan for informational/diagnostic emphasis;
- semantic Success/Warning/Error only for their semantic roles;
- restrained borders;
- restrained elevation;
- disciplined radius family;
- 4px spacing rhythm;
- clear focus states;
- native RTL/LTR behavior;
- comfortable touch targets;
- cards only when they improve comprehension or execution;
- no default gradients, glass, glow or decorative medical imagery.

The visual system should feel like one product even when the composition changes dramatically between Home, Agenda, Clinical Workspace, Communications and Analytics.

---

## 5. Information Indicators / KPI System

Indicators are a reusable presentation pattern across CORE SYSTEM, not a Home-only feature.

### 5.1 Indicator anatomy

A compact KPI/metric indicator may contain:

1. short semantic label;
2. primary value;
3. optional unit;
4. optional contextual qualifier;
5. semantic icon where useful;
6. optional trend/comparison;
7. optional status;
8. destination/action when the metric is actionable.

The metric must answer quickly:

> **What is this? What is its current value? Does it need attention? What can I do next?**

### 5.2 Indicator behavior

Use indicators when the number changes a decision or provides useful situational awareness.

Do not turn every database count into a KPI.

Indicators must remain compact. A KPI does not need a large card, illustration or decorative visualization.

### 5.3 Semantic states

Status should use:

**icon + label + semantic color + optional value/context**

and never color alone.

Common clinical/operational states may include:

- Scheduled;
- Confirmed;
- Arrived;
- Waiting;
- In Clinical Work;
- Pending Close;
- Completed;
- Cancelled;
- No-show;
- Pending;
- Approved;
- Rejected;
- Overdue;
- Escalated.

The exact status vocabulary remains owned by the relevant surface/domain contract.

### 5.4 Responsive indicator behavior

**Desktop:** horizontal KPI strip or multi-column grid when it improves scanning.  
**Tablet:** reduced column count with preserved priority.  
**Mobile:** compact 2-column grid is preferred for four high-value indicators; larger sets become horizontally scrollable or vertically grouped only when justified.

Never compress KPI content until labels and values become ambiguous.

---

## 6. Action Presentation

Actions should be visually ranked rather than presented as an undifferentiated collection of buttons.

### Primary action
One clear dominant action for the current surface/task.

### Secondary actions
Visible but quieter actions supporting the primary task.

### Context actions
Actions associated with a selected record/item.

### Global actions
Header/account actions remain independent and are not converted into page-level actions.

### Mobile action rule

On mobile, the primary action should remain discoverable without requiring desktop-style horizontal toolbars. Secondary actions may move into menus/sheets when the functional contract permits.

An action must not disappear merely because the viewport is smaller if the user remains authorized to perform it.

---

## 7. Record Presentation

Record-heavy domains should not rely on large cards for every record.

Use the most efficient representation for the task:

- table for comparison and high-density operations;
- list for scanning;
- compact record card for mobile or low-width contexts;
- split view when selecting a record should preserve the list;
- contextual panel when detail is useful without leaving the work surface;
- full detail surface when the task requires concentration.

### Record summary priority

1. identity;
2. state/status;
3. most important contextual fact;
4. time/date or ownership where relevant;
5. primary action;
6. secondary metadata.

Decorative content must never displace operationally important information.

---

## 8. Contextual Panel System

Contextual panels are a reusable pattern for selected or currently relevant information.

Examples:

- selected patient in Patients;
- selected appointment in Agenda;
- patient context in Clinical Workspace;
- selected item in Inventory;
- selected invoice/claim in financial surfaces;
- selected task in Work Center.

A contextual panel must:

- remain subordinate to the primary work surface;
- show only context useful to the current task;
- provide clear actions when appropriate;
- avoid duplicating the authoritative full domain surface;
- be removable/collapsible on smaller screens where appropriate.

On mobile, a contextual panel may become a bottom sheet, full-screen detail, or sequential navigation step depending on the surface contract.

---

## 9. Queue / Process Presentation

Queue-driven surfaces require visible progression and ownership.

The presentation should make it easy to identify:

- current state;
- patient/item identity;
- elapsed/target time where meaningful;
- owner/assignee;
- exception or attention state;
- next permitted action.

Patient Flow remains a workflow authority and must not be visually transformed into an ordinary dashboard or sidebar domain.

The established clinical flow remains:

```text
Queue → Clinical Visit → Pending Close → Reception Workflow → Completed
```

Presentation may change by viewport, but state meaning and ownership may not.

---

## 10. Calendar / Scheduling Presentation

Agenda is a scheduling work surface, not a KPI dashboard.

Its presentation should prioritize:

- time;
- resource/doctor/room context;
- appointment identity;
- appointment status;
- schedule density;
- rapid navigation;
- filtering;
- selected appointment context.

The existing Agenda/calendar representation remains authoritative. Presentation changes must reuse the existing scheduling engine rather than creating a duplicate calendar engine.

On mobile, scheduling should transform into a focused day/time/resource representation rather than simply shrinking a desktop calendar until it becomes unusable.

---

## 11. Clinical Presentation

Clinical surfaces require the highest clarity around patient identity and clinical task context.

### Clinical Workspace

Preferred composition:

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

Preferred composition:

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

Progress indicators are useful here because they explain longitudinal state. They must not become decorative progress graphics.

---

## 12. Home vs Work Surfaces

A critical global distinction is maintained:

### Home

Purpose: **awareness and orientation**.

Presentation:

**Identity/Context → Today indicators → Attention when necessary → Next destinations**

Home must remain calm and must not become a duplicate Work Center, Notifications center, Communications center, Patient Portal center or personalized workspace.

### Workspace

Purpose: **execution**.

Presentation may become denser and more task-oriented.

This distinction prevents the reference-system KPI style from turning Home into an overloaded dashboard.

---

## 13. Communications / Chat / Notifications

### Communications

Use **Conversation Workspace**:

```text
Conversation list → Active conversation → Composer
```

It is clinic-wide internal communication for authorized clinic accounts. It is not a doctor-only communication system.

### Chat

Use **Compact Interaction Surface** as a focused interaction layer over the broader Communications capability where the existing contract allows it.

### Notifications

Use **Attention Feed**:

```text
What happened → When → Why it matters → Open/action
```

Notifications must not become a generic dashboard or be duplicated into Home merely for visual completeness.

---

## 14. Operational Presentation

### Work Center

Preferred composition:

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

Preferred composition:

```text
Operational indicators
      ↓
Attendance / workforce state
      ↓
Employee/work records
      ↓
Context / management action
```

Operational surfaces may use higher density than Home because their purpose is active coordination.

---

## 15. Financial & Resource Presentation

Financial/resource domains should share a recognizable presentation family while preserving each domain's workflow.

### Common structure

```text
Relevant financial/resource indicators
      ↓
Primary records / transactions
      ↓
Status / exceptions
      ↓
Selected detail / action
```

Examples:

- Invoices: invoiced, collected/paid, outstanding, status, invoice records.
- Payments: transactions, method/status, reconciliation context.
- Financial Plans: plan status, installments, due/paid state.
- Insurance & Claims: case counts, pending/submitted/approved/rejected, claim records.
- Inventory: stock, low stock, expiry/attention, item records, consumption.
- Purchasing: requests/orders/receiving/suppliers and their process states.
- Expenses: expense totals, status, records and supporting detail.

Financial/resource surfaces must not all become identical dashboards. The presentation family is shared; the work model remains domain-specific.

---

## 16. Analytics vs Dashboard vs Reports

These three surfaces must remain visually and functionally distinct.

### Dashboard

**Executive Overview** — concise high-level state and important indicators.

### Analytics

**Analytical Surface** — KPI → comparison → trend → drilldown/evidence.

The current Analytics implementation already contains KPI groups, comparison, trend and drilldown structures; these are the correct conceptual building blocks for the analytical presentation family.

### Reports

**Evidence Surface** — filtered records, evidence, tables and export/detail operations.

A report should not be forced into a dashboard composition merely because both contain numbers.

---

## 17. Administration / Settings

### Administration

Use **Control Center**:

- high-level clinic/admin state where useful;
- grouped administrative capabilities;
- clear control entry points;
- workspace/content below the control layer where applicable.

### Settings

Use **Configuration Workspace**:

```text
Settings category
      ↓
Setting group
      ↓
Field/control
      ↓
State / validation
      ↓
Save / confirmation
```

Settings should favor clarity and predictability over dashboard-like visual density.

---

## 18. Mobile Constitution — System-wide Application

The supplied reference systems reinforce an important rule already present in Concept 01:

> **Mobile is a focused work surface, not a scaled desktop page.**

The following transformations are approved as presentation behavior, subject to each surface's functional contract:

### Desktop → Mobile transformations

- horizontal KPI strip → compact grid;
- multi-column record table → priority record list/cards;
- split view → sequential list/detail or sheet;
- contextual right/left panel → bottom sheet/full-screen detail;
- dense toolbar → prioritized actions + overflow;
- desktop calendar → focused schedule/day representation;
- multi-column workspace → vertical task flow;
- secondary metadata → collapsible/secondary presentation;
- large desktop cards → compact content blocks.

### Mobile bottom navigation

Bottom navigation may be used only where the navigation contract permits it. It must not duplicate the canonical Sidebar/navigation registry or create a second navigation authority.

### Touch

Controls remain comfortable to operate by touch. Icon-only controls require a clear accessible name and visible state.

---

## 19. Tablet Constitution

Tablet is not treated as either desktop or mobile by simple breakpoint scaling.

Tablet should:

- preserve semantic hierarchy;
- reduce column count before removing information;
- retain primary actions;
- collapse contextual detail only when needed;
- maintain readable touch targets;
- use intermediate compositions for calendars, lists, split views and work surfaces.

---

## 20. RTL / LTR Application

Every presentation pattern must work natively in Arabic and English.

Rules:

- use logical CSS properties;
- preserve semantic order;
- allow icon/text relationships to follow reading direction without changing meaning;
- move badges and contextual panels according to logical direction where appropriate;
- verify focus order independently of visual direction;
- protect layouts from long Arabic labels;
- do not treat RTL as a mirrored screenshot-only exercise.

---

## 21. Accessibility / State Requirements

Every reusable presentation pattern must support applicable states:

- idle;
- hover;
- focus-visible;
- pressed/open;
- loading;
- disabled;
- error;
- unread/attention;
- selected/current where applicable.

Status and action meaning must not depend on color alone.

Keyboard navigation, focus restoration, accessible names, semantic headings and touch behavior remain part of the presentation contract.

---

## 22. Density Matrix

The following matrix extends the existing density principle into a presentation decision aid:

| Surface | Primary purpose | Density | Preferred presentation |
|---|---|---|---|
| Login | Authenticate | Low | Focused Surface |
| Header | Global control | Low/compact | Global Control Rail |
| Home | Awareness | Low/contextual | Context + KPI + Destination |
| My Workspace | Personal execution | Medium | Personal Launchpad |
| Role Workspace | Professional work | Medium–High | Work Surface |
| Patients | Record discovery | Medium–High | Record List + Context |
| Agenda | Scheduling | High | Scheduling Workbench |
| Patient Flow | Workflow state | High | Process / Queue |
| Treatment Plans | Longitudinal care | Medium–High | Longitudinal Clinical Surface |
| Clinical Workspace | Clinical execution | High | Clinical Workbench |
| Communications | Internal communication | Medium–High | Conversation Workspace |
| Chat | Focused communication | Medium | Compact Interaction Surface |
| Notifications | Attention | Low–Medium | Attention Feed |
| Work Center | Coordination/execution | High | Execution Queue |
| Workforce | Operations management | Medium–High | Operations Dashboard |
| Financial & Resources | Financial/resource operations | Medium–High | Financial Work Surface |
| Inventory | Stock control | High | Control Workbench |
| Purchasing | Procurement workflow | Medium–High | Process + List |
| Insurance | Claims/cases | Medium–High | Case Management |
| Reports | Evidence | Medium–High | Evidence Surface |
| Analytics | Analysis | Medium–High | Analytical Surface |
| Dashboard | Executive overview | Medium | Executive Overview |
| Administration | Control | Medium | Control Center |
| Settings | Configuration | Low–Medium | Configuration Workspace |

Density is a work property, not a decorative target.

---

## 23. Reference-System Adoption Rules

The reference systems may inform:

- compact KPI architecture;
- indicator hierarchy;
- actionable metrics;
- appointment/record card composition;
- status presentation;
- contextual detail panels;
- desktop multi-column composition;
- mobile compact grids;
- schedule strips;
- next-action presentation;
- work queue composition;
- responsive transformation;
- information hierarchy.

The reference systems must **not** automatically determine:

- CORE SYSTEM branding;
- palette;
- Concept 01;
- navigation architecture;
- permissions;
- role/workspace architecture;
- Patient Flow ownership;
- domain boundaries;
- workflow semantics;
- data model;
- duplicate engines;
- decorative gradients/glass/glow;
- medical illustration language.

The target is:

> **Reference-grade information presentation inside Concept 01 — Clinical Precision.**

Not:

> **A visual copy of another product.**

---

## 24. Implementation Rules

For any future surface presentation work:

1. Read the authoritative surface contract first.
2. Identify the surface's work purpose.
3. Select the appropriate presentation pattern from this document.
4. Inspect existing components and engines.
5. Reuse before creating.
6. Apply Concept 01 tokens rather than introducing local visual tokens.
7. Preserve authorization, workflow and routing.
8. Define desktop, tablet and mobile behavior explicitly.
9. Define RTL and LTR behavior explicitly.
10. Verify accessibility and interaction states.
11. Validate the real runtime surface.
12. Document any new presentation decision before treating it as system-wide precedent.

No visual refactor should be performed as a generic "make it prettier" pass.

---

## 25. Protected Boundaries

This presentation system does not authorize changes to:

- approved Experience Foundation functional decisions;
- Patient Journey decisions;
- sidebar/role/workspace architecture;
- authorization or permission behavior;
- tenant isolation;
- domain ownership;
- routing contracts;
- Patient Flow state authority;
- existing Agenda/calendar authority;
- Communications clinic-wide scope;
- Treatment Plan authority;
- Patient Portal entitlement decisions.

If a visual requirement appears to conflict with a functional contract, the functional contract wins and the visual composition must adapt.

---

## 26. Governance and Closure

This document is subordinate to Product Owner decisions and the approved Experience Constitution / Work Contract for functional behavior.

It becomes the presentation reference for future surface implementation only after the corresponding implementation work is verified.

The existence of this document does **not** mean every surface has already been visually refactored.

Current status:

- **Concept 01:** approved foundation.
- **Experience Presentation System:** approved direction / implementation open.
- **F1–F4:** implementation remains subject to the Experience Foundation closure contract.
- **Other surfaces:** presentation reconciliation should follow this specification when their authorized implementation work is scheduled.

---

## 27. Decision Summary

The final decision recorded here is:

> **CORE SYSTEM will retain Concept 01 — Clinical Precision as its single visual foundation and will use a system-wide, surface-specific Experience Presentation System to achieve reference-grade information hierarchy, indicators, work surfaces, contextual panels and mobile/tablet/desktop behavior across the entire product.**

This is an extension of the visual/presentation specification, not a replacement of Concept 01 and not a new visual concept.
