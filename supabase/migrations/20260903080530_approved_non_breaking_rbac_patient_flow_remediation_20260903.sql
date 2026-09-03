-- CORE SYSTEM — Approved Non-Breaking Remediation Contract — 2026-09-03
-- Scope: RBAC/RLS/RPC + Patient Flow + listed secondary fixes only.
-- master_tenants/subscriptions/subscription_events intentionally untouched.

CREATE OR REPLACE FUNCTION public.has_tenant_permission(p_tenant_id uuid, p_permission_key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
WITH u AS (
  SELECT cu.id, cu.tenant_id, cu.role_id FROM public.clinic_users cu
  WHERE cu.auth_user_id = auth.uid() AND cu.tenant_id = p_tenant_id AND cu.is_active AND cu.deleted_at IS NULL LIMIT 1
), base AS (
  SELECT 1 FROM u JOIN public.roles r ON r.id=u.role_id JOIN public.role_permissions rp ON rp.role_id=r.id JOIN public.permissions p ON p.id=rp.permission_id WHERE p.permission_key=p_permission_key LIMIT 1
), direct AS (
  SELECT 1 FROM u JOIN public.clinic_user_permissions up ON up.user_id=u.id AND up.tenant_id=u.tenant_id AND up.granted AND up.deleted_at IS NULL JOIN public.permissions p ON p.id=up.permission_id WHERE p.permission_key=p_permission_key LIMIT 1
), override AS (
  SELECT o.granted FROM u JOIN public.clinic_user_permission_overrides o ON o.user_id=u.id AND o.tenant_id=u.tenant_id AND o.deleted_at IS NULL JOIN public.permissions p ON p.id=o.permission_id WHERE p.permission_key=p_permission_key ORDER BY o.updated_at DESC NULLS LAST,o.created_at DESC LIMIT 1
), admin AS (
  SELECT 1 FROM u JOIN public.roles r ON r.id=u.role_id WHERE r.role_key='clinic_admin' LIMIT 1
)
SELECT CASE WHEN EXISTS(SELECT 1 FROM admin) THEN true WHEN EXISTS(SELECT 1 FROM override WHERE granted=false) THEN false WHEN EXISTS(SELECT 1 FROM override WHERE granted=true) THEN true ELSE EXISTS(SELECT 1 FROM base) OR EXISTS(SELECT 1 FROM direct) END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_clinic_user_role_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_admin_role_id uuid; v_old_admin boolean:=false; v_new_admin boolean:=false; v_is_admin_change boolean:=false;
BEGIN
  SELECT r.id INTO v_admin_role_id FROM public.roles r WHERE r.role_key='clinic_admin' AND r.is_system_role=true LIMIT 1;
  IF TG_OP='DELETE' THEN
    IF OLD.role_id=v_admin_role_id THEN RAISE EXCEPTION 'CLINIC_ADMIN_ACCOUNT_PROTECTED'; END IF;
    RETURN OLD;
  END IF;
  v_new_admin:=NEW.role_id=v_admin_role_id;
  IF TG_OP='UPDATE' THEN v_old_admin:=OLD.role_id=v_admin_role_id; END IF;
  IF v_new_admin THEN NEW.role:='clinic_admin'; ELSE SELECT r.role_key INTO NEW.role FROM public.roles r WHERE r.id=NEW.role_id; END IF;
  IF TG_OP='UPDATE' AND v_old_admin THEN
    IF NEW.role_id IS DISTINCT FROM OLD.role_id OR NEW.is_active IS DISTINCT FROM OLD.is_active OR NEW.account_status IS DISTINCT FROM OLD.account_status OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN RAISE EXCEPTION 'CLINIC_ADMIN_ACCOUNT_PROTECTED'; END IF;
  END IF;
  IF TG_OP='UPDATE' AND NEW.role_id IS DISTINCT FROM OLD.role_id THEN v_is_admin_change:=true; END IF;
  IF v_is_admin_change AND v_new_admin THEN RAISE EXCEPTION 'CLINIC_ADMIN_ROLE_ASSIGNMENT_FORBIDDEN'; END IF;
  IF TG_OP='UPDATE' AND v_is_admin_change AND NOT public.has_tenant_permission(NEW.tenant_id,'users:update') THEN RAISE EXCEPTION 'Not authorized to change user roles'; END IF;
  IF v_new_admin AND EXISTS (SELECT 1 FROM public.clinic_users cu WHERE cu.tenant_id=NEW.tenant_id AND cu.role_id=v_admin_role_id AND cu.is_active AND cu.deleted_at IS NULL AND (TG_OP<>'UPDATE' OR cu.id<>OLD.id)) THEN RAISE EXCEPTION 'ONLY_ONE_ACTIVE_CLINIC_ADMIN'; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_enforce_clinic_user_role_change ON public.clinic_users;
CREATE TRIGGER trg_enforce_clinic_user_role_change BEFORE INSERT OR UPDATE OR DELETE ON public.clinic_users FOR EACH ROW EXECUTE FUNCTION public.enforce_clinic_user_role_change();

DROP TRIGGER IF EXISTS trg_enforce_procedure_resource_requirement ON public.master_agenda_events;
DROP FUNCTION IF EXISTS public.enforce_procedure_resource_requirement();
CREATE OR REPLACE FUNCTION public.validate_procedure_resources_for_booking(p_tenant_id uuid,p_procedure_id uuid,p_resource_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF p_tenant_id<>public.get_current_tenant_id() THEN RAISE EXCEPTION 'Tenant mismatch'; END IF;
  IF NOT(public.has_tenant_permission(p_tenant_id,'agenda:create') OR public.has_tenant_permission(p_tenant_id,'agenda:update')) THEN RAISE EXCEPTION 'Permission denied'; END IF;
  IF p_procedure_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.clinic_procedures WHERE id=p_procedure_id AND tenant_id=p_tenant_id AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Procedure does not belong to tenant'; END IF;
  IF p_resource_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.clinic_resources WHERE id=p_resource_id AND tenant_id=p_tenant_id AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Resource does not belong to tenant'; END IF;
  RETURN jsonb_build_object('valid',true,'active_model',false,'required_count',0,'matched_count',0,'message','No active resource requirement model');
END;
$$;

DROP POLICY IF EXISTS rls_patients_isolation ON public.clinic_patients;
CREATE POLICY rls_clinic_patients_select ON public.clinic_patients FOR SELECT TO authenticated USING(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'patients:read'));
CREATE POLICY rls_clinic_patients_insert ON public.clinic_patients FOR INSERT TO authenticated WITH CHECK(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'patients:create'));
CREATE POLICY rls_clinic_patients_update ON public.clinic_patients FOR UPDATE TO authenticated USING(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'patients:update')) WITH CHECK(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'patients:update'));
CREATE POLICY rls_clinic_patients_delete ON public.clinic_patients FOR DELETE TO authenticated USING(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'patients:delete'));

