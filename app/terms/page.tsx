import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Terms and Conditions | Buckksrob Pharmacy and Supermarket",
  description: "These Terms and Conditions govern your use of Buckksrob Pharmacy and Supermarket website and services.",
};

export default function TermsPage() {
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
            Terms and Conditions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            Effective date: 1st July 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm sm:text-base text-neutral-700 leading-relaxed">
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
            <p className="font-medium text-neutral-800">
              These Terms and Conditions govern your use of our website and services. They help protect both our customers and our business by creating a clear and fair framework for transactions, communication, and account use.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              Acceptance of Terms
            </h2>
            <p>
              By visiting, browsing, or placing an order on our website, you agree to be bound by these Terms and Conditions. These terms apply to all customers, guests, and users of our platform.
            </p>
            <p>
              If you do not agree with any part of these terms, please do not use our services or place orders with us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              Use of Our Services
            </h2>
            <p>
              You agree to provide accurate information when placing orders, creating accounts, or contacting our support team. You are responsible for keeping your account details secure and for all actions taken under your account.
            </p>
            <p>
              You must not use our website for unlawful purposes, fraud, abusive behavior, or unauthorized reselling of products.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              Orders, Pricing, and Payment
            </h2>
            <p>
              All product prices are displayed in the currency applicable at the time of purchase and may be updated without notice. We reserve the right to accept, reject, or cancel orders where necessary for accuracy, availability, fraud prevention, or security reasons.
            </p>
            <p>
              Payments must be completed through approved payment methods. If payment fails or is disputed, the order may be delayed or canceled until the issue is resolved.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              Intellectual Property
            </h2>
            <p>
              All content on this website, including images, branding, descriptions, and design elements, remains the property of Buckksrob Pharmacy and Supermarket unless otherwise stated. You may not copy, reuse, or distribute our materials without written permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              Limitation of Liability
            </h2>
            <p>
              We will do our best to provide accurate and reliable service, but we shall not be held liable for indirect, incidental, or consequential damages arising from the use of our website or products.
            </p>
            <p>
              Our maximum liability for any claim arising from our services shall not exceed the amount paid for the affected order, unless otherwise required by law.
            </p>
          </section>

          <section className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 text-emerald-950">
            <h3 className="font-bold text-sm sm:text-base mb-1">
              Questions or Inquiries?
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
