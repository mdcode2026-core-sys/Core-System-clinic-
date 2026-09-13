import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const chat=read("src/features/workspace/GlobalChatHeaderControl.tsx");
const communications=read("src/domain/communications/communications.actions.ts");
const headerActions=read("src/domain/communications/communications.header.actions.ts");
const page=read("src/app/(dashboard)/communications/page.tsx");
const contract=read("docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-BINDING-EXECUTION-CONTRACT-2026-09-12.md");
const migrations=fs.readdirSync("supabase/migrations").filter(n=>n.includes("global_chat_functional_repair"));
const creationMigration=migrations.length===1?read(`supabase/migrations/${migrations[0]}`):"";
const checks=[
 ["Chat renders from the global header control",chat.includes("export function GlobalChatHeaderControl")],
 ["Chat opens as a compact panel",chat.includes('data-testid="global-chat-panel"')],
 ["Chat reads Communications participants",chat.includes("communication_conversation_participants")],
 ["Chat reads personal receipts",chat.includes("communication_message_reads")],
 ["Chat has no parallel chat storage",!/(chat_conversations|chat_messages|chat_message_reads)/.test(chat)],
 ["Chat has no independent permission engine",!chat.includes("hasEffectivePermission")],
 ["Chat user directory uses shared Communications action",chat.includes("searchCommunicationUsers")],
 ["Directory distinguishes unavailable from no matches",chat.includes("directoryError")&&chat.includes("Unable to load clinic users")],
 ["Directory action reports query failures",headerActions.includes("Communications directory query failed")],
 ["Chat conversation creation uses Communications RPC",communications.includes('rpc("create_communication_conversation"')],
 ["Chat reuses per-conversation draft state",chat.includes("drafts")&&chat.includes("draftForSelected")],
 ["Switching conversation clears transient file and message state",chat.includes("changeConversation")&&chat.includes("setSelectedFile(null)")&&chat.includes("setMessages([])")],
 ["Send preserves draft on failure",chat.includes("if(!id)")&&chat.includes("setDrafts(x=>({...x,[selectedId]:\"\"}))")],
 ["Send clears draft only after successful message creation",chat.includes("if(!id)")&&chat.indexOf("setDrafts(x=>({...x,[selectedId]:\"\"}))")>chat.indexOf("const id=await sendInternalMessage")],
 ["Creation migration reuses active 1:1 conversations",creationMigration.includes("Reuses an active direct internal conversation")&&creationMigration.includes("count(*)")],
 ["Creation migration serializes concurrent 1:1 opens",creationMigration.includes("pg_advisory_xact_lock")],
 ["Creation migration keeps tenant and lifecycle validation",creationMigration.includes("COMMUNICATIONS_RECIPIENT_TENANT_OR_STATUS_INVALID")&&creationMigration.includes("cu.tenant_id = v_tenant_id")],
 ["Creation migration keeps communications:send authority",creationMigration.includes("has_tenant_permission(v_tenant_id, 'communications:send')")],
 ["Creation migration keeps direct participant insert management-only",creationMigration.includes("communications_participants_manage_insert")&&creationMigration.includes("communications:manage")],
 ["Communications page keeps shared send action",page.includes("sendInternalMessage")],
 ["Binding contract prohibits parallel Chat storage",contract.includes("chat_conversations")&&contract.includes("chat_message_reads")],
];
const failures=checks.filter(([,ok])=>!ok);for(const[label,ok]of checks)console.log(`${ok?"PASS":"FAIL"} — ${label}`);if(failures.length)process.exitCode=1;else console.log(`HEADER CHAT AUDIT — ${checks.length}/${checks.length} checks passed`);
