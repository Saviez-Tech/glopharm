"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LabResultSection from "../components/LabResultSection";

export default function PharmacyPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const pharmacyCategories = [
    {
      title: "Antimalarials & Fever Care",
      desc: "WHO-recommended ACT therapies, rapid antimalarials, and fever reducers.",
      badge: "Fast Relief",
      items: ["Artemether / Lumefantrine", "Coartem", "Lonart Forte", "Paracetamol Extra"],
      color: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-800",
      accent: "bg-[#00A654]",
    },
    {
      title: "Daily Vitamins & Immune Boosters",
      desc: "High-potency effervescent tablets, multivitamins, and omega-3 supplements.",
      badge: "Everyday Wellness",
      items: ["Vitamin C 1000mg", "Cod Liver Oil Omega-3", "Daily Multivitamin", "Zinc & D3"],
      color: "from-blue-500/10 to-cyan-500/5 border-blue-500/20 text-blue-800",
      accent: "bg-[#0265CB]",
    },
    {
      title: "Antibiotics & Anti-Infectives",
      desc: "NAFDAC-verified prescription antibiotics for bacterial & microbial infections.",
      badge: "Prescription Needed",
      items: ["Amoxicillin / Clavulanic", "Ciprofloxacin", "Metronidazole (Flagyl)", "Azithromycin"],
      color: "from-purple-500/10 to-indigo-500/5 border-purple-500/20 text-purple-800",
      accent: "bg-purple-600",
    },
    {
      title: "Pain Management & Analgesics",
      desc: "Fast relief for headaches, joint inflammation, muscular aches, and cramps.",
      badge: "Relief & Care",
      items: ["Ibuprofen 400mg", "Diclofenac Potassium", "Paracetamol Tablets", "Pain Gels"],
      color: "from-amber-500/10 to-orange-500/5 border-amber-500/20 text-amber-800",
      accent: "bg-amber-600",
    },
    {
      title: "Chronic Care & Heart Health",
      desc: "Managed prescriptions for blood pressure, cardiovascular health, and diabetes.",
      badge: "Refill Support",
      items: ["Amlodipine", "Metformin 500mg", "Lisinopril", "Blood Glucose Strips"],
      color: "from-rose-500/10 to-pink-500/5 border-rose-500/20 text-rose-800",
      accent: "bg-rose-600",
    },
    {
      title: "First Aid & Antiseptics",
      desc: "Essential clinical supplies, wound sanitizers, and home emergency kits.",
      badge: "Home Essentials",
      items: ["Antiseptic Liquid", "Cotton Wool & Gauze", "Digital Thermometer", "Hydrogen Peroxide"],
      color: "from-sky-500/10 to-blue-500/5 border-sky-500/20 text-sky-800",
      accent: "bg-sky-600",
    },
  ];

  const labStepsDetailed = [
    {
      step: "01",
      title: "Get Tested at Any Certified Lab",
      desc: "Visit any recognized diagnostic center, clinic, or hospital lab and receive your physical or digital test result.",
      detail:
        "Whether it is a routine Malaria & Typhoid panel, Full Blood Count (FBC), Fasting Blood Glucose, Urinalysis, Kidney/Liver profile (KFT/LFT), or ultrasound scans.",
    },
    {
      step: "02",
      title: "Upload Document or Picture",
      desc: "Take a clear photo with your phone or upload the PDF document directly into your GloPharm account.",
      detail:
        "Our high-security health vault encrypts your data. You can also note down any symptoms you are feeling (e.g. fever for 3 days, headaches, fatigue) to give the doctor complete clinical context.",
    },
    {
      step: "03",
      title: "Licensed Doctor & Pharmacist Review",
      desc: "Our registered physicians review your biological markers, cross-check symptoms, and draft a clinical prescription.",
      detail:
        "No waiting in crowded clinic lobbies. A certified physician analyzes your exact pathology and selects the most effective medications with precise dosage instructions.",
    },
    {
      step: "04",
      title: "Doorstep Delivery & Dosage Instructions",
      desc: "Review your prescribed medications, complete checkout, and have the authentic drugs delivered to your address.",
      detail:
        "Every prescription package includes clear doctor notes, morning/night dosage guidelines, and direct access to an on-call pharmacist if you have questions.",
    },
  ];

  const labFaqs = [
    {
      q: "What types of test results can I upload for doctor review?",
      a: "You can upload results for Malaria and Typhoid panels, Full Blood Count (FBC), Urinalysis, Fasting Blood Sugar/Glucose, Lipid panels, Kidney Function Tests (KFT), Liver Function Tests (LFT), and doctor diagnostic notes. Both PDF files and clear phone photos (JPEG/PNG) are supported.",
    },
    {
      q: "Who reviews my uploaded lab test?",
      a: "Your test is assigned to licensed Nigerian physicians and clinical pharmacologists accredited by the Medical and Dental Council of Nigeria (MDCN) and Pharmacists Council of Nigeria (PCN).",
    },
    {
      q: "How long does a doctor review take?",
      a: "Most reviews are completed within 1 to 3 hours during regular operational hours. You will receive an immediate notification once your prescription is ready on your dashboard.",
    },
    {
      q: "Can I adjust quantities or speak to the pharmacist about my prescription?",
      a: "Yes! You can view the prescribed medications, doctor clinical notes, and dosage schedule on your account. You can also chat with our clinical pharmacists before checkout if you have any drug sensitivities.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#0265CB]/10 via-[#00A654]/5 to-transparent py-16 sm:py-24 relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 text-center relative z-10">
            {/* Breadcrumb */}
            <nav className="flex justify-center items-center gap-2 text-xs font-semibold text-gray-500 mb-4">
              <Link href="/" className="hover:text-[#00A654] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#0265CB]">Pharmacy &amp; Diagnostics</span>
            </nav>

            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0265CB]/10 border border-[#0265CB]/20 text-[#0265CB] text-xs font-bold uppercase tracking-wider mb-4">
              Certified Digital Pharmacy &amp; Telehealth
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
              Certified Medications &amp;{" "}
              <span className="text-[#0265CB]">Doctor Lab Review</span>{" "}
              From Home
            </h1>

            <p className="mt-5 text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Order verified OTC and prescription medications, or upload your laboratory test reports to receive licensed doctor consultations and doorstep medication delivery anywhere in Nigeria.
            </p>

            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
              <Link
                href="/account/prescriptions"
                className="px-7 py-3.5 bg-[#00A654] hover:bg-[#00904a] text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span>Upload Lab Test Report</span>
              </Link>
              <Link
                href="/products"
                className="px-7 py-3.5 bg-white border border-gray-200 text-neutral-900 hover:border-[#0265CB] hover:text-[#0265CB] font-bold text-sm rounded-xl shadow-sm transition"
              >
                Browse Medicines
              </Link>
              <a
                href="https://wa.me/2348012345678"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3.5 bg-green-50 text-green-800 border border-green-200 text-xs font-bold rounded-xl hover:bg-green-100 transition flex items-center gap-2"
              >
                <span>Chat Pharmacist (WhatsApp)</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── LAB TEST FEATURE DEEP DIVE SECTION ── */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 sm:py-20">
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-[36px] p-6 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            {/* Glow effects */}
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#00A654]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#0265CB]/20 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
                <div>
                  <span className="px-3.5 py-1.5 rounded-full bg-[#00A654]/20 text-[#00A654] text-xs font-bold uppercase tracking-wider border border-[#00A654]/30">
                    Innovative Telehealth Feature
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mt-3">
                    How Our Digital Lab Test Feature Works
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-gray-400 max-w-md leading-relaxed">
                  Never spend hours waiting in clinic lobbies just to interpret blood or malaria tests. Our digital review brings doctors to you.
                </p>
              </div>

              {/* 4 Step Walkthrough */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {labStepsDetailed.map((item) => (
                  <div
                    key={item.step}
                    className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-[#00A654]/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-[#00A654] text-white font-black text-sm flex items-center justify-center mb-4 shadow-md">
                        {item.step}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-white/10">
                      <p className="text-[11px] text-gray-400 leading-normal italic">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Banner */}
              <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-xl font-bold text-white">Have a Lab Result Ready?</h4>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1">
                    Upload your malaria, blood count, or typhoid test now and receive a doctor prescription today.
                  </p>
                </div>
                <Link
                  href="/account/prescriptions"
                  className="px-6 py-3 bg-[#00A654] hover:bg-[#00904a] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition whitespace-nowrap shrink-0"
                >
                  Upload Your Test Now →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Home LabResultSection Preview (matches homepage) */}
        <LabResultSection />

        {/* Pharmacy Categories & Catalog */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00A654]">
                Medicines &amp; Healthcare
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mt-1 tracking-tight">
                Explore Essential Pharmacy Categories
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-[#0265CB] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View full medicine catalog</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacyCategories.map((cat) => (
              <div
                key={cat.title}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      {cat.badge}
                    </span>
                    <span className={`w-3 h-3 rounded-full ${cat.accent}`} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">{cat.title}</h3>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">{cat.desc}</p>

                  <div className="space-y-1.5 pt-3 border-t border-gray-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Common Brands &amp; Generics:
                    </p>
                    {cat.items.map((it) => (
                      <div key={it} className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00A654]" />
                        <span>{it}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/products?q=${encodeURIComponent(cat.title.split(" ")[0])}`}
                  className="mt-6 w-full py-2.5 rounded-xl border border-gray-200 text-center text-xs font-bold text-gray-800 hover:bg-[#0265CB] hover:text-white hover:border-[#0265CB] transition"
                >
                  Browse {cat.title.split(" ")[0]}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Section */}
        <section className="bg-white py-16 sm:py-24 border-t border-gray-100">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0265CB]">
                Got Questions?
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mt-2 tracking-tight">
                Pharmacy &amp; Lab Consultation FAQs
              </h2>
            </div>

            <div className="space-y-4">
              {labFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 p-5 sm:p-6 transition cursor-pointer hover:border-gray-300"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900">{faq.q}</h3>
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold shrink-0">
                      {activeFaq === index ? "−" : "+"}
                    </span>
                  </div>
                  {activeFaq === index && (
                    <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
