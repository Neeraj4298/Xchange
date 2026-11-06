"use client";

import React, { useEffect, useState } from "react";
import { formatInrFromPaise, type MarketplaceItemDto } from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { emitAnalyticsEvent } from "@/lib/observability";
import { useAppContext } from "@/components/providers/AppProviders";
import { MatchesForYouRail } from "@/components/matching/MatchesForYouRail";

export default function DiscoveryFeedPage() {
  const { pushToast } = useAppContext();
  const [items, setItems] = useState<MarketplaceItemDto[]>([]);
  const [tab, setTab] = useState<"for_you" | "nearby" | "new">("for_you");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");

  const loadFeed = () => {
    apiClient
      .getFeed({ tab, q, category })
      .then((res) => setItems(res.items))
      .catch(() => {});
  };

  useEffect(() => {
    emitAnalyticsEvent("feed_viewed", { tab, category });
    loadFeed();
  }, [tab, category]);

  const handleToggleSave = async (itemId: string) => {
    try {
      const res = await apiClient.toggleSaveItem(itemId);
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, savedByMe: res.saved } : i))
      );
      pushToast({ title: res.saved ? "Saved ♥" : "Removed from Wishlist" });
    } catch {}
  };

  const handleQuickOffer = async (target: MarketplaceItemDto) => {
    const myOffered = items.find((i) => i.id !== target.id) || items[0];
    if (!myOffered) return;
    try {
      await apiClient.createOffer({
        recipientItemId: target.id,
        offeredItemIds: [myOffered.id],
        cash: { amountPaise: 150000, direction: "proposer_pays" },
        message: "Happy to meet at Indiranagar Metro Safe Zone!",
      });
      emitAnalyticsEvent("offer_sent", { recipientItemId: target.id });
      pushToast({
        title: "Swap Offer Sent! (72h Expiry)",
        description: `Offered ${myOffered.title.slice(0, 22)}... + ₹1,500 peer cash.`,
        tone: "success",
      });
    } catch (err) {
      pushToast({
        title: "Offer Error",
        description: err instanceof Error ? err.message : "Failed",
        tone: "danger",
      });
    }
  };

  return (
    <div className="space-y-6">
      <MatchesForYouRail />
      <div className="xc-glass-panel rounded-3xl p-6">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
          WEB-1.6 &amp; BE-1.5 · GEO + FTS DISCOVERY FEED
        </span>
        <h1 className="mt-2 text-2xl font-extrabold">Bengaluru Exchange Discovery</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["for_you", "nearby", "new"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase ${
                tab === t ? "bg-emerald-500 text-slate-950" : "xc-glass-panel opacity-75"
              }`}
            >
              {t.replace("_", " ")}
            </button>
          ))}
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search items, wants, or neighbourhoods..."
            className="flex-1 rounded-xl border border-emerald-500/30 bg-slate-950/60 px-4 py-1.5 text-xs"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category"
            className="rounded-xl border border-emerald-500/30 bg-slate-950/80 px-3 py-1.5 text-xs"
          >
            <option value="all">All Categories</option>
            <option value="cameras-lenses">Cameras &amp; Lenses</option>
            <option value="musical-instruments">Musical Instruments</option>
            <option value="workstation-audio">Workstation &amp; Audio</option>
            <option value="gaming-consoles">Gaming &amp; Consoles</option>
          </select>
          <button
            type="button"
            onClick={loadFeed}
            className="rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950"
          >
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="xc-glass-panel xc-card-lift rounded-3xl p-5 flex flex-col justify-between"
          >
            <div>
              <div
                className={`h-24 rounded-2xl bg-gradient-to-br ${item.imageGradient} p-3 flex justify-between items-start border border-white/10`}
              >
                <span className="rounded-full bg-slate-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                  Match {item.matchScore}% · 📍 {item.neighbourhood}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleSave(item.id)}
                  className="rounded-full bg-slate-950/80 px-2.5 py-0.5 text-xs"
                >
                  {item.savedByMe ? "♥" : "♡"}
                </button>
              </div>
              <h2 className="mt-3 text-base font-bold">{item.title}</h2>
              <p className="mt-1 text-xs opacity-75">{item.description}</p>
              <p className="mt-2 font-mono text-xs font-bold text-emerald-400">
                Est. Range: {formatInrFromPaise(item.estValueMinPaise)} –{" "}
                {formatInrFromPaise(item.estValueMaxPaise)}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-emerald-500/15 pt-3">
              <span className="text-xs font-semibold">
                {item.ownerName} · ★ {item.ownerRating}
              </span>
              <button
                type="button"
                onClick={() => handleQuickOffer(item)}
                className="rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950"
              >
                Make Offer ⇄
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
