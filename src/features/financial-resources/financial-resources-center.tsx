"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { createFinancialPlan, createInsuranceProfile, createPurchaseOrder, createSupplier } from "@/domain/financial-resources/financial-resources.actions";
import { getFinancialResourcesMessages } from "@/core/i18n/financialResourcesMessages";
import type { Permission } from "@/core/permissions/types";

export type PatientSummary = { id: string; first_name: string; last_name: string; phone_primary: string };
export type SupplierSummary = { id: string; name: string; phone: string | null; email: string | null };
export type PurchaseOrderSummary = { id: string; order_number: string | null; order_date: string; status: string; total_subunits: number; supplier: { id: string; name: string } | null };
export type InventoryItemSummary = { id: string; name: string; current_stock: number; unit: string };
export type FinancialPlanSummary = { id: string; patient_id: string; total_amount_subunits: number; patient_responsibility_subunits: number; insurance_covered_subunits: number; status: string; installments: { id: string; installment_no: number; due_date: string; amount_subunits: number; amount_paid_subunits: number; status: string }[] };
export type InsuranceSummary = { id: string; patient_id: string; payer_name: string; policy_number: string | null; member_number: string | null; claim_ready: boolean; status: string; reconciliation_status: string };

interface Props {
  locale: "ar" | "en";
  patients: PatientSummary[];
  plans: FinancialPlanSummary[];
  insurance: InsuranceSummary[];
  suppliers: SupplierSummary[];
  purchaseOrders: PurchaseOrderSummary[];
  inventoryItems: InventoryItemSummary[];
  permissions: Permission[];
  currency: string;
}

