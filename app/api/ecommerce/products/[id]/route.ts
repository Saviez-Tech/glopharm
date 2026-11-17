import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { BackendProductDetail } from "@/lib/validations/ecommerce";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { status_code: 400, message: "Product ID is required.", data: null },
        { status: 400 }
      );
    }

    const backendRes = await apiClient<BackendProductDetail>(
      `api/ecommerce/products/${encodeURIComponent(id)}/`,
      {
        method: "GET",
        next: { revalidate: 60 },
      }
    );

    return NextResponse.json(
      {
        status_code: 200,
        message: backendRes.message || "Product retrieved successfully.",
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
      error instanceof Error ? error.message : "Failed to load product details.";

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
