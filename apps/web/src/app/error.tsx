"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { captureClientException } from "@/lib/observability";

export default function GlobalRouteErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureClientException(error, { boundary: "app/error.tsx" });
  }, [error]);

  return (
    <div className="mx-auto max-w-xl py-12">
      <div className="xc-glass-panel rounded-3xl border border-amber-400/40 p-8 text-center space-y-4">
        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
          SAFETY FALLBACK BOUNDARY (WEB-0.3)
        </span>
        <h1 className="text-2xl font-extrabold">We caught an unexpected UI state</h1>
        <p className="text-xs opacity-80">
          {error.message || "A temporary rendering or network condition occurred. Your trade state and items remain safe."}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950"
          >
            ↻ Retry Screen
          </button>
          <Link
            href="/"
            className="xc-glass-panel rounded-xl px-5 py-2.5 text-xs font-semibold"
          >
            Return to Cycle Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
