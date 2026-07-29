-- ===================================================================
-- Migration: Capture invoice_items and invoice_payments
-- Date: 2026-07-29
-- Purpose: Sync migration history with live database schema
-- These tables exist in production but were never captured in version control
-- ===================================================================

-- ------------------------------------------------------------
-- invoice_items
-- ------------------------------------------------------------
DO $$
BEGIN
    -- Only create if table doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'invoice_items'
    ) THEN
        CREATE TABLE "public"."invoice_items" (
            "id" uuid DEFAULT gen_random_uuid() NOT NULL,
            "tenant_id" uuid NOT NULL,
            "invoice_id" uuid NOT NULL,
            "procedure_id" uuid,
            "item_description" text NOT NULL,
            "item_description_ar" text,
            "quantity" numeric DEFAULT 1 NOT NULL,
            "unit_price_subunits" integer DEFAULT 0 NOT NULL,
            "discount_subunits" integer DEFAULT 0 NOT NULL,
            "tax_subunits" integer DEFAULT 0 NOT NULL,
            "tax_rate_percent" numeric DEFAULT 16.00 NOT NULL,
            "line_total_subunits" integer,
            "sort_order" integer DEFAULT 0 NOT NULL,
            "created_at" timestamp with time zone DEFAULT now() NOT NULL,
            "updated_at" timestamp with time zone DEFAULT now() NOT NULL
        );
        
        ALTER TABLE "public"."invoice_items" OWNER TO "postgres";
        ALTER TABLE ONLY "public"."invoice_items" ADD CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id");
        ALTER TABLE ONLY "public"."invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."clinic_invoices"("id") ON DELETE CASCADE;
        ALTER TABLE ONLY "public"."invoice_items" ADD CONSTRAINT "invoice_items_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."clinic_procedures"("id") ON DELETE SET NULL;
        ALTER TABLE ONLY "public"."invoice_items" ADD CONSTRAINT "invoice_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id") ON DELETE CASCADE;
        ALTER TABLE "public"."invoice_items" ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "rls_invoice_items_select" ON "public"."invoice_items" FOR SELECT USING (("tenant_id" = "public"."get_current_tenant_id"()));
        CREATE POLICY "rls_invoice_items_insert" ON "public"."invoice_items" FOR INSERT WITH CHECK ((("tenant_id" = "public"."get_current_tenant_id"()) AND (EXISTS ( SELECT 1 FROM clinic_users cu WHERE ((cu.auth_user_id = auth.uid()) AND (cu.tenant_id = invoice_items.tenant_id) AND ((cu.role)::text = ANY ((ARRAY['admin'::character varying, 'receptionist'::character varying, 'doctor'::character varying])::text[])))))));
        CREATE POLICY "rls_invoice_items_update" ON "public"."invoice_items" FOR UPDATE USING ((("tenant_id" = "public"."get_current_tenant_id"()) AND (EXISTS ( SELECT 1 FROM clinic_users cu WHERE ((cu.auth_user_id = auth.uid()) AND (cu.tenant_id = invoice_items.tenant_id) AND ((cu.role)::text = ANY ((ARRAY['admin'::character varying, 'receptionist'::character varying])::text[])))) AND (EXISTS ( SELECT 1 FROM clinic_invoices ci WHERE ((ci.id = invoice_items.invoice_id) AND ((ci.invoice_status)::text = 'draft'::text)))))));
        CREATE POLICY "rls_invoice_items_delete" ON "public"."invoice_items" FOR DELETE USING ((("tenant_id" = "public"."get_current_tenant_id"()) AND (EXISTS ( SELECT 1 FROM clinic_users cu WHERE ((cu.auth_user_id = auth.uid()) AND (cu.tenant_id = invoice_items.tenant_id) AND ((cu.role)::text = 'admin'::text))) AND (EXISTS ( SELECT 1 FROM clinic_invoices ci WHERE ((ci.id = invoice_items.invoice_id) AND ((ci.invoice_status)::text = 'draft'::text)))))));
        
        GRANT ALL ON TABLE "public"."invoice_items" TO "anon";
        GRANT ALL ON TABLE "public"."invoice_items" TO "authenticated";
        GRANT ALL ON TABLE "public"."invoice_items" TO "service_role";
    END IF;
