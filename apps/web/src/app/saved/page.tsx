"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatInrFromPaise, type MarketplaceItemDto } from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { getProductPhotoUrl } from "@/lib/product-visuals";

export default function SavedItemsPage() {
  const [items, setItems] = useState<MarketplaceItemDto[]>([]);

  useEffect(() => {
    apiClient
      .getFeed({})
      .then((res) => setItems(res.items.slice(0, 2)))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Saved items</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Listings you have bookmarked to compare or propose an exchange later.
          </p>
        </div>
        <Link href="/feed" className="xc-btn-secondary px-4 py-2 text-xs">
          Explore more items →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="xc-glass-panel p-10 text-center space-y-3">
          <h2 className="font-heading text-lg font-bold">No saved items yet</h2>
          <p className="text-xs text-[var(--muted)]">
            Save listings while browsing Explore to compare values and send offers.
          </p>
          <Link href="/feed" className="xc-btn-primary inline-block px-5 py-2.5 text-xs">
            Browse Explore
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => {
            const mid = Math.round((item.estValueMinPaise + item.estValueMaxPaise) / 2);
            return (
              <article key={item.id} className="xc-glass-panel p-4 space-y-3">
                <div className="h-44 overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)]">
                  <img
                    src={getProductPhotoUrl(item.categorySlug, item.title, idx)}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className="font-semibold"
                    style={{ color: "var(--success)" }}
                  >
                    Available
                  </span>
                  <span className="text-[var(--muted)]">{item.neighbourhood}</span>
                </div>
                <h2 className="font-heading text-base font-semibold">{item.title}</h2>
                <p className="font-heading text-lg font-bold">{formatInrFromPaise(mid)}</p>
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/items/${item.id}`}
                    className="xc-btn-primary flex-1 py-2 text-center text-xs"
                  >
                    View item
                  </Link>
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
                    className="xc-btn-secondary px-3 py-2 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
