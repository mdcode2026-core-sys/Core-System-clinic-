import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsByCategory } from "@/domain/analytics/analytics.actions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const category = searchParams.get("category") as "patients" | "appointments" | "queue" | "revenue" | "invoices";
  const preset = (searchParams.get("preset") as "today" | "this_month") || "today";

  if (!userId || !category) {
    return NextResponse.json({ error: "userId and category required" }, { status: 400 });
  }

  try {
    const data = await getAnalyticsByCategory(userId, category, preset);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[API /analytics/category] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
