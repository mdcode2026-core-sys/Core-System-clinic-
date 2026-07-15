"use client";

import { useAuth } from "@/core/auth/AuthContext";
import { useDailySnapshot } from "@/domain/analytics/analytics.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { formatCurrency } from "@/shared/utils/currency";
import { getTodayString } from "@/shared/utils/dateTime";
import { BarChart3, Users, Clock, TrendingUp } from "lucide-react";

export function AnalyticsOverview() {
  const { tenantId } = useAuth();
  const today = getTodayString();
  const { data: daily } = useDailySnapshot(tenantId, today);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              الزيارات اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{daily?.total_visits ?? 0}</div>
            <Badge variant="outline" className="mt-1">{daily?.total_new_patients ?? 0} جديد</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              متوسط الانتظار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{daily?.avg_wait_time_minutes ?? 0} د</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              متوسط الكشف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{daily?.avg_session_duration_minutes ?? 0} د</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(daily?.total_revenue_subunits ?? 0)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
