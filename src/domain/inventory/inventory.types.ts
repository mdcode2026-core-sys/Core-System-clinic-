export interface InventoryItem {
  id: string;
  tenant_id: string;
  name: string;
  name_ar?: string;
  unit: string;
  reorder_threshold: number;
  current_stock: number;
  is_active: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItemInsert {
  tenant_id: string;
  name: string;
  name_ar?: string;
  unit?: string;
  reorder_threshold?: number;
  current_stock?: number;
  is_active?: boolean;
}

export interface InventoryItemUpdate {
  name?: string;
  name_ar?: string;
  unit?: string;
  reorder_threshold?: number;
  current_stock?: number;
  is_active?: boolean;
}

export interface InventoryLedgerEntry {
  id: string;
  tenant_id: string;
  item_id?: string;
  procedure_id?: string;
  material_name: string;
  quantity_consumed: number;
  consumption_type: "standard_clinical" | "operational_waste" | "stock_adjustment" | "stock_in";
  logged_by?: string;
  session_id?: string;
  notes?: string;
  created_at: string;
}

export interface StockAdjustmentInput {
  item_id: string;
  tenant_id: string;
  quantity_delta: number;
  reason: string;
  consumption_type: "stock_adjustment" | "stock_in";
}
