import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/infrastructure/supabase/middleware";

const protectedRoutes = ["/patients", "/agenda", "/queue", "/invoices", "/analytics", "/settings"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const path = request.nextUrl.pathname;

  const isProtected = protectedRoutes.some((route) => path.startsWith(route));
  
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
