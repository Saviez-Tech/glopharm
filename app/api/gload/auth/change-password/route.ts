import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { withAdminAuth, handleAdminRouteError } from "@/lib/auth/withAdminAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const old_password = body.old_password || body.currentPassword;
    const new_password = body.new_password || body.newPassword;

    if (!old_password || !new_password) {
      return NextResponse.json(
        { status_code: 400, message: "Both current and new passwords are required.", data: null },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const { data: backendRes, cookieResponse } = await withAdminAuth(
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
    return handleAdminRouteError(error);
  }
}
