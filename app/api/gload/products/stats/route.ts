import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { withAdminAuth, handleAdminRouteError } from "@/lib/auth/withAdminAuth";

interface ProductStats {
  total_products: number;
  in_stock: number;
  out_of_stock: number;
  catalog_value: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const { data, cookieResponse } = await withAdminAuth<ProductStats>(
      cookieStore,
      (token) => apiClient<ProductStats>("api/gload/manage/products/stats/", { token })
    );

    const res = NextResponse.json(data);
    cookieResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  } catch (err: unknown) {
    return handleAdminRouteError(err);
  }
}
