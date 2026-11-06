"use client";

import React, { useState } from "react";
import { formatInrFromPaise, type CategoryDto, type FeaturedItemDto } from "@xchange/shared";
import { emitAnalyticsEvent } from "@/lib/observability";
import { useAppContext } from "@/components/providers/AppProviders";

interface Props {
  categories: CategoryDto[];
  items: FeaturedItemDto[];
}

export function FeaturedListingsGrid({ categories, items }: Props) {
  const { pushToast } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered =
    selectedCategory === "all"
      ? items
      : items.filter((item) => item.categorySlug === selectedCategory);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Bengaluru Launch Cluster · Active Swap Listings
          </h2>
          <p className="text-sm opacity-75">
            Locations rounded to ~1 km PostGIS grid cells. Value bands are estimates only.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedCategory === "all"
                ? "bg-emerald-500 text-slate-950"
                : "xc-glass-panel opacity-80 hover:opacity-100"
            }`}
          >
            All ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === cat.slug
                  ? "bg-emerald-500 text-slate-950"
                  : "xc-glass-panel opacity-80 hover:opacity-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="xc-glass-panel xc-card-lift rounded-3xl p-5 flex flex-col justify-between"
          >
            <div>
              <div
                className={`relative h-32 w-full rounded-2xl bg-gradient-to-br ${item.imageGradient} p-4 flex flex-col justify-between border border-white/10`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                    {item.badge || "Active Swap"}
                  </span>
                  <span className="rounded-full bg-slate-950/75 px-2.5 py-1 font-mono text-[11px] text-amber-300">
                    Match {item.matchScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{item.categoryName}</span>
                  <span className="font-mono opacity-85">📍 {item.neighbourhood}</span>
                </div>
              </div>

              <h3 className="mt-4 text-base font-bold leading-snug">{item.title}</h3>

              <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 text-xs">
                <span className="opacity-80">Estimated Range</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatInrFromPaise(item.estValueMinPaise)} – {formatInrFromPaise(item.estValueMaxPaise)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.wantsSummary.map((w) => (
                  <span
                    key={w}
                    className="rounded-lg border border-emerald-500/25 px-2 py-0.5 text-xs"
                  >
                    ⇄ Wants: {w}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-emerald-500/15 pt-3.5">
              <div className="text-xs">
                <p className="font-semibold">
                  {item.ownerName} · ★ {item.ownerRating}
                </p>
                <p className="opacity-70">{item.distanceKm} km away</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  emitAnalyticsEvent("item_viewed", { itemId: item.id });
                  pushToast({
                    title: `Swap Offer Drafted`,
                    description: `72h expiry (FR-OFF-4) for ${item.title.slice(0, 28)}...`,
                    tone: "success",
                  });
                }}
                className="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 transition-transform hover:scale-105"
              >
                Propose Swap ⇄
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
