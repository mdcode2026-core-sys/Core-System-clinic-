"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { receivePurchaseOrder } from "@/domain/financial-resources/financial-resources.actions";

type Order = { id: string; order_number: string | null; status: string; supplier: { id: string; name: string } | null; items: { id: string; inventory_item_id: string; quantity_ordered: number; quantity_received: number }[] };

export default function ReceivingPage({ initialOrders }: { initialOrders?: Order[] }) {
  const router = useRouter();
  const orders = initialOrders ?? [];
  const [orderId, setOrderId] = useState(orders.find((o) => o.status !== "received")?.id ?? "");
  const order = useMemo(() => orders.find((o) => o.id === orderId), [orders, orderId]);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function submit() {
    if (!order) return;
    const items = order.items.map((i) => ({ purchase_order_item_id: i.id, quantity: Number.parseInt(quantities[i.id] ?? "0", 10) || 0 })).filter((i) => i.quantity > 0);
    setBusy(true); setMessage(null);
    const result = await receivePurchaseOrder(order.id, items);
    setBusy(false);
    if (!result.success) { setMessage(result.error); return; }
    setMessage("Receiving completed successfully."); setQuantities({}); router.refresh();
  }
  return <div className="space-y-6 p-6" dir="ltr">
    <div><h1 className="text-2xl font-bold">Receiving</h1><p className="mt-1 text-sm text-muted-foreground">Receive purchased stock through the canonical inventory ledger.</p></div>
    {message && <div className="rounded-md border p-3 text-sm">{message}</div>}
    <div className="space-y-4 rounded-lg border p-4">
      <div><Label>Purchase order</Label><select className="mt-1 w-full rounded-md border p-2" value={orderId} onChange={(e) => { setOrderId(e.target.value); setQuantities({}); }}>{orders.filter((o) => o.status !== "received").map((o) => <option key={o.id} value={o.id}>{o.order_number ?? o.id.slice(0, 8)} · {o.supplier?.name ?? ""} · {o.status}</option>)}</select></div>
      {order?.items.map((item) => { const remaining = item.quantity_ordered - item.quantity_received; return <div key={item.id} className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_160px]"><div><p className="font-medium">Inventory item</p><p className="text-sm text-muted-foreground">Ordered: {item.quantity_ordered} · Received: {item.quantity_received} · Remaining: {remaining}</p></div><div><Label>Receive now</Label><Input className="mt-1" type="number" min="0" max={remaining} step="1" value={quantities[item.id] ?? ""} onChange={(e) => setQuantities((q) => ({ ...q, [item.id]: e.target.value }))} /></div></div>; })}
      <Button disabled={busy || !order || !Object.values(quantities).some((v) => Number(v) > 0)} onClick={submit}>{busy ? "Processing…" : "Receive stock"}</Button>
    </div>
  </div>;
}
