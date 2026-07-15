import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { FileText, Plus } from "lucide-react";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الفواتير</h1>
        <Button>
          <Plus className="w-4 h-4 ml-2" />
          فاتورة جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            الفواتير الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            لا توجد فواتير مسجلة
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
