import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const COOKIE_OPTS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: "lax" as const,
  path: "/",
};

interface LoginData {
  access?: string;
  refresh?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const result = await apiClient<LoginData>("api/auth/login/", {
      method: "POST",
      body: { email, password },
    });

    const access = result.data?.access;
    const refresh = result.data?.refresh;

    if (!access) {
      return NextResponse.json(
        { status_code: 401, message: "Invalid credentials", data: null },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ status_code: 200, message: "Login successful", data: null });
    res.cookies.set("adminAccessToken", access, { ...COOKIE_OPTS, maxAge: 60 * 15 });
    if (refresh) {
      res.cookies.set("adminRefreshToken", refresh, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 });
    }
    return res;
  } catch (err: unknown) {
    if (isApiError(err)) {
      return NextResponse.json(
        { status_code: err.statusCode, message: err.message, data: null },
        { status: err.statusCode }
      );
    }
    return NextResponse.json(
      { status_code: 500, message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
