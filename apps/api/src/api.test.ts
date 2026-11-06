import test from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { createApiServer } from "./app";

test("Phase 0 API Exit Gate: /health, /v1/config, /v1/showcase, and Phone OTP sign-in -> protected /v1/me", async () => {
  process.env.NODE_ENV = "test";
  const server = createApiServer();

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 1. Verify /health
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.equal(healthRes.status, 200);
    const health = (await healthRes.json()) as { status: string; service: string };
    assert.equal(health.status, "ok");
    assert.equal(health.service, "xchange-api");

    // 2. Verify /v1/config
    const configRes = await fetch(`${baseUrl}/v1/config`);
    assert.equal(configRes.status, 200);
    const config = (await configRes.json()) as {
      featureFlags: Record<string, boolean>;
      limits: { offerExpiryHours: number };
    };
    assert.equal(config.featureFlags["chains.enabled"], true);
    assert.equal(config.limits.offerExpiryHours, 72);

    // 3. Verify /v1/showcase (Bengaluru cluster & 3-way chain)
    const showcaseRes = await fetch(`${baseUrl}/v1/showcase`);
    assert.equal(showcaseRes.status, 200);
    const showcase = (await showcaseRes.json()) as {
      cities: Array<{ slug: string }>;
      sampleThreeWayChain: { nodes: unknown[] };
    };
    assert.equal(showcase.cities[0]?.slug, "bengaluru");
    assert.equal(showcase.sampleThreeWayChain.nodes.length, 3);

    // 4. Verify unauthenticated call to /v1/me returns 401 RFC 9457 problem+json
    const unauthRes = await fetch(`${baseUrl}/v1/me`);
    assert.equal(unauthRes.status, 401);
    const unauthProblem = (await unauthRes.json()) as { code: string };
    assert.equal(unauthProblem.code, "UNAUTHORIZED");

    // 5. Phase 0 Exit Gate: Request OTP -> Verify OTP -> Call protected /v1/me
    const otpReqRes = await fetch(`${baseUrl}/v1/auth/otp/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneE164: "+919876543210" }),
    });
    assert.equal(otpReqRes.status, 200);
    const otpReqData = (await otpReqRes.json()) as {
      expiresInSeconds: number;
      devOtpPreview: string;
    };
    assert.equal(otpReqData.expiresInSeconds, 300);
    assert.equal(otpReqData.devOtpPreview, "424242");

    const otpVerifyRes = await fetch(`${baseUrl}/v1/auth/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneE164: "+919876543210",
        otpCode: "424242",
        deviceId: "test-suite",
      }),
    });
    assert.equal(otpVerifyRes.status, 200);
    const verifyData = (await otpVerifyRes.json()) as { accessToken: string };
    assert.ok(verifyData.accessToken, "Should return JWT accessToken");

    const meRes = await fetch(`${baseUrl}/v1/me`, {
      headers: { Authorization: `Bearer ${verifyData.accessToken}` },
    });
    assert.equal(meRes.status, 200);
    const meData = (await meRes.json()) as {
      user: { citySlug: string; phoneMasked: string };
    };
    assert.equal(meData.user.citySlug, "bengaluru");
    assert.equal(meData.user.phoneMasked, "+9198•••••210");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
