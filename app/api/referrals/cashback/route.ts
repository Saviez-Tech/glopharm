import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { withAuth } from "@/lib/auth/withAuth";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const endpoint = page
      ? `api/referrals/cashback/?page=${page}`
      : "api/referrals/cashback/";

    const { data: backendRes, cookieResponse } = await withAuth(
      cookieStore,
      (token) => apiClient(endpoint, { token })
    );

    const response = NextResponse.json(
      {
        status_code: 200,
        message: backendRes.message || "Cashback history retrieved successfully.",
        data: backendRes.data,
      },
      { status: 200 }
    );

    cookieResponse.cookies.getAll().forEach((c) => response.cookies.set(c));
    return response;
  } catch (error: unknown) {
    if (isApiError(error)) {
      return NextResponse.json(
        { status_code: error.statusCode, message: error.message, data: error.data },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { status_code: 500, message: "Failed to fetch cashback history.", data: null },
      { status: 500 }
    );
  }
}
