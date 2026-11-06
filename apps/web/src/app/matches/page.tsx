"use client";

import React, { useEffect, useState } from "react";
import {
  formatInrFromPaise,
  type MatchCandidateDto,
  type MatchingTelemetryDto,
  type SavedSearchDto,
} from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { emitAnalyticsEvent } from "@/lib/observability";
import { useAppContext } from "@/components/providers/AppProviders";

export default function SmartMatchesPage() {
  const { pushToast } = useAppContext();
  const [matches, setMatches] = useState<MatchCandidateDto[]>([]);
  const [telemetry, setTelemetry] = useState<MatchingTelemetryDto | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearchDto[]>([]);
  const [newQuery, setNewQuery] = useState("Sony FE 24-70mm / Mirrorless Lens");
  const [newRadius, setNewRadius] = useState(8);

  const loadAll = () => {
    apiClient
      .getMatches()
      .then((res) => {
        setMatches(res.items);
        setTelemetry(res.telemetry);
        res.items.forEach((m) => emitAnalyticsEvent("match_shown", { matchId: m.id }));
      })
      .catch(() => {});
    apiClient
      .getSavedSearches()
      .then((res) => setSavedSearches(res.items))
      .catch(() => {});
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleOfferFromMatch = async (m: MatchCandidateDto) => {
    emitAnalyticsEvent("match_clicked", { matchId: m.id });
    const res = await apiClient.createOfferFromMatch(m.id, 100000);
    setTelemetry(res.telemetry);
    emitAnalyticsEvent("offer_sent", { matchId: m.id, origin: "match" });
    pushToast({
      title: `Smart Match Offer Sent! (${m.score}%)`,
      description: `Recommendation Offer Share is now ${res.telemetry.recommendationOfferSharePercent}% (Exit Gate >= 30%).`,
      tone: "success",
    });
    loadAll();
  };

  const handleDismiss = async (m: MatchCandidateDto) => {
    const res = await apiClient.recordMatchFeedback(m.id, "dismissed");
    setTelemetry(res.telemetry);
    setMatches((prev) => prev.filter((x) => x.id !== m.id));
    pushToast({ title: "Match Dismissed", description: "Logged to match_feedback table." });
  };

  const handleAddSavedSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim()) return;
    await apiClient.createSavedSearch({
      query: newQuery,
      categorySlug: "cameras-lenses",
      maxDistanceKm: newRadius,
      notify: true,
    });
    setNewQuery("");
    loadAll();
    pushToast({ title: "Saved Search & Alert Created!", tone: "success" });
  };

  return (
    <div className="space-y-8">
      <div className="xc-glass-panel rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
            PHASE 2 (v0.2) · SMART MATCHING LITE &amp; SAVED SEARCH ALERTS
          </span>
          <h1 className="mt-2 text-2xl font-extrabold">
            Smart Matching Engine &amp; 2-Way Mutual Swaps
          </h1>
          <p className="text-xs opacity-75">
            Formula: M = 0.30·I + 0.25·V + 0.20·L + 0.15·C + 0.10·P
          </p>
        </div>

        {telemetry && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-right">
            <p className="text-[11px] uppercase opacity-75">Phase 2 Exit Gate (≥ 30% From Match)</p>
            <p className="text-lg font-extrabold text-emerald-400">
              {telemetry.recommendationOfferSharePercent}% From Recommendations{" "}
              {telemetry.phase2ExitGatePassed ? "✓ PASSED" : ""}
            </p>
            <p className="text-[11px] opacity-75">
              {telemetry.matchOriginatedOffersCount}/{telemetry.totalOffersCount} offers ·{" "}
              {telemetry.mutualMatchesCount} Mutual Matches
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {matches.map((m) => (
          <article
            key={m.id}
            className="xc-glass-panel xc-card-lift rounded-3xl p-5 space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    m.isMutualMatch
                      ? "bg-amber-400 text-slate-950"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {m.isMutualMatch ? `⚡ 2-WAY MUTUAL · ${m.score}%` : `SMART MATCH · ${m.score}%`}
                </span>
                <span className="font-mono text-xs opacity-75">
                  📍 {m.targetItem.neighbourhood} ({m.targetItem.distanceKm} km)
                </span>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/50 p-3 text-xs space-y-1">
                <p className="opacity-70">You Give: {m.myItem.title}</p>
                <p className="text-sm font-bold text-emerald-400">
                  You Receive: {m.targetItem.title}
                </p>
                <p className="font-mono opacity-80">
                  Est. Range: {formatInrFromPaise(m.targetItem.estValueMinPaise)} –{" "}
                  {formatInrFromPaise(m.targetItem.estValueMaxPaise)}
                </p>
              </div>

              <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[10px]">
                <div className="rounded-lg bg-emerald-500/10 p-1">
                  I(30%)<br />
                  <strong className="text-emerald-400">{m.factors.itemPreference}</strong>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-1">
                  V(25%)<br />
                  <strong className="text-emerald-400">{m.factors.valueCompatibility}</strong>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-1">
                  L(20%)<br />
                  <strong className="text-emerald-400">{m.factors.locationProximity}</strong>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-1">
                  C(15%)<br />
                  <strong className="text-emerald-400">{m.factors.conditionCompatibility}</strong>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-1">
                  P(10%)<br />
                  <strong className="text-emerald-400">{m.factors.userPreferences}</strong>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {m.reasons.map((r) => (
                  <span
                    key={r}
                    className="rounded-lg border border-emerald-500/25 px-2 py-0.5 text-[11px]"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleOfferFromMatch(m)}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-2 text-xs font-bold text-slate-950"
              >
                {m.convertedOfferId ? "✓ Offer Sent" : "1-Click Match Offer ⇄"}
              </button>
              <button
                type="button"
                onClick={() => handleDismiss(m)}
                className="rounded-xl border border-red-500/35 px-3 py-2 text-xs text-red-300"
              >
                Dismiss
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="xc-glass-panel rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Saved Searches &amp; Alert Toggles (WEB-2.3)</h2>
        <form onSubmit={handleAddSavedSearch} className="flex flex-wrap gap-2">
          <input
            type="text"
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            placeholder="Save a keyword alert (e.g. Sony Lens, Keychron, Stratocaster)..."
            className="flex-1 rounded-xl border border-emerald-500/30 bg-slate-950/60 px-4 py-2 text-xs"
          />
          <input
            type="number"
            min={2}
            max={25}
            value={newRadius}
            onChange={(e) => setNewRadius(Number(e.target.value))}
            aria-label="Radius km"
            className="w-20 rounded-xl border border-emerald-500/30 bg-slate-950/60 px-3 py-2 font-mono text-xs"
          />
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950"
          >
            + Save Search Alert
          </button>
        </form>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {savedSearches.map((ss) => (
            <div
              key={ss.id}
              className="rounded-2xl border border-emerald-500/25 p-3.5 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-emerald-400">{ss.query}</p>
                <p className="opacity-75">
                  Radius ≤ {ss.maxDistanceKm} km · {ss.matchingItemsCount} active matches
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await apiClient.toggleSavedSearchAlert(ss.id);
                    loadAll();
                  }}
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 font-bold text-emerald-300"
                >
                  {ss.notify ? "🔔 Alerts ON" : "🔕 Muted"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await apiClient.deleteSavedSearch(ss.id);
                    loadAll();
                  }}
                  className="rounded-xl border border-red-500/30 px-2.5 py-1.5 text-red-300"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
