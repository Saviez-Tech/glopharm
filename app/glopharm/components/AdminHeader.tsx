"use client";

import React from "react";

interface AdminHeaderProps {
  darkMode?: boolean;
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
  searchPlaceholder?: string;
  setMobileMenuOpen?: (val: boolean) => void;
}

export default function AdminHeader({
  darkMode,
  setMobileMenuOpen,
}: AdminHeaderProps) {
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
        <button
          type="button"
          onClick={() => setMobileMenuOpen?.(true)}
          className={`p-2 rounded-xl transition-colors ${
            darkMode ? "hover:bg-[#606060] text-[#FFFFFF]" : "hover:bg-[#F5F5F5] text-[#282828]"
          }`}
          aria-label="Open Navigation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
          title="Log out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          <span>Logout</span>
        </button>
      </header>

      {/* ── DESKTOP TOP HEADER ── */}
      <header
        className={`hidden lg:flex items-center justify-end px-8 py-3.5 border-b sticky top-0 z-20 backdrop-blur-md ${
          darkMode ? "bg-[#505050]/95 border-[#666666]" : "bg-[#f6f8fb]/95 border-[#E8E8E8]"
        }`}
      >
        {/* Only Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-2xs transition-all cursor-pointer"
          title="Log out of Admin"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          <span>Log Out</span>
        </button>
      </header>
    </>
  );
}

