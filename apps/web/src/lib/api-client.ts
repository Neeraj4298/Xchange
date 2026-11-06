import { createXchangeApiClient } from "@xchange/api-sdk";

export { FALLBACK_HEALTH, FALLBACK_SHOWCASE } from "./fallback-data";

let inMemoryAccessToken: string | null = null;

export function setClientAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getClientAccessToken(): string | null {
  return inMemoryAccessToken;
}

export const apiClient = createXchangeApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  getAccessToken: () => inMemoryAccessToken,
});
