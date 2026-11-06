"use client";

import React, { useEffect, useState } from "react";
import {
  I18N_DICTIONARY,
  type DeliveryPartnerQuoteDto,
  type ScaleOverviewResponse,
  type SupportedLocale,
} from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { useAppContext } from "@/components/providers/AppProviders";

export default function ScalePhase5Page() {
  const { pushToast } = useAppContext();
  const [locale, setLocale] = useState<SupportedLocale>("en-IN");
  const [overview, setOverview] = useState<ScaleOverviewResponse | null>(null);
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryPartnerQuoteDto | null>(null);

  const loadScale = () => {
    apiClient
      .getScaleOverview()
      .then((res) => setOverview(res))
      .catch(() => {});
  };

  useEffect(() => {
    loadScale();
  }, []);

  const t = I18N_DICTIONARY[locale];

  const handleEnableCity = async (slug: string) => {
    await apiClient.enableSecondCity(slug);
    loadScale();
    pushToast({
      title: `City Cluster Enabled: ${slug.toUpperCase()}`,
      description: "Multi-city SEO sitemap & per-city feature flags activated (WEB-5.2).",
      tone: "success",
    });
  };

  const handleConfirmStep = async (step: 1 | 2 | 3 | 4) => {
    await apiClient.confirmFourWayChainStep(step);
    loadScale();
    pushToast({
      title: `4-Way Handover Step ${step} Confirmed!`,
      description: "Coordinated 4-party timeline updated (WEB-5.3).",
      tone: "success",
    });
  };

  const handleBulkUpload = async () => {
    const res = await apiClient.bulkUploadBusinessListings({
      businessName: "Bengaluru Circular Tech Refurbishers",
      gstin: "29AAACX4298F1Z5",
      items: [
        {
          title: "Refurbished ThinkPad X1 Carbon Gen 10 (Batch #1)",
          categorySlug: "workstation-audio",
          estValueInr: 48000,
          wantsKeyword: "iPad Pro / Mirrorless Cameras",
        },
        {
          title: "Dell UltraSharp 27\" 4K USB-C Hub Monitor (Batch #2)",
          categorySlug: "workstation-audio",
          estValueInr: 26000,
          wantsKeyword: "Mechanical Keyboards / Audio Gear",
        },
      ],
    });
    loadScale();
    pushToast({
      title: `B2B Bulk Upload Complete (+${res.createdCount} Listings)`,
      description: `Total B2B surplus items: ${res.businessListingsCreated} (WEB-5.4).`,
      tone: "success",
    });
  };

  const handleTuneWeights = async () => {
    await apiClient.runWeightTuningJob(74, 22);
    loadScale();
    pushToast({
      title: "ML Matching Weights Calibrated (BE-5.5)",
      description: "Logistic regression weights updated from accepted vs rejected outcomes.",
      tone: "info",
    });
  };

  return (
    <div className="space-y-6">
      <div className="xc-glass-panel rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
            PHASE 5 (v1.5–v2.0) · KANNADA &amp; HINDI i18n, MULTI-CITY, 4-WAY CHAINS &amp; B2B SCALE
          </span>
          <h1 className="mt-2 text-2xl font-extrabold">{t.tagline}</h1>
          <p className="text-sm opacity-80">{t.subtitle}</p>
          <p className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
            {t.notificationSample}
          </p>
        </div>

        <div className="flex gap-1.5 rounded-2xl border border-emerald-500/30 p-1">
          {(["en-IN", "kn-IN", "hi-IN"] as const).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocale(loc)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold ${
                locale === loc ? "bg-emerald-500 text-slate-950" : "opacity-75"
              }`}
            >
              {I18N_DICTIONARY[loc].languageLabel}
            </button>
          ))}
        </div>
      </div>

      {overview && (
        <div className="xc-glass-panel rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-bold">Multi-City Cluster Expansion &amp; Feature Flags (WEB-5.2)</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {overview.cities.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-emerald-500/25 p-4 flex flex-col justify-between space-y-3 text-xs"
              >
                <div>
                  <div className="flex justify-between font-bold">
                    <span className="text-sm text-emerald-400">{c.name}</span>
                    <span>{c.enabled ? "🟢 LIVE" : "🟡 WAITLIST"}</span>
                  </div>
                  <p className="mt-1 opacity-75">Clusters: {c.neighbourhoods.join(", ")}</p>
                  <p className="mt-1 font-mono">
                    {c.activeListingsCount} listings · {c.completedChainsCount} chains
                  </p>
                </div>
                {!c.enabled && (
                  <button
                    type="button"
                    onClick={() => handleEnableCity(c.slug)}
                    className="rounded-xl bg-emerald-500 py-2 font-bold text-slate-950"
                  >
                    Launch {c.name} Cluster →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {overview && (
        <div className="xc-glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">
                4-Party Exchange Cycle (A → B → C → D → A) &amp; Coordinated Handover (WEB-5.3)
              </h2>
              <p className="text-xs opacity-75">
                📍 {overview.fourWayChain.meetupHub} · Status:{" "}
                <strong className="text-emerald-400">
                  {overview.fourWayChain.status.toUpperCase()}
                </strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {overview.fourWayChain.nodes.map((node) => (
              <div
                key={node.code}
                className="rounded-2xl border border-emerald-500/25 bg-slate-950/50 p-3.5 space-y-2 text-xs"
              >
                <div className="flex justify-between font-bold text-emerald-400">
                  <span>
                    Step {node.handoverStep}: Node {node.code}
                  </span>
                  <span>Trust v2: {node.trustScoreV2}</span>
                </div>
                <p className="font-bold">{node.traderName}</p>
                <p className="opacity-80">Gives: {node.givesTitle}</p>
                <p className="font-mono text-amber-300">
                  Receives from {node.receivesFromCode} · Code: {node.handoverCode}
                </p>
                <button
                  type="button"
                  disabled={node.confirmed}
                  onClick={() => handleConfirmStep(node.handoverStep)}
                  className={`w-full rounded-xl py-1.5 font-bold ${
                    node.confirmed
                      ? "border border-emerald-500/40 text-emerald-400"
                      : "bg-emerald-500 text-slate-950"
                  }`}
                >
                  {node.confirmed ? "✓ Step Confirmed" : `Confirm Step ${node.handoverStep}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="xc-glass-panel rounded-3xl p-5 space-y-3 text-xs">
          <h3 className="text-sm font-bold">Business Account &amp; Bulk Upload (WEB-5.4)</h3>
          <p className="opacity-75">
            Active B2B listings:{" "}
            <strong className="text-emerald-400">{overview?.businessListingsCreated ?? 6}</strong>
          </p>
          <button
            type="button"
            onClick={handleBulkUpload}
            className="w-full rounded-xl bg-emerald-500 py-2 font-bold text-slate-950"
          >
            + Bulk Upload 2 B2B Refurbished Items
          </button>
        </div>

        <div className="xc-glass-panel rounded-3xl p-5 space-y-3 text-xs">
          <h3 className="text-sm font-bold">Delivery Partner Referral (BE-5.3)</h3>
          <button
            type="button"
            onClick={async () => {
              const res = await apiClient.requestDeliveryQuote(4.6);
              setDeliveryQuote(res.quote);
            }}
            className="w-full rounded-xl border border-emerald-500/40 bg-emerald-500/15 py-2 font-bold text-emerald-300"
          >
            Get Hyperlocal Courier Quote (4.6 km)
          </button>
          {deliveryQuote && (
            <p className="font-mono text-emerald-300">
              {deliveryQuote.partnerName}: ₹{deliveryQuote.estimatedPartnerFeeInr} (Xchange 10%
              referral: ₹{deliveryQuote.platformReferralCommissionInr}) · ETA{" "}
              {deliveryQuote.etaMinutes}m
            </p>
          )}
        </div>

        <div className="xc-glass-panel rounded-3xl p-5 space-y-3 text-xs">
          <h3 className="text-sm font-bold">ML Weight Tuning Pipeline (BE-5.5)</h3>
          {overview && (
            <p className="font-mono text-[11px] text-emerald-300">
              I:{overview.tunedWeights.itemPreferenceWeight} · V:
              {overview.tunedWeights.valueCompatibilityWeight} · L:
              {overview.tunedWeights.locationProximityWeight} · C:
              {overview.tunedWeights.conditionCompatibilityWeight} · P:
              {overview.tunedWeights.userPreferencesWeight}
            </p>
          )}
          <button
            type="button"
            onClick={handleTuneWeights}
            className="w-full rounded-xl border border-amber-400/50 bg-amber-500/15 py-2 font-bold text-amber-300"
          >
            Run Logistic Weight Calibration Job
          </button>
        </div>
      </div>
    </div>
  );
}
