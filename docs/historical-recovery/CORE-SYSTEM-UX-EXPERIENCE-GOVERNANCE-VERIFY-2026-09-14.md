# CORE SYSTEM — UX / Experience Governance VERIFY
## 2026-09-14

**Stage:** VERIFY — completed
**Branch:** `ux-experience-governance-verify-2026-09-14`
**Base:** `6165ae36475db2527baa3aa21ef1a5136b45f633`
**Scope:** Establish the verified starting point for the next UX/experience-system planning stage. No product implementation is performed by this record.

## 1. Governing Authority
The Product Owner explicitly approved on 2026-09-14:
- `docs/CORE-SYSTEM-DESIGN-UX-ARCHITECTURE-CONSTITUTION-2026-09-14.md`
- `docs/CORE-SYSTEM-INTEGRATED-WORK-EXECUTION-CONTRACT-2026-09-14.md`

The approved Constitution establishes that CORE SYSTEM already has a UI foundation, while the remaining gap is product-wide visual/experience governance. It also preserves the distinction between Home, My Workspace, Role Workspace, Header and Sidebar, and prohibits duplicate engines or silent semantic changes.

## 2. Verified Product/UX Meaning
The current canonical reconciliation confirms:
- Home is an independent global starting/awareness surface.
- My Workspace is a personal working surface.
- Role Workspace is the primary professional work environment when applicable.
- Header is persistent global access.
- Sidebar represents authorized Domain/Module entry and is not authorization itself.
- Communications is clinic-wide internal communication; Chat is a compact interaction surface over Communications.
- Notifications remain distinct from Communications and Follow-up.

These boundaries are governing and must not be reinterpreted by the next implementation.

## 3. Current Repository Evidence
### 3.1 Home implementation
Current Home implementation is `src/app/(dashboard)/page.tsx` on verified base `d85a5de23051919fb347e1482bc28f5fe70c0e14`.

PROVEN from source:
- Home is explicitly treated as separate from Workspace.
- The page contains a `Today` area with appointment count and Patient Flow-related counts.
- `Today's appointments` routes to `/agenda`.
- Waiting / clinical / completed cards route to `/workspace`.
- A `Work context` area contains Notifications & reminders, Internal communications, Work Center and Patient Portal information.
- Notifications & reminders is currently non-navigational (`href: null`) and therefore functions as static context rather than a notification interaction surface.
- The Home copy currently explains the purpose of the surface rather than presenting a strongly action/outcome-oriented work hierarchy.
- The page uses repeated local utility styling for cards and sections rather than demonstrating a single product-wide experience governance layer at the page level.

Source evidence: `src/app/(dashboard)/page.tsx` on the verified base.

### 3.2 Existing global-surface documentation
The canonical global-surface reconciliation is already approved for documentation sync and defines the boundaries of Home, My Workspace, Role Workspace, Header, Sidebar, Communications, Chat and Notifications. It explicitly states that Home must not duplicate specialist workflows and that Header must not become a second Home or universal business-action launcher.

### 3.3 Existing Header work
Current repository documentation records Header / Search / Communications / Chat repair as a separate completed workstream. The next UX governance stage therefore must not reopen Header implementation merely because Header participates in the global experience model.

## 4. What Is Proven vs Not Proven
### PROVEN
- Constitutional product/UX boundaries are approved.
- The current Home source implements a general overview surface distinct from Workspace.
- The current Home has concrete information architecture and navigation behavior described above.
- Header/Communications/Chat work has existing dedicated implementation documentation and must be treated as an existing surface, not duplicated.

### STRONG EVIDENCE
- The product has shared UI primitives/tokens and i18n/RTL foundations, but the Home implementation still contains substantial page-local presentation decisions. This supports treating experience governance as a cross-product consistency problem rather than a missing-component-library problem.

### UNVERIFIED
- Pixel-level visual consistency across all major product surfaces.
- Actual runtime responsive behavior across target breakpoints.
- Accessibility behavior beyond what source/tests establish.
- Whether all current pages consume the same semantic visual tokens consistently.
- Visual regression coverage.

These claims require interactive/runtime or tooling evidence and must not be inferred from source alone.

## 5. Confirmed UX Problem Boundary
The next work should **not** be framed as a Home-only redesign.

The verified problem is:
> CORE SYSTEM has a shared UI foundation and many completed surface-specific repairs, but it does not yet have a sufficiently explicit product-wide UX/experience governance layer that consistently defines hierarchy, typography, spacing, surfaces, states, responsive behavior, accessibility and interaction patterns across the product.

Home is the most visible current pilot surface because its source already demonstrates the risk: mixed information, action routing and context cards coexist without a clearly governed experience hierarchy.

## 6. Existing Open Decisions That Must Remain Open
The following Constitution items must not be silently resolved during this stage:
- exact Home ordering/visual hierarchy;
- Dashboard vs Analytics boundary;
- Work Center vs My Workspace boundary;
- final visual token taxonomy/semantic mapping;
- visual regression tooling;
- Administrative Workspace IA;
- outcome/result model for users without Role Workspace;
- Super Admin Workspace scope;
- final platform-content naming/targeting/entitlement model.

## 7. Non-Goals for This VERIFY Stage
No:
- code implementation;
- DB migration;
- permission model change;
- workspace model change;
- Header rebuild;
- Communications/Chat engine change;
- Calendar/Agenda change;
- Patient Flow redesign;
- test weakening;
- Vercel deployment.

## 8. VERIFY Result
**Evidence classification:** STRONG EVIDENCE

**Stage result:** VERIFY COMPLETE — sufficient evidence exists to enter PLAN.

**Implementation authorization:** NO — planning only.

**Next stage:** PLAN

**Required planning direction:** define a product-wide UX/Experience Governance implementation plan, with the existing Home surface used as a controlled pilot rather than treated as an isolated redesign.

**End of VERIFY Record.**
