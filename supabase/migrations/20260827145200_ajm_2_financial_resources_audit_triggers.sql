DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['financial_plans','financial_installments','patient_insurance_profiles','insurance_claims','suppliers','purchase_orders','purchase_order_items','purchase_receipts','purchase_receipt_items'] LOOP
    EXECUTE format('drop trigger if exists trg_ajm2_audit_%I on public.%I', t, t);
    EXECUTE format('create trigger trg_ajm2_audit_%I after insert or update or delete on public.%I for each row execute function public.fn_audit_changes()', t, t);
  END LOOP;
END $$;
