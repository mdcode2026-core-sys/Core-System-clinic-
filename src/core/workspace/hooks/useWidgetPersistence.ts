"use client";

import { useCallback, useEffect, useState } from "react";
import type { WorkspaceUserState } from "../workspace.types";
import type { WorkspaceSurfaceKey } from "../workspaceSurfaces";
import { WORKSPACE_STORAGE_PREFIX } from "../workspace.constants";
import { createClient } from "@/infrastructure/supabase/client";

const DEFAULT_STATE: WorkspaceUserState = { widgets: [], lastUpdated: new Date().toISOString() };
function getStorageKey(userId:string|undefined,workspaceKey:WorkspaceSurfaceKey){return `${WORKSPACE_STORAGE_PREFIX}_${userId??"anonymous"}_${workspaceKey}`;}
function readFromStorage(key:string):WorkspaceUserState{if(typeof window==="undefined")return DEFAULT_STATE;try{const raw=window.localStorage.getItem(key);if(!raw)return DEFAULT_STATE;const parsed=JSON.parse(raw) as WorkspaceUserState;return parsed.widgets&&Array.isArray(parsed.widgets)?parsed:DEFAULT_STATE;}catch{return DEFAULT_STATE;}}
function writeToStorage(key:string,state:WorkspaceUserState){if(typeof window==="undefined")return;try{window.localStorage.setItem(key,JSON.stringify(state));}catch{}}
export interface UseWidgetPersistenceResult{layout:WorkspaceUserState;setLayout:(updater:(prev:WorkspaceUserState)=>WorkspaceUserState)=>void;reset:()=>void;}
export function useWidgetPersistence(workspaceKey:WorkspaceSurfaceKey):UseWidgetPersistenceResult{const initialKey=getStorageKey(undefined,workspaceKey);const[storageKey,setStorageKey]=useState(initialKey);const[layout,setInternalLayout]=useState<WorkspaceUserState>(()=>readFromStorage(initialKey));useEffect(()=>{let cancelled=false;const supabase=createClient();supabase.auth.getUser().then(({data})=>{if(cancelled)return;const key=getStorageKey(data.user?.id,workspaceKey);setStorageKey(key);setInternalLayout(readFromStorage(key));});return()=>{cancelled=true;};},[workspaceKey]);useEffect(()=>{writeToStorage(storageKey,layout);},[storageKey,layout]);const setLayout=useCallback((updater:(prev:WorkspaceUserState)=>WorkspaceUserState)=>setInternalLayout(prev=>updater(prev)),[]);const reset=useCallback(()=>setInternalLayout(DEFAULT_STATE),[]);return{layout,setLayout,reset};}
