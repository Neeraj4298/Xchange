"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { checkProhibitedContent, snapToOneKmGrid, type ItemCondition } from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { emitAnalyticsEvent } from "@/lib/observability";
import { useAppContext } from "@/components/providers/AppProviders";
import { AiListingAssistPanel } from "@/components/ai/AiListingAssistPanel";

export default function CreateListingPage() {
  const router = useRouter();
  const { pushToast } = useAppContext();
  const [title, setTitle] = useState("Keychron Q1 Pro Wireless Custom Mechanical Keyboard");
  const [description, setDescription] = useState(
    "Full CNC aluminum body, tactile switches, mint condition with coiled Aviator cable."
  );
  const [categorySlug, setCategorySlug] = useState("workstation-audio");
  const [condition, setCondition] = useState<ItemCondition>("like_new");
  const [minInr, setMinInr] = useState(14000);
  const [maxInr, setMaxInr] = useState(16500);
  const [wantsKeywords, setWantsKeywords] = useState("Sony WH-1000XM5, 27-inch 4K Monitor");
  const [neighbourhood, setNeighbourhood] = useState("HSR Layout Sector 2");
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  const policyCheck = checkProhibitedContent(`${title} ${description} ${wantsKeywords}`, categorySlug);
  const snappedGrid = snapToOneKmGrid(12.9121, 77.6446);

  const handleSimulateUpload = async () => {
    const res = await apiClient.requestUploadUrl("keychron-q1-pro.webp");
    setUploadedUrl(res.publicUrl);
    pushToast({ title: "Signed R2 Upload Complete (EXIF Stripped)", tone: "success" });
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyCheck.allowed) {
      pushToast({ title: "Blocked (FR-LST-4)", description: policyCheck.reason, tone: "danger" });
      return;
    }
    try {
      const created = await apiClient.createItem({
        title,
        description,
        categorySlug,
        condition,
        estValueMinPaise: minInr * 100,
        estValueMaxPaise: maxInr * 100,
        locationLat: snappedGrid.lat,
        locationLng: snappedGrid.lng,
        neighbourhood,
        imageUrls: [uploadedUrl || "gradient:emerald"],
        publishImmediately: true,
        wants: {
          keywords: wantsKeywords.split(",").map((s) => s.trim()).filter(Boolean),
          minCondition: "good",
          openToCash: true,
          openToAnything: false,
          maxDistanceM: 8000,
        },
      });
      emitAnalyticsEvent("listing_created", { itemId: created.item.id });
      emitAnalyticsEvent("listing_published", { itemId: created.item.id });
      pushToast({ title: "Listing Published!", tone: "success" });
      router.push("/my-items");
    } catch (err) {
      pushToast({
        title: "Publish Error",
        description: err instanceof Error ? err.message : "Failed",
        tone: "danger",
      });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="xc-glass-panel rounded-3xl p-6">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
          WEB-1.3 &amp; WEB-1.4 · CREATE LISTING + WANTS BUILDER
        </span>
        <h1 className="mt-2 text-2xl font-extrabold">List an Item for Barter Exchange</h1>

        <div className="mt-4">
          <AiListingAssistPanel
            onAcceptSuggestion={(s) => {
              setTitle(s.title);
              setDescription(s.description);
              setCategorySlug(s.categorySlug);
              setCondition(s.condition);
              setMinInr(s.minInr);
              setMaxInr(s.maxInr);
              setWantsKeywords(s.wantsKeywords);
            }}
          />
        </div>

        <form onSubmit={handlePublish} className="mt-4 space-y-3">
          <div className="rounded-2xl border border-emerald-500/25 p-3 flex items-center justify-between">
            <span className="text-xs font-semibold">Signed R2 Upload (EXIF Stripped)</span>
            <button
              type="button"
              onClick={handleSimulateUpload}
              className="rounded-xl bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300"
            >
              + Upload Photo
            </button>
          </div>
          {uploadedUrl && <p className="font-mono text-xs text-emerald-400">✓ {uploadedUrl}</p>}

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Title"
            className="w-full rounded-xl border border-emerald-500/30 bg-slate-950/60 px-3.5 py-2 text-sm"
          />
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Description"
            className="w-full rounded-xl border border-emerald-500/30 bg-slate-950/60 px-3.5 py-2 text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              aria-label="Category"
              className="rounded-xl border border-emerald-500/30 bg-slate-950/80 px-3 py-2 text-xs"
            >
              <option value="workstation-audio">Workstation &amp; Audio</option>
              <option value="cameras-lenses">Cameras &amp; Lenses</option>
              <option value="musical-instruments">Musical Instruments</option>
              <option value="gaming-consoles">Gaming &amp; Consoles</option>
            </select>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as ItemCondition)}
              aria-label="Condition"
              className="rounded-xl border border-emerald-500/30 bg-slate-950/80 px-3 py-2 text-xs"
            >
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
            <input
              type="number"
              value={minInr}
              onChange={(e) => setMinInr(Number(e.target.value))}
              aria-label="Min Value INR"
              className="rounded-xl border border-emerald-500/30 bg-slate-950/60 px-3 py-2 font-mono text-sm"
            />
            <input
              type="number"
              value={maxInr}
              onChange={(e) => setMaxInr(Number(e.target.value))}
              aria-label="Max Value INR"
              className="rounded-xl border border-emerald-500/30 bg-slate-950/60 px-3 py-2 font-mono text-sm"
            />
          </div>

          <input
            type="text"
            value={wantsKeywords}
            onChange={(e) => setWantsKeywords(e.target.value)}
            aria-label="Wants Keywords"
            className="w-full rounded-xl border border-emerald-500/30 bg-slate-950/60 px-3.5 py-2 text-sm"
          />
          <input
            type="text"
            value={neighbourhood}
            onChange={(e) => setNeighbourhood(e.target.value)}
            aria-label="Neighbourhood"
            className="w-full rounded-xl border border-emerald-500/30 bg-slate-950/60 px-3.5 py-2 text-sm"
          />

          <p className="text-xs text-emerald-400">
            {policyCheck.allowed
              ? `✓ Prohibited-Item Guard Passed · 1km Cell (${snappedGrid.lat}, ${snappedGrid.lng})`
              : `✕ Blocked: ${policyCheck.reason}`}
          </p>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 text-sm font-bold text-slate-950"
          >
            Publish Listing →
          </button>
        </form>
      </div>
    </div>
  );
}
