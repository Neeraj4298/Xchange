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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
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
    }, 4200);
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

      {/* Accessible ARIA Live Toast Viewport (WCAG 2.1 AA — Web Spec Section 4) */}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-20 right-4 z-50 flex max-w-sm flex-col gap-2.5 md:bottom-6 md:right-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="xc-glass-panel rounded-2xl px-4 py-3 shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  t.tone === "danger"
                    ? "bg-red-500"
                    : t.tone === "warning"
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
              />
              <p className="text-sm font-semibold">{t.title}</p>
            </div>
            {t.description && (
              <p className="mt-1 text-xs opacity-80">{t.description}</p>
            )}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}
