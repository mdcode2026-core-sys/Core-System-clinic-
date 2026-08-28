"use client";

import { useEffect, useMemo, useState } from "react";
import { useTenantId } from "@/core/auth/useTenantId";
import { useI18n } from "@/core/i18n/I18nProvider";
import { usePermissions } from "@/core/permissions/usePermissions";
import { getAvailableWorkspaceSurfaces, type WorkspaceSurfaceKey } from "@/core/workspace/workspaceSurfaces";
import { useUserSettings } from "@/domain/user-settings/userSettings.queries";
import { saveUserSettings } from "@/domain/user-settings/userSettings.actions";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Loader2, Save } from "lucide-react";

const GLOBAL_VALUE = "global" as const;
type SelectableWorkspace = WorkspaceSurfaceKey | typeof GLOBAL_VALUE;

export function UserSettingsManager() {
  const { locale } = useI18n();
  const { userId, tenantId } = useTenantId();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const { data, isLoading } = useUserSettings(userId, tenantId);
  const [workspace, setWorkspace] = useState<SelectableWorkspace>(GLOBAL_VALUE);
  const [collapsed, setCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const ar = locale === "ar";

  const availableWorkspaces = useMemo(
    () => getAvailableWorkspaceSurfaces(hasPermission),
    [hasPermission],
  );

  useEffect(() => {
    if (!data) return;
    const stored = data.default_workspace as WorkspaceSurfaceKey | null | undefined;
    const availableKey = stored && availableWorkspaces.some((surface) => surface.key === stored)
      ? stored
      : GLOBAL_VALUE;
    setWorkspace(availableKey);
    setCollapsed(!!data.sidebar_collapsed);
  }, [data, availableWorkspaces]);

  if (isLoading || permissionsLoading) {
    return <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const r = await saveUserSettings({
      locale,
      default_workspace: workspace === GLOBAL_VALUE ? null : workspace,
      sidebar_collapsed: collapsed,
    });
    setSaving(false);
    setSaved(r.success);
  };

  return (
    <div className="max-w-xl space-y-6" dir={ar ? "rtl" : "ltr"}>
      <div>
        <h2 className="text-xl font-semibold">{ar ? "إعداداتي" : "My Settings"}</h2>
        <p className="text-sm text-muted-foreground">
          {ar ? "تفضيلاتك الشخصية لا تغيّر صلاحياتك." : "Personal preferences do not change authorization."}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{ar ? "مساحة العمل الافتراضية" : "Default workspace"}</Label>
        <Select value={workspace} onValueChange={(value) => setWorkspace(value as SelectableWorkspace)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={GLOBAL_VALUE}>{ar ? "الرئيسية" : "Home"}</SelectItem>
            {availableWorkspaces.filter((surface) => surface.key !== "global").map((surface) => (
              <SelectItem key={surface.key} value={surface.key}>{surface.label[locale]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {ar ? "تظهر فقط مساحات العمل المتاحة لك. مساحة العمل ليست طبقة صلاحيات." : "Only workspaces available to you are offered. Workspace is not an authorization layer."}
        </p>
      </div>

      <div className="flex items-center justify-between rounded-md border p-4">
        <div>
          <p className="font-medium">{ar ? "طي الشريط الجانبي" : "Collapse sidebar"}</p>
          <p className="text-sm text-muted-foreground">{ar ? "تفضيل عرض فقط." : "Display preference only."}</p>
        </div>
        <Switch checked={collapsed} onCheckedChange={setCollapsed} />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {ar ? "حفظ" : "Save"}
        </Button>
        {saved && <span className="text-sm text-muted-foreground">{ar ? "تم الحفظ" : "Saved"}</span>}
      </div>
    </div>
  );
}
