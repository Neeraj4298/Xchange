"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { MatchCandidateDto } from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { emitAnalyticsEvent } from "@/lib/observability";
import { useAppContext } from "@/components/providers/AppProviders";

export function MatchesForYouRail() {
  const { pushToast } = useAppContext();
  const [matches, setMatches] = useState<MatchCandidateDto[]>([]);

  useEffect(() => {
    apiClient
      .getMatches()
      .then((res) => {
        setMatches(res.items.slice(0, 3));
        if (res.items[0]) {
          emitAnalyticsEvent("match_shown", { matchId: res.items[0].id });
        }
      })
      .catch(() => {});
  }, []);

  if (matches.length === 0) return null;

  const mutual = matches.find((m) => m.isMutualMatch);

  return (
    <section className="space-y-4">
      {mutual && (
        <div className="xc-glass-panel rounded-3xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-black text-slate-950">
              ⚡ 2-WAY MUTUAL MATCH {mutual.score}%
            </span>
            <p className="text-xs md:text-sm font-semibold">
              <strong>{mutual.targetItem.ownerName}</strong> wants your{" "}
              <span className="text-emerald-400">{mutual.myItem.title.slice(0, 26)}...</span> for
              their{" "}
              <span className="text-amber-300">{mutual.targetItem.title.slice(0, 26)}...</span>
            </p>
          </div>
          <Link
            href="/matches"
            className="rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-slate-950"
          >
            Inspect Mutual Match →
          </Link>
        </div>
      )}

      <div className="xc-glass-panel rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              WEB-2.1 · SMART MATCHES FOR YOU RAIL (M = 0.30I + 0.25V + 0.20L + 0.15C + 0.10P)
            </span>
            <h2 className="text-lg font-bold">Top Recommended Swaps for Your Inventory</h2>
          </div>
          <Link href="/matches" className="text-xs font-bold text-emerald-400 underline">
            Open Full Match Studio ({matches.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {matches.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-emerald-500/25 bg-slate-950/50 p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-emerald-400">
                    Score {m.score}% {m.isMutualMatch ? "· ⚡ Mutual" : ""}
                  </span>
                  <span className="opacity-70">📍 {m.targetItem.neighbourhood}</span>
                </div>
                <p className="mt-1.5 text-sm font-bold">{m.targetItem.title}</p>
                <p className="mt-1 text-[11px] text-amber-300">{m.reasons[0]}</p>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    emitAnalyticsEvent("match_clicked", { matchId: m.id });
                    await apiClient.createOfferFromMatch(m.id, 100000);
                    emitAnalyticsEvent("offer_sent", { matchId: m.id, origin: "match" });
                    pushToast({
                      title: `1-Click Match Offer Sent (${m.score}%)`,
                      description: "Recorded with origin='match' toward Phase 2 >=30% Exit Gate!",
                      tone: "success",
                    });
                  }}
                  className="flex-1 rounded-xl bg-emerald-500 py-1.5 text-xs font-bold text-slate-950"
                >
                  1-Click Offer ⇄
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await apiClient.recordMatchFeedback(m.id, "dismissed");
                    setMatches((prev) => prev.filter((x) => x.id !== m.id));
                    pushToast({ title: "Match Dismissed", description: "Feedback logged." });
                  }}
                  className="rounded-xl border border-emerald-500/25 px-2.5 py-1.5 text-xs opacity-75 hover:opacity-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
