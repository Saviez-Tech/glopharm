import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const parsed = forgotPasswordSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          status_code: 400,
          message: parsed.error.issues[0]?.message || "Please provide a valid email.",
          data: null,
        },
        { status: 400 }
      );
    }

    const backendRes = await apiClient("api/auth/forgot-password/", {
      method: "POST",
      body: {
        email: parsed.data.email,
        username: parsed.data.email,
      },
    });

    return NextResponse.json(
      {
        status_code: 200,
        message: backendRes.message || "OTP sent to your email address.",
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
        : "An unexpected error occurred while requesting password reset.";

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
