# AJM-1 Addendum — Unified User Configuration

**Date:** 2026-09-01

This addendum refines the AJM-1 Team & Access implementation without replacing its underlying architecture.

## Approved refinements

1. Users are the primary operational entry point.
2. Create and Edit use the same complete User Configuration Form.
3. Role, Workspace, Direct Permissions, Explicit Overrides, and login/invitation configuration are represented in the same user form.
4. `Advanced` is the single deep-administration branch inside Team & Access.
5. Advanced must not become a prerequisite or duplicate workflow for ordinary user administration.
6. Role definition remains in Roles; role assignment remains in the User Form.
7. Workspace membership remains independent from authorization and is assigned in the User Form; no duplicate workspace CRUD is introduced.
8. Personal `My Settings` remains a personal preference surface and must not be mistaken for administrative authorization settings.
9. Authentication is password-based through Supabase Auth. Existing PIN schema is preserved unchanged and functional PIN behavior is retired.
10. The primary Clinic Admin account is protected from user-management mutation.
11. Database email uniqueness is enforced per tenant for non-deleted accounts.

## Scope safety

No Patient Flow or unrelated module/domain behavior is intentionally changed by this refinement. Directly related integrity/security fixes are allowed when required for the Team & Access workflow.
