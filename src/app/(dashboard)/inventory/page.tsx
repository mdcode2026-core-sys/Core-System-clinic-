import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { InventoryOperations } from "@/features/financial-resources/inventory-operations";
import type { Locale } from "@/core/i18n/messages";
export default async function InventoryPage(){
 const db=await createClient();const{data:{user}}=await db.auth.getUser();if(!user)redirect("/login");const tenantId=await resolveTenantId(user.id);if(!tenantId)redirect("/login");const permissions=await getEffectivePermissions(user.id,tenantId);if(!permissions.includes("inventory:read"))redirect("/");const c=await cookies();const locale:Locale=c.get("core-system-locale")?.value==="ar"?"ar":"en";
 const {data}=await db.from("inventory_items").select("id,name,name_ar,unit,current_stock,reorder_threshold").eq("tenant_id",tenantId).eq("is_active",true).is("deleted_at",null).order("name").limit(1000);
 return <div className="p-4 sm:p-6 lg:p-8"><InventoryOperations locale={locale} items={data??[]} canManage={permissions.includes("inventory:adjust")}/></div>;
}
