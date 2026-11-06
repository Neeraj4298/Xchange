/**
 * Modular Monolith HTTP Application Router (BE-0.2, BE-0.4, P0-T5)
 */

import http, { type IncomingMessage, type ServerResponse } from "node:http";
import { loadAppConfig, logger } from "./config/env.config";
import { sendJson, sendProblemJson } from "./common/problem-details";
import { HealthService } from "./modules/health/health.service";
import { CatalogService } from "./modules/catalog/catalog.service";
import { AuthService, AuthServiceError } from "./modules/auth/auth.service";
import { buildOpenApiSpec } from "./openapi/generate-openapi";
import { createMarketplaceRouter } from "./modules/marketplace/marketplace.router";

const MAX_BODY_BYTES = 1024 * 1024; // 1 MB payload cap

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    totalBytes += buf.length;
    if (totalBytes > MAX_BODY_BYTES) {
      throw new AuthServiceError(
        413,
        "PAYLOAD_TOO_LARGE",
        "Request payload exceeds 1 MB limit",
        "Reduce request body size below 1 MB."
      );
    }
    chunks.push(buf);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new AuthServiceError(
      400,
      "BAD_JSON",
      "Malformed JSON request body",
      "Ensure request payload is valid UTF-8 JSON."
    );
  }
}

export function createApiServer() {
  const config = loadAppConfig();
  const healthService = new HealthService();
  const catalogService = new CatalogService();
  const authService = new AuthService();
  const handleMarketplaceRoute = createMarketplaceRouter(authService);

  const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const method = req.method || "GET";
    const urlObj = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = urlObj.pathname;

    // Security & CORS headers (System Design Section 11)
    res.setHeader("Access-Control-Allow-Origin", config.corsOrigin === "*" ? "*" : "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Idempotency-Key"
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");

    if (method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      if (method === "GET" && (pathname === "/health" || pathname === "/v1/health")) {
        sendJson(res, 200, healthService.getHealthStatus());
        return;
      }

      if (method === "GET" && pathname === "/v1/config") {
        sendJson(res, 200, healthService.getPlatformConfig());
        return;
      }

      if (method === "GET" && pathname === "/v1/openapi.json") {
        sendJson(res, 200, buildOpenApiSpec());
        return;
      }

      if (method === "GET" && pathname === "/v1/cities") {
        sendJson(res, 200, catalogService.getCities());
        return;
      }

      if (method === "GET" && pathname === "/v1/categories") {
        sendJson(res, 200, catalogService.getCategories());
        return;
      }

      if (method === "GET" && pathname === "/v1/showcase") {
        sendJson(res, 200, catalogService.getShowcase());
        return;
      }

      if (method === "POST" && pathname === "/v1/auth/otp/request") {
        const body = await readJsonBody(req);
        const result = authService.requestOtp(body);
        sendJson(res, 200, result);
        return;
      }

      if (method === "POST" && pathname === "/v1/auth/otp/verify") {
        const body = await readJsonBody(req);
        const result = authService.verifyOtp(body);
        sendJson(res, 200, result);
        return;
      }

      if (method === "GET" && pathname === "/v1/me") {
        const result = authService.getAuthenticatedUser(req.headers.authorization);
        sendJson(res, 200, result);
        return;
      }

      const handled = await handleMarketplaceRoute(
        method,
        pathname,
        urlObj,
        req,
        res,
        readJsonBody
      );
      if (handled) return;

      sendProblemJson(res, {
        status: 404,
        code: "NOT_FOUND",
        title: "Endpoint not found",
        detail: `No route registered for ${method} ${pathname}`,
        instance: pathname,
      });
    } catch (err) {
      if (err instanceof AuthServiceError) {
        sendProblemJson(res, {
          status: err.status,
          code: err.code,
          title: err.title,
          detail: err.message,
          instance: pathname,
        });
        return;
      }
      logger.error("Unhandled API exception", {
        path: pathname,
        error: err instanceof Error ? err.message : String(err),
      });
      sendProblemJson(res, {
        status: 500,
        code: "INTERNAL_ERROR",
        title: "Internal server error",
        detail: "An unexpected error occurred while processing the request.",
        instance: pathname,
      });
    }
  });

  return server;
}
