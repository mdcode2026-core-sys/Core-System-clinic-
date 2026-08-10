-- M2.0 Migration 06: Tenant Notification Channel Preferences
BEGIN;
CREATE TABLE IF NOT EXISTS public.tenant_notification_channel_prefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.master_tenants(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email', 'in_app')),
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, channel)
);
CREATE INDEX idx_tenant_notification_channel_prefs_tenant_id ON public.tenant_notification_channel_prefs (tenant_id);
ALTER TABLE public.tenant_notification_channel_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_tenant_notification_channel_prefs_isolation ON public.tenant_notification_channel_prefs
FOR ALL TO authenticated USING (tenant_id = public.get_current_tenant_id()) WITH CHECK (tenant_id = public.get_current_tenant_id());
COMMIT;
