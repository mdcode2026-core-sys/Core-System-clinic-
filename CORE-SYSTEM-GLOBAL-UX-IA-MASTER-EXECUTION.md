# CORE SYSTEM — GLOBAL UX / INFORMATION ARCHITECTURE / INTERACTION
## MASTER EXECUTION DOCUMENT
### AJM + PJ Reconciliation Edition — 2026-08-28

**Status:** AUTHORITATIVE EXECUTION MASTER

**Purpose:** This document is the single execution reference for the Global UX / Information Architecture / Interaction Reorganization work. It is intentionally stored in the repository root so every future execution conversation can begin by reading this document rather than relying on conversation memory.

---

# 1. HOW TO USE THIS DOCUMENT

A new execution conversation should receive only a stage-specific instruction such as:

> **Go to the CORE SYSTEM repository, read `CORE-SYSTEM-GLOBAL-UX-IA-MASTER-EXECUTION.md` in the repository root and execute Stage X exactly according to it. Before implementation, inspect the current repository and the referenced AJM/PJ documentation, verify the actual status of completed, partially completed, validation-pending and not-started AJM stages, and continue from the current repository state. Do not rely on conversation memory. Document and commit the completed stage before proceeding.**

The executor must then read this entire document and all references required by the requested stage.

This document is the governing execution reference. It must be updated when an approved decision, stage boundary, dependency, or execution rule changes.

---

# 2. MISSION

Reorganize how CORE SYSTEM appears and how users work inside it without rebuilding the product from zero and without reducing its capabilities.

Target:

> **Simple Surface + Deep Background Capability + Independent Domains + Explicit Integration + Structured Data + Future Automation / AI Readiness**

The product should feel like one coherent system while preserving independent Domains and their ownership.

The goal is not fewer features. The goal is less unnecessary complexity in the user's path to those features.

---

# 3. ABSOLUTE EXECUTION METHOD

Every stage follows:

**READ → INSPECT → MAP → RECONCILE → RESEARCH → VALIDATE → IMPLEMENT → DOCUMENT → COMMIT → RECHECK**

Within implementation:

**Inspect → Reuse → Extend → Reconcile → Create**

Create only when a genuine gap is demonstrated.

No quick visual patch is acceptable when the root cause is a navigation registry, duplicated implementation, ownership problem, stale document, or other underlying defect.

---

# 4. AJM IS A CONTINUOUS DEPENDENCY, NOT A SEPARATE PROJECT

AJM — Administrative & Journey Management — is already partly implemented. Some stages are complete, some are partially complete, some are implemented but require validation, and later stages may not yet have started.

The UX/IA work must never assume that AJM is either completely finished or completely untouched.

Before every stage, during every stage where relevant, and after every stage:

1. Check the current AJM status.
2. Check the AJM stage(s) affected by the work.
3. Check completed AJM work and preserve valid implementation.
4. Check partially completed AJM work and continue/reconcile rather than rebuild.
5. Check validation-pending AJM work and validate it before changing it.
6. Check AJM stages not yet started and make sure the current UX model does not create a conflict with their future implementation.
7. Check blocked AJM stages and record whether the UX work changes their dependency.
8. Update the AJM status record when the stage changes its status or interpretation.

The executor must maintain an **AJM Implementation Status Matrix** in the repository and keep it synchronized with reality.

Required statuses:

- COMPLETED
- PARTIALLY COMPLETED
- IMPLEMENTED — VALIDATION PENDING
- IN PROGRESS
- BLOCKED
- NOT STARTED
- NEEDS RECONCILIATION

A page existing in the repository does not make an AJM stage complete.

---

# 5. AJM RECONCILIATION RULE

For every relevant AJM stage compare:

**Approved AJM decision → AJM documentation → repository implementation → database where relevant → runtime**

Then compare the result with:

**Global UX/IA decisions → current execution stage**

If a conflict is found:

- do not silently reinterpret the old decision;
- identify the previous decision;
- identify the actual conflict;
- identify whether the issue is implementation, documentation, UX, or architecture;
- reuse valid work;
- reconcile where authorized;
- stop for explicit approval if a genuinely new architectural decision is required.

