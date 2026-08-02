import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { navigationRegistry } from "@/core/navigation/navigationRegistry";
import type { Permission } from "@/core/permissions/types";

// خريطة الصلاحيات للمسارات — للبحث السريع O(1)
const routePermissionMap = new Map<string, Permission | null>();
for (const item of navigationRegistry) {
  routePermissionMap.set(item.href, item.requiredPermission);
}

// المسارات العامة (لا تحتاج تسجيل دخول)
const publicRoutes = ["/login", "/register", "/"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // 1. إنشاء عميل Supabase من كوكيز الطلب
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 2. التحقق من المصادقة
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 3. المسارات العامة دائماً مسموحة
  if (publicRoutes.includes(path)) {
    return response;
  }

  // 4. غير مسجل + مسار محمي → تسجيل الدخول
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 5. حل الصلاحية المطلوبة لهذا المسار
  const requiredPermission = routePermissionMap.get(path);

  // إذا المسار غير مسجل في القائمة → اسمح (قد يكون مسار فرعي)
  if (requiredPermission === undefined) {
    return response;
  }

  // لوحة التحكم دائماً مرئية
  if (requiredPermission === null) {
    return response;
  }

  // 6. حل صلاحيات المستخدم الفعلية
  // الخطوة 6أ: احصل على clinic_user
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

  // الخطوة 6ب: احصل على معرف القالب (role template)
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

  // الخطوة 6ج: احصل على الصلاحيات
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
    // @ts-expect-error — استعلام متداخل
    const key = rp.permissions?.permission_key as string | undefined;
    if (key) userPermissions.add(key);
  }

  // الخطوة 6د: هل المستخدم يملك الصلاحية المطلوبة؟
  if (!userPermissions.has(requiredPermission)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 7. مسموح — أكمل
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
