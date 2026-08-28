# AJM — UX/IA Reconciliation Addendum — 2026-08-28

**Authority:** `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
**Status:** CURRENT

This addendum is part of the AJM documentation set and supersedes any earlier AJM wording about the user-facing organization of Workspaces, Sidebar, Widgets, Patient Flow, Dashboard and Overview where that wording conflicts with the 2026-08-28 Global UX/IA authority.

## Binding updates

- AJM Domain ownership is unchanged.
- Independent Modules + Integrated Platform remains unchanged.
- Role and Permission remain independent.
- Clinic Admin controls role construction and permission assignment without being constrained by conventional job definitions.
- Workspace is the user's working interface and is not a security boundary.
- The user-facing model is not restricted to three fixed Workspaces.
- Sidebar presents the user's complete authorized entry points.
- Workspace is personalized using authorized Widgets and Quick Actions.
- Widgets do not grant permissions.
- Widgets may be informational, actionable or operational/attention-oriented.
- Not every Domain requires a Widget.
- Widgets can be reordered and the Workspace can extend through scrolling; natural Widget size is respected.
- Widgets may also be surfaced in Sidebar when appropriate; this does not change authorization.
- Patient Flow remains an independent system using Queue and the existing patient movement mechanism.
- Patient Flow has Operations, Clinical and Administrative interfaces to the same system.
- Patient Flow appears only when explicitly enabled/assigned with the appropriate context; an Operations role alone does not activate it.
- Dashboard is management/monitoring, not the user's operational Workspace.
- Overview is not Workspace and must not become a duplicate Domain.
- Global Search is cross-system and authorization-aware.
- Patient Context provides contextual navigation without moving Domain ownership.
- Mobile and Arabic/English parity apply to all of the above.

AJM implementation stages must incorporate these rules without changing domain ownership or authorization architecture.

**End of AJM UX/IA Reconciliation Addendum.**