Do not restart a completed AJM stage merely because its presentation is being reorganized.

Do not ignore an uncompleted AJM stage merely because the current UX work is the immediate task.

---

# 6. GOVERNING DOCUMENTS

Before execution, read the current versions of the following where applicable:

## Global UX/IA

- `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
- `GLOBAL_UX_IA_AUDIT_FINAL_REPORT_2026-08-28.md`
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`
- `docs/GLOBAL_UX_IA_DOCUMENTATION_RECONCILIATION_2026-08-28.md`
- `WORKSPACE_ARCHITECTURE_SPECIFICATION.md`
- `WORKSPACE_ARCHITECTURE_STAGE6_AMENDMENT.md`

## AJM

Read the current AJM Master Blueprint, Implementation Plan, Stage Index, stage reports/closures, domain documents, ADRs and the current AJM UX/IA reconciliation document, including:

- `docs/AJM-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md`

Also inspect any newer AJM documents found in the repository.

## PJ

Read the current PJ-MASTER-DOCS and the Patient Journey documents actually related to the affected stage, including Patient Flow, Queue, visit lifecycle, appointments, treatment plans, follow-up, communication, Portal and patient-context material where relevant.

Also read:

- `docs/PJ-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md`

## Architecture / access

Read current documents governing:

- Independent Modules + Integrated Platform.
- Domain ownership.
- Role and Permission model.
- Clinic Admin.
- Tenant isolation.
- Auditability.
- Subscription/Entitlement model where relevant.

The executor must prefer the newest approved document when older documentation conflicts with a newer approved decision, and must reconcile the old document rather than leaving two active interpretations.

---

# 7. APPROVED USER MODEL

CORE SYSTEM understands a user as:

**User → Role → Permissions → Authorized Capabilities → Sidebar + Workspace + Widgets**

Role is an organizational label and starting point. It does not determine what categories of permission a user may receive.

Clinic Admin controls users and roles within the approved system controls and may grant available permissions regardless of conventional professional expectations.

Examples are intentionally permitted by the approved model:

- A receptionist may receive selected financial permissions.
- A doctor may receive selected administrative permissions.
- A custom clinic role may combine capabilities according to that clinic's actual way of working.

Role templates are advisory starting points, not mandatory definitions. Clinic Admin may modify them and create/save custom roles for reuse.

---

# 8. ROLE ≠ PERMISSION

Never introduce a rule that says a role can only have permissions traditionally associated with that role.

The clinic defines its own working reality.

The system's job is to provide available capabilities and enforce the permissions that the clinic assigns.

Do not redesign authorization merely to make UX appear simpler.

---

# 9. WORKSPACE — FINAL MODEL

Workspace is the user's principal working surface.

It is not:

- merely an Overview;
- a Dashboard;
- a security boundary;
- a fixed screen type imposed solely by role;
- a replacement for the Sidebar.

Workspace should help the user perform real daily work.

Depending on authorization and configuration it may contain:

- quick registration;
- patient search;
- quick booking;
- daily operational actions;
- attention items;
- executable tools;
- domain-specific working tools;
- relevant status information;
- authorized Queue-related Widget surfaces.

The Workspace must remain useful without forcing every user to design it from zero.

---

# 10. WORKSPACE IS PERSONALIZED, BUT CONTROLLED

A user may personalize the Workspace using only capabilities they are authorized to use.

They may:

- add Widgets;
- remove Widgets;
- reorder Widgets;
- drag and drop;
- move through additional Widgets by scrolling/swiping where appropriate;
- organize the surface according to actual work frequency;
- restore an appropriate default configuration.

The system must preserve a natural Widget size appropriate to its function.

Do not shrink or enlarge Widgets arbitrarily merely to force them into a fixed grid.

The screen may contain additional content beyond the first visible area, using movement/scrolling similar in principle to modern mobile home-screen organization.

A maximum visible/placed set may be defined according to natural Widget size and the device surface; this is not a rule that suppresses available Widgets.

---

# 11. WIDGETS — FINAL MODEL

Widgets are independent reusable working surfaces associated with capabilities.

They are not restricted to passive Overview information.

Widget categories may include:

- Information.
- Status.
- KPI.
- Attention.
- Quick Action.
- Operational Action.
- Workflow assistance.
- Contextual assistance.

