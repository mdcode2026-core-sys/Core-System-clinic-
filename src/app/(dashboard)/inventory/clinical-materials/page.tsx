import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { ClinicalMaterialOperations } from "@/features/financial-resources/clinical-material-operations";
import type { Locale } from "@/core/i18n/messages";

export default async function ClinicalMaterialsPage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("inventory:read")) redirect("/");
  const locale: Locale = (await cookies()).get("core-system-locale")?.value === "ar" ? "ar" : "en";

  const [procedures, items, requirements, visits, patients, issues] = await Promise.all([
    db.from("clinic_procedures").select("id,procedure_name,procedure_name_ar").eq("tenant_id", tenantId).eq("is_active", true).is("deleted_at", null).order("procedure_name").limit(1000),
    db.from("inventory_items").select("id,name,name_ar,unit,current_stock,is_procedure_material").eq("tenant_id", tenantId).eq("is_active", true).is("deleted_at", null).order("name").limit(1000),
    db.from("clinic_procedure_inventory_requirements").select("id,procedure_id,inventory_item_id,standard_quantity,required,notes").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(2000),
    db.from("clinic_visit_sessions").select("id,patient_id,agenda_event_id,created_at").eq("tenant_id", tenantId).is("deleted_at", null).order("created_at", { ascending: false }).limit(200),
    db.from("clinic_patients").select("id,first_name,last_name").eq("tenant_id", tenantId).is("deleted_at", null).limit(1000),
    db.from("inventory_procedure_issues").select("id,visit_id,treatment_plan_item_id,procedure_id,inventory_item_id,quantity_issued,quantity_consumed,quantity_returned,status,issued_at,notes").eq("tenant_id", tenantId).order("issued_at", { ascending: false }).limit(500),
  ]);

  return <div className="p-4 sm:p-6 lg:p-8"><ClinicalMaterialOperations locale={locale} canManage={permissions.includes("inventory:adjust")} procedures={procedures.data ?? []} items={items.data ?? []} requirements={requirements.data ?? []} visits={visits.data ?? []} patients={patients.data ?? []} issues={issues.data ?? []} /></div>;
}
