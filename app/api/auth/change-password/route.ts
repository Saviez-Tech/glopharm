import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { withAuth } from "@/lib/auth/withAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { old_password, new_password } = body;

    if (!old_password || !new_password) {
      return NextResponse.json(
        { status_code: 400, message: "Both current and new passwords are required.", data: null },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const { data: backendRes, cookieResponse } = await withAuth(
      cookieStore,
      (token) =>
        apiClient("api/auth/change-password/", {
          method: "POST",
          body: { old_password, new_password },
          token,
        })
    );

    const response = NextResponse.json(
      {
        status_code: backendRes.status_code || 200,
        message: backendRes.message || "Password changed successfully.",
        data: backendRes.data ?? null,
      },
      { status: backendRes.status_code || 200 }
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
      { status_code: 500, message: "Failed to change password.", data: null },
      { status: 500 }
    );
  }
}