Not every Domain requires a Widget.

A Domain must first be studied to determine whether Widgets add real value. Some capabilities should remain full pages, contextual actions, direct Sidebar features, Quick Actions, or have no Widget at all.

The governing relationship is:

**Permission → Capability available → Widget available → User chooses Widget → Widget appears in Workspace**

A Widget never grants a permission.

Removing a permission must remove or disable the user's ability to use the corresponding Widget regardless of previous personalization.

---

# 12. WIDGET CLASSIFICATION

Every Widget candidate must be classified by:

- purpose;
- Domain ownership;
- required permission(s);
- relevant user context;
- natural size;
- mobile/tablet behavior;
- whether it is executable or informational;
- whether it belongs in Workspace;
- whether it also belongs in Sidebar;
- whether it should instead be a Quick Action;
- whether it should not exist as a Widget.

This classification must be based on the actual workflow of the Domain, not on the existence of a page or database table.

---

# 13. SIDEBAR — FINAL MODEL

Sidebar is the user's complete authorized navigation surface.

It is not:

- a list of Widgets;
- a list of every repository route;
- a security boundary;
- a replacement for Workspace.

The Sidebar should expose full capabilities that need direct navigation.

A feature may exist without becoming a top-level Sidebar item.

It may instead belong under:

- a Domain;
- a parent page;
- a submenu;
- contextual navigation;
- Workspace;
- a Widget;
- a Quick Action;
- Global Search;
- Settings.

The correct surface must be determined by user mental model, workflow, ownership and frequency of use.

---

# 14. DOMAIN / SUBDOMAIN / FEATURE HIERARCHY

A route, page, table or component does not automatically define a Domain.

For every candidate surface determine:

1. Domain?
2. Subdomain?
3. Feature?
4. Setting?
5. Process?
6. Child of another feature?
7. Contextual feature?
8. Workspace capability?
9. Widget?
10. Quick Action?

Parent/child relationships must follow natural ownership and workflow.

Examples to investigate rather than assume:

- Insurance → Claims.
- Purchasing → Suppliers / Receiving.
- Financial Plans → Installments.
- Inventory → Consumption.

The final structure must be supported by architecture, actual implementation, user workflow and research.

---

# 15. PATIENT FLOW — FINAL DECISION

Patient Flow is an independent system.

It remains a Sidebar item only when explicitly enabled/assigned by Clinic Admin and authorized for the user.

Patient Flow is not replaced by Widgets.

The existing Patient Flow capabilities must be reused and reconciled, including where currently implemented:

- Queue.
- Drag and drop.
- Patient movement.
- Visit start and completion/closure behavior.
- Reception movement.
- Clinical movement.
- Administrative monitoring/control.

Patient Flow has exactly three user-facing views of the same system:

**Patient Flow → Operations View / Clinical View / Administrative View**

These are interfaces of one Patient Flow system, not three independent systems.

---

# 16. PATIENT FLOW VISIBILITY

Patient Flow must not appear merely because:

- the user has an Operations role;
- the user has an Operations-oriented Workspace;
- the user has operational permissions.

Clinic Admin must explicitly enable/assign Patient Flow and determine its applicable context.

Therefore:

**Operations role ≠ automatic Patient Flow**

Example:

An Operations user who is an accountant may have financial permissions and Operations Workspace but no Patient Flow.

A reception user may be assigned the Operations Patient Flow view.

A doctor may be assigned the Clinical Patient Flow view.

An authorized administrative user may be assigned the Administrative Patient Flow view.

A Queue Widget may provide a fast Workspace surface into the existing Patient Flow capability but does not replace the full Patient Flow system.

---

# 17. OPERATIONS PATIENT FLOW

The Operations view must support the actual operational movement of the patient through the clinic where relevant, especially reception workflows.

The executor must not design this from assumption.

It must inspect the current implementation and PJ/AJM workflow documentation and compare with relevant industry patterns.

The existing patient movement model — including movement from reception to clinical service and back toward reception/accounting for visit closure where applicable — must be preserved unless an explicit approved change says otherwise.

---

# 18. CLINICAL PATIENT FLOW

