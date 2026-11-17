import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { withAuth } from "@/lib/auth/withAuth";

// GET /api/lab-tests/[reference] — single lab test detail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const cookieStore = await cookies();

    const { data: backendRes, cookieResponse } = await withAuth(
      cookieStore,
      (token) => apiClient(`api/lab-tests/${reference}/`, { token })
    );

    const response = NextResponse.json(
      {
        status_code: 200,
        message: backendRes.message || "Lab test retrieved successfully.",
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
      { status_code: 500, message: "Failed to fetch lab test.", data: null },
      { status: 500 }
    );
  }
}
