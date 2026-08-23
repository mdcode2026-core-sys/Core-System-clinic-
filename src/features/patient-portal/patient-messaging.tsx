"use client";

import { useEffect, useState } from "react";
import { listPatientMessages, sendPatientMessage } from "@/domain/patient-portal/patient-message.actions";
import { Button } from "@/shared/components/ui/button";

type Message = Awaited<ReturnType<typeof listPatientMessages>>[number];

export function PatientMessaging({ tenantId }: { tenantId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function load() { try { setMessages(await listPatientMessages(tenantId)); } catch (e) { setMessage(e instanceof Error ? e.message : "Messaging is unavailable"); } }
  useEffect(() => { void load(); }, [tenantId]);
  async function send() { setBusy(true); setMessage(""); try { await sendPatientMessage(tenantId, body); setBody(""); await load(); } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to send message"); } finally { setBusy(false); } }
  return <div className="rounded-2xl border bg-background p-6 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Secure messages</h2><span className="text-xs text-muted-foreground">Not for urgent care</span></div><div className="mt-4 max-h-72 space-y-3 overflow-auto">{messages.length === 0 ? <p className="text-sm text-muted-foreground">No messages yet.</p> : messages.map((item) => <div key={item.id} className={`rounded-xl border p-3 ${item.sender_type === "patient" ? "ml-8" : "mr-8"}`}><p className="text-xs text-muted-foreground">{item.sender_type === "patient" ? "You" : "Clinic"} · {new Date(item.created_at).toLocaleString()}</p><p className="mt-1 whitespace-pre-wrap text-sm">{item.body}</p></div>)}</div><textarea className="mt-4 min-h-24 w-full rounded-lg border bg-transparent p-3 text-sm" value={body} onChange={(e) => setBody(e.target.value)} maxLength={10000} placeholder="Write a non-urgent message to the clinic…" disabled={busy} /><div className="mt-2 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{message}</span><Button onClick={send} disabled={busy || !body.trim()}>{busy ? "Sending…" : "Send message"}</Button></div></div>;
}
