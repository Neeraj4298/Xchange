"use client";

import React, { useState } from "react";
import { checkProhibitedContent, snapToOneKmGrid } from "@xchange/shared";

export default function TrustAndLegalPage() {
  const [sampleText, setSampleText] = useState(
    "Fujifilm Mirrorless Camera in like-new condition"
  );
  const [lat, setLat] = useState(12.971891);
  const [lng, setLng] = useState(77.641154);

  const checkResult = checkProhibitedContent(sampleText);
  const roundedCoord = snapToOneKmGrid(lat, lng);

  return (
    <div className="space-y-8">
      <div className="xc-glass-panel rounded-3xl p-6 md:p-8">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
          P0-T6 · LEGAL, DPDP PRIVACY &amp; PROHIBITED-ITEMS GUARD
        </span>
        <h1 className="mt-2 text-3xl font-extrabold">
          Xchange Trust, Safety &amp; Legal Center
        </h1>
        <p className="mt-1 text-sm opacity-75">
          Interactive verification of Prohibited-Item Screening (FR-LST-4) and 1 km Location Grid Rounding (FR-PRO-4).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Live Prohibited Content Scanner */}
        <div className="xc-glass-panel rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-bold">Live Prohibited-Item Guard (FR-LST-4)</h2>
          <p className="text-xs opacity-75">
            Type any listing title or click a test preset to see real-time policy enforcement from{" "}
            <code>@xchange/shared</code>.
          </p>
          <input
            type="text"
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            className="w-full rounded-xl border border-emerald-500/30 bg-slate-950/60 px-4 py-2.5 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSampleText("Vintage Acoustic Guitar + Hard Case")}
              className="rounded-lg border border-emerald-500/30 px-2.5 py-1 text-xs"
            >
              Test Allowed Item
            </button>
            <button
              type="button"
              onClick={() => setSampleText("Imported vape and whiskey bottle")}
              className="rounded-lg border border-red-500/40 px-2.5 py-1 text-xs text-red-300"
            >
              Test Prohibited Keyword
            </button>
          </div>
          <div
            className={`rounded-2xl border p-4 text-xs ${
              checkResult.allowed
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            <p className="font-bold">
              {checkResult.allowed ? "✓ ALLOWED FOR LISTING" : "✕ BLOCKED BY TRUST & SAFETY"}
            </p>
            {checkResult.reason && <p className="mt-1">{checkResult.reason}</p>}
          </div>
        </div>

        {/* Live 1 km Privacy Grid Snapper */}
        <div className="xc-glass-panel rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-bold">DPDP 1 km Location Grid Rounding (FR-PRO-4)</h2>
          <p className="text-xs opacity-75">
            Exact user coordinates are never exposed in public APIs or DOM.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs">
              Raw Latitude
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-emerald-500/30 bg-slate-950/60 px-3 py-2 font-mono text-xs"
              />
            </label>
            <label className="text-xs">
              Raw Longitude
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-emerald-500/30 bg-slate-950/60 px-3 py-2 font-mono text-xs"
              />
            </label>
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 font-mono text-xs">
            <p>Raw GPSInput : {lat.toFixed(6)}, {lng.toFixed(6)}</p>
            <p className="mt-1 font-bold text-emerald-400">
              Public 1km Cell: {roundedCoord.lat.toFixed(2)}, {roundedCoord.lng.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
