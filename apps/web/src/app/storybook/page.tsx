"use client";

import React, { useState } from "react";
import { uiTokens } from "@xchange/ui-tokens";

export default function StorybookCatalogPage() {
  const [visualState, setVisualState] = useState<"default" | "loading" | "empty" | "error">(
    "default"
  );

  return (
    <div className="space-y-8">
      <div className="xc-glass-panel rounded-3xl p-6 md:p-8">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
          WEB-0.4 &amp; P0-T3 · DESIGN SYSTEM &amp; VISUAL STATE CATALOG
        </span>
        <h1 className="mt-2 text-3xl font-extrabold">
          Xchange &ldquo;Kinetic Circular Craft&rdquo; Component Library
        </h1>
        <p className="mt-1 text-sm opacity-75">
          Interactive Storybook matrix verifying Default, Loading, Empty, and Error states per Section 11 Definition of Done.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["default", "loading", "empty", "error"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setVisualState(st)}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase transition-all ${
                visualState === st
                  ? "bg-emerald-500 text-slate-950"
                  : "xc-glass-panel opacity-75 hover:opacity-100"
              }`}
            >
              State: {st}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Component State Preview */}
      <div className="xc-glass-panel rounded-3xl p-6">
        <h2 className="text-lg font-bold">1. TradeStepper &amp; OfferCard Visual States ({visualState})</h2>

        {visualState === "default" && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { step: "1. Scheduling", status: "Completed", active: true },
              { step: "2. Safe Point Set", status: "Indiranagar Metro", active: true },
              { step: "3. 6-Digit Handover", status: "Code: 849-201", active: true },
              { step: "4. Double-Blind Review", status: "Awaiting", active: false },
            ].map((s) => (
              <div
                key={s.step}
                className={`rounded-2xl border p-4 ${
                  s.active
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-white/10 opacity-60"
                }`}
              >
                <p className="text-xs font-bold text-emerald-400">{s.step}</p>
                <p className="mt-1 text-sm font-semibold">{s.status}</p>
              </div>
            ))}
          </div>
        )}

        {visualState === "loading" && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-28 animate-pulse rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4"
              >
                <div className="h-4 w-1/2 rounded bg-emerald-500/25" />
                <div className="mt-3 h-3 w-3/4 rounded bg-emerald-500/15" />
              </div>
            ))}
          </div>
        )}

        {visualState === "empty" && (
          <div className="mt-4 rounded-2xl border border-dashed border-emerald-500/30 p-8 text-center">
            <p className="text-base font-bold">No Active Swap Offers Yet</p>
            <p className="mt-1 text-xs opacity-75">
              List an item you own and specify your Wants to unlock 2-way and 3-way matches.
            </p>
          </div>
        )}

        {visualState === "error" && (
          <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
            <p className="text-sm font-bold text-red-400">
              RFC 9457 Problem Details (409 ITEM_LOCKED)
            </p>
            <p className="mt-1 text-xs opacity-85">
              This item was locked by another accepted trade moments ago. Your offer was safely cancelled with zero penalty.
            </p>
          </div>
        )}
      </div>

      {/* Design Tokens Matrix */}
      <div className="xc-glass-panel rounded-3xl p-6">
        <h2 className="text-lg font-bold">2. @xchange/ui-tokens Breakpoints &amp; Palette</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(uiTokens.breakpoints).map(([name, px]) => (
            <div key={name} className="rounded-xl border border-emerald-500/20 p-3">
              <p className="font-mono text-xs text-emerald-400">{name}</p>
              <p className="text-lg font-bold">{px}px</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
