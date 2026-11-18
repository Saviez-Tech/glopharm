import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { withAdminAuth, handleAdminRouteError } from "@/lib/auth/withAdminAuth";

type Ctx = { params: Promise<{ order_number: string }> };

export async function PATCH(req: NextRequest, context: Ctx) {
  try {
    const { order_number } = await context.params;
    const body = await req.json();

    const allowed = ["processing", "out_for_delivery", "delivered"];
    if (body.status && !allowed.includes(body.status)) {
      return NextResponse.json(
        {
          status_code: 400,
          message: `Invalid status. Permitted transitions are: ${allowed.join(", ")}.`,
          data: null,
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const { data, cookieResponse } = await withAdminAuth(
      cookieStore,
      (token) =>
        apiClient(`api/gload/manage/orders/${encodeURIComponent(order_number)}/status/`, {
          method: "PATCH",
          body,
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
