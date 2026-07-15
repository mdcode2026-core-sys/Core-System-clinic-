import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">الإعدادات</h1>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات العيادة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinic-name">اسم العيادة</Label>
            <Input id="clinic-name" placeholder="عيادة النور الطبية" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input id="phone" placeholder="+966 50 000 0000" />
          </div>
          <Separator />
          <Button>
            <Save className="w-4 h-4 ml-2" />
            حفظ التغييرات
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
