/**
 * withAdminAuth — server-side helper for admin BFF Route Handlers.
 *
 * Same pattern as withAuth but reads adminAccessToken / adminRefreshToken cookies.
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

async function doRefresh(refreshToken: string): Promise<{ access: string; refresh: string }> {
  const res = await apiClient<RefreshData>("api/auth/refresh/", {
    method: "POST",
    body: { refresh: refreshToken },
  });

  const access = res.data?.access;
  const refresh = res.data?.refresh || refreshToken;

  if (!access) throw new Error("Refresh response missing access token.");
  return { access, refresh };
}

export interface WithAdminAuthResult<T> {
  data: ApiResponse<T>;
  cookieResponse: NextResponse;
}

export function clearAdminCookies(res: NextResponse) {
  res.cookies.delete("adminAccessToken");
  res.cookies.delete("adminRefreshToken");
  res.cookies.delete("adminUser");
}

export function handleAdminRouteError(err: unknown): NextResponse {
  const statusCode = isApiError(err)
    ? err.statusCode
    : typeof (err as { statusCode?: unknown })?.statusCode === "number"
    ? (err as { statusCode: number }).statusCode
    : 500;

  const message =
    err instanceof Error
      ? err.message
      : typeof (err as { message?: unknown })?.message === "string"
      ? (err as { message: string }).message
      : "Internal server error";

  const res = NextResponse.json(
    { status_code: statusCode, message, data: null },
    { status: statusCode }
  );

  if (statusCode === 401) {
    clearAdminCookies(res);
  }

  return res;
}

export async function withAdminAuth<T>(
  cookieStore: ReadonlyRequestCookies,
  call: (token: string | undefined) => Promise<ApiResponse<T>>
): Promise<WithAdminAuthResult<T>> {
  const accessToken = cookieStore.get("adminAccessToken")?.value;
  const refreshToken = cookieStore.get("adminRefreshToken")?.value;

  const cookieResponse = new NextResponse();

  try {
    const data = await call(accessToken);
    return { data, cookieResponse };
  } catch (err: unknown) {
    if (!isApiError(err) || err.statusCode !== 401) throw err;
  }

  if (!refreshToken) {
    throw Object.assign(new Error("Admin session expired. Please log in again."), {
      statusCode: 401,
    });
  }

  try {
    const tokens = await doRefresh(refreshToken);

    cookieResponse.cookies.set("adminAccessToken", tokens.access, cookieOptions(60 * 15));
    cookieResponse.cookies.set("adminRefreshToken", tokens.refresh, cookieOptions(60 * 60 * 24 * 7));

    const data = await call(tokens.access);
    return { data, cookieResponse };
  } catch (refreshErr: unknown) {
    throw Object.assign(
      new Error("Invalid or expired admin refresh token. Please log in again."),
      { statusCode: 401, cause: refreshErr }
    );
  }
}
