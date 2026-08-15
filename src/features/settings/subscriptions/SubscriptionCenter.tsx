"use client";

import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useSubscriptionInfo, applyActivationCode, TEMPORARY_CONTACT } from "@/domain/subscriptions";
import type { SubscriptionStatus } from "@/domain/subscriptions/subscriptions.types";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Loader2, CheckCircle, AlertCircle, CreditCard, Calendar, Clock, Users, Building2, HardDrive, KeyRound, ExternalLink, Phone, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<SubscriptionStatus, { labelAr: string; labelEn: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  trial: { labelAr: "فترة تجريبية", labelEn: "Trial", variant: "secondary" },
  active: { labelAr: "نشط", labelEn: "Active", variant: "default" },
  expired: { labelAr: "منتهي", labelEn: "Expired", variant: "destructive" },
  suspended: { labelAr: "معلق", labelEn: "Suspended", variant: "destructive" },
};

export function SubscriptionCenter() {
  const { hasPermission } = usePermissions();
  const canRead = hasPermission("subscription:read");

  const { tenantId, isLoading: tenantLoading } = useTenantId();
  const {
    data: subscription,
    isLoading: subLoading,
    error: subError,
  } = useSubscriptionInfo(tenantId);

  const [code, setCode] = useState("");
  const [codeState, setCodeState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [codeMessage, setCodeMessage] = useState<string | null>(null);

  const isLoading = tenantLoading || subLoading;

  if (!canRead) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">غير مصرح</h3>
        <p className="text-muted-foreground">ليس لديك صلاحية الوصول إلى معلومات الاشتراك.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="mr-3 text-muted-foreground">جاري تحميل معلومات الاشتراك...</span>
      </div>
    );
  }

  if (subError || !subscription) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">فشل التحميل</h3>
        <p className="text-muted-foreground">تعذر تحميل معلومات الاشتراك. يرجى المحاولة لاحقاً.</p>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[subscription.subscriptionStatus];

  const handleApplyCode = async () => {
    if (!code.trim()) return;
    setCodeState("loading");
    setCodeMessage(null);

    const result = await applyActivationCode(code.trim());

    if (result.success) {
      setCodeState("success");
      setCodeMessage("تم تفعيل الاشتراك بنجاح");
      toast.success("تم تفعيل الاشتراك");
    } else {
      setCodeState("error");
      setCodeMessage(result.error ?? "فشل التفعيل");
      toast.error(result.error ?? "فشل التفعيل");
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">مركز الاشتراك</h2>
          <p className="text-sm text-muted-foreground">إدارة اشتراك العيادة والتفعيل</p>
        </div>
        <Badge variant={statusConfig.variant}>
          {statusConfig.labelAr}
        </Badge>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            معلومات الاشتراك الحالي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="العيادة" value={subscription.clinicNameAr ?? subscription.clinicName} />
            <InfoRow label="معرف العيادة (Tenant ID)" value={subscription.tenantId} isMono />
            <InfoRow label="الخطة" value={subscription.planNameAr ?? subscription.planName ?? subscription.subscriptionTier} />
            <InfoRow label="مفتاح الترخيص" value={subscription.licenseKey ?? "—"} isMono />
            {subscription.subscriptionStart && (
              <InfoRow label="تاريخ البدء" value={formatDate(subscription.subscriptionStart)} icon={<Calendar className="h-4 w-4" />} />
            )}
            {subscription.subscriptionEnd && (
              <InfoRow label="تاريخ الانتهاء" value={formatDate(subscription.subscriptionEnd)} icon={<Calendar className="h-4 w-4" />} />
            )}
            {subscription.daysRemaining !== null && (
              <InfoRow 
                label="المدة المتبقية" 
                value={`${subscription.daysRemaining} يوم`} 
                icon={<Clock className="h-4 w-4" />}
                highlight={subscription.daysRemaining <= 7}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">حدود الخطة</CardTitle>
          <CardDescription>الموارد الم includedة في اشتراكك الحالي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <LimitBadge
              icon={<Users className="h-4 w-4" />}
              label="المستخدمين"
              value={subscription.maxUsers}
            />
            <LimitBadge
              icon={<Building2 className="h-4 w-4" />}
              label="الفروع"
              value={subscription.maxBranches}
            />
            <LimitBadge
              icon={<HardDrive className="h-4 w-4" />}
              label="التخزين (GB)"
              value={subscription.storageGb}
            />
            <LimitBadge
              icon={<CreditCard className="h-4 w-4" />}
              label="الأجهزة"
              value={subscription.maxDevices}
            />
          </div>
        </CardContent>
      </Card>

      {/* Usage / Storage — Future Ready */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">الاستخدام والتخزين</CardTitle>
          <CardDescription>معلومات الاستخدام الحالي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 text-muted-foreground">
            <HardDrive className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">نظام metering غير متوفر حالياً</p>
              <p className="text-xs">سيتم إضافة تفاصيل الاستخدام الفعلي عند توفر البنية التحتية (Milestone 5).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits — Future Ready */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">المميزات المفعلة</CardTitle>
          <CardDescription>القدرات المتاحة في اشتراكك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 text-muted-foreground">
            <CheckCircle className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">mapping الخطط للمميزات غير متوفر حالياً</p>
              <p className="text-xs">سيتم إضافة قائمة المميزات عند توفر License Engine (Milestone 5).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activation Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            تفعيل بالرمز
          </CardTitle>
          <CardDescription>
            أدخل رمز التفعيل الذي تلقيته من إدارة المنصة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="أدخل رمز التفعيل..."
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (codeState !== "idle") setCodeState("idle");
              }}
              disabled={codeState === "loading"}
              className="flex-1"
            />
            <Button
              onClick={handleApplyCode}
              disabled={!code.trim() || codeState === "loading"}
            >
              {codeState === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              تفعيل
            </Button>
          </div>

          {codeState === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              {codeMessage}
            </div>
          )}
          {codeState === "error" && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {codeMessage}
            </div>
          )}

          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
            <p className="font-medium">ملاحظة:</p>
            <p>نظام رموز التفعيل غير متوفر حالياً. سيتم تفعيله عند بناء License Engine (Milestone 5).</p>
          </div>
        </CardContent>
      </Card>

      {/* External Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">روابط خارجية</CardTitle>
          <CardDescription>خدمات الاشتراك والدعم (سيتم تفعيلها لاحقاً)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ExternalLinkRow
            label="الخطط والأسعار"
            description="استعرض خطط الاشتراك المتاحة"
            disabled
          />
          <ExternalLinkRow
            label="طلبات الاشتراك"
            description="قدم طلب تغيير اشتراك"
            disabled
          />
          <ExternalLinkRow
            label="الدعم الفني"
            description="تواصل مع فريق الدعم"
            disabled
          />
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">معلومات التواصل</CardTitle>
          <CardDescription>للاستفسارات والطلبات اليدوية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href={`tel:${TEMPORARY_CONTACT.phone}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">هاتف / واتساب</p>
              <p className="text-sm text-muted-foreground ltr">{TEMPORARY_CONTACT.phone}</p>
            </div>
          </a>
          <a
            href={`https://wa.me/${TEMPORARY_CONTACT.whatsapp.replace(/^\+/, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <MessageCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">واتساب</p>
              <p className="text-sm text-muted-foreground ltr">{TEMPORARY_CONTACT.whatsapp}</p>
            </div>
          </a>
          <a
            href={`mailto:${TEMPORARY_CONTACT.email}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">بريد إلكتروني</p>
              <p className="text-sm text-muted-foreground ltr">{TEMPORARY_CONTACT.email}</p>
            </div>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
  isMono,
  highlight,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isMono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className={`flex items-center gap-2 text-sm font-medium ${highlight ? "text-destructive" : ""}`}>
        {icon}
        <span className={isMono ? "font-mono" : ""}>{value}</span>
      </div>
    </div>
  );
}

function LimitBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/50 text-center">
      <div className="text-muted-foreground mb-1">{icon}</div>
      <p className="text-lg font-semibold">{value ?? "—"}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ExternalLinkRow({
  label,
  description,
  disabled,
}: {
  label: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${disabled ? "bg-muted/30 opacity-60" : "hover:bg-muted cursor-pointer"}`}>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-SA");
  } catch {
    return dateStr;
  }
}
