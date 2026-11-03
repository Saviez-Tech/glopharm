"use client";

import { useState } from "react";

export default function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "account" | "billing" | "appearance" | "notifications" | "privacy"
  >("account");

  // Profile Information
  const [profile, setProfile] = useState({
    name: "Amaka Okafor",
    email: "amaka.okafor@example.com",
    phone: "+234 803 123 4567",
    address: "14 Victoria Island Boulevard, Lagos",
    city: "Lagos State",
  });

  // Security Toggles (from reference image)
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  // Password fields
  const [passwords, setPasswords] = useState({
    oldPassword: "••••••••",
    newPassword: "",
    confirmPassword: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = () => {
    setToastMessage("Settings saved successfully!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#00A654] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in font-medium text-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── HEADER (Title + Save Changes CTA Button) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Manage your personal profile, contact information, and account security.
          </p>
        </div>

        {/* Primary Save Changes Button (Glopharm Brand Green #00A654) */}
        <button
          type="button"
          onClick={handleSave}
          className="self-start sm:self-auto px-6 py-2.5 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span>Save Changes</span>
        </button>
      </div>

      {/* ── SUB-NAVIGATION TABS (Matching Reference Header Bar) ── */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-neutral-200 overflow-x-auto scrollbar-none pb-px">
        {[
          { key: "account", label: "Account Settings", icon: "user" },
          { key: "billing", label: "Billing & Cards", icon: "card" },
          { key: "notifications", label: "Notifications", icon: "bell" },
          { key: "privacy", label: "Privacy & Data", icon: "shield" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-[#00A654] text-[#00A654]"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: ACCOUNT SETTINGS CONTENT ── */}
      {activeTab === "account" && (
        <div className="space-y-10">
          {/* Section 1: Profile Information */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs">
            <div className="pb-6 border-b border-neutral-100">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                Profile Information
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Manage your personal details and keep your contact info up to date.
              </p>
            </div>

            <div className="mt-6 space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <span className="text-xs sm:text-sm font-semibold text-neutral-700 w-full sm:w-36 shrink-0">
                  Profile Picture
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/30 ring-2 ring-emerald-500/10 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                      alt="Amaka Okafor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <button
                      type="button"
                      className="text-neutral-500 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="text-[#00A654] hover:text-[#008f48] transition-colors cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-8">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 w-full sm:w-36 shrink-0">
                  Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full max-w-xl rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-2.5 text-xs sm:text-sm text-neutral-900 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-8">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 w-full sm:w-36 shrink-0">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full max-w-xl rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-2.5 text-xs sm:text-sm text-neutral-900 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-8">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 w-full sm:w-36 shrink-0">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full max-w-xl rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-2.5 text-xs sm:text-sm text-neutral-900 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                />
              </div>

              {/* Delivery Address */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-8">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 w-full sm:w-36 shrink-0">
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full max-w-xl rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-2.5 text-xs sm:text-sm text-neutral-900 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Security (Matching the Reference Screenshot) */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs">
            <div className="pb-6 border-b border-neutral-100">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                Security
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Keep your account secure with extra authentication and alerts.
              </p>
            </div>

            <div className="mt-6 space-y-6">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between max-w-xl">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Add an extra layer of protection to your account with SMS OTP.
                  </p>
                </div>
                {/* Switch (Brand Green #00A654) */}
                <button
                  type="button"
                  onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    twoFactorAuth ? "bg-[#00A654]" : "bg-neutral-300"
                  }`}
                  aria-label="Toggle Two-Factor Authentication"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      twoFactorAuth ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Login Alert Notification */}
              <div className="flex items-center justify-between max-w-xl">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900">
                    Login Alert Notification
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Get notified when your account is accessed from a new device.
                  </p>
                </div>
                {/* Switch (Brand Green #00A654) */}
                <button
                  type="button"
                  onClick={() => setLoginAlerts(!loginAlerts)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    loginAlerts ? "bg-[#00A654]" : "bg-neutral-300"
                  }`}
                  aria-label="Toggle Login Alert Notification"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      loginAlerts ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Password Management (Matching Reference Screenshot) */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs">
            <div className="pb-6 border-b border-neutral-100">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                Password Management
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Update your account password regularly to keep your health data private.
              </p>
            </div>

            <div className="mt-6 space-y-5 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Old Password
                </label>
                <input
                  type="password"
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-2.5 text-xs sm:text-sm text-neutral-900 focus:bg-white focus:border-[#00A654] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-2.5 text-xs sm:text-sm text-neutral-900 focus:bg-white focus:border-[#00A654] outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: BILLING & PAYMENT ── */}
      {activeTab === "billing" && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-neutral-900">Saved Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border-2 border-[#00A654] bg-emerald-50/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center font-mono font-bold text-xs">
                  VISA
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">•••• •••• •••• 4242</p>
                  <p className="text-xs text-neutral-500">Expires 08/28 · Default</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#00A654] bg-emerald-100 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: NOTIFICATIONS ── */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-neutral-900">Notification Preferences</h2>
          <div className="space-y-4 max-w-xl">
            <label className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 cursor-pointer">
              <div>
                <p className="text-sm font-bold text-neutral-900">Prescription Status Updates</p>
                <p className="text-xs text-neutral-500">Receive instant SMS and email when doctor issues prescription.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-[#00A654] rounded focus:ring-[#00A654]" />
            </label>
            <label className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 cursor-pointer">
              <div>
                <p className="text-sm font-bold text-neutral-900">Order Delivery Tracking</p>
                <p className="text-xs text-neutral-500">Live courier notifications for your pharmaceutical orders.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-[#00A654] rounded focus:ring-[#00A654]" />
            </label>
          </div>
        </div>
      )}

      {/* ── TAB 4: PRIVACY ── */}
      {activeTab === "privacy" && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-neutral-900">Medical Data & Privacy</h2>
          <p className="text-sm text-neutral-600">
            GloPharm complies with Nigerian Health Data Regulations and NDPR standards. Your uploaded test results are strictly confidential and only accessible to licensed medical practitioners assigned to your review.
          </p>
        </div>
      )}
    </div>
  );
}
