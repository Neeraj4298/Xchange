"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatInrFromPaise, type MarketplaceItemDto } from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { getProductPhotoUrl, STANDARD_CATEGORIES } from "@/lib/product-visuals";
import { useAppContext } from "@/components/providers/AppProviders";

export default function AuthenticatedHomeDashboardPage() {
  const { user, selectedNeighbourhood } = useAppContext();
  const [items, setItems] = useState<MarketplaceItemDto[]>([]);
  const [showEmptyState, setShowEmptyState] = useState(false);

  useEffect(() => {
    apiClient
      .getFeed({ tab: "for_you" })
      .then((res) => setItems(res.items))
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
      <div className="xl:col-span-9 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--foreground)]">
              Good morning, {user ? user.name.split(" ")[0] : "Aarav"}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Exchange opportunities near {selectedNeighbourhood}, Bengaluru.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowEmptyState((prev) => !prev)}
              className="xc-btn-secondary px-3.5 py-2 text-xs"
            >
              {showEmptyState ? "Show Active Inventory" : "Preview New-User Empty State"}
            </button>
            <Link href="/items/new" className="xc-btn-primary px-4 py-2 text-xs">
              + List an item
            </Link>
          </div>
        </div>

        {showEmptyState ? (
          <div className="xc-glass-panel p-10 text-center space-y-4">
            <h2 className="font-heading text-xl font-bold">
              Your next exchange starts with something you already own.
            </h2>
            <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
              Add your first item and tell nearby members what you would like in return.
            </p>
            <Link href="/items/new" className="xc-btn-primary inline-block px-6 py-3 text-sm">
              List your first item
            </Link>
          </div>
        ) : (
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold">Matches for your items</h2>
                <p className="text-xs text-[var(--muted)]">
                  Listings nearby that align with your items and exchange preferences.
                </p>
              </div>
              <Link
                href="/matches"
                className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
              >
                See all matches →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {items.slice(0, 2).map((matchItem, idx) => {
                const estMid = Math.round(
                  (matchItem.estValueMinPaise + matchItem.estValueMaxPaise) / 2
                );
                return (
                  <div key={matchItem.id} className="xc-glass-panel p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[12px] bg-[var(--surface)] border border-[var(--border)] p-3">
                        <p className="text-[11px] font-medium uppercase text-[var(--muted)]">
                          Your item
                        </p>
                        <p className="mt-1 font-heading text-sm font-semibold truncate">
                          iPad Pro 11&quot; M2 + Pencil
                        </p>
                        <p className="mt-1 text-xs font-semibold">Est. ₹61,000</p>
                      </div>

                      <div className="rounded-[12px] bg-[var(--surface)] border border-[var(--border)] p-3">
                        <p className="text-[11px] font-medium uppercase text-[var(--brand-primary)]">
                          Matching item · {matchItem.neighbourhood}
                        </p>
                        <p className="mt-1 font-heading text-sm font-semibold truncate">
                          {matchItem.title}
                        </p>
                        <p className="mt-1 text-xs font-semibold">
                          Est. {formatInrFromPaise(estMid)}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                      {idx === 0
                        ? "Matches your preference for a mirrorless camera and is within your selected exchange-value range."
                        : "Owner is looking for an iPad Pro or workstation tablet within 4 km of your locality."}
                    </p>

                    <div className="flex justify-end">
                      <Link
                        href={`/items/${matchItem.id}`}
                        className="xc-btn-primary px-4 py-2 text-xs"
                      >
                        View match
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold">Your activity</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Incoming offers", count: "2", href: "/offers" },
              { label: "Pending responses", count: "1", href: "/offers" },
              { label: "Active exchanges", count: "1", href: "/trades" },
              { label: "Unread messages", count: "1", href: "/chat" },
            ].map((act) => (
              <Link
                key={act.label}
                href={act.href}
                className="xc-glass-panel p-4 hover:border-[var(--brand-primary)]"
              >
                <p className="text-xs text-[var(--muted)]">{act.label}</p>
                <p className="mt-1 font-heading text-2xl font-bold text-[var(--foreground)]">
                  {act.count}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold">Explore categories</h2>
          <div className="flex flex-wrap gap-2">
            {STANDARD_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href="/feed"
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-medium hover:border-[var(--brand-primary)]"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="font-heading text-xl font-bold">
              Recommended &amp; recently listed nearby
            </h2>
            <Link
              href="/feed"
              className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
            >
              Browse all →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, idx) => {
              const mid = Math.round((item.estValueMinPaise + item.estValueMaxPaise) / 2);
              return (
                <article key={item.id} className="xc-glass-panel p-4 space-y-3">
                  <div className="h-40 overflow-hidden rounded-[12px] bg-[var(--surface)] border border-[var(--border)]">
                    <img
                      src={getProductPhotoUrl(item.categorySlug, item.title, idx)}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <Link
                    href={`/items/${item.id}`}
                    className="block font-heading text-base font-semibold hover:text-[var(--brand-primary)] line-clamp-1"
                  >
                    {item.title}
                  </Link>
                  <p className="font-heading text-lg font-bold">{formatInrFromPaise(mid)}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {item.condition.replace("_", " ")} · {item.neighbourhood}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="xl:col-span-3 space-y-5">
        <div className="xc-glass-panel p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
            EXCHANGE RECOMMENDATIONS
          </p>
          <h3 className="font-heading text-base font-bold">3-person chain proposal</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            A proposed three-participant exchange connects your iPad Pro M2 with Rohan&apos;s
            Fujifilm X-T30 II and Meera&apos;s Fender Stratocaster.
          </p>
          <Link href="/chains" className="xc-btn-secondary block w-full py-2 text-center text-xs">
            Review proposal
          </Link>
        </div>

        <div className="xc-glass-panel p-5 space-y-3">
          <h3 className="font-heading text-sm font-bold">Helpful prompt</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Adding 3+ clear photos and specific items you want in return increases direct exchange offers.
          </p>
          <Link
            href="/items/new"
            className="text-xs font-semibold text-[var(--brand-primary)] hover:underline block"
          >
            Update your listings →
          </Link>
        </div>
      </aside>
    </div>
  );
}
