#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

function run(args){
  const r=spawnSync("npx",["--yes","supabase@latest",...args],{stdio:"inherit",env:process.env,shell:false});
  if(r.status!==0)throw new Error("Supabase command failed: npx supabase "+args.join(" "));
}
try{
  run(["init"]);
  const path="supabase/config.toml";
  const original=readFileSync(path,"utf8");
  writeFileSync(path,original.replace(/^project_id\s*=.*$/m,'project_id = "core-system-gate02-ci"'));
  try{
    run(["db","start"]);
    run(["migration","list","--local"]);
    run(["db","lint","--local"]);
    console.log("CLEAN_DB_MIGRATION_VERIFICATION=PASS");
  }finally{
    spawnSync("npx",["--yes","supabase@latest","stop","--no-backup"],{stdio:"inherit",env:process.env,shell:false});
  }
}catch(error){
  console.error("CLEAN_DB_MIGRATION_VERIFICATION=FAIL|"+(error instanceof Error?error.message:String(error)));
  process.exitCode=1;
}
