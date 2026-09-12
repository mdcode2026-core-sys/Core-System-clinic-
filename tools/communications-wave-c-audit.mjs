#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(file, "utf8");
const exists = (file) => fs.existsSync(file);
const walk = (dir) => {
  if (!exists(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
};

const actions = read("src/domain/communications/communications.actions.ts");
const contract = read("docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-BINDING-EXECUTION-CONTRACT-2026-09-12.md");
const plan = read("docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-EXECUTION-PLAN-2026-09-12.md");
const allSource = walk("src").filter((file) => /\.(ts|tsx|mjs)$/.test(file)).map(read).join("\n");
const docs = walk("docs").filter((file) => file.endsWith(".md"));
const historicalDocs = docs.filter((file) => !/(COMMUNICATIONS-CHAT-PATIENT-PORTAL-(BINDING-EXECUTION-CONTRACT|EXECUTION-PLAN|PHASE1-CLOSURE|WAVE-[BC]-.*)|HEADER-CHAT-INTEGRATION-REPORT)/i.test(path.basename(file)));
const historicalText = historicalDocs.map(read).join("\n");

const checks = [
  ["Communications has an explicit conversation archive action", actions.includes("archiveConversation") && actions.includes('status: "archived"')],
  ["No message-delete action is exposed as a final retention mechanism", !/export async function deleteCommunicationMessage/.test(actions)],
  ["Binding contract makes retained history the default until an approved deletion policy exists", contract.includes("Until the final deletion policy is implemented and verified, retained history remains the default behavior")],
  ["Plan explicitly scopes deletion/retention at Communications level", plan.includes("Phase 8 — Delete / retention") && plan.includes("deletion/retention is explicit, authorized, auditable and shared across all surfaces")],
  ["Work integration is initiated only through an explicit Communication request", actions.includes("createCommunicationRequest") && actions.includes('sourceType: "communication_request"')],
  ["Communication-created work is delegated to the existing Work Center authority", actions.includes("createWorkItem") && actions.includes('revalidatePath("/work-center")')],
  ["Communications does not introduce operational-work storage", !/operational_work_items|operational_work_history/.test(actions)],
  ["No duplicate Chat/Portal messaging engines are introduced in Communications source", !/(chat_conversations|chat_messages|chat_message_reads|portal_chat_messages|group_messages)/.test(allSource)],
  ["Binding contract preserves the Communications → Work Center boundary", contract.includes("explicit operational action required") && contract.includes("Communications does not become the owner of that work")],
  ["Historical documentation is explicitly classified for reconciliation", contract.includes("current") && contract.includes("superseded") && contract.includes("historical")],
  ["Historical docs do not define Portal as an independent messaging authority", !/independent messaging authority/i.test(historicalText)],
  ["Historical docs do not define Communications as owner of operational assignment or queues", !/(Communications[^\n]{0,120}(owns|owner of)[^\n]{0,120}(assignment|work queue|operational queue))/i.test(historicalText)],
];

const failures = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);

if (failures.length) {
  process.exitCode = 1;
} else {
  console.log(`COMMUNICATIONS WAVE C AUTHORITY AUDIT — ${checks.length}/${checks.length} checks passed`);
}
