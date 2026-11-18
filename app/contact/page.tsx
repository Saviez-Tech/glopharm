"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "General Inquiry",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate contact submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        category: "General Inquiry",
        subject: "",
        message: "",
      });
    }, 1000);
  };

  const contactCards = [
    {
      title: "Customer Support",
      desc: "For inquiries on orders, delivery tracking, and returns.",
      value: "+234 801 234 5678",
      sub: "support@glopharm.ng",
      badge: "24/7 Available",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
        </svg>
      ),
      color: "bg-[#00A654]",
    },
    {
      title: "Pharmacy & Prescriptions",
      desc: "Connect directly with our clinical pharmacologists and doctors.",
      value: "+234 802 555 0199",
      sub: "prescriptions@glopharm.ng",
      badge: "Doctor On Duty",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21a48.25 48.25 0 0 1-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      ),
      color: "bg-[#0265CB]",
    },
    {
      title: "Headquarters Hub",
      desc: "Our central logistics, certified pharmacy, and storage facility.",
      value: "Victoria Island, Lagos",
      sub: "12 Adeola Odeku Street, Lagos, Nigeria",
      badge: "Open Mon - Sun",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      ),
      color: "bg-neutral-900",
    },
  ];

  const faqs = [
    {
      q: "How does the Lab Test Review work?",
      a: "Simply upload your test results (e.g. malaria panel, blood work, scan) on our platform. Our licensed physicians review the markers, generate a customized prescription, and your medications are packaged and dispatched directly to your door.",
    },
    {
      q: "How fast is delivery across Lagos and other states?",
      a: "In Lagos, grocery and prescription deliveries typically arrive within 2 to 4 hours. Nationwide deliveries to other Nigerian states arrive in 24 to 48 hours with full temperature-controlled packaging.",
    },
    {
      q: "Are all medications authentic and approved?",
      a: "Yes, 100%. GloPharm sources exclusively from licensed pharmaceutical manufacturers and accredited distributors with full NAFDAC verification.",
    },
    {
      q: "Can I speak directly with a pharmacist before ordering?",
      a: "Yes! Use our live chat, WhatsApp hotline, or contact number to speak directly with an on-duty pharmacist for medication guidance.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#00A654]/10 via-[#0265CB]/5 to-transparent py-16 sm:py-20 relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 text-center relative z-10">
            {/* Breadcrumb */}
            <nav className="flex justify-center items-center gap-2 text-xs font-semibold text-gray-500 mb-4">
              <Link href="/" className="hover:text-[#00A654] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#00A654]">Contact Us</span>
            </nav>

            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A654]/10 border border-[#00A654]/20 text-[#00A654] text-xs font-bold uppercase tracking-wider mb-4">
              Get in Touch
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
              We&apos;re Here to Help You{" "}
              <span className="text-[#00A654]">Live Healthier</span>
            </h1>
            <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Have questions about your groceries order, prescription delivery, or lab test review? Our friendly team and licensed pharmacists are ready 24/7.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 -mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl ${card.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    {card.icon}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900">{card.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{card.desc}</p>
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-sm font-bold text-neutral-900">{card.value}</p>
                  <p className="text-xs text-[#0265CB] font-semibold mt-0.5">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Form + Map / Office Info Section */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Contact Form (Left) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  Send Us a Message
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Fill in the details below and we&apos;ll get back to you within 30 minutes.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 text-center bg-green-50 rounded-2xl border border-green-200">
                  <div className="w-12 h-12 bg-[#00A654] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-green-900">Message Received!</h3>
                  <p className="text-xs text-green-700 mt-1 max-w-md mx-auto">
                    Thank you for reaching out. One of our support specialists or on-duty pharmacists will contact you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-5 px-5 py-2.5 bg-[#00A654] text-white text-xs font-bold rounded-xl hover:bg-[#00904a] transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ada Okafor"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/10 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="ada@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/10 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+234 801 234 5678"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/10 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Inquiry Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/10 transition bg-white"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Prescription & Meds">Prescription &amp; Meds</option>
                        <option value="Lab Test Review Question">Lab Test Review Question</option>
                        <option value="Order Tracking">Order &amp; Delivery Tracking</option>
                        <option value="Wholesale / Partnership">Wholesale / Partnership</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief topic of your inquiry"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your message or inquiry here..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/10 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#00A654] hover:bg-[#00904a] text-white font-bold text-sm rounded-xl transition shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <span>Submit Message</span>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Quick Consultation & FAQ (Right) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Doctor Consultation Card */}
              <div className="bg-gradient-to-br from-[#0265CB] to-[#014c9c] text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest border border-white/20">
                    Need Clinical Guidance?
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-3">
                    Upload Your Lab Test Directly
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 mt-2 leading-relaxed">
                    Have medical test results? Don&apos;t wait. Upload your scans or PDF reports and let our licensed physicians prescribe the exact medications for delivery.
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <Link
                      href="/account/prescriptions"
                      className="px-5 py-2.5 bg-white text-[#0265CB] font-bold text-xs rounded-xl shadow hover:bg-white/90 transition inline-flex items-center gap-2"
                    >
                      <span>Upload Test Report</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                    <Link
                      href="/pharmacy"
                      className="px-4 py-2.5 text-xs font-semibold text-white/90 hover:text-white underline transition"
                    >
                      Learn more
                    </Link>
                  </div>
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-3">
                  {faqs.map((f, i) => (
                    <div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <p className="text-xs font-bold text-neutral-900 mb-1">{f.q}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