The Clinical view must support the clinical side of the same patient movement system.

It must not create a second queue system.

Its surface may differ from Operations because the user task differs, while the underlying Patient Flow remains one system.

---

# 19. ADMINISTRATIVE PATIENT FLOW

The Administrative view provides the broader operational picture needed to monitor and control patient movement.

Where authorized, it may see the broader path and intervene across the operational/clinical flow.

It does not redefine Domain ownership or bypass permissions.

---

# 20. OVERVIEW ≠ WORKSPACE ≠ DASHBOARD

This distinction is mandatory.

## Workspace

Daily working surface.

Contains actionable and useful working tools selected according to authorized capabilities.

## Overview

Contextual summary:

- status;
- summary;
- attention;
- KPI where appropriate;
- contextual information.

It must not become a second copy of the whole Domain.

## Dashboard

Management/administrative oversight:

- management monitoring;
- analytics;
- KPI;
- administrative control;
- broader performance visibility.

Dashboard is not the ordinary user's Workspace.

Clinic Admin retains broad system visibility according to the approved model; delegated users receive access according to permissions.

---

# 21. GLOBAL SEARCH

CORE SYSTEM must have a genuine system-wide Global Search.

It must search authorized information across Domains without requiring users to know the Domain containing the information.

Examples:

- Patient name.
- Patient number.
- Phone.
- Doctor.
- Staff member.
- Invoice number.
- Payment.
- Financial Plan.
- Installment.
- Appointment.
- Treatment Plan.
- Service/procedure.
- Inventory item.
- Supplier.
- Purchase Order.
- Task.
- Request.
- Communication.
- Record.
- Event.

Results must clearly identify the result type and context and allow direct navigation.

Global Search must respect:

- tenant isolation;
- authorization;
- privacy;
- permissions;
- Arabic/English use.

Specialized search remains acceptable where it is clearly better for a focused workflow.

---

# 22. PATIENT CONTEXT

When working inside a patient context, authorized related information and actions should be reachable without unnecessary navigation away from the patient.

Potential contextual areas include:

- visits;
- appointments;
- treatment;
- financial information;
- follow-up;
- communication;
- medical records;
- Portal-related information.

Patient Context is a navigation/interaction surface, not a new Domain.

---

# 23. CROSS-DOMAIN INTEGRATION

Domains remain independent.

The user experience should nevertheless make real workflows understandable.

Example:

**Patient/Visit → Treatment Plan → Financial Commitment → Installments/Payments → Appointment/Clinical Action → Resource Consumption → Operational Work → Follow-up → Communication → Patient Portal → Insights**

The system should expose relevant relationships through contextual navigation/actions without moving Domain ownership.

PJ remains the Patient Journey reference/owner.

AJM Domains remain independent capabilities integrated with PJ.

---

# 24. DISCOVERABILITY

For every important capability ask:

- Can the user find it?
- Is its location logical?
- Is its name understandable?
- Is it available from the right context?
- Is there more than one unnecessary entry point?
- Is the user required to understand internal architecture?
- Is the feature hidden without a reason?
- Is an item visible but not useful?
- Can a common task be completed without unnecessary page changes?

---

# 25. DUPLICATION / LEGACY

Search for:

- duplicate routes;
- duplicate pages;
- duplicate components;
- duplicate Domain logic;
- duplicate navigation registrations;
- duplicate Overview pages;
- duplicate settings;
- legacy implementations;
- old feature flags;
- conflicting translation systems;
- dead routes;
- deprecated UI;
- unused UI;
- multiple entry points to the same operation.

Do not hide duplicates only by removing Sidebar links.

Find the authoritative implementation and remove/reconcile the root cause when authorized.

---

# 26. FUNCTIONAL COMPLETENESS

A page is not considered complete because it renders.

Where relevant verify:

- real data;
- create;
- edit;
- primary action;
- persistence;
- relationships;
- permissions;
- feedback;
- loading;
- empty state;
- error handling;
- end-to-end completion.

Operational features must be tested through their real workflow.

---

# 27. MOBILE

The user model remains the same on desktop, tablet and mobile.

Validate:

