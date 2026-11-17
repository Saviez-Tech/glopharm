import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { withAuth } from "@/lib/auth/withAuth";

interface ProfileData {
  username?: string;
  email?: string;
  name?: string;
  phone_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
}

// GET /api/auth/profile — fetch authenticated user profile
export async function GET() {
  try {
    const cookieStore = await cookies();
    const { data: backendRes, cookieResponse } = await withAuth<ProfileData>(
      cookieStore,
      (token) => apiClient("api/auth/profile/", { method: "GET", token })
    );

    const response = NextResponse.json(
      {
        status_code: 200,
        message: backendRes.message || "Profile retrieved successfully.",
        data: backendRes.data,
      },
      { status: 200 }
    );
    cookieResponse.cookies.getAll().forEach((c) => response.cookies.set(c));
    return response;
  } catch (error: unknown) {
    if (isApiError(error)) {
      return NextResponse.json(
        { status_code: error.statusCode, message: error.message, data: error.data },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { status_code: 500, message: "Failed to fetch profile.", data: null },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/profile — update profile
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();

    const { data: backendRes, cookieResponse } = await withAuth<ProfileData>(
      cookieStore,
      (token) =>
        apiClient("api/auth/profile/update/", {
          method: "PATCH",
          body,
          token,
        })
    );

    // Also update the client-readable `user` cookie with the new name
    const response = NextResponse.json(
      {
        status_code: 200,
        message: backendRes.message || "Profile updated successfully.",
        data: backendRes.data,
      },
      { status: 200 }
    );

    if (backendRes.data) {
      const isProduction = process.env.NODE_ENV === "production";
      response.cookies.set("user", JSON.stringify(backendRes.data), {
        httpOnly: false,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    cookieResponse.cookies.getAll().forEach((c) => response.cookies.set(c));
    return response;
  } catch (error: unknown) {
    if (isApiError(error)) {
      return NextResponse.json(
        { status_code: error.statusCode, message: error.message, data: error.data },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { status_code: 500, message: "Failed to update profile.", data: null },
      { status: 500 }
    );
  }
}
