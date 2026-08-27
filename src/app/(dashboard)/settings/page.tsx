"use client";

import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useI18n } from "@/core/i18n/I18nProvider";
import { ClinicProfileForm } from "@/features/settings/ClinicProfileForm";
import { RolesManager } from "@/features/settings/roles/RolesManager";
import { UsersManager } from "@/features/settings/users/UsersManager";
import { OverridesManager } from "@/features/settings/overrides/OverridesManager";
import { AuditLogManager } from "@/features/settings/audit";
import { SystemPreferencesManager } from "@/features/settings/system";
import { NotificationsManager } from "@/features/settings/notifications";
import { SubscriptionCenter } from "@/features/settings/subscriptions";
import { ProceduresManager } from "@/features/settings/procedures";
import { RoomsManager } from "@/features/settings/rooms";
import { UserSettingsManager } from "@/features/settings/user/UserSettingsManager";
import { RoleTemplatesManager } from "@/features/settings/templates/RoleTemplatesManager";
import { LayoutDashboard,Building2,Users,ShieldCheck,FileText,UserCog,Bell,CreditCard,ClipboardList,Settings,Stethoscope,DoorOpen,UserRound } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

const tabs=[
 {id:"overview",icon:LayoutDashboard,permission:null,key:"overview",group:"clinic"},
 {id:"clinic-profile",icon:Building2,permission:"settings:read",key:"clinic",group:"clinic"},
 {id:"rooms",icon:DoorOpen,permission:"settings:read",key:"rooms",group:"clinic"},
 {id:"team-access",icon:ShieldCheck,permission:"settings:read",key:"teamAccess",group:"team"},
 {id:"users",icon:Users,permission:"users:read",key:"users",group:"team"},
 {id:"roles",icon:ShieldCheck,permission:"roles:read",key:"roles",group:"team"},
 {id:"templates",icon:FileText,permission:"templates:manage",key:"templates",group:"team"},
 {id:"overrides",icon:UserCog,permission:"overrides:manage",key:"overrides",group:"team"},
 {id:"user-settings",icon:UserRound,permission:null,key:"user",group:"team"},
 {id:"notifications",icon:Bell,permission:"notifications:manage",key:"notifications",group:"system"},
 {id:"system",icon:Settings,permission:"settings:update",key:"preferences",group:"system"},
 {id:"subscription",icon:CreditCard,permission:"subscription:read",key:"subscription",group:"subscription"},
 {id:"audit",icon:ClipboardList,permission:"audit:read",key:"audit",group:"audit"},
 {id:"procedures",icon:Stethoscope,permission:"procedures:read",key:"procedures",group:"master"},
] as const;

