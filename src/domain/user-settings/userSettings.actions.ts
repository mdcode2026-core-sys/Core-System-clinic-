"use server";

import { createClient } from "@/infrastructure/supabase/server";

export type UserSettingsInput = { locale?: string | null; timezone?: string | null; date_format?: string | null; time_format?: string | null; default_workspace?: "administration" | "operation" | "clinical" | null; sidebar_collapsed?: boolean; preferences?: Record<string, unknown> };

async function caller() {
  const supabase = await createClient(); const { data:{user} }=await supabase.auth.getUser(); if(!user)throw new Error("UNAUTHORIZED"); const {data:cu}=await supabase.from("clinic_users").select("id,tenant_id").eq("auth_user_id",user.id).maybeSingle(); if(!cu)throw new Error("TENANT_RESOLUTION_FAILED"); return {supabase,userId:cu.id,tenantId:cu.tenant_id};
}

export async function saveUserSettings(input: UserSettingsInput) {
  try { const {supabase,userId,tenantId}=await caller(); const {error}=await supabase.from("clinic_user_settings").upsert({tenant_id:tenantId,user_id:userId,...input,updated_at:new Date().toISOString()},{onConflict:"tenant_id,user_id"}); if(error)return{success:false,error:"USER_SETTINGS_SAVE_FAILED"}; return{success:true,error:null}; } catch(e){return{success:false,error:e instanceof Error?e.message:"UNKNOWN"};}
}
