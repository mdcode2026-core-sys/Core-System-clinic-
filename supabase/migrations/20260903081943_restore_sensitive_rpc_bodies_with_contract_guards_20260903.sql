-- Preserve the approved pre-remediation business bodies; add only tenant, permission and target-tenant guards.
-- See the canonical pre-remediation bodies in the 2026-08-30 ideal-scenario migrations.

CREATE OR REPLACE FUNCTION public.execute_commercial_sale(p_tenant_id uuid,p_patient_id uuid,p_service_id uuid DEFAULT NULL,p_package_id uuid DEFAULT NULL,p_offer_id uuid DEFAULT NULL,p_financial_plan_id uuid DEFAULT NULL,p_created_by uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_price integer; v_discount integer:=0; v_net integer; v_patient_package uuid; v_invoice jsonb; v_financial_total integer; v_financial_patient integer; v_name text; v_invoice_id uuid;
BEGIN
 IF p_tenant_id<>public.get_current_tenant_id() THEN RAISE EXCEPTION 'Tenant mismatch'; END IF;
 IF NOT public.has_tenant_permission(p_tenant_id,'packages:sell') THEN RAISE EXCEPTION 'Permission denied'; END IF;
 IF p_created_by IS NOT NULL AND NOT EXISTS(select 1 from clinic_users where id=p_created_by and tenant_id=p_tenant_id and is_active and deleted_at is null) THEN RAISE EXCEPTION 'Actor does not belong to tenant'; END IF;
 IF (p_service_id is null)=(p_package_id is null) then return jsonb_build_object('success',false,'error','Exactly one service or package is required'); end if;
 IF p_financial_plan_id is null then return jsonb_build_object('success',false,'error','Financial plan is required before commercial sale execution'); end if;
 IF not exists(select 1 from clinic_patients where id=p_patient_id and tenant_id=p_tenant_id and deleted_at is null) then return jsonb_build_object('success',false,'error','Patient not found'); end if;
 IF p_service_id is not null then select base_price_subunits,name into v_price,v_name from clinic_services where id=p_service_id and tenant_id=p_tenant_id and is_active; else select base_price_subunits,name into v_price,v_name from clinic_packages where id=p_package_id and tenant_id=p_tenant_id and is_active; end if;
 IF v_price is null then return jsonb_build_object('success',false,'error','Commercial item not found'); end if;
 IF p_offer_id is not null then
  if not exists(select 1 from clinic_offers where id=p_offer_id and tenant_id=p_tenant_id and status='active' and (starts_on is null or starts_on<=current_date) and (ends_on is null or ends_on>=current_date) and ((p_service_id is not null and service_id=p_service_id) or (p_package_id is not null and package_id=p_package_id))) then return jsonb_build_object('success',false,'error','Offer is not applicable'); end if;
  select case when discount_type='percent' then round(v_price*discount_value/100.0)::integer else discount_value end into v_discount from clinic_offers where id=p_offer_id;
 end if;
 v_discount:=least(greatest(v_discount,0),v_price); v_net:=v_price-v_discount;
 select total_amount_subunits,patient_responsibility_subunits into v_financial_total,v_financial_patient from financial_plans where id=p_financial_plan_id and tenant_id=p_tenant_id and patient_id=p_patient_id and deleted_at is null and status in ('draft','active');
 if not found then return jsonb_build_object('success',false,'error','Financial plan not found or does not belong to patient'); end if;
 if v_financial_patient<>v_net and v_financial_total<>v_net then return jsonb_build_object('success',false,'error','Financial plan amount does not match commercial sale net amount','sale_net_subunits',v_net,'financial_total_subunits',v_financial_total,'patient_responsibility_subunits',v_financial_patient); end if;
 v_invoice:=public.create_manual_invoice(p_tenant_id,p_patient_id,null,current_date,'installment','Commercial sale: '||v_name,p_created_by,jsonb_build_array(jsonb_build_object('procedure_id',null,'description',v_name,'quantity',1,'unit_price_subunits',v_price,'discount_amount_subunits',v_discount,'discount_percent',null,'tax_rate_percent',0)));
 if coalesce((v_invoice->>'success')::boolean,false) is not true then return jsonb_build_object('success',false,'error',coalesce(v_invoice->>'error','Invoice creation failed')); end if;
 v_invoice_id:=(v_invoice->>'invoice_id')::uuid;
 if p_package_id is not null then insert into patient_packages(tenant_id,patient_id,package_id,financial_plan_id,purchased_sessions,consumed_sessions,status,purchased_at,created_by) select p_tenant_id,p_patient_id,id,p_financial_plan_id,coalesce(session_limit,0),0,'active',now(),p_created_by from clinic_packages where id=p_package_id and tenant_id=p_tenant_id returning id into v_patient_package; end if;
 return jsonb_build_object('success',true,'gross_subunits',v_price,'discount_subunits',v_discount,'net_subunits',v_net,'patient_package_id',v_patient_package,'financial_plan_id',p_financial_plan_id,'invoice_id',v_invoice_id,'service_id',p_service_id,'package_id',p_package_id,'offer_id',p_offer_id);
END; $$;

CREATE OR REPLACE FUNCTION public.consume_procedure_inventory(p_tenant_id uuid,p_visit_id uuid,p_treatment_plan_item_id uuid,p_item_id uuid,p_quantity numeric,p_consumed_by uuid,p_reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_stock numeric; v_new numeric;
BEGIN
 IF p_tenant_id<>public.get_current_tenant_id() THEN RAISE EXCEPTION 'Tenant mismatch'; END IF;
 IF NOT public.has_tenant_permission(p_tenant_id,'inventory:adjust') THEN RAISE EXCEPTION 'Permission denied'; END IF;
 IF NOT EXISTS(select 1 from clinic_users where id=p_consumed_by and tenant_id=p_tenant_id and is_active and deleted_at is null) THEN RAISE EXCEPTION 'Actor does not belong to tenant'; END IF;
 IF p_quantity<=0 then return jsonb_build_object('success',false,'error','Quantity must be positive'); end if;
 IF not exists(select 1 from clinic_visit_sessions where id=p_visit_id and tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Visit not found'); end if;
 IF p_treatment_plan_item_id IS NOT NULL AND NOT EXISTS(select 1 from clinic_treatment_plan_items where id=p_treatment_plan_item_id and tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Treatment plan item not found'); end if;
 select current_stock into v_stock from inventory_items where id=p_item_id and tenant_id=p_tenant_id and deleted_at is null for update;
 if v_stock is null then return jsonb_build_object('success',false,'error','Inventory item not found'); end if;
 if v_stock<p_quantity then return jsonb_build_object('success',false,'error','Insufficient stock'); end if;
 v_new:=v_stock-p_quantity;
 update inventory_items set current_stock=v_new,updated_at=now() where id=p_item_id and tenant_id=p_tenant_id;
 insert into inventory_ledger(tenant_id,item_id,material_name,quantity_consumed,consumption_type,notes,logged_by) select p_tenant_id,p_item_id,coalesce(p_reason,'procedure consumption'),p_quantity,'doctor_request',p_reason,p_consumed_by;
 return jsonb_build_object('success',true,'new_stock',v_new,'visit_id',p_visit_id,'treatment_plan_item_id',p_treatment_plan_item_id);
END; $$;

CREATE OR REPLACE FUNCTION public.get_workforce_unavailability(p_tenant_id uuid,p_employee_id uuid,p_start timestamptz,p_end timestamptz)
RETURNS TABLE(starts_at timestamptz,ends_at timestamptz,absence_type text,reason text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF p_tenant_id<>public.get_current_tenant_id() THEN RAISE EXCEPTION 'Tenant mismatch'; END IF;
 IF NOT public.has_tenant_permission(p_tenant_id,'workforce:read') THEN RAISE EXCEPTION 'Permission denied'; END IF;
 IF p_employee_id IS NOT NULL AND NOT EXISTS(select 1 from workforce_employees where id=p_employee_id and tenant_id=p_tenant_id) THEN RAISE EXCEPTION 'Employee does not belong to tenant'; END IF;
 RETURN QUERY SELECT u.starts_at,u.ends_at,u.absence_type,u.reason FROM public.workforce_unavailability_blocks u WHERE u.tenant_id=p_tenant_id and u.status='approved' and(u.employee_id=p_employee_id or u.employee_id is null) and u.starts_at<p_end and u.ends_at>p_start order by u.starts_at;
END; $$;
