import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const chat = read("src/features/workspace/GlobalChatHeaderControl.tsx");
const communications = read("src/domain/communications/communications.actions.ts");
const page = read("src/app/(dashboard)/communications/page.tsx");
const contract = read("docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-BINDING-EXECUTION-CONTRACT-2026-09-12.md");
const migrations = fs.readdirSync("supabase/migrations").filter((name) => name.includes("communications_conversation_creation_visibility"));
const creationMigration = migrations.length === 1 ? read(`supabase/migrations/${migrations[0]}`) : "";

const checks = [
  ["Chat renders from the global header control", chat.includes("export function GlobalChatHeaderControl")],
  ["Chat opens a compact panel instead of route navigation", chat.includes('data-testid="global-chat-panel"') && !chat.includes('href="/communications"')],
  ["Chat reads the Communications conversation participant model", chat.includes('communication_conversation_participants')],
  ["Chat reads authoritative personal receipts", chat.includes('communication_message_reads')],
  ["Chat excludes the current user's own messages", chat.includes('neq("sender_clinic_user_id", clinicUser.id)')],
  ["Chat scopes unread to the current user's participation", chat.includes('eq("clinic_user_id", clinicUser.id)')],
  ["Chat reads authoritative conversation data", chat.includes('from("communication_conversations")')],
  ["Chat sends through the Communications action", chat.includes("sendInternalMessage")],
  ["Chat marks conversations read through the shared action", chat.includes("markConversationRead")],
  ["Chat has no parallel chat storage", !/(chat_conversations|chat_messages|chat_message_reads)/.test(chat)],
  ["Chat has no independent permission engine", !chat.includes("hasEffectivePermission")],
  ["Communications page uses the shared read action", page.includes("markConversationRead")],
  ["Read action writes communication_message_reads", communications.includes("communication_message_reads")],
  ["Read action verifies internal conversation participation", communications.includes('conversation.kind === "internal"') && communications.includes("communication_conversation_participants")],
  ["Authorized chat creation validates tenant recipients before insert", communications.includes('from("clinic_users")') && communications.includes("validRecipients") && communications.includes("recipientLookupError")],
  ["Authorized chat creation treats participant insert failure as failure", communications.includes("participantsError") && communications.includes("Communications conversation participant creation failed")],
  ["Conversation creation migration preserves the existing read authority paths", creationMigration.includes("DROP POLICY IF EXISTS communications_conversations_read") && creationMigration.includes("created_by =") && creationMigration.includes("communication_conversation_participants")],
  ["Conversation creation migration keeps tenant and active-user constraints", creationMigration.includes("tenant_id = get_current_tenant_id()") && creationMigration.includes("cu.is_active = true") && creationMigration.includes("cu.deleted_at IS NULL")],
  ["Binding contract prohibits parallel Chat storage", contract.includes("chat_conversations") && contract.includes("chat_message_reads")],
];

const failures = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);

if (failures.length) process.exitCode = 1;
else console.log(`HEADER CHAT AUDIT — ${checks.length}/${checks.length} checks passed`);
