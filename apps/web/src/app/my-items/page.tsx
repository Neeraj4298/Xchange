"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatInrFromPaise, type MarketplaceItemDto } from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { useAppContext } from "@/components/providers/AppProviders";

export default function MyItemsPage() {
  const { pushToast } = useAppContext();
  const [items, setItems] = useState<MarketplaceItemDto[]>([]);

  const loadMine = () => {
    apiClient
      .getMyItems()
      .then((res) => setItems(res.items))
      .catch(() => {});
  };

  useEffect(() => {
    loadMine();
  }, []);

  const handleStatusChange = async (id: string, action: "publish" | "pause" | "delete") => {
    try {
      await apiClient.updateItemStatus(id, action);
      loadMine();
      pushToast({
        title: `Listing ${action}d`,
        description: `Status updated via POST /v1/items/${id.slice(0, 8)}/${action}`,
        tone: "info",
      });
    } catch (err) {
      pushToast({
        title: "Cannot Modify Listing",
        description: err instanceof Error ? err.message : "Action failed",
        tone: "danger",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="xc-glass-panel rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
            WEB-1.5 &amp; FR-LST-3 · MY ITEMS INVENTORY
          </span>
          <h1 className="mt-2 text-2xl font-extrabold">My Listed Possessions</h1>
          <p className="text-xs opacity-75">
            Manage Active, Paused, In-Trade (Locked), and Traded items.
          </p>
        </div>

        <Link
          href="/items/new"
          className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950"
        >
          + List New Item
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="xc-glass-panel rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-0.5 text-xs font-bold uppercase text-emerald-400">
                Status: {item.status}
              </span>
              <span className="font-mono text-xs">
                {formatInrFromPaise(item.estValueMinPaise)} – {formatInrFromPaise(item.estValueMaxPaise)}
              </span>
            </div>

            <h2 className="text-base font-bold">{item.title}</h2>
            <p className="text-xs opacity-75">{item.description}</p>

            <div className="flex flex-wrap gap-2 pt-2">
              {item.status !== "active" && item.status !== "locked" && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(item.id, "publish")}
                  className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950"
                >
                  Activate
                </button>
              )}
              {item.status === "active" && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(item.id, "pause")}
                  className="rounded-xl border border-amber-500/40 px-3 py-1.5 text-xs text-amber-300"
                >
                  Pause Listing
                </button>
              )}
              {item.status !== "locked" && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(item.id, "delete")}
                  className="rounded-xl border border-red-500/40 px-3 py-1.5 text-xs text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
