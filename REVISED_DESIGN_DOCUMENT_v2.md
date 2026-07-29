CORE SYSTEM — Milestone 1A Analytics Engine

REVISED DESIGN DOCUMENT v2.0

---

1. SCOPE (REVISED — NARROWED)

Component	Scope	
KPI Engine	P0 KPIs only (Patients, Appointments, Queue, Revenue, Invoices)	
Metrics Registry	Definitions for all P0 KPIs	
Date Range Engine	"today" and "this_month" presets only	
Analytics Dashboard	Displays P0 KPIs via the Engine	
Comparison Engine	DEFERRED — no real data to compare	
Filtering Engine	DEFERRED — no meaningful data to filter	
Export Engine	DEFERRED — nothing to export yet	
Custom date ranges	DEFERRED	
analytics_daily_snapshots	EXCLUDED — live queries only	
Branch filter	REMOVED — no branches table	

Rationale: System has zero real usage data. Building comparison/filter/export before a single real KPI runs on live data is premature. These are legitimate future work, deferred until data volume justifies them.

---

2. DATA FLOW — End to End (Example: total_patients)

```
STEP 1: DASHBOARD REQUEST
AnalyticsDashboard.tsx → useKpiQuery("patients.total", tenantId, "today")

STEP 2: REACT QUERY HOOK (CLIENT)
src/domain/analytics/analytics.queries.ts
useKpiQuery(kpiId, tenantId, datePreset)
→ queryKey: ["analytics", "kpi", kpiId, tenantId, datePreset]
→ queryFn: calls server action getKpiData()

STEP 3: SERVER ACTION
src/domain/analytics/analytics.actions.ts
export async function getKpiData(kpiId, tenantId, datePreset) {
  const supabase = await createClient();
  await supabase.rpc("set_tenant_id", { tenant_id: tenantId });
  
  const kpiDef = kpiRegistry.get(kpiId);
  if (!kpiDef) throw new Error("Unknown KPI: " + kpiId);
  
  const dateRange = dateEngine.resolve(datePreset);
  const value = await kpiDef.calculator(supabase, tenantId, dateRange);
  
  return {
    id: kpiDef.id,
    name: kpiDef.nameAr,
    value: kpiDef.formatter(value),
    raw: value,
    timestamp: new Date().toISOString(),
  };
}

STEP 4: KPI CALCULATOR (SERVER — NO UI LOGIC)
src/domain/analytics/kpi/kpi.definitions/patient.kpis.ts

export const patientsTotalKpi: KpiDefinition = {
  id: "patients.total",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count, error } = await supabase
      .from("clinic_patients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .is("deleted_at", null);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: (val) => val.toLocaleString("ar-SA"),
  ...
};

STEP 5: SUPABASE QUERY (WITH RLS)
SQL: SELECT COUNT(*) FROM clinic_patients
WHERE tenant_id = '<tenantId>' AND deleted_at IS NULL;
RLS enforced via: tenant_id = get_current_tenant_id()

STEP 6: RESPONSE BACK TO UI
{
  id: "patients.total",
  name: "إجمالي المرضى",
  value: "1,234",
  raw: 1234,
  timestamp: "2026-07-29T12:00:00.000Z"
}
→ Rendered in KpiCard component (pure presentation, zero calculation)
```

---

3. EXISTING REUSABLE MODULES

3.1 Infrastructure (MUST reuse)

Module	Location	Purpose	
createClient() (server)	src/infrastructure/supabase/server.ts	Server Supabase client	
createClient() (client)	src/infrastructure/supabase/client.ts	Browser Supabase client	
set_tenant_id RPC	Database	Sets tenant context for RLS	
get_current_tenant_id()	Database	Reads tenant from JWT	

3.2 Auth (MUST reuse)

Module	Location	Purpose	
AuthContext / useAuth()	src/core/auth/AuthContext.ts	Provides user, role, tenantId	
AuthProvider	src/core/auth/AuthProvider.tsx	Auth state management	

3.3 UI Components (MUST reuse)

Component	Location	
Card, CardHeader, CardContent, CardTitle	src/shared/components/ui/card.tsx	
Badge	src/shared/components/ui/badge.tsx	
Icons	lucide-react	

3.4 Utilities (MUST reuse)