export default function SettingsPage(){
 const[activeTab,setActiveTab]=useState("team-access");
 const{hasPermission,isLoading}=usePermissions();
 const{admin:a,locale}=useI18n();
 if(isLoading)return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"/><span className="ms-3 text-muted-foreground">{a.users.loading}</span></div>;
 const visible=tabs.filter(t=>t.permission===null||hasPermission(t.permission as any));
 const ar=locale==="ar";
 const team={title:ar?"إدارة الفريق والصلاحيات":"Team & Access",description:ar?"إدارة المستخدمين والأدوار والصلاحيات الفعلية والاستثناءات وإعدادات المستخدم من مكان واحد.":"Manage users, roles, effective access, overrides, and user settings from one place.",open:ar?"فتح":"Open",users:ar?"المستخدمون":"Users",roles:ar?"الأدوار والصلاحيات":"Roles & Permissions",overrides:ar?"الوصول والاستثناءات":"User Access & Overrides",templates:ar?"قوالب الأدوار":"Role Templates",settings:ar?"إعداداتي":"My Settings"};
 const labels:Record<string,string>=ar?{overview:"نظرة عامة",clinic:"ملف العيادة",rooms:"الغرف والموارد",teamAccess:team.title,users:team.users,roles:team.roles,templates:team.templates,overrides:team.overrides,user:team.settings,notifications:"الإشعارات",preferences:"تفضيلات النظام",subscription:"الاشتراك",audit:"التدقيق والنشاط",procedures:"الخدمات والإجراءات"}:{overview:"Overview",clinic:"Clinic Profile",rooms:"Rooms & Resources",teamAccess:team.title,users:team.users,roles:team.roles,templates:team.templates,overrides:team.overrides,user:team.settings,notifications:"Notifications",preferences:"System Preferences",subscription:"Subscription",audit:"Audit & Activity",procedures:"Services & Procedures"};
 const groups=[{id:"clinic",title:ar?"العيادة والموارد":"Clinic & Resources"},{id:"team",title:team.title},{id:"system",title:ar?"النظام والتفضيلات":"System & Preferences"},{id:"subscription",title:ar?"الاشتراك":"Subscription"},{id:"audit",title:ar?"التدقيق والنشاط":"Audit & Activity"},{id:"master",title:ar?"المكتبة الطبية والخدمات":"Medical Master & Services"}];
 const cards=[{id:"users",icon:Users,title:team.users,desc:ar?"إنشاء المستخدمين وتفعيلهم وتعيين الأدوار.":"Create, activate, and assign roles to users."},{id:"roles",icon:ShieldCheck,title:team.roles,desc:ar?"إنشاء الأدوار وتوزيع صلاحيات Permission Catalog.":"Create roles and assign catalogued permissions."},{id:"overrides",icon:UserCog,title:team.overrides,desc:ar?"منح أو سحب صلاحيات لمستخدم محدد.":"Grant or explicitly revoke permissions for a user."},{id:"templates",icon:FileText,title:team.templates,desc:ar?"نماذج استرشادية قابلة للتعديل وليست قواعد إلزامية.":"Advisory starting templates, not mandatory policy."},{id:"user-settings",icon:UserRound,title:team.settings,desc:ar?"إعداداتك الشخصية منفصلة عن الصلاحيات.":"Personal preferences are separate from authorization."}];
 const open=(id:string)=>setActiveTab(id);
 const label=(tab:any)=>labels[tab.key]||tab.key;
 return <div className="space-y-6"><h1 className="text-2xl font-bold">{a.settings.title}</h1><div className="space-y-5">{groups.map(group=>{const groupTabs=visible.filter(t=>t.group===group.id);if(!groupTabs.length)return null;return <section key={group.id} className="space-y-2"><h2 className="text-sm font-semibold text-muted-foreground">{group.title}</h2><div className="flex flex-wrap gap-2">{groupTabs.map(tab=>{const Icon=tab.icon;const active=activeTab===tab.id;return <button key={tab.id} onClick={()=>open(tab.id)} aria-current={active?"page":undefined} className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${active?"border-primary bg-primary/5 text-primary":"border-border text-muted-foreground hover:text-foreground"}`}><Icon className="h-4 w-4"/>{label(tab)}</button>})}</div></section>})}</div>
 {activeTab==="team-access"&&<div className="space-y-5" dir={ar?"rtl":"ltr"}><div><h2 className="text-xl font-semibold">{team.title}</h2><p className="text-sm text-muted-foreground">{team.description}</p></div><div className="grid gap-4 md:grid-cols-2">{cards.filter(c=>visible.some(t=>t.id===c.id)).map(c=>{const Icon=c.icon;return <Card key={c.id}><CardContent className="flex items-start justify-between gap-4 p-5"><div className="flex gap-3"><div className="rounded-lg bg-primary/10 p-2 h-fit"><Icon className="h-5 w-5 text-primary"/></div><div><h3 className="font-semibold">{c.title}</h3><p className="mt-1 text-sm text-muted-foreground">{c.desc}</p></div></div><Button variant="outline" size="sm" onClick={()=>open(c.id)}>{team.open}</Button></CardContent></Card>})}</div><Card className="bg-muted/50"><CardContent className="p-5"><p className="text-sm text-muted-foreground">{ar?"Role ≠ Permission · Workspace ≠ Security Boundary · الصلاحية الفعلية تخضع للصلاحيات وEntitlement الخاص بالعيادة.":"Role ≠ Permission · Workspace ≠ Security Boundary · Effective access is governed by permissions and tenant entitlement."}</p></CardContent></Card></div>}
 {activeTab==="overview"&&<div className="rounded-lg border border-border bg-card p-6"><h2 className="text-xl font-semibold">{a.settings.overview}</h2><p className="mt-2 text-muted-foreground">{a.settings.description}</p></div>}{activeTab==="clinic-profile"&&<ClinicProfileForm/>}{activeTab==="users"&&<UsersManager/>}{activeTab==="roles"&&<RolesManager/>}{activeTab==="templates"&&<RoleTemplatesManager/>}{activeTab==="overrides"&&<OverridesManager/>}{activeTab==="notifications"&&<NotificationsManager/>}{activeTab==="subscription"&&<SubscriptionCenter/>}{activeTab==="audit"&&<AuditLogManager/>}{activeTab==="procedures"&&<ProceduresManager/>}{activeTab==="rooms"&&<RoomsManager/>}{activeTab==="system"&&<SystemPreferencesManager/>}{activeTab==="user-settings"&&<UserSettingsManager/>}</div>;
}