# CORE SYSTEM — Visual Design Execution Contract
## Clinical Precision / F1–F4
### 2026-09-15

**Status:** BINDING EXECUTION CONTRACT — OPEN  
**Parent:** `CORE-SYSTEM-VISUAL-DESIGN-CONSTITUTION.md`  
**Governance:** Experience Constitution + Decision Registry + Integrated Experience Work Contract + Experience Execution Gate

## 1. Scope

This contract governs the implementation of the approved Clinical Precision visual foundation through:

- F1 Login;
- F2 Header;
- F3 Home;
- F4 Home → Workspace transition.

It does not authorize redesign of unrelated domains.

## 2. Mandatory lifecycle

`VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE`

## 3. Decision lock

Fixed decisions that must not be reopened:

- Concept 01 — Clinical Precision is the global visual foundation.
- One Adaptive Hybrid Experience System remains Horizon / Vertex / Zenith.
- Information Density follows Work Complexity.
- Home is Simple + Contextual.
- Home is distinct from work surfaces.
- Notifications, Communications, Work Center, Quick Actions, and Patient Portal information remain absent from Home.
- Widgets remain deferred.
- Communications is clinic-wide for authorized clinic accounts.
- Chat is a compact surface over Communications.
- Notifications remain distinct.
- Agenda remains authoritative.
- Mobile is a focused work surface.
- Personalization does not grant authorization.

## 4. Visual implementation rules

Implementation must:

1. consume the shared token layer;
2. use semantic colors instead of raw color literals in components where practical;
3. prefer typography/spacing over decorative containers;
4. use cards selectively rather than as a universal layout language;
5. keep shadows, gradients, blur, and glow restrained;
6. preserve RTL/LTR logical properties;
7. preserve keyboard/focus/touch semantics;
8. preserve existing authoritative domain engines;
9. reuse existing brand assets before creating new ones;
10. avoid product or permission changes disguised as visual cleanup.

## 5. F1 Login acceptance

- Light/calm Clinical Precision presentation.
- Clear brand identity.
- Authentication remains functionally unchanged.
- Auth layout remains independent from the authenticated shell.
- Form labels, focus, error, password visibility, loading, recovery, register, and language behavior remain usable.
- Mobile remains comfortable and intentional.

## 6. F2 Header acceptance

- Header remains a persistent global shell.
- Canonical order remains Brand/Home → Search → Communications → Chat → Notifications → Quick Actions.
- Functions remain independently understandable and accessible.
- The large enclosing controls pill is removed/reduced to neutral grouping only.
- Search, Communications, Chat, Notifications, and Quick Actions are reused from existing domain owners.
- Quick Actions remain Language + Logout.
- Responsive behavior preserves authorized capabilities.

## 7. F3 Home acceptance

- Home reflects Simple + Contextual.
- Approved Identity Banner concept is represented.
- Today becomes coherent daily awareness rather than scattered dashboard cards.
- Removed elements are absent.
- Widgets remain absent.
- Today's appointments use user/context-aware presentation and route to Agenda with context preserved.
- Home does not implement specialist workflow engines.

## 8. F4 Home → Workspace acceptance

- Transition preserves authoritative route/destination.
- Visual transition makes entry into work mode legible without introducing another surface layer.
- The implementation does not redesign Work Center.
- Workspace authorization and role/work-context resolution remain unchanged.

## 9. Explicit non-changes

Do not alter:

- Supabase schema or migrations for purely visual work;
- permission semantics;
- tenant isolation;
- Communication domain ownership;
- notification ownership;
- Agenda domain ownership;
- Patient Flow / Patient Journey relationship;
- unrelated module UI.

A data/routing change required to preserve existing approved context is allowed only when it is an existing implementation defect directly covered by the contract, and must remain additive/non-breaking.

## 10. Verification gate

Required before closure:

- exact diff review;
- lint/typecheck/build;
- applicable execution-contract audits;
- desktop/tablet/mobile runtime verification;
- RTL/LTR verification;
- keyboard/focus/touch verification;
- visual comparison against the constitution;
- no contract regressions;
- evidence recorded in documentation.

Vercel deployment is not part of this contract unless a later governed stage explicitly authorizes it.

## 11. Closure

F1–F4 remain OPEN until their implementation and required verification evidence are complete. The visual constitution itself is the approved foundation; implementation closure is earned through evidence.
