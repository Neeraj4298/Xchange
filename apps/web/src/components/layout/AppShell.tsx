"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiClient, FALLBACK_HEALTH } from "@/lib/api-client";
import { useAppContext } from "@/components/providers/AppProviders";

const CLUSTERS = ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield"];
const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Explore" },
  { href: "/matches", label: "Matches" },
  { href: "/chains", label: "Exchange Chains" },
  { href: "/items/new", label: "Create Listing" },
  { href: "/offers", label: "Offers" },
  { href: "/trades", label: "Trades" },
  { href: "/chat", label: "Messages" },
  { href: "/ai-studio", label: "AI Assist" },
  { href: "/plus", label: "Plus" },
  { href: "/scale", label: "Multi-City" },
  { href: "/admin", label: "Admin" },
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
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--brand-primary)] text-white font-heading font-bold text-base">
                X
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-lg font-bold tracking-tight">XCHANGE</span>
                  <span className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted)]">
                    Pure v{apiVersion}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)] hidden sm:block">
                  Own less. Exchange more.
                </p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1 rounded-full bg-[var(--surface)] border border-[var(--border)] p-1">
              {CLUSTERS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setSelectedNeighbourhood(c);
                    pushToast({
                      title: `Location: ${c}, Bengaluru`,
                      description: "Showing nearby listings within your 1 km privacy grid.",
                    });
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedNeighbourhood === c
                      ? "bg-[var(--brand-primary)] text-white font-semibold"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: apiStatus === "live" ? "var(--success)" : "var(--warning)",
                }}
              />
              <span>{apiStatus === "live" ? "Bengaluru Live" : "Local Seed"}</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="xc-btn-secondary px-3 py-2 text-xs"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>

            <Link href="/login" className="xc-btn-primary px-4 py-2 text-xs">
              {user ? user.name.split(" ")[0] : "Sign in"}
            </Link>
          </div>
        </div>

        <nav className="mx-auto hidden md:flex max-w-7xl items-center gap-1.5 overflow-x-auto px-6 pb-2.5 pt-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-[10px] px-3 py-1.5 text-xs font-medium transition-colors ${
                pathname === item.href
                  ? "bg-[var(--brand-tint)] text-[var(--brand-primary)] font-semibold"
                  : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-24 md:px-6 md:py-10">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t border-[var(--border)] bg-[var(--background)] px-2 py-2.5 justify-around">
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-[10px] px-3 py-1 text-xs font-medium ${
              pathname === item.href
                ? "text-[var(--brand-primary)] font-semibold"
                : "text-[var(--muted)]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
