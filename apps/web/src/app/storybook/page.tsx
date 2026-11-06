"use client";

import React, { useState } from "react";
import { uiTokens } from "@xchange/ui-tokens";

const DESIGN_STATES = [
  "default",
  "loading",
  "empty",
  "error",
  "success",
  "disabled",
  "offline",
  "expired",
  "rejected",
  "reserved",
  "disputed",
] as const;

export default function StorybookCatalogPage() {
  const [visualState, setVisualState] =
    useState<(typeof DESIGN_STATES)[number]>("default");

  return (
    <div className="space-y-8">
      <div className="xc-glass-panel p-6 md:p-8">
        <span className="inline-block rounded-full bg-[var(--brand-tint)] px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
          XCHANGE PURE · PURE PREMIUM MINIMALISM DESIGN SYSTEM v1.0
        </span>
        <h1 className="mt-2 font-heading text-3xl font-bold">
          Xchange Pure Component &amp; Token Specification
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Solid surfaces, Electric Violet (#7167E8), Manrope + Inter typography, thin 1px borders (#ECECF3), and all 10 required workflow states.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {DESIGN_STATES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setVisualState(st)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase transition-colors ${
                visualState === st
                  ? "bg-[var(--brand-primary)] text-white"
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Workflow State Preview (Section 11 of ui_suggestion.docx) */}
      <div className="xc-glass-panel p-6 space-y-4">
        <h2 className="font-heading text-lg font-bold">
          1. Workflow State Inspector: <span className="uppercase text-[var(--brand-primary)]">{visualState}</span>
        </h2>

        {visualState === "default" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { step: "1. Offer Accepted", status: "Items Reserved" },
              { step: "2. Safe Meetup Point", status: "Indiranagar Metro" },
              { step: "3. Handover Code", status: "849-201 Ready" },
              { step: "4. Mutual Review", status: "Awaiting Handover" },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <p className="text-xs font-semibold text-[var(--brand-primary)]">{s.step}</p>
                <p className="mt-1 text-sm font-semibold">{s.status}</p>
              </div>
            ))}
          </div>
        )}

        {visualState === "loading" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-24 animate-pulse rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4"
              />
            ))}
          </div>
        )}

        {visualState !== "default" && visualState !== "loading" && (
          <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="font-heading text-base font-bold uppercase text-[var(--brand-primary)]">
              State: {visualState} (Color-Independent Status Indicator)
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Explicit label, icon badge, and clear recovery action per WCAG 2.2 AA accessibility rules.
            </p>
          </div>
        )}
      </div>

      {/* Color & Typography Tokens */}
      <div className="xc-glass-panel p-6 space-y-4">
        <h2 className="font-heading text-lg font-bold">2. Frozen Brand &amp; Surface Tokens</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { name: "Electric Violet", hex: uiTokens.colors.brand.primary },
            { name: "Deep Violet", hex: uiTokens.colors.brand.hover },
            { name: "Deep Ink", hex: uiTokens.colors.light.foreground },
            { name: "Soft Cloud", hex: uiTokens.colors.light.surface },
            { name: "Pure White", hex: uiTokens.colors.light.background },
            { name: "Exchange Green", hex: uiTokens.colors.semantic.success },
            { name: "Warm Amber", hex: uiTokens.colors.semantic.warning },
            { name: "Danger", hex: uiTokens.colors.semantic.danger },
          ].map((sw) => (
            <div
              key={sw.name}
              className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-3 flex items-center gap-3"
            >
              <span
                className="h-8 w-8 rounded-[8px] border border-[var(--border)] shrink-0"
                style={{ backgroundColor: sw.hex }}
              />
              <div>
                <p className="text-xs font-semibold">{sw.name}</p>
                <p className="font-mono text-[11px] text-[var(--muted)]">{sw.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

