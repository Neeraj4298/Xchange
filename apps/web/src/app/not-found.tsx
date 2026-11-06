import React from "react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl py-12">
      <div className="xc-glass-panel rounded-3xl p-8 text-center space-y-4">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
          404 · LISTING OR ROUTE NOT FOUND
        </span>
        <h1 className="text-2xl font-extrabold">This item or page has moved</h1>
        <p className="text-xs opacity-75">
          Explore active Bengaluru listings on the Discovery Feed or inspect live 3-way barter cycles.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/feed"
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950"
          >
            Browse Discovery Feed →
          </Link>
          <Link
            href="/"
            className="xc-glass-panel rounded-xl px-5 py-2.5 text-xs font-semibold"
          >
            3-Way Cycle Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
