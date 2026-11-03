"use client";

import React, { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="w-full relative mt-24">
      {/* 1. FLOATING OVERLAPPING NEWSLETTER BANNER (Brand Green #00A654 & Brand Blue #0265CB) */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mb-20 sm:-mb-24">
        <div className="bg-gradient-to-r from-[#00A654] via-[#00904a] to-[#00A654] rounded-[32px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(0,166,84,0.25)] p-6 sm:p-10 lg:p-12 text-white overflow-hidden relative border border-white/15">

          {/* Subtle background glow/accents */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

            {/* Left Column: 3D Illustration matching the reference design */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-48 sm:w-64 lg:w-72 aspect-square flex items-center justify-center">
                <img
                  src="/images/newsletter-3d.png"
                  alt="Fresh Groceries & Healthcare Delivery"
                  className="w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.25)] select-none hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Right Column: Newsletter Form & Copy */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Subscribe to our newsletter to get updates to our latest collections
              </h3>

              <p className="text-white/90 text-sm sm:text-base mt-2.5 font-normal">
                Get <span className="text-white font-black underline underline-offset-2">25% off</span> on your first order just by subscribing to our newsletter.
              </p>

              {/* Form Input + Button */}
              <form onSubmit={handleSubmit} className="w-full max-w-lg mt-6">
                {subscribed ? (
                  <div className="bg-white/20 backdrop-blur-md text-white font-semibold py-3 px-6 rounded-full text-center border border-white/30 text-sm">
                    Thank you for subscribing! Check your email for your 25% discount code.
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-0 bg-white/15 backdrop-blur-md p-1.5 sm:rounded-full rounded-2xl border border-white/25 focus-within:bg-white/20 focus-within:border-white/40 transition-all shadow-inner">
                    <div className="flex items-center gap-2.5 px-4 w-full flex-1">
                      <svg className="w-5 h-5 text-white/80 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full bg-transparent text-sm sm:text-base text-white placeholder-white/70 focus:outline-none py-2"
                      />
                    </div>
                    {/* Subscribe Button */}
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-7 py-3 bg-[#0265CB] hover:bg-[#0254aa] text-white font-bold text-sm rounded-full transition-all shadow-md active:scale-95 shrink-0"
                    >
                      Subscribe
                    </button>
                  </div>
                )}
              </form>

              {/* Subtext */}
              <p className="text-white/80 text-xs mt-3 leading-relaxed">
                You will be able to unsubscribe at any time. Read our privacy policy{" "}
                <a href="#privacy" className="underline underline-offset-2 hover:text-white transition-colors">
                  here
                </a>
                .
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER BODY (Clean White Canvas) */}
      <div className="w-full bg-white pt-32 sm:pt-40 pb-12 border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-gray-100">

            {/* Column 1: Brand Info (Logo, description, socials) */}
            <div className="lg:col-span-4 flex flex-col items-start gap-4">
              <a href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-[#00A654] flex items-center justify-center text-white shadow-md">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 10h16l-1.5 10h-13z" />
                    <path d="M9 10V6a3 3 0 0 1 6 0v4" />
                    <circle cx="10" cy="14" r="1" fill="currentColor" />
                    <circle cx="14" cy="14" r="1" fill="currentColor" />
                    <line x1="8" y1="17" x2="16" y2="17" />
                  </svg>
                </div>
                <span className="text-2xl font-black tracking-tight text-neutral-900 flex items-center">
                  Glo<span className="text-[#00A654]">Pharm</span>
                  <span className="text-[#0265CB] font-black">.</span>
                </span>
              </a>

              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                Your reliable one-stop platform for farm-fresh groceries, everyday household essentials, and certified pharmacy healthcare delivered directly to your doorstep in Nigeria.
              </p>

              {/* Social Media Icons */}
              <div className="flex items-center gap-3 pt-2">
                {/* Facebook */}
                <a
                  href="#facebook"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#00A654] hover:text-white flex items-center justify-center text-gray-600 transition-all text-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                {/* Twitter / X */}
                <a
                  href="#twitter"
                  aria-label="Twitter"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#00A654] hover:text-white flex items-center justify-center text-gray-600 transition-all text-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="#instagram"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#00A654] hover:text-white flex items-center justify-center text-gray-600 transition-all text-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="#linkedin"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#00A654] hover:text-white flex items-center justify-center text-gray-600 transition-all text-xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Company */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <h4 className="font-bold text-gray-900 text-sm tracking-tight mb-1">Company</h4>
              <a href="#about" className="text-gray-500 hover:text-[#00A654] text-xs sm:text-sm transition-colors">About Us</a>
              <a href="#services" className="text-gray-500 hover:text-[#00A654] text-xs sm:text-sm transition-colors">Services</a>
              <a href="#community" className="text-gray-500 hover:text-[#00A654] text-xs sm:text-sm transition-colors">Community</a>
              <a href="#testimonials" className="text-gray-500 hover:text-[#00A654] text-xs sm:text-sm transition-colors">Testimonial</a>
            </div>

            {/* Column 3: Support */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <h4 className="font-bold text-gray-900 text-sm tracking-tight mb-1">Support</h4>
              <a href="#help" className="text-gray-500 hover:text-[#00A654] text-xs sm:text-sm transition-colors">Help Center</a>
              <a href="#twitter" className="text-gray-500 hover:text-[#00A654] text-xs sm:text-sm transition-colors">Tweet @ Us</a>
              <a href="#consultation" className="text-gray-500 hover:text-[#00A654] text-xs sm:text-sm transition-colors">Pharmacist Chat</a>
              <a href="#feedback" className="text-gray-500 hover:text-[#00A654] text-xs sm:text-sm transition-colors">Feedback</a>
            </div>

            {/* Column 4: Links */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <h4 className="font-bold text-gray-900 text-sm tracking-tight mb-1">Links</h4>
              <a href="#groceries" className="text-gray-500 hover:text-[#00A654] text-xs sm:text-sm transition-colors">Fresh Groceries</a>
              <a href="#pharmacy" className="text-gray-500 hover:text-[#00A654] text-xs sm:text-sm transition-colors">Pharmacy &amp; Meds</a>
              <a href="#deals" className="text-gray-500 hover:text-[#00A654] text-xs sm:text-sm transition-colors">Daily Deals</a>
              <a href="#all" className="text-gray-500 hover:text-[#00A654] text-xs sm:text-sm transition-colors">All in One</a>
            </div>

            {/* Column 5: Contact Us */}
            <div className="lg:col-span-2 flex flex-col gap-3.5">
              <h4 className="font-bold text-gray-900 text-sm tracking-tight mb-1">Contact Us</h4>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-600">
                <svg className="w-4 h-4 text-[#00A654] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                <a href="tel:+234123456789" className="hover:text-[#00A654] font-medium transition-colors">
                  (234) 123 456 789
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-600">
                <svg className="w-4 h-4 text-[#00A654] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <a href="mailto:support@glopharm.ng" className="hover:text-[#00A654] font-medium transition-colors">
                  support@glopharm.ng
                </a>
              </div>

              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-500 mt-1">
                <svg className="w-4 h-4 text-[#00A654] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span>Lagos, Nigeria</span>
              </div>
            </div>

          </div>

          {/* 3. Bottom Legal & Copyright Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-gray-500">
            <p>© Copyright by GloPharm. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#privacy" className="hover:text-[#00A654] transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-[#00A654] transition-colors">Terms of Use</a>
              <a href="#legal" className="hover:text-[#00A654] transition-colors">Legal</a>
              <a href="#sitemap" className="hover:text-[#00A654] transition-colors">Site Map</a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
