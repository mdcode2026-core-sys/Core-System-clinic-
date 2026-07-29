import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsOverview } from "@/domain/analytics/analytics.actions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const preset = (searchParams.get("preset") as "today" | "this_month") || "today";

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const data = await getAnalyticsOverview(userId, preset);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[API /analytics/overview] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
