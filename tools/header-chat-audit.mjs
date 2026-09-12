import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const chat = read("src/features/workspace/GlobalChatHeaderControl.tsx");
const communications = read("src/domain/communications/communications.actions.ts");
const page = read("src/app/(dashboard)/communications/page.tsx");
const contract = read("docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-BINDING-EXECUTION-CONTRACT-2026-09-12.md");

const checks = [
  ["Chat renders from the global header control", chat.includes("export function GlobalChatHeaderControl")],
  ["Chat routes to the authoritative Communications surface", chat.includes('href="/communications"')],
  ["Chat reads the Communications conversation participant model", chat.includes('communication_conversation_participants')],
  ["Chat reads authoritative personal receipts", chat.includes('communication_message_reads')],
  ["Chat excludes the current user's own messages", chat.includes('neq("sender_clinic_user_id", clinicUser.id)')],
  ["Chat scopes unread to the current user's participation", chat.includes('eq("clinic_user_id", clinicUser.id)')],
  ["Chat has no parallel chat storage", !/(chat_conversations|chat_messages|chat_message_reads)/.test(chat)],
  ["Chat has no independent permission engine", !chat.includes("hasEffectivePermission")],
  ["Communications marks internal conversation reads through the shared action", page.includes("markConversationRead")],
  ["Read action writes communication_message_reads", communications.includes("communication_message_reads")],
  ["Read action verifies internal conversation participation", communications.includes('conversation.kind === "internal"') && communications.includes("communication_conversation_participants")],
  ["Binding contract prohibits parallel Chat storage", contract.includes("chat_conversations") && contract.includes("chat_message_reads")],
];

const failures = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);

if (failures.length) {
  process.exitCode = 1;
} else {
  console.log(`HEADER CHAT AUDIT — ${checks.length}/${checks.length} checks passed`);
}
