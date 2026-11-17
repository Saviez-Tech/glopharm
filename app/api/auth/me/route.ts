import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface TokenPayload {
  user_id?: string | number;
  exp?: number;
  [key: string]: unknown;
}

function parseJwt(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json(
      { status_code: 401, message: "Not authenticated.", data: null },
      { status: 401 }
    );
  }

  // Parse user cookie if present
  let userData: Record<string, unknown> | null = null;
  const userCookie = cookieStore.get("user")?.value;
  if (userCookie) {
    try {
      userData = JSON.parse(userCookie);
    } catch {
      userData = null;
    }
  }

  // Fallback to token payload
  const tokenPayload = accessToken ? parseJwt(accessToken) : null;

  return NextResponse.json(
    {
      status_code: 200,
      message: "Authenticated",
      data: {
        authenticated: true,
        user: userData || (tokenPayload ? { id: tokenPayload.user_id } : null),
      },
    },
    { status: 200 }
  );
}
