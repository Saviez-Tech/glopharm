import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { withAdminAuth, handleAdminRouteError } from "@/lib/auth/withAdminAuth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const { data, cookieResponse } = await withAdminAuth(
      cookieStore,
      (token) => apiClient(`api/gload/manage/products/${id}/`, { method: "GET", token })
    );

    const res = NextResponse.json(data);
    cookieResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  } catch (err: unknown) {
    return handleAdminRouteError(err);
  }
}

export async function PATCH(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const cookieStore = await cookies();
    const { data, cookieResponse } = await withAdminAuth(
      cookieStore,
      (token) => apiClient(`api/gload/manage/products/${id}/`, { method: "PATCH", body, token })
    );

    const res = NextResponse.json(data);
    cookieResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  } catch (err: unknown) {
    return handleAdminRouteError(err);
  }
}

export async function DELETE(_req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const { data, cookieResponse } = await withAdminAuth(
      cookieStore,
      (token) => apiClient(`api/gload/manage/products/${id}/`, { method: "DELETE", token })
    );

    const res = NextResponse.json(data);
    cookieResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  } catch (err: unknown) {
    return handleAdminRouteError(err);
  }
}
