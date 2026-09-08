import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsOverview } from "@/domain/analytics/analytics.actions";
import type { DatePreset } from "@/domain/analytics/analytics.types";

const presets: DatePreset[] = ["today", "yesterday", "this_week", "last_week", "this_month", "last_month", "this_quarter", "last_quarter", "this_year", "last_year", "custom"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const rawPreset = searchParams.get("preset") ?? "today";
  const preset: DatePreset = presets.includes(rawPreset as DatePreset) ? rawPreset as DatePreset : "today";
  const customFrom = searchParams.get("from") ?? undefined;
  const customTo = searchParams.get("to") ?? undefined;
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  try {
    const data = await getAnalyticsOverview(userId, preset, customFrom, customTo);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[API /analytics/overview] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