Utility	Location	Purpose	
formatCurrency()	src/shared/utils/currency.ts	Format subunits → currency	
formatDateTime()	src/shared/utils/dateTime.ts	Format timestamps	
cn()	src/shared/utils/cn.ts	Tailwind class merging	

3.5 Patterns from existing domains (MUST follow)

Pattern	Source	
Server Actions with "use server"	agenda.actions.ts, patients.actions.ts	
React Query hooks with query keys	agenda.queries.ts	
getAuthContext() helper	invoicing.actions.ts	
Tenant resolution via user.user_metadata.tenant_id	queue.queries.ts	
RPC set_tenant_id before queries	All domain actions	
Types from database.types.ts	All domains	

3.6 What is GENUINELY NEW

New Module	Reason	
analytics.types.ts	No existing analytics types	
analytics.engine.ts	Orchestrates KPI calculations — new concept	
kpi.registry.ts	KPI definitions storage — new concept	
kpi.calculator.ts	Runs KPI calculations — new concept	
kpi.formatter.ts	Formats KPI values — new concept	
date.engine.ts	Date range resolution — new concept	
date.ranges.ts	Predefined ranges — new concept	
KpiCard.tsx	Analytics-specific card	
KpiGrid.tsx	Analytics-specific grid	
DateRangePicker.tsx	Analytics-specific date picker	

---

4. RISKS AND ASSUMPTIONS

4.1 Schema Drift Risk (HIGH)
Risk: invoice_items and invoice_payments exist live but not in version control.
Mitigation: Catch-up migration written (20260729100000_capture_invoice_items_and_payments.sql). Must be committed before any analytics code references these tables.

4.2 No-Data Risk (HIGH)
Risk: All production tables have 0 rows. KPIs will return 0.
Mitigation: KPI Engine handles null/undefined gracefully; Dashboard shows "0" or "—" not errors; No mock data — zeros are correct for empty system.

4.3 No-Scheduler Risk (HIGH)
Risk: No pg_cron extension, no trigger calls refresh_daily_snapshot().
Mitigation: EXCLUDED from this milestone. All KPIs computed via live queries. analytics_daily_snapshots ignored entirely.

4.4 Mobile-Only Development Risk (MEDIUM)
Risk: Owner works from mobile only.
Mitigation: Keep file count minimal; single-file-per-module; no complex bundling; avoid dynamic imports.

4.5 Turbopack Build Risk (MEDIUM)
Risk: Previous src/features/invoicing/ build failure with Turbopack.
Mitigation: Test with next build --webpack; avoid barrel exports; use explicit imports; keep files under 200 lines.

4.6 RLS Performance Risk (LOW)
Risk: Live aggregation queries with RLS may be slow at scale.
Mitigation: Not a concern with 0 rows today. Deferred to future milestone.

4.7 Currency Mismatch Risk (LOW)
Risk: currency.ts uses SAR/100 but master_tenants.currency = JOD with currency_subunit = 1000.
Mitigation: Read currency and currency_subunit from master_tenants at runtime. Do not hardcode.

---

5. FOLDER STRUCTURE (REVISED)

```
src/
├── domain/
│   └── analytics/
│       ├── analytics.types.ts          ← NEW
│       ├── analytics.actions.ts        ← NEW
│       ├── analytics.queries.ts        ← REPLACE
│       ├── analytics.engine.ts         ← NEW
│       ├── kpi/
│       │   ├── kpi.registry.ts         ← NEW
│       │   ├── kpi.calculator.ts       ← NEW
│       │   ├── kpi.formatter.ts        ← NEW
│       │   └── kpi.definitions/
│       │       ├── patient.kpis.ts     ← NEW
│       │       ├── appointment.kpis.ts ← NEW
│       │       ├── queue.kpis.ts       ← NEW
│       │       ├── revenue.kpis.ts     ← NEW
│       │       └── invoice.kpis.ts     ← NEW
│       └── date/
│           ├── date.engine.ts          ← NEW
│           └── date.ranges.ts          ← NEW
├── features/
│   └── analytics/
│       ├── AnalyticsDashboard.tsx      ← NEW
│       ├── KpiCard.tsx                 ← NEW
│       ├── KpiGrid.tsx                 ← NEW
│       └── DateRangePicker.tsx         ← NEW
├── app/
│   └── (dashboard)/
│       └── analytics/
│           └── page.tsx                ← REPLACE
└── supabase/
    └── migrations/
        └── 20260729100000_capture_invoice_items_and_payments.sql ← NEW
```

