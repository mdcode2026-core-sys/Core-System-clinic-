# CORE SYSTEM — UX / Architecture Investigation Final Handoff
## Handoff for Next Conversation: Constitution & Integrated Work Contract
### 2026-09-14

**Purpose:** Transfer the complete current context into the next conversation without reopening the fourth UX investigation or silently changing approved decisions.

**Repository:** `mdcode2026-core-sys/Core-System-clinic-`
**Current documentation branch:** `docs/ux-experience-governance-foundation-2026-09-14`
**Main baseline at branch creation:** `d85a5de23051919fb347e1482bc28f5fe70c0e14`
**Governance PR:** #124 — Draft/Open, documentation/governance only, NOT merged, NOT closed.
**Experience Foundation:** **NOT CLOSED**.

---

## 1. OPERATING CONTRACT FOR THE NEXT CONVERSATION

The next conversation MUST NOT restart UX investigation from zero.

The investigation has already been completed to the current agreed extent. The next work is to execute against the repository governance layer and the Product Owner's approved decisions.

The assistant is the software architect/engineer/UX advisor/implementer. The user is the Product Owner and final decision maker.

### Non-negotiable behavior

- Never silently turn a recommendation into an approved product/visual decision.
- Never treat an assistant-created document as Product Owner approval merely because it exists in Git.
- Never rely on conversational memory when an approved decision can be verified in `docs/`.
- Before implementation, inspect the Decision Registry, Constitution, Integrated Work Contract, Execution Gate, and relevant domain contracts.
- If a required product/visual decision is `OPEN`, stop only for that decision; do not invent an answer.
- If a requirement is already `APPROVED`, do not ask the user to re-decide it merely because the conversation is new.
- If an implementation contradicts an approved decision, classify it as a contract violation and repair it; do not rationalize it as an alternative design.
- Do not close documentation while implementation obligations remain unimplemented or unverified.
- Do not claim runtime/CI/Vercel verification without actual evidence.
- Do not use Vercel before the approved stage requires it.
- Do not create duplicate engines for existing authoritative domains.
- Preserve tenant isolation, permissions, existing data, and domain ownership.

### Preferred execution cycle

`VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE`

Closure is earned by evidence, not by writing a document.

---

## 2. WHY THIS GOVERNANCE LAYER WAS CREATED

This UX investigation was repeated multiple times because previous findings were not reliably converted into a durable execution control mechanism. The failure was not simply lack of UX research; it was loss of context between investigation and implementation.

The corrective mechanism is now four-layer governance:

1. **Experience Constitution** — what the experience must fundamentally be.
2. **Decision Registry** — what the Product Owner has actually approved versus what remains open/proposed.
3. **Integrated Experience Work Contract** — how the approved experience must behave across surfaces and boundaries.
4. **Experience Execution Gate** — mandatory pre-implementation and pre-closure checks proving compliance.

These are intended to prevent memory-based development and replace it with contract-based development.

---

## 3. CURRENT GOVERNANCE DOCUMENTS

The documentation branch contains:

- `docs/CORE-SYSTEM-EXPERIENCE-CONSTITUTION-AND-GOVERNANCE-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-DECISION-REGISTRY-2026-09-14.md`
- `docs/CORE-SYSTEM-INTEGRATED-EXPERIENCE-WORK-CONTRACT-2026-09-14.md`
- `docs/CORE-SYSTEM-EXPERIENCE-EXECUTION-GATE-2026-09-14.md`
- Updated `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`
- This handoff: `docs/CORE-SYSTEM-UX-ARCHITECTURE-INVESTIGATION-FINAL-HANDOFF-2026-09-14.md`

The Governance PR is intentionally **Draft/Open** because these documents define the execution control but the actual Login/Header/Home execution is not finished.

---

## 4. PRODUCT VISION — DO NOT LOSE THIS

CORE SYSTEM is the clinic operating system / medical CRM / business intelligence platform for clinics, initially focused on aesthetic, dermatology, laser, skin, beauty and cosmetic clinics, with broader medical-center applicability later.

It is NOT:

- a booking-only product;
- a generic sales CRM;
- a collection of disconnected dashboards.

Architecture principle:

> **Independent Modules + Integrated Platform**

Modules remain independently meaningful, but integrate through relationships, events, data, and authoritative domain ownership.

---

