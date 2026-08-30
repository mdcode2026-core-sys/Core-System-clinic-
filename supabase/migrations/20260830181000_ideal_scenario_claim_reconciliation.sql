-- Deterministic claim reconciliation for Ideal Scenarios 32-33.
create or replace function public.reconcile_insurance_claim(
 p_tenant_id uuid,p_claim_id uuid,p_reconciled_subunits integer,p_patient_responsibility_subunits integer,p_reconciled_by uuid
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_claim insurance_claims%rowtype; v_invoice clinic_invoices%rowtype; v_patient_balance integer := 0;
begin
 if p_reconciled_subunits<0 or p_patient_responsibility_subunits<0 then return jsonb_build_object('success',false,'error','Amounts cannot be negative'); end if;
 select * into v_claim from insurance_claims where id=p_claim_id and tenant_id=p_tenant_id for update;
 if not found then return jsonb_build_object('success',false,'error','Claim not found'); end if;
 if p_reconciled_subunits>v_claim.amount_claimed_subunits then return jsonb_build_object('success',false,'error','Reconciled amount exceeds claim'); end if;
 if v_claim.invoice_id is not null then
   select * into v_invoice from clinic_invoices where id=v_claim.invoice_id and tenant_id=p_tenant_id for update;
   if not found then return jsonb_build_object('success',false,'error','Invoice not found'); end if;
   v_patient_balance:=greatest(v_invoice.total_subunits-p_reconciled_subunits,0);
   update clinic_invoices set amount_due_subunits=v_patient_balance, updated_at=now() where id=v_invoice.id;
 end if;
 update insurance_claims set amount_reconciled_subunits=p_reconciled_subunits,status=case when p_reconciled_subunits=v_claim.amount_claimed_subunits then 'reconciled' else 'exception' end, reconciled_at=now(), reconciled_by=p_reconciled_by, notes=coalesce(notes,'') || case when notes is null or notes='' then '' else E'\n' end || 'Patient responsibility: '||p_patient_responsibility_subunits where id=p_claim_id;
 update patient_insurance_profiles set reconciliation_status=case when p_reconciled_subunits=v_claim.amount_claimed_subunits then 'reconciled' else 'exception' end, updated_at=now() where id=v_claim.insurance_profile_id and tenant_id=p_tenant_id;
 return jsonb_build_object('success',true,'claim_id',p_claim_id,'reconciled_subunits',p_reconciled_subunits,'patient_responsibility_subunits',p_patient_responsibility_subunits,'patient_balance_subunits',v_patient_balance);
end;$$;
grant execute on function public.reconcile_insurance_claim(uuid,uuid,integer,integer,uuid) to authenticated,service_role;
