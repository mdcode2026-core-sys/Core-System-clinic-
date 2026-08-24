import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getInvoiceMessages } from "@/core/i18n/invoiceMessages";
import type { Locale } from "@/core/i18n/messages";
import { InvoiceList } from "@/features/invoicing/invoice-list";
import { listInvoices } from "@/domain/invoicing/invoicing.queries";

export default async function InvoicesPage() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("core-system-locale")?.value;
  const tenantLanguage = cookieStore.get("tenant-language")?.value;
  const locale: Locale = localeCookie === "ar" || localeCookie === "en"
    ? localeCookie
    : tenantLanguage === "ar" || tenantLanguage === "en" ? tenantLanguage : "en";
  const invoice = getInvoiceMessages(locale);

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");

  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("invoices:read")) redirect("/");

  const [{ data: tenant }, result] = await Promise.all([
    supabase.from("master_tenants").select("currency").eq("id", tenantId).maybeSingle(),
    listInvoices(),
  ]);

  const currency = tenant?.currency ?? "USD";

  return (
    <div className="space-y-6 p-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold">{invoice.title}</h1>
      <InvoiceList
        initialData={result.success ? result.data : []}
        initialError={result.success ? null : result.error}
        permissions={permissions}
        currency={currency}
      />
    </div>
  );
}
