"use client";

import React, { useEffect, useState } from "react";
import type { ChatMessageDto, ConversationDto, NotificationDto } from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { emitAnalyticsEvent } from "@/lib/observability";
import { useAppContext } from "@/components/providers/AppProviders";

export default function ChatAndNotificationsPage() {
  const { pushToast } = useAppContext();
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [tradeAccepted, setTradeAccepted] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [draft, setDraft] = useState(
    "Call me at +91 9876543210 or check https://example.com for photos!"
  );

  const activeConvId = conversations[0]?.id || "conv-seed-101";

  const loadData = () => {
    apiClient
      .getConversations()
      .then((res) => setConversations(res.items))
      .catch(() => {});
    apiClient
      .getMessages(activeConvId)
      .then((res) => {
        setMessages(res.items);
        setTradeAccepted(res.tradeAccepted);
      })
      .catch(() => {});
    apiClient
      .getNotifications()
      .then((res) => setNotifications(res.items))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const res = await apiClient.sendMessage(activeConvId, draft);
    emitAnalyticsEvent("message_sent", { conversationId: activeConvId });
    setMessages((prev) => [...prev, res.message]);
    setDraft("");
    if (res.message.maskedWarning) {
      pushToast({
        title: "Phone / Link Masked (FR-CHT-2)",
        description: "Contact details are masked until the swap offer is accepted.",
        tone: "warning",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8 xc-glass-panel rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-3">
          <div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
              WEB-1.9 &amp; FR-CHT-2 · OFFER CHAT WITH PRE-ACCEPT MASKING
            </span>
            <h1 className="mt-2 text-xl font-bold">
              {conversations[0]?.title || "Fujifilm X-T30 II ⇄ iPad Pro 11\" M2"}
            </h1>
          </div>
          <span className="rounded-xl border border-emerald-500/30 px-3 py-1 text-xs font-mono">
            {tradeAccepted ? "🔓 Trade Accepted (Unmasked)" : "🛡️ Pre-Accept Masking ON"}
          </span>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-emerald-500/20 bg-slate-950/50 p-3.5 text-xs"
            >
              <div className="flex justify-between font-bold text-emerald-400">
                <span>{m.senderName}</span>
                {m.maskedWarning && (
                  <span className="text-amber-300">🛡️ Masked PII/Link (FR-CHT-2)</span>
                )}
              </div>
              <p className="mt-1 text-sm">{m.body}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message (try sending a phone number or link to test FR-CHT-2)..."
            className="flex-1 rounded-xl border border-emerald-500/30 bg-slate-950/60 px-3.5 py-2.5 text-xs"
          />
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950"
          >
            Send
          </button>
        </form>
      </div>

      <div className="lg:col-span-4 xc-glass-panel rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Notifications (WEB-1.12)</h2>
          <button
            type="button"
            onClick={async () => {
              await apiClient.markNotificationsRead();
              loadData();
            }}
            className="text-xs text-emerald-400 underline"
          >
            Mark all read
          </button>
        </div>

        {notifications.map((n) => (
          <div
            key={n.id}
            className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-xs"
          >
            <p className="font-bold text-emerald-300">{n.title}</p>
            <p className="mt-1 opacity-80">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
