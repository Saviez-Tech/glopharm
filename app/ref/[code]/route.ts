import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const redirectUrl = new URL("/register", request.url);
  if (code) {
    redirectUrl.searchParams.set("ref", code.trim());
  }
  return NextResponse.redirect(redirectUrl);
}
