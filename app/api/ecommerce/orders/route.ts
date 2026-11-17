import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          status_code: 401,
          message: "Authentication required. Please log in to view your orders.",
          data: null,
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `api/ecommerce/orders/?${queryString}`
      : "api/ecommerce/orders/";

    const backendRes = await apiClient(endpoint, {
      method: "GET",
      token,
    });

    return NextResponse.json(
      {
        status_code: 200,
        message: backendRes.message || "Orders retrieved successfully.",
        data: backendRes.data,
      },
      { status: 200 }
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
        : "Failed to retrieve orders from backend.";

    return NextResponse.json(
      {
        status_code: 500,
        message,
        data: null,
      },
      { status: 500 }
    );
  }
}
