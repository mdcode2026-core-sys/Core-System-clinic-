"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { receivePurchaseOrder } from "@/domain/financial-resources/financial-resources.actions";

type Order = { id: string; order_number: string | null; status: string; supplier: { id: string; name: string } | null; items: { id: string; inventory_item_id: string; quantity_ordered: number; quantity_received: number }[] };

export function ReceivingForm({ orders, locale }: { orders: Order[]; locale: "ar" | "en" }) {
  const router = useRouter();
  const openOrders = useMemo(() => orders.filter((o) => o.status !== "received" && o.items.some((i) => i.quantity_received < i.quantity_ordered)), [orders]);
  const [orderId, setOrderId] = useState(openOrders[0]?.id ?? "");
  const order = openOrders.find((o) => o.id === orderId);
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
    setMessage(locale === "ar" ? "تم الاستلام بنجاح." : "Receiving completed successfully."); setQuantities({}); router.refresh();
  }
  return <div className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>
    {message && <div className="rounded-md border p-3 text-sm">{message}</div>}
    <div><Label>{locale === "ar" ? "أمر الشراء" : "Purchase order"}</Label><select className="mt-1 w-full rounded-md border p-2" value={orderId} onChange={(e) => { setOrderId(e.target.value); setQuantities({}); }}><option value="">{locale === "ar" ? "اختر أمر شراء" : "Select purchase order"}</option>{openOrders.map((o) => <option key={o.id} value={o.id}>{o.order_number ?? o.id.slice(0, 8)} · {o.supplier?.name ?? ""} · {o.status}</option>)}</select></div>
    {order?.items.filter((i) => i.quantity_received < i.quantity_ordered).map((item) => { const remaining = item.quantity_ordered - item.quantity_received; return <div key={item.id} className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_160px]"><div><p className="font-medium">{locale === "ar" ? "عنصر مخزني" : "Inventory item"}</p><p className="text-sm text-muted-foreground">{locale === "ar" ? `المطلوب: ${item.quantity_ordered} · المستلم: ${item.quantity_received} · المتبقي: ${remaining}` : `Ordered: ${item.quantity_ordered} · Received: ${item.quantity_received} · Remaining: ${remaining}`}</p></div><div><Label>{locale === "ar" ? "الكمية المستلمة" : "Receive now"}</Label><Input className="mt-1" type="number" min="0" max={remaining} step="1" value={quantities[item.id] ?? ""} onChange={(e) => setQuantities((q) => ({ ...q, [item.id]: e.target.value }))} /></div></div>; })}
    <Button disabled={busy || !order || !Object.values(quantities).some((v) => Number(v) > 0)} onClick={submit}>{busy ? (locale === "ar" ? "جارٍ المعالجة…" : "Processing…") : (locale === "ar" ? "استلام المخزون" : "Receive stock")}</Button>
  </div>;
}
