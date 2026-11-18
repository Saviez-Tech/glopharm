import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { withAdminAuth, handleAdminRouteError } from "@/lib/auth/withAdminAuth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const { data, cookieResponse } = await withAdminAuth(
      cookieStore,
      (token) =>
        apiClient("api/gload/dashboard/stats/", {
          method: "GET",
          token,
        })
    );

    const res = NextResponse.json(data);
    cookieResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  } catch (err: unknown) {
    return handleAdminRouteError(err);
  }
}
