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

const chat = read("src/features/workspace/GlobalChatHeaderControl.tsx");
const actions = read("src/domain/communications/communications.actions.ts");
const contract = read("docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-BINDING-EXECUTION-CONTRACT-2026-09-12.md");
const allSource = walk("src").filter((file) => /\\.(ts|tsx|mjs)$/.test(file)).map(read).join("\n");
const migrations = walk("supabase/migrations").filter((file) => file.endsWith(".sql"));
const attachmentMigrations = migrations.filter((file) => /communication.*attachment/i.test(path.basename(file)) || read(file).includes("communication_message_attachments"));
const attachmentSql = attachmentMigrations.map(read).join("\n");

const checks = [
  ["Global Chat is implemented as a surface over Communications", chat.includes("/communications") && chat.includes("communication_conversation_participants") && chat.includes("communication_message_reads")],
  ["Global Chat has no parallel chat storage", !/(chat_conversations|chat_messages|chat_message_reads)/.test(chat)],
  ["Global Chat has no independent permission engine", !chat.includes("hasEffectivePermission")],
  ["Internal group membership uses the existing participant model", actions.includes("addConversationParticipant") && actions.includes("removeConversationParticipant") && actions.includes("communication_conversation_participants")],
  ["Group membership changes require Communications management authority", actions.includes('hasEffectivePermission(ctx.user.id, "communications:manage")')],
  ["Group membership targets an active same-tenant clinic user", actions.includes('eq("tenant_id", ctx.tenantId)') && actions.includes('eq("is_active", true)') && actions.includes('is("deleted_at", null)')],
  ["Participant removal cannot remove the conversation creator", actions.includes('if (conversation.created_by === input.clinicUserId) return')],
  ["Attachments are owned by Communications messages", actions.includes("createCommunicationAttachmentUpload") && actions.includes("communication_message_attachments")],
  ["Attachment storage path is tenant/conversation/message scoped", actions.includes('`${ctx.tenantId}/${conversation.id}/${message.id}/')],
  ["Attachment upload has bounded size and MIME validation", actions.includes("25 * 1024 * 1024") && actions.includes("allowedMime")],
  ["Attachment authorization distinguishes clinic users and patients", actions.includes("uploaded_by_clinic_user_id") && actions.includes("uploaded_by_patient_identity_id")],
  ["Attachment policies are present at database level", attachmentMigrations.length > 0 && attachmentSql.includes("communication_message_attachments") && attachmentSql.includes("tenant_id")],
  ["No second Chat/group/Portal messaging store is introduced in source", !/(chat_conversations|chat_messages|chat_message_reads|portal_chat_messages|group_messages)/.test(allSource)],
  ["Binding contract requires existing participant model for groups", contract.includes("communication_conversation_participants") && contract.includes("No group-specific messaging engine")],
  ["Binding contract requires Communications ownership for attachments", contract.includes("Attachments belong to Communications messages")],
];

const failures = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);

if (failures.length) {
  process.exitCode = 1;
} else {
  console.log(`COMMUNICATIONS WAVE B AUTHORITY AUDIT — ${checks.length}/${checks.length} checks passed`);
}
