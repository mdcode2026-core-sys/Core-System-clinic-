import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const chat=read("src/features/workspace/GlobalChatHeaderControl.tsx");
const chatActions=read("src/domain/communications/chat.actions.ts");
const communications=read("src/domain/communications/communications.actions.ts");
const page=read("src/app/(dashboard)/communications/page.tsx");
const contract=read("docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-BINDING-EXECUTION-CONTRACT-2026-09-12.md");
const migrations=fs.readdirSync("supabase/migrations").filter(n=>/\.sql$/.test(n)).filter(n=>{const s=read(`supabase/migrations/${n}`);return s.includes("create_communication_conversation")||s.includes("communications_participants_manage_insert");});
const creationMigration=migrations.map(n=>read(`supabase/migrations/${n}`)).join("\n");
const realtimeMigrations=fs.readdirSync("supabase/migrations").filter(n=>n.includes("chat_directory_realtime_latency"));
const realtimeMigration=realtimeMigrations.length===1?read(`supabase/migrations/${realtimeMigrations[0]}`):"";
const checks=[
 ["Chat renders from the global header control",chat.includes("export function GlobalChatHeaderControl")],
 ["Chat opens as a compact panel",chat.includes('data-testid="global-chat-panel"')],
 ["Chat data is resolved through the authoritative chat directory action",chat.includes("getInternalChatDirectory")&&chatActions.includes("get_internal_chat_directory")],
 ["Chat personal read state uses Communications read authority",chat.includes("markInternalChatRead")&&chatActions.includes("markConversationRead")],
 ["Chat has no parallel chat storage",!/(chat_conversations|chat_messages|chat_message_reads)/.test(chat+chatActions)],
 ["Chat has no independent permission engine",!chat.includes("hasEffectivePermission")],
 ["Directory is tenant-scoped and excludes the current user",realtimeMigration.includes("cu.id <> me.id")&&realtimeMigration.includes("cu.tenant_id = me.tenant_id")],
 ["Directory distinguishes unavailable from no matches",chat.includes("directoryError")&&chat.includes("Unable to load users")],
 ["Directory query failures are explicit",chatActions.includes("COMMUNICATIONS_DIRECTORY_UNAVAILABLE")],
 ["Chat conversation creation uses Communications RPC",communications.includes('rpc("create_communication_conversation"')],
 ["Chat uses one composer state and clears it on recipient switch",chat.includes("setDraft(\"\")")&&chat.includes("setSelectedFile(null)")],
 ["Send restores the draft when the authoritative send fails",chat.includes("setDraft(body)")&&chat.includes("MESSAGE_SEND_FAILED")],
 ["Send renders optimistically before the background refresh",chat.includes("optimistic-")&&chat.includes("void loadMessages(conversationId)")],
 ["Realtime publication includes communication_messages",realtimeMigration.includes("alter publication supabase_realtime add table public.communication_messages")],
 ["Realtime subscription listens to communication_messages",chat.includes('table: "communication_messages"')&&chat.includes("postgres_changes")],
 ["Creation migration reuses active 1:1 conversations",creationMigration.includes("Reuse an active direct internal conversation")&&creationMigration.includes("count(*)")],
 ["Creation migration serializes concurrent 1:1 opens",creationMigration.includes("pg_advisory_xact_lock")],
 ["Creation migration keeps tenant and lifecycle validation",creationMigration.includes("COMMUNICATIONS_RECIPIENT_TENANT_OR_STATUS_INVALID")&&creationMigration.includes("cu.tenant_id = v_tenant_id")],
 ["Creation migration keeps communications:send authority",creationMigration.includes("has_tenant_permission(v_tenant_id, 'communications:send')")],
 ["Creation migration keeps direct participant insert management-only",creationMigration.includes("communications_participants_manage_insert")&&creationMigration.includes("communications:manage")],
 ["Communications page excludes internal staff chat",page.includes('.neq("kind", "internal")')&&page.includes("New patient communication")],
 ["Binding contract still prohibits parallel Chat storage",contract.includes("chat_conversations")&&contract.includes("chat_message_reads")],
];
const failures=checks.filter(([,ok])=>!ok);for(const[label,ok]of checks)console.log(`${ok?"PASS":"FAIL"} — ${label}`);if(failures.length)process.exitCode=1;else console.log(`HEADER CHAT AUDIT — ${checks.length}/${checks.length} checks passed`);
