"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsFixed(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories = [
    "All Categories",
    "Fresh Fruits",
    "Vegetables",
    "Dairy & Eggs",
    "Beverages",
    "Pharmacy & Wellness",
    "Breakfast & Snacks",
    "Household Essentials",
  ];

  return (
    <header className="w-full select-none">

      {/* Scroll spacer */}
      {isFixed && <div className="w-full h-[120px] sm:h-[104px]" />}

      {/* ── STICKY WRAPPER — both rows fix together on scroll ── */}
      <div
        className={`w-full z-50 transition-all duration-200 ${
          isFixed
            ? "fixed top-0 left-0 right-0 shadow-[0_6px_30px_rgba(0,0,0,0.2)]"
            : "relative"
        }`}
      >

        {/* ── ROW 1: MAIN HEADER (Brand Green #00A654) ── */}
        <div className="w-full bg-[#00A654] text-white py-3 px-4 sm:px-8">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 lg:gap-8">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-sm group-hover:bg-white/30 transition-all">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10h16l-1.5 10h-13z" />
                  <path d="M9 10V6a3 3 0 0 1 6 0v4" />
                  <circle cx="10" cy="14" r="1" fill="currentColor" />
                  <circle cx="14" cy="14" r="1" fill="currentColor" />
                  <line x1="8" y1="17" x2="16" y2="17" />
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black tracking-tight text-white">
                  Glo<span className="text-white/80">Pharm</span><span className="text-white/60">.</span>
                </span>
                <span className="text-[10px] text-white/70 font-semibold tracking-widest uppercase mt-0.5">
                  Groceries &amp; Wellness
                </span>
              </div>
            </Link>

            {/* Deliver to — xl only */}
            <div className="hidden xl:flex flex-col items-start pl-5 border-l border-white/25 shrink-0">
              <span className="text-[10px] text-white/60 font-semibold uppercase tracking-widest leading-none mb-1">Deliver to</span>
              <button type="button" className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-white/80 transition-colors">
                <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                Nigeria
                <svg className="w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>

            {/* Search bar — white pill with blue button */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="relative flex items-center w-full bg-white rounded-full shadow-md overflow-hidden">
                {/* Category selector */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="flex items-center gap-2 text-xs font-semibold text-neutral-700 hover:text-[#0265CB] px-4 py-3 border-r border-neutral-200 transition-colors whitespace-nowrap"
                  >
                    <span className="truncate max-w-[110px]">{selectedCategory}</span>
                    <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  {isCategoryOpen && (
                    <div className="absolute top-full left-0 mt-2 w-52 bg-white text-gray-800 rounded-xl shadow-2xl py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-1">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => { setSelectedCategory(cat); setIsCategoryOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-blue-50 hover:text-[#0265CB] transition-colors ${
                            selectedCategory === cat ? "text-[#0265CB] font-bold bg-blue-50" : ""
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input */}
                <input
                  type="text"
                  placeholder="Search for groceries, wellness, medicines..."
                  className="w-full px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none bg-transparent"
                />

                {/* Blue search button */}
                <button
                  type="button"
                  aria-label="Search"
                  className="shrink-0 m-1 h-9 px-5 rounded-full bg-[#0265CB] hover:bg-[#0254aa] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <span className="hidden lg:inline">Search</span>
                </button>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Wishlist */}
              <button type="button" aria-label="Wishlist" className="relative group p-2 rounded-xl hover:bg-white/15 transition-all">
                <svg className="w-6 h-6 text-white/90 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0265CB] text-[9px] font-black text-white flex items-center justify-center ring-2 ring-[#00A654]">2</span>
              </button>

              {/* Cart */}
              <Link href="/cart" aria-label="Cart" className="relative group p-2 rounded-xl hover:bg-white/15 transition-all">
                <svg className="w-6 h-6 text-white/90 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0265CB] text-[9px] font-black text-white flex items-center justify-center ring-2 ring-[#00A654]">3</span>
              </Link>

              <div className="hidden sm:block w-px h-6 bg-white/25 mx-1" />

              {/* Account chip — desktop */}
              <Link href="/account" aria-label="My Account"
                className="hidden sm:flex items-center gap-2.5 group px-3 py-2 rounded-xl hover:bg-white/15 transition-all">
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center ring-0 shrink-0 group-hover:bg-white/30 transition-all">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-white/60 font-semibold leading-none">Hello, User</span>
                  <span className="text-xs font-bold text-white leading-tight group-hover:text-white/80 transition-colors">My Account</span>
                </div>
              </Link>

              {/* Account icon — mobile only */}
              <Link href="/account" aria-label="Account" className="sm:hidden p-2 rounded-xl hover:bg-white/15 transition-all">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Mobile search */}
          <div className="mt-3 md:hidden">
            <div className="flex items-center w-full bg-white rounded-full shadow-sm overflow-hidden">
              <input
                type="text"
                placeholder="Search for products..."
                className="flex-1 px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none bg-transparent"
              />
              <button type="button" aria-label="Search"
                className="m-1 w-9 h-9 rounded-full bg-[#0265CB] hover:bg-[#0254aa] text-white flex items-center justify-center transition-all shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── ROW 2: BOTTOM NAV (Brand Blue #0265CB) ── */}
        <div className="hidden sm:block w-full bg-[#0265CB] text-white px-4 sm:px-8 py-2.5">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">

            {/* Browse categories — white pill */}
            <button type="button"
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-white/90 text-[#0265CB] font-bold text-xs rounded-lg shadow-sm transition-all whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              Browse All Categories
            </button>

            {/* Nav links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold">
              {[
                { label: "Home", href: "/", active: true },
                { label: "Products", href: "/products" },
                { label: "Pharmacy", href: "#pharmacy", badge: "New" },
                { label: "About Us", href: "#about" },
                { label: "Blogs", href: "#blogs" },
                { label: "Contact", href: "#contact" },
              ].map(({ label, href, active, badge }) => (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-1.5 transition-all pb-0.5 border-b-2 ${
                    active
                      ? "text-white border-white"
                      : "text-white/80 hover:text-white border-transparent hover:border-white/50"
                  }`}
                >
                  {label}
                  {badge && (
                    <span className="text-[9px] bg-white text-[#0265CB] px-1.5 py-0.5 rounded-full font-black leading-none">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Right: contact + recently viewed */}
            <div className="flex items-center gap-4">
              {/* Phone */}
              <a href="tel:+234123456789"
                className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                +234 123 456 789
              </a>

              {/* Recently Viewed */}
              <div className="flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span>Recently Viewed</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
