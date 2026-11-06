"use client";

import React, { useEffect, useState } from "react";
import type { SafeMeetupPointDto, TradeDto } from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { emitAnalyticsEvent } from "@/lib/observability";
import { useAppContext } from "@/components/providers/AppProviders";

export default function TradesStudioPage() {
  const { pushToast } = useAppContext();
  const [trades, setTrades] = useState<TradeDto[]>([]);
  const [safePoints, setSafePoints] = useState<SafeMeetupPointDto[]>([]);

  const loadTrades = () => {
    apiClient
      .getTrades()
      .then((res) => {
        setTrades(res.items);
        setSafePoints(res.safePoints);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadTrades();
  }, []);

  const handleSchedule = async (tradeId: string, safePointId: string) => {
    await apiClient.scheduleTrade(tradeId, {
      safePointId,
      scheduledAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    emitAnalyticsEvent("trade_scheduled", { tradeId, safePointId });
    loadTrades();
    pushToast({ title: "Safe Meetup Scheduled!", tone: "success" });
  };

  const handleConfirmCode = async (tradeId: string, code: string) => {
    const res = await apiClient.confirmTradeHandover(tradeId, { handoverCode: code });
    if (res.trade.status === "completed") {
      emitAnalyticsEvent("trade_completed", { tradeId });
    }
    loadTrades();
    pushToast({
      title: `Handover Status: ${res.trade.status.toUpperCase()}`,
      description:
        res.trade.status === "completed"
          ? "Both 6-digit codes verified! Items marked Traded."
          : "First party confirmed; awaiting counterparty code.",
      tone: "success",
    });
  };

  const handleReview = async (tradeId: string) => {
    await apiClient.submitReview(tradeId, {
      stars: 5,
      tags: ["accurate_listing", "punctual", "friendly"],
      comment: "Verified at Indiranagar Metro Safe Zone!",
    });
    emitAnalyticsEvent("review_submitted", { tradeId, stars: 5 });
    loadTrades();
    pushToast({
      title: "Double-Blind Reviews Revealed! ★",
      description: "Both ratings published to public trader profiles.",
      tone: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div className="xc-glass-panel rounded-3xl p-6">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
          WEB-1.10 &amp; WEB-1.11 · TRADE STATE MACHINE, 6-DIGIT CODES &amp; DOUBLE-BLIND REVIEWS
        </span>
        <h1 className="mt-2 text-2xl font-extrabold">
          Active Trades &amp; Safe Meetup Handover Studio
        </h1>
        <p className="text-xs opacity-75">
          Accept an offer in{" "}
          <a href="/offers" className="underline text-emerald-400">
            /offers
          </a>{" "}
          to lock items and launch a live trade here.
        </p>
      </div>

      {trades.length === 0 && (
        <div className="xc-glass-panel rounded-3xl p-8 text-center">
          <p className="text-base font-bold">No Active Trades Yet</p>
          <p className="mt-1 text-xs opacity-75">
            Go to Offers Inbox and click &ldquo;Accept &amp; Lock Items&rdquo; to launch a trade.
          </p>
        </div>
      )}

      {trades.map((t) => (
        <div key={t.id} className="xc-glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/15 pb-3">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-xs font-bold text-emerald-400">
              STATUS: {t.status.toUpperCase()}
            </span>
            <span className="text-xs opacity-75">
              📍 Safe Point: {t.meetupPlace?.name || "Select below"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {t.participants.map((p) => (
              <div key={p.userId} className="rounded-2xl border border-emerald-500/25 p-3.5 text-xs">
                <p className="font-bold text-emerald-400">
                  {p.userName} ({p.status.toUpperCase()})
                </p>
                <p className="mt-1">Gives: {p.givesItemTitle}</p>
                <p className="mt-1 font-mono text-amber-300">
                  6-Digit Handover Code: <strong>{p.handoverCodeDemo}</strong>
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {safePoints.slice(0, 2).map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => handleSchedule(t.id, sp.id)}
                className="rounded-xl border border-emerald-500/30 px-3 py-1.5 text-xs"
              >
                Schedule @ {sp.neighbourhood}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleConfirmCode(t.id, "849201")}
              className="rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950"
            >
              Verify Code 1 (849201)
            </button>
            <button
              type="button"
              onClick={() => handleConfirmCode(t.id, "512904")}
              className="rounded-xl bg-teal-400 px-3.5 py-1.5 text-xs font-bold text-slate-950"
            >
              Verify Code 2 (512904)
            </button>
            <button
              type="button"
              onClick={() => handleReview(t.id)}
              className="rounded-xl border border-amber-400/50 bg-amber-500/15 px-3.5 py-1.5 text-xs font-bold text-amber-300"
            >
              ★ Submit 5-Star Double-Blind Review
            </button>
          </div>

          <div className="rounded-2xl bg-slate-950/50 p-3 text-xs font-mono space-y-1">
            <p className="text-[11px] uppercase text-emerald-400">
              Append-Only trade_events Audit Log:
            </p>
            {t.events.map((ev) => (
              <p key={ev.id}>
                [{ev.type}] by {ev.actorName} at {new Date(ev.at).toLocaleTimeString()}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
