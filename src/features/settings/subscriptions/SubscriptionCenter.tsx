"use client";

import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useSubscriptionInfo } from "@/domain/subscriptions";
import { formatDate } from "@/shared/utils/dateTime";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Loader2, AlertCircle, CreditCard, Calendar, Clock, Users, Building2, HardDrive } from "lucide-react";

export function SubscriptionCenter() {
  const { locale, admin: a, subscription: s } = useI18n();
  const { hasPermission } = usePermissions();
  const { tenantId, isLoading: tenantLoading } = useTenantId();
  const { data: subscription, isLoading: subLoading, error: subError } = useSubscriptionInfo(tenantId);

  if (!hasPermission("subscription:read")) return <Empty title={a.subscription.accessDenied} icon={<AlertCircle className="h-12 w-12" />} />;
  if (tenantLoading || subLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ms-3 text-muted-foreground">{a.subscription.loading}</span></div>;
  if (subError || !subscription) return <Empty title={a.subscription.loadFailed} icon={<AlertCircle className="h-12 w-12 text-destructive" />} />;

  const statusLabel = subscription.subscriptionStatus === "active" ? a.subscription.active : subscription.subscriptionStatus === "trial" ? s.trial : a.subscription.inactive;

  return <div className="space-y-6" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">{a.subscription.title}</h2><p className="text-sm text-muted-foreground">{a.subscription.description}</p></div><Badge>{statusLabel}</Badge></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />{a.subscription.currentPlan}</CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2"><Info label={s.clinic} value={subscription.clinicNameAr ?? subscription.clinicName} /><Info label={s.tenantId} value={subscription.tenantId} mono /><Info label={a.subscription.plan} value={subscription.planNameAr ?? subscription.planName ?? subscription.subscriptionTier} /><Info label={s.licenseKey} value={subscription.licenseKey ?? "—"} mono />{subscription.subscriptionStart && <Info label={s.startDate} value={formatDate(subscription.subscriptionStart, locale)} icon={<Calendar className="h-4 w-4" />} />}{subscription.subscriptionEnd && <Info label={s.endDate} value={formatDate(subscription.subscriptionEnd, locale)} icon={<Calendar className="h-4 w-4" />} />}{subscription.daysRemaining !== null && <Info label={s.daysRemaining} value={String(subscription.daysRemaining)} icon={<Clock className="h-4 w-4" />} />}</CardContent></Card>
    <Card><CardHeader><CardTitle>{s.planLimits}</CardTitle><CardDescription>{s.planLimitsDescription}</CardDescription></CardHeader><CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4"><Limit icon={<Users className="h-4 w-4" />} label={a.users.count} value={subscription.maxUsers} /><Limit icon={<Building2 className="h-4 w-4" />} label={s.branches} value={subscription.maxBranches} /><Limit icon={<HardDrive className="h-4 w-4" />} label="GB" value={subscription.storageGb} /><Limit icon={<CreditCard className="h-4 w-4" />} label={s.devices} value={subscription.maxDevices} /></CardContent></Card>
    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{locale === "ar" ? "إدارة تفعيل أو تغيير الاشتراك غير متاحة من هذه الواجهة حالياً، لذلك لا يتم عرض إجراء غير مكتمل للمستخدم." : "Subscription activation or plan changes are not available from this surface yet, so unsupported actions are intentionally not presented."}</div>
  </div>;
}
function Empty({ title, icon }: { title: string; icon: React.ReactNode }) { return <div className="flex flex-col items-center justify-center py-12 text-center"><div className="mb-4 text-muted-foreground">{icon}</div><h3 className="text-lg font-semibold">{title}</h3></div>; }
function Info({ label, value, icon, mono }: { label: string; value: string | null | undefined; icon?: React.ReactNode; mono?: boolean }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className={`flex items-center gap-2 text-sm font-medium ${mono ? "font-mono" : ""}`}>{icon}{value || "—"}</p></div>; }
function Limit({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | null | undefined }) { return <div className="rounded-lg border p-3"><div className="mb-1 flex items-center gap-2 text-muted-foreground">{icon}<span className="text-xs">{label}</span></div><p className="text-lg font-semibold">{value ?? "—"}</p></div>; }