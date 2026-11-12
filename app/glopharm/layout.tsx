"use client";

import React, { useState, createContext, useContext, ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

interface AdminContextType {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

const AdminContext = createContext<AdminContextType>({
  darkMode: false,
  setDarkMode: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  activeCategory: "Sneakers",
  setActiveCategory: () => {},
});

export const useAdmin = () => useContext(AdminContext);

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Sneakers");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Exclude admin layout (sidebar + header) on login/auth pages
  const isAuthPage = pathname ? pathname.includes("/glopharm/login") : false;

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AdminContext.Provider
      value={{
        darkMode,
        setDarkMode,
        searchQuery,
        setSearchQuery,
        activeCategory,
        setActiveCategory,
      }}
    >
      <div
        className={`min-h-screen w-full flex font-sans transition-colors duration-200 ${
          darkMode ? "bg-[#505050] text-[#FFFFFF]" : "bg-[#f6f8fb] text-[#282828]"
        }`}
      >
        {/* Unified Admin Sidebar */}
        <AdminSidebar
          activeTab={activeCategory}
          setActiveTab={setActiveCategory}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        {/* Right column: header + page content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
          <AdminHeader
            darkMode={darkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Search product"
            setMobileMenuOpen={setMobileMenuOpen}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