## 5. ADAPTIVE HYBRID EXPERIENCE MODEL — APPROVED

CORE SYSTEM has **one Experience System**, not three visual themes/designs.

```text
Horizon = Foundation
Vertex  = Work Engine
Zenith  = Experience Layer
```

Plain-language rule:

> **Horizon controls simplicity. Vertex provides capability. Zenith adapts the experience.**

Formal principle:

> **Information Density must follow Work Complexity.**

### Horizon
Simplicity, clarity, hierarchy, limited important elements, learnability, consistency, accessibility, and avoidance of unnecessary complexity.

### Vertex
Professional work capability, density when complexity requires it, advanced workflows, monitoring, management views, analytics, and real execution.

### Zenith
Contextual presentation, personalization, adaptive emphasis, and human-centered presentation.

### Surface balance

- Login: Horizon dominant.
- Home: Horizon + Zenith — Simple + Contextual.
- My Workspace: Zenith + Horizon.
- Clinical Workspace: Vertex + Horizon + Zenith.
- Operational Workspace: Vertex + Horizon + Zenith.
- Administrative Workspace: Vertex + Zenith + Horizon.
- Modules/Domains: Horizon navigation, Vertex actual work, Zenith contextual presentation.
- Analytics: Vertex dominant, Horizon clarity, Zenith context.
- Mobile: Horizon + Zenith + task-required Vertex — a focused work surface.

---

## 6. VISUAL FOUNDATION — LOGIN × HEADER × HOME

The Product Owner explicitly established these three as the visual foundation of the whole system:

1. **Login**
2. **Header**
3. **Home**

They must be tuned as the foundation before the resulting language is propagated through other surfaces.

Reasoning that must remain intact:

- Login establishes the first visual trust and ease experience.
- Header accompanies the user throughout authenticated use and therefore must be exceptionally organized and polished.
- Home is the user's window into the system and should make users understand what matters and where to work.
- Entering Workspace should feel like entering work mode.
- Ease/smoothness should be established before seriousness/trustworthiness.
- Professionalism must not be expressed through unnecessary complexity.
- Mobile should feel like a phone application/work surface, not a shrunken desktop web page.

The exact colors, typography, dimensions, and other detailed visual choices are **not automatically approved** merely by this foundation statement.

---

## 7. LOGIN — CURRENT FINDINGS / STATUS

