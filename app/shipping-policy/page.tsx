import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Delivery and Shipping Policy | Buckksrob Pharmacy and Supermarket",
  description: "This policy explains how our delivery and shipping process works, including the customer’s responsibility for delivery costs.",
};

export default function ShippingPolicyPage() {
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
            Delivery and Shipping Policy
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            Effective date: 1st July 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm sm:text-base text-neutral-700 leading-relaxed">
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
            <p className="font-medium text-neutral-800">
              This policy explains how our delivery and shipping process works, including the customer’s responsibility for delivery costs where applicable and the company’s approach to safe, reliable order fulfillment.
            </p>
          </section>

          {/* Important Notice Banner */}
          <section className="bg-amber-50 border border-amber-200/80 rounded-2xl p-6 text-amber-950 space-y-2">
            <h3 className="font-extrabold text-base text-amber-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              Notice: Shipping is Not Free
            </h3>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              Shipping and delivery fees are not free. Delivery fees are calculated based on your total order weight, parcel dimensions, packaging requirements, and delivery destination. Your exact shipping fee will be calculated and communicated to you immediately after your goods are packaged.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              Delivery Services
            </h2>
            <p>
              We offer delivery services for products purchased through our platform. Delivery availability depends on your location, the product type, and the logistics arrangement selected at checkout.
            </p>
            <p>
              For orders that require delivery, the owner of the goods is responsible for covering the delivery cost separately unless otherwise stated by our team at the time of purchase.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              Shipping and Handling
            </h2>
            <p>
              All orders are packed with care to reduce the risk of damage during transit. However, once an order has been handed over to a delivery partner, the company cannot be held responsible for delays caused by weather, traffic, carrier issues, or circumstances beyond our control.
            </p>
            <p>
              Customers are expected to provide accurate delivery information so orders can be completed successfully.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              Delivery Timeframes
            </h2>
            <p>
              Estimated delivery times are provided as guides only. Delays may occur during peak periods, public holidays, or logistics disruptions.
            </p>
            <p>
              We will do our best to keep customers informed if any substantial delay occurs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              Failed or Unsuccessful Delivery
            </h2>
            <p>
              If delivery cannot be completed due to an incorrect address, absence of the recipient, or refusal to accept the package, the customer may be required to arrange a re-delivery or collect the parcel from the indicated location.
            </p>
            <p>
              Additional delivery charges may apply where a second delivery attempt becomes necessary.
            </p>
          </section>

          <section className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 text-emerald-950">
            <h3 className="font-bold text-sm sm:text-base mb-1">
              Have Questions About Shipping?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-900">
              For questions or support, please contact our team through the{" "}
              <Link href="/contact" className="underline font-bold hover:text-emerald-950">
                Contact Page
              </Link>{" "}
              or call our customer care hotline at{" "}
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
