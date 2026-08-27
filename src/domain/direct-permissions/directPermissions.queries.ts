"use client";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
const supabase=createClient();
export function useDirectPermissions(userId:string|null,tenantId:string|null){return useQuery({queryKey:["direct-permissions",userId,tenantId],queryFn:async()=>{if(!userId||!tenantId)return[];const{data,error}=await supabase.from("clinic_user_permissions").select("permission_id,granted,permissions(permission_key)").eq("user_id",userId).eq("tenant_id",tenantId);if(error)throw new Error("Failed to load direct permissions");return data??[];},enabled:!!userId&&!!tenantId});}
