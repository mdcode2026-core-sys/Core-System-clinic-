"use client";

import { useState } from "react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useInventoryItems } from "@/domain/inventory/inventory.queries";
import { usePermissions } from "@/core/permissions/usePermissions";
import { softDeleteInventoryItem } from "@/domain/inventory/inventory.actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Package, AlertTriangle, Plus, Pencil, Trash2, Search } from "lucide-react";
import { InventoryForm } from "./inventory-form";
import type { InventoryItem } from "@/domain/inventory/inventory.types";

interface InventoryListProps { tenantId: string; }

export function InventoryList({ tenantId }: InventoryListProps) {
  const { messages } = useI18n();
  const { data: items, isLoading } = useInventoryItems(tenantId);
  const { hasPermission, isLoading: permsLoading } = usePermissions();
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filtered = items?.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) || (item.name_ar && item.name_ar.includes(search)));
  const isLowStock = (item: InventoryItem) => item.current_stock <= item.reorder_threshold && item.reorder_threshold > 0;

  const handleDelete = async (item: InventoryItem) => {
    if (!window.confirm(messages.inventory.confirmDelete)) return;
    const fd = new FormData(); fd.append("tenant_id", tenantId); fd.append("id", item.id);
    const result = await softDeleteInventoryItem(fd);
    if (result.error) window.alert(messages.common.unexpectedError);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">{messages.common.loading}</div>;

  return (
    <div className="space-y-4" dir="auto">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96"><Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={messages.inventory.search} value={search} onChange={(e) => setSearch(e.target.value)} className="pe-10 h-12 text-base" /></div>
        {!permsLoading && hasPermission("inventory:create") && <Button onClick={() => { setEditingItem(null); setIsFormOpen(true); }}><Plus className="me-2 h-4 w-4" />{messages.inventory.add}</Button>}
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b flex items-center gap-2 font-semibold text-lg"><Package className="h-5 w-5 text-primary" />{messages.inventory.items} ({filtered?.length || 0})</div>
        {(!filtered || filtered.length === 0) ? <div className="p-8 text-center text-muted-foreground">{messages.inventory.noMatches}</div> : <div className="divide-y">
          {filtered.map((item) => <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-3"><div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{item.name[0]}</div><div>
              <div className="font-medium flex items-center gap-2">{item.name}{item.name_ar && <span className="text-sm text-muted-foreground">({item.name_ar})</span>}</div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3"><span>{messages.inventory.unit}: {item.unit}</span><span>{messages.inventory.stock}: {item.current_stock}</span><span>{messages.inventory.minimum}: {item.reorder_threshold}</span></div>
              {isLowStock(item) && <Badge variant="destructive" className="mt-2 gap-1"><AlertTriangle className="h-3 w-3" />{messages.inventory.lowStock}</Badge>}
            </div></div>
            <div className="flex items-center gap-2">
              {!permsLoading && hasPermission("inventory:update") && <Button size="sm" variant="outline" onClick={() => { setEditingItem(item); setIsFormOpen(true); }} aria-label={messages.common.edit}><Pencil className="h-4 w-4" /></Button>}
              {!permsLoading && hasPermission("inventory:update") && <Button size="sm" variant="destructive" onClick={() => handleDelete(item)} aria-label={messages.common.delete}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          </div>)}
        </div>}
      </div>
      <InventoryForm open={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingItem(null); }} tenantId={tenantId} initialData={editingItem} />
    </div>
  );
}
