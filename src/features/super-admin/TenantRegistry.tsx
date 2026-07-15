"use client";

import { useState } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Building2, Plus, Search, Shield } from "lucide-react";

interface Tenant {
  id: string;
  clinic_name: string;
  subscription_tier: string;
  is_active: boolean;
  user_count: number;
  patient_count: number;
}

const mockTenants: Tenant[] = [
  { id: "1", clinic_name: "عيادة النور الطبية", subscription_tier: "professional", is_active: true, user_count: 8, patient_count: 1240 },
  { id: "2", clinic_name: "مركز الصحة المتكامل", subscription_tier: "enterprise", is_active: true, user_count: 15, patient_count: 3500 },
];

export function TenantRegistry() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tenants] = useState<Tenant[]>(mockTenants);

  const filtered = tenants.filter(t => t.clinic_name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "enterprise": return "bg-purple-100 text-purple-800 border-purple-300";
      case "professional": return "bg-blue-100 text-blue-800 border-blue-300";
      case "essential": return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          إدارة المستأجرين
        </h2>
        <Button><Plus className="w-4 h-4 ml-2" />إضافة عيادة</Button>
      </div>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="البحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10" />
      </div>
      <div className="grid gap-4">
        {filtered.map((tenant) => (
          <Card key={tenant.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{tenant.clinic_name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{tenant.user_count} مستخدم</span>
                      <span>·</span>
                      <span>{tenant.patient_count} مريض</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getTierColor(tenant.subscription_tier)}>{tenant.subscription_tier}</Badge>
                  <Badge variant={tenant.is_active ? "default" : "secondary"}>{tenant.is_active ? "نشط" : "معطل"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
