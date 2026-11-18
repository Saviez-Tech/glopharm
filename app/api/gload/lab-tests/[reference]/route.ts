import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { withAdminAuth, handleAdminRouteError } from "@/lib/auth/withAdminAuth";

type Ctx = { params: Promise<{ reference: string }> };

export async function GET(_req: NextRequest, context: Ctx) {
  try {
    const { reference } = await context.params;
    const cookieStore = await cookies();
    const { data, cookieResponse } = await withAdminAuth(
      cookieStore,
      (token) =>
        apiClient(`api/gload/lab-tests/${reference}/`, {
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
