import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { withAdminAuth, handleAdminRouteError } from "@/lib/auth/withAdminAuth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let period = searchParams.get("period") || "today";

    // Map variations to the backend expected values (today, this_month, this_year)
    if (period === "this_day") period = "today";
    if (period === "month") period = "this_month";
    if (period === "year") period = "this_year";

    const cookieStore = await cookies();
    const { data, cookieResponse } = await withAdminAuth(
      cookieStore,
      (token) =>
        apiClient(`api/gload/manage/orders/stats/?period=${encodeURIComponent(period)}`, {
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
