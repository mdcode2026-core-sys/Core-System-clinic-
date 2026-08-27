BEGIN;
CREATE TABLE IF NOT EXISTS public.clinic_user_workspaces(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.master_tenants(id) ON DELETE CASCADE,user_id uuid NOT NULL REFERENCES public.clinic_users(id) ON DELETE CASCADE,workspace text NOT NULL CHECK(workspace IN ('administration','operation','clinical')),is_default boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(tenant_id,user_id,workspace));
CREATE UNIQUE INDEX IF NOT EXISTS uq_clinic_user_default_workspace ON public.clinic_user_workspaces(tenant_id,user_id) WHERE is_default=true;
CREATE INDEX IF NOT EXISTS idx_clinic_user_workspaces_user ON public.clinic_user_workspaces(tenant_id,user_id);
INSERT INTO public.clinic_user_workspaces(tenant_id,user_id,workspace,is_default) SELECT cu.tenant_id,cu.id,COALESCE(r.workspace,'operation'),true FROM public.clinic_users cu JOIN public.roles r ON r.id=cu.role_id WHERE r.workspace IS NOT NULL ON CONFLICT DO NOTHING;
ALTER TABLE public.clinic_user_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY ajm1_uw_select ON public.clinic_user_workspaces FOR SELECT TO authenticated USING(tenant_id=get_current_tenant_id());CREATE POLICY ajm1_uw_write ON public.clinic_user_workspaces FOR ALL TO authenticated USING(tenant_id=get_current_tenant_id()) WITH CHECK(tenant_id=get_current_tenant_id());
COMMIT;
