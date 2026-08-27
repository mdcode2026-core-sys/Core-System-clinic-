import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { canAccessCapability } from "@/core/entitlements/entitlementEngine";
import { FinancialResourceTable, type FinancialResourceColumn } from "./financial-resource-table";

type Resource = "payments" | "financial-plans" | "installments" | "insurance" | "consumption" | "suppliers" | "purchasing" | "receiving";
const config: Record<Resource, { title: string; permission: string; capability: string; table: string; columns: FinancialResourceColumn[]; select: string }> = {
  payments: { title: "Payments", permission: "invoices:read", capability: "financial_resources.payments", table: "invoice_payments", select: "id, invoice_id, amount_subunits, payment_method, payment_date, reference", columns: [{ key: "invoice_id", label: "Invoice" }, { key: "amount", label: "Amount" }, { key: "payment_method", label: "Method" }, { key: "payment_date", label: "Date" }, { key: "reference", label: "Reference" }] },
  "financial-plans": { title: "Financial Plans", permission: "invoices:read", capability: "financial_resources.financial_plans", table: "financial_plans", select: "id, patient_id, total_amount_subunits, insurance_covered_subunits, patient_responsibility_subunits, status, created_at", columns: [{ key: "patient_id", label: "Patient" }, { key: "total_amount", label: "Total" }, { key: "insurance_covered", label: "Insurance" }, { key: "patient_responsibility", label: "Patient responsibility" }, { key: "status", label: "Status" }, { key: "created_at", label: "Created" }] },
  installments: { title: "Installments", permission: "invoices:read", capability: "financial_resources.installments", table: "financial_installments", select: "id, financial_plan_id, installment_no, due_date, amount_subunits, amount_paid_subunits, status", columns: [{ key: "financial_plan_id", label: "Financial plan" }, { key: "installment_no", label: "#" }, { key: "due_date", label: "Due date" }, { key: "amount", label: "Amount" }, { key: "paid", label: "Paid" }, { key: "status", label: "Status" }] },
  insurance: { title: "Insurance", permission: "insurance:read", capability: "financial_resources.insurance", table: "patient_insurance_profiles", select: "id, patient_id, payer_name, policy_number, member_number, status, claim_ready, reconciliation_status", columns: [{ key: "patient_id", label: "Patient" }, { key: "payer_name", label: "Payer" }, { key: "policy_number", label: "Policy" }, { key: "member_number", label: "Member" }, { key: "status", label: "Status" }, { key: "claim_ready", label: "Claim ready" }, { key: "reconciliation_status", label: "Reconciliation" }] },
  consumption: { title: "Consumption", permission: "inventory:read", capability: "financial_resources.consumption", table: "inventory_ledger", select: "id, item_id, quantity_consumed, consumption_type, notes, created_at", columns: [{ key: "item_id", label: "Item" }, { key: "quantity_consumed", label: "Quantity" }, { key: "consumption_type", label: "Type" }, { key: "notes", label: "Notes" }, { key: "created_at", label: "Date" }] },
  suppliers: { title: "Suppliers", permission: "purchasing:read", capability: "financial_resources.suppliers", table: "suppliers", select: "id, name, contact_name, phone, email, status", columns: [{ key: "name", label: "Supplier" }, { key: "contact_name", label: "Contact" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" }, { key: "status", label: "Status" }] },
  purchasing: { title: "Purchasing", permission: "purchasing:read", capability: "financial_resources.purchasing", table: "purchase_orders", select: "id, order_number, supplier_id, order_date, expected_date, total_subunits, status", columns: [{ key: "order_number", label: "PO number" }, { key: "supplier_id", label: "Supplier" }, { key: "order_date", label: "Order date" }, { key: "expected_date", label: "Expected" }, { key: "total", label: "Total" }, { key: "status", label: "Status" }] },
  receiving: { title: "Receiving", permission: "purchasing:read", capability: "financial_resources.receiving", table: "purchase_receipts", select: "id, purchase_order_id, receipt_number, received_at, received_by", columns: [{ key: "receipt_number", label: "Receipt" }, { key: "purchase_order_id", label: "Purchase order" }, { key: "received_at", label: "Received at" }, { key: "received_by", label: "Received by" }] },
};

export async function FinancialResourceListPage({ resource }: { resource: Resource }) {
  const item = config[resource];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");

  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes(item.permission as never)) redirect("/financial-resources");
  const capability = await canAccessCapability(tenantId, item.capability);
  if (!capability.allowed) redirect("/financial-resources");

  const [{ data, error }, { data: tenant }] = await Promise.all([
    supabase.from(item.table).select(item.select).eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(200),
    supabase.from("master_tenants").select("currency").eq("id", tenantId).maybeSingle(),
  ]);
  if (error) throw error;

  const currency = tenant?.currency ?? "USD";
  const formatMoney = (value: unknown) => {
    const subunits = Number(value);
    if (!Number.isFinite(subunits)) return "—";
    return new Intl.NumberFormat(undefined, { style: "currency", currency, minimumFractionDigits: 2 }).format(subunits / 100);
  };
  const formatDate = (value: unknown) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(String(value))) : "—";

  const rows: Record<string, string | number | null>[] = Array.isArray(data)
    ? data.map((row) => {
        const source = row as Record<string, unknown>;
        const display: Record<string, string | number | null> = {};
        for (const [key, value] of Object.entries(source)) {
          if (key === "id" || key === "tenant_id") continue;
          if (key.endsWith("_subunits")) display[key.replace(/_subunits$/, "")] = formatMoney(value);
          else if (["created_at", "payment_date", "order_date", "expected_date", "received_at", "due_date"].includes(key)) display[key] = formatDate(value);
          else display[key] = value == null ? null : String(value);
        }
        return display;
      })
    : [];

  return <div className="space-y-4"><div><h1 className="text-2xl font-bold">{item.title}</h1><p className="text-sm text-muted-foreground">Financial & Resources</p></div><FinancialResourceTable title={item.title} columns={item.columns} rows={rows} /></div>;
}
