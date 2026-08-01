-- ============================================================================
-- SECURITY_HOTFIX_MIGRATION.sql
-- Project: CORE SYSTEM — ClinicSaaS™ (core-system-clinic / qaslsjyxjwvdoiczmhgq)
-- Status: DRAFT FOR REVIEW ONLY. DO NOT RUN AUTOMATICALLY.
-- Companion docs: SECURITY_AUDIT_REPORT.md, SECURITY_HOTFIX_PLAN.md
--
-- This file is organized into phases matching SECURITY_HOTFIX_PLAN.md.
-- Every REVOKE below has been checked against actual src/ usage before
-- being included. Phase B specifically preserves `authenticated` access
-- on functions the running application depends on (see SEC-003, SEC-006).
-- ============================================================================


-- ============================================================================
-- PHASE A — Zero-risk removals (confirmed: no usage anywhere in src/)
-- ============================================================================

-- SEC-001: leftover debug/test functions from the 2026-07-29 queue debugging session
REVOKE EXECUTE ON FUNCTION public.test_jwt_claims() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.test_jwt_claims(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.test_queue_access() FROM anon, authenticated;

-- SEC-002: unrestricted generic config setter, unused by the app
REVOKE EXECUTE ON FUNCTION public.set_config(text, text) FROM anon, authenticated;

-- SEC-004: trigger-only function, no legitimate direct-call use case
REVOKE EXECUTE ON FUNCTION public.fn_audit_changes() FROM anon, authenticated;

-- SEC-005: auth.users trigger function, no legitimate direct-call use case
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- SEC-009: business-logic / trigger-helper functions — no anon use case
-- (these are NOT security definer; authenticated retains access, only anon is removed)
REVOKE EXECUTE ON FUNCTION public.can_edit_invoice(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.cancel_invoice(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_invoice_from_session(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.issue_invoice(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.recalculate_invoice_totals(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_invoice_payment(uuid, uuid, integer, text, text, text, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_invoice_number(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.fn_set_auto_close() FROM anon;
REVOKE EXECUTE ON FUNCTION public.fn_set_session_buffer() FROM anon;
REVOKE EXECUTE ON FUNCTION public.fn_set_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.fn_log_subscription_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;

-- Rollback for Phase A (kept for reference — do not run unless reverting):
-- GRANT EXECUTE ON FUNCTION public.test_jwt_claims() TO anon, authenticated;
-- GRANT EXECUTE ON FUNCTION public.test_jwt_claims(uuid) TO anon, authenticated;
-- GRANT EXECUTE ON FUNCTION public.test_queue_access() TO anon, authenticated;
-- GRANT EXECUTE ON FUNCTION public.set_config(text, text) TO anon, authenticated;
-- GRANT EXECUTE ON FUNCTION public.fn_audit_changes() TO anon, authenticated;
-- GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;
-- GRANT EXECUTE ON FUNCTION public.can_edit_invoice(uuid) TO anon;
-- GRANT EXECUTE ON FUNCTION public.cancel_invoice(uuid) TO anon;
-- GRANT EXECUTE ON FUNCTION public.create_invoice_from_session(uuid) TO anon;
-- GRANT EXECUTE ON FUNCTION public.issue_invoice(uuid) TO anon;
-- GRANT EXECUTE ON FUNCTION public.recalculate_invoice_totals(uuid) TO anon;
-- GRANT EXECUTE ON FUNCTION public.record_invoice_payment(uuid, uuid, integer, text, text, text, uuid) TO anon;
-- GRANT EXECUTE ON FUNCTION public.generate_invoice_number(uuid) TO anon;
-- GRANT EXECUTE ON FUNCTION public.fn_set_auto_close() TO anon;
-- GRANT EXECUTE ON FUNCTION public.fn_set_session_buffer() TO anon;
-- GRANT EXECUTE ON FUNCTION public.fn_set_updated_at() TO anon;
-- GRANT EXECUTE ON FUNCTION public.fn_log_subscription_change() TO anon;
-- GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO anon;


-- ============================================================================
-- PHASE B — anon-only revocation on app-critical functions
-- DO NOT revoke `authenticated` on these — confirmed live application
-- dependency in src/infrastructure/supabase/server.ts,
-- src/domain/patients/patients.actions.ts, src/domain/agenda/agenda.actions.ts,
-- src/domain/analytics/analytics.actions.ts
-- ============================================================================

-- SEC-003
REVOKE EXECUTE ON FUNCTION public.set_tenant_id(uuid) FROM anon;

-- SEC-006 — verify pre-auth pages (landing/login/register) after applying;
-- see SECURITY_HOTFIX_PLAN.md Phase B verification notes.
REVOKE EXECUTE ON FUNCTION public.get_current_tenant_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_current_user_role() FROM anon;

-- Rollback for Phase B:
-- GRANT EXECUTE ON FUNCTION public.set_tenant_id(uuid) TO anon;
-- GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO anon;
-- GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO anon;


-- ============================================================================
-- PHASE C — subscription_plans: additive policy, not a revocation
-- OWNER DECISION NEEDED: uncomment ONE of the two options below, not both.
-- ============================================================================

-- Option 1 — plan catalog visible only to authenticated users (mid-signup / in-app):
-- CREATE POLICY "rls_subscription_plans_read_authenticated"
--   ON public.subscription_plans FOR SELECT
--   USING (auth.role() = 'authenticated');

-- Option 2 — plan catalog also visible on a public pricing/signup page (pre-login):
-- CREATE POLICY "rls_subscription_plans_read_public"
--   ON public.subscription_plans FOR SELECT
--   USING (true);


-- ============================================================================
-- PHASE D — explicit search_path hardening (safe, additive, no behavior change)
-- Matches the existing convention already used on custom_access_token_hook
-- (search_path=public), per Repository First Policy.
-- ============================================================================

ALTER FUNCTION public.get_current_tenant_id() SET search_path = public;
ALTER FUNCTION public.get_current_user_role() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.create_tenant_with_subscription(text, text, text, uuid, text, text, text, text, text, text) SET search_path = public;
ALTER FUNCTION public.set_tenant_id(uuid) SET search_path = public;
ALTER FUNCTION public.set_config(text, text) SET search_path = public;
ALTER FUNCTION public.fn_audit_changes() SET search_path = public;
ALTER FUNCTION public.fn_set_auto_close() SET search_path = public;
ALTER FUNCTION public.fn_set_session_buffer() SET search_path = public;
ALTER FUNCTION public.fn_set_updated_at() SET search_path = public;
ALTER FUNCTION public.fn_log_subscription_change() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.generate_invoice_number(uuid) SET search_path = public;
ALTER FUNCTION public.can_edit_invoice(uuid) SET search_path = public;
ALTER FUNCTION public.create_invoice_from_session(uuid) SET search_path = public;
ALTER FUNCTION public.recalculate_invoice_totals(uuid) SET search_path = public;
ALTER FUNCTION public.issue_invoice(uuid) SET search_path = public;
ALTER FUNCTION public.record_invoice_payment(uuid, uuid, integer, text, text, text, uuid) SET search_path = public;
ALTER FUNCTION public.cancel_invoice(uuid) SET search_path = public;
ALTER FUNCTION public.test_jwt_claims() SET search_path = public;
ALTER FUNCTION public.test_jwt_claims(uuid) SET search_path = public;
ALTER FUNCTION public.test_queue_access() SET search_path = public;


-- ============================================================================
-- PHASE E — no SQL required
-- SEC-011 (Leaked Password Protection) is a toggle in Supabase Dashboard →
-- Authentication → Policies, not a migration.
-- ============================================================================


-- ============================================================================
-- OPTIONAL — only after Owner confirms these are permanently unneeded
-- (kept separate from the REVOKE statements above; dropping is a stronger,
-- less reversible action than revoking access)
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.test_jwt_claims();
-- DROP FUNCTION IF EXISTS public.test_jwt_claims(uuid);
-- DROP FUNCTION IF EXISTS public.test_queue_access();
-- DROP FUNCTION IF EXISTS public.set_config(text, text);
