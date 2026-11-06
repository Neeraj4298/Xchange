/**
 * RFC 9457 Problem Details for HTTP APIs (System Design Section 10)
 */

import type { ServerResponse } from "node:http";

export interface ProblemDetailsPayload {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code?: string;
}

export function sendProblemJson(res: ServerResponse, payload: ProblemDetailsPayload): void {
  const body = {
    type: payload.type || `https://xchange.in/problems/${(payload.code || "error").toLowerCase()}`,
    title: payload.title,
    status: payload.status,
    detail: payload.detail,
    instance: payload.instance,
    code: payload.code,
  };
  res.writeHead(payload.status, {
    "Content-Type": "application/problem+json; charset=utf-8",
  });
  res.end(JSON.stringify(body));
}

export function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(data));
}
