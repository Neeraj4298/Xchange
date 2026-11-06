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
    <div className="space-y-16">
      {/* Screen 1 — Hero Section (Spec Section 4) */}
      <section className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-center pt-4">
        <div className="lg:col-span-6 space-y-6">
          <span className="inline-block rounded-full bg-[var(--brand-tint)] px-3.5 py-1 text-xs font-semibold text-[var(--brand-primary)]">
            Own less. Exchange more.
          </span>

          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-[52px] sm:leading-[1.1] text-[var(--foreground)]">
            Your next favourite thing might already belong to someone.
          </h1>

          <p className="text-base text-[var(--muted)] leading-relaxed max-w-xl">
            Discover things you need, exchange what you no longer use, and find better value without
            buying everything new.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/feed" className="xc-btn-primary px-6 py-3.5 text-sm">
              Explore items
            </Link>
            <Link href="/login" className="xc-btn-secondary px-6 py-3.5 text-sm">
              Start exchanging
            </Link>
            <Link href="/app" className="xc-btn-secondary px-5 py-3.5 text-sm">
              Open Home Dashboard →
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          <div className="xc-glass-panel p-4 space-y-3">
            <div className="h-44 overflow-hidden rounded-[12px] bg-[var(--surface)] border border-[var(--border)]">
              <img
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=85"
                alt="Fujifilm Mirrorless Camera"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="font-heading text-sm font-semibold">Fujifilm X-T30 II Kit</p>
            <p className="text-xs text-[var(--muted)]">Est. ₹65,000 · Indiranagar</p>
          </div>

          <div className="xc-glass-panel p-4 space-y-3">
            <div className="h-44 overflow-hidden rounded-[12px] bg-[var(--surface)] border border-[var(--border)]">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85"
                alt="Studio Wireless Headphones"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="font-heading text-sm font-semibold">Beoplay Studio Headphones</p>
            <p className="text-xs text-[var(--muted)]">Est. ₹32,000 · Koramangala</p>
          </div>
        </div>
      </section>

      {/* Section: How Xchange Works (3 Steps) */}
      <section id="how-it-works" className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--foreground)]">
            How Xchange works
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Simple, transparent exchanges between real people nearby.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "List what you have",
              body: "Add photos, condition and indicative value, then describe what you would like in return.",
            },
            {
              step: "02",
              title: "Find what you need",
              body: "Discover compatible items nearby — through direct swaps, multi-item offers or proposed chains.",
            },
            {
              step: "03",
              title: "Make the exchange",
              body: "Agree on the terms, meet at a verified local safe point and confirm the handover in person.",
            },
          ].map((s) => (
            <div key={s.step} className="xc-glass-panel p-6 space-y-2">
              <span className="font-heading text-xs font-bold text-[var(--brand-primary)]">
                STEP {s.step}
              </span>
              <h3 className="font-heading text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <FeaturedListingsGrid
        categories={showcase.categories}
        items={showcase.featuredItems}
      />

      <ThreeWayCycleStudio
        nodes={showcase.sampleThreeWayChain.nodes}
        meetupPointName={showcase.sampleThreeWayChain.meetupPointName}
        meetupDistanceKm={showcase.sampleThreeWayChain.meetupDistanceKm}
        expiresInHours={showcase.sampleThreeWayChain.expiresInHours}
      />
      <section className="xc-glass-panel p-8 space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-bold">Built for trust and transparency</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Phone verification confirms a reachable mobile number; always inspect items in person at a public meetup point before confirming handover.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 text-xs">
          {[
            { title: "Phone verification", desc: "OTP-verified accounts for every member." },
            { title: "Public reputation", desc: "Reviews from completed exchanges only." },
            { title: "Reporting & blocking", desc: "Fast moderator review and strike enforcement." },
            { title: "Transparent proposals", desc: "Clear item comparisons and optional cash terms." },
            { title: "Handover confirmation", desc: "Two-party confirmation at local safe points." },
          ].map((item) => (
            <div key={item.title} className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="font-heading font-semibold text-sm">{item.title}</p>
              <p className="mt-1 text-[var(--muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--border)] pt-8 pb-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-[var(--foreground)]">XCHANGE</span>
          <span>· Own less. Exchange more.</span>
        </div>
        <div className="flex flex-wrap gap-5">
          <Link href="/#how-it-works" className="hover:text-[var(--foreground)]">How it works</Link>
          <Link href="/trust" className="hover:text-[var(--foreground)]">Safety &amp; Guidelines</Link>
          <Link href="/trust" className="hover:text-[var(--foreground)]">Terms</Link>
          <Link href="/trust" className="hover:text-[var(--foreground)]">Privacy</Link>
          <Link href="/storybook" className="hover:text-[var(--foreground)]">Design System</Link>
        </div>
      </footer>
    </div>
  );
}
