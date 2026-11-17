import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { checkoutSchema } from "@/lib/validations/ecommerce";
import { withAuth } from "@/lib/auth/withAuth";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const parsed = checkoutSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          status_code: 400,
          message: parsed.error.issues[0]?.message || "Invalid checkout data.",
          data: null,
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    // withAuth: tries with current accessToken, auto-refreshes on 401, retries.
    // Checkout works for BOTH guests (token = undefined) and logged-in users.
    const { data: backendRes, cookieResponse } = await withAuth(
      cookieStore,
      (token) =>
        apiClient("api/ecommerce/orders/checkout/", {
          method: "POST",
          body: parsed.data,
          token, // undefined for guests → no Authorization header sent
        })
    );

    const statusCode = backendRes.status_code || 201;

    const response = NextResponse.json(
      {
        status_code: statusCode,
        message:
          backendRes.message ||
          "Order placed successfully. Complete your payment to confirm it.",
        data: backendRes.data,
      },
      { status: statusCode }
    );

    // Forward any rotated auth cookies (no-op for guest checkouts)
    cookieResponse.cookies.getAll().forEach((c) => response.cookies.set(c));

    return response;
  } catch (error: unknown) {
    if (isApiError(error)) {
      return NextResponse.json(
        {
          status_code: error.statusCode,
          message: error.message,
          data: error.data,
        },
        { status: error.statusCode }
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to process checkout.";

    return NextResponse.json(
      { status_code: 500, message, data: null },
      { status: 500 }
    );
  }
}
