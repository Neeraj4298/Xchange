"use client";

import React, { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAppContext } from "@/components/providers/AppProviders";

export default function SettingsPage() {
  const { theme, toggleTheme, pushToast } = useAppContext();
  const [radiusKm, setRadiusKm] = useState(8);
  const [cashAccepted, setCashAccepted] = useState(true);
  const [handoverPref, setHandoverPref] = useState("local_meetup");

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Manage your account, exchange preferences, appearance, privacy and support.
        </p>
      </div>

      {/* 1. Appearance (Light / Dark) */}
      <section className="xc-glass-panel p-6 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-base font-bold">Appearance</h2>
          <p className="text-xs text-[var(--muted)]">
            Switch between Xchange Pure Light (#FFFFFF) and Solid Dark (#11111B) themes.
          </p>
        </div>
        <button type="button" onClick={toggleTheme} className="xc-btn-secondary px-4 py-2 text-xs">
          Current: {theme === "dark" ? "Dark theme" : "Light theme"} (Switch)
        </button>
      </section>

      {/* 2. Exchange Preferences */}
      <section className="xc-glass-panel p-6 space-y-4">
        <h2 className="font-heading text-base font-bold">Exchange preferences</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
          <label className="block font-medium">
            Default location radius ({radiusKm} km)
            <input
              type="range"
              min={2}
              max={25}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="mt-2 w-full accent-[#7167E8]"
            />
          </label>
          <label className="block font-medium">
            Handover preference
            <select
              value={handoverPref}
              onChange={(e) => setHandoverPref(e.target.value)}
              className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2"
            >
              <option value="local_meetup">Local safe meetup</option>
              <option value="self_delivery">Self-arranged delivery</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pt-5 font-medium">
            <input
              type="checkbox"
              checked={cashAccepted}
              onChange={(e) => setCashAccepted(e.target.checked)}
              className="accent-[#7167E8]"
            />
            Accept optional cash adjustment
          </label>
        </div>
      </section>

      {/* 3. Account, Privacy & Support */}
      <section className="xc-glass-panel p-6 space-y-4">
        <h2 className="font-heading text-base font-bold">Account, Privacy &amp; Data Rights</h2>
        <p className="text-xs text-[var(--muted)]">
          Your exact address and phone number are never shown publicly. Locations are rounded to an approximate 1 km locality cell.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={async () => {
              await apiClient.exportMyData();
              pushToast({
                title: "Data export ready",
                description: "Machine-readable JSON export generated (DPDP Act).",
                tone: "success",
              });
            }}
            className="xc-btn-secondary px-4 py-2 text-xs"
          >
            Export my data (JSON)
          </button>
          <button
            type="button"
            onClick={() =>
              pushToast({
                title: "Account deletion requested",
                description: "Active listings will be removed and pending offers withdrawn.",
                tone: "warning",
              })
            }
            className="rounded-[12px] border border-[var(--danger)] px-4 py-2 text-xs font-semibold text-[var(--danger)]"
          >
            Delete account
          </button>
        </div>
      </section>
    </div>
  );
}
