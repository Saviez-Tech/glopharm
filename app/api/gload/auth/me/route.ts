import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { withAdminAuth, handleAdminRouteError } from "@/lib/auth/withAdminAuth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const { data, cookieResponse } = await withAdminAuth(
      cookieStore,
      (token) =>
        apiClient("api/auth/profile/", {
          method: "GET",
          token,
        })
    );

    const res = NextResponse.json({
      status_code: 200,
      message: "Admin session active",
      data: data?.data ?? null,
    });
    cookieResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  } catch (err: unknown) {
    return handleAdminRouteError(err);
  }
}
