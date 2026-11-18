import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { BackendProduct, PaginatedData } from "@/lib/validations/ecommerce";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const noCache = searchParams.has("_t") || searchParams.has("nocache");

    let endpoint: string;
    if (query && query.trim()) {
      endpoint = `api/ecommerce/products/search/?q=${encodeURIComponent(query.trim())}`;
    } else {
      const queryString = searchParams.toString();
      endpoint = queryString
        ? `api/ecommerce/products/?${queryString}`
        : "api/ecommerce/products/";
    }

    const backendRes = await apiClient<PaginatedData<BackendProduct>>(endpoint, {
      method: "GET",
      ...(noCache ? { cache: "no-store" } : { next: { revalidate: 60 } }),
    });

    return NextResponse.json(
      {
        status_code: 200,
        message: backendRes.message || "Products retrieved successfully.",
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
      error instanceof Error ? error.message : "Failed to load products.";

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
