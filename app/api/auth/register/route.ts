import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { registerSchema } from "@/lib/validations/auth";

interface RegisterResponseData {
  access?: string;
  refresh?: string;
  token?: string;
  tokens?: {
    access?: string;
    refresh?: string;
  };
  user?: {
    id?: string | number;
    email?: string;
    full_name?: string;
    name?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const parsed = registerSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          status_code: 400,
          message: parsed.error.issues[0]?.message || "Invalid registration data.",
          data: null,
        },
        { status: 400 }
      );
    }

    const nameParts = parsed.data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    // Call backend API with all expected DRF field aliases
    const backendRes = await apiClient<RegisterResponseData>("api/auth/register/", {
      method: "POST",
      body: {
        full_name: parsed.data.fullName,
        name: parsed.data.fullName,
        first_name: firstName,
        last_name: lastName,
        username: parsed.data.email,
        email: parsed.data.email,
        phone: parsed.data.phone || "",
        phone_number: parsed.data.phone || "",
        password: parsed.data.password,
        referral_code: parsed.data.referralCode || "",
      },
    });

    const responseData = (backendRes.data || {}) as RegisterResponseData;
    const accessToken =
      responseData.access || responseData.token || responseData.tokens?.access;
    const refreshToken = responseData.refresh || responseData.tokens?.refresh;

    const response = NextResponse.json(
      {
        status_code: 200,
        message: backendRes.message || "Account created successfully.",
        data: {
          user: responseData.user || {
            email: parsed.data.email,
            full_name: parsed.data.fullName,
          },
        },
      },
      { status: 200 }
    );

    const isProduction = process.env.NODE_ENV === "production";

    // If backend returns session tokens immediately upon registration
    if (accessToken) {
      response.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    if (refreshToken) {
      response.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

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
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during registration.";

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
