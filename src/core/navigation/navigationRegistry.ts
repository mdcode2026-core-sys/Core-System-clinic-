// src/core/navigation/navigationRegistry.ts
// Single source of truth for sidebar navigation, contextual routes, permissions, and product-surface hierarchy.

import type { Permission } from "@/core/permissions/types";
import { messages } from "@/core/i18n/messages";
import { LayoutDashboard, Users, CalendarDays, ListOrdered, FileText, FileBarChart, BarChart3, PhoneCall, Settings, BriefcaseBusiness, Stethoscope, ClipboardList, CreditCard, WalletCards, ShieldCheck, Boxes, Truck, ShoppingCart, ClipboardCheck, MessageCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavigationLabelKey = keyof typeof messages.en.nav;
export type NavigationLabel = { ar: string; en: string };
export type SurfaceTier = "core" | "advanced" | "addon";
export type NavigationVisibility = "sidebar" | "contextual";
export interface NavItem { href:string; labelKey:NavigationLabelKey|null; label?:NavigationLabel; icon:LucideIcon; requiredPermission:Permission|null; capabilityKey?:string; children?:NavItem[]; surface?:SurfaceTier; visibility?:NavigationVisibility; navigationOnly?:boolean; }

const financialResourcesChildren:NavItem[]=[
 {href:"/financial-resources/overview",label:{ar:"نظرة عامة",en:"Overview"},labelKey:null,icon:LayoutDashboard,requiredPermission:null,capabilityKey:"financial_resources.overview",surface:"core"},
 {href:"/invoices",label:{ar:"الفواتير",en:"Invoices"},labelKey:null,icon:FileText,requiredPermission:"invoices:read",capabilityKey:"financial_resources.invoices",surface:"core"},
 {href:"/financial-resources/payments",label:{ar:"المدفوعات",en:"Payments"},labelKey:null,icon:CreditCard,requiredPermission:"invoices:read",capabilityKey:"financial_resources.payments",surface:"core"},
 {href:"/financial-resources/financial-plans",label:{ar:"الخطط المالية",en:"Financial Plans"},labelKey:null,icon:WalletCards,requiredPermission:"invoices:read",capabilityKey:"financial_resources.financial_plans",navigationOnly:true,surface:"core",children:[{href:"/financial-resources/financial-plans/installments",label:{ar:"الأقساط",en:"Installments"},labelKey:null,icon:ClipboardList,requiredPermission:"invoices:read",capabilityKey:"financial_resources.installments",surface:"core"}]},
 {href:"/financial-resources/insurance",label:{ar:"التأمين",en:"Insurance"},labelKey:null,icon:ShieldCheck,requiredPermission:"insurance:read",capabilityKey:"financial_resources.insurance",navigationOnly:true,surface:"core",children:[{href:"/financial-resources/insurance/claims",label:{ar:"المطالبات",en:"Claims"},labelKey:null,icon:ClipboardCheck,requiredPermission:"insurance:read",capabilityKey:"financial_resources.insurance.claims",surface:"core"}]},
 {href:"/inventory",label:{ar:"المخزون",en:"Inventory"},labelKey:null,icon:Boxes,requiredPermission:"inventory:read",capabilityKey:"financial_resources.inventory",navigationOnly:true,surface:"core",children:[{href:"/financial-resources/inventory/consumption",label:{ar:"الاستهلاك",en:"Consumption"},labelKey:null,icon:ClipboardCheck,requiredPermission:"inventory:read",capabilityKey:"financial_resources.consumption",surface:"core"}]},
 {href:"/financial-resources/purchasing",label:{ar:"المشتريات",en:"Purchasing"},labelKey:null,icon:ShoppingCart,requiredPermission:"purchasing:read",capabilityKey:"financial_resources.purchasing",navigationOnly:true,children:[{href:"/financial-resources/purchasing/suppliers",label:{ar:"الموردون",en:"Suppliers"},labelKey:null,icon:Truck,requiredPermission:"purchasing:read",capabilityKey:"financial_resources.suppliers",surface:"core"},{href:"/financial-resources/purchasing/receiving",label:{ar:"الاستلام",en:"Receiving"},labelKey:null,icon:ClipboardCheck,requiredPermission:"purchasing:read",capabilityKey:"financial_resources.receiving",surface:"core"}]},
];

export const navigationRegistry:NavItem[]=[
 {href:"/",labelKey:null,label:{ar:"مساحة العمل",en:"Workspace"},icon:LayoutDashboard,requiredPermission:null,surface:"core",visibility:"sidebar"},
 {href:"/patients",labelKey:"patients",icon:Users,requiredPermission:"patients:read",visibility:"sidebar"},
 {href:"/agenda",labelKey:"agenda",icon:CalendarDays,requiredPermission:"agenda:read",visibility:"sidebar"},
 {href:"/patient-flow",label:{ar:"رحلة المريض",en:"Patient Flow"},labelKey:null,icon:ListOrdered,requiredPermission:null,capabilityKey:"patient_flow",navigationOnly:true,visibility:"sidebar",children:[{href:"/patient-flow/operations",label:{ar:"التشغيل",en:"Operations"},labelKey:null,icon:BriefcaseBusiness,requiredPermission:"patient_flow:operations",capabilityKey:"patient_flow.operations",visibility:"sidebar"},{href:"/patient-flow/clinical",label:{ar:"المعاينة السريرية",en:"Clinical"},labelKey:null,icon:Stethoscope,requiredPermission:"patient_flow:clinical",capabilityKey:"patient_flow.clinical",visibility:"sidebar"},{href:"/patient-flow/administrative",label:{ar:"الإدارة",en:"Administrative"},labelKey:null,icon:LayoutDashboard,requiredPermission:"patient_flow:administrative",capabilityKey:"patient_flow.administrative",visibility:"sidebar"}]},
 {href:"/treatment-plans",labelKey:"treatmentPlans",icon:ClipboardList,requiredPermission:"treatment_plans:read",visibility:"sidebar"},
 {href:"/workforce",label:{ar:"القوى العاملة والعمليات",en:"Workforce & Operations"},labelKey:null,icon:BriefcaseBusiness,requiredPermission:"workforce:read",capabilityKey:"workforce.access",surface:"core",visibility:"sidebar"},
 {href:"/communications",label:{ar:"الاتصالات",en:"Communications"},labelKey:null,icon:MessageCircle,requiredPermission:"communications:read",capabilityKey:"communications.access",surface:"core",visibility:"sidebar"},
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
