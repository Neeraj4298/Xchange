"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { NotificationDto } from "@xchange/shared";
import { apiClient } from "@/lib/api-client";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);

  const loadNotifications = () => {
    apiClient
      .getNotifications()
      .then((res) => setNotifications(res.items))
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Updates on your incoming offers, counteroffers, messages and exchange chains.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={async () => {
              await apiClient.markNotificationsRead();
              loadNotifications();
            }}
            className="xc-btn-secondary px-4 py-2 text-xs"
          >
            Mark all as read
          </button>
          <Link href="/settings" className="xc-btn-secondary px-4 py-2 text-xs">
            Preferences
          </Link>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="xc-glass-panel p-8 text-center text-sm text-[var(--muted)]">
          You have no notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="xc-glass-panel p-4 flex items-center justify-between gap-4 text-xs"
            >
              <div>
                <p className="font-heading text-sm font-semibold">{n.title}</p>
                <p className="mt-1 text-[var(--muted)]">{n.body}</p>
              </div>
              <Link
                href="/offers"
                className="font-semibold text-[var(--brand-primary)] hover:underline shrink-0"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
