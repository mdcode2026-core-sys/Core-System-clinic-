create index if not exists idx_retention_followups_tenant_patient
  on public.retention_followups (tenant_id, patient_id);
