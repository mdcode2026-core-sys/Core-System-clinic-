import type { KpiDefinition } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

/**
 * Inventory KPIs use the canonical inventory ledger and current stock state.
 * Procedure materials and operating consumables remain distinct; both are
 * traceable through inventory_ledger, while cost attribution remains a domain
 * concern rather than an analytics assumption.
 */

export const stockTurnoverRateKpi: KpiDefinition = {
  id: "inventory.stock_turnover_rate", nameAr: "معدل دوران المخزون", category: "inventory",
  dateBasis: "inventory_created_at", sourceTables: ["inventory_ledger", "inventory_items"], supportsDateFilter: true,
  businessDefinition: "كمية الخروج الفعلية من المخزون خلال الفترة ÷ الرصيد الحالي للمخزون. هذا مؤشر حركة إداري وليس متوسط مخزون محاسبي زمني.",
  supportsBreakdown: true,
  calculator: async (supabase, tenantId, dateRange) => {
    const { data: movements, error: err1 } = await supabase.from("inventory_ledger").select("quantity_delta, quantity_consumed, consumption_type").eq("tenant_id", tenantId).is("deleted_at", null).gte("created_at", dateRange.startAt).lt("created_at", dateRange.endAtExclusive);
    if (err1) throw err1;
    const outbound = (movements ?? []).reduce((sum, row) => {
      const delta = Number(row.quantity_delta ?? 0);
      if (delta < 0) return sum + Math.abs(delta);
      if (row.consumption_type === "doctor_request") return sum + Number(row.quantity_consumed ?? 0);
      return sum;
    }, 0);
    const { data: stock, error: err2 } = await supabase.from("inventory_items").select("current_stock").eq("tenant_id", tenantId).eq("is_active", true).is("deleted_at", null);
    if (err2) throw err2;
    const currentStock = (stock ?? []).reduce((sum, row) => sum + Number(row.current_stock ?? 0), 0);
    return currentStock === 0 ? 0 : outbound / currentStock;
  }, formatter: kpiFormatter.percentage,
};

export const inventoryConsumptionRateKpi: KpiDefinition = {
  id: "inventory.consumption_rate", nameAr: "معدل استهلاك المخزون", category: "inventory",
  dateBasis: "inventory_created_at", sourceTables: ["inventory_ledger"], supportsDateFilter: true,
  businessDefinition: "إجمالي الكمية الخارجة من المخزون خلال الفترة مقاسة كنسبة من عدد العناصر النشطة؛ هذا مؤشر حركة وليس نسبة تكلفة أو هامش.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase.from("inventory_ledger").select("quantity_delta, quantity_consumed").eq("tenant_id", tenantId).is("deleted_at", null).gte("created_at", dateRange.startAt).lt("created_at", dateRange.endAtExclusive);
    if (error) throw error;
    const outbound = (data ?? []).reduce((sum, row) => {
      const delta = Number(row.quantity_delta ?? 0);
      return sum + (delta < 0 ? Math.abs(delta) : 0);
    }, 0);
    const { count, error: err2 } = await supabase.from("inventory_items").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("is_active", true).is("deleted_at", null);
    if (err2) throw err2;
    return (count ?? 0) === 0 ? 0 : outbound / (count ?? 0);
  }, formatter: (v) => v.toLocaleString("en-US", { maximumFractionDigits: 1 }),
};

export const lowStockRiskRateKpi: KpiDefinition = {
  id: "inventory.low_stock_risk_rate", nameAr: "معدل مخاطر نقص المخزون", category: "inventory",
  dateBasis: "current_state", sourceTables: ["inventory_items"], supportsDateFilter: false,
  businessDefinition: "العناصر النشطة التي current_stock <= reorder_threshold ÷ جميع العناصر النشطة.",
  calculator: async (supabase, tenantId) => {
    const { data, error } = await supabase.from("inventory_items").select("current_stock, reorder_threshold").eq("tenant_id", tenantId).eq("is_active", true).is("deleted_at", null);
    if (error) throw error;
    const rows = data ?? [];
    if (!rows.length) return 0;
    return (rows.filter((row) => Number(row.current_stock ?? 0) <= Number(row.reorder_threshold ?? 0)).length / rows.length) * 100;
  }, formatter: kpiFormatter.percentage,
};

export const inventoryAdjustmentRateKpi: KpiDefinition = {
  id: "inventory.adjustment_rate", nameAr: "معدل تعديلات المخزون", category: "inventory",
  dateBasis: "inventory_created_at", sourceTables: ["inventory_ledger"], supportsDateFilter: true,
  businessDefinition: "عدد حركات adjustment ÷ إجمالي حركات سجل المخزون في الفترة. الحركة adjustment هي التصنيف القانوني للحركة، مع بقاء سببها التفصيلي في consumption_type.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase.from("inventory_ledger").select("id, movement_type").eq("tenant_id", tenantId).is("deleted_at", null).gte("created_at", dateRange.startAt).lt("created_at", dateRange.endAtExclusive);
    if (error) throw error;
    const rows = data ?? [];
    if (!rows.length) return 0;
    const adjustments = rows.filter((r) => r.movement_type === "adjustment").length;
    return (adjustments / rows.length) * 100;
  }, formatter: kpiFormatter.percentage,
};

export const purchaseReturnRateKpi: KpiDefinition = {
  id: "inventory.purchase_return_rate", nameAr: "معدل إرجاع المشتريات", category: "inventory",
  dateBasis: "inventory_created_at", sourceTables: ["inventory_ledger"], supportsDateFilter: true,
  businessDefinition: "كمية المشتريات المعادة ÷ كمية المشتريات المستلمة/المسجلة في الفترة. إذا لم توجد حركات purchase_return في البيانات، تكون النتيجة صفر دون اختلاق حركة.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase.from("inventory_ledger").select("consumption_type, quantity_consumed, quantity_delta").eq("tenant_id", tenantId).is("deleted_at", null).gte("created_at", dateRange.startAt).lt("created_at", dateRange.endAtExclusive).in("consumption_type", ["purchase", "purchase_return"]);
    if (error) throw error;
    const returned = (data ?? []).filter((r) => r.consumption_type === "purchase_return").reduce((s, r) => s + Math.abs(Number(r.quantity_delta ?? r.quantity_consumed ?? 0)), 0);
    const purchased = (data ?? []).filter((r) => r.consumption_type === "purchase").reduce((s, r) => s + Math.abs(Number(r.quantity_delta ?? r.quantity_consumed ?? 0)), 0);
    return purchased === 0 ? 0 : (returned / purchased) * 100;
  }, formatter: kpiFormatter.percentage,
};
