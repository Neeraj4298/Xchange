"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AuthenticatedUserDto } from "@xchange/api-sdk";
import { setClientAccessToken } from "@/lib/api-client";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone?: "success" | "warning" | "danger" | "info";
}

interface AppContextValue {
  theme: "dark" | "light";
  toggleTheme: () => void;
  selectedNeighbourhood: string;
  setSelectedNeighbourhood: (n: string) => void;
  user: AuthenticatedUserDto | null;
  accessToken: string | null;
  setSession: (token: string | null, user: AuthenticatedUserDto | null) => void;
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used inside <AppProviders />");
  }
  return ctx;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState<string>("Indiranagar");
  const [user, setUser] = useState<AuthenticatedUserDto | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setSession = useCallback(
    (token: string | null, nextUser: AuthenticatedUserDto | null) => {
      setAccessToken(token);
      setUser(nextUser);
      setClientAccessToken(token);
    },
    []
  );

  const pushToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        selectedNeighbourhood,
        setSelectedNeighbourhood,
        user,
        accessToken,
        setSession,
        pushToast,
      }}
    >
      {children}

      {/* Xchange Pure Solid Toast Viewport (No blur, subtle shadow) */}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-20 right-4 z-50 flex max-w-sm flex-col gap-2 md:bottom-6 md:right-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="rounded-[12px] border border-[var(--border)] bg-[var(--elevated)] px-4 py-3 shadow-dropdown"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    t.tone === "danger"
                      ? "var(--danger)"
                      : t.tone === "warning"
                      ? "var(--warning)"
                      : "var(--success)",
                }}
              />
              <p className="text-sm font-semibold text-[var(--foreground)]">{t.title}</p>
            </div>
            {t.description && (
              <p className="mt-1 text-xs text-[var(--muted)]">{t.description}</p>
            )}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}