DROP POLICY IF EXISTS rls_agenda_isolation ON public.master_agenda_events;
CREATE POLICY rls_master_agenda_events_select ON public.master_agenda_events FOR SELECT TO authenticated USING(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'agenda:read'));
CREATE POLICY rls_master_agenda_events_insert ON public.master_agenda_events FOR INSERT TO authenticated WITH CHECK(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'agenda:create'));
CREATE POLICY rls_master_agenda_events_update ON public.master_agenda_events FOR UPDATE TO authenticated USING(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'agenda:update')) WITH CHECK(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'agenda:update'));
CREATE POLICY rls_master_agenda_events_delete ON public.master_agenda_events FOR DELETE TO authenticated USING(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'agenda:delete'));

DROP POLICY IF EXISTS rls_procedures_isolation ON public.clinic_procedures;
CREATE POLICY rls_clinic_procedures_select ON public.clinic_procedures FOR SELECT TO authenticated USING(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'procedures:read'));
CREATE POLICY rls_clinic_procedures_insert ON public.clinic_procedures FOR INSERT TO authenticated WITH CHECK(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'procedures:create'));
CREATE POLICY rls_clinic_procedures_update ON public.clinic_procedures FOR UPDATE TO authenticated USING(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'procedures:update')) WITH CHECK(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'procedures:update'));
CREATE POLICY rls_clinic_procedures_delete ON public.clinic_procedures FOR DELETE TO authenticated USING(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'procedures:delete'));

