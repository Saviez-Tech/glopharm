"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AccountLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Navigation: My Orders, Prescriptions, Referrals, and Account Settings
  const mainNavItems: NavItem[] = [
    {
      label: "My Orders",
      href: "/account/orders",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      ),
    },
    {
      label: "Lab Tests & Prescriptions",
      href: "/account/prescriptions",
      badge: "1 Ready",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
    },
    {
      label: "Referrals & Rewards",
      href: "/account/referrals",
      badge: "+500 pts",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h17.25" />
        </svg>
      ),
    },
  ];

  // Replaced Security with Account Settings (as requested)
  const bottomNavItems: NavItem[] = [
    {
      label: "Account Settings",
      href: "/account",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] text-neutral-900 font-sans antialiased overflow-hidden selection:bg-[#00A654] selection:text-white">
      {/* ── DESKTOP SIDEBAR (Matches Reference Layout) ── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-neutral-200/90 shrink-0 h-full select-none z-30">
        {/* Logo Section */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-neutral-100">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#00A654] flex items-center justify-center text-white font-black shadow-sm group-hover:bg-[#008f48] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-neutral-900 leading-none">
                Glo<span className="text-[#00A654]">Pharm</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase mt-0.5">
                Patient Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <div className="px-3 pb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Main Menu
              </div>
              <div className="space-y-1">
                {mainNavItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-sm transition-all ${
                        isActive
                          ? "bg-[#00A654] text-white shadow-sm shadow-[#00A654]/25"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? "text-white" : "text-neutral-400"}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive
                              ? "bg-white text-[#00A654]"
                              : "bg-emerald-100 text-[#00A654]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="px-3 pb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Preferences
              </div>
              <div className="space-y-1">
                {bottomNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all ${
                        isActive
                          ? "bg-[#00A654] text-white shadow-sm shadow-[#00A654]/25"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                      }`}
                    >
                      <span className={isActive ? "text-white" : "text-neutral-400"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Store & Cart quick links */}
          <div className="pt-4 space-y-2">
            <div className="flex gap-2">
              <Link
                href="/products"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-emerald-50 hover:text-[#00A654] transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a48.534 48.534 0 0 1 7.5 0m-7.5 0L12 3l8.25 6.349" />
                </svg>
                Store
              </Link>
              <Link
                href="/cart"
                className="relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-emerald-50 hover:text-[#00A654] transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                Cart
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00A654] text-white text-[9px] font-black flex items-center justify-center">3</span>
              </Link>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs">
              <div className="flex items-center justify-between font-bold text-neutral-900 mb-1">
                <span className="text-[#00A654]">GloPharm Plus</span>
                <span className="text-[10px] bg-white px-1.5 py-0.5 rounded text-neutral-600">Active</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-tight">
                24/7 Verified Doctor Consultation & Free Delivery Enabled.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── RIGHT MAIN VIEWPORT (Clean Header + Scrollable Page Canvas) ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 sm:h-20 bg-white border-b border-neutral-200/90 px-4 sm:px-8 flex items-center justify-between shrink-0 z-20">
          {/* Mobile Logo & Hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-neutral-700 hover:text-neutral-950 rounded-xl hover:bg-neutral-100 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00A654] flex items-center justify-center text-white font-bold text-xs">
                +
              </div>
              <span className="font-extrabold text-base text-neutral-900">
                Glo<span className="text-[#00A654]">Pharm</span>
              </span>
            </Link>
          </div>

          {/* Mobile: Store + Cart quick-action buttons */}
          <div className="flex items-center gap-2 lg:hidden ml-auto mr-2">
            <Link
              href="/products"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-emerald-50 text-neutral-700 hover:text-[#00A654] text-xs font-bold transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a48.534 48.534 0 0 1 7.5 0m-7.5 0L12 3l8.25 6.349" />
              </svg>
              Store
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-9 h-9 rounded-full bg-neutral-100 hover:bg-emerald-50 text-neutral-700 hover:text-[#00A654] transition-all"
              aria-label="Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#00A654] text-white text-[9px] font-black flex items-center justify-center">3</span>
            </Link>
          </div>

          {/* Desktop Search Input */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative flex items-center">
              <svg className="w-4 h-4 text-neutral-400 absolute left-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Search orders, prescriptions, medicines..."
                className="w-full bg-[#F8F9FA] rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400/70 border border-neutral-200 focus:outline-none focus:border-[#00A654] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00A654] ring-2 ring-white" />
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-neutral-200 p-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                    <span className="font-bold text-xs text-neutral-900">Notifications</span>
                    <span className="text-[10px] text-[#00A654] font-bold">1 Unread</span>
                  </div>
                  <Link
                    href="/account/prescriptions"
                    onClick={() => setNotificationsOpen(false)}
                    className="block p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 transition-colors"
                  >
                    <p className="text-xs font-bold text-neutral-900">Prescription Ready!</p>
                    <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                      Dr. Emmanuel Adeyemi formulated your prescription for Malaria &amp; Typhoid. Tap to review and pay.
                    </p>
                    <span className="text-[10px] text-neutral-400 mt-1 block">15 mins ago</span>
                  </Link>
                </div>
              )}
            </div>

            {/* User Profile Chip */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 sm:border-l border-neutral-200">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-[#00A654]/20 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Amaka Okafor"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-neutral-900 leading-tight">
                  Amaka Okafor
                </span>
                <span className="text-[10px] text-neutral-500 leading-none">
                  Patient Account
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Canvas for Pages */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-8 lg:p-10 pb-24 lg:pb-10">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* ── MOBILE BOTTOM NAVIGATION BAR ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-200 flex items-center justify-around px-2 z-40 shadow-lg">
          <Link
            href="/account/orders"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-bold transition-colors ${
              pathname.startsWith("/account/orders")
                ? "text-[#00A654]"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span>Orders</span>
          </Link>

          <Link
            href="/account/prescriptions"
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-bold transition-colors ${
              pathname.startsWith("/account/prescriptions")
                ? "text-[#00A654]"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#00A654]" />
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <span>Prescriptions</span>
          </Link>

          <Link
            href="/account"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-bold transition-colors ${
              pathname === "/account"
                ? "text-[#00A654]"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <span>Settings</span>
          </Link>

          <Link
            href="/account/referrals"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-bold transition-colors ${
              pathname.startsWith("/account/referrals")
                ? "text-[#00A654]"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h17.25" />
            </svg>
            <span>Rewards</span>
          </Link>
        </nav>

        {/* ── MOBILE SLIDE-OUT DRAWER ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl animate-slide-right">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#00A654] flex items-center justify-center text-white font-extrabold">
                      +
                    </div>
                    <span className="font-black text-lg text-neutral-900">
                      Glo<span className="text-[#00A654]">Pharm</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <nav className="mt-6 space-y-2">
                  {[...mainNavItems, ...bottomNavItems].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-sm ${
                        pathname === item.href
                          ? "bg-[#00A654] text-white"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] bg-emerald-100 text-[#00A654] px-2 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}

                  <div className="pt-4 border-t border-neutral-100">
                    <p className="px-1 pb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Quick Access</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/products"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-neutral-50 hover:bg-emerald-50 border border-neutral-200 hover:border-[#00A654]/30 text-neutral-700 hover:text-[#00A654] transition-all"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#00A654]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a48.534 48.534 0 0 1 7.5 0m-7.5 0L12 3l8.25 6.349" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold">Browse Store</span>
                      </Link>
                      <Link
                        href="/cart"
                        onClick={() => setMobileMenuOpen(false)}
                        className="relative flex flex-col items-center gap-2 p-3 rounded-xl bg-neutral-50 hover:bg-emerald-50 border border-neutral-200 hover:border-[#00A654]/30 text-neutral-700 hover:text-[#00A654] transition-all"
                      >
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00A654] text-white text-[9px] font-black flex items-center justify-center">3</span>
                        <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#00A654]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold">My Cart</span>
                      </Link>
                    </div>
                  </div>
                </nav>
              </div>

              <div className="text-xs text-neutral-400">
                GloPharm Patient &amp; Tele-Health Portal
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