Current implementation was investigated in:

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/layout.tsx`

Current functional shape:

- dark authentication card;
- stethoscope icon in a circle;
- Login title;
- Email;
- Password;
- Forgot password;
- Sign in;
- Register prompt;
- dark gradient authentication background with blur treatment;
- language switcher in the authentication layout.

Assessment:

- Functionally clear and solid.
- It should remain a dedicated authentication experience; do NOT put the authenticated Header/Sidebar into Login.
- It should align visually with the broader system language without becoming a copy of the authenticated shell.
- Horizon should dominate: simple, calm, confident.

**Status: OPEN for execution/refinement.**

---

## 8. GLOBAL HEADER — APPROVED CONCEPTUAL CONTRACT

The Header is a persistent global access layer, not Home and not a work dashboard.

Canonical conceptual order:

```text
[Brand / Home] | [Global Search] | [Communications] [Chat] [Notifications] [Quick Actions]
```

An existing mobile navigation trigger may remain separately as shell infrastructure; it is not a Quick Action.

The Header must NOT become:

- a second Home;
- a Role Workspace;
- My Workspace;
- a Module directory;
- a universal business-action launcher;
- a second Communications engine;
- a second notification engine;
- an authorization boundary.

### Approved global functions

- System identity / Brand / Home.
- Existing Global Search.
- Communications.
- Chat.
- Notifications.
- Quick Actions.

Quick Actions initial approved scope:

- Language.
- Logout.

No business action is added merely for convenience.

### Header visual direction

Approved direction from the existing Header execution contract:

**modern + professional + clean + calm + clearly usable + medically credible**

Not marketing-heavy/overdesigned, and not so minimal that it appears cheap/unfinished.

Priority:

1. system identity/Home;
2. search;
3. global communication/notification access;
4. user/interface actions.

Controls should be grouped without large cards or excessive containers. Familiar icons, accessible names/tooltips, labels at wider breakpoints when useful, no decorative icon clutter.

Compact enough for a dense clinic application but with comfortable touch targets and clear separation.

Required states where applicable: idle, hover, focus-visible, pressed/open, loading, unread/attention, disabled/error.

Unread state cannot rely on color alone.

### Responsive

Desktop: Brand/Home | Search flexible | Communications | Chat | Notifications | Quick Actions.

Tablet: preserve conceptual order; reduce search width before removing global functions; use icon + tooltip/accessibility label where needed; preserve touch targets.

Mobile: preserve authorized capabilities; search may collapse; Chat/Notifications can use larger overlays; Communications may route to its full mobile surface; Brand remains visible; do not hide an authorized capability solely because the viewport is narrow.

### Accessibility / RTL

WCAG 2.2 AA-compatible patterns are the target. Semantic Header landmark, accessible icon labels, visible focus, logical tab order, Enter/Space activation, Escape close, focus restoration, correct expanded state, adequate touch targets, no color-only unread state, announcements for dynamic unread counts, no traps.

Arabic/RTL and English/LTR are both required. Use logical layout relationships, support long Arabic content/names, correct badge positioning, and verify keyboard/focus order in both directions.

### Existing implementation finding

`src/features/workspace/GlobalHeader.tsx` currently renders Communications/Chat/Notifications/Quick Actions in one bordered grouped container. Architecturally this is consistent with a shared Header, but visually it can read as one single "tool block" rather than four independent global functions.

This is a **visual finding**, not an approved final visual solution. Do not silently prescribe exact replacement styling without Product Owner approval if the choice is not already covered by an approved contract.

### Header execution status

A previous Header UX/UI Phase 2 was technically closed in its own contract, with historical Unified Test Execution Engine Run #186 / ID `34754227498`, but the Product Owner still found the visual result insufficient and did not consider the overall Header visual foundation closed.

Previous Header candidate commit: `281938bbcc3503f1012b582265892d6b27743e59`.

The separate final Header execution contract is:
`docs/HEADER-UX-UI-FINAL-EXECUTION-CONTRACT-2026-09-13.md`

Technical foundation:
`docs/HEADER-TECHNICAL-FOUNDATION-2026-09-11.md`

Do not confuse technical Phase 2 closure with overall visual foundation closure.

---

## 9. COMMUNICATIONS — CRITICAL CORRECTION

**Communications is clinic-wide internal communication across all authorized clinic accounts. It is NOT doctor-only and NOT a medical-team-only system.**

The purpose is communication between the clinic team generally, subject to authorization.

Examples may include clinical, reception, operational, administrative, coordination, and other authorized internal communication.

Chat is a compact interaction surface over Communications.

Chat MUST NOT create:

- parallel database;
- parallel conversation engine;
- separate permission model;
- second communication domain.

Communications remains authoritative for the complete communication domain.

Chat supports immediate conversation interaction and may be compact/overlay-based.

This correction is important because a previous interpretation incorrectly focused on doctor-to-doctor communication. That interpretation is superseded and must not return.

---

## 10. NOTIFICATIONS

Notifications are separate from Communications and separate from Follow-up.

Header Notifications is the global access point to the existing personal notification feed.

Approved behavior in the Header contract includes:

- personal unread count;
- reading changes read state rather than deleting the notification;
- unread count updates after successful read;
- Mark all as read;
- notification remains in feed/history window after reading;
- actionable notifications route to authoritative destinations only after valid destination metadata is established;
- never guess a route from notification title/message text;
- no second notification store in Header UI.

If a destination is missing/invalid, retain authoritative notification context rather than inventing navigation.

---

## 11. HOME — APPROVED CURRENT DECISIONS

Home is an independent global starting/awareness surface.

It is not Role Workspace, My Workspace, Work Center, full Notifications, full Communications, or a module directory.

Approved Home direction:

> **Home = Simple + Contextual**

Home should answer:

- What matters now?
- What needs attention?
- Where should I go to do the work?

It should not become a specialist workspace or duplicate authoritative engines.

### 11.1 Identity banner — APPROVED

Desktop:

- Banner inside page bounds.
- Under "الرئيسية / Home".
- Clinic name + clinic logo.
- User name.
- Welcome message on login.
- Welcome disappears after first page change/navigation.
- Weather may be integrated elegantly and lightly without affecting work.

Tablet: same concept proportionally adapted.

Mobile: presentation should feel like a phone app, not merely compressed desktop.

Exact visual details remain open unless separately approved.

### 11.2 Today / Daily Awareness — APPROVED DIRECTION

Do NOT use scattered cards, especially on mobile.

Desktop/tablet may use a more expanded presentation, but should not revert to a scattered dashboard/card-grid style.

Transition into Agenda must preserve correct context.

### 11.3 Home removals — EXPLICITLY APPROVED

The following are removed from Home:

- Notifications.
- Communications.
- Work Center.
- Quick Actions.
- Patient Portal Information.

**Work Center removal is an explicit independent product decision. It has no direct conceptual relationship to Home's work model and must not trigger a redesign/discussion of Work Center.**

Work Center can be addressed separately later on its own terms.

### 11.4 Widgets / Personalized Widgets

Deferred.

Widgets are a separate phase and must not be mixed into the current Home redesign/foundation work.

### 11.5 Current Home implementation defect

Current `src/app/(dashboard)/page.tsx` was found to:

- count today's appointments tenant-wide;
- route Today's Appointments to generic `/agenda`;
- route waiting / clinical work / completed to `/workspace`;
- include Notifications & reminders;
- include Internal communications;
- include Work Center;
- include Patient Portal information;
- use card/grid dashboard presentation.

Therefore the current implementation is **not the final approved Home**.

The "Today's Appointments" route is a known implementation defect because it loses the user's/situational context by going to generic `/agenda`.

Do not interpret this as a new product decision; it is an implementation correction required by the existing intent.

---

## 12. HOME ↔ WORK BOUNDARY

Home can tell the user what is happening or provide a fast route to work.

The relevant Workspace/Domain performs actual work.

Examples:

- Home: patients waiting → Clinical Workspace.
- Home: today's schedule → Agenda.
- Home: relevant work item → Work Center / authoritative domain only if intentionally present elsewhere; NOT on Home under current decision.

Home must not duplicate complete queues, agenda engines, billing workflows, clinical visit workflows, communication systems, analytics engines, inventory workflows, or workforce workflows.

The user explicitly stated that Work Center removal from Home is not a reason to redesign Work Center.

---

## 13. WORKSPACE / ROLE / PERMISSION BOUNDARIES

Roles:

- **Super Admin** = platform owner/lessor, not tenant operator.
- **Clinic Admin** = tenant/main clinic administrator with broad clinic control after subscription; above ordinary Administration; not Super Admin.
- `clinic_owner` should be retired/removed.

Clinical / Operational / Administration are Patient Flow workspace classification labels, not roles.

Primary Role → Primary Work Context → Role Workspace.

Effective Permissions → Authorized Capabilities → Sidebar / Widgets / My Workspace / permitted actions.

Additional permissions do NOT redefine:

- Primary Role;
- Primary Work Context;
- Role Workspace.

A clinical user can legitimately have authorized financial/operational/administrative/reporting capabilities without becoming an administrative user or changing Clinical Workspace.

My Workspace is personal, configurable, permission-aware, action-oriented, and may surface authorized cross-domain capabilities.

My Workspace is NOT Home, Role Workspace, a second authorization system, a second Patient Flow engine, or a full duplicate of a domain.

Personalization changes presentation only; it never grants authorization.

Sidebar shows authorized domains independently of primary classification.

Do not introduce artificial constructs such as `My Financial` or `My Agenda` merely to represent cross-domain permissions.

---

## 14. PATIENT FLOW / PATIENT JOURNEY

Patient Flow is a workflow concept, not a sidebar domain. It begins after the patient enters the clinic.

Patient Journey is separate from Patient Flow.

Patient Journey documentation location:
`/CORE SYSTEM/Patient Journey/PJ/`

Source: `PJ-Complete-Source-Documents.zip`

Approved plan date: 2026-08-18.

Stages 0–10 closed, 11 provisional, 12 implementation/production verification.

Do not merge Patient Flow and Patient Journey in future UX reasoning.

---

## 15. AGENDA / CALENDAR

Agenda is the authoritative planning/availability domain.

Calendar is the visual/operational representation of Agenda, not a second scheduling engine.

Current authoritative page: `/agenda`.

Calendar implementation exists under `src/features/agenda/agenda-calendar.tsx`.

Home can provide lightweight calendar/date awareness without becoming Agenda.

Today's Appointments routing must preserve the correct user/situational context when moving to Agenda.

Do not create a second scheduling engine.

---

## 16. WORK CENTER

Current Work Center is an independent work coordination surface.

Current implementation includes:

- `work:read` / `work:manage` permission checks;
- `operational_work_items`;
- active clinic users and patients;
- create work;
- update status;
- assign;
- handoff;
- escalate;
- work kinds: task, request, handoff, next_action, escalation;
- metrics: Due today, Overdue, Unassigned, Escalated;
- work queue;
- ownership/assignment/handoff/escalation controls.

Current title: "My Work / Work Center".

**Home removal is closed. Work Center's own UX is not being redesigned as part of this Home foundation unless a separate decision/workstream explicitly opens it.**

---

## 17. CURRENT HOME / HEADER IMPLEMENTATION EVIDENCE

### Home
`src/app/(dashboard)/page.tsx` currently contains the old card/grid and removed elements. It is not final.

### Header
`src/features/workspace/GlobalHeader.tsx` has a shared controls group. Architecture is fundamentally sound; visual semantics require refinement.

### Shell
`WorkspaceShell` composes the authenticated shell and GlobalHeader with search/communications/chat/etc.

### Sidebar branding
Sidebar has its own `ClinicSaaS™` branding treatment while Header uses the current branding asset. This is a brand-system alignment issue to resolve deliberately, not a reason to invent a new architecture.

### Login
Auth layout currently uses a dark gradient full-screen presentation with language control; login itself is a dark card with standard credentials/recovery/register actions.

---

## 18. PR #123 — DO NOT TREAT AS FINAL

PR #123:

- branch: `ux-experience-governance-verify-2026-09-14`
- latest historical head: `5406e655f2eb6b0e2f13b2fa7ca9942e238bd7d4`
- CI green historical run #229 / ID `34870317249`.
- User manually rejected it as final visual work because visual changes were minor and old Header issues remained.
- It remained open/provisional and did not represent final Home decisions.

It still contained Notifications, Communications, Work Center, Patient Portal, card-based Today links, and Quick Access patterns inconsistent with later approved Home removals.

Do not revive PR #123 as the final implementation contract.

The Adaptive Hybrid reconciliation document also states that PR #123 should not be treated as a generic card-based design system and that final Home ordering/visual hierarchy remained open.

---

## 19. VISUAL CONSTITUTION HISTORY / GOVERNANCE CORRECTION

An earlier assistant-created Visual Constitution was created without Product Owner approval:

`docs/CORE-SYSTEM-VISUAL-EXPERIENCE-CONSTITUTION-2026-09-14.md`

commit:
`0414ef1b91f81289dff7efdefe222d592173b817`

A supersession/governance record exists:

`docs/CORE-SYSTEM-UX-EXPERIENCE-GOVERNANCE-PLAN-SUPERSESSION-2026-09-14.md`

commit:
`485679d8a0a3ae847895a5e17aaf593331655248`

The lesson is binding:

> Assistant-created visual detail is not Product Owner approval.

The new Governance/Decision Registry mechanism is the correction.

---

## 20. CURRENT GOVERNANCE PR #124

PR #124:

Title: `docs: establish UX experience constitution and execution governance`

State: **OPEN**

Merged: **false**

Draft: **true**

Base: `main`

Base SHA at branch creation: `d85a5de23051919fb347e1482bc28f5fe70c0e14`

Head branch:
`docs/ux-experience-governance-foundation-2026-09-14`

Head SHA at handoff creation:
`5b36c5876e2d6bde0a2b4c1169ed978f81e6c39b`

Changed files: 6 after this handoff commit (the PR originally reported 5 before the handoff file was added; verify current state rather than relying on this historical count).

The PR explicitly states:

- governance only;
- no claim of Login/Header/Home visual completion;
- no Vercel deployment authorization;
- Experience Foundation remains NOT CLOSED.

Do not merge/close merely because documentation exists. Product Owner review/approval and implementation/verification remain required according to the contract.

---

## 21. DOCUMENT STATUS MODEL — MANDATORY

Use these statuses consistently:

- `PROPOSED` = assistant/research recommendation, not approved.
- `OPEN` = unresolved decision or execution obligation remains.
- `APPROVED` = Product Owner has explicitly accepted the decision/contract.
- `IMPLEMENTING` = approved work is actively being implemented.
- `VERIFYING` = implementation exists but required verification remains.
- `CLOSED` = only after required execution and verification evidence exists.
- `SUPERSEDED` = no longer current authority because an explicit later decision replaced it.
- `HISTORICAL` = retained as evidence of past state, not current authority.

**Do not use `CLOSED` for a Constitution, Contract, or Execution Gate while their implementation obligations remain incomplete.**

The current Experience Foundation is therefore NOT CLOSED.

---

## 22. WHAT IS APPROVED VS OPEN RIGHT NOW

### APPROVED / FIXED

- One Adaptive Hybrid Experience System: Horizon / Vertex / Zenith.
- Information Density follows Work Complexity.
- Login/Header/Home are the visual foundation surfaces.
- Home = Simple + Contextual.
- Home identity banner concept.
- Home Today should not be scattered card-grid presentation, especially mobile.
- Remove Notifications from Home.
- Remove Communications from Home.
- Remove Work Center from Home.
- Remove Quick Actions from Home.
- Remove Patient Portal information from Home.
- Work Center removal is independent; do not redesign Work Center because of it.
- Communications is clinic-wide internal communication across authorized clinic accounts.
- Chat is compact over Communications; no parallel engine.
- Notifications are separate from Communications/Follow-up and remain globally accessible in Header.
- Header conceptual order and global function set.
- Quick Actions initial scope = Language + Logout.
- Agenda remains authoritative; Calendar is not a second scheduling engine.
- Mobile is a focused work surface, not desktop shrink.
- Personalization does not grant authorization.
- Primary role/work context/workspace is independent from additional permissions.
- My Workspace is personal working presentation/configuration.
- Sidebar exposes authorized domains independently of primary classification.
- Product Owner is final authority on unresolved visual/product decisions.
- Documentation must remain open until execution and verification finish.

### OPEN / NOT YET APPROVED AS FINAL DETAIL

- Exact final Home ordering.
- Exact final Home visual hierarchy beyond approved principles.
- Exact colors, typography, spacing, dimensions, border/elevation treatment unless already separately approved by an existing contract.
- Exact final Header visual treatment needed to resolve the remaining visual dissatisfaction, where not already specified by the approved Header contract.
- Final visual relationship/alignment between Login and authenticated shell.
- Exact mobile composition details for Home/Login/Header where principles are fixed but implementation details are not.
- Deeper personalized/widget system work.
- Any new business actions in Header/Home not already approved.

The assistant may recommend solutions, but must label them as recommendations and wait for Product Owner approval when they constitute new product/visual decisions.

---

## 23. REQUIRED NEXT EXECUTION ORDER

The investigation is closed. The next work is execution and validation.

Recommended sequence already established:

### Phase A — Experience Foundation implementation contract verification

Read the four governance documents and reconcile all relevant older docs before touching implementation.

### Phase B — Login

Implement/refine only against approved principles and explicitly approved details. Verify functional auth behavior remains intact.

### Phase C — Header

Implement/refine the approved Header contract. Preserve authoritative search/communications/chat/notification systems. Resolve visual grouping and polish issues without creating parallel engines.

### Phase D — Home

Remove explicitly removed elements. Replace card-grid dashboard behavior with the approved Simple + Contextual direction. Correct Today routing/context. Implement only approved identity/banner concepts. Keep Widgets deferred.

### Phase E — Transition

Verify Home → Workspace → Domain transitions so Home remains awareness/entry and Workspace remains actual work.

### Phase F — Runtime verification

Desktop + tablet + mobile; Arabic/RTL + English/LTR; keyboard/accessibility; authorization; tenant isolation; overlays/focus; routing; real authenticated runtime.

### Phase G — Closure

Only after implementation and verification evidence: review diffs, update Decision Registry/Work Contract/statuses, document evidence, and then close the relevant phase.

Vercel must remain governed by the established deployment stage. Do not deploy merely to satisfy documentation.

---

## 24. USER COMMUNICATION RULES

The user has explicitly rejected repetitive interim reporting. Do not consume the user's time by repeatedly explaining already-established concepts.

For future execution:

- Continue until a true architectural decision, required external/action test completion, or phase closure.
- Resolve ordinary blockers rather than stopping for them.
- Do not issue a "progress report" unless requested or a genuine decision gate has been reached.
- When the user asks for a final report, make it evidence-based and complete.
- If the user asks to continue, continue from this handoff and repository governance rather than restarting the investigation.

The user has also explicitly stated that repeated rediscovery of the same principles is unacceptable because prior implementations drifted substantially from them.

---

## 25. TECHNICAL REPO / EXECUTION RULES

Repository:
`mdcode2026-core-sys/Core-System-clinic-`

Stack:
Next.js App Router 16 / React 19 / TypeScript / Supabase Auth + PostgreSQL / TanStack Query / Tailwind + shadcn-style.

Repo discipline:

- Never direct push to main for implementation.
- Use purpose branches.
- Split unrelated UI/API/DB work.
- Database changes only through Supabase migrations and appropriate testing.
- Local lint/type checks.
- Do not deploy when work is investigation-only.
- Preserve test data.
- Inspect → Reuse → Extend → Create only when required.
- No duplicate engines.
- Reconcile `schema_migrations` when live DB objects and tracked migrations diverge.
- Use the CORE SYSTEM Test Execution Contract as the required testing gate.

Preferred role/tool separation from the established workflow:

- Claude = Supabase/Vercel/live production verification and controlled execution when connected.
- Kimi = repository file implementation only; do not assume GitHub/Codespaces/Supabase/Vercel access.
- User/helper may upload ZIPs/commit when necessary.

---

## 26. CURRENT BROADER SYSTEM CONTEXT THAT MUST NOT BE LOST

Known live audit context from the prior read-only cross-domain audit (2026-09-10):

- 5 tenants.
- 290 patients.
- 285 agenda events.
- 139 visit sessions.
- 138 invoices.
- 82 payments.
- 700 follow-ups.
- 705 notification queue items.
- 17 communication requests.
- 17 operational work items.
- 122 inventory ledger entries.
- 8 workforce employees.
- 66 payroll records.
- 103 commission records.
- 1,540 attendance records.
- 264 analytics snapshots.

Migration ledger latest version: `20260909175027`.
Name mismatch observed: `20260909204800_restore_effective_permission_rpc_acl`; investigation was flagged.

Known tenant-leak audit findings:

- ALLOWED: Agenda → Patient.
- ALLOWED: Treatment Plan → Session.
- ALLOWED: Inventory Ledger → Session.
- REJECTED: Invoice → Session (`Session tenant mismatch`).
- REJECTED: Follow-up → Session (`FOLLOWUP_SESSION_TENANT_MISMATCH`) via trigger `enforce_followup_tenant_integrity`.

Advisor findings:

- 144 unindexed FKs.
- 14 auth/RLS initialization warnings.
- 158 multiple permissive policies.

Roles/permissions:

- 7 roles.
- 86 permissions.
- 240 assignments.
- 5 templates.
- 93 template-permission assignments.
- 11 workspace assignments.

These are broader engineering context, not reasons to reopen the current UX foundation unless a future task touches them.

---

## 27. ANALYTICS DEMO DATA CONTEXT

A separate approved direction exists for complete active demo clinic analytics data from 2026-01-01 linked to the main Clinic Admin test account, covering all areas including Workforce.

Inventory/purchasing/consumables should tie to dermatology, laser, aesthetics/cosmetic, skin/beauty procedures.

Cancelled and rescheduled appointments should be included; no-show should be separate.

Business Analytics and Clinical Analytics remain separate but integrated.

This is context only and is not part of the current Login/Header/Home execution unless explicitly brought into scope.

---

## 28. FINAL HANDOFF INSTRUCTION

When this file is loaded in the next conversation, treat it as a **context transfer document**, not as permission to invent additional decisions.

The first task in the next conversation should be:

1. Read this Handoff.
2. Read the four governance documents named above.
3. Read the relevant canonical/technical contracts for the surface being executed.
4. Verify repository/branch/PR state.
5. Continue from the current OPEN execution phase.

Do **not** repeat the UX investigation.
Do **not** ask the Product Owner to re-explain the boundaries recorded here.
Do **not** close the foundation merely because the governance documents exist.

The durable objective is:

> **Make the approved experience executable and verifiable so that implementation cannot silently drift away from the Product Owner's decisions.**

**END OF HANDOFF — 2026-09-14**
