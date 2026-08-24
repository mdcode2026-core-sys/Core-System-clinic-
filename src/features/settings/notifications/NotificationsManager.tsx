"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useNotificationPreferences, updateNotificationChannelPreference } from "@/domain/notifications";
import type { NotificationChannel } from "@/domain/notifications/notification.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import { Button } from "@/shared/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Bell, MessageCircle, Mail, Smartphone, Monitor } from "lucide-react";
import { toast } from "sonner";

const CHANNEL_ICONS: Record<NotificationChannel, React.ElementType> = { whatsapp: MessageCircle, sms: Smartphone, email: Mail, in_app: Monitor };

export function NotificationsManager() {
  const { hasPermission } = usePermissions();
  const { messages, locale } = useI18n();
  const canManage = hasPermission("notifications:manage");
  const { tenantId, isLoading: tenantLoading } = useTenantId();
  const { data: preferences, isLoading: prefsLoading, error: prefsError, refetch } = useNotificationPreferences(tenantId);
  const [pendingChanges, setPendingChanges] = useState<Map<NotificationChannel, boolean>>(new Map());
  const [savingChannels, setSavingChannels] = useState<Set<NotificationChannel>>(new Set());
  const isLoading = tenantLoading || prefsLoading;

  const handleToggle = useCallback((channel: NotificationChannel, nextValue: boolean) => {
    if (!canManage) return;
    setPendingChanges((prev) => { const next = new Map(prev); const currentPref = preferences?.find((p) => p.channel === channel); if (currentPref && currentPref.is_enabled === nextValue) next.delete(channel); else next.set(channel, nextValue); return next; });
  }, [canManage, preferences]);

  const getEffectiveValue = useCallback((channel: NotificationChannel): boolean => pendingChanges.has(channel) ? pendingChanges.get(channel)! : preferences?.find((p) => p.channel === channel)?.is_enabled ?? true, [pendingChanges, preferences]);
  const hasChanges = pendingChanges.size > 0;

  async function handleSave() {
    if (!canManage || !tenantId || pendingChanges.size === 0) return;
    const channelsToSave = Array.from(pendingChanges.entries());
    setSavingChannels(new Set(channelsToSave.map(([ch]) => ch)));
    let successCount = 0; let failCount = 0;
    for (const [channel, is_enabled] of channelsToSave) {
      const result = await updateNotificationChannelPreference({ channel, is_enabled });
      if (result.success) successCount++; else failCount++;
    }
    setSavingChannels(new Set()); setPendingChanges(new Map()); await refetch();
    const interpolate = (template: string, values: Record<string, number>) => Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);
    if (failCount === 0) toast.success(messages.notifications.saveSuccess, { description: interpolate(messages.notifications.updatedChannels, { count: successCount }) });
    else if (successCount === 0) toast.error(messages.notifications.saveFailed, { description: messages.common.unexpectedError });
    else toast.warning(messages.notifications.savePartial, { description: interpolate(messages.notifications.partialResult, { success: successCount, failed: failCount }) });
  }

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ms-3 text-muted-foreground">{messages.notifications.loading}</span></div>;
  if (prefsError) return <div className="flex flex-col items-center justify-center py-12 gap-3" dir={locale === "ar" ? "rtl" : "ltr"}><AlertCircle className="h-10 w-10 text-destructive" /><p className="text-destructive font-medium">{messages.notifications.loadFailed}</p><p className="text-muted-foreground text-sm">{messages.common.unexpectedError}</p><Button variant="outline" onClick={() => refetch()}>{messages.notifications.retry}</Button></div>;
  if (!preferences || preferences.length === 0) return <div className="flex flex-col items-center justify-center py-12 gap-3"><Bell className="h-10 w-10 text-muted-foreground" /><p className="text-muted-foreground font-medium">{messages.notifications.unavailable}</p></div>;

  return <div className="space-y-6" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">{messages.notifications.title}</h2><p className="text-sm text-muted-foreground mt-1">{messages.notifications.description}</p></div>{hasChanges && <div className="flex items-center gap-2"><Button variant="outline" onClick={() => setPendingChanges(new Map())} disabled={savingChannels.size > 0}>{messages.common.cancel}</Button><Button onClick={handleSave} disabled={savingChannels.size > 0 || !canManage}>{savingChannels.size > 0 ? <><Loader2 className="me-2 h-4 w-4 animate-spin" />{messages.notifications.saving}</> : <><CheckCircle className="me-2 h-4 w-4" />{messages.notifications.saveChanges}</>}</Button></div>}</div>
    {!canManage && <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-amber-800 text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{messages.notifications.accessDenied}</div>}
    <div className="grid gap-4 md:grid-cols-2">{preferences.map((pref) => { const meta = messages.notifications.channels[pref.channel]; const Icon = CHANNEL_ICONS[pref.channel]; const effectiveValue = getEffectiveValue(pref.channel); const isSaving = savingChannels.has(pref.channel); const hasPending = pendingChanges.has(pref.channel); return <Card key={pref.channel} className={`transition-colors ${hasPending ? "border-primary/50 bg-primary/5" : ""}`}><CardHeader className="pb-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div><div><CardTitle className="text-base">{meta.label}</CardTitle><CardDescription className="text-xs">{meta.description}</CardDescription></div></div><Switch checked={effectiveValue} onCheckedChange={(checked) => handleToggle(pref.channel, checked)} disabled={!canManage || isSaving} aria-label={`${meta.label}`} /></div></CardHeader><CardContent className="pt-0"><div className="flex items-center justify-between text-xs text-muted-foreground"><span>{effectiveValue ? <span className="text-emerald-600 font-medium">{messages.notifications.enabled}</span> : <span className="text-red-500 font-medium">{messages.notifications.disabled}</span>}</span>{hasPending && <span className="text-primary font-medium">{messages.notifications.changeUnsaved}</span>}{isSaving && <span className="flex items-center gap-1 text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />{messages.notifications.saving}</span>}</div></CardContent></Card>; })}</div>
  </div>;
}
