import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsByCategory } from "@/domain/analytics/analytics.actions";
import type { AnalyticsCategory, DatePreset } from "@/domain/analytics/analytics.types";

const categories: AnalyticsCategory[] = ["patients", "appointments", "queue", "revenue", "invoices", "inventory", "followup", "workforce", "communications", "coordination"];
const presets: DatePreset[] = ["today", "yesterday", "this_week", "last_week", "this_month", "last_month", "this_quarter", "custom"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const rawCategory = searchParams.get("category");
  const rawPreset = searchParams.get("preset") ?? "today";
  if (!userId || !rawCategory || !categories.includes(rawCategory as AnalyticsCategory)) return NextResponse.json({ error: "userId and valid category required" }, { status: 400 });
  const preset: DatePreset = presets.includes(rawPreset as DatePreset) ? rawPreset as DatePreset : "today";
  const customFrom = searchParams.get("from") ?? undefined;
  const customTo = searchParams.get("to") ?? undefined;
  try {
    const data = await getAnalyticsByCategory(userId, rawCategory as AnalyticsCategory, preset, customFrom, customTo);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[API /analytics/category] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
