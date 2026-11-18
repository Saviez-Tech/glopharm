import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { withAuth, handleUserRouteError } from "@/lib/auth/withAuth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const { data: profileRes, cookieResponse } = await withAuth(
      cookieStore,
      (token) => apiClient("api/auth/profile/", { method: "GET", token })
    );

    const res = NextResponse.json({
      status_code: 200,
      message: "Authenticated",
      data: {
        authenticated: true,
        user: profileRes?.data ?? null,
      },
    });
    cookieResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  } catch (err: unknown) {
    return handleUserRouteError(err);
  }
}