export function FinancialResourcesCenter({ locale, patients, plans, insurance, suppliers, purchaseOrders, inventoryItems, permissions, currency }: Props) {
  const t = getFinancialResourcesMessages(locale);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [total, setTotal] = useState("");
  const [insuranceCovered, setInsuranceCovered] = useState("0");
  const [installmentCount, setInstallmentCount] = useState("1");
  const [payerName, setPayerName] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [memberNumber, setMemberNumber] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [inventoryItemId, setInventoryItemId] = useState(inventoryItems[0]?.id ?? "");
  const [purchaseQuantity, setPurchaseQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("");

  const patientName = useMemo(() => Object.fromEntries(patients.map((p) => [p.id, `${p.first_name} ${p.last_name}`.trim()])), [patients]);
  const canPlan = permissions.includes("invoices:update");
  const canInsurance = permissions.includes("insurance:manage");
  const canPurchasing = permissions.includes("purchasing:manage");

  function money(subunits: number) { return new Intl.NumberFormat(locale === "ar" ? "ar" : "en", { style: "currency", currency, maximumFractionDigits: 2 }).format(subunits / 100); }

  async function submitPlan(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage(null);
    const totalSubunits = Math.round(Number(total) * 100); const insuranceSubunits = Math.round(Number(insuranceCovered) * 100); const count = Math.max(1, Number.parseInt(installmentCount, 10) || 1); const responsibility = totalSubunits - insuranceSubunits;
    const today = new Date(); const per = Math.floor(responsibility / count); const remainder = responsibility - per * count;
    const installments = Array.from({ length: count }, (_, index) => { const date = new Date(today); date.setMonth(date.getMonth() + index); return { installment_no: index + 1, due_date: date.toISOString().slice(0, 10), amount_subunits: per + (index === count - 1 ? remainder : 0) }; });
    const result = await createFinancialPlan({ patient_id: patientId, total_amount_subunits: totalSubunits, insurance_covered_subunits: insuranceSubunits, patient_responsibility_subunits: responsibility, currency, installments });
    setBusy(false); setMessage(result.success ? t.success : result.error); if (result.success) { setTotal(""); setInsuranceCovered("0"); window.location.reload(); }
  }

  async function submitInsurance(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage(null);
    const result = await createInsuranceProfile({ patient_id: patientId, payer_name: payerName, policy_number: policyNumber || null, member_number: memberNumber || null, claim_ready: false });
    setBusy(false); setMessage(result.success ? t.success : result.error); if (result.success) { setPayerName(""); setPolicyNumber(""); setMemberNumber(""); window.location.reload(); }
  }

  async function submitSupplier(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage(null);
    const result = await createSupplier({ name: supplierName, phone: supplierPhone || null, email: supplierEmail || null });
    setBusy(false); setMessage(result.success ? t.success : result.error); if (result.success) { setSupplierName(""); setSupplierPhone(""); setSupplierEmail(""); window.location.reload(); }
  }

  async function submitPurchaseOrder(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage(null);
    const result = await createPurchaseOrder({ supplier_id: supplierId, items: [{ inventory_item_id: inventoryItemId, quantity_ordered: Number.parseInt(purchaseQuantity, 10) || 1, unit_cost_subunits: Math.round(Number(unitCost) * 100) }] });
    setBusy(false); setMessage(result.success ? t.success : result.error); if (result.success) window.location.reload();
  }

  return <div className="space-y-6" dir={locale === "ar" ? "rtl" : "ltr"}>
    {message && <div className="rounded-md border bg-white p-3 text-sm">{message}</div>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card><CardHeader><CardTitle>{t.financialPlans}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{plans.length}</div><p className="text-sm text-muted-foreground">{t.installments}: {plans.reduce((n, p) => n + p.installments.length, 0)}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>{t.insurance}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{insurance.length}</div><p className="text-sm text-muted-foreground">{insurance.filter((x) => x.claim_ready).length} {t.claimReady}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>{t.suppliers}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{suppliers.length}</div></CardContent></Card>
      <Card><CardHeader><CardTitle>{t.purchasing}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{purchaseOrders.length}</div></CardContent></Card>
    </div>

    {canPlan && <Card><CardHeader><CardTitle>{t.newPlan}</CardTitle></CardHeader><CardContent><form onSubmit={submitPlan} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <div><Label>{t.patient}</Label><select className="mt-1 w-full rounded-md border p-2" value={patientId} onChange={(e) => setPatientId(e.target.value)} required>{patients.map((p) => <option key={p.id} value={p.id}>{patientName[p.id] || t.choosePatient}</option>)}</select></div>
      <div><Label>{t.total}</Label><Input className="mt-1" type="number" min="0" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} required /></div>
      <div><Label>{t.insuranceCovered}</Label><Input className="mt-1" type="number" min="0" step="0.01" max={total || undefined} value={insuranceCovered} onChange={(e) => setInsuranceCovered(e.target.value)} /></div>
      <div><Label>{t.installmentsCount}</Label><Input className="mt-1" type="number" min="1" max="24" value={installmentCount} onChange={(e) => setInstallmentCount(e.target.value)} /></div>
      <div className="flex items-end"><Button className="w-full" disabled={busy || !patientId}>{busy ? t.loading : t.create}</Button></div>
    </form></CardContent></Card>}

    <div className="grid gap-6 xl:grid-cols-2">
      <Card><CardHeader><CardTitle>{t.financialPlans}</CardTitle></CardHeader><CardContent className="space-y-3">{plans.length === 0 ? <p className="text-sm text-muted-foreground">{t.noPlans}</p> : plans.slice(0, 10).map((p) => <div key={p.id} className="rounded-lg border p-3"><div className="flex items-center justify-between gap-3"><div><p className="font-medium">{patientName[p.patient_id] || t.patient}</p><p className="text-sm text-muted-foreground">{money(p.total_amount_subunits)} · {money(p.patient_responsibility_subunits)} {t.patientResponsibility}</p></div><Badge>{p.status}</Badge></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{p.installments.map((i) => <div key={i.id} className="rounded-md bg-muted/40 p-2 text-sm"><div className="flex justify-between"><span>{t.installments} #{i.installment_no}</span><span>{money(i.amount_subunits)}</span></div><div className="text-muted-foreground">{i.due_date} · {i.status} · {money(i.amount_paid_subunits)}</div></div>)}</div>{patientName[p.patient_id] && <Link className="mt-3 inline-block text-sm underline" href={`/patients/${p.patient_id}`}>{t.openPatient}</Link>}</div>)}</CardContent></Card>

      <Card><CardHeader><CardTitle>{t.insurance}</CardTitle></CardHeader><CardContent className="space-y-4">{canInsurance && patients.length > 0 && <form onSubmit={submitInsurance} className="grid gap-3 md:grid-cols-2"><select className="rounded-md border p-2" value={patientId} onChange={(e) => setPatientId(e.target.value)}><option value="">{t.choosePatient}</option>{patients.map((p) => <option key={p.id} value={p.id}>{patientName[p.id] || t.choosePatient}</option>)}</select><Input placeholder={t.payerName} value={payerName} onChange={(e) => setPayerName(e.target.value)} required /><Input placeholder={t.policyNumber} value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} /><Input placeholder={t.memberNumber} value={memberNumber} onChange={(e) => setMemberNumber(e.target.value)} /><Button disabled={busy || !patientId}>{busy ? t.loading : t.create}</Button></form>}{insurance.length === 0 ? <p className="text-sm text-muted-foreground">{t.noInsurance}</p> : insurance.slice(0, 10).map((x) => <div key={x.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{patientName[x.patient_id] || t.patient}</p><p className="text-sm text-muted-foreground">{x.payer_name}{x.policy_number ? ` · ${x.policy_number}` : ""}</p></div><Badge>{x.claim_ready ? t.claimReady : x.reconciliation_status}</Badge></div>)}</CardContent></Card>
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <Card><CardHeader><CardTitle>{t.suppliers}</CardTitle></CardHeader><CardContent className="space-y-4">{canPurchasing && <form onSubmit={submitSupplier} className="grid gap-3 md:grid-cols-2"><Input placeholder={t.supplierName} value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required /><Input placeholder={t.phone} value={supplierPhone} onChange={(e) => setSupplierPhone(e.target.value)} /><Input placeholder={t.email} value={supplierEmail} onChange={(e) => setSupplierEmail(e.target.value)} type="email" /><Button disabled={busy}>{busy ? t.loading : t.create}</Button></form>}{suppliers.length === 0 ? <p className="text-sm text-muted-foreground">{t.noSuppliers}</p> : suppliers.slice(0, 10).map((s) => <div key={s.id} className="rounded-lg border p-3"><p className="font-medium">{s.name}</p><p className="text-sm text-muted-foreground">{s.phone ?? ""}{s.email ? ` · ${s.email}` : ""}</p></div>)}</CardContent></Card>

      <Card><CardHeader><CardTitle>{t.purchasing}</CardTitle></CardHeader><CardContent className="space-y-4">{canPurchasing && suppliers.length > 0 && inventoryItems.length > 0 && <form onSubmit={submitPurchaseOrder} className="grid gap-3 md:grid-cols-2"><select className="rounded-md border p-2" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select><select className="rounded-md border p-2" value={inventoryItemId} onChange={(e) => setInventoryItemId(e.target.value)}>{inventoryItems.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.current_stock} {i.unit})</option>)}</select><Input type="number" min="1" step="1" value={purchaseQuantity} onChange={(e) => setPurchaseQuantity(e.target.value)} placeholder={t.quantity} /><Input type="number" min="0" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder={t.unitCost} required /><Button disabled={busy}>{busy ? t.loading : t.create}</Button></form>}{purchaseOrders.length === 0 ? <p className="text-sm text-muted-foreground">{t.noOrders}</p> : purchaseOrders.slice(0, 10).map((o) => <div key={o.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{o.order_number ?? t.purchasing} {o.supplier?.name ? `· ${o.supplier.name}` : ""}</p><p className="text-sm text-muted-foreground">{o.order_date} · {money(o.total_subunits)}</p></div><Badge>{o.status}</Badge></div>)}</CardContent></Card>
    </div>

    <div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href="/invoices">{t.viewInvoices}</Link></Button><Button asChild variant="outline"><Link href="/inventory">{t.viewInventory}</Link></Button></div>
  </div>;
}
