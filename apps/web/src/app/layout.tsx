import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Xchange — Own less. Exchange more. | 2-Way & 3-Way Smart Barter Marketplace",
  description:
    "Bengaluru's high-trust peer-to-peer circular exchange marketplace with AI-assisted valuation ranges and 3-way barter cycle discovery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased selection:bg-emerald-500 selection:text-slate-950">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
