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
        <div className="xc-glass-panel p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: "rgba(32, 167, 134, 0.12)",
                color: "var(--success)",
              }}
            >
              2-Way Mutual Match · {mutual.score}%
            </span>
            <p className="text-xs md:text-sm font-medium text-[var(--foreground)]">
              <strong>{mutual.targetItem.ownerName}</strong> wants your{" "}
              <span className="font-semibold text-[var(--brand-primary)]">
                {mutual.myItem.title.slice(0, 26)}...
              </span>{" "}
              for their{" "}
              <span className="font-semibold">{mutual.targetItem.title.slice(0, 26)}...</span>
            </p>
          </div>
          <Link href="/matches" className="xc-btn-primary px-4 py-2 text-xs">
            View exchange →
          </Link>
        </div>
      )}

      <div className="xc-glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
              MATCHES FOR YOUR ITEMS
            </span>
            <h2 className="mt-1 font-heading text-lg font-bold">
              Recommended swaps based on what you own
            </h2>
          </div>
          <Link href="/matches" className="text-xs font-semibold text-[var(--brand-primary)] hover:underline">
            View all ({matches.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {matches.map((m) => (
            <div
              key={m.id}
              className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className="font-semibold"
                    style={{ color: "var(--success)" }}
                  >
                    Good match · {m.score}%
                  </span>
                  <span className="text-[var(--muted)]">{m.targetItem.neighbourhood}</span>
                </div>
                <p className="mt-2 font-heading text-base font-semibold">{m.targetItem.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{m.reasons[0]}</p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    emitAnalyticsEvent("match_clicked", { matchId: m.id });
                    await apiClient.createOfferFromMatch(m.id, 100000);
                    emitAnalyticsEvent("offer_sent", { matchId: m.id, origin: "match" });
                    pushToast({
                      title: `Offer sent (${m.score}% match)`,
                      description: "Exchange proposal created.",
                    });
                  }}
                  className="xc-btn-primary flex-1 py-2 text-xs"
                >
                  Make an offer
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await apiClient.recordMatchFeedback(m.id, "dismissed");
                    setMatches((prev) => prev.filter((x) => x.id !== m.id));
                    pushToast({ title: "Match dismissed" });
                  }}
                  className="xc-btn-secondary px-3 py-2 text-xs"
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
