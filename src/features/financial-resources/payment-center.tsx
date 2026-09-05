"use client";

import { useState } from "react";
import { recordPayment } from "@/domain/invoicing/invoicing.actions";
import { saveOperatingExpense } from "@/domain/financial-resources/financial-workflow.actions";

type Patient={id:string;first_name:string;last_name:string};
type Invoice={id:string;invoice_number:string|null;patient_id:string;total_subunits:number;amount_due_subunits:number|null};
type Props={locale:"ar"|"en";currency:string;patients:Patient[];invoices:Invoice[];canReceipt:boolean;canDisburse:boolean};

export function PaymentCenter({locale,currency,patients,invoices,canReceipt,canDisburse}:Props){
 const ar=locale==="ar"; const [kind,setKind]=useState<"receipt"|"disbursement">("receipt"); const [busy,setBusy]=useState(false); const [msg,setMsg]=useState("");
 const names=Object.fromEntries(patients.map(p=>[p.id,`${p.first_name} ${p.last_name}`.trim()]));
 const money=(n:number)=>new Intl.NumberFormat(ar?"ar":"en",{style:"currency",currency,maximumFractionDigits:2}).format(n/100);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMsg("");const f=new FormData(e.currentTarget);const amount=Math.round(Number(f.get("amount"))*100);
  const r=kind==="receipt"
   ?await recordPayment({invoice_id:String(f.get("invoice")),amount_subunits:amount,payment_method:String(f.get("method")) as any,reference_number:String(f.get("reference")||"")||null})
   :await saveOperatingExpense({category:String(f.get("category")||"General"),description:String(f.get("description")||"")||undefined,amount_subunits:amount,expense_date:String(f.get("date")),supplier_id:undefined});
  setBusy(false);setMsg(r.success?(ar?"تم حفظ العملية المالية":"Payment saved"):(r.error??(ar?"تعذر حفظ العملية":"Could not save payment")));if(r.success)location.reload();
 }
 const I=({label,...x}:{label:string}&React.InputHTMLAttributes<HTMLInputElement>)=><label className="grid gap-1 text-sm"><span className="font-medium">{label}</span><input {...x} className="rounded-md border bg-background px-3 py-2"/></label>;
 return <div className="space-y-5" dir={ar?"rtl":"ltr"}>
  <div><h1 className="text-xl font-semibold">{ar?"قبض / دفع":"Payments"}</h1><p className="text-sm text-muted-foreground">{ar?"ابدأ بتحديد نوع العملية: قبض أموال للعيادة أو دفع أموال من العيادة.":"Choose the transaction first: money received by the clinic or money paid out by the clinic."}</p></div>
  <div className="grid gap-3 sm:grid-cols-2">{canReceipt&&<button type="button" onClick={()=>setKind("receipt")} className={`rounded-lg border p-5 text-start ${kind==="receipt"?"ring-2 ring-primary":""}`}><div className="text-lg font-semibold">{ar?"قبض":"Receipt"}</div><div className="mt-1 text-sm text-muted-foreground">{ar?"استلام مبلغ من مريض مقابل فاتورة":"Receive money against a patient invoice"}</div></button>}{canDisburse&&<button type="button" onClick={()=>setKind("disbursement")} className={`rounded-lg border p-5 text-start ${kind==="disbursement"?"ring-2 ring-primary":""}`}><div className="text-lg font-semibold">{ar?"دفع / صرف":"Disbursement"}</div><div className="mt-1 text-sm text-muted-foreground">{ar?"تسجيل مبلغ خرج من العيادة كمصروف تشغيلي":"Record money paid out as an operating expense"}</div></button>}</div>
  {kind==="receipt"&&canReceipt?<form onSubmit={submit} className="grid gap-3 rounded-lg border p-5 md:grid-cols-2"><select name="invoice" required className="rounded-md border bg-background px-3 py-2 md:col-span-2"><option value="">{ar?"اختر الفاتورة — يظهر المريض والمتبقي":"Choose invoice — patient and remaining amount are shown"}</option>{invoices.filter(i=>(i.amount_due_subunits??0)>0).map(i=><option key={i.id} value={i.id}>{i.invoice_number??"—"} · {names[i.patient_id]??"—"} · {money(i.amount_due_subunits??0)}</option>)}</select><I label={ar?"المبلغ المقبوض":"Amount received"} name="amount" type="number" min="0.01" step="0.01" required/><select name="method" className="rounded-md border bg-background px-3 py-2"><option value="cash">{ar?"نقدي":"Cash"}</option><option value="card">{ar?"بطاقة":"Card"}</option><option value="bank_transfer">{ar?"تحويل بنكي":"Bank transfer"}</option><option value="online">{ar?"دفع إلكتروني":"Electronic payment"}</option><option value="insurance">{ar?"تأمين":"Insurance"}</option></select><I label={ar?"مرجع العملية (اختياري)":"Transaction reference (optional)"} name="reference"/><button disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground md:col-span-2">{ar?"حفظ القبض":"Save receipt"}</button></form>:null}
  {kind==="disbursement"&&canDisburse?<form onSubmit={submit} className="grid gap-3 rounded-lg border p-5 md:grid-cols-2"><I label={ar?"التصنيف":"Category"} name="category" placeholder={ar?"مثال: صيانة، كهرباء، مستلزمات":"e.g. maintenance, utilities, supplies"} required/><I label={ar?"المبلغ المدفوع":"Amount paid"} name="amount" type="number" min="0.01" step="0.01" required/><I label={ar?"تاريخ الدفع":"Payment date"} name="date" type="date" defaultValue={new Date().toISOString().slice(0,10)} required/><I label={ar?"البيان / وصف العملية":"Description"} name="description"/><button disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground md:col-span-2">{ar?"حفظ الدفع / الصرف":"Save disbursement"}</button></form>:null}
  {msg&&<div className="rounded-md border p-3 text-sm">{msg}</div>}
 </div>;
}
