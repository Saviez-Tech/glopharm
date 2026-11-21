import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Refund Policy | Buckksrob Pharmacy and Supermarket",
  description: "Our refund policy is designed to be fair, transparent, and protective of both customers and the business.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fcfcf9] text-neutral-900 flex flex-col font-sans selection:bg-[#00A654] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#00A654] hover:text-[#008f48] transition-colors group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-neutral-200 pb-6 mb-8">
          <span className="text-[11px] font-bold text-[#0265CB] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Company Policy
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mt-3">
            Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            Effective date: 1st July 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm sm:text-base text-neutral-700 leading-relaxed">
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
            <p className="font-medium text-neutral-800">
              Our refund policy is designed to be fair, transparent, and protective of both customers and the business. We aim to resolve genuine issues quickly while preventing misuse of refund requests.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              Refund Eligibility
            </h2>
            <p>
              Refunds may be considered for products that are damaged, defective, incorrect, or not as described at the time of delivery. Refund requests must be made within the period stated in our order confirmation and support communication.
            </p>
            <p>
              Items that have been used, opened, altered, or damaged by the customer after delivery may not be eligible for a refund unless the issue is caused by a supplier or delivery fault.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              Refund Process
            </h2>
            <p>
              To request a refund, customers must contact our support team with their order number, a clear description of the issue, and supporting evidence such as photographs where applicable.
            </p>
            <p>
              Once a refund request is approved, the refund will be processed through the original payment method or as otherwise agreed by our team.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              Non-Refundable Items
            </h2>
            <p>
              Certain products may be non-refundable if they are perishable, personalized, sealed items that have been opened, or otherwise excluded by the product-specific terms.
            </p>
            <p>
              Delivery charges and service fees may be non-refundable where the service has already been provided or where the order is canceled after dispatch.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              Protection Against Abuse
            </h2>
            <p>
              We reserve the right to refuse refund requests that appear fraudulent, repetitive, or not supported by valid evidence. This helps protect the company from misuse while ensuring genuine customers are treated fairly.
            </p>
          </section>

          <section className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 text-emerald-950">
            <h3 className="font-bold text-sm sm:text-base mb-1">
              Need Assistance with a Refund?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-900">
              For questions or support, please contact our team through the{" "}
              <Link href="/contact" className="underline font-bold hover:text-emerald-950">
                Contact Page
              </Link>{" "}
              or call our customer care line at{" "}
              <a href="tel:+2348169728780" className="underline font-bold hover:text-emerald-950">
                +234 816 972 8780
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
