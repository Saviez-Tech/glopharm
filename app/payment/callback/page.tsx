import type { Metadata } from "next";
import { Suspense } from "react";
import PaymentStatus from "./PaymentStatus";

export const metadata: Metadata = {
  title: "Payment status | Buckksrob Pharmacy",
};

type CallbackSearchParams = {
  reference?: string | string[];
  trxref?: string | string[];
};

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() || "";
}

export default function PaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<CallbackSearchParams>;
}) {
  return (
    <Suspense fallback={<PaymentStatus reference="" />}>
      <CallbackPaymentStatus searchParams={searchParams} />
    </Suspense>
  );
}

async function CallbackPaymentStatus({
  searchParams,
}: {
  searchParams: Promise<CallbackSearchParams>;
}) {
  const params = await searchParams;
  const reference = firstValue(params.reference) || firstValue(params.trxref);

  return <PaymentStatus reference={reference} />;
}
