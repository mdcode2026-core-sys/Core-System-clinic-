import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Search, UserPlus } from "lucide-react";

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">المرضى</h1>
        <Button>
          <UserPlus className="w-4 h-4 ml-2" />
          مريض جديد
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="البحث عن مريض..." className="pr-10" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المرضى</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            لا يوجد مرضى مسجلين بعد
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
