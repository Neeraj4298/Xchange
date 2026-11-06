"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { DiscoveryShowcaseResponse } from "@xchange/api-sdk";
import { apiClient, FALLBACK_SHOWCASE } from "@/lib/api-client";
import { emitAnalyticsEvent } from "@/lib/observability";
import { ThreeWayCycleStudio } from "@/components/chain/ThreeWayCycleStudio";
import { FeaturedListingsGrid } from "@/components/listing/FeaturedListingsGrid";

export default function HomePage() {
  const [showcase, setShowcase] = useState<DiscoveryShowcaseResponse>(FALLBACK_SHOWCASE);

  useEffect(() => {
    emitAnalyticsEvent("feed_viewed", { cluster: "bengaluru" });
    apiClient
      .getShowcase()
      .then((data) => setShowcase(data))
      .catch(() => {
        // Fallback showcase already loaded
      });
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/60 via-slate-950/80 to-teal-950/50 p-6 md:p-10 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <span>⚡ Phase 0 Foundations Complete (v0.0)</span>
            <span>·</span>
            <span>Bengaluru Launch Cluster</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-[1.08]">
            Own less.{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Exchange more.
            </span>
          </h1>

          <p className="text-base opacity-85 sm:text-lg max-w-2xl">
            Trade what you own for what you want—without haggling for cash first. Our graph matching
            engine discovers <strong>2-way mutual swaps</strong> and{" "}
            <strong>3-way barter cycles (A → B → C → A)</strong> across Indiranagar, Koramangala,
            HSR Layout, and Whitefield.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/login"
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition-transform hover:scale-[1.02]"
            >
              Verify Phone OTP &amp; Test /v1/me →
            </Link>
            <Link
              href="/storybook"
              className="xc-glass-panel rounded-2xl px-5 py-3 text-sm font-semibold hover:border-emerald-400/50"
            >
              Explore Design System (WEB-0.4)
            </Link>
            <Link
              href="/trust"
              className="xc-glass-panel rounded-2xl px-5 py-3 text-sm font-semibold hover:border-emerald-400/50"
            >
              DPDP Privacy &amp; Prohibited Scanner
            </Link>
          </div>
        </div>

        {/* Key Metrics Strip */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Active Cluster Listings", value: "642", sub: "HSR · Koramangala · Indiranagar" },
            { label: "North Star Target", value: "≥ 8 / 100", sub: "Exchanges per 100 listings/mo" },
            { label: "Core Swap Fee", value: "₹0 Forever", sub: "No wallet · No held funds" },
            { label: "Privacy Grid", value: "~1.0 km", sub: "Exact GPS stripped & rounded" },
          ].map((stat) => (
            <div key={stat.label} className="xc-glass-panel rounded-2xl p-3.5">
              <p className="text-xs opacity-70">{stat.label}</p>
              <p className="mt-1 text-xl font-extrabold text-emerald-400">{stat.value}</p>
              <p className="text-[11px] opacity-65">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive 3-Way Cycle Studio */}
      <ThreeWayCycleStudio
        nodes={showcase.sampleThreeWayChain.nodes}
        meetupPointName={showcase.sampleThreeWayChain.meetupPointName}
        meetupDistanceKm={showcase.sampleThreeWayChain.meetupDistanceKm}
        expiresInHours={showcase.sampleThreeWayChain.expiresInHours}
      />

      {/* Featured Local Listings Grid */}
      <FeaturedListingsGrid
        categories={showcase.categories}
        items={showcase.featuredItems}
      />
    </div>
  );
}
