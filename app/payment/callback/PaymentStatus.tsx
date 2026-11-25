"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

interface PaymentVerification {
  reference: string;
  payment_status: string;
  order_number?: string;
  order_status?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPaymentVerification(value: unknown): value is PaymentVerification {
  return (
    isRecord(value) &&
    typeof value.reference === "string" &&
    typeof value.payment_status === "string"
  );
}

export default function PaymentStatus({ reference }: { reference: string }) {
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorStatusCode, setErrorStatusCode] = useState<number | null>(null);
  const [payment, setPayment] = useState<PaymentVerification | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function verifyPayment() {
      setLoading(true);
      setError("");
      setErrorStatusCode(null);
      setPayment(null);

      if (!reference) {
        setError("The payment reference is missing from the callback URL.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/ecommerce/orders/payment/verify?reference=${encodeURIComponent(reference)}`,
          { cache: "no-store", signal: controller.signal }
        );
        const payload: unknown = await response.json();

        const statusCode =
          isRecord(payload) && typeof payload.status_code === "number"
            ? payload.status_code
            : response.status;

        if (!response.ok || statusCode >= 400) {
          const message =
            isRecord(payload) && typeof payload.message === "string"
              ? payload.message
              : "We couldn't verify this payment. Please try again.";
          setError(message);
          setErrorStatusCode(statusCode);
          return;
        }

        const data = isRecord(payload) ? payload.data : null;
        if (!isPaymentVerification(data)) {
          throw new Error("The payment verification response was incomplete.");
        }

        setPayment(data);
      } catch (verificationError: unknown) {
        if (!controller.signal.aborted) {
          setError(
            verificationError instanceof Error
              ? verificationError.message
              : "We couldn't verify this payment. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void verifyPayment();
    return () => controller.abort();
  }, [attempt, reference]);

  const paymentStatus = payment?.payment_status.toLowerCase() || "";
  const isSuccessful = paymentStatus === "success";
  const isPending = ["pending", "processing", "initiated"].includes(paymentStatus);

  const title = loading
    ? "Checking your payment"
    : error
      ? "We couldn't confirm your payment"
      : isSuccessful
        ? "Payment successful"
        : isPending
          ? "Payment is being confirmed"
          : "Payment not completed";

  const description = loading
    ? "Please wait while we securely verify your transaction with Paystack."
    : error
      ? error
      : isSuccessful
        ? "Your payment has been confirmed. Your order is now being processed."
        : isPending
          ? "Your transaction is still pending. You can check again in a moment."
          : "The payment was not successful. If you were charged, contact our support team with your payment reference.";

  const tone = isSuccessful
    ? "emerald"
    : isPending || loading
      ? "amber"
      : "red";

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcf9] text-neutral-900">
      <Navbar />
      <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <section
          aria-live="polite"
          className="mx-auto max-w-2xl rounded-3xl border border-neutral-200/90 bg-white p-6 text-center shadow-sm sm:p-10"
        >
          <div
            className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
              tone === "emerald"
                ? "bg-emerald-100 text-[#00A654]"
                : tone === "amber"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-600"
            }`}
          >
            {loading ? (
              <span className="h-7 w-7 animate-spin rounded-full border-3 border-current border-r-transparent" />
            ) : isSuccessful ? (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" />
              </svg>
            )}
          </div>

          <p
            className={`mb-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              tone === "emerald"
                ? "border-emerald-200 bg-emerald-50 text-[#00A654]"
                : tone === "amber"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {loading ? "Verifying" : paymentStatus || (error ? "Verification error" : "Unsuccessful")}
          </p>

          <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-neutral-600 sm:text-base">
            {description}
          </p>

          {reference && (
            <div className="mt-7 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left">
              <dl className="space-y-3 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                  <dt className="text-neutral-500">Payment reference</dt>
                  <dd className="break-all font-mono text-xs font-semibold text-neutral-900 sm:text-right">
                    {payment?.reference || reference}
                  </dd>
                </div>
                {payment?.order_number && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-500">Order number</dt>
                    <dd className="font-semibold text-neutral-900">{payment.order_number}</dd>
                  </div>
                )}
                {payment?.order_status && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-500">Order status</dt>
                    <dd className="font-semibold capitalize text-neutral-900">
                      {payment.order_status.replace(/[_-]/g, " ")}
                    </dd>
                  </div>
                )}
                {errorStatusCode !== null && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-500">Verification code</dt>
                    <dd className="font-mono font-semibold text-neutral-900">{errorStatusCode}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {(error || isPending || (!loading && !isSuccessful)) && (
              <button
                type="button"
                onClick={() => setAttempt((current) => current + 1)}
                disabled={loading}
                className="rounded-full bg-[#00A654] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#008f48] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Checking..." : "Check status again"}
              </button>
            )}
            <Link
              href={isSuccessful ? "/account/orders" : "/products"}
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              {isSuccessful ? "View my orders" : "Continue shopping"}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
