# CORE SYSTEM — Experience Execution Gate
## 2026-09-14

**Status:** ACTIVE — MANDATORY GATE  
**Applies to:** Login, Header, Home, Home→Workspace transition, shared experience primitives, and future surfaces explicitly governed by the Experience Constitution.

## 1. Gate A — Decision lock

Before implementation:

- read the Experience Constitution;
- read the Decision Registry;
- read the Integrated Experience Work Contract;
- read the Visual Design Constitution and Visual Execution Contract;
- list applicable Decision IDs;
- list OPEN decisions separately;
- confirm no recommendation has been silently promoted to APPROVED.

The approved visual foundation is **Concept 01 — Clinical Precision**. It must not be reopened during F1–F4 execution.

**PASS:** scope is traceable to the Registry and Visual Constitution.

## 2. Gate B — Authority inspection

Inspect existing authoritative implementations for:

- routing;
- authorization;
- Search;
- Communications;
- Chat;
- Notifications;
- Agenda/Calendar;
- Workspace resolution;
- shared visual primitives;
- existing brand assets.

Use:

**Inspect → Reuse → Extend → Create.**

Introducing a parallel authority/engine without an approved architectural decision is a failure.

## 3. Gate C — Contract invariants

Verify:

- Home remains distinct from My Workspace, Role Workspace, Work Center, Communications, Notifications, and specialist domains.
- Work Center remains absent from Home.
- Notifications remain absent from Home.
- Communications remains absent from Home.
- Quick Actions remain absent from Home.
- Patient Portal information remains absent from Home.
- Widgets remain deferred unless explicitly reopened.
- Communications remains clinic-wide for authorized clinic accounts.
- Chat remains a compact Communications surface.
- Agenda remains authoritative.
- Calendar does not become a second scheduling engine.
- Mobile remains a focused work surface.
- RTL/LTR and accessibility semantics remain correct.
- Clinical Precision remains the shared visual foundation; no alternate visual theme is introduced.
- Cards are not treated as the universal layout language.
- Decorative gradients/glass/glow are not introduced as default identity.

## 4. Gate D — Diff review

Before acceptance:

- inspect exact diff;
- verify files are in scope;
- identify unrelated changes;
- verify no new data/routing engine;
- verify no hidden authorization change;
- verify no silent product decision encoded in generic primitives;
- verify shared visual tokens are used consistently.

## 5. Gate E — Automated validation

Run applicable:

- typecheck;
- lint;
- unit/integration tests;
- authorization/RLS tests where affected;
- build;
- relevant existing UX execution audits.

Record exact run/evidence identifiers.

Green CI is necessary but not sufficient for visual closure.

## 6. Gate F — Runtime visual verification

For visual work verify at minimum:

- desktop;
- tablet;
- mobile;
- RTL;
- LTR;
- relevant open/pressed/unread/error states;
- keyboard/focus where applicable.

Retain screenshots or equivalent objective evidence when visual approval is required.

## 7. Gate G — Product Owner decision gate

The Product Owner has already approved the global visual foundation as Concept 01 — Clinical Precision. During F1–F4 execution, do not reopen that decision.

Implementation still requires Product Owner acceptance for any genuinely new visual/product decision that falls outside the approved constitution, including:

- material change to global visual identity;
- new visual language not covered by Clinical Precision;
- functional/product behavior disguised as visual work.

Final runtime acceptance of F1–F4 remains a closure gate.

## 8. Gate H — Documentation reconciliation

After implementation/verification:

- update the Decision Registry;
- update the Work Contract status;
- update affected surface-specific contracts/findings;
- record evidence;
- record remaining OPEN items;
- do not mark CLOSED while obligations remain incomplete.

## 9. Failure handling

If any gate fails:

**Status = NOT CLOSED.**

Fix technical failures when possible. Return product/visual judgment to the Product Owner when required. Never disguise a failed gate as documentation wording.

## 10. Mandatory handoff template

```text
Scope:
Applicable Decision IDs:
OPEN Decisions:
Authoritative Existing Implementations:
Approved Visual Foundation:
Planned Changes:
Explicit Non-Changes:
Duplicate-Engine Check:
Automated Validation:
Runtime Validation:
Product Owner Visual Approval:
Remaining OPEN Items:
Closure Status:
```

## 11. Permanent rule

The gate itself remains ACTIVE permanently.

Individual work closes only when all applicable gates pass and the Decision Registry contains evidence.

The overall Experience Foundation remains **NOT CLOSED** until its execution obligations are objectively satisfied.
