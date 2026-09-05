import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import {
  createLeaveRequest,
  approveLeaveRequest,
  createStaffSchedule,
  createPayrollPeriod,
  createPayrollEntry,
  createBenefit,
  createStaffingNeed,
  createCandidate,
  promoteCandidateToEmployee,
} from "@/domain/workforce/workforce.actions";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function WorkforcePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  const canRead = permissions.includes("workforce:read" as never) || permissions.includes("workforce:manage" as never);
  if (!canRead) redirect("/");
  const locale = (await cookies()).get("core-system-locale")?.value === "ar" ? "ar" : "en";
  const ar = locale === "ar";

  const [employees, positions, leaveTypes, leaveRequests, schedules, payrollPeriods, payrollEntries, benefits, staffingNeeds, candidates] = await Promise.all([
    supabase.from("workforce_employees").select("id,first_name,last_name,status,position_id").eq("tenant_id", tenantId).eq("status", "active").order("first_name"),
    supabase.from("workforce_positions").select("id,name,name_ar").eq("tenant_id", tenantId).eq("status", "active").order("name"),
    supabase.from("workforce_leave_types").select("id,name,name_ar").eq("tenant_id", tenantId).eq("status", "active").order("name"),
    supabase.from("workforce_leave_requests").select("id,employee_id,starts_on,ends_on,days,status,reason,employee:workforce_employees(first_name,last_name),leave_type:workforce_leave_types(name,name_ar)").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(30),
    supabase.from("workforce_staff_schedules").select("id,employee_id,day_of_week,starts_at,ends_at,capacity_units,status,employee:workforce_employees(first_name,last_name)").eq("tenant_id", tenantId).eq("status", "active").order("day_of_week"),
    supabase.from("workforce_payroll_periods").select("id,period_start,period_end,status,currency").eq("tenant_id", tenantId).order("period_start", { ascending: false }).limit(12),
    supabase.from("workforce_payroll_entries").select("id,payroll_period_id,employee_id,base_salary_subunits,allowances_subunits,overtime_subunits,bonuses_subunits,commissions_subunits,deductions_subunits,net_subunits,status,employee:workforce_employees(first_name,last_name)").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(30),
    supabase.from("workforce_benefits").select("id,employee_id,benefit_name,benefit_name_ar,value_subunits,currency,status,starts_on,ends_on,employee:workforce_employees(first_name,last_name)").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(30),
    supabase.from("workforce_staffing_needs").select("id,title,quantity,status,position:workforce_positions(name,name_ar)").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(20),
    supabase.from("workforce_candidates").select("id,first_name,last_name,email,phone,stage,staffing_need_id").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(30),
  ]);

  const employeeRows = employees.data ?? [];
  const positionRows = positions.data ?? [];
  const leaveTypeRows = leaveTypes.data ?? [];
  const leaveRows = leaveRequests.data ?? [];
  const scheduleRows = schedules.data ?? [];
  const payrollPeriodRows = payrollPeriods.data ?? [];
  const payrollEntryRows = payrollEntries.data ?? [];
  const benefitRows = benefits.data ?? [];
  const needRows = staffingNeeds.data ?? [];
  const candidateRows = candidates.data ?? [];

  const empSelect = (name = "employee_id") => (
    <select name={name} required className="rounded-md border bg-background p-2">
      {employeeRows.map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
    </select>
  );

  async function submitLeave(fd: FormData) { "use server"; await createLeaveRequest({ employee_id: String(fd.get("employee_id")), leave_type_id: String(fd.get("leave_type_id")), starts_on: String(fd.get("starts_on")), ends_on: String(fd.get("ends_on")), days: Number(fd.get("days") || 0), reason: String(fd.get("reason") || "") || null }); }
  async function decideLeave(fd: FormData) { "use server"; await approveLeaveRequest({ leave_request_id: String(fd.get("leave_request_id")), decision: String(fd.get("decision")) as "approved" | "rejected" }); }
  async function submitSchedule(fd: FormData) { "use server"; await createStaffSchedule({ employee_id: String(fd.get("employee_id")), day_of_week: Number(fd.get("day_of_week")), starts_at: String(fd.get("starts_at")), ends_at: String(fd.get("ends_at")), capacity_units: Number(fd.get("capacity") || 1) }); }
  async function submitPeriod(fd: FormData) { "use server"; await createPayrollPeriod({ period_start: String(fd.get("period_start")), period_end: String(fd.get("period_end")), currency: String(fd.get("currency") || "JOD") }); }
  async function submitPayroll(fd: FormData) { "use server"; await createPayrollEntry({ payroll_period_id: String(fd.get("payroll_period_id")), employee_id: String(fd.get("employee_id")), base_salary_subunits: Math.round(Number(fd.get("base") || 0) * 100), allowances_subunits: Math.round(Number(fd.get("allowances") || 0) * 100), overtime_subunits: Math.round(Number(fd.get("overtime") || 0) * 100), bonuses_subunits: Math.round(Number(fd.get("bonuses") || 0) * 100), commissions_subunits: Math.round(Number(fd.get("commissions") || 0) * 100), deductions_subunits: Math.round(Number(fd.get("deductions") || 0) * 100) }); }
  async function submitBenefit(fd: FormData) { "use server"; await createBenefit({ employee_id: String(fd.get("employee_id")), benefit_name: String(fd.get("benefit_name")), value_subunits: Math.round(Number(fd.get("value") || 0) * 100), currency: String(fd.get("currency") || "JOD"), starts_on: String(fd.get("starts_on") || "") || null, ends_on: String(fd.get("ends_on") || "") || null }); }
  async function submitNeed(fd: FormData) { "use server"; await createStaffingNeed({ position_id: String(fd.get("position_id") || "") || null, title: String(fd.get("title")), quantity: Number(fd.get("quantity") || 1) }); }
  async function submitCandidate(fd: FormData) { "use server"; await createCandidate({ staffing_need_id: String(fd.get("staffing_need_id") || "") || null, first_name: String(fd.get("first_name")), last_name: String(fd.get("last_name")), phone: String(fd.get("phone") || "") || undefined, email: String(fd.get("email") || "") || undefined }); }
  async function hireCandidate(fd: FormData) { "use server"; await promoteCandidateToEmployee({ candidate_id: String(fd.get("candidate_id")), position_id: String(fd.get("position_id") || "") || null, hire_date: String(fd.get("hire_date") || "") || undefined }); }

  return <div className="space-y-8" dir={ar ? "rtl" : "ltr"}>
    <header>
      <h1 className="text-2xl font-bold">{ar ? "تشغيل القوى العاملة" : "Workforce Operations"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{ar ? "العمليات اليومية للفريق: الجدولة، الإجازات، الرواتب، التوظيف والمزايا." : "Daily team operations: scheduling, leave, payroll, recruitment and benefits."}</p>
    </header>

    <section className="grid gap-4 md:grid-cols-5">
      {[[ar ? "الموظفون" : "Employees", employeeRows.length], [ar ? "الجداول" : "Schedules", scheduleRows.length], [ar ? "إجازات معلقة" : "Pending leave", leaveRows.filter((r: any) => r.status === "pending").length], [ar ? "مرشحون" : "Candidates", candidateRows.filter((c: any) => c.stage !== "hired").length], [ar ? "مزايا" : "Benefits", benefitRows.length]].map(([label, value]) => <div key={String(label)} className="rounded-lg border bg-card p-4"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-1 text-2xl font-semibold">{value}</div></div>)}
    </section>

    <Section title={ar ? "جدولة الفريق والقدرة" : "Staff Scheduling & Capacity"} description={ar ? "سجل دوام الموظف الأسبوعي وقدرته التشغيلية. هذه البيانات تُستخدم مع توفر Agenda." : "Record weekly staff hours and operational capacity. These schedules work alongside Agenda availability."}>
      <form action={submitSchedule} className="grid gap-2 md:grid-cols-6">
        {empSelect()}<select name="day_of_week" className="rounded-md border bg-background p-2">{days.map((d, i) => <option key={d} value={i}>{ar ? ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"][i] : d}</option>)}</select>
        <input name="starts_at" type="time" defaultValue="09:00" required className="rounded-md border p-2"/><input name="ends_at" type="time" defaultValue="17:00" required className="rounded-md border p-2"/><input name="capacity" type="number" min="0.1" step="0.1" defaultValue="1" className="rounded-md border p-2"/><button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">{ar ? "حفظ الجدول" : "Save schedule"}</button>
      </form>
      <List rows={scheduleRows} render={(s: any) => <><span>{s.employee?.first_name} {s.employee?.last_name}</span><span className="text-sm text-muted-foreground">{days[s.day_of_week]} · {s.starts_at}–{s.ends_at} · capacity {s.capacity_units}</span></>} />
    </Section>

    <Section title={ar ? "الإجازات" : "Leave"} description={ar ? "طلب ثم اعتماد. الإجازة المعتمدة تُنشئ تلقائياً فترة عدم توفر وتمنع حجز Agenda المتعارض." : "Request then approve. Approved leave automatically creates an unavailability block and prevents conflicting Agenda bookings."}>
      <form action={submitLeave} className="grid gap-2 md:grid-cols-6">
        {empSelect()}<select name="leave_type_id" required className="rounded-md border bg-background p-2">{leaveTypeRows.map((l: any) => <option key={l.id} value={l.id}>{ar ? (l.name_ar || l.name) : l.name}</option>)}</select><input name="starts_on" type="date" required className="rounded-md border p-2"/><input name="ends_on" type="date" required className="rounded-md border p-2"/><input name="days" type="number" min="0.5" step="0.5" required placeholder={ar ? "الأيام" : "Days"} className="rounded-md border p-2"/><button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">{ar ? "طلب إجازة" : "Request leave"}</button>
      </form>
      <List rows={leaveRows} render={(r: any) => <><span>{r.employee?.first_name} {r.employee?.last_name} · {r.leave_type?.name_ar || r.leave_type?.name}</span><span className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">{r.starts_on} → {r.ends_on} · {r.status}</span>{r.status === "pending" && <form action={decideLeave} className="flex gap-1"><input type="hidden" name="leave_request_id" value={r.id}/><button name="decision" value="approved" className="rounded border px-2 py-1">{ar ? "اعتماد" : "Approve"}</button><button name="decision" value="rejected" className="rounded border px-2 py-1">{ar ? "رفض" : "Reject"}</button></form>}</span></>} />
    </Section>

    <Section title={ar ? "سجل الرواتب الأساسي والعمولات" : "Basic Payroll & Commissions"} description={ar ? "سجل تشغيلي بسيط للمكونات والعمولات، وليس محرك رواتب كامل." : "A simple operational record of pay components and commissions, not a full payroll engine."}>
      <div className="grid gap-6 lg:grid-cols-2">
        <form action={submitPeriod} className="grid gap-2 md:grid-cols-3"><input name="period_start" type="date" required className="rounded-md border p-2"/><input name="period_end" type="date" required className="rounded-md border p-2"/><input name="currency" defaultValue="JOD" className="rounded-md border p-2"/><button className="rounded-md bg-primary px-4 py-2 text-primary-foreground md:col-span-3">{ar ? "فتح فترة راتب" : "Open payroll period"}</button></form>
        <form action={submitPayroll} className="grid gap-2 md:grid-cols-2">{empSelect()}<select name="payroll_period_id" required className="rounded-md border bg-background p-2">{payrollPeriodRows.map((p: any) => <option key={p.id} value={p.id}>{p.period_start} → {p.period_end}</option>)}</select>{["base","allowances","overtime","bonuses","commissions","deductions"].map(n => <input key={n} name={n} type="number" step="0.01" min="0" placeholder={n} className="rounded-md border p-2"/>)}<button className="rounded-md bg-primary px-4 py-2 text-primary-foreground md:col-span-2">{ar ? "حفظ مسير الموظف" : "Save payroll entry"}</button></form>
      </div>
      <List rows={payrollEntryRows} render={(p: any) => <><span>{p.employee?.first_name} {p.employee?.last_name}</span><span className="text-sm text-muted-foreground">{(p.net_subunits / 100).toFixed(2)} · {p.status}</span></>} />
    </Section>

    <Section title={ar ? "المزايا" : "Benefits"} description={ar ? "سجل بسيط للمزايا المرتبطة بالموظف." : "Simple employee benefit records."}>
      <form action={submitBenefit} className="grid gap-2 md:grid-cols-6">{empSelect()}<input name="benefit_name" required placeholder={ar ? "اسم الميزة" : "Benefit"} className="rounded-md border p-2"/><input name="value" type="number" step="0.01" min="0" placeholder={ar ? "القيمة" : "Value"} className="rounded-md border p-2"/><input name="currency" defaultValue="JOD" className="rounded-md border p-2"/><input name="starts_on" type="date" className="rounded-md border p-2"/><button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">{ar ? "إضافة" : "Add"}</button></form>
      <List rows={benefitRows} render={(b: any) => <><span>{b.employee?.first_name} {b.employee?.last_name} · {ar ? (b.benefit_name_ar || b.benefit_name) : b.benefit_name}</span><span className="text-sm text-muted-foreground">{(b.value_subunits / 100).toFixed(2)} {b.currency}</span></>} />
    </Section>

    <Section title={ar ? "التوظيف" : "Recruitment"} description={ar ? "احتياج → مرشح → موظف فعلي، بدون ATS معقد." : "Need → candidate → real employee, without a complex ATS."}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div><form action={submitNeed} className="grid gap-2 md:grid-cols-3"><input name="title" required placeholder={ar ? "الاحتياج الوظيفي" : "Staffing need"} className="rounded-md border p-2"/><select name="position_id" className="rounded-md border bg-background p-2"><option value="">{ar ? "المنصب" : "Position"}</option>{positionRows.map((p: any) => <option key={p.id} value={p.id}>{ar ? (p.name_ar || p.name) : p.name}</option>)}</select><input name="quantity" type="number" min="1" defaultValue="1" className="rounded-md border p-2"/><button className="rounded-md bg-primary px-4 py-2 text-primary-foreground md:col-span-3">{ar ? "إضافة احتياج" : "Add staffing need"}</button></form><List rows={needRows} render={(n: any) => <><span>{n.title}</span><span className="text-sm text-muted-foreground">{n.quantity} · {n.status}</span></>} /></div>
        <div><form action={submitCandidate} className="grid gap-2 md:grid-cols-2"><select name="staffing_need_id" className="rounded-md border bg-background p-2 md:col-span-2"><option value="">{ar ? "الاحتياج" : "Need"}</option>{needRows.map((n: any) => <option key={n.id} value={n.id}>{n.title}</option>)}</select><input name="first_name" required placeholder={ar ? "الاسم" : "First name"} className="rounded-md border p-2"/><input name="last_name" required placeholder={ar ? "العائلة" : "Last name"} className="rounded-md border p-2"/><input name="phone" placeholder={ar ? "الهاتف" : "Phone"} className="rounded-md border p-2"/><input name="email" type="email" placeholder={ar ? "البريد" : "Email"} className="rounded-md border p-2"/><button className="rounded-md bg-primary px-4 py-2 text-primary-foreground md:col-span-2">{ar ? "إضافة مرشح" : "Add candidate"}</button></form><List rows={candidateRows} render={(c: any) => <><span>{c.first_name} {c.last_name}</span><span className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">{c.stage}</span>{c.stage !== "hired" && <form action={hireCandidate} className="flex gap-1"><input type="hidden" name="candidate_id" value={c.id}/><select name="position_id" className="rounded border bg-background p-1">{positionRows.map((p: any) => <option key={p.id} value={p.id}>{ar ? (p.name_ar || p.name) : p.name}</option>)}</select><input name="hire_date" type="date" className="rounded border p-1"/><button className="rounded border px-2 py-1">{ar ? "توظيف" : "Hire"}</button></form>}</span></>} /></div>
      </div>
    </Section>
  </div>;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) { return <section className="rounded-lg border bg-card p-5"><h2 className="text-lg font-semibold">{title}</h2>{description && <p className="mb-4 mt-1 text-sm text-muted-foreground">{description}</p>}<div className={description ? "" : "mt-4"}>{children}</div></section>; }
function List({ rows, render }: { rows: any[]; render: (row: any) => React.ReactNode }) { return <div className="mt-5 divide-y">{rows.map(row => <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">{render(row)}</div>)}{rows.length === 0 && <p className="py-3 text-sm text-muted-foreground">No records yet.</p>}</div>; }
