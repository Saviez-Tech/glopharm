import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { loginSchema } from "@/lib/validations/auth";

interface LoginResponseData {
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
    is_staff?: boolean;
  };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const parsed = loginSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          status_code: 400,
          message: parsed.error.issues[0]?.message || "Invalid email or password.",
          data: null,
        },
        { status: 400 }
      );
    }

    // Call backend API (send both email and username for full DRF compatibility)
    const backendRes = await apiClient<LoginResponseData>("api/auth/login/", {
      method: "POST",
      body: {
        email: parsed.data.email,
        username: parsed.data.email,
        password: parsed.data.password,
      },
    });

    const responseData = (backendRes.data || {}) as LoginResponseData;
    const accessToken =
      responseData.access || responseData.token || responseData.tokens?.access;
    const refreshToken = responseData.refresh || responseData.tokens?.refresh;

    const response = NextResponse.json(
      {
        status_code: 200,
        message: backendRes.message || "Login successful.",
        data: {
          user: responseData.user || { email: parsed.data.email },
          is_staff: responseData.user?.is_staff ?? false,
        },
      },
      { status: 200 }
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Store auth tokens strictly in httpOnly, Secure cookies
    if (accessToken) {
      response.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      // Also set admin token so staff users can access admin BFF routes
      if (responseData.user?.is_staff) {
        response.cookies.set("adminAccessToken", accessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 15,
        });
      }
    }

    if (refreshToken) {
      response.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      if (responseData.user?.is_staff) {
        response.cookies.set("adminRefreshToken", refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
      }
    }

    const userToStore = responseData.user || { email: parsed.data.email };
    response.cookies.set("user", JSON.stringify(userToStore), {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

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
        : "An unexpected error occurred during login.";

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
