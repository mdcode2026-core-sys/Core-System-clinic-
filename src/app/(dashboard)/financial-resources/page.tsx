import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getFinancialResourcesMessages } from "@/core/i18n/financialResourcesMessages";
import { FinancialResourcesOperationsCenter } from "@/features/financial-resources/financial-resources-operations-center";
import type { Locale } from "@/core/i18n/messages";

export default async function FinancialResourcesPage(){
 const supabase=await createClient(); const {data:{user},error}=await supabase.auth.getUser(); if(error||!user) redirect("/login");
 const tenantId=await resolveTenantId(user.id); if(!tenantId) redirect("/login"); const permissions=await getEffectivePermissions(user.id,tenantId);
 const canRead=permissions.includes("invoices:read")||permissions.includes("insurance:read")||permissions.includes("purchasing:read")||permissions.includes("inventory:read"); if(!canRead) redirect("/");
 const c=await cookies(); const raw=c.get("core-system-locale")?.value; const locale:Locale=raw==="ar"?"ar":"en"; const t=getFinancialResourcesMessages(locale);
 const [tenant,patients,invoices,items,suppliers,providers,contracts,bills,expenses]=await Promise.all([
  supabase.from("master_tenants").select("currency").eq("id",tenantId).maybeSingle(),
  supabase.from("clinic_patients").select("id,first_name,last_name,phone_primary").eq("tenant_id",tenantId).is("deleted_at",null).order("first_name").limit(1000),
  permissions.includes("invoices:read")?supabase.from("clinic_invoices").select("id,invoice_number,invoice_date,invoice_status,patient_id,total_subunits,amount_paid_subunits,amount_due_subunits").eq("tenant_id",tenantId).order("invoice_date",{ascending:false}).limit(500):Promise.resolve({data:[],error:null}),
  permissions.includes("inventory:read")?supabase.from("inventory_items").select("id,name,name_ar,sku,category,unit,current_stock,reorder_threshold,purchase_cost_subunits,valuation_cost_subunits,selling_price_subunits,is_procedure_material,is_operating_consumable,requires_batch_tracking,requires_expiry_tracking").eq("tenant_id",tenantId).eq("is_active",true).is("deleted_at",null).order("name").limit(1000):Promise.resolve({data:[],error:null}),
  permissions.includes("purchasing:read")?supabase.from("suppliers").select("id,name,phone,email").eq("tenant_id",tenantId).is("deleted_at",null).order("name").limit(500):Promise.resolve({data:[],error:null}),
  permissions.includes("insurance:read")?supabase.from("insurance_providers").select("id,name,name_ar").eq("tenant_id",tenantId).is("deleted_at",null).order("name").limit(500):Promise.resolve({data:[],error:null}),
  permissions.includes("insurance:read")?supabase.from("insurance_contracts").select("id,provider_id,contract_number,starts_on,ends_on,default_coverage_percent,patient_responsibility_percent,status").eq("tenant_id",tenantId).is("deleted_at",null).order("starts_on",{ascending:false}).limit(500):Promise.resolve({data:[],error:null}),
  permissions.includes("purchasing:read")?supabase.from("supplier_bills").select("id,supplier_id,bill_number,bill_date,due_date,total_subunits,amount_paid_subunits,status").eq("tenant_id",tenantId).is("deleted_at",null).order("bill_date",{ascending:false}).limit(500):Promise.resolve({data:[],error:null}),
  permissions.includes("expenses:manage")?supabase.from("operating_expenses").select("id,expense_date,category,description,amount_subunits,amount_paid_subunits,payment_status").eq("tenant_id",tenantId).order("expense_date",{ascending:false}).limit(500):Promise.resolve({data:[],error:null})
 ]);
 return <div className="space-y-4 p-4 sm:p-6 lg:p-8" dir={locale==="ar"?"rtl":"ltr"}><div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1><p className="mt-1 text-sm text-muted-foreground">{t.description}</p></div><FinancialResourcesOperationsCenter locale={locale} currency={tenant.data?.currency??"JOD"} patients={patients.data??[]} invoices={invoices.data??[]} items={items.data??[]} suppliers={suppliers.data??[]} providers={providers.data??[]} contracts={contracts.data??[]} bills={bills.data??[]} expenses={expenses.data??[]} canPayment={permissions.includes("invoices:payment")} canInventory={permissions.includes("inventory:adjust")} canInsurance={permissions.includes("insurance:manage")} canPurchasing={permissions.includes("purchasing:manage")} canExpense={permissions.includes("expenses:manage")} /> </div>;
}
