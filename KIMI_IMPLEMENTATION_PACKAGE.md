# KIMI_IMPLEMENTATION_PACKAGE.md — Milestone 3 (Unified Workspace)

**Read `KIMI_IMPLEMENTATION_CONTRACT.md` first** — the general rules there apply to everything below without repetition. This document is the Milestone-3-specific execution order and checklist.

---

## Mandatory Execution Order

Do not start a package before its listed prerequisite is fully closed (Definition of Done met and reported).

1. **Confirm `SECURITY_HOTFIX_MIGRATION.sql` Phases A/B/D are already applied.** If not, stop and flag this before writing any permission-related code — do not build new permission infrastructure on top of unresolved anon-access findings.
2. **Package 3.0.1 — Permission Engine Runtime**
3. **Package 3.0.2 — Dynamic Navigation**
4. **Package 3.0.3/3.0.4 — RTL/Responsive verification** (quick — can run in parallel with the start of Phase 3.1 module work once 3.0.2 is done)
5. **Package 3.1.2 — Patients** and **Package 3.1.6 — Inventory** (parallel, independent of each other)
6. **Package 3.1.3 — Agenda**
7. **Package 3.1.4 — Queue**
8. **Package 3.1.5 — Billing**
9. **Package 3.1.9 — Follow-up**
10. **Package 3.1.7 — Reports** — **do not start until the report catalog decision (flagged in the package) is confirmed.**
11. **Package 3.1.8 — Analytics**
12. **Package 3.1.1 — Dashboard** (last among modules — needs the other modules' widget-relevant data settled, and touches shared root routing, so do it once everything else is stable)
13. **Phase 3.2 — Integration & Hardening (3.2.1, 3.2.2, 3.2.3, in that order)**

---

## Prohibited Actions (Milestone-3-specific, in addition to the general contract)

- Do not touch any of the 34 existing RLS policies. Package 3.0.1 is additive only.
- Do not modify `clinic_users.role`'s `CHECK` constraint. If a task seems to require it, stop and report — it's an explicitly deferred decision (ADR-001).
- Do not activate `clinic_owner` or `nurse` roles in any UI or permission mapping.
- Do not implement Reports (3.1.7) without a confirmed report catalog.
- Do not implement any Follow-up delivery/automation beyond list/scheduled/status-update (Package 3.1.9 scope is deliberately limited).
- Do not modify `inventory_ledger`'s existing columns beyond adding the `item_id` foreign key specified in Package 3.1.6 — and only after Owner confirms that specific schema change.
- Do not touch `src/domain/analytics/kpi/` files except to add new KPI definitions following the exact existing pattern.

---

## Verification Checklist Before Closing Any Package

- [ ] Build passes (`next build` or equivalent) with zero errors
- [ ] Zero TypeScript errors
- [ ] Zero new lint errors
- [ ] Manual functional test performed (not just "should work") — describe exactly what was clicked/called and what the result was
- [ ] RLS/permission check verified against at least one unauthorized case (confirm it's actually blocked, not just hidden)
- [ ] No existing, working functionality regressed (spot-check the module(s) this package touched, even indirectly)
- [ ] `CHANGELOG.md` updated
- [ ] `PROJECT_HANDOFF.md` "Current State" table updated
- [ ] `DATABASE_SCHEMA.md` updated if any table/column changed
- [ ] Handoff report produced in the established format

---

## If Something Doesn't Match This Package

If, on inspection, the actual repository state doesn't match what a package describes (a file that should exist per this package's "ground truth" section doesn't, or has different content than described) — **stop, do not improvise, report the mismatch back for the package to be corrected.** This has happened before in this project (see `PROJECT_HANDOFF.md` historical record) and is exactly the failure mode the Repository First Policy exists to prevent.
