"use client";
import { useEffect, useState } from "react";
import { listPatientMessages, sendPatientMessage } from "@/domain/patient-portal/patient-message.actions";
import { Button } from "@/shared/components/ui/button";
import { useI18n } from "@/core/i18n/I18nProvider";
type Message = Awaited<ReturnType<typeof listPatientMessages>>[number];
export function PatientMessaging({ tenantId }: { tenantId: string }) {
  const { locale, portal: t } = useI18n(); const [messages, setMessages] = useState<Message[]>([]); const [body, setBody] = useState(""); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function load() { try { setMessages(await listPatientMessages(tenantId)); } catch (e) { setMessage(e instanceof Error ? e.message : t.messagingUnavailable); } }
  useEffect(() => { void load(); }, [tenantId]);
  async function send() { setBusy(true); setMessage(""); try { await sendPatientMessage(tenantId, body); setBody(""); await load(); } catch (e) { setMessage(e instanceof Error ? e.message : t.sendMessageFailed); } finally { setBusy(false); } }
  return <div className="rounded-2xl border bg-background p-6 shadow-sm" dir={locale === "ar" ? "rtl" : "ltr"}><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{t.secureMessages}</h2><span className="text-xs text-muted-foreground">{t.notUrgentCare}</span></div><div className="mt-4 max-h-72 space-y-3 overflow-auto">{messages.length === 0 ? <p className="text-sm text-muted-foreground">{t.noMessagesYet}</p> : messages.map((item) => <div key={item.id} className={`rounded-xl border p-3 ${item.sender_type === "patient" ? "ml-8" : "mr-8"}`}><p className="text-xs text-muted-foreground">{item.sender_type === "patient" ? t.you : t.clinic} · {new Date(item.created_at).toLocaleString(locale === "ar" ? "ar" : "en-US")}</p><p className="mt-1 whitespace-pre-wrap text-sm">{item.body}</p></div>)}</div><textarea className="mt-4 min-h-24 w-full rounded-lg border bg-transparent p-3 text-sm" value={body} onChange={(e) => setBody(e.target.value)} maxLength={10000} placeholder={t.messagePlaceholder} disabled={busy} /><div className="mt-2 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{message}</span><Button onClick={send} disabled={busy || !body.trim()}>{busy ? t.sendingMessage : t.sendMessage}</Button></div></div>;
}
