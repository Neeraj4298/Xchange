"use client";

import React, { useState } from "react";
import {
  formatInrFromPaise,
  type AiIdentificationResult,
  type ItemCondition,
} from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { useAppContext } from "@/components/providers/AppProviders";

interface Props {
  onAcceptSuggestion: (data: {
    title: string;
    description: string;
    categorySlug: string;
    condition: ItemCondition;
    minInr: number;
    maxInr: number;
    wantsKeywords: string;
  }) => void;
}

export function AiListingAssistPanel({ onAcceptSuggestion }: Props) {
  const { pushToast } = useAppContext();
  const [preset, setPreset] = useState("fujifilm-camera");
  const [loading, setLoading] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const [suggestion, setSuggestion] = useState<AiIdentificationResult | null>(null);

  const handleRunIdentify = async (simulateFallback = false) => {
    setLoading(true);
    setFallbackError(false);
    try {
      if (simulateFallback) {
        await new Promise((r) => setTimeout(r, 120));
        setFallbackError(true);
        pushToast({
          title: "AI Job Timed Out — Manual Fallback Active (WEB-3.4)",
          description: "Manual form controls remain 100% unlocked.",
          tone: "warning",
        });
        return;
      }
      const res = await apiClient.aiIdentifyItem({ imageHint: preset });
      setSuggestion(res.suggestion);
      pushToast({
        title: res.suggestion.cachedByImageHash
          ? "AI Suggestion (Image-Hash Cache Hit)"
          : "Gemini Vision Identification Complete",
        tone: "success",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (vote: "up" | "down") => {
    if (!suggestion) return;
    await apiClient.aiRecordValuationFeedback({ itemTitle: suggestion.title, vote });
    pushToast({
      title: vote === "up" ? "👍 Valuation Feedback Logged" : "👎 Range Feedback Logged",
    });
  };

  return (
    <div className="rounded-2xl border border-emerald-400/40 bg-emerald-950/25 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
          WEB-3.1 &amp; WEB-3.2 · GEMINI AI PHOTO ASSIST (&lt; 90s LISTING TIME)
        </span>

        <div className="flex flex-wrap gap-1.5">
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            aria-label="AI Photo Preset"
            className="rounded-xl border border-emerald-500/30 bg-slate-950/80 px-2.5 py-1.5 text-xs"
          >
            <option value="fujifilm-camera">Photo: Fujifilm X-T30 II</option>
            <option value="macbook-pro">Photo: MacBook Air M2</option>
            <option value="fender-guitar">Photo: Fender Stratocaster</option>
          </select>
          <button
            type="button"
            onClick={() => handleRunIdentify(false)}
            className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950"
          >
            ✨ Auto-Identify with AI
          </button>
          <button
            type="button"
            onClick={() => handleRunIdentify(true)}
            className="rounded-xl border border-amber-500/40 px-2.5 py-1.5 text-[11px] text-amber-300"
          >
            Test Fallback (WEB-3.4)
          </button>
        </div>
      </div>

      {loading && (
        <div className="h-14 animate-pulse rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-300">
          Analyzing photo pHash &amp; querying Gemini Vision adapter...
        </div>
      )}

      {fallbackError && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
          <strong>AI Fallback State (WEB-3.4):</strong> Provider timed out. Manual form controls remain unlocked.
        </div>
      )}

      {suggestion && !loading && (
        <div className="rounded-xl border border-emerald-500/30 bg-slate-950/70 p-3.5 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-emerald-400">
              {suggestion.brand} {suggestion.model} (
              {suggestion.cachedByImageHash ? "pHash Cache Hit" : "Fresh Job"})
            </span>
            <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 font-mono text-[11px] text-amber-300">
              {suggestion.valuation.label} · {Math.round(suggestion.valuation.confidence * 100)}% conf.
            </span>
          </div>

          <p className="font-mono text-sm font-bold text-emerald-300">
            {formatInrFromPaise(suggestion.valuation.estValueMinPaise)} –{" "}
            {formatInrFromPaise(suggestion.valuation.estValueMaxPaise)}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onAcceptSuggestion({
                  title: suggestion.title,
                  description: suggestion.description,
                  categorySlug: suggestion.categorySlug,
                  condition: suggestion.conditionSuggested,
                  minInr: Math.round(suggestion.valuation.estValueMinPaise / 100),
                  maxInr: Math.round(suggestion.valuation.estValueMaxPaise / 100),
                  wantsKeywords: suggestion.suggestedWants.join(", "),
                });
                pushToast({ title: "AI Suggestions Applied to Form!", tone: "success" });
              }}
              className="rounded-xl bg-emerald-500 px-3.5 py-1.5 font-bold text-slate-950"
            >
              ✓ Accept &amp; Fill Form
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleVote("up")}
                className="rounded-lg border border-emerald-500/30 px-2 py-1"
              >
                👍 Accurate
              </button>
              <button
                type="button"
                onClick={() => handleVote("down")}
                className="rounded-lg border border-red-500/30 px-2 py-1"
              >
                👎 Off-mark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
