/**
 * Lightweight JWT helpers — no external library needed.
 * Only safe to use on the server (Node.js / Edge runtime).
 * We only decode claims; we do NOT verify signatures here — that's the backend's job.
 */

interface JwtPayload {
  exp?: number;
  iat?: number;
  user_id?: string | number;
  token_type?: string;
  [key: string]: unknown;
}

/**
 * Decode a JWT's payload section (middle part) without verifying the signature.
 * Returns null if the token is malformed.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64url → base64 → JSON
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Returns true if the token is expired or will expire within `bufferSeconds`.
 * Defaults to a 60-second buffer so we refresh slightly before the hard deadline.
 */
export function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true; // Treat unparseable as expired
  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds >= payload.exp - bufferSeconds;
}
