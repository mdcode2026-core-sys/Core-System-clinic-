// src/core/navigation/navigationRegistry.ts
// Single source of truth for sidebar navigation, contextual routes, permissions, and product-surface hierarchy.
import type { Permission } from "@/core/permissions/types";
import { messages } from "@/core/i18n/messages";
import { LayoutDashboard, Users, CalendarDays, ListOrdered, FileText, FileBarChart, BarChart3, PhoneCall, Settings, BriefcaseBusiness, Stethoscope, ClipboardList, WalletCards, MessageCircle, ListChecks, Coins, Boxes, ShoppingCart, ShieldCheck, SlidersHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
export type NavigationLabelKey = keyof typeof messages.en.nav;
export type NavigationLabel = { ar:string; en:string };
export type SurfaceTier = "core"|"advanced"|"addon";
export type NavigationVisibility = "sidebar"|"contextual";
export interface NavItem { href:string; labelKey:NavigationLabelKey|null; label?:NavigationLabel; icon:LucideIcon; requiredPermission:Permission|null; capabilityKey?:string; children?:NavItem[]; surface?:SurfaceTier; visibility?:NavigationVisibility; navigationOnly?:boolean; }
const financialResourcesChildren:NavItem[]=[
 {href:"/financial-resources",label:{ar:"مركز المالية والموارد",en:"Financial & Resources Center"},labelKey:null,icon:LayoutDashboard,requiredPermission:null,capabilityKey:"financial_resources.overview",surface:"core"},
 {href:"/invoices",label:{ar:"الفواتير والمبيعات",en:"Invoices & Sales"},labelKey:null,icon:FileText,requiredPermission:"invoices:read",capabilityKey:"financial_resources.invoices",surface:"core"},
 {href:"/financial-resources/payments",label:{ar:"المقبوضات والتحصيل",en:"Receipts & Collections"},labelKey:null,icon:Coins,requiredPermission:"invoices:read",capabilityKey:"financial_resources.payments",surface:"core"},
 {href:"/financial-resources/financial-plans",label:{ar:"الخطط المالية والأقساط",en:"Financial Plans & Installments"},labelKey:null,icon:WalletCards,requiredPermission:"invoices:read",capabilityKey:"financial_resources.financial_plans",surface:"core"},
 {href:"/financial-resources/insurance",label:{ar:"التأمين والمطالبات",en:"Insurance & Claims"},labelKey:null,icon:ShieldCheck,requiredPermission:"insurance:read",capabilityKey:"financial_resources.insurance",surface:"core"},
 {href:"/inventory",label:{ar:"الأصناف والمخزون",en:"Items & Inventory"},labelKey:null,icon:Boxes,requiredPermission:"inventory:read",capabilityKey:"financial_resources.inventory",surface:"core"},
 {href:"/financial-resources/purchasing",label:{ar:"المشتريات والموردون",en:"Purchasing & Suppliers"},labelKey:null,icon:ShoppingCart,requiredPermission:"purchasing:read",capabilityKey:"financial_resources.purchasing",surface:"core"},
 {href:"/financial-resources?section=expenses",label:{ar:"المصروفات التشغيلية",en:"Operating Expenses"},labelKey:null,icon:BriefcaseBusiness,requiredPermission:"expenses:manage",capabilityKey:"financial_resources.expenses",surface:"core"},
 {href:"/settings/financial-resources",label:{ar:"إعدادات المالية والموارد",en:"Financial & Resources Settings"},labelKey:null,icon:SlidersHorizontal,requiredPermission:"settings:read",capabilityKey:"financial_resources.settings",surface:"advanced"},
];
export const navigationRegistry:NavItem[]=[
 {href:"/",labelKey:null,label:{ar:"الرئيسية",en:"Home"},icon:LayoutDashboard,requiredPermission:null,surface:"core",visibility:"sidebar"},
 {href:"/workspace",labelKey:null,label:{ar:"مساحة العمل",en:"Workspace"},icon:BriefcaseBusiness,requiredPermission:null,surface:"core",visibility:"sidebar"},
 {href:"/my-workspace",labelKey:null,label:{ar:"مساحة عملي",en:"My Workspace"},icon:ClipboardList,requiredPermission:null,surface:"core",visibility:"sidebar"},
 {href:"/patients",labelKey:"patients",icon:Users,requiredPermission:"patients:read",visibility:"sidebar"},
 {href:"/agenda",labelKey:"agenda",icon:CalendarDays,requiredPermission:"agenda:read",visibility:"sidebar"},
 {href:"/patient-flow",label:{ar:"رحلة المريض",en:"Patient Flow"},labelKey:null,icon:ListOrdered,requiredPermission:null,capabilityKey:"patient_flow",navigationOnly:true,visibility:"contextual",children:[{href:"/patient-flow/operations",label:{ar:"التشغيل",en:"Operations"},labelKey:null,icon:BriefcaseBusiness,requiredPermission:"patient_flow:operations",capabilityKey:"patient_flow.operations",visibility:"contextual"},{href:"/patient-flow/clinical",label:{ar:"المعاينة السريرية",en:"Clinical"},labelKey:null,icon:Stethoscope,requiredPermission:"patient_flow:clinical",capabilityKey:"patient_flow.clinical",visibility:"contextual"},{href:"/patient-flow/administrative",label:{ar:"الإدارة",en:"Administrative"},labelKey:null,icon:LayoutDashboard,requiredPermission:"patient_flow:administrative",capabilityKey:"patient_flow.administrative",visibility:"contextual"}]},
 {href:"/treatment-plans",labelKey:"treatmentPlans",icon:ClipboardList,requiredPermission:"treatment_plans:read",visibility:"sidebar"},
 {href:"/workforce",label:{ar:"القوى العاملة والعمليات",en:"Workforce & Operations"},labelKey:null,icon:BriefcaseBusiness,requiredPermission:"workforce:read",capabilityKey:"workforce.access",surface:"core",visibility:"sidebar"},
 {href:"/communications",label:{ar:"الاتصالات",en:"Communications"},labelKey:null,icon:MessageCircle,requiredPermission:"communications:read",capabilityKey:"communications.access",surface:"core",visibility:"sidebar"},
 {href:"/work-center",label:{ar:"مركز العمل",en:"Work Center"},labelKey:null,icon:ListChecks,requiredPermission:"work:read",capabilityKey:"coordination.work_center",surface:"core",visibility:"sidebar"},
 {href:"/financial-resources",labelKey:null,label:{ar:"المالية والموارد",en:"Financial & Resources"},icon:WalletCards,requiredPermission:null,capabilityKey:"financial_resources.access",navigationOnly:true,children:financialResourcesChildren,visibility:"sidebar"},
 {href:"/follow-up",labelKey:"followUp",icon:PhoneCall,requiredPermission:"followup:read",visibility:"sidebar"},
 {href:"/reports",labelKey:"reports",icon:FileBarChart,requiredPermission:"reports:read",visibility:"sidebar"},
 {href:"/analytics",labelKey:"analytics",icon:BarChart3,requiredPermission:"analytics:read",visibility:"sidebar"},
 {href:"/dashboard",labelKey:"dashboard",icon:LayoutDashboard,requiredPermission:"analytics:read",surface:"core",visibility:"sidebar"},
 {href:"/settings",labelKey:"settings",icon:Settings,requiredPermission:"settings:read",visibility:"sidebar"},
 {href:"/operation",labelKey:"operation",icon:BriefcaseBusiness,requiredPermission:"workspace:operation",visibility:"contextual"},
 {href:"/clinical",labelKey:"clinical",icon:Stethoscope,requiredPermission:"workspace:clinical",visibility:"contextual"},
 {href:"/queue",labelKey:"queue",icon:ListOrdered,requiredPermission:"sessions:read",visibility:"contextual"},
];
function flattenNavigation(items:NavItem[]):NavItem[]{return items.flatMap(item=>[item,...(item.children?flattenNavigation(item.children):[])]);}
export function getRequiredPermission(pathname:string):Permission|null|undefined{const normalized=pathname.split("?")[0];const exact=flattenNavigation(navigationRegistry).find(item=>item.href.split("?")[0]===normalized);if(exact)return exact.requiredPermission;const parent=navigationRegistry.find(item=>item.href!=="/"&&normalized.startsWith(item.href+"/"));return parent?.requiredPermission;}
export function getSidebarNavigation():NavItem[]{return navigationRegistry.filter(item=>item.visibility!=="contextual");}
