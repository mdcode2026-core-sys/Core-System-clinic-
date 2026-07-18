import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/infrastructure/supabase/middleware";

const protectedRoutes = ["/patients", "/agenda", "/queue", "/invoices", "/analytics", "/settings"];
const publicRoutes = ["/login", "/register", "/api"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const path = request.nextUrl.pathname;

  // إذا كان المسار عام، نسمح بالمرور دائماً
  const isPublic = publicRoutes.some((route) => path.startsWith(route));
  if (isPublic) {
    return supabaseResponse;
  }

  // إذا كان المسار محمي ولا يوجد user، نُحوّل إلى login
  const isProtected = protectedRoutes.some((route) => path.startsWith(route));
  
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // إذا كان المستخدم مسجلاً ويذهب إلى login، نُحوّل إلى /
  if (user && path === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