---

6. P0 KPIs TO IMPLEMENT (27 total)

Patients (6)

ID	Name	Calculation	
patients.total	إجمالي المرضى	COUNT clinic_patients WHERE deleted_at IS NULL	
patients.new	مرضى جدد	COUNT WHERE first_visit_date IN date range	
patients.returning	مرضى عائدون	COUNT WHERE first_visit_date < range start AND EXISTS visit in range	
patients.active	مرضى نشطون	COUNT WHERE patient_status = 'active' AND deleted_at IS NULL	
patients.growth_rate	معدل النمو	(current_new - previous_new) / previous_new × 100	
patients.avg_visits	متوسط الزيارات	AVG(total_visits) FROM patient_history	

Appointments (6)

ID	Name	Calculation	
appointments.total	إجمالي المواعيد	COUNT master_agenda_events WHERE scheduled_start IN range	
appointments.completed	مكتملة	COUNT WHERE status = 'completed'	
appointments.cancelled	ملغاة	COUNT WHERE status = 'cancelled'	
appointments.no_show	لم يحضر	COUNT WHERE status = 'no_show'	
appointments.avg_waiting_time	متوسط الانتظار	AVG(waiting_time_minutes) FROM clinic_visit_sessions	
appointments.avg_duration	متوسط الكشف	AVG(session_duration_minutes) FROM clinic_visit_sessions	

Queue (4)

ID	Name	Calculation	
queue.avg_waiting_time	متوسط الانتظار	AVG(waiting_time_minutes) WHERE created_at = today	
queue.longest_wait	أطول انتظار	MAX(waiting_time_minutes) WHERE created_at = today	
queue.current	الطابور الحالي	COUNT WHERE session_status = 'waiting' AND created_at = today	
queue.served_today	تم خدمتهم اليوم	COUNT WHERE session_status = 'completed' AND created_at = today	

Revenue (7)

ID	Name	Calculation	
revenue.total	إجمالي الإيرادات	SUM(total_subunits) FROM clinic_invoices WHERE invoice_date IN range	
revenue.daily	إيرادات اليوم	SUM WHERE invoice_date = today	
revenue.monthly	إيرادات الشهر	SUM WHERE invoice_date IN this_month	
revenue.avg_invoice	متوسط الفاتورة	AVG(total_subunits)	
revenue.by_doctor	حسب الطبيب	SUM GROUP BY doctor_id (via session_id)	
revenue.by_procedure	حسب الخدمة	SUM GROUP BY procedure_id FROM invoice_items	
revenue.top_procedures	أكثر الخدمات	TOP 5 by SUM(line_total_subunits)	

Invoices (4)

ID	Name	Calculation	
invoices.paid	مدفوعة	COUNT WHERE invoice_status = 'paid'	
invoices.pending	معلقة	COUNT WHERE invoice_status IN ('issued', 'partial')	
invoices.cancelled	ملغاة	COUNT WHERE invoice_status = 'cancelled'	
invoices.collection_rate	معدل التحصيل	SUM(amount_paid_subunits) / SUM(total_subunits) × 100	

---

7. DATE RANGE ENGINE (MINIMAL)

Preset	Label AR	from	to	
today	اليوم	CURRENT_DATE	CURRENT_DATE	
this_month	هذا الشهر	DATE_TRUNC('month', CURRENT_DATE)	end of month	

Deferred: yesterday, this_week, last_week, last_month, quarter, year, custom

---

8. CONFIRMATIONS

Item	Status	
Branch filter removed from scope	Confirmed	
Comparison Engine deferred	Confirmed	
Filtering Engine deferred	Confirmed	
Export Engine deferred	Confirmed	
analytics_daily_snapshots excluded	Confirmed	
refresh_daily_snapshot() not implemented	Confirmed	
invoice_items / invoice_payments catch-up migration written	Confirmed	
Data Flow section included	Confirmed	
Existing Reusable Modules section included	Confirmed	
Risks and Assumptions section included	Confirmed	

---

9. NEXT STEP

Wait for explicit written approval from Owner before writing any implementation code.