- Sidebar;
- Workspace;
- Widgets;
- Global Search;
- Patient Flow;
- Patient Context;
- tables;
- forms;
- actions;
- dialogs/drawers;
- financial surfaces;
- operational surfaces.

Widget size and movement must preserve usability rather than forcing every Widget into the desktop layout.

---

# 28. ARABIC / ENGLISH

Arabic and English must have parity in:

- navigation;
- labels;
- titles;
- Widgets;
- Search;
- errors;
- empty states;
- actions;
- terminology;
- RTL/LTR;
- ordering;
- formatting.

Do not introduce another translation mechanism.

---

# 29. PERMISSIONS / SECURITY

Do not change authorization solely for UX.

Mandatory rules:

- Role ≠ Permission.
- Workspace ≠ Security Boundary.
- Widget ≠ Permission.
- Patient Flow assignment does not bypass authorization.
- Global Search cannot expose unauthorized records.
- Tenant isolation remains mandatory.
- Auditability remains mandatory.

---

# 30. EXTERNAL RESEARCH RULE

When a decision is not already closed, research the problem rather than guessing.

First compare:

- Jane.
- Pabau.
- ERPNext.

Then expand when useful to:

- advanced SaaS products;
- ERP systems;
- CRM systems;
- productivity platforms;
- operations platforms;
- other mature systems outside healthcare.

Look for patterns, not isolated anecdotes.

Compare:

- usability;
- discoverability;
- number of steps;
- cognitive load;
- flexibility;
- scalability;
- hierarchy clarity;
- implementation fit;
- impact on other Domains.

Do not copy competitors.

If the best external pattern is unsuitable for CORE SYSTEM, do not use it.

---

# 31. ARCHITECTURAL DECISION RULE

Do not create a new architectural decision merely because a different design looks cleaner.

If the issue is:

**Implementation problem:** fix it.

**UX issue covered by an approved decision:** implement the approved decision.

**Documentation inconsistency:** reconcile the documentation.

**Genuine new architectural decision:** stop and present the evidence, alternatives and recommendation for approval.

Do not silently convert a recommendation into a decision.

---

# 32. EXECUTION STAGES

## STAGE 0 — BASELINE + AJM RECONCILIATION LOCK

### Purpose
Establish the exact starting state.

### Inspect
Read all governing documents. Inspect repository navigation, Workspaces, Sidebar, Overview, Dashboard, Widgets, Patient Flow, Queue, Patient Context and relevant AJM/PJ implementations.

Inspect database/runtime where required.

### Produce

- Current UX Architecture Map.
- Navigation Map.
- Domain Surface Map.
- Parent/Child Map.
- Duplication Map.
- Discoverability findings.
- Usability findings.
- Runtime discrepancy list.
- Global Search assessment.
- AJM Implementation Status Matrix.
- AJM ↔ UX/IA conflict map.
- PJ ↔ UX/IA conflict map.

### Rule
No broad product restructuring in Stage 0.

### Close
Update documentation and commit the baseline.

---

## STAGE 1 — NAVIGATION + INFORMATION ARCHITECTURE RECONCILIATION

### Purpose
Establish one coherent hierarchy for Domains, sub-areas, features and contextual actions.

### Work

- classify current Sidebar entries;
- identify top-level Domains;
- identify subdomains/features;
- map parent/child relationships;
- reconcile duplicate routes and navigation registrations;
- identify contextual actions;
- identify direct navigation needs;
- ensure Settings does not contain operational work;
- preserve Domain ownership;
- reuse valid AJM navigation work.

### Do not

- create Domains just because routes exist;
- remove capabilities merely because they do not belong in Sidebar;
- change authorization.

### Validation
Test representative user tasks and mobile navigation.

### Documentation
Update navigation/IA documents and AJM status.

---

## STAGE 2 — USER SURFACE: ROLE + PERMISSION + SIDEBAR + WORKSPACE

### Purpose
Implement the approved user surface model.

### Work

- verify role templates are advisory;
- verify custom roles can be created/saved;
- verify Clinic Admin can assign available permissions;
- ensure permission categories are not restricted by role label;
- derive accessible Sidebar capabilities from authorization;
- establish Workspace as the working surface;
- ensure Workspace is not a security boundary;
- ensure Sidebar remains the complete authorized capability surface.

