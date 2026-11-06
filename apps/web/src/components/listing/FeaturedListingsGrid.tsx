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
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            CATEGORY SHORTCUTS &amp; NEARBY LISTINGS
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold">Find your next exchange</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              selectedCategory === "all"
                ? "bg-[var(--brand-primary)] text-white"
                : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            All items ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-[var(--brand-primary)] text-white"
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((item) => {
          const midpointPaise = Math.round((item.estValueMinPaise + item.estValueMaxPaise) / 2);
          const conditionText =
            item.condition === "like_new"
              ? "Like new condition"
              : item.condition === "good"
              ? "Good condition"
              : "New condition";

          return (
            <article
              key={item.id}
              className="xc-glass-panel xc-card-lift p-5 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 w-full rounded-[12px] bg-[var(--surface)] border border-[var(--border)] p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{
                        backgroundColor: "rgba(32, 167, 134, 0.12)",
                        color: "var(--success)",
                      }}
                    >
                      Good match · {item.matchScore}%
                    </span>
                    <span className="text-[11px] font-medium text-[var(--muted)]">
                      {item.categoryName}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-[var(--muted)] truncate">
                    Wants: {item.wantsSummary.join(", ")}
                  </p>
                </div>

                <h3 className="mt-4 font-heading text-[18px] font-semibold leading-snug text-[var(--foreground)] line-clamp-2">
                  {item.title}
                </h3>

                <p className="mt-2 font-heading text-2xl font-bold text-[var(--foreground)]">
                  {formatInrFromPaise(midpointPaise)}
                </p>

                <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                  {conditionText} · {item.distanceKm} km away ({item.neighbourhood})
                </p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Estimated value · Verified {item.ownerVerified} · {item.ownerRating} rating
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  emitAnalyticsEvent("item_viewed", { itemId: item.id });
                  pushToast({
                    title: "Make an offer",
                    description: `Opening exchange proposal for ${item.title.slice(0, 28)}...`,
                  });
                }}
                className="xc-btn-primary mt-5 w-full py-2.5 text-sm"
              >
                Make an offer
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
