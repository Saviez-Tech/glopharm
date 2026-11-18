"use client";

import React, { useState } from "react";
import Image from "next/image";

interface AdminHeaderProps {
  darkMode: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchPlaceholder?: string;
  setMobileMenuOpen: (val: boolean) => void;
}

export default function AdminHeader({
  darkMode,
  searchQuery,
  setSearchQuery,
  searchPlaceholder = "Search product",
  setMobileMenuOpen,
}: AdminHeaderProps) {
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/gload/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/glopharm/login";
    }
  };

  return (
    <>
      {/* ── MOBILE TOP BAR ── */}
      <header
        className={`lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b ${
          darkMode ? "bg-[#505050] border-[#666666]" : "bg-white border-[#E8E8E8]"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white">
              <Image
                src="/admin/guy-hawkins.png"
                alt="Guy Hawkins"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className={`font-bold text-xs tracking-tight leading-tight ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
              Guy Hawkins
            </div>
            <div className="text-[10px] text-[#888888]">Admin</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Log out"
            aria-label="Log out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`p-2 rounded-xl transition-colors ${
              darkMode ? "hover:bg-[#606060] text-[#FFFFFF]" : "hover:bg-[#F5F5F5] text-[#282828]"
            }`}
            aria-label="Open Navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── DESKTOP TOP HEADER (Matches Screenshot Exact Layout) ── */}
      <header
        className={`hidden lg:flex items-center justify-between px-8 py-4 border-b sticky top-0 z-20 backdrop-blur-md ${
          darkMode ? "bg-[#505050]/95 border-[#666666]" : "bg-[#f6f8fb]/95 border-[#E8E8E8]"
        }`}
      >
        {/* Search Input */}
        <div className="relative w-80 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className={`w-full pl-4 pr-10 py-2.5 text-xs font-normal rounded-xl border outline-none transition-all ${
              darkMode
                ? "bg-[#454545] border-[#666666] text-[#FFFFFF] placeholder-[#B8B8B8] focus:border-[#8CB8FA]"
                : "bg-white border-[#E8E8E8] text-[#282828] placeholder-[#B8B8B8] focus:border-[#8CB8FA]"
            }`}
          />
          <svg
            className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Right Tools & User Profile */}
        <div className="flex items-center gap-4">
          {/* Message Icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMessagesOpen(!messagesOpen)}
              className={`relative p-2.5 rounded-xl border transition-colors cursor-pointer ${
                darkMode
                  ? "bg-[#454545] border-[#666666] text-[#FFFFFF] hover:bg-[#606060]"
                  : "bg-white border-[#E8E8E8] text-[#888888] hover:bg-[#F5F5F5] hover:text-[#282828]"
              }`}
              aria-label="Messages"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                2
              </span>
            </button>

            {messagesOpen && (
              <div
                className={`absolute right-0 mt-2 w-72 rounded-xl shadow-xl border p-3 z-50 ${
                  darkMode ? "bg-[#454545] border-[#666666] text-[#FFFFFF]" : "bg-white border-[#E8E8E8] text-[#282828]"
                }`}
              >
                <div className="font-bold text-xs mb-2">Customer &amp; Inventory Alerts</div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-blue-50/50 dark:bg-slate-700/50">
                    <div className="font-semibold text-slate-900 dark:text-white">Prescription Refill</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">Vitamin C 1000mg restocked</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`relative p-2.5 rounded-xl border transition-colors cursor-pointer ${
                darkMode
                  ? "bg-[#454545] border-[#666666] text-[#FFFFFF] hover:bg-[#606060]"
                  : "bg-white border-[#E8E8E8] text-[#888888] hover:bg-[#F5F5F5] hover:text-[#282828]"
              }`}
              aria-label="Notifications"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                5
              </span>
            </button>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-3 pl-2 border-l border-[#E8E8E8]">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white">
                <Image
                  src="/admin/guy-hawkins.png"
                  alt="Guy Hawkins"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="hidden sm:block text-left">
              <div className={`font-bold text-xs tracking-tight leading-tight ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                Guy Hawkins
              </div>
              <div className="text-[10px] text-[#888888] font-normal">Admin</div>
            </div>
          </div>

          {/* Quick Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
            title="Log out of Admin"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span className="hidden xl:inline">Logout</span>
          </button>
        </div>
      </header>
    </>
  );
}

