"use client";

import React from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LabResultSection from "../components/LabResultSection";

export default function AboutPage() {
  const values = [
    {
      title: "100% Authentic Medications",
      desc: "Every single pharmaceutical product is sourced directly from accredited global manufacturers and licensed local distributors with full NAFDAC verification.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
      color: "bg-[#00A654]",
    },
    {
      title: "Farm-Fresh Groceries",
      desc: "Nutritious produce, farm-fresh eggs, whole grains, and daily breakfast essentials procured fresh every morning from trusted Nigerian farms.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      ),
      color: "bg-[#0265CB]",
    },
    {
      title: "Digital Doctor Consultation",
      desc: "Our pioneering lab-test consultation portal allows patients to upload test scans and receive clinical prescription care from home without sitting in waiting rooms.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21a48.25 48.25 0 0 1-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      ),
      color: "bg-emerald-600",
    },
    {
      title: "Express Doorstep Delivery",
      desc: "Fast, reliable logistics with temperature-monitored courier boxes to preserve medicine integrity and produce freshness from our hub to your home.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.5a1.125 1.125 0 0 0-1.125-1.125H3.375A1.125 1.125 0 0 0 2.25 4.5v9.75m12-5.625h2.25" />
        </svg>
      ),
      color: "bg-neutral-900",
    },
  ];

  const metrics = [
    { val: "50,000+", label: "Happy Customers Served" },
    { val: "10,000+", label: "Prescriptions & Tests Reviewed" },
    { val: "100%", label: "Genuine NAFDAC-Verified Meds" },
    { val: "2-4 Hrs", label: "Average Delivery Time in Lagos" },
  ];

  const team = [
    {
      name: "Dr. Emmanuel Adeyemi",
      role: "Chief Clinical Pharmacologist",
      bio: "Over 15 years in hospital pharmacotherapy, specializing in antimicrobial stewardship and remote diagnostic care.",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Dr. Chioma Nwosu",
      role: "Consultant Physician & Telehealth Director",
      bio: "Fellow of the West African College of Physicians with deep focus on preventive medicine and family healthcare.",
      image: "https://images.unsplash.com/photo-1594824813566-7875a35983b5?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Tunde Olatunji",
      role: "Head of Supply Chain & Cold Storage",
      bio: "Logistics specialist managing direct farm sourcing pipelines and GDP-compliant temperature storage.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#00A654]/10 via-[#0265CB]/5 to-transparent py-16 sm:py-24 relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 text-center relative z-10">
            {/* Breadcrumb */}
            <nav className="flex justify-center items-center gap-2 text-xs font-semibold text-gray-500 mb-4">
              <Link href="/" className="hover:text-[#00A654] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#00A654]">About Us</span>
            </nav>

            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A654]/10 border border-[#00A654]/20 text-[#00A654] text-xs font-bold uppercase tracking-wider mb-4">
              Our Story &amp; Mission
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
              Revolutionizing Daily Health &amp; Groceries for{" "}
              <span className="text-[#00A654]">Every Nigerian Household</span>
            </h1>

            <p className="mt-5 text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Buckksrob Pharmacy and Supermarket is Nigeria&apos;s unified healthcare and essential groceries platform. We bring together fresh farm produce, certified pharmacy medications, and instant doctor consultations under one digital roof.
            </p>
          </div>
        </section>

        {/* Impact Numbers */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 -mt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm text-center"
              >
                <p className="text-3xl sm:text-4xl font-black text-[#00A654] tracking-tight">{m.val}</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-2">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Story & Origin */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0265CB]">
                Why We Started
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mt-2 tracking-tight leading-tight">
                Health Doesn&apos;t Stop at Medicines. It Begins with What You Eat.
              </h2>
              <div className="mt-5 space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                <p>
                  In Nigeria, families have historically faced two major daily headaches: navigating chaotic open markets to buy fresh, safe food, and rushing between pharmacies trying to find genuine, unadulterated medications.
                </p>
                <p>
                  Buckksrob was established to solve both challenges in one unified experience. By integrating local farm partnerships with licensed pharmaceutical warehouses, we ensure your refrigerator has nutritious food while your medicine cabinet has 100% verified authentic healthcare.
                </p>
                <p>
                  With our digital lab-review feature, patients no longer have to spend entire mornings in crowded clinics just to have a routine malaria or typhoid panel interpreted. Our team reviews test results online and sends the exact prescribed medicines to your door.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="px-6 py-3.5 bg-[#00A654] hover:bg-[#00904a] text-white font-bold text-sm rounded-xl shadow-md transition"
                >
                  Shop Essentials
                </Link>
                <Link
                  href="/pharmacy"
                  className="px-6 py-3.5 bg-white border border-gray-200 text-neutral-900 hover:border-[#0265CB] hover:text-[#0265CB] font-bold text-sm rounded-xl transition"
                >
                  Explore Pharmacy
                </Link>
              </div>
            </div>

            {/* Visual Showcase */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80"
                  alt="Buckksrob Quality Healthcare and Nutrition"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-gray-100 max-w-xs hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00A654] text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">100% Verified Quality</p>
                    <p className="text-[11px] text-gray-500">Certified by licensed medical specialists</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars / Values */}
        <section className="bg-white py-16 sm:py-24 border-y border-gray-100">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[#00A654]">
                Our Guiding Pillars
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mt-2 tracking-tight">
                What Sets Buckksrob Apart
              </h2>
              <p className="text-sm text-gray-500 mt-3">
                Built on strict safety standards, trusted medical expertise, and uncompromising customer care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="bg-[#F8FAFC] rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-gray-200 transition group"
                >
                  <div className={`w-12 h-12 rounded-2xl ${v.color} text-white flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform`}>
                    {v.icon}
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mb-2">{v.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Embedded Lab Result Section Component */}
        <LabResultSection />

        {/* Medical & Leadership Team */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0265CB]">
              Clinical Leadership
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mt-2 tracking-tight">
              Backed by Experienced Medical Professionals
            </h2>
            <p className="text-sm text-gray-500 mt-3">
              Our clinical advisory board oversees all medication protocols, drug interactions, and digital prescription workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition group"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-base font-bold text-neutral-900">{member.name}</h3>
                  <p className="text-xs font-semibold text-[#00A654] mt-0.5">{member.role}</p>
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
