import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { InvoiceList } from "@/features/invoicing/invoice-list";
import { listInvoices } from "@/domain/invoicing/invoicing.queries";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const tenantId = await resolveTenantId(user.id);

  if (!tenantId) {
    redirect("/login");
  }

  const permissions = await getEffectivePermissions(user.id, tenantId);

  if (!permissions.includes("invoices:read")) {
    redirect("/");
  }

  const result = await listInvoices();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">الفواتير</h1>
      <InvoiceList 
        initialData={result.success ? result.data : []} 
        initialError={result.success ? null : result.error} 
        permissions={permissions}
      />
    </div>
  );
}
