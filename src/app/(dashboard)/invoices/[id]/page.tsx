import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { InvoiceDetail } from "@/features/invoicing/invoice-detail";
import { getInvoiceWithDetails } from "@/domain/invoicing/invoicing.actions";

interface Props { params: Promise<{ id: string }>; }

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getInvoiceWithDetails(id);
  if (!result.success) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) notFound();
  const { data: tenant } = await supabase.from("master_tenants").select("currency").eq("id", tenantId).maybeSingle();

  const cookieStore = await cookies();
  const locale = cookieStore.get("core-system-locale")?.value;
  const direction = locale === "ar" ? "rtl" : "ltr";

  return <div className="p-6" dir={direction}><InvoiceDetail invoice={result.data} currency={tenant?.currency ?? "USD"} /></div>;
}
