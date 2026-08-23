# PJ Stage 12 — Production Verification Fix Log

## 2026-08-24

- Stabilized mobile workspace sidebar closing in both Arabic and English by applying an explicit runtime transform based on the active locale and open state.
- Gated Patient Portal invitation controls by the clinic's effective `patient_portal` entitlement and communication-channel entitlements.
- Added a server-side portal availability resolver so the UI does not expose invitation controls that the backend will reject.
- Preserved backend authorization as the final enforcement boundary.
- No subscription-tier names are used by the new UI gating logic.
