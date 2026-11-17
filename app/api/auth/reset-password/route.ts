import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const parsed = resetPasswordSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          status_code: 400,
          message: parsed.error.issues[0]?.message || "Invalid input data.",
          data: null,
        },
        { status: 400 }
      );
    }

    // Call backend API (trailing slash required by Django REST Framework)
    const backendRes = await apiClient("api/auth/reset-password/", {
      method: "POST",
      body: {
        otp: parsed.data.otp,
        new_password: parsed.data.new_password,
      },
    });

    return NextResponse.json(
      {
        status_code: 200,
        message: backendRes.message || "Password reset successfully.",
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
        : "An unexpected error occurred while resetting your password.";

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
