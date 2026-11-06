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
    <div className="space-y-12">
      {/* Screen 1 — Home / Discovery Hero (Pure Premium Minimalism Spec Section 3 & 4) */}
      <section className="xc-glass-panel p-8 md:p-12">
        <div className="max-w-3xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
            XCHANGE PURE · BENGALURU MARKETPLACE
          </p>

          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-[48px] sm:leading-[1.12] text-[var(--foreground)]">
            Exchange something.
            <br />
            <span className="text-[var(--brand-primary)]">Discover something better.</span>
          </h1>

          <p className="text-base text-[var(--muted)] max-w-2xl">
            Browse items people nearby are willing to exchange. Find something you need and offer
            something you own — through direct swaps or three-person exchange chains.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/feed" className="xc-btn-primary px-6 py-3 text-sm">
              What are you looking to exchange? →
            </Link>
            <Link href="/items/new" className="xc-btn-secondary px-5 py-3 text-sm">
              List an item
            </Link>
            <Link href="/storybook" className="xc-btn-secondary px-5 py-3 text-sm">
              Pure Design System
            </Link>
          </div>
        </div>
      </section>

      {/* Primary Home Section: "Matches for your items" + Frozen Exchange Comparison (Section 7 & 10) */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
              MATCHES FOR YOUR ITEMS
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold">
              People nearby who want what you already own
            </h2>
          </div>
          <Link
            href="/matches"
            className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
          >
            View all matches →
          </Link>
        </div>

        {/* Frozen Exchange Comparison Component (Section 10 of ui_suggestion.docx) */}
        <div className="xc-glass-panel p-6 md:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-11 items-center">
            <div className="md:col-span-4 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                Your item
              </p>
              <h3 className="mt-1 font-heading text-lg font-semibold">
                iPad Pro 11&quot; M2 (256GB) + Apple Pencil
              </h3>
              <p className="mt-2 font-heading text-2xl font-bold text-[var(--foreground)]">
                ₹61,000
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Like new condition · HSR Layout
              </p>
            </div>

            <div className="md:col-span-3 flex flex-col items-center justify-center text-center space-y-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: "rgba(32, 167, 134, 0.12)",
                  color: "var(--success)",
                }}
              >
                94% Mutual Match
              </span>
              <div className="font-heading text-sm font-semibold text-[var(--muted)]">
                Suggested adjustment
              </div>
              <div className="font-heading text-xl font-bold text-[var(--brand-primary)]">
                ₹4,000
              </div>
              <Link href="/offers" className="xc-btn-primary mt-1 px-5 py-2.5 text-xs">
                Make an offer
              </Link>
            </div>

            <div className="md:col-span-4 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                Their item
              </p>
              <h3 className="mt-1 font-heading text-lg font-semibold">
                Fujifilm X-T30 II Mirrorless + 35mm f/2
              </h3>
              <p className="mt-2 font-heading text-2xl font-bold text-[var(--foreground)]">
                ₹65,000
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Like new condition · 1.8 km away · Rating 4.95 ★
              </p>
            </div>
          </div>
        </div>
      </section>

      <ThreeWayCycleStudio
        nodes={showcase.sampleThreeWayChain.nodes}
        meetupPointName={showcase.sampleThreeWayChain.meetupPointName}
        meetupDistanceKm={showcase.sampleThreeWayChain.meetupDistanceKm}
        expiresInHours={showcase.sampleThreeWayChain.expiresInHours}
      />

      <FeaturedListingsGrid
        categories={showcase.categories}
        items={showcase.featuredItems}
      />
    </div>
  );
}
