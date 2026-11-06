"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatInrFromPaise, type CategoryDto, type FeaturedItemDto } from "@xchange/shared";
import { emitAnalyticsEvent } from "@/lib/observability";
import { getProductPhotoUrl, STANDARD_CATEGORIES } from "@/lib/product-visuals";
import { useAppContext } from "@/components/providers/AppProviders";

interface Props {
  categories: CategoryDto[];
  items: FeaturedItemDto[];
}

export function FeaturedListingsGrid({ items }: Props) {
  const { pushToast } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const filtered =
    selectedCategory === "all"
      ? items
      : items.filter((item) => item.categorySlug === selectedCategory);

  return (
    <section id="discover-items" className="space-y-8">
      <div id="categories" className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[var(--foreground)]">
              Explore categories
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Browse local items by category across Bengaluru.
            </p>
          </div>
          {selectedCategory !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
            >
              Show all categories
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {STANDARD_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() =>
                  setSelectedCategory((prev) => (prev === cat.slug ? "all" : cat.slug))
                }
                className={`rounded-[16px] border p-4 text-left transition-colors ${
                  active
                    ? "border-[var(--brand-primary)] bg-[var(--brand-tint)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand-primary)]"
                }`}
              >
                <p className="font-heading text-sm font-semibold text-[var(--foreground)]">
                  {cat.name}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">{cat.count} listings</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[var(--foreground)]">
              Discover interesting items
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Real possessions available for direct or multi-item exchange nearby.
            </p>
          </div>
          <Link
            href="/feed"
            className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
          >
            Explore all items →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item, idx) => {
            const midpointPaise = Math.round(
              (item.estValueMinPaise + item.estValueMaxPaise) / 2
            );
            const conditionText =
              item.condition === "like_new"
                ? "Like new"
                : item.condition === "good"
                ? "Good condition"
                : "New";
            const photoUrl = getProductPhotoUrl(item.categorySlug, item.title, idx);
            const isSaved = Boolean(savedIds[item.id]);

            return (
              <article
                key={item.id}
                className="xc-glass-panel xc-card-lift p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden rounded-[12px] bg-[var(--surface)] border border-[var(--border)]">
                    <img
                      src={photoUrl}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Save item"
                      onClick={() => {
                        setSavedIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                        pushToast({
                          title: !isSaved ? "Saved to your items" : "Removed from saved items",
                        });
                      }}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-xs font-semibold shadow-sm"
                    >
                      {isSaved ? "♥" : "♡"}
                    </button>
                  </div>

                  <Link
                    href={`/items/${item.id}`}
                    onClick={() => emitAnalyticsEvent("item_viewed", { itemId: item.id })}
                    className="mt-4 block font-heading text-[18px] font-semibold leading-snug text-[var(--foreground)] hover:text-[var(--brand-primary)] line-clamp-2"
                  >
                    {item.title}
                  </Link>

                  <p className="mt-1.5 font-heading text-xl font-bold text-[var(--foreground)]">
                    {formatInrFromPaise(midpointPaise)}{" "}
                    <span className="font-sans text-xs font-normal text-[var(--muted)]">
                      est. value
                    </span>
                  </p>

                  <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                    {conditionText} · {item.neighbourhood}
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {item.ownerName} · {item.ownerRating} ★ · Phone verified
                  </p>
                </div>

                <div className="mt-4 flex gap-2 pt-3 border-t border-[var(--border)]">
                  <Link
                    href={`/items/${item.id}`}
                    className="xc-btn-primary flex-1 py-2 text-center text-xs"
                  >
                    View item
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
