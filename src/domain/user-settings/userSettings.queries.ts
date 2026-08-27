"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";

const supabase=createClient();
export function useUserSettings(userId:string|null,tenantId:string|null){return useQuery({queryKey:["user-settings",userId,tenantId],queryFn:async()=>{if(!userId||!tenantId)return null;const{data,error}=await supabase.from("clinic_user_settings").select("*").eq("user_id",userId).eq("tenant_id",tenantId).maybeSingle();if(error)throw new Error("Failed to load user settings");return data;},enabled:!!userId&&!!tenantId});}
