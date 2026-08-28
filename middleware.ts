import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getRequiredPermission } from "@/core/navigation/navigationRegistry";

// المسارات العامة فقط — تسجيل الدخول وإنشاء الحساب
const publicRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (publicRoutes.includes(path)) return response;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
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
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
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
