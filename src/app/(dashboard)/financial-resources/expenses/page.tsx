import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { ExpenseOperations } from "@/features/financial-resources/expense-operations";
import type { Locale } from "@/core/i18n/messages";
export default async function ExpensesPage(){const db=await createClient();const{data:{user}}=await db.auth.getUser();if(!user)redirect("/login");const tenantId=await resolveTenantId(user.id);if(!tenantId)redirect("/login");const permissions=await getEffectivePermissions(user.id,tenantId);if(!permissions.includes("expenses:manage"))redirect("/");const locale:Locale=(await cookies()).get("core-system-locale")?.value==="ar"?"ar":"en";const[tenant,expenses]=await Promise.all([db.from("master_tenants").select("currency").eq("id",tenantId).maybeSingle(),db.from("operating_expenses").select("id,expense_date,category,description,amount_subunits,amount_paid_subunits,payment_status").eq("tenant_id",tenantId).order("expense_date",{ascending:false}).limit(500)]);return <div className="p-4 sm:p-6 lg:p-8"><ExpenseOperations locale={locale} currency={tenant.data?.currency??"JOD"} expenses={expenses.data??[]} canManage/></div>}
