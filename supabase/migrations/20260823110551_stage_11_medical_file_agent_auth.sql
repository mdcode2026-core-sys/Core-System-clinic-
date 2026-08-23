alter table public.tenant_devices add column if not exists agent_token_hash text;
create unique index if not exists tenant_devices_agent_token_hash_idx on public.tenant_devices(agent_token_hash) where agent_token_hash is not null;
