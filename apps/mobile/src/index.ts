/**
 * Xchange Mobile Application Skeleton (P0-T1 & Phase 0 Exit Gate)
 * Uses @xchange/api-sdk and @xchange/ui-tokens for cross-platform iOS & Android parity.
 */

import { createXchangeApiClient } from "@xchange/api-sdk";
import { uiTokens } from "@xchange/ui-tokens";

export const mobileThemeTokens = uiTokens;

export function createMobileApiClient(baseUrl = "http://localhost:4000", token?: string) {
  return createXchangeApiClient({
    baseUrl,
    getAccessToken: () => token ?? null,
  });
}
