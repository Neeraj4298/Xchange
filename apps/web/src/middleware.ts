/**
 * Next.js Security & Route Guard Middleware (WEB-0.2 & WEB-0.5)
 * Sets strict security headers, CSP, and referrer policies per Web Spec Section 7.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' http://localhost:4000 http://127.0.0.1:4000 ws://localhost:4000",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  // Route guard metadata header for observability tracing
  response.headers.set("X-Xchange-Route", request.nextUrl.pathname);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