DROP POLICY IF EXISTS rls_followups_isolation ON public.retention_followups;
CREATE POLICY rls_retention_followups_select ON public.retention_followups FOR SELECT TO authenticated USING(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'followup:read'));
CREATE POLICY rls_retention_followups_insert ON public.retention_followups FOR INSERT TO authenticated WITH CHECK(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'followup:create'));
CREATE POLICY rls_retention_followups_update ON public.retention_followups FOR UPDATE TO authenticated USING(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'followup:update')) WITH CHECK(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'followup:update'));

DROP POLICY IF EXISTS rls_inventory_items_read ON public.inventory_items;
CREATE POLICY rls_inventory_items_read ON public.inventory_items FOR SELECT TO authenticated USING(tenant_id=public.get_current_tenant_id() AND public.has_tenant_permission(tenant_id,'inventory:read'));

CREATE OR REPLACE FUNCTION public.execute_commercial_sale(p_tenant_id uuid,p_patient_id uuid,p_service_id uuid DEFAULT NULL::uuid,p_package_id uuid DEFAULT NULL::uuid,p_offer_id uuid DEFAULT NULL::uuid,p_financial_plan_id uuid DEFAULT NULL::uuid,p_created_by uuid DEFAULT NULL::uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_price integer; v_discount integer:=0; v_net integer; v_patient_package uuid; v_invoice jsonb; v_financial_total integer; v_financial_patient integer; v_name text; v_invoice_id uuid;
BEGIN
  IF p_tenant_id<>public.get_current_tenant_id() THEN RAISE EXCEPTION 'Tenant mismatch'; END IF;
  IF NOT public.has_tenant_permission(p_tenant_id,'packages:sell') THEN RAISE EXCEPTION 'Permission denied'; END IF;
  IF p_created_by IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.clinic_users WHERE id=p_created_by AND tenant_id=p_tenant_id AND is_active AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Actor does not belong to tenant'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.clinic_patients WHERE id=p_patient_id AND tenant_id=p_tenant_id AND deleted_at IS NULL) THEN RETURN jsonb_build_object('success',false,'error','Patient not found'); END IF;
  IF (p_service_id IS NULL)=(p_package_id IS NULL) THEN RETURN jsonb_build_object('success',false,'error','Exactly one service or package is required'); END IF;
  IF p_financial_plan_id IS NULL THEN RETURN jsonb_build_object('success',false,'error','Financial plan is required before commercial sale execution'); END IF;
  IF p_service_id IS NOT NULL THEN SELECT base_price_subunits,name INTO v_price,v_name FROM public.clinic_services WHERE id=p_service_id AND tenant_id=p_tenant_id AND is_active; ELSE SELECT base_price_subunits,name INTO v_price,v_name FROM public.clinic_packages WHERE id=p_package_id AND tenant_id=p_tenant_id AND is_active; END IF;
  IF v_price IS NULL THEN RETURN jsonb_build_object('success',false,'error','Commercial item not found'); END IF;
  IF p_offer_id IS NOT NULL THEN
    IF NOT EXISTS(SELECT 1 FROM public.clinic_offers WHERE id=p_offer_id AND tenant_id=p_tenant_id AND status='active' AND (starts_on IS NULL OR starts_on<=current_date) AND (ends_on IS NULL OR ends_on>=current_date) AND ((p_service_id IS NOT NULL AND service_id=p_service_id) OR (p_package_id IS NOT NULL AND package_id=p_package_id))) THEN RETURN jsonb_build_object('success',false,'error','Offer is not applicable'); END IF;
    SELECT CASE WHEN discount_type='percent' THEN round(v_price*discount_value/100.0)::integer ELSE discount_value END INTO v_discount FROM public.clinic_offers WHERE id=p_offer_id;
  END IF;
  v_discount:=least(greatest(v_discount,0),v_price); v_net:=v_price-v_discount;
  SELECT total_amount_subunits,patient_responsibility_subunits INTO v_financial_total,v_financial_patient FROM public.financial_plans WHERE id=p_financial_plan_id AND tenant_id=p_tenant_id AND patient_id=p_patient_id AND deleted_at IS NULL AND status IN('draft','active');
  IF NOT FOUND THEN RETURN jsonb_build_object('success',false,'error','Financial plan not found or does not belong to patient'); END IF;
  IF v_financial_patient<>v_net AND v_financial_total<>v_net THEN RETURN jsonb_build_object('success',false,'error','Financial plan amount does not match commercial sale net amount'); END IF;
  v_invoice:=public.create_manual_invoice(p_tenant_id,p_patient_id,null,current_date,'installment','Commercial sale: '||v_name,p_created_by,jsonb_build_array(jsonb_build_object('procedure_id',null,'description',v_name,'quantity',1,'unit_price_subunits',v_price,'discount_amount_subunits',v_discount,'discount_percent',null,'tax_rate_percent',0)));
  IF coalesce((v_invoice->>'success')::boolean,false) IS NOT TRUE THEN RETURN jsonb_build_object('success',false,'error',coalesce(v_invoice->>'error','Invoice creation failed')); END IF;
  v_invoice_id:=(v_invoice->>'invoice_id')::uuid;
  IF p_package_id IS NOT NULL THEN INSERT INTO public.patient_packages(tenant_id,patient_id,package_id,financial_plan_id,purchased_sessions,consumed_sessions,status,purchased_at,created_by) SELECT p_tenant_id,p_patient_id,id,p_financial_plan_id,coalesce(session_limit,0),0,'active',now(),p_created_by FROM public.clinic_packages WHERE id=p_package_id AND tenant_id=p_tenant_id RETURNING id INTO v_patient_package; END IF;
  RETURN jsonb_build_object('success',true,'gross_subunits',v_price,'discount_subunits',v_discount,'net_subunits',v_net,'patient_package_id',v_patient_package,'financial_plan_id',p_financial_plan_id,'invoice_id',v_invoice_id,'service_id',p_service_id,'package_id',p_package_id,'offer_id',p_offer_id);
END; $$;

CREATE OR REPLACE FUNCTION public.consume_procedure_inventory(p_tenant_id uuid,p_visit_id uuid,p_treatment_plan_item_id uuid,p_item_id uuid,p_quantity numeric,p_consumed_by uuid,p_reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_stock numeric; v_new numeric; v_procedure_id uuid; v_existing uuid; v_patient_id uuid;
BEGIN
  IF p_tenant_id<>public.get_current_tenant_id() THEN RAISE EXCEPTION 'Tenant mismatch'; END IF;
  IF NOT public.has_tenant_permission(p_tenant_id,'inventory:adjust') THEN RAISE EXCEPTION 'Permission denied'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.clinic_users WHERE id=p_consumed_by AND tenant_id=p_tenant_id AND is_active AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Actor does not belong to tenant'; END IF;
  IF p_quantity<=0 THEN RETURN jsonb_build_object('success',false,'error','Quantity must be positive'); END IF;
  SELECT patient_id INTO v_patient_id FROM public.clinic_visit_sessions WHERE id=p_visit_id AND tenant_id=p_tenant_id AND deleted_at IS NULL; IF NOT FOUND THEN RETURN jsonb_build_object('success',false,'error','Visit not found'); END IF;
  IF p_treatment_plan_item_id IS NOT NULL THEN SELECT procedure_id INTO v_procedure_id FROM public.clinic_treatment_plan_items WHERE id=p_treatment_plan_item_id AND tenant_id=p_tenant_id; IF NOT FOUND THEN RETURN jsonb_build_object('success',false,'error','Treatment plan item not found'); END IF; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.inventory_items WHERE id=p_item_id AND tenant_id=p_tenant_id AND deleted_at IS NULL) THEN RETURN jsonb_build_object('success',false,'error','Inventory item not found'); END IF;
  SELECT id INTO v_existing FROM public.inventory_ledger WHERE tenant_id=p_tenant_id AND session_id=p_visit_id AND item_id=p_item_id AND treatment_plan_item_id=p_treatment_plan_item_id AND deleted_at IS NULL LIMIT 1;
  IF v_existing IS NOT NULL THEN RETURN jsonb_build_object('success',true,'idempotent',true,'ledger_id',v_existing,'patient_id',v_patient_id,'procedure_id',v_procedure_id); END IF;
  SELECT current_stock INTO v_stock FROM public.inventory_items WHERE id=p_item_id AND tenant_id=p_tenant_id AND deleted_at IS NULL FOR UPDATE; IF v_stock IS NULL THEN RETURN jsonb_build_object('success',false,'error','Inventory item not found'); END IF;
  IF v_stock<p_quantity THEN RETURN jsonb_build_object('success',false,'error','Insufficient stock'); END IF;
  v_new:=v_stock-p_quantity; UPDATE public.inventory_items SET current_stock=v_new,updated_at=now() WHERE id=p_item_id AND tenant_id=p_tenant_id;
  INSERT INTO public.inventory_ledger(tenant_id,item_id,procedure_id,treatment_plan_item_id,material_name,quantity_consumed,consumption_type,notes,logged_by,session_id) SELECT p_tenant_id,p_item_id,v_procedure_id,p_treatment_plan_item_id,ii.name,p_quantity,'doctor_request',p_reason,p_consumed_by,p_visit_id FROM public.inventory_items ii WHERE ii.id=p_item_id AND ii.tenant_id=p_tenant_id RETURNING id INTO v_existing;
  RETURN jsonb_build_object('success',true,'idempotent',false,'ledger_id',v_existing,'new_stock',v_new,'visit_id',p_visit_id,'treatment_plan_item_id',p_treatment_plan_item_id,'patient_id',v_patient_id,'procedure_id',v_procedure_id);
EXCEPTION WHEN unique_violation THEN
  SELECT id INTO v_existing FROM public.inventory_ledger WHERE tenant_id=p_tenant_id AND session_id=p_visit_id AND item_id=p_item_id AND treatment_plan_item_id=p_treatment_plan_item_id AND deleted_at IS NULL LIMIT 1;
  RETURN jsonb_build_object('success',true,'idempotent',true,'ledger_id',v_existing,'patient_id',v_patient_id,'procedure_id',v_procedure_id);
END; $$;

CREATE OR REPLACE FUNCTION public.get_workforce_unavailability(p_tenant_id uuid,p_employee_id uuid,p_start timestamptz,p_end timestamptz)
RETURNS TABLE(starts_at timestamptz,ends_at timestamptz,absence_type text,reason text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF p_tenant_id<>public.get_current_tenant_id() THEN RAISE EXCEPTION 'Tenant mismatch'; END IF;
  IF NOT public.has_tenant_permission(p_tenant_id,'workforce:read') THEN RAISE EXCEPTION 'Permission denied'; END IF;
  IF p_employee_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.workforce_employees WHERE id=p_employee_id AND tenant_id=p_tenant_id) THEN RAISE EXCEPTION 'Employee does not belong to tenant'; END IF;
  RETURN QUERY SELECT u.starts_at,u.ends_at,u.absence_type,u.reason FROM public.workforce_unavailability_blocks u WHERE u.tenant_id=p_tenant_id AND u.status='approved' AND (u.employee_id=p_employee_id OR u.employee_id IS NULL) AND u.starts_at<p_end AND u.ends_at>p_start ORDER BY u.starts_at;
END; $$;

REVOKE EXECUTE ON FUNCTION public.validate_procedure_resources_for_booking(uuid,uuid,uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.validate_procedure_resources_for_booking(uuid,uuid,uuid) TO authenticated;

ALTER TABLE public.master_agenda_events ADD CONSTRAINT no_patient_overlap EXCLUDE USING gist (patient_id WITH =, tstzrange(scheduled_start,buffer_end) WITH &&) WHERE (patient_id IS NOT NULL AND status <> ALL (ARRAY['cancelled'::varchar,'no_show'::varchar]));
