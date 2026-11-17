import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";

interface RefreshResponseData {
  access?: string;
  refresh?: string;
}

/**
 * POST /api/auth/refresh
 * Exchanges the httpOnly refreshToken cookie for a fresh accessToken.
 * Called automatically by the BFF layer when a 401 is detected.
 */
export async function POST(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { status_code: 401, message: "No refresh token. Please log in again.", data: null },
        { status: 401 }
      );
    }

    // Backend endpoint: POST /api/auth/refresh/
    // Response shape: { status_code: 200, data: { access: "...", refresh: "..." } }
    const backendRes = await apiClient<RefreshResponseData>(
      "api/auth/refresh/",
      {
        method: "POST",
        body: { refresh: refreshToken },
      }
    );

    const responseData = (backendRes.data || {}) as RefreshResponseData;
    const newAccessToken = responseData.access;
    const newRefreshToken = responseData.refresh; // Backend always rotates both tokens

    if (!newAccessToken) {
      return NextResponse.json(
        { status_code: 401, message: "Refresh failed. Please log in again.", data: null },
        { status: 401 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json(
      { status_code: 200, message: "Token refreshed.", data: { access: newAccessToken } },
      { status: 200 }
    );

    // Access token: 15 minutes (matches backend's access token TTL)
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    // Rotate refresh token (backend always issues a new refresh token)
    if (newRefreshToken) {
      response.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (error: unknown) {
    if (isApiError(error)) {
      // Refresh token itself is invalid/expired — force logout
      const res = NextResponse.json(
        { status_code: 401, message: error.message, data: null },
        { status: 401 }
      );
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      return res;
    }

    return NextResponse.json(
      { status_code: 500, message: "Failed to refresh token.", data: null },
      { status: 500 }
    );
  }
}
