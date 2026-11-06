"use client";

import React, { useState } from "react";
import { computeMatchScore, type ChainCycleNodeDto } from "@xchange/shared";
import { emitAnalyticsEvent } from "@/lib/observability";
import { useAppContext } from "@/components/providers/AppProviders";
import { CycleSvgGraph } from "./CycleSvgGraph";

interface Props {
  nodes: ChainCycleNodeDto[];
  meetupPointName: string;
  meetupDistanceKm: number;
  expiresInHours: number;
}

export function ThreeWayCycleStudio({
  nodes,
  meetupPointName,
  meetupDistanceKm,
  expiresInHours,
}: Props) {
  const { pushToast } = useAppContext();
  const [activeCode, setActiveCode] = useState<"A" | "B" | "C">("A");
  const [accepted, setAccepted] = useState<Record<"A" | "B" | "C", boolean>>({
    A: true,
    B: true,
    C: false,
  });
  const [cashSlider, setCashSlider] = useState<number>(2000);

  const selectedNode = nodes.find((n) => n.participantCode === activeCode) || nodes[0]!;
  const allAccepted = accepted.A && accepted.B && accepted.C;

  const liveScore = computeMatchScore({
    itemPreference: 96,
    valueCompatibility: Math.min(100, 88 + Math.round(cashSlider / 400)),
    locationProximity: 94,
    conditionCompatibility: 92,
    userPreferences: 95,
  });

  const toggleConsent = (code: "A" | "B" | "C") => {
    setAccepted((prev) => {
      const next = { ...prev, [code]: !prev[code] };
      const unanimous = next.A && next.B && next.C;
      emitAnalyticsEvent(unanimous ? "chain_accepted" : "chain_proposed", {
        participantCode: code,
        unanimous,
      });
      pushToast({
        title: unanimous
          ? "Unanimous 3-Way Consent! Items Locked"
          : `Trader ${code}: ${next[code] ? "Accepted" : "Pending"}`,
        description: unanimous
          ? "All 3 items locked in ID order. Handover codes issued."
          : "Consent-before-lock: no item locks until all 3 accept.",
        tone: unanimous ? "success" : "info",
      });
      return next;
    });
  };

  return (
    <section className="xc-glass-panel rounded-3xl p-5 md:p-8 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/15 pb-5">
        <div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
            LIVE 3-WAY CYCLE ENGINE · {expiresInHours}h TTL · Score {liveScore}%
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Interactive 3-Party Exchange Cycle (A → B → C → A)
          </h2>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-right">
          <p className="text-[11px] uppercase opacity-75">Lock State</p>
          <p className="text-sm font-bold text-emerald-400">
            {allAccepted ? "🔒 ALL 3 ITEMS LOCKED" : "⏳ AWAITING UNANIMOUS CONSENT"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 items-center">
        <div className="lg:col-span-6 flex flex-col items-center">
          <CycleSvgGraph activeCode={activeCode} onSelectNode={setActiveCode} liveScore={liveScore} />
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span>Node {selectedNode.participantCode} · {selectedNode.neighbourhood}</span>
              <span>★ {selectedNode.rating}</span>
            </div>
            <h3 className="mt-1 text-lg font-bold">{selectedNode.userName}</h3>
            <p className="mt-1 text-sm">
              <strong className="text-emerald-400">Gives:</strong> {selectedNode.givesItemTitle} (
              {selectedNode.givesValueRangeInr})
            </p>
            <p className="mt-1 text-sm">
              <strong className="text-amber-400">Receives from {selectedNode.receivesFromCode}:</strong>{" "}
              {selectedNode.wantsDescription}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {(["A", "B", "C"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => toggleConsent(code)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  accepted[code]
                    ? "border-emerald-500/50 bg-emerald-500/15"
                    : "border-amber-500/40 bg-amber-500/10"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Trader {code}</span>
                  <span>{accepted[code] ? "✓" : "⏳"}</span>
                </div>
                <p className="mt-1 text-[11px] opacity-75">Toggle consent</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-emerald-500/15 p-3.5">
            <div className="flex justify-between text-xs">
              <span>Peer Cash Balancer (Metadata Only, Max ₹5,000)</span>
              <span className="font-mono font-bold text-emerald-400">₹{cashSlider}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5000}
              step={250}
              value={cashSlider}
              onChange={(e) => setCashSlider(Number(e.target.value))}
              aria-label="Peer cash balancer"
              className="mt-2 w-full accent-emerald-500"
            />
            <p className="mt-1 text-[11px] opacity-70">
              📍 Safe Meetup: <strong>{meetupPointName}</strong> ({meetupDistanceKm} km)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
