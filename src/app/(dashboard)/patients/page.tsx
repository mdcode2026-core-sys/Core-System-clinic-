import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import PatientsPageClient from "@/features/patients/PatientsPageClient";

export default async function PatientsPage() {
  const db = await createClient();
  const { data, error } = await db.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || typeof userId !== "string") redirect("/login");

  const tenantId = await resolveTenantId(userId);
  if (!tenantId) redirect("/login");

  const permissions = await getEffectivePermissions(userId, tenantId);
  if (!permissions.includes("patients:read")) redirect("/");

  return (
    <PatientsPageClient
      tenantId={tenantId}
      userId={userId}
      canCreate={permissions.includes("patients:create")}
    />
  );
}
