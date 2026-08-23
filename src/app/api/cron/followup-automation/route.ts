import { NextResponse } from "next/server";
import { runFollowupAutomation } from "@/core/followup/automation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await runFollowupAutomation();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("followup automation failed", error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Automation failed" }, { status: 500 });
  }
}
