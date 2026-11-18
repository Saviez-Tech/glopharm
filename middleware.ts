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

function redirectToAdminLogin(request: NextRequest, targetUrl?: string): NextResponse {
  const loginUrl = new URL("/glopharm/login", request.url);
  if (targetUrl && targetUrl !== "/glopharm" && targetUrl !== "/glopharm/") {
    loginUrl.searchParams.set("callback", targetUrl);
  }
  const redirect = NextResponse.redirect(loginUrl);
  redirect.cookies.delete("adminAccessToken");
  redirect.cookies.delete("adminRefreshToken");
  redirect.cookies.delete("adminUser");
  return redirect;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ADMIN ROUTES (/glopharm and /glopharm/*)
  // ═══════════════════════════════════════════════════════════════════════════
  if (pathname.startsWith("/glopharm")) {
    const adminAccessToken = request.cookies.get("adminAccessToken")?.value;
    const adminRefreshToken = request.cookies.get("adminRefreshToken")?.value;

    // Login page
    if (pathname === "/glopharm/login") {
      if (adminAccessToken && !isExpired(adminAccessToken)) {
        return NextResponse.redirect(new URL("/glopharm", request.url));
      }
      return NextResponse.next();
    }

    // Valid admin access token
    if (adminAccessToken && !isExpired(adminAccessToken)) {
      return NextResponse.next();
    }

    const targetUrl = getTargetUrl(request);

    // Expired or missing access token — check refresh token
    if (adminRefreshToken) {
      if (isExpired(adminRefreshToken, 0)) {
        return redirectToAdminLogin(request, targetUrl);
      }

      const tokens = await refreshTokens(adminRefreshToken);
      if (tokens) {
        const response = NextResponse.next();
        setCookieOnResponse(response, "adminAccessToken", tokens.access, 60 * 15);
        setCookieOnResponse(response, "adminRefreshToken", tokens.refresh, 60 * 60 * 24 * 7);
        return response;
      }

      // Refresh failed (invalid, expired, or revoked on backend)
      return redirectToAdminLogin(request, targetUrl);
    }

    // No admin tokens at all
    return redirectToAdminLogin(request, targetUrl);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. ADMIN API ROUTES (/api/gload/*)
  // ═══════════════════════════════════════════════════════════════════════════
  if (pathname.startsWith("/api/gload/")) {
    // Exclude public/auth routes like login
    if (pathname.startsWith("/api/gload/auth/login")) {
      return NextResponse.next();
    }

    const adminAccessToken = request.cookies.get("adminAccessToken")?.value;
    const adminRefreshToken = request.cookies.get("adminRefreshToken")?.value;

    if (adminAccessToken && !isExpired(adminAccessToken)) {
      return NextResponse.next();
    }

    if (adminRefreshToken) {
      if (isExpired(adminRefreshToken, 0)) {
        const res = NextResponse.json(
          { status_code: 401, message: "Admin session expired. Please log in again.", data: null },
          { status: 401 }
        );
        res.cookies.delete("adminAccessToken");
        res.cookies.delete("adminRefreshToken");
        res.cookies.delete("adminUser");
        return res;
      }

      const tokens = await refreshTokens(adminRefreshToken);
      if (tokens) {
        const response = NextResponse.next();
        setCookieOnResponse(response, "adminAccessToken", tokens.access, 60 * 15);
        setCookieOnResponse(response, "adminRefreshToken", tokens.refresh, 60 * 60 * 24 * 7);
        return response;
      }

      const res = NextResponse.json(
        { status_code: 401, message: "Invalid or expired admin refresh token.", data: null },
        { status: 401 }
      );
      res.cookies.delete("adminAccessToken");
      res.cookies.delete("adminRefreshToken");
      res.cookies.delete("adminUser");
      return res;
    }

    const res = NextResponse.json(
      { status_code: 401, message: "Admin authentication required.", data: null },
      { status: 401 }
    );
    res.cookies.delete("adminAccessToken");
    res.cookies.delete("adminRefreshToken");
    res.cookies.delete("adminUser");
    return res;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. USER ROUTES (/account, /login, /api/ecommerce/*)
  // ═══════════════════════════════════════════════════════════════════════════
  const isProtected = pathname === "/account" || pathname.startsWith("/account/");
  const isProtectedApi =
    pathname.startsWith("/api/auth/profile") ||
    pathname.startsWith("/api/referrals");

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Visiting /login while already authenticated
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

  // Token is valid and not near expiry
  if (accessToken && !isExpired(accessToken)) {
    return NextResponse.next();
  }

  const targetUrl = getTargetUrl(request);

  // Access token missing or expired — try to refresh with refreshToken
  if (refreshToken) {
    if (isExpired(refreshToken, 0)) {
      if (isProtectedApi) {
        const res = NextResponse.json(
          { status_code: 401, message: "Session expired. Please log in again.", data: null },
          { status: 401 }
        );
        res.cookies.delete("accessToken");
        res.cookies.delete("refreshToken");
        res.cookies.delete("user");
        return res;
      }
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
      const response = NextResponse.next();
      setCookieOnResponse(response, "accessToken", tokens.access, 60 * 15);
      setCookieOnResponse(response, "refreshToken", tokens.refresh, 60 * 60 * 24 * 7);
      return response;
    }

    // Refresh failed (refresh token expired on backend / invalid / revoked)
    if (isProtectedApi) {
      const res = NextResponse.json(
        { status_code: 401, message: "Invalid or expired session. Please log in again.", data: null },
        { status: 401 }
      );
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      res.cookies.delete("user");
      return res;
    }
    if (isProtected) {
      return redirectToLogin(request, targetUrl);
    }

    const response = NextResponse.next();
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    response.cookies.delete("user");
    return response;
  }

  // No tokens at all
  if (isProtectedApi) {
    const res = NextResponse.json(
      { status_code: 401, message: "Authentication required.", data: null },
      { status: 401 }
    );
    res.cookies.delete("accessToken");
    res.cookies.delete("refreshToken");
    res.cookies.delete("user");
    return res;
  }
  if (isProtected) {
    return redirectToLogin(request, targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on /account pages, /glopharm pages, /login, and protected APIs
  matcher: [
    "/account",
    "/account/:path*",
    "/login",
    "/glopharm",
    "/glopharm/:path*",
    "/api/gload/:path*",
    "/api/ecommerce/checkout",
    "/api/ecommerce/orders",
    "/api/auth/profile",
    "/api/auth/profile/:path*",
    "/api/referrals/:path*",
  ],
};
