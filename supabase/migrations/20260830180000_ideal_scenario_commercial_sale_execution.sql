-- Commercial execution bridge for Ideal Scenarios 25-28.
-- Keeps Service/Package/Offer definitions authoritative while creating patient entitlements and financial commitment atomically.
create or replace function public.execute_commercial_sale(
  p_tenant_id uuid,
  p_patient_id uuid,
  p_service_id uuid default null,
  p_package_id uuid default null,
  p_offer_id uuid default null,
  p_financial_plan_id uuid default null,
  p_created_by uuid default null
) returns jsonb
language plpgsql security definer set search_path=public
as $$
declare
  v_price integer;
  v_discount integer := 0;
  v_net integer;
  v_patient_package uuid;
  v_result jsonb;
begin
  if (p_service_id is null) = (p_package_id is null) then
    return jsonb_build_object('success',false,'error','Exactly one service or package is required');
  end if;
  if not exists(select 1 from clinic_patients where id=p_patient_id and tenant_id=p_tenant_id and deleted_at is null) then
    return jsonb_build_object('success',false,'error','Patient not found');
  end if;
  if p_service_id is not null then
    select base_price_subunits into v_price from clinic_services where id=p_service_id and tenant_id=p_tenant_id and is_active;
  else
    select base_price_subunits into v_price from clinic_packages where id=p_package_id and tenant_id=p_tenant_id and is_active;
  end if;
  if v_price is null then return jsonb_build_object('success',false,'error','Commercial item not found'); end if;
  if p_offer_id is not null then
    if not exists(select 1 from clinic_offers where id=p_offer_id and tenant_id=p_tenant_id and status='active' and (starts_on is null or starts_on<=current_date) and (ends_on is null or ends_on>=current_date) and ((p_service_id is not null and service_id=p_service_id) or (p_package_id is not null and package_id=p_package_id))) then
      return jsonb_build_object('success',false,'error','Offer is not applicable');
    end if;
    select case when discount_type='percent' then round(v_price*discount_value/100.0)::integer else discount_value end into v_discount from clinic_offers where id=p_offer_id;
  end if;
  v_discount := least(greatest(v_discount,0),v_price);
  v_net := v_price-v_discount;
  if p_package_id is not null then
    insert into patient_packages(tenant_id,patient_id,package_id,financial_plan_id,purchased_sessions,consumed_sessions,status,purchased_at,created_by)
    select p_tenant_id,p_patient_id,id,p_financial_plan_id,session_limit,0,'active',now(),p_created_by from clinic_packages where id=p_package_id and tenant_id=p_tenant_id;
    returning id into v_patient_package;
  end if;
  v_result := jsonb_build_object('success',true,'gross_subunits',v_price,'discount_subunits',v_discount,'net_subunits',v_net,'patient_package_id',v_patient_package,'financial_plan_id',p_financial_plan_id,'service_id',p_service_id,'package_id',p_package_id,'offer_id',p_offer_id);
  return v_result;
end;
$$;
grant execute on function public.execute_commercial_sale(uuid,uuid,uuid,uuid,uuid,uuid,uuid) to authenticated,service_role;
