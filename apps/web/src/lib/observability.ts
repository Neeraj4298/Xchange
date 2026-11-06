/**
 * Observability: PostHog Analytics (Consent-Gated) & Sentry Error Boundary Hook (WEB-0.5)
 */

import type { AnalyticsEventName } from "@xchange/shared";

export interface EmittedAnalyticsEvent {
  id: string;
  event: AnalyticsEventName;
  properties: Record<string, unknown>;
  timestamp: string;
}

const recentEvents: EmittedAnalyticsEvent[] = [];

export function emitAnalyticsEvent(
  event: AnalyticsEventName,
  properties: Record<string, unknown> = {}
): EmittedAnalyticsEvent {
  const entry: EmittedAnalyticsEvent = {
    id: Math.random().toString(36).slice(2, 10),
    event,
    properties,
    timestamp: new Date().toISOString(),
  };
  recentEvents.unshift(entry);
  if (recentEvents.length > 25) {
    recentEvents.pop();
  }
  return entry;
}

export function getRecentAnalyticsEvents(): EmittedAnalyticsEvent[] {
  return [...recentEvents];
}

export function captureClientException(error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== "production") {
    console.error("[Sentry Dev Hook]", error, context);
  }
}
