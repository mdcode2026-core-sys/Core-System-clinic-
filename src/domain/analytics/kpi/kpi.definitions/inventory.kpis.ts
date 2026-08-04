import type { KpiDefinition } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

/**
 * Inventory KPIs — Package 3.1.8
 * Approved: Stock Turnover Rate, Inventory Consumption Rate, Low Stock Risk Rate,
 *            Inventory Adjustment Rate, Purchase Return Rate
 *
 * NOTE: Material Waste Rate is NOT feasible — no waste tracking column/type exists
 *       in inventory_ledger (types: purchase, purchase_return, doctor_request,
 *       unused_return, inventory_adjustment_increase, inventory_adjustment_decrease).
 *       Documented in Handoff Report.
 */

// ── 1. Stock Turnover Rate ───────────────────────────────────
// Formula: total quantity consumed (outbound) / average stock held
// Higher = faster stock movement = better efficiency
export const stockTurnoverRateKpi: KpiDefinition = {
  id: "inventory.stock_turnover_rate",
  nameAr: "معدل دوران المخزون",
  category: "inventory",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data: consumedData, error: err1 } = await supabase
      .from("inventory_ledger")
      .select("quantity_consumed")
      .eq("tenant_id", tenantId)
      .eq("consumption_type", "doctor_request")
      .gte("created_at", `${dateRange.from}T00:00:00`)
      .lte("created_at", `${dateRange.to}T23:59:59`);
    if (err1) throw err1;

    const totalConsumed = (consumedData ?? []).reduce(
      (acc, row) => acc + (row.quantity_consumed ?? 0), 0
    );

    const { data: stockData, error: err2 } = await supabase
      .from("inventory_items")
      .select("current_stock")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .is("deleted_at", null);
    if (err2) throw err2;

    const avgStock = (stockData ?? []).reduce(
      (acc, row) => acc + (row.current_stock ?? 0), 0
    );

    if (avgStock === 0) return 0;
    return (totalConsumed / avgStock) * 100;
  },
  formatter: kpiFormatter.percentage,
};

// ── 2. Inventory Consumption Rate ────────────────────────────
// Formula: total consumed quantity / total items in catalog
export const inventoryConsumptionRateKpi: KpiDefinition = {
  id: "inventory.consumption_rate",
  nameAr: "معدل استهلاك المخزون",
  category: "inventory",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data: consumedData, error: err1 } = await supabase
      .from("inventory_ledger")
      .select("quantity_consumed")
      .eq("tenant_id", tenantId)
      .eq("consumption_type", "doctor_request")
      .gte("created_at", `${dateRange.from}T00:00:00`)
      .lte("created_at", `${dateRange.to}T23:59:59`);
    if (err1) throw err1;

    const totalConsumed = (consumedData ?? []).reduce(
      (acc, row) => acc + (row.quantity_consumed ?? 0), 0
    );

    const { count: totalItems, error: err2 } = await supabase
      .from("inventory_items")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .is("deleted_at", null);
    if (err2) throw err2;

    const items = totalItems ?? 0;
    if (items === 0) return 0;
    return totalConsumed / items;
  },
  formatter: (v) => v.toLocaleString("en-US", { maximumFractionDigits: 1 }),
};

// ── 3. Low Stock Risk Rate ───────────────────────────────────
// Formula: items at or below reorder_threshold / total active items
export const lowStockRiskRateKpi: KpiDefinition = {
  id: "inventory.low_stock_risk_rate",
  nameAr: "معدل مخاطر نقص المخزون",
  category: "inventory",
  calculator: async (supabase, tenantId, _dateRange) => {
    const { count: lowStockCount, error: err1 } = await supabase
      .from("inventory_items")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .lte("current_stock", "reorder_threshold");
    if (err1) throw err1;

    const { count: totalItems, error: err2 } = await supabase
      .from("inventory_items")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .is("deleted_at", null);
    if (err2) throw err2;

    const low = lowStockCount ?? 0;
    const total = totalItems ?? 0;
    if (total === 0) return 0;
    return (low / total) * 100;
  },
  formatter: kpiFormatter.percentage,
};

// ── 4. Inventory Adjustment Rate ─────────────────────────────
// Formula: adjustment entries / total ledger entries in period
export const inventoryAdjustmentRateKpi: KpiDefinition = {
  id: "inventory.adjustment_rate",
  nameAr: "معدل تعديلات المخزون",
  category: "inventory",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count: adjCount, error: err1 } = await supabase
      .from("inventory_ledger")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .in("consumption_type", ["inventory_adjustment_increase", "inventory_adjustment_decrease"])
      .gte("created_at", `${dateRange.from}T00:00:00`)
      .lte("created_at", `${dateRange.to}T23:59:59`);
    if (err1) throw err1;

    const { count: totalCount, error: err2 } = await supabase
      .from("inventory_ledger")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", `${dateRange.from}T00:00:00`)
      .lte("created_at", `${dateRange.to}T23:59:59`);
    if (err2) throw err2;

    const adj = adjCount ?? 0;
    const total = totalCount ?? 0;
    if (total === 0) return 0;
    return (adj / total) * 100;
  },
  formatter: kpiFormatter.percentage,
};

// ── 5. Purchase Return Rate ──────────────────────────────────
// Formula: purchase_return quantity / purchase quantity
export const purchaseReturnRateKpi: KpiDefinition = {
  id: "inventory.purchase_return_rate",
  nameAr: "معدل إرجاع المشتريات",
  category: "inventory",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data: returnData, error: err1 } = await supabase
      .from("inventory_ledger")
      .select("quantity_consumed")
      .eq("tenant_id", tenantId)
      .eq("consumption_type", "purchase_return")
      .gte("created_at", `${dateRange.from}T00:00:00`)
      .lte("created_at", `${dateRange.to}T23:59:59`);
    if (err1) throw err1;

    const totalReturned = (returnData ?? []).reduce(
      (acc, row) => acc + (row.quantity_consumed ?? 0), 0
    );

    const { data: purchaseData, error: err2 } = await supabase
      .from("inventory_ledger")
      .select("quantity_consumed")
      .eq("tenant_id", tenantId)
      .eq("consumption_type", "purchase")
      .gte("created_at", `${dateRange.from}T00:00:00`)
      .lte("created_at", `${dateRange.to}T23:59:59`);
    if (err2) throw err2;

    const totalPurchased = (purchaseData ?? []).reduce(
      (acc, row) => acc + (row.quantity_consumed ?? 0), 0
    );

    if (totalPurchased === 0) return 0;
    return (totalReturned / totalPurchased) * 100;
  },
  formatter: kpiFormatter.percentage,
};

// ── 6. Material Waste Rate ───────────────────────────────────
// NOT IMPLEMENTED — no waste tracking exists in inventory_ledger.
// The approved transaction types are: purchase, purchase_return, doctor_request,
// unused_return, inventory_adjustment_increase, inventory_adjustment_decrease.
// None of these map to "waste". Documented in Handoff Report.
