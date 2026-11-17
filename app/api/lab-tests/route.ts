import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { withAuth } from "@/lib/auth/withAuth";
import { z } from "zod";

const submitSchema = z.object({
  test_name: z.string().trim().min(2, "Test name is required"),
  file_url: z.string().url("Valid file URL is required"),
  file_name: z.string().trim().min(1, "File name is required"),
  symptoms: z.string().trim().optional().default(""),
});

// GET /api/lab-tests — list all lab tests (paginated)
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const endpoint = page ? `api/lab-tests/?page=${page}` : "api/lab-tests/";

    const { data: backendRes, cookieResponse } = await withAuth(
      cookieStore,
      (token) => apiClient(endpoint, { token })
    );

    const response = NextResponse.json(
      {
        status_code: 200,
        message: backendRes.message || "Lab tests retrieved successfully.",
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
      { status_code: 500, message: "Failed to fetch lab tests.", data: null },
      { status: 500 }
    );
  }
}

// POST /api/lab-tests — submit a new lab result
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parsed = submitSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { status_code: 400, message: parsed.error.issues[0]?.message || "Invalid data.", data: null },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const { data: backendRes, cookieResponse } = await withAuth(
      cookieStore,
      (token) =>
        apiClient("api/lab-tests/", {
          method: "POST",
          body: parsed.data,
          token,
        })
    );

    const statusCode = backendRes.status_code || 201;
    const response = NextResponse.json(
      {
        status_code: statusCode,
        message: backendRes.message || "Lab result submitted. A doctor will review it shortly.",
        data: backendRes.data,
      },
      { status: statusCode }
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
      { status_code: 500, message: "Failed to submit lab result.", data: null },
      { status: 500 }
    );
  }
}
