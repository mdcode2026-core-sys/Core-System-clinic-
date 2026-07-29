import { AnalyticsDashboard } from "@/features/analytics/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">التحليلات</h1>
      <AnalyticsDashboard />
    </div>
  );
}
