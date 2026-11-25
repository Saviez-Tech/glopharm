import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";

export async function GET(req: NextRequest) {
  const reference = new URL(req.url).searchParams.get("reference")?.trim();

  if (!reference || !/^[A-Za-z0-9_-]{1,128}$/.test(reference)) {
    return NextResponse.json(
      {
        status_code: 400,
        message: "A valid payment reference is required.",
        data: null,
      },
      { status: 400 }
    );
  }

  try {
    const backendRes = await apiClient<{
      reference: string;
      payment_status: string;
      order_number?: string;
      order_status?: string;
    }>(
      `api/ecommerce/orders/payment/verify/?reference=${encodeURIComponent(reference)}`,
      { method: "GET", cache: "no-store" }
    );

    const statusCode = backendRes.status_code || 200;
    const httpStatus =
      Number.isInteger(statusCode) && statusCode >= 200 && statusCode <= 599
        ? statusCode
        : 200;

    return NextResponse.json(
      {
        status_code: statusCode,
        message: backendRes.message || "Payment status retrieved.",
        data: backendRes.data,
      },
      { status: httpStatus }
    );
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
      error instanceof Error
        ? error.message
        : "Failed to verify the payment.";

    return NextResponse.json(
      { status_code: 500, message, data: null },
      { status: 500 }
    );
  }
}
