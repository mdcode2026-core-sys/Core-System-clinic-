import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { FinancialResourcesSettings } from "@/features/financial-resources/financial-resources-settings";
import type { Locale } from "@/core/i18n/messages";

export default async function FinancialResourcesSettingsPage(){
 const db=await createClient(); const {data:{user},error}=await db.auth.getUser(); if(error||!user) redirect("/login");
 const tenantId=await resolveTenantId(user.id); if(!tenantId) redirect("/login");
 const permissions=await getEffectivePermissions(user.id,tenantId); if(!permissions.includes("settings:read")) redirect("/settings");
 const c=await cookies(); const locale:Locale=c.get("core-system-locale")?.value==="ar"?"ar":"en";
 const [providers,contracts]=await Promise.all([
  db.from("insurance_providers").select("id,name").eq("tenant_id",tenantId).is("deleted_at",null).order("name"),
  db.from("insurance_contracts").select("id,provider_id,contract_number,status").eq("tenant_id",tenantId).is("deleted_at",null).order("starts_on",{ascending:false})
 ]);
 return <div className="p-4 sm:p-6 lg:p-8"><FinancialResourcesSettings locale={locale} providers={providers.data??[]} contracts={contracts.data??[]}/></div>;
}
