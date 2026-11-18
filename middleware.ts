// middleware.ts – runs on the edge before every matched request.
// Responsibilities:
//   1. Protect /account and /account/* routes — redirect guests and users with expired refresh tokens to /login
//   2. Auto-refresh an expired (or near-expired) accessToken using the refreshToken
//      so the user never sees a "token not valid" error mid-session.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_BASE = process.env.API_BASE_URL || "http://127.0.0.1:8000";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ─── JWT helpers (edge-safe, no Node crypto needed) ───────────────────────────

function decodeJwtExp(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    // Edge runtime has atob
    const json = atob(padded);
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

/** Returns true if the token is expired or will expire within bufferSec seconds. */
function isExpired(token: string, bufferSec = 60): boolean {
  const exp = decodeJwtExp(token);
  if (exp === null) return true; // Can't decode → treat as expired
  return Math.floor(Date.now() / 1000) >= exp - bufferSec;
}

// ─── Refresh helper: calls the backend directly (not the BFF route) ──────────
// We call the backend directly here because the middleware can't call its own
// Next.js routes during server startup / edge execution.

interface RefreshResult {
  access: string;
  refresh: string;
}

async function refreshTokens(refreshToken: string): Promise<RefreshResult | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { access?: string; refresh?: string };
      access?: string;
      refresh?: string;
    };
    const access = json.data?.access || json.access;
    const refresh = json.data?.refresh || json.refresh;
    if (!access) return null;
    return { access, refresh: refresh || refreshToken };
  } catch {
    return null;
  }
}

// ─── Cookie setter helper ─────────────────────────────────────────────────────

function setCookieOnResponse(
  response: NextResponse,
  name: string,
  value: string,
  maxAge: number
) {
  response.cookies.set(name, value, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

function getTargetUrl(request: NextRequest): string {
  const { pathname, search } = request.nextUrl;
  const cleanParams = new URLSearchParams(search);
  cleanParams.delete("_rsc");
  const queryString = cleanParams.toString();
  return pathname + (queryString ? `?${queryString}` : "");
}

function redirectToLogin(request: NextRequest, targetUrl: string): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callback", targetUrl);
  loginUrl.searchParams.set("callbackUrl", targetUrl);
  const redirect = NextResponse.redirect(loginUrl);
  redirect.cookies.delete("accessToken");
  redirect.cookies.delete("refreshToken");
  redirect.cookies.delete("user");
  return redirect;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = pathname === "/account" || pathname.startsWith("/account/");

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // ── Case 0: Visiting /login while already authenticated ───────────────────
  if (pathname === "/login") {
    const rawCallback =
      request.nextUrl.searchParams.get("callback") ||
      request.nextUrl.searchParams.get("callbackUrl") ||
      request.nextUrl.searchParams.get("next") ||
      request.nextUrl.searchParams.get("redirect") ||
      "/account";
    const callbackTarget = rawCallback.startsWith("/") ? rawCallback : `/${rawCallback}`;

    if (accessToken && !isExpired(accessToken)) {
      return NextResponse.redirect(new URL(callbackTarget, request.url));
    }
    return NextResponse.next();
  }

  // ── Case 1: Token is valid and not near expiry ────────────────────────────
  if (accessToken && !isExpired(accessToken)) {
    return NextResponse.next();
  }

  const targetUrl = getTargetUrl(request);

  // ── Case 2: Access token missing or expired — try to refresh with refreshToken ──
  if (refreshToken) {
    // If refreshToken itself is expired, do not attempt refresh; send to login immediately
    if (isExpired(refreshToken, 0)) {
      if (isProtected) {
        return redirectToLogin(request, targetUrl);
      }
      const response = NextResponse.next();
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      response.cookies.delete("user");
      return response;
    }

    const tokens = await refreshTokens(refreshToken);

    if (tokens) {
      // Successfully refreshed: clone request with updated cookies and continue
      const response = NextResponse.next();

      // Write fresh tokens into response cookies so browser and subsequent route handlers see them
      setCookieOnResponse(response, "accessToken", tokens.access, 60 * 15);         // 15 min
      setCookieOnResponse(response, "refreshToken", tokens.refresh, 60 * 60 * 24 * 7); // 7 days

      return response;
    }

    // Refresh failed (refresh token expired on backend / invalid / revoked)
    if (isProtected) {
      return redirectToLogin(request, targetUrl);
    }

    // For non-protected routes just clear and continue as guest
    const response = NextResponse.next();
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    response.cookies.delete("user");
    return response;
  }

  // ── Case 3: No tokens at all ─────────────────────────────────────────────
  if (isProtected) {
    return redirectToLogin(request, targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on /account pages, /login, AND all API routes that need auth
  matcher: [
    "/account",
    "/account/:path*",
    "/login",
    "/api/ecommerce/checkout",
    "/api/ecommerce/orders",
  ],
};
