import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { PaymentCenter } from "@/features/financial-resources/payment-center";
import type { Locale } from "@/core/i18n/messages";

export default async function PaymentsPage(){
 const db=await createClient(); const {data:{user}}=await db.auth.getUser(); if(!user)redirect("/login");
 const tenantId=await resolveTenantId(user.id); if(!tenantId)redirect("/login"); const permissions=await getEffectivePermissions(user.id,tenantId);
 const canReceipt=permissions.includes("invoices:payment"); const canDisburse=permissions.includes("expenses:manage"); if(!canReceipt&&!canDisburse)redirect("/financial-resources");
 const c=await cookies(); const locale:Locale=c.get("core-system-locale")?.value==="ar"?"ar":"en";
 const [tenant,patients,invoices]=await Promise.all([
  db.from("master_tenants").select("currency").eq("id",tenantId).maybeSingle(),
  db.from("clinic_patients").select("id,first_name,last_name").eq("tenant_id",tenantId).is("deleted_at",null).order("first_name").limit(1000),
  canReceipt?db.from("clinic_invoices").select("id,invoice_number,patient_id,total_subunits,amount_due_subunits").eq("tenant_id",tenantId).order("invoice_date",{ascending:false}).limit(500):Promise.resolve({data:[],error:null})
 ]);
 return <div className="p-4 sm:p-6 lg:p-8"><PaymentCenter locale={locale} currency={tenant.data?.currency??"JOD"} patients={patients.data??[]} invoices={invoices.data??[]} canReceipt={canReceipt} canDisburse={canDisburse}/></div>;
}
