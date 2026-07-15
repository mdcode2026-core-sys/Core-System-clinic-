import { AnalyticsOverview } from "@/features/clinic-admin/AnalyticsOverview";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">التحليلات</h1>
      <AnalyticsOverview />
    </div>
  );
}
