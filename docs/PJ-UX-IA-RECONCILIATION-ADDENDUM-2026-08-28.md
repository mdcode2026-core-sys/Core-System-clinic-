# PJ — UX/IA Reconciliation Addendum — 2026-08-28

**Authority:** `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
**Status:** CURRENT

This addendum updates the Patient Journey documentation set for the presentation/interaction model only. PJ ownership and journey behavior are not redefined.

## Binding decisions

1. Patient Flow remains an independent first-class system.
2. Patient Flow continues to use Queue and the existing patient movement mechanism; no parallel Queue or replacement flow may be created.
3. Patient Flow provides three interfaces to the same system: Operations, Clinical and Administrative.
4. Patient Flow does not appear merely because a user has an Operations or Clinical role. Clinic Admin must explicitly enable/assign it and define the intended context.
5. Operations users without Patient Flow permission must continue to work in Operations without Patient Flow.
6. Clinical users may receive the Clinical Patient Flow view when enabled.
7. Administrative users may receive the Administrative Patient Flow view for full operational oversight and permitted intervention.
8. Patient Flow remains connected to the real persisted visit/appointment state and must not become a visual-only queue.
9. Patient Context and contextual navigation may expose authorized journey-related information from other domains without transferring ownership of those domains to PJ.
10. Widgets may provide fast entry points into PJ-related work, but a Widget never replaces Patient Flow or grants authorization.
11. Workspace is a presentation/work surface and does not redefine PJ ownership.
12. Global Search may locate authorized PJ records and navigate directly to their context.

These rules are mandatory for future PJ implementation and validation.

**End of PJ UX/IA Reconciliation Addendum.**
