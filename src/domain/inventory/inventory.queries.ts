"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { InventoryItem, InventoryLedgerEntry } from "./inventory.types";

const supabase = createClient();

export function useInventoryItems(tenantId: string | null) {
  return useQuery({
    queryKey: ["inventory-items", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("tenant_id", tenantId)
        .is("deleted_at", null)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as InventoryItem[];
    },
    enabled: !!tenantId,
  });
}

export function useInventoryItemById(itemId: string | null) {
  return useQuery({
    queryKey: ["inventory-item", itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("id", itemId)
        .single();
      if (error) throw error;
      return data as InventoryItem;
    },
    enabled: !!itemId,
  });
}

export function useInventoryLedger(tenantId: string | null, itemId?: string | null) {
  return useQuery({
    queryKey: ["inventory-ledger", tenantId, itemId],
    queryFn: async () => {
      let query = supabase
        .from("inventory_ledger")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (itemId) {
        query = query.eq("item_id", itemId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as InventoryLedgerEntry[];
    },
    enabled: !!tenantId,
  });
}

export function useInvalidateInventory() {
  const queryClient = useQueryClient();
  return {
    invalidateItems: (tenantId: string) => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items", tenantId] });
    },
    invalidateLedger: (tenantId: string, itemId?: string) => {
      queryClient.invalidateQueries({ queryKey: ["inventory-ledger", tenantId] });
      if (itemId) {
        queryClient.invalidateQueries({ queryKey: ["inventory-ledger", tenantId, itemId] });
      }
    },
  };
}
