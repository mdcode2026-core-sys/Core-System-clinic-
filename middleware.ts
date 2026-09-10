import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getRequiredPermission } from "@/core/navigation/navigationRegistry";

// المسارات العامة فقط — تسجيل الدخول وإنشاء الحساب
const publicRoutes = ["/login", "/register"];

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";

  const response = NextResponse.redirect(url);

  // A stale/invalid Supabase session must not survive the redirect.
  // Remove only Supabase auth cookies; application cookies are left untouched.
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.includes("auth-token")) {
      response.cookies.delete(cookie.name);
    }
  }

  return response;
}

function isInvalidRefreshTokenError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const candidate = error as {
    code?: unknown;
    message?: unknown;
    name?: unknown;
  };

  return (
    candidate.code === "refresh_token_not_found" ||
    (candidate.name === "AuthApiError" &&
      typeof candidate.message === "string" &&
      candidate.message.toLowerCase().includes("invalid refresh token"))
  );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  if (publicRoutes.includes(path)) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  let user: { id: string } | null = null;

  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (error) {
    // An invalid/stale refresh token is an expected expired-session condition.
    // Clear the stale auth cookie and send the user through a clean login flow.
    if (isInvalidRefreshTokenError(error)) {
      return redirectToLogin(request);
    }

    // Preserve the existing fail-closed behavior for unexpected auth failures.
    return redirectToLogin(request);
  }

  if (!user) {
    return redirectToLogin(request);
  }

  // Navigation visibility and route authorization are related, but not identical.
  // Contextual/legacy routes remain in the canonical registry so direct access is protected.
  const requiredPermission = getRequiredPermission(path);

  // Unregistered application routes remain authenticated routes. Page/server boundaries
  // continue to enforce their own domain-specific authorization where applicable.
  if (requiredPermission === undefined || requiredPermission === null) return response;

  const { data: clinicUsers, error: cuError } = await supabase
    .from("clinic_users")
    .select("role, tenant_id")
    .eq("auth_user_id", user.id)
    .limit(1);

  if (cuError || !clinicUsers || clinicUsers.length === 0) {
    return redirectToLogin(request);
  }

  const clinicUser = clinicUsers[0];

  const { data: roleTemplate, error: rtError } = await supabase
    .from("roles")
    .select("id")
    .eq("role_key", clinicUser.role)
    .maybeSingle();

  if (rtError || !roleTemplate) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  const { data: rolePerms, error: rpError } = await supabase
    .from("role_permissions")
    .select("permissions(permission_key)")
    .eq("role_id", roleTemplate.id);

  if (rpError) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  const userPermissions = new Set<string>();
  for (const rp of rolePerms ?? []) {
    // @ts-expect-error — nested Supabase relation
    const key = rp.permissions?.permission_key as string | undefined;
    if (key) userPermissions.add(key);
  }

  if (!userPermissions.has(requiredPermission)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
