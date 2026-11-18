import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { status_code: 200, message: "Admin logged out successfully.", data: null },
    { status: 200 }
  );

  response.cookies.delete("adminAccessToken");
  response.cookies.delete("adminRefreshToken");
  response.cookies.delete("adminUser");
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  response.cookies.delete("user");

  return response;
}

export async function GET() {
  return POST();
}
