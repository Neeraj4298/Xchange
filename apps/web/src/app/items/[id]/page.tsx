"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatInrFromPaise, type MarketplaceItemDto } from "@xchange/shared";
import { apiClient, FALLBACK_SHOWCASE } from "@/lib/api-client";
import { getProductPhotoUrl } from "@/lib/product-visuals";
import { useAppContext } from "@/components/providers/AppProviders";

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { pushToast } = useAppContext();

  const [item, setItem] = useState<MarketplaceItemDto | null>(null);
  const [myItems, setMyItems] = useState<MarketplaceItemDto[]>([]);
  const [showOfferSheet, setShowOfferSheet] = useState(false);
  const [cashMode, setCashMode] = useState<"none" | "proposer_pays" | "recipient_pays">(
    "proposer_pays"
  );
  const [cashAmountInr, setCashAmountInr] = useState(2000);
  const [offerMessage, setOfferMessage] = useState(
    "Happy to meet at Indiranagar Metro Safe Point this weekend."
  );

  useEffect(() => {
    const id = params?.id || "01960000-0000-7000-8002-000000000001";
    apiClient
      .getItemById(id)
      .then((res) => setItem(res.item))
      .catch(() => {
        const f = FALLBACK_SHOWCASE.featuredItems[0]!;
        setItem({
          id: f.id,
          ownerId: "user-1",
          ownerName: f.ownerName,
          ownerRating: f.ownerRating,
          ownerVerified: f.ownerVerified,
          title: f.title,
          description: `${f.title} — carefully maintained in ${f.neighbourhood}. Includes original box and accessories.`,
          categorySlug: f.categorySlug,
          categoryName: f.categoryName,
          condition: f.condition,
          estValueMinPaise: f.estValueMinPaise,
          estValueMaxPaise: f.estValueMaxPaise,
          valueConfidence: f.valueConfidence,
          neighbourhood: f.neighbourhood,
          locationLat: 12.97,
          locationLng: 77.64,
          distanceKm: f.distanceKm,
          status: "active",
          wantsSummary: f.wantsSummary,
          openToCash: f.openToCash,
          openToAnything: false,
          maxDistanceM: 8000,
          matchScore: f.matchScore,
          imageGradient: "",
          publishedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
        });
      });
    apiClient
      .getFeed({})
      .then((res) => setMyItems(res.items))
      .catch(() => {});
  }, [params?.id]);

  if (!item) {
    return (
      <div className="xc-glass-panel p-8 text-center text-sm text-[var(--muted)]">
        Loading item details...
      </div>
    );
  }

  const midpointPaise = Math.round((item.estValueMinPaise + item.estValueMaxPaise) / 2);
  const photoUrl = getProductPhotoUrl(item.categorySlug, item.title, 0);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="h-[420px] w-full overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--surface)]">
            <img src={photoUrl} alt={item.title} className="h-full w-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-20 overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)]"
              >
                <img
                  src={getProductPhotoUrl(item.categorySlug, item.title, n)}
                  alt={`${item.title} view ${n + 1}`}
                  className="h-full w-full object-cover opacity-90"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              {item.categoryName} · {item.condition.replace("_", " ")} condition · Listed today
            </p>
            <h1 className="font-heading text-3xl font-bold text-[var(--foreground)]">
              {item.title}
            </h1>
            <div className="pt-1">
              <p className="font-heading text-3xl font-bold text-[var(--foreground)]">
                {formatInrFromPaise(midpointPaise)}
              </p>
              <p className="text-xs text-[var(--muted)]">
                Indicative estimate ({formatInrFromPaise(item.estValueMinPaise)} –{" "}
                {formatInrFromPaise(item.estValueMaxPaise)}), not a guaranteed market price.
              </p>
            </div>
          </div>

          <p className="text-sm text-[var(--muted)] leading-relaxed">{item.description}</p>

          <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2.5 text-xs">
            <p className="font-heading text-sm font-semibold text-[var(--foreground)]">
              Exchange preferences (What the owner wants)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.wantsSummary.map((w) => (
                <span
                  key={w}
                  className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 font-medium"
                >
                  {w}
                </span>
              ))}
            </div>
            <p className="text-[var(--muted)]">
              Cash adjustment: {item.openToCash ? "Accepted if values differ" : "Direct swap only"} ·
              Handover: Local meetup ({item.neighbourhood})
            </p>
          </div>

          <div className="flex items-center justify-between rounded-[16px] border border-[var(--border)] p-4 text-xs">
            <div>
              <p className="font-heading text-sm font-semibold">{item.ownerName}</p>
              <p className="text-[var(--muted)]">
                {item.neighbourhood}, Bengaluru · Phone verified · {item.ownerRating} ★
              </p>
            </div>
            <Link
              href="/chat"
              className="font-semibold text-[var(--brand-primary)] hover:underline"
            >
              Message owner
            </Link>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => setShowOfferSheet((prev) => !prev)}
              className="xc-btn-primary w-full py-3.5 text-sm"
            >
              Make an offer
            </button>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => pushToast({ title: "Saved to your items" })}
                className="xc-btn-secondary py-2.5 text-xs"
              >
                Save item
              </button>
              <button
                type="button"
                onClick={() => pushToast({ title: "Listing link copied" })}
                className="xc-btn-secondary py-2.5 text-xs"
              >
                Share
              </button>
              <button
                type="button"
                onClick={() => pushToast({ title: "Report submitted" })}
                className="xc-btn-secondary py-2.5 text-xs"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      </div>
      {showOfferSheet && (
        <div className="xc-glass-panel p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <h2 className="font-heading text-xl font-bold">Create exchange offer</h2>
            <button
              type="button"
              onClick={() => setShowOfferSheet(false)}
              className="text-xs font-medium text-[var(--muted)] hover:underline"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
              <p className="text-xs font-semibold uppercase text-[var(--muted)]">You offer</p>
              <p className="font-heading text-base font-semibold">
                {myItems[0]?.title || "iPad Pro 11\" M2 (256GB) + Apple Pencil"}
              </p>
              <p className="text-xs text-[var(--muted)]">Indicative est. ₹61,000 · Like new</p>
            </div>

            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
              <p className="text-xs font-semibold uppercase text-[var(--brand-primary)]">
                You receive
              </p>
              <p className="font-heading text-base font-semibold">{item.title}</p>
              <p className="text-xs text-[var(--muted)]">
                Indicative est. {formatInrFromPaise(midpointPaise)} · {item.condition}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-xs">
            <label className="block font-medium">
              Cash adjustment direction
              <select
                value={cashMode}
                onChange={(e) =>
                  setCashMode(e.target.value as "none" | "proposer_pays" | "recipient_pays")
                }
                className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2"
              >
                <option value="none">No cash adjustment</option>
                <option value="proposer_pays">I will add cash</option>
                <option value="recipient_pays">I want cash</option>
              </select>
            </label>
            <label className="block font-medium">
              Amount (INR, settled in person)
              <input
                type="number"
                disabled={cashMode === "none"}
                value={cashMode === "none" ? 0 : cashAmountInr}
                onChange={(e) => setCashAmountInr(Number(e.target.value))}
                className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2"
              />
            </label>
            <label className="block font-medium">
              Message to {item.ownerName}
              <input
                type="text"
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  await apiClient.createOffer({
                    recipientItemId: item.id,
                    offeredItemIds: [myItems[0]?.id || item.id],
                    cash: {
                      amountPaise: cashMode === "none" ? 0 : cashAmountInr * 100,
                      direction: cashMode,
                    },
                    message: offerMessage,
                  });
                } catch {}
                pushToast({
                  title: "Exchange offer sent",
                  description: "Your offer is now awaiting response in My Exchanges.",
                  tone: "success",
                });
                router.push("/offers");
              }}
              className="xc-btn-primary px-6 py-3 text-sm"
            >
              Send offer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
