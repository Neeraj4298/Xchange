"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiClient, FALLBACK_HEALTH } from "@/lib/api-client";
import { useAppContext } from "@/components/providers/AppProviders";

const CLUSTERS = ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield"];
const NAV_ITEMS = [
  { href: "/app", label: "Home" },
  { href: "/feed", label: "Explore" },
  { href: "/my-items", label: "My Listings" },
  { href: "/offers", label: "My Exchanges" },
  { href: "/chat", label: "Messages" },
  { href: "/saved", label: "Saved Items" },
];
const SECONDARY_NAV_ITEMS = [
  { href: "/chains", label: "Exchange Chains" },
  { href: "/ai-studio", label: "AI Listing Assist" },
  { href: "/trust", label: "Help and Support" },
  { href: "/settings", label: "Settings" },
  { href: "/admin", label: "Admin Moderation" },
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

  const isPublicRoute = pathname === "/" || pathname === "/login";

  if (isPublicRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--brand-primary)] text-white font-heading font-bold text-sm">
                  X
                </div>
                <span className="font-heading text-lg font-bold tracking-tight">XCHANGE</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--muted)]">
                <Link href="/feed" className="hover:text-[var(--foreground)]">Explore</Link>
                <Link href="/#how-it-works" className="hover:text-[var(--foreground)]">How it works</Link>
                <Link href="/#categories" className="hover:text-[var(--foreground)]">Categories</Link>
                <Link href="/app" className="hover:text-[var(--foreground)]">Home Dashboard</Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={toggleTheme} className="xc-btn-secondary px-3 py-2 text-xs">
                {theme === "dark" ? "Light" : "Dark"}
              </button>
              <Link href="/login" className="px-3 py-2 text-sm font-semibold hover:text-[var(--brand-primary)]">
                {user ? user.name.split(" ")[0] : "Sign in"}
              </Link>
              <Link href="/items/new" className="xc-btn-primary px-4 py-2.5 text-sm">
                List an item
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8 md:py-12">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)]">
      <aside className="hidden lg:flex w-[240px] shrink-0 flex-col justify-between border-r border-[var(--border)] bg-[var(--background)] p-5 sticky top-0 h-screen">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2.5 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--brand-primary)] text-white font-heading font-bold text-sm">
              X
            </div>
            <div>
              <span className="font-heading text-base font-bold tracking-tight block leading-none">
                XCHANGE
              </span>
              <span className="text-[11px] text-[var(--muted)]">Pure v{apiVersion}</span>
            </div>
          </Link>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-[10px] px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-[var(--brand-tint)] text-[var(--brand-primary)] font-semibold"
                    : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-[var(--border)] pt-4 space-y-1">
            {SECONDARY_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-[10px] px-3 py-1.5 text-xs font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-[var(--brand-tint)] text-[var(--brand-primary)] font-semibold"
                    : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-4">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-[12px] p-2 hover:bg-[var(--surface)]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border)] font-heading text-xs font-bold text-[var(--brand-primary)]">
              {user ? user.name.slice(0, 2).toUpperCase() : "AV"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user ? user.name : "Aarav Verma"}</p>
              <p className="truncate text-[11px] text-[var(--muted)]">{selectedNeighbourhood}</p>
            </div>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)] px-4 py-3.5 md:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {CLUSTERS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setSelectedNeighbourhood(c);
                    pushToast({ title: `Location: ${c}, Bengaluru` });
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                    selectedNeighbourhood === c
                      ? "bg-[var(--brand-primary)] text-white font-semibold"
                      : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs text-[var(--muted)]">
                {apiStatus === "live" ? "● Live" : "● Seed"}
              </span>
              <Link href="/notifications" className="xc-btn-secondary px-3 py-2 text-xs">
                Alerts
              </Link>
              <Link href="/chat" className="xc-btn-secondary px-3 py-2 text-xs">
                Messages
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                className="xc-btn-secondary px-3 py-2 text-xs"
              >
                {theme === "dark" ? "Light" : "Dark"}
              </button>
              <Link href="/items/new" className="xc-btn-primary px-3.5 py-2 text-xs">
                + List item
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-24 md:px-8">
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden border-t border-[var(--border)] bg-[var(--background)] px-2 py-2.5 justify-around">
          {[
            { href: "/app", label: "Home" },
            { href: "/feed", label: "Explore" },
            { href: "/items/new", label: "List" },
            { href: "/offers", label: "Exchanges" },
            { href: "/profile", label: "Profile" },
          ].map((item) => (
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
    </div>
  );
}
