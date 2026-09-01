import { createClient } from "@/infrastructure/supabase/server";
import type { WorkspaceSurfaceKey } from "./workspaceSurfaces";

export const BUSINESS_WORKSPACE_KEYS = ["administration", "operation", "clinical"] as const;
export type BusinessWorkspaceKey = (typeof BUSINESS_WORKSPACE_KEYS)[number];
function isBusinessWorkspace(value:string|null|undefined):value is BusinessWorkspaceKey{return!!value&&(BUSINESS_WORKSPACE_KEYS as readonly string[]).includes(value);}

/** Explicit tenant-user assignment. Role and effective permissions never infer Workspace at runtime. */
export async function getAssignedWorkspace(authUserId:string):Promise<BusinessWorkspaceKey|null>{const supabase=await createClient();const{data:clinicUser,error:userError}=await supabase.from("clinic_users").select("id").eq("auth_user_id",authUserId).maybeSingle();if(userError||!clinicUser)return null;const{data:membership,error}=await supabase.from("clinic_user_workspaces").select("workspace").eq("user_id",clinicUser.id).eq("is_default",true).maybeSingle();if(error)return null;return isBusinessWorkspace(membership?.workspace)?membership.workspace:null;}
export function workspaceRoute(workspace:BusinessWorkspaceKey){return `/${workspace}`;}
export function isWorkspaceSurfaceKey(value:string|null|undefined):value is WorkspaceSurfaceKey{return value==="administration"||value==="operation"||value==="clinical";}
