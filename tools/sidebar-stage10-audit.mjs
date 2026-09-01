import fs from "node:fs";
const registry=fs.readFileSync("src/core/navigation/navigationRegistry.ts","utf8");const shell=fs.readFileSync("src/features/workspace/EntitlementAwareWorkspaceShell.tsx","utf8");const failures=[];const expect=(condition,message)=>{if(!condition)failures.push(message)};
expect(registry.includes("navigationRegistry")&&registry.includes("navigationOnly"),"Canonical grouped domain navigation is missing");
expect(!registry.includes("patient-flow")&&!registry.includes("Patient Flow"),"Patient Flow must not be registered as ordinary Sidebar navigation");
expect(shell.includes('href="/patient-flow"')&&shell.includes("clinicAdmin")&&shell.includes("showPatientFlow"),"Clinic Admin Patient Flow visibility control is missing");
expect(shell.includes("GlobalSearch"),"Global Search header integration is missing");
expect(shell.includes("My Workspace")&&shell.includes("My Settings"),"Workspace/personal settings navigation contract is missing");
expect(!shell.includes("WorkspaceSurfaceNav"),"Legacy Workspace surface navigation must not remain active");
expect(!registry.includes('workspace:operation')&&!registry.includes('workspace:clinical')&&!registry.includes('workspace:administration'),"Workspace must not be authorization permissions");
expect(!registry.includes('patient_flow:operations')&&!registry.includes('patient_flow:clinical')&&!registry.includes('patient_flow:administrative'),"Patient Flow classifications must not be Sidebar permissions");
if(failures.length){console.error("Sidebar architecture audit FAILED");for(const f of failures)console.error(`- ${f}`);process.exit(1)}
console.log("Sidebar architecture audit PASSED");
