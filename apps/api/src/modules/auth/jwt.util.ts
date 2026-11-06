import crypto from "node:crypto";

export interface JwtPayload {
  sub: string;
  phoneE164: string;
  exp: number;
}

export function signHmacJwt(payload: JwtPayload, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyHmacJwt(token: string, secret: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  if (sig !== expectedSig) return null;
  try {
    const decoded = JSON.parse(Buffer.from(body!, "base64url").toString("utf8")) as JwtPayload;
    if (Math.floor(Date.now() / 1000) > decoded.exp) return null;
    return decoded;
  } catch {
    return null;
  }
}
