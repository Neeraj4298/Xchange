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
    <section className="xc-glass-panel p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <span className="inline-block rounded-full bg-[var(--brand-tint)] px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
            SIGNATURE EXPERIENCE · 3-WAY EXCHANGE CHAIN ({expiresInHours}H WINDOW)
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">
            Three-Person Exchange Chain (A → B → C → A)
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            A chain never locks items until every participant explicitly approves the same proposal.
          </p>
        </div>

        <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-right">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
            Chain Status
          </p>
          <p
            className="text-sm font-semibold"
            style={{ color: allAccepted ? "var(--success)" : "var(--brand-primary)" }}
          >
            {allAccepted ? "Confirmed · All 3 Items Reserved" : "Awaiting Unanimous Consent (2/3)"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
        <div className="lg:col-span-6 flex flex-col items-center rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
          <CycleSvgGraph activeCode={activeCode} onSelectNode={setActiveCode} liveScore={liveScore} />
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
              <span>
                PARTICIPANT {selectedNode.participantCode} · {selectedNode.neighbourhood.toUpperCase()}
              </span>
              <span>Rating {selectedNode.rating} ★</span>
            </div>
            <h3 className="mt-1 font-heading text-lg font-bold">{selectedNode.userName}</h3>
            <p className="mt-2 text-sm">
              <span className="font-semibold text-[var(--foreground)]">Gives:</span>{" "}
              {selectedNode.givesItemTitle} ({selectedNode.givesValueRangeInr})
            </p>
            <p className="mt-1 text-sm">
              <span className="font-semibold text-[var(--brand-primary)]">
                Receives from {selectedNode.receivesFromCode}:
              </span>{" "}
              {selectedNode.wantsDescription}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["A", "B", "C"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => toggleConsent(code)}
                className={`rounded-[12px] border p-3 text-left transition-colors ${
                  accepted[code]
                    ? "border-[var(--brand-primary)] bg-[var(--brand-tint)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Participant {code}</span>
                  <span
                    style={{
                      color: accepted[code] ? "var(--success)" : "var(--warning)",
                    }}
                  >
                    {accepted[code] ? "Approved" : "Pending"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[var(--muted)]">Click to toggle</p>
              </button>
            ))}
          </div>

          <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex justify-between text-xs font-medium">
              <span>Suggested cash adjustment</span>
              <span className="font-semibold text-[var(--brand-primary)]">₹{cashSlider}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5000}
              step={250}
              value={cashSlider}
              onChange={(e) => setCashSlider(Number(e.target.value))}
              aria-label="Suggested cash adjustment"
              className="mt-2 w-full accent-[#7167E8]"
            />
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Safe handover point: <strong>{meetupPointName}</strong> ({meetupDistanceKm} km away)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
