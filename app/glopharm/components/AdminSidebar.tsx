"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
const BASE = "/glopharm";

export const ADMIN_ROUTES = {
  dashboard: BASE,
  products: `${BASE}/products`,
  addProduct: `${BASE}/products/new`,
  orders: `${BASE}/orders`,
  labTests: `${BASE}/prescription`,
  settings: `${BASE}/settings`,
  changePassword: `${BASE}/settings/password`,
} as const;

const PRODUCT_COUNT = 119;
const ORDER_COUNT = 441;

/* --------------------------------- Icons ---------------------------------- */

const ICONS: Record<string, string | string[]> = {
  dashboard:
    "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  product:
    "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  orders:
    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  lab: "M9 3h6M10 3v6.5L5.2 18a2 2 0 001.7 3h10.2a2 2 0 001.7-3L14 9.5V3M8 15h8",
  tag: "M3 11.2V5a2 2 0 012-2h6.2a2 2 0 011.4.6l8 8a2 2 0 010 2.8l-6.2 6.2a2 2 0 01-2.8 0l-8-8A2 2 0 013 11.2zM7.5 7.5h.01",
  lock: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  settings: [
    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    "M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  ],
};

function SideIcon({ name }: { name: keyof typeof ICONS }) {
  const paths = Array.isArray(ICONS[name]) ? (ICONS[name] as string[]) : [ICONS[name] as string];
  return (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" aria-hidden>
      {paths.map((d) => (
        <path key={d.slice(0, 24)} strokeLinecap="round" strokeLinejoin="round" d={d} />
      ))}
    </svg>
  );
}

/* --------------------------------- Props ---------------------------------- */

interface AdminSidebarProps {
  /** Kept for backwards compatibility — active state now comes from the URL. */
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  /** Dark mode was removed; these are accepted but ignored so existing callers still compile. */
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (val: boolean) => void;
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: (val: boolean) => void;
}

/* -------------------------------- Component ------------------------------- */

export default function AdminSidebar({
  setActiveTab,
  mobileMenuOpen = false,
  setMobileMenuOpen,
  sidebarCollapsed = false,
  setSidebarCollapsed,
}: AdminSidebarProps) {
  const pathname = usePathname() ?? "";
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const onDashboard = pathname === BASE || pathname === `${BASE}/`;
  const closeMobile = () => setMobileMenuOpen?.(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/gload/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/glopharm/login";
    }
  };

  const rowCls = (isActive: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${sidebarCollapsed ? "justify-center" : ""
    } ${isActive
      ? "bg-[#e0edff] text-[#1d68ff] font-medium"
      : "text-[#888888] hover:bg-[#F5F5F5] hover:text-[#282828] font-normal"
    }`;

  const navLink = (href: string, icon: keyof typeof ICONS, label: string, isActive: boolean) => (
    <Link
      href={href}
      onClick={() => {
        setActiveTab?.(label);
        closeMobile();
      }}
      title={sidebarCollapsed ? label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={rowCls(isActive)}
    >
      <SideIcon name={icon} />
      {!sidebarCollapsed && <span>{label}</span>}
    </Link>
  );

  const sectionTitle = (text: string) =>
    !sidebarCollapsed && (
      <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-[#888888]">{text}</div>
    );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col justify-between transition-all duration-300 ease-in-out border-r font-sans flex-shrink-0 bg-[#FFFFFF] border-[#E8E8E8] ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"
          } ${mobileMenuOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Top: Logo & Toggle */}
        <div className="p-5">
          <div className={`flex items-center ${sidebarCollapsed ? "flex-col gap-3" : "justify-between"}`}>
            <Link href={ADMIN_ROUTES.dashboard} onClick={closeMobile} className="flex items-center gap-3 overflow-hidden">
              <div className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg overflow-hidden">
                <img src="/images/logo.jpg" alt="Buckksrob" className="h-7 w-7 object-cover" />
              </div>
              {!sidebarCollapsed && (
                <span className="text-xl font-bold leading-none tracking-tight text-[#282828]">Buckksrob</span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  closeMobile();
                } else {
                  setSidebarCollapsed?.(!sidebarCollapsed);
                }
              }}
              className="cursor-pointer rounded-lg p-1 text-[#888888] transition-colors hover:bg-[#F5F5F5]"
              title="Toggle Sidebar"
              aria-label="Toggle Sidebar"
            >
              <svg
                className={`h-5 w-5 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Store Switcher Card */}
          {!sidebarCollapsed && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#E8E8E8] bg-[#FFFFFF] p-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 rounded-lg overflow-hidden border border-[#E8E8E8]">
                <img src="/images/logo.jpg" alt="Buckksrob" className="h-full w-full object-cover" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-[#888888]">Company</div>
                <div className="truncate text-xs font-bold text-[#282828]">Buckksrob Pharmacy</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-1 scrollbar-none">
          {/* GENERAL */}
          <div>
            {sectionTitle("GENERAL")}
            <nav className="space-y-1 text-xs">
              {navLink(ADMIN_ROUTES.dashboard, "dashboard", "Dashboard", onDashboard)}
              {navLink(ADMIN_ROUTES.products, "product", `Product (${PRODUCT_COUNT})`, pathname.startsWith(ADMIN_ROUTES.products))}
              {navLink(ADMIN_ROUTES.orders, "orders", `Orders (${ORDER_COUNT})`, pathname.startsWith(ADMIN_ROUTES.orders))}
              {navLink(ADMIN_ROUTES.labTests, "lab", "Lab Tests", pathname.startsWith(ADMIN_ROUTES.labTests))}
            </nav>
          </div>

          {/* TOOLS */}
          <div>
            {sectionTitle("TOOLS")}
            <nav className="space-y-1 text-xs">
              {navLink(ADMIN_ROUTES.settings, "settings", "Account & Settings", pathname.startsWith(ADMIN_ROUTES.settings))}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="border-t border-[#E8E8E8] p-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl p-1.5 transition-all hover:bg-[#F5F5F5]"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="relative flex-shrink-0">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
                    <Image
                      src="/admin/guy-hawkins.png"
                      alt="Guy Hawkins"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white bg-emerald-500" />
                </div>
                {!sidebarCollapsed && (
                  <div className="overflow-hidden text-left">
                    <div className="truncate text-xs font-bold leading-tight text-[#282828]">Guy Hawkins</div>
                    <div className="mt-0.5 text-[10px] font-normal leading-tight text-[#888888]">Admin</div>
                  </div>
                )}
              </div>

              {!sidebarCollapsed && (
                <svg className="h-3.5 w-3.5 text-[#888888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {profileDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 z-50 mb-2 rounded-xl border border-[#E8E8E8] bg-white p-1 text-[#282828] shadow-lg">
                <Link
                  href={ADMIN_ROUTES.settings}
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    closeMobile();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-normal transition-colors hover:bg-slate-100"
                >
                  <SideIcon name="settings" />
                  <span>Account &amp; Settings</span>
                </Link>
                <Link
                  href={ADMIN_ROUTES.changePassword}
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    closeMobile();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-normal transition-colors hover:bg-slate-100"
                >
                  <SideIcon name="lock" />
                  <span>Change Password</span>
                </Link>
                <Link
                  href="/"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-normal transition-colors hover:bg-slate-100"
                >
                  <SideIcon name="dashboard" />
                  <span>Customer Storefront</span>
                </Link>

                <div className="my-1 border-t border-gray-100" />

                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
                >
                  <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}