### Required scenarios

Test users with different combinations of clinical, administrative, financial and operational permissions.

### AJM check
Verify AJM workspaces and capabilities are not duplicated or incorrectly tied to role labels.

---

## STAGE 3 — WORKSPACE FOUNDATION

### Purpose
Make Workspace genuinely useful for daily work.

### Work

- inspect existing Workspace implementation;
- reuse it where sound;
- extend it where incomplete;
- define default Workspace content;
- support high-frequency tasks;
- distinguish Workspace from Overview and Dashboard;
- preserve Sidebar as full navigation.

### Required examples
Where authorized and useful:

- patient search;
- quick registration;
- quick booking;
- daily work;
- attention items;
- operational tools.

### Validation
Confirm that users can begin useful work from Workspace rather than using it only as a summary screen.

---

## STAGE 4 — WORKSPACE PERSONALIZATION

### Purpose
Allow each user to arrange the Workspace around actual work.

### Work

- add Widgets;
- remove Widgets;
- reorder Widgets;
- drag/drop;
- scrolling/swiping;
- persistence;
- default configuration;
- reset.

### Important
Do not compress Widget dimensions arbitrarily.

The Workspace must accommodate additional Widgets through movement/scrolling rather than suppressing available authorized Widgets.

### Permission test
Removing permission must affect the corresponding Widget regardless of previous placement.

---

## STAGE 5 — WIDGET LIBRARY + DOMAIN CLASSIFICATION

### Purpose
Determine what should become a Widget and what should not.

### Work
For every Domain:

1. Understand daily workflow.
2. Identify high-frequency/urgent actions.
3. Identify useful status/attention information.
4. Determine whether a Widget adds value.
5. Classify Widget type.
6. Define required permissions.
7. Define natural size.
8. Define mobile behavior.
9. Determine whether Sidebar access is also required.
10. Determine whether a Quick Action is better.

### Rule
Do not create Widgets merely because a page exists.

Some Domains should have no Widget.

---

## STAGE 6 — PATIENT FLOW + QUEUE RECONCILIATION

### Purpose
Preserve and improve the existing Patient Flow as one independent system.

### Work

- inspect existing Queue;
- inspect drag/drop;
- inspect patient movement;
- inspect visit start/close lifecycle;
- inspect reception → clinical → reception/accounting movement;
- inspect existing role/context handling;
- reconcile Operations view;
- reconcile Clinical view;
- reconcile Administrative view;
- verify explicit Clinic Admin activation;
- verify Patient Flow is not automatically exposed by Operations role/Workspace;
- verify Queue Widget integration does not replace Patient Flow.

### Critical test matrix

- Operations user without Patient Flow.
- Operations user with Patient Flow Operations.
- Clinical user with Patient Flow Clinical.
- Administrative user with Patient Flow Administrative.
- Operations user with financial permissions but no Patient Flow.

### Rule
Do not create a second queue or second Patient Flow implementation.

---

## STAGE 7 — PATIENT CONTEXT + CROSS-DOMAIN CONTEXTUAL NAVIGATION

### Purpose
Reduce unnecessary navigation while preserving Domain ownership.

### Work

Provide appropriate contextual access from a patient/visit context to authorized:

- appointments;
- treatment;
- financial information;
- follow-up;
- communication;
- records;
- Portal-related capabilities.

### Rule
Contextual integration must not merge Domains.

---

## STAGE 8 — GLOBAL SEARCH

### Purpose
Deliver a true system-wide search experience.

### Work

- inspect existing search systems;
- identify duplicate search implementations;
- determine searchable entity categories;
- design result type/context presentation;
- support direct navigation;
- enforce authorization and tenant isolation;
- support Arabic/English;
- preserve specialized searches where useful.

### Definition of Done
User can search without knowing which Domain contains the information and can directly open an authorized result.

---

## STAGE 9 — OVERVIEW + DASHBOARD RECONCILIATION

### Purpose
End the confusion between Workspace, Overview and Dashboard.

### Work

- inventory all Overview pages;
- classify their content;
- remove operational duplication from Overview where appropriate;
- inventory Dashboards;
- distinguish management/analytics from daily work;
- preserve useful information;
- use Widgets for executable daily work where appropriate.

### Rule
Do not turn Overview into a second Domain.

---

## STAGE 10 — SIDEBAR FINAL RECONCILIATION

### Purpose
Finalize navigation only after Workspace/Widgets/Patient Flow behavior is established.

### Work

- confirm top-level Domains;
- confirm parent/child relationships;
- confirm contextual features;
- confirm Patient Flow visibility rules;
- confirm Sidebar is not a Widget shortcut list;
- remove proven duplicates/legacy entries;
- validate direct access to full capabilities.

---

## STAGE 11 — MOBILE + RESPONSIVE WORKFLOW

### Purpose
Ensure the model remains usable on small screens.

### Work

Validate:

- Sidebar;
- Workspace;
- Widget movement;
- search;
- forms;
- tables;
- Patient Flow;
- Patient Context;
- operational actions;
- financial actions.

Do not sacrifice Widget function merely to imitate a desktop grid.

---

## STAGE 12 — ARABIC + ENGLISH PARITY

### Purpose
Ensure the reorganized system behaves as one bilingual product.

### Work

Validate:

- labels;
- hierarchy;
- terminology;
- search;
- Widgets;
- actions;
- errors;
- empty states;
- RTL/LTR;
- Sidebar direction;
- ordering;
- formatting.

No hard-coded parallel translation mechanism.

---

## STAGE 13 — SECURITY + PERMISSION REGRESSION

### Purpose
Prove that UX personalization has not weakened authorization.

### Test

- role/permission combinations;
- cross-domain permissions;
- Widget availability;
- Widget persistence after permission removal;
- Patient Flow assignment;
- Global Search authorization;
- tenant isolation;
- Clinic Admin visibility;
- delegated administrative visibility.

---

## STAGE 14 — RUNTIME + END-TO-END VALIDATION

### Purpose
Verify that approved design, repository and production behavior agree.

### Work

Validate through deployed runtime and database where necessary:

- navigation;
- Workspace;
- Widgets;
- Patient Flow;
- Search;
- actions;
- persistence;
- data relationships;
- permissions;
- mobile;
- Arabic/English;
- key AJM workflows;
- key PJ workflows.

---

## STAGE 15 — LEGACY + DUPLICATE CLEANUP

### Purpose
Remove technical and UX duplication only after authoritative implementations are proven.

### Work

- remove obsolete navigation registrations;
- remove duplicate components;
- remove superseded UI;
- remove stale feature flags;
- remove dead routes;
- remove obsolete translation paths;
- preserve auditability.

Every removal must have evidence.

---

## STAGE 16 — AJM FINAL CROSS-RECONCILIATION

### Purpose
Ensure Global UX/IA has not broken or silently superseded AJM work.

### Work
Recheck every AJM stage:

- completed;
- partially completed;
- validation pending;
- in progress;
- blocked;
- not started;
- needs reconciliation.

Verify future AJM stages remain compatible with the new user-surface model.

Update AJM documents where required.

---

## STAGE 17 — PJ FINAL CROSS-RECONCILIATION

### Purpose
Ensure Patient Journey remains intact.

Verify:

- Patient Flow;
- Queue;
- visit lifecycle;
- appointments;
- treatment plan;
- follow-up;
- communication;
- Portal;
- patient context.

No UX change may redefine PJ ownership without explicit approval.

---

## STAGE 18 — DOCUMENTATION CLOSURE

### Purpose
Make documentation and implementation identical in meaning.

Update all affected:

- Global UX/IA documents;
- Implementation Plan;
- AJM Master/Plan/Stage Index and affected stage documents;
- PJ documents;
- Workspace architecture;
- Patient Flow documentation;
- Navigation/IA maps;
- ADRs;
- handoff documents;
- status matrices.

A stage cannot be called closed while its approved behavior is undocumented.

---

# 33. DOCUMENTATION GOVERNANCE — NON-NEGOTIABLE

After every stage:

**Implement → Validate → Document → Commit → Recheck → Next Stage**

Do not postpone documentation until the end.

If a stage reveals that an earlier document is wrong or incomplete, update it immediately and record the reason.

The next conversation must be able to continue from the repository without relying on memory.

---

# 34. REQUIRED STAGE CLOSURE RECORD

Every completed stage must record:

1. Stage name and number.
2. Date.
3. Starting repository commit.
4. What was inspected.
5. What was reused.
6. What was extended.
7. What was reconciled.
8. What was created and why.
9. What was removed and evidence for removal.
10. AJM impact.
11. PJ impact.
12. Database impact, if any.
13. Runtime validation.
14. Mobile validation.
15. Arabic/English validation.
16. Permission/security validation.
17. Known limitations.
18. Remaining work.
19. Documentation updated.
20. Final commit.

---

# 35. WHEN TO STOP

Stop and ask for an explicit decision only when:

- a genuinely new architectural decision is required;
- two approved decisions directly conflict;
- correcting the issue would change Domain ownership;
- correcting it would change authorization architecture;
- correcting it would change an already closed major architectural decision;
- the technically correct solution cannot be selected from existing approved decisions.

Do not stop merely because an implementation is difficult.

Do not ask for permission to execute a correction that is already clearly authorized by this document and the governing architecture.

---

# 36. REQUIRED FINAL TEST SCENARIOS

At minimum validate:

### User surface
- user with minimal permissions;
- reception user;
- clinical user;
- administrative user;
- user with cross-domain permissions;
- Clinic Admin.

### Workspace
- default Workspace;
- add Widget;
- remove Widget;
- reorder Widget;
- drag/drop;
- scrolling/swiping;
- reset;
- permission removal.

### Patient Flow
- no Patient Flow assignment;
- Operations Patient Flow;
- Clinical Patient Flow;
- Administrative Patient Flow;
- Queue behavior;
- patient movement;
- visit start;
- visit closure.

### Navigation
- Sidebar;
- contextual navigation;
- parent/child features;
- Global Search.

### Security
- unauthorized result hidden;
- tenant isolation;
- permission combinations;
- Widget cannot bypass permission.

### Language
- Arabic;
- English;
- RTL;
- LTR;
- terminology parity.

### Devices
- desktop;
- tablet;
- mobile.

---

# 37. FINAL DEFINITION OF DONE

The work is complete only when CORE SYSTEM:

1. Feels like one integrated system.
2. Preserves independent Domains.
3. Presents a clear global navigation hierarchy.
4. Gives each user a Workspace suited to authorized work.
5. Allows Workspace personalization without granting unauthorized capability.
6. Uses Widgets for meaningful information and executable daily work where appropriate.
7. Does not force every Domain to become a Widget.
8. Keeps Sidebar as complete authorized navigation rather than a shortcut list.
9. Keeps Patient Flow independent.
10. Preserves the existing Queue and Patient Flow capabilities.
11. Provides exactly three Patient Flow views: Operations, Clinical, Administrative.
12. Requires explicit Patient Flow enablement/assignment.
13. Does not expose Patient Flow automatically merely because of Operations role/Workspace.
14. Keeps Overview contextual.
15. Keeps Dashboard administrative/management oriented.
16. Provides true Global Search.
17. Provides useful Patient Context.
18. Preserves authorization and tenant isolation.
19. Preserves auditability.
20. Preserves useful existing AJM/PJ implementation.
21. Completes or reconciles partially completed AJM work.
22. Accounts for AJM stages not yet started.
23. Keeps future AJM stages compatible with the new UX model.
24. Keeps PJ behavior and ownership intact.
25. Removes duplicate/legacy implementation at the source where proven.
26. Works on mobile.
27. Maintains Arabic/English parity.
28. Matches repository and runtime.
29. Has no undocumented approved behavior.
30. Has no unresolved active documentation contradiction.

---

# 38. FINAL EXECUTION PRINCIPLE

CORE SYSTEM must hide unnecessary complexity, not capability.

The correct outcome is:

**Flexible System + Controlled Surface + Deep Capability + Clear Navigation + Personal Workspace + Explicit Integration**

The implementation must continuously preserve this balance.

**Never trade away system capability merely to make the interface look simpler.**

**Never allow implementation convenience to override the approved user model.**

**Never allow conversation memory to become the source of truth. The repository documentation is the continuity mechanism.**
