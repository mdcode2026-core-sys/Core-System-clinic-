"use client";

import { useState, useTransition, useEffect } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useClinicProfile } from "@/domain/settings/settings.queries";
import { updateClinicProfile } from "@/domain/settings/settings.actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Save, Loader2, Building2, Palette, Phone, MapPin, Globe, Landmark } from "lucide-react";

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Riyadh", label: "الرياض (AST+3)" },
  { value: "Asia/Dubai", label: "دبي (AST+4)" },
  { value: "Asia/Kuwait", label: "الكويت (AST+3)" },
  { value: "Asia/Qatar", label: "قطر (AST+3)" },
  { value: "Asia/Bahrain", label: "البحرين (AST+3)" },
  { value: "Asia/Muscat", label: "مسقط (AST+4)" },
  { value: "Asia/Amman", label: "عمان (EET+2/+3)" },
  { value: "Asia/Beirut", label: "بيروت (EET+2/+3)" },
  { value: "Africa/Cairo", label: "القاهرة (EET+2)" },
  { value: "Europe/Istanbul", label: "إسطنبول (TRT+3)" },
];

const CURRENCY_OPTIONS = [
  { value: "SAR", label: "ريال سعودي (SAR)" },
  { value: "AED", label: "درهم إماراتي (AED)" },
  { value: "KWD", label: "دينار كويتي (KWD)" },
  { value: "QAR", label: "ريال قطري (QAR)" },
  { value: "BHD", label: "دينار بحريني (BHD)" },
  { value: "OMR", label: "ريال عماني (OMR)" },
  { value: "JOD", label: "دينار أردني (JOD)" },
  { value: "USD", label: "دولار أمريكي (USD)" },
  { value: "EUR", label: "يورو (EUR)" },
  { value: "GBP", label: "جنيه إسترليني (GBP)" },
  { value: "EGP", label: "جنيه مصري (EGP)" },
];

