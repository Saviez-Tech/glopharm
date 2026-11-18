"use client";

import { useState, useEffect } from "react";

export default function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState<"account">("account");

  // Profile Information
  const [profile, setProfile] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password fields
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Fetch Profile on Mount (GET /api/auth/profile) ────────────────────────
  useEffect(() => {
    async function fetchProfile() {
      setLoadingProfile(true);
      setProfileError("");
      try {
        const res = await fetch("/api/auth/profile");
        if (res.status === 401) {
          window.location.href = "/login?callback=" + encodeURIComponent("/account");
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load profile.");
        }

        if (data.data) {
          const d = data.data;
          setProfile({
            username: d.username ?? "",
            name: d.name ?? "",
            email: d.email ?? "",
            phone: d.phone_number ?? "",
            address: d.address ?? "",
            city: d.city ?? "",
            state: d.state ?? "",
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load profile data.";
        setProfileError(msg);
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchProfile();
  }, []);

  // ── Update Profile (PATCH /api/auth/profile/update) ────────────────────────
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    setProfileError("");

    try {
      const payload = {
        name: profile.name.trim(),
        phone_number: profile.phone.trim(),
        address: profile.address.trim(),
        city: profile.city.trim(),
        state: profile.state.trim(),
      };

      const res = await fetch("/api/auth/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      showToast("Profile updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Change Password (POST /api/auth/change-password) ──────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwords.oldPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (!passwords.newPassword || passwords.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: passwords.oldPassword,
          new_password: passwords.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to change password.");
      }

      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showToast("Password changed successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password.";
      setPasswordError(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#00A654] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in font-medium text-sm">
          <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Manage your personal profile, delivery details, and account security.
          </p>
        </div>

        {/* Primary Save Changes Button */}
        <button
          type="button"
          onClick={() => handleSaveProfile()}
          disabled={savingProfile || loadingProfile}
          className="self-start sm:self-auto px-6 py-2.5 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {savingProfile ? (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
          <span>{savingProfile ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {/* ── SUB-NAVIGATION TABS ── */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-neutral-200 overflow-x-auto scrollbar-none pb-px">
        {[
          { key: "account", label: "Profile & Security", icon: "user" },
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

      {loadingProfile ? (
        /* Loading skeleton */
        <div className="space-y-6 animate-pulse">
          <div className="bg-white rounded-3xl border border-neutral-200 p-8 h-80" />
          <div className="bg-white rounded-3xl border border-neutral-200 p-8 h-64" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Section 1: Profile Information (GET /api/auth/profile & PATCH /api/auth/profile/update) */}
          <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs">
            <div className="pb-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                  Profile Information
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  Update your contact info and primary delivery destination.
                </p>
              </div>
              {profile.username && (
                <span className="text-xs font-mono font-semibold bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full border border-neutral-200">
                  @{profile.username}
                </span>
              )}
            </div>

            {profileError && (
              <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span>{profileError}</span>
              </div>
            )}

            <div className="mt-6 space-y-6">
              {/* Full Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-8">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 w-full sm:w-36 shrink-0">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full max-w-xl rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-2.5 text-xs sm:text-sm text-neutral-900 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                />
              </div>

              {/* Email (Read-only from account) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-8">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 w-full sm:w-36 shrink-0">
                  Email Address
                </label>
                <div className="w-full max-w-xl flex items-center gap-2">
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="flex-1 rounded-xl border border-neutral-200 bg-neutral-100/70 px-4 py-2.5 text-xs sm:text-sm text-neutral-500 cursor-not-allowed outline-none"
                  />
                  <span className="text-[11px] font-bold text-[#00A654] bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 shrink-0">
                    Verified
                  </span>
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-8">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 w-full sm:w-36 shrink-0">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+2348012345678"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full max-w-xl rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-2.5 text-xs sm:text-sm text-neutral-900 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                />
              </div>

              {/* Delivery Address */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-8">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 w-full sm:w-36 shrink-0">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12 Aka Road"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full max-w-xl rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-2.5 text-xs sm:text-sm text-neutral-900 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                />
              </div>

              {/* City & State Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-8">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 w-full sm:w-36 shrink-0">
                  City &amp; State
                </label>
                <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City (e.g. Uyo)"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-2.5 text-xs sm:text-sm text-neutral-900 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="State (e.g. Akwa Ibom)"
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-2.5 text-xs sm:text-sm text-neutral-900 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Save Profile Button */}
              <div className="pt-2 sm:pl-44">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {savingProfile && (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  <span>{savingProfile ? "Saving Profile..." : "Save Profile Details"}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Section 2: Password Management (POST /api/auth/change-password) */}
          <form onSubmit={handleChangePassword} className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs">
            <div className="pb-6 border-b border-neutral-100">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                Password &amp; Security
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Update your account password regularly to keep your orders and prescriptions private.
              </p>
            </div>

            {passwordError && (
              <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span>{passwordError}</span>
              </div>
            )}

            <div className="mt-6 space-y-5 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your current password"
                  required
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
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-2.5 text-xs sm:text-sm text-neutral-900 focus:bg-white focus:border-[#00A654] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-2.5 text-xs sm:text-sm text-neutral-900 focus:bg-white focus:border-[#00A654] outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {changingPassword && (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  <span>{changingPassword ? "Updating..." : "Update Password"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
