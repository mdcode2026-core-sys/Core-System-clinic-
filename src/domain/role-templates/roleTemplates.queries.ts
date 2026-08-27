"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";

const supabase=createClient();
export function useRoleTemplates(){return useQuery({queryKey:["role-templates"],queryFn:async()=>{const{data,error}=await supabase.from("role_templates").select("id,template_key,template_name,template_name_ar,description,workspace,is_system_template,source_role_id,role_template_permissions(permission_id)").eq("is_system_template",true).order("template_name");if(error)throw new Error("Failed to load role templates");return data??[];}})}
