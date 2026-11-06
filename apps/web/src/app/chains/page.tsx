"use client";

import React, { useEffect, useState } from "react";
import type { ChainProposalDto, ChainsTelemetryDto } from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { emitAnalyticsEvent } from "@/lib/observability";
import { useAppContext } from "@/components/providers/AppProviders";

export default function ChainsLifecyclePage() {
  const { pushToast } = useAppContext();
  const [proposals, setProposals] = useState<ChainProposalDto[]>([]);
  const [telemetry, setTelemetry] = useState<ChainsTelemetryDto | null>(null);

  const loadChains = () => {
    apiClient
      .getChainProposals()
      .then((res) => {
        setProposals(res.proposals);
        setTelemetry(res.telemetry);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadChains();
  }, []);

  const handleAccept = async (chainId: string) => {
    const res = await apiClient.acceptChainProposal(chainId, "C");
    setTelemetry(res.telemetry);
    emitAnalyticsEvent("chain_accepted", { chainId });
    loadChains();
    pushToast({
      title: "Unanimous 3-Way Consent Reached! 🔒",
      description: `All 3 items locked in ID order (${res.proposal.itemsLockedInOrder.length} items).`,
      tone: "success",
    });
  };

  const handleDecline = async (chainId: string) => {
    const res = await apiClient.declineChainProposal(chainId, "C");
    setTelemetry(res.telemetry);
    emitAnalyticsEvent("chain_dissolved", { chainId });
    loadChains();
    pushToast({
      title: "Chain Dissolved with Zero Penalty",
      description: "All items remain unlocked and active.",
      tone: "warning",
    });
  };

  const handleConfirmLeg = async (chainId: string, legPosition: 1 | 2 | 3, code: string) => {
    const res = await apiClient.confirmChainHandoff(chainId, {
      legPosition,
      handoverCode: code,
    });
    setTelemetry(res.telemetry);
    if (res.proposal.status === "completed") {
      emitAnalyticsEvent("chain_completed", { chainId });
    }
    loadChains();
    pushToast({
      title:
        res.proposal.status === "completed"
          ? "3-Way Chain Exchange Completed! 🎉"
          : `Leg ${legPosition} Confirmed (${code})`,
      tone: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div className="xc-glass-panel rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
            PHASE 4 (v1.0) · 3-WAY CHAIN LIFECYCLE, ORDERED LOCKING &amp; HANDOFF CODES
          </span>
          <h1 className="mt-2 text-2xl font-extrabold">
            3-Party Chain Proposals &amp; Handover Coordinator
          </h1>
        </div>

        {telemetry && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-right">
            <p className="text-[11px] uppercase opacity-75">
              Phase 4 Exit Gate (≥ 10 Chains · &gt; 60% Completion)
            </p>
            <p className="text-lg font-extrabold text-emerald-400">
              {telemetry.completedChainsCount} Completed · {telemetry.chainCompletionRatePercent}%
              Rate {telemetry.phase4ExitGatePassed ? "✓ PASSED" : ""}
            </p>
          </div>
        )}
      </div>

      {proposals.map((p) => (
        <div key={p.id} className="xc-glass-panel rounded-3xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/15 pb-3">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-xs font-bold text-emerald-400">
              CHAIN {p.id.toUpperCase()} · STATUS: {p.status.toUpperCase()} · MIN EDGE{" "}
              {p.minEdgeScore}%
            </span>
            <span className="text-xs font-mono text-amber-300">
              ⏳ {p.expiresInHours}h remaining · 📍 {p.centroidSafePoint.name}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            {(["A", "B", "C"] as const).map((code) => (
              <div
                key={code}
                className="rounded-2xl border border-emerald-500/25 bg-slate-950/50 p-3 flex items-center justify-between"
              >
                <span className="font-bold">Participant {code}</span>
                <span className="font-mono uppercase text-emerald-400">{p.acceptances[code]}</span>
              </div>
            ))}
          </div>

          {p.status === "proposed" && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleAccept(p.id)}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950"
              >
                ✓ Accept as Trader C (Trigger Unanimous Ordered Lock)
              </button>
              <button
                type="button"
                onClick={() => handleDecline(p.id)}
                className="rounded-xl border border-red-500/40 px-4 py-2.5 text-xs text-red-300"
              >
                ✕ Decline (Dissolve with Zero Penalty)
              </button>
            </div>
          )}

          {p.itemsLockedInOrder.length > 0 && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 font-mono text-xs text-emerald-300">
              🔒 Deadlock-Free Ordered Lock Active: {p.itemsLockedInOrder.join(" → ")}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {p.legs.map((leg) => (
              <div
                key={leg.position}
                className="rounded-2xl border border-emerald-500/25 p-4 space-y-2 text-xs"
              >
                <div className="flex justify-between font-bold text-emerald-400">
                  <span>
                    Leg {leg.position}: {leg.fromCode} → {leg.toCode}
                  </span>
                  <span>{leg.status.toUpperCase()}</span>
                </div>
                <p className="font-semibold">{leg.itemTitle}</p>
                <p className="font-mono text-amber-300">
                  Cash: ₹{leg.cashDeltaInr} · Code: <strong>{leg.handoverCodeDemo}</strong>
                </p>
                {leg.status !== "confirmed" && p.status !== "dissolved" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleConfirmLeg(p.id, leg.position, leg.handoverCodeDemo)
                    }
                    className="w-full rounded-xl bg-emerald-500 py-2 font-bold text-slate-950"
                  >
                    Verify Leg {leg.position} ({leg.handoverCodeDemo})
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
