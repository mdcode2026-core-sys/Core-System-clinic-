import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getFinancialResourcesMessages } from "@/core/i18n/financialResourcesMessages";
import { FinancialResourcesWorkspace } from "@/features/financial-resources/financial-resources-workspace";
import { FinancialResourceReport } from "@/features/financial-resources/financial-resource-report";
import type { Locale } from "@/core/i18n/messages";

export default async function FinancialResourcesPage({ searchParams }: { searchParams?: Promise<{ section?: string }> }) {
 const supabase=await createClient(); const {data:{user},error}=await supabase.auth.getUser(); if(error||!user)redirect("/login");
 const tenantId=await resolveTenantId(user.id); if(!tenantId)redirect("/login"); const permissions=await getEffectivePermissions(user.id,tenantId);
 const canRead=permissions.includes("invoices:read")||permissions.includes("insurance:read")||permissions.includes("purchasing:read")||permissions.includes("inventory:read")||permissions.includes("expenses:manage"); if(!canRead)redirect("/");
 const params=await searchParams; const requestedSection=params?.section; const aliases:Record<string,string>={home:"overview",invoices:"receivables",payments:"receivables",plans:"plans",insurance:"insurance",inventory:"inventory",purchasing:"purchasing",expenses:"expenses"}; const initialTab=aliases[requestedSection??""];
 const c=await cookies(); const raw=c.get("core-system-locale")?.value; const locale:Locale=raw==="ar"?"ar":"en"; const t=getFinancialResourcesMessages(locale); void t;
 const today=new Date(); const from=new Date(today.getFullYear(),today.getMonth(),1).toISOString().slice(0,10); const to=today.toISOString().slice(0,10);
 const [tenant,patients,invoices,items,suppliers,providers,contracts,bills,expenses,report]=await Promise.all([
  supabase.from("master_tenants").select("currency").eq("id",tenantId).maybeSingle(),
  supabase.from("clinic_patients").select("id,first_name,last_name,phone_primary").eq("tenant_id",tenantId).is("deleted_at",null).order("first_name").limit(1000),
  permissions.includes("invoices:read")?supabase.from("clinic_invoices").select("id,invoice_number,invoice_date,invoice_status,patient_id,total_subunits,amount_paid_subunits,amount_due_subunits").eq("tenant_id",tenantId).order("invoice_date",{ascending:false}).limit(500):Promise.resolve({data:[],error:null}),
  permissions.includes("inventory:read")?supabase.from("inventory_items").select("id,name,name_ar,sku,category,unit,current_stock,reorder_threshold,purchase_cost_subunits,valuation_cost_subunits,selling_price_subunits,is_procedure_material,is_operating_consumable,requires_batch_tracking,requires_expiry_tracking").eq("tenant_id",tenantId).eq("is_active",true).is("deleted_at",null).order("name").limit(1000):Promise.resolve({data:[],error:null}),
  permissions.includes("purchasing:read")?supabase.from("suppliers").select("id,name,phone,email").eq("tenant_id",tenantId).is("deleted_at",null).order("name").limit(500):Promise.resolve({data:[],error:null}),
  permissions.includes("insurance:read")?supabase.from("insurance_providers").select("id,name,name_ar").eq("tenant_id",tenantId).is("deleted_at",null).order("name").limit(500):Promise.resolve({data:[],error:null}),
  permissions.includes("insurance:read")?supabase.from("insurance_contracts").select("id,provider_id,contract_number,starts_on,ends_on,default_coverage_percent,patient_responsibility_percent,status").eq("tenant_id",tenantId).is("deleted_at",null).order("starts_on",{ascending:false}).limit(500):Promise.resolve({data:[],error:null}),
  permissions.includes("purchasing:read")?supabase.from("supplier_bills").select("id,supplier_id,bill_number,bill_date,due_date,total_subunits,amount_paid_subunits,status").eq("tenant_id",tenantId).is("deleted_at",null).order("bill_date",{ascending:false}).limit(500):Promise.resolve({data:[],error:null}),
  permissions.includes("expenses:manage")?supabase.from("operating_expenses").select("id,expense_date,category,description,amount_subunits,amount_paid_subunits,payment_status").eq("tenant_id",tenantId).order("expense_date",{ascending:false}).limit(500):Promise.resolve({data:[],error:null}),
  permissions.includes("reports:read")&&(!requestedSection||requestedSection==="home")?supabase.rpc("get_financial_resource_summary",{p_tenant_id:tenantId,p_from_date:from,p_to_date:to}):Promise.resolve({data:null,error:null})
 ]);
 const summary=(report.data&&typeof report.data==='object'?report.data:{}) as Record<string,number>; const isOverview=!requestedSection||requestedSection==="home";
 return <div className="space-y-6 p-4 sm:p-6 lg:p-8" dir={locale==="ar"?"rtl":"ltr"}>
  <FinancialResourcesWorkspace locale={locale} currency={tenant.data?.currency??"JOD"} patients={patients.data??[]} invoices={invoices.data??[]} items={items.data??[]} suppliers={suppliers.data??[]} providers={providers.data??[]} contracts={contracts.data??[]} bills={bills.data??[]} expenses={expenses.data??[]} canPayment={permissions.includes("invoices:payment")} canInventory={permissions.includes("inventory:adjust")} canInsurance={permissions.includes("insurance:manage")} canPurchasing={permissions.includes("purchasing:manage")} canExpense={permissions.includes("expenses:manage")} initialTab={initialTab}/>
  {isOverview&&permissions.includes("reports:read")&&<FinancialResourceReport locale={locale} currency={tenant.data?.currency??"JOD"} summary={summary}/>} 
 </div>;
}
