"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiClient, FALLBACK_HEALTH } from "@/lib/api-client";
import { useAppContext } from "@/components/providers/AppProviders";

const CLUSTERS = ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield"];
const NAV_ITEMS = [
  { href: "/", label: "Cycle Studio", badge: "3-Way" },
  { href: "/chains", label: "Chain Lifecycle", badge: "v1.0" },
  { href: "/feed", label: "Discovery Feed", badge: "WEB-1.6" },
  { href: "/matches", label: "Smart Matches", badge: "v0.2" },
  { href: "/ai-studio", label: "AI Vision & Vector", badge: "v0.3" },
  { href: "/items/new", label: "List Item", badge: "+Swap" },
  { href: "/offers", label: "Offers Inbox", badge: "Lock" },
  { href: "/trades", label: "Trades & Code", badge: "6-Digit" },
  { href: "/plus", label: "Plus & ID Verify", badge: "₹149" },
  { href: "/scale", label: "Scale & 4-Way", badge: "v2.0" },
  { href: "/admin", label: "Admin Console", badge: "Mod" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme, selectedNeighbourhood, setSelectedNeighbourhood, user, pushToast } =
    useAppContext();
  const [apiStatus, setApiStatus] = useState<"live" | "standby">("live");
  const [apiVersion, setApiVersion] = useState<string>(FALLBACK_HEALTH.version);

  useEffect(() => {
    let active = true;
    apiClient
      .getHealth()
      .then((res) => {
        if (!active) return;
        setApiStatus(res.status === "ok" ? "live" : "standby");
        setApiVersion(res.version);
      })
      .catch(() => {
        if (active) setApiStatus("standby");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="xc-mesh-backdrop min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 xc-glass-panel border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-slate-950 font-black shadow-lg transition-transform duration-300 group-hover:rotate-12">
              <span className="text-lg">X</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight">Xchange</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                  BLR v{apiVersion}
                </span>
              </div>
              <p className="text-[11px] opacity-70 hidden sm:block">
                Own less. Exchange more. · 2-Way &amp; 3-Way Smart Barter
              </p>
            </div>
          </Link>
          <div className="hidden lg:flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-950/20 p-1">
            {CLUSTERS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setSelectedNeighbourhood(c);
                  pushToast({
                    title: `Cluster: ${c}`,
                    description: "PostGIS 1 km privacy grid updated.",
                  });
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedNeighbourhood === c
                    ? "bg-emerald-500 text-slate-950 font-semibold"
                    : "opacity-75 hover:opacity-100"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/25 px-3 py-1 text-xs">
              <span
                className={`h-2 w-2 rounded-full ${
                  apiStatus === "live" ? "bg-emerald-400 animate-ping" : "bg-amber-400"
                }`}
              />
              <span className="font-mono text-[11px]">
                /health: {apiStatus === "live" ? "200 OK" : "Seed"}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="xc-glass-panel rounded-xl px-3 py-2 text-xs font-medium"
            >
              {theme === "dark" ? "☀ Light" : "☾ Dark"}
            </button>
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md"
            >
              {user ? `✓ ${user.name.split(" ")[0]}` : "Sign In (OTP)"}
            </Link>
          </div>
        </div>

        <nav className="mx-auto hidden md:flex max-w-7xl items-center gap-2 px-6 pb-2.5 pt-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                pathname === item.href
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/35"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <span>{item.label}</span>
              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">
                {item.badge}
              </span>
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 md:px-6 md:py-8">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden xc-glass-panel border-t px-2 py-2 justify-around">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center rounded-xl px-3 py-1 text-[11px] font-medium ${
              pathname === item.href ? "text-emerald-400 font-bold" : "opacity-70"
            }`}
          >
            <span>{item.label}</span>
            <span className="text-[9px] font-mono opacity-75">{item.badge}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
