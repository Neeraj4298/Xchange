"use client";

import React, { useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useAppContext } from "@/components/providers/AppProviders";

export default function ProfilePage() {
  const { user, pushToast } = useAppContext();
  const [name, setName] = useState(user?.name || "Aarav Verma");
  const [username, setUsername] = useState("aarav_blr");
  const [locality, setLocality] = useState(user?.neighbourhood || "Indiranagar, Bengaluru");
  const [bio, setBio] = useState(
    "Product designer & photography enthusiast trading cameras, books and studio gear."
  );
  const [accountType, setAccountType] = useState<"individual" | "business">("individual");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.updateProfile({ name, neighbourhood: locality, bio });
    } catch {}
    pushToast({ title: "Profile updated", tone: "success" });
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Screen 23 — Public Profile Summary */}
      <div className="lg:col-span-5 xc-glass-panel p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] font-heading text-xl font-bold text-[var(--brand-primary)]">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">{name}</h1>
            <p className="text-xs text-[var(--muted)]">
              @{username} · {locality}
            </p>
            <p className="mt-1 text-xs font-medium" style={{ color: "var(--success)" }}>
              Phone verified · Member since 2026
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--muted)] leading-relaxed">{bio}</p>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="font-heading text-lg font-bold">4.92 ★</p>
            <p className="text-[11px] text-[var(--muted)]">Reputation</p>
          </div>
          <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="font-heading text-lg font-bold">6</p>
            <p className="text-[11px] text-[var(--muted)]">Exchanges</p>
          </div>
          <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="font-heading text-lg font-bold">3</p>
            <p className="text-[11px] text-[var(--muted)]">Active listings</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/my-items" className="xc-btn-primary flex-1 py-2.5 text-center text-xs">
            View listings
          </Link>
          <Link href="/settings" className="xc-btn-secondary px-4 py-2.5 text-xs">
            Settings
          </Link>
        </div>
      </div>

      {/* Screen 24 — Edit My Profile */}
      <form onSubmit={handleSave} className="lg:col-span-7 xc-glass-panel p-6 space-y-4">
        <h2 className="font-heading text-xl font-bold">Edit my profile</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <label className="block font-medium">
            Display name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block font-medium">
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block font-medium">
            City and locality (Approximate level)
            <input
              type="text"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block font-medium">
            Account type
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as "individual" | "business")}
              className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2 text-sm"
            >
              <option value="individual">Individual</option>
              <option value="business">Business</option>
            </select>
          </label>
        </div>

        <label className="block text-xs font-medium">
          About / Bio
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2 text-sm"
          />
        </label>

        <button type="submit" className="xc-btn-primary px-6 py-2.5 text-sm">
          Save profile changes
        </button>
      </form>
    </div>
  );
}