END $$;

-- ------------------------------------------------------------
-- invoice_payments
-- ------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'invoice_payments'
    ) THEN
        CREATE TABLE "public"."invoice_payments" (
            "id" uuid DEFAULT gen_random_uuid() NOT NULL,
            "tenant_id" uuid NOT NULL,
            "invoice_id" uuid NOT NULL,
            "amount_subunits" integer NOT NULL,
            "payment_method" text DEFAULT 'cash'::text NOT NULL,
            "payment_reference" text,
            "transaction_id" text,
            "notes" text,
            "collected_by" uuid,
            "payment_date" timestamp with time zone DEFAULT now() NOT NULL,
            "created_at" timestamp with time zone DEFAULT now() NOT NULL,
            "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
            CONSTRAINT "chk_invoice_payments_method" CHECK (("payment_method" = ANY (ARRAY['cash'::text, 'card'::text, 'bank_transfer'::text, 'insurance'::text, 'online'::text, 'other'::text])))
        );
        
        ALTER TABLE "public"."invoice_payments" OWNER TO "postgres";
        ALTER TABLE ONLY "public"."invoice_payments" ADD CONSTRAINT "invoice_payments_pkey" PRIMARY KEY ("id");
        ALTER TABLE ONLY "public"."invoice_payments" ADD CONSTRAINT "invoice_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."clinic_invoices"("id") ON DELETE CASCADE;
        ALTER TABLE ONLY "public"."invoice_payments" ADD CONSTRAINT "invoice_payments_collected_by_fkey" FOREIGN KEY ("collected_by") REFERENCES "public"."clinic_users"("id") ON DELETE SET NULL;
        ALTER TABLE ONLY "public"."invoice_payments" ADD CONSTRAINT "invoice_payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id") ON DELETE CASCADE;
        ALTER TABLE "public"."invoice_payments" ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "rls_invoice_payments_select" ON "public"."invoice_payments" FOR SELECT USING (("tenant_id" = "public"."get_current_tenant_id"()));
        CREATE POLICY "rls_invoice_payments_insert" ON "public"."invoice_payments" FOR INSERT WITH CHECK ((("tenant_id" = "public"."get_current_tenant_id"()) AND (EXISTS ( SELECT 1 FROM clinic_users cu WHERE ((cu.auth_user_id = auth.uid()) AND (cu.tenant_id = invoice_payments.tenant_id) AND ((cu.role)::text = ANY ((ARRAY['admin'::character varying, 'receptionist'::character varying])::text[])))))));
        CREATE POLICY "rls_invoice_payments_update" ON "public"."invoice_payments" FOR UPDATE USING ((("tenant_id" = "public"."get_current_tenant_id"()) AND (EXISTS ( SELECT 1 FROM clinic_users cu WHERE ((cu.auth_user_id = auth.uid()) AND (cu.tenant_id = invoice_payments.tenant_id) AND ((cu.role)::text = 'admin'::text))))));
        CREATE POLICY "rls_invoice_payments_delete" ON "public"."invoice_payments" FOR DELETE USING ((("tenant_id" = "public"."get_current_tenant_id"()) AND (EXISTS ( SELECT 1 FROM clinic_users cu WHERE ((cu.auth_user_id = auth.uid()) AND (cu.tenant_id = invoice_payments.tenant_id) AND ((cu.role)::text = 'admin'::text))))));
        
        GRANT ALL ON TABLE "public"."invoice_payments" TO "anon";
        GRANT ALL ON TABLE "public"."invoice_payments" TO "authenticated";
        GRANT ALL ON TABLE "public"."invoice_payments" TO "service_role";
    END IF;
END $$;
