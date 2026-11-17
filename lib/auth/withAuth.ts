/**
 * withAuth — server-side helper for BFF Route Handlers.
 *
 * Wraps any apiClient call that requires authentication.
 * If the backend returns 401 ("Given token not valid for any token type"):
 *   1. Calls POST /api/auth/refresh/ to exchange the refreshToken for new tokens.
 *   2. Rotates the cookies on the outgoing NextResponse.
 *   3. Retries the original call with the fresh accessToken.
 *   4. If the refresh itself fails, throws so the route handler can return 401.
 *
 * Usage inside a Route Handler:
 *
 *   import { withAuth } from "@/lib/auth/withAuth";
 *   const { data, response } = await withAuth(cookieStore, async (token) =>
 *     apiClient("api/ecommerce/orders/", { token })
 *   );
 *   // Merge response cookies into your NextResponse before returning it.
 */

import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { ApiResponse } from "@/lib/api/types";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

interface RefreshData {
  access?: string;
  refresh?: string;
}

/**
 * Attempt to refresh the access token using the refreshToken cookie.
 * Returns { access, refresh } on success, throws ApiError on failure.
 */
async function doRefresh(refreshToken: string): Promise<{ access: string; refresh: string }> {
  const res = await apiClient<RefreshData>("api/auth/refresh/", {
    method: "POST",
    body: { refresh: refreshToken },
  });

  const access = res.data?.access;
  const refresh = res.data?.refresh || refreshToken;

  if (!access) {
    throw new Error("Refresh response missing access token.");
  }

  return { access, refresh };
}

export interface WithAuthResult<T> {
  /** The API response data */
  data: ApiResponse<T>;
  /**
   * A NextResponse containing Set-Cookie headers for rotated tokens.
   * Merge its cookies into your own response before returning:
   *   authResult.cookieResponse.cookies.getAll().forEach(c => myRes.cookies.set(c))
   */
  cookieResponse: NextResponse;
}

export async function withAuth<T>(
  cookieStore: ReadonlyRequestCookies,
  call: (token: string | undefined) => Promise<ApiResponse<T>>
): Promise<WithAuthResult<T>> {
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const cookieResponse = new NextResponse(); // Will carry Set-Cookie headers if rotated

  // ── First attempt ─────────────────────────────────────────────────────────
  try {
    const data = await call(accessToken);
    return { data, cookieResponse };
  } catch (err: unknown) {
    // Only intercept 401 errors — anything else bubbles up
    if (!isApiError(err) || err.statusCode !== 401) throw err;
  }

  // ── 401 received — try to refresh ─────────────────────────────────────────
  if (!refreshToken) {
    throw Object.assign(new Error("Session expired. Please log in again."), {
      statusCode: 401,
    });
  }

  const tokens = await doRefresh(refreshToken); // Throws if refresh itself fails

  // Rotate cookies on the helper response
  cookieResponse.cookies.set("accessToken", tokens.access, cookieOptions(60 * 15));
  cookieResponse.cookies.set("refreshToken", tokens.refresh, cookieOptions(60 * 60 * 24 * 7));

  // ── Retry with fresh token ────────────────────────────────────────────────
  const data = await call(tokens.access);
  return { data, cookieResponse };
}
