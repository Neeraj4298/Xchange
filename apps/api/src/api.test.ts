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

    // 6. Phase 1 End-to-End Flow: Prohibited-Item Guard (422) + Create & Publish Listing
    const blockedRes = await fetch(`${baseUrl}/v1/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Imported vape kit and whiskey",
        description: "Brand new sealed item for quick trade",
        categorySlug: "workstation-audio",
        condition: "new",
        estValueMinPaise: 50000,
        estValueMaxPaise: 80000,
      }),
    });
    assert.equal(blockedRes.status, 422);

    const createItemRes = await fetch(`${baseUrl}/v1/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": "idem-create-item-1",
      },
      body: JSON.stringify({
        title: "Keychron Q1 Pro Mechanical Keyboard",
        description: "CNC aluminum body, tactile switches, mint condition in HSR Layout",
        categorySlug: "workstation-audio",
        condition: "like_new",
        estValueMinPaise: 1400000,
        estValueMaxPaise: 1650000,
        neighbourhood: "HSR Layout",
        wants: { keywords: ["Sony WH-1000XM5", "4K Monitor"] },
      }),
    });
    assert.equal(createItemRes.status, 201);
    const createdItem = (await createItemRes.json()) as { item: { id: string; status: string } };
    assert.equal(createdItem.item.status, "active");

    // 7. Pre-accept Chat Masking Check (FR-CHT-2)
    const maskedChatRes = await fetch(`${baseUrl}/v1/conversations/conv-seed-101/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: "Call me on +91 9876543210 or visit https://myshop.com",
      }),
    });
    assert.equal(maskedChatRes.status, 201);
    const maskedChat = (await maskedChatRes.json()) as {
      message: { body: string; maskedWarning: boolean };
    };
    assert.equal(maskedChat.message.maskedWarning, true);
    assert.match(maskedChat.message.body, /\[Phone hidden until trade accepted\]/);
    assert.match(maskedChat.message.body, /\[Link hidden until trade accepted\]/);

    // 8. Counteroffer -> Accept Offer (Atomic Item Locking) -> Schedule -> Handover Codes -> Complete -> Double-Blind Review
    const counterRes = await fetch(`${baseUrl}/v1/offers/offer-seed-101/counter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cash: { amountPaise: 250000, direction: "recipient_pays" },
        message: "Counteroffer v2",
      }),
    });
    assert.equal(counterRes.status, 200);
    const counterData = (await counterRes.json()) as { offer: { id: string; version: number } };
    assert.equal(counterData.offer.version, 2);

    const acceptRes = await fetch(`${baseUrl}/v1/offers/${counterData.offer.id}/accept`, {
      method: "POST",
    });
    assert.equal(acceptRes.status, 200);
    const acceptData = (await acceptRes.json()) as {
      offer: { status: string };
      trade: { id: string; status: string };
    };
    assert.equal(acceptData.offer.status, "accepted");
    assert.equal(acceptData.trade.status, "scheduling");

    const tradeId = acceptData.trade.id;
    const schedRes = await fetch(`${baseUrl}/v1/trades/${tradeId}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        safePointId: "sp-indiranagar-metro",
        scheduledAt: new Date().toISOString(),
      }),
    });
    assert.equal(schedRes.status, 200);

    const confirm1 = await fetch(`${baseUrl}/v1/trades/${tradeId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handoverCode: "849201" }),
    });
    const confirm1Data = (await confirm1.json()) as { trade: { status: string } };
    assert.equal(confirm1Data.trade.status, "partially_confirmed");

    const confirm2 = await fetch(`${baseUrl}/v1/trades/${tradeId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handoverCode: "512904" }),
    });
    const confirm2Data = (await confirm2.json()) as { trade: { status: string } };
    assert.equal(confirm2Data.trade.status, "completed");

    const revRes = await fetch(`${baseUrl}/v1/trades/${tradeId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stars: 5, tags: ["accurate_listing", "punctual"] }),
    });
    assert.equal(revRes.status, 201);
    const revData = (await revRes.json()) as { reviews: Array<{ revealed: boolean }> };
    assert.equal(revData.reviews[0]?.revealed, true);

    // 9. Admin Dashboard & Moderation Queue
    const adminRes = await fetch(`${baseUrl}/v1/admin/dashboard`);
    assert.equal(adminRes.status, 200);
    const adminData = (await adminRes.json()) as {
      metrics: { completedTrades: number };
      auditEvents: unknown[];
    };
    assert.ok(adminData.metrics.completedTrades >= 21);
    assert.ok(adminData.auditEvents.length >= 4);

    // 10. Phase 2 Smart Matching Lite Exit Gate: 5-Factor Scoring, 2-Way Mutual Match, Saved Searches & >=30% Recommendation Offer Share
    const matchesRes = await fetch(`${baseUrl}/v1/matches`);
    assert.equal(matchesRes.status, 200);
    const matchesData = (await matchesRes.json()) as {
      items: Array<{ id: string; score: number; isMutualMatch: boolean }>;
      telemetry: { recommendationOfferSharePercent: number; phase2ExitGatePassed: boolean };
    };
    assert.ok(matchesData.items.length >= 2, "Should compute smart match candidates");
    const firstMatch = matchesData.items[0]!;
    assert.ok(firstMatch.score >= 70);

    const matchOfferRes = await fetch(`${baseUrl}/v1/matches/${firstMatch.id}/offer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cashPaise: 100000 }),
    });
    assert.equal(matchOfferRes.status, 201);
    const matchOfferData = (await matchOfferRes.json()) as {
      offer: { origin: string };
      telemetry: { recommendationOfferSharePercent: number; phase2ExitGatePassed: boolean };
    };
    assert.equal(matchOfferData.offer.origin, "match");
    assert.ok(
      matchOfferData.telemetry.recommendationOfferSharePercent >= 30,
      "Phase 2 Exit Gate: >= 30% of offers originate from a recommendation"
    );
    assert.equal(matchOfferData.telemetry.phase2ExitGatePassed, true);

    const createSsRes = await fetch(`${baseUrl}/v1/saved-searches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Sony WH-1000XM5",
        categorySlug: "workstation-audio",
        maxDistanceKm: 8,
        notify: true,
      }),
    });
    assert.equal(createSsRes.status, 201);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
