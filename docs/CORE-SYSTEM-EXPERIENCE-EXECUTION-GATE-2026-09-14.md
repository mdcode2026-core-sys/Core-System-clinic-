# CORE SYSTEM — Experience Execution Gate
## 2026-09-14

**Status:** ACTIVE — MANDATORY GATE
**Applies to:** Login, Header, Home, Workspace transition, shared experience primitives, and any future surface explicitly governed by the Experience Constitution.

## 1. Gate purpose

This gate is the operational mechanism that prevents experience drift.

No implementation in scope may be treated as valid merely because it compiles or visually looks reasonable to the implementer.

The implementation must be traceable to approved decisions and must demonstrate that no approved boundary was lost.

## 2. Gate A — Decision lock

Before implementation, verify:

- `CORE-SYSTEM-EXPERIENCE-CONSTITUTION-2026-09-14.md` read.
- `CORE-SYSTEM-EXPERIENCE-DECISION-REGISTRY-2026-09-14.md` read.
- `CORE-SYSTEM-INTEGRATED-EXPERIENCE-WORK-CONTRACT-2026-09-14.md` read.
- Applicable decision IDs listed.
- OPEN decisions listed separately.
- No proposed/recommended detail has been promoted silently.

**PASS condition:** implementation scope is traceable to the Registry.

## 3. Gate B — Authority inspection

Before creating or changing UI behavior, inspect the existing authoritative implementation for:

- routing,
- authorization,
- data ownership,
- Search,
- Communications,
- Chat,
- Notifications,
- Agenda,
- Calendar,
- Workspace resolution,
- existing shared visual primitives.

Use:

**Inspect → Reuse → Extend → Create.**

**FAIL condition:** new parallel authority/engine is introduced without an approved architectural decision.

## 4. Gate C — Contract compliance review

For every change, explicitly test the following invariants:

### Surface boundaries

- Home remains Home.
- My Workspace remains personal work arrangement.
- Role Workspace remains primary professional work environment.
- Work Center remains independent.
- Communications remains clinic-wide.
- Chat remains a compact Communications surface.
- Notifications remain distinct.
- Header remains global shell.

### Home invariants

- Work Center absent.
- Notifications absent.
- Communications absent.
- Quick Actions absent.
- Patient Portal information absent.
- Widgets remain deferred unless explicitly reopened.
- No scattered dashboard reconstruction.
- Appointment routing preserves relevant context.

### Responsive invariants

- Mobile is not desktop shrink.
- Authorized capabilities are not silently removed solely due viewport width.
- RTL/LTR semantics remain correct.

## 5. Gate D — Diff review

Before accepting a change:

- inspect exact diff,
- verify changed files are in scope,
- identify any unrelated edits,
- verify no new route/data engine was introduced,
- verify no hidden authorization change,
- verify no silent product decision was encoded in generic primitives.

## 6. Gate E — Automated validation

Run applicable:

- typecheck,
- lint,
- unit/integration tests,
- authorization/RLS tests where affected,
- build.

Record exact run/evidence identifiers.

Green CI is necessary but not sufficient for visual closure.

## 7. Gate F — Runtime visual verification

For visual work, verify at minimum:

- desktop,
- tablet,
- mobile,
- RTL,
- LTR,
- keyboard/focus where applicable,
- relevant overlay/open/pressed/unread/error states.

Screenshots or equivalent objective evidence should be retained when visual approval is required.

## 8. Gate G — Product Owner decision gate

The following cannot be self-approved by implementation:

- exact final visual language,
- final Home ordering,
- final Header grouping/hierarchy,
- final Login styling,
- final token system,
- major visual identity changes.

If these remain OPEN, the implementation record must say so.

## 9. Gate H — Documentation reconciliation

After implementation and verification:

- update the Decision Registry,
- update the Integrated Work Contract status,
- update affected surface-specific contracts/findings,
- record evidence,
- identify remaining OPEN items,
- do not mark a document CLOSED while execution obligations remain incomplete.

## 10. Failure handling

If any gate fails:

- status = **NOT CLOSED**,
- record the failure,
- fix the failure if it is technical and within scope,
- request Product Owner decision if product judgment is required,
- rerun the relevant gate.

A failure must never be disguised as a documentation wording issue.

## 11. Minimum implementation handoff template

Every future implementation handoff within this scope should contain:

```text
Scope:
Applicable Decision IDs:
OPEN Decisions:
Authoritative Existing Implementations:
Planned Changes:
Explicit Non-Changes:
Duplicate-Engine Check:
Automated Validation:
Runtime Validation:
Product Owner Visual Approval:
Remaining OPEN Items:
Closure Status:
```

## 12. Closure rule

The gate itself remains ACTIVE permanently.

Individual work can close only when its applicable gates pass and the Decision Registry is updated with evidence.

The Experience Foundation remains **NOT CLOSED** until the constitution's execution obligations are objectively satisfied.
