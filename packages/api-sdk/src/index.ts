/**
 * @xchange/api-sdk — Typed OpenAPI Client SDK (BE-0.4 & WEB-0.3)
 * Enforces contract-first communication between apps/web, apps/mobile, and apps/api.
 * Errors conform to RFC 9457 Problem Details (application/problem+json).
 */

import type {
  CategoryDto,
  ChainCycleNodeDto,
  CityDto,
  FeaturedItemDto,
  OtpRequestInput,
  OtpVerifyInput,
  VerificationLevel,
} from "@xchange/shared";

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code?: string;
}

export class ApiProblemError extends Error {
  public readonly status: number;
  public readonly problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail || problem.title || `API Error (${problem.status})`);
    this.name = "ApiProblemError";
    this.status = problem.status;
    this.problem = problem;
  }
}

export interface HealthResponse {
  status: "ok" | "degraded";
  service: string;
  version: string;
  phase: string;
  timestamp: string;
  uptimeSeconds: number;
  checks: {
    database: string;
    redis: string;
    matchingEngine: string;
  };
}

export interface PlatformConfigResponse {
  version: string;
  launchCluster: string;
  featureFlags: {
    "ai.assist.enabled": boolean;
    "matching.feed.enabled": boolean;
    "chains.enabled": boolean;
    "billing.enabled": boolean;
    "city.bengaluru": boolean;
  };
  limits: {
    offerExpiryHours: number;
    chainAcceptanceHours: number;
    maxCashAdjustmentInr: number;
    safeMeetupRadiusKm: number;
  };
}

export interface OtpRequestResponse {
  requestId: string;
  phoneMasked: string;
  expiresInSeconds: number;
  resendAfterSeconds: number;
  devOtpPreview?: string;
}

export interface AuthenticatedUserDto {
  id: string;
  phoneMasked: string;
  name: string;
  neighbourhood: string;
  citySlug: string;
  verificationLevel: VerificationLevel;
  ratingAvg: number;
  tradesCompleted: number;
  joinedAt: string;
}

export interface OtpVerifyResponse {
  accessToken: string;
  expiresInSeconds: number;
  user: AuthenticatedUserDto;
}

export interface DiscoveryShowcaseResponse {
  cities: CityDto[];
  categories: CategoryDto[];
  featuredItems: FeaturedItemDto[];
  sampleThreeWayChain: {
    chainId: string;
    city: string;
    meetupPointName: string;
    meetupDistanceKm: number;
    expiresInHours: number;
    minEdgeScore: number;
    nodes: ChainCycleNodeDto[];
  };
}

export interface XchangeApiClientOptions {
  baseUrl?: string;
  getAccessToken?: () => string | null;
  fetchImpl?: typeof fetch;
}

export class XchangeApiClient {
  private readonly baseUrl: string;
  private readonly getAccessToken?: () => string | null;
  private readonly fetchImpl: typeof fetch;

  constructor(options: XchangeApiClientOptions = {}) {
    this.baseUrl = (
      options.baseUrl ||
      (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
      "http://localhost:4000"
    ).replace(/\/$/, "");
    this.getAccessToken = options.getAccessToken;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async request<T>(
    path: string,
    init: RequestInit & { idempotencyKey?: string } = {}
  ): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json, application/problem+json");
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (init.idempotencyKey) {
      headers.set("Idempotency-Key", init.idempotencyKey);
    }
    const token = this.getAccessToken?.();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      let problem: ProblemDetails = {
        type: "https://xchange.in/problems/internal-error",
        title: response.statusText || "Request failed",
        status: response.status,
      };
      try {
        const body = (await response.json()) as Partial<ProblemDetails>;
        problem = {
          ...problem,
          ...body,
          status: body.status ?? response.status,
        };
      } catch {
        // Fallback when error body is not JSON
      }
      throw new ApiProblemError(problem);
    }

    return (await response.json()) as T;
  }

  public getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/health");
  }

  public getConfig(): Promise<PlatformConfigResponse> {
    return this.request<PlatformConfigResponse>("/v1/config");
  }

  public getShowcase(): Promise<DiscoveryShowcaseResponse> {
    return this.request<DiscoveryShowcaseResponse>("/v1/showcase");
  }

  public getCities(): Promise<{ items: CityDto[] }> {
    return this.request<{ items: CityDto[] }>("/v1/cities");
  }

  public getCategories(): Promise<{ items: CategoryDto[] }> {
    return this.request<{ items: CategoryDto[] }>("/v1/categories");
  }

  public requestOtp(input: OtpRequestInput): Promise<OtpRequestResponse> {
    return this.request<OtpRequestResponse>("/v1/auth/otp/request", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public verifyOtp(input: OtpVerifyInput): Promise<OtpVerifyResponse> {
    return this.request<OtpVerifyResponse>("/v1/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public getMe(accessTokenOverride?: string): Promise<{ user: AuthenticatedUserDto }> {
    const headers: Record<string, string> = {};
    if (accessTokenOverride) {
      headers.Authorization = `Bearer ${accessTokenOverride}`;
    }
    return this.request<{ user: AuthenticatedUserDto }>("/v1/me", {
      method: "GET",
      headers,
    });
  }
}

export function createXchangeApiClient(options?: XchangeApiClientOptions): XchangeApiClient {
  return new XchangeApiClient(options);
}
