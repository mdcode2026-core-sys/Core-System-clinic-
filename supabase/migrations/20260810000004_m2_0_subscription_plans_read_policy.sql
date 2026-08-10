-- M2.0 Migration 04: subscription_plans SELECT policy
BEGIN;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_subscription_plans_read ON public.subscription_plans
FOR SELECT TO authenticated USING (true);
COMMIT;