export function ClinicProfileForm() {
  const { tenantId } = useAuth();
  const { hasPermission, isLoading: permsLoading } = usePermissions();
  const canUpdate = hasPermission("settings:update");

  const { data: profile, isLoading, error: queryError } = useClinicProfile(tenantId);

  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tenant = profile?.tenant;
  const defaultBranch = profile?.defaultBranch;

  const [formData, setFormData] = useState({
    clinic_name: tenant?.clinic_name ?? "",
    clinic_name_ar: tenant?.clinic_name_ar ?? "",
    primary_phone: tenant?.primary_phone ?? "",
    whatsapp_number: tenant?.whatsapp_number ?? "",
    address: tenant?.address ?? "",
    timezone: tenant?.timezone ?? "",
    currency: tenant?.currency ?? "",
    logo_url: tenant?.logo_url ?? "",
    primary_color: tenant?.primary_color ?? "",
    country_code: tenant?.country_code ?? "",
  });

  // Sync form when tenant data loads
  useEffect(() => {
    if (tenant) {
      setFormData({
        clinic_name: tenant.clinic_name ?? "",
        clinic_name_ar: tenant.clinic_name_ar ?? "",
        primary_phone: tenant.primary_phone ?? "",
        whatsapp_number: tenant.whatsapp_number ?? "",
        address: tenant.address ?? "",
        timezone: tenant.timezone ?? "",
        currency: tenant.currency ?? "",
        logo_url: tenant.logo_url ?? "",
        primary_color: tenant.primary_color ?? "",
        country_code: tenant.country_code ?? "",
      });
    }
  }, [tenant]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setServerSuccess(false);
    setServerError(null);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!formData.clinic_name.trim() || formData.clinic_name.trim().length < 2) {
      next.clinic_name = "اسم العيادة مطلوب (2 أحرف على الأقل)";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(false);

    if (!validate()) return;
    if (!canUpdate) {
      setServerError("ليس لديك صلاحية تعديل ملف العيادة");
      return;
    }

    const fd = new FormData();
    fd.append("clinic_name", formData.clinic_name);
    fd.append("clinic_name_ar", formData.clinic_name_ar);
    fd.append("primary_phone", formData.primary_phone);
    fd.append("whatsapp_number", formData.whatsapp_number);
    fd.append("address", formData.address);
    fd.append("timezone", formData.timezone);
    fd.append("currency", formData.currency);
    fd.append("logo_url", formData.logo_url);
    fd.append("primary_color", formData.primary_color);
    fd.append("country_code", formData.country_code);

    startTransition(async () => {
      try {
        const result = await updateClinicProfile(fd);
        if (result.success) {
          setServerSuccess(true);
        } else {
          setServerError(result.error ?? "حدث خطأ غير متوقع");
        }
      } catch (err) {
        setServerError("حدث خطأ غير متوقع");
      }
    });
  };

  if (isLoading || permsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="ml-3 h-6 w-6 animate-spin text-primary" />
        <span className="text-muted-foreground">جاري تحميل بيانات العيادة...</span>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-center text-destructive">
        <p className="font-medium">خطأ في تحميل البيانات</p>
        <p className="text-sm">{queryError.message}</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="rounded-md border border-muted bg-muted/30 p-8 text-center text-muted-foreground">
        <Building2 className="mx-auto mb-3 h-10 w-10 opacity-50" />
        <p>لا توجد بيانات عيادة متاحة</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success / Error banners */}
      {serverSuccess && (
        <div className="rounded-md bg-green-50 p-4 text-green-800 border border-green-200">
          ✓ تم حفظ التغييرات بنجاح
        </div>
      )}
      {serverError && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p className="font-medium">خطأ في الحفظ</p>
          <p className="text-sm">{serverError}</p>
        </div>
      )}

      {/* ── Clinic Identity ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            هوية العيادة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clinic_name">
                اسم العيادة (إنجليزي) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="clinic_name"
                value={formData.clinic_name}
                onChange={(e) => handleChange("clinic_name", e.target.value)}
                disabled={!canUpdate}
                placeholder="Zada Dental Clinic"
                className={errors.clinic_name ? "border-destructive" : ""}
                dir="ltr"
              />
              {errors.clinic_name && (
                <p className="text-xs text-destructive">{errors.clinic_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic_name_ar">اسم العيادة (عربي)</Label>
              <Input
                id="clinic_name_ar"
                value={formData.clinic_name_ar}
                onChange={(e) => handleChange("clinic_name_ar", e.target.value)}
                disabled={!canUpdate}
                placeholder="عيادة زادا لطب الأسنان"
                dir="rtl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Branding ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            الهوية البصرية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logo_url">رابط الشعار</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => handleChange("logo_url", e.target.value)}
                disabled={!canUpdate}
                placeholder="https://..."
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                أدخل رابط URL للشعار. يجب أن يكون الرابط صالحاً.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary_color">اللون الرئيسي</Label>
              <div className="flex items-center gap-3">
                <input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color || "#3b82f6"}
                  onChange={(e) => handleChange("primary_color", e.target.value)}
                  disabled={!canUpdate}
                  className="h-10 w-16 cursor-pointer rounded border border-input disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => handleChange("primary_color", e.target.value)}
                  disabled={!canUpdate}
                  placeholder="#3b82f6"
                  className="flex-1"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Contact ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4" />
            معلومات التواصل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary_phone">الهاتف الرئيسي</Label>
              <Input
                id="primary_phone"
                type="tel"
                value={formData.primary_phone}
                onChange={(e) => handleChange("primary_phone", e.target.value)}
                disabled={!canUpdate}
                placeholder="+966 5X XXX XXXX"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">رقم واتساب</Label>
              <Input
                id="whatsapp_number"
                type="tel"
                value={formData.whatsapp_number}
                onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                disabled={!canUpdate}
                placeholder="+966 5X XXX XXXX"
                dir="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Address ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            العنوان
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              disabled={!canUpdate}
              placeholder="المدينة، الحي، الشارع..."
              rows={3}
              dir="rtl"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country_code">رمز الدولة</Label>
              <Input
                id="country_code"
                value={formData.country_code}
                onChange={(e) => handleChange("country_code", e.target.value)}
                disabled={!canUpdate}
                placeholder="SA"
                maxLength={2}
                dir="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Regional & Financial ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            الإعدادات الإقليمية والمالية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timezone">المنطقة الزمنية</Label>
              <Select
                value={formData.timezone || undefined}
                onValueChange={(v) => handleChange("timezone", v)}
                disabled={!canUpdate}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="اختر المنطقة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">العملة</Label>
              <Select
                value={formData.currency || undefined}
                onValueChange={(v) => handleChange("currency", v)}
                disabled={!canUpdate}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="اختر العملة" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Default Branch (Read-only) ── */}
      {defaultBranch && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Landmark className="h-4 w-4" />
              الفرع الافتراضي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-xs text-muted-foreground">اسم الفرع</span>
                <p className="font-medium">{defaultBranch.branch_name}</p>
              </div>
              {defaultBranch.branch_name_ar && (
                <div>
                  <span className="text-xs text-muted-foreground">الاسم بالعربي</span>
                  <p className="font-medium">{defaultBranch.branch_name_ar}</p>
                </div>
              )}
              {defaultBranch.phone && (
                <div>
                  <span className="text-xs text-muted-foreground">الهاتف</span>
                  <p className="font-medium" dir="ltr">{defaultBranch.phone}</p>
                </div>
              )}
              {defaultBranch.address && (
                <div>
                  <span className="text-xs text-muted-foreground">العنوان</span>
                  <p className="font-medium">{defaultBranch.address}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Save Action ── */}
      {canUpdate ? (
        <div className="flex items-center justify-end gap-4 pt-2">
          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          <p className="text-sm">
            ليس لديك صلاحية تعديل ملف العيادة. اتصل بمسؤول النظام.
          </p>
        </div>
      )}
    </form>
  );
}
