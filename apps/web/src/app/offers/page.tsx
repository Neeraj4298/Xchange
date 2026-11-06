"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatInrFromPaise, type OfferDto } from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { emitAnalyticsEvent } from "@/lib/observability";
import { useAppContext } from "@/components/providers/AppProviders";

export default function OffersInboxPage() {
  const router = useRouter();
  const { pushToast } = useAppContext();
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [tab, setTab] = useState<string>("all");

  const loadOffers = () => {
    apiClient
      .getOffers(tab === "all" ? undefined : tab)
      .then((res) => setOffers(res.items))
      .catch(() => {});
  };

  useEffect(() => {
    loadOffers();
  }, [tab]);

  const handleCounter = async (offer: OfferDto) => {
    try {
      await apiClient.counterOffer(offer.id, {
        cash: { amountPaise: offer.cashPaise + 100000, direction: "recipient_pays" },
        message: `Counteroffer v${offer.version + 1}: Adding ₹1,000 adjustment.`,
      });
      emitAnalyticsEvent("offer_countered", { offerId: offer.id });
      loadOffers();
      pushToast({
        title: `Counteroffer v${offer.version + 1} Created`,
        description: "Previous version marked Countered; new pending version active.",
      });
    } catch (err) {
      pushToast({
        title: "Counter Error",
        description: err instanceof Error ? err.message : "Failed",
        tone: "danger",
      });
    }
  };

  const handleAccept = async (offer: OfferDto) => {
    try {
      const res = await apiClient.acceptOffer(offer.id);
      emitAnalyticsEvent("offer_accepted", { offerId: offer.id, tradeId: res.trade.id });
      pushToast({
        title: "Offer Accepted! Both Items Locked Atomically 🔒",
        description: "Redirecting to Trade Handover Studio...",
        tone: "success",
      });
      router.push("/trades");
    } catch (err) {
      pushToast({
        title: "Accept Error (409 ITEM_LOCKED)",
        description: err instanceof Error ? err.message : "Cannot accept",
        tone: "danger",
      });
    }
  };

  const handleReject = async (offer: OfferDto) => {
    await apiClient.rejectOffer(offer.id);
    emitAnalyticsEvent("offer_rejected", { offerId: offer.id });
    loadOffers();
    pushToast({ title: "Offer Rejected" });
  };

  return (
    <div className="space-y-6">
      <div className="xc-glass-panel rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
            WEB-1.8 &amp; BE-1.6 · OFFERS INBOX &amp; NEGOTIATION THREADS
          </span>
          <h1 className="mt-2 text-2xl font-extrabold">Offers &amp; Counteroffers</h1>
        </div>
        <div className="flex gap-1.5 rounded-2xl border border-emerald-500/25 p-1">
          {["all", "accepted", "closed"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase ${
                tab === t ? "bg-emerald-500 text-slate-950" : "opacity-75"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {offers.map((o) => (
          <div key={o.id} className="xc-glass-panel rounded-3xl p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/15 pb-3">
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-400">
                v{o.version} · {o.status.toUpperCase()} · {o.proposerName} → {o.recipientName}
              </span>
              <span className="font-mono text-xs text-amber-300">
                Cash: {formatInrFromPaise(o.cashPaise)} ({o.cashDirection.replace("_", " ")})
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-3">
                <p className="text-[11px] uppercase opacity-70">Offered by {o.proposerName}</p>
                <p className="text-sm font-bold">{o.offeredItems.map((i) => i.title).join(" + ")}</p>
              </div>
              <div className="rounded-2xl border border-cyan-500/25 bg-cyan-950/20 p-3">
                <p className="text-[11px] uppercase opacity-70">Requested from {o.recipientName}</p>
                <p className="text-sm font-bold">{o.recipientItem.title}</p>
              </div>
            </div>

            <p className="text-xs italic opacity-85">&ldquo;{o.message}&rdquo;</p>

            {o.status === "pending" && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAccept(o)}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950"
                >
                  ✓ Accept &amp; Lock Items
                </button>
                <button
                  type="button"
                  onClick={() => handleCounter(o)}
                  className="rounded-xl border border-amber-400/50 bg-amber-500/15 px-4 py-2 text-xs font-bold text-amber-300"
                >
                  ⇄ Counteroffer (+₹1,000)
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(o)}
                  className="rounded-xl border border-red-500/40 px-4 py-2 text-xs text-red-300"
                >
                  ✕ Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
