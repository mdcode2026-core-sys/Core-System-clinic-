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
  ["Chat creation uses the canonical transactional Communications RPC", communications.includes('rpc("create_communication_conversation"')],
  ["Chat creation reports RPC failures instead of false success", communications.includes("Communications conversation creation failed") && communications.includes("creationError")],
  ["Creation migration defines the same-tenanted active clinic creator", creationMigration.includes("create_communication_conversation") && creationMigration.includes("cu.tenant_id = v_tenant_id") && creationMigration.includes("cu.is_active = true") && creationMigration.includes("cu.deleted_at IS NULL")],
  ["Creation migration enforces communications:send", creationMigration.includes("has_tenant_permission(v_tenant_id, 'communications:send')")],
  ["Creation migration validates recipient tenant and lifecycle", creationMigration.includes("COMMUNICATIONS_RECIPIENT_TENANT_OR_STATUS_INVALID") && creationMigration.includes("cu.tenant_id = v_tenant_id")],
  ["Creation migration writes conversation and participants transactionally", creationMigration.includes("INSERT INTO public.communication_conversations") && creationMigration.includes("INSERT INTO public.communication_conversation_participants")],
  ["Direct participant INSERT is restricted to communications:manage", creationMigration.includes("communications_participants_manage_insert") && creationMigration.includes("has_tenant_permission(tenant_id, 'communications:manage')")],
  ["Creation migration removes the old permissive participant access policy", creationMigration.includes("DROP POLICY IF EXISTS communications_participants_access")],
  ["Binding contract prohibits parallel Chat storage", contract.includes("chat_conversations") && contract.includes("chat_message_reads")],
];

const failures = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);

if (failures.length) process.exitCode = 1;
else console.log(`HEADER CHAT AUDIT — ${checks.length}/${checks.length} checks passed`);
