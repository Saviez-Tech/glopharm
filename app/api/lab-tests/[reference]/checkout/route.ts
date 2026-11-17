import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { isApiError } from "@/lib/api/types";
import { withAuth } from "@/lib/auth/withAuth";
import { z } from "zod";

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, "Full name is required"),
  customer_email: z.string().trim().email("Valid email is required"),
  customer_phone: z.string().trim().min(7, "Phone number is required"),
  shipping_address: z.string().trim().min(3, "Shipping address is required"),
  shipping_city: z.string().trim().min(2, "City is required"),
  shipping_state: z.string().trim().min(2, "State is required"),
});

// POST /api/lab-tests/[reference]/checkout — checkout a prescription
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const rawBody = await req.json();

    const parsed = checkoutSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { status_code: 400, message: parsed.error.issues[0]?.message || "Invalid data.", data: null },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const { data: backendRes, cookieResponse } = await withAuth(
      cookieStore,
      (token) =>
        apiClient(`api/lab-tests/${reference}/checkout/`, {
          method: "POST",
          body: parsed.data,
          token,
        })
    );

    const statusCode = backendRes.status_code || 201;
    const response = NextResponse.json(
      {
        status_code: statusCode,
        message:
          backendRes.message ||
          "Order placed successfully. Complete your payment to confirm it.",
        data: backendRes.data,
      },
      { status: statusCode }
    );
    cookieResponse.cookies.getAll().forEach((c) => response.cookies.set(c));
    return response;
  } catch (error: unknown) {
    if (isApiError(error)) {
      return NextResponse.json(
        { status_code: error.statusCode, message: error.message, data: error.data },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { status_code: 500, message: "Failed to process prescription checkout.", data: null },
      { status: 500 }
    );
  }
}
