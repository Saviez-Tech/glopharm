"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in as staff, go straight to dashboard
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((json) => {
        if (json?.data?.authenticated) router.replace("/glopharm");
      })
      .catch(() => { });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      const isStaff = data?.data?.is_staff === true;
      if (!isStaff) {
        throw new Error("You do not have admin access. Please use the patient portal.");
      }

      // Full navigation so cookies are sent on subsequent requests
      window.location.assign("/glopharm");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in. Please try again.";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row antialiased font-sans">
      {/* ── LEFT: Form ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-24 max-w-2xl mx-auto lg:mx-0">
        {/* Logo */}
        <div>
          <div className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1d68ff] flex items-center justify-center text-white font-extrabold shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-neutral-900 leading-none">
                Glo<span className="text-[#1d68ff]">Pharm</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase mt-0.5">
                Admin Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="my-8 sm:my-12">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Admin Sign In
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              Sign in to manage products, orders, prescriptions and more.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200/80 text-red-700 text-xs sm:text-sm flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-neutral-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-[#FBFBFA] pl-11 pr-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#1d68ff] focus:ring-2 focus:ring-[#1d68ff]/15 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-neutral-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-[#FBFBFA] pl-11 pr-12 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#1d68ff] focus:ring-2 focus:ring-[#1d68ff]/15 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-[#1d68ff] hover:bg-[#1656d6] text-white font-bold text-sm shadow-lg shadow-[#1d68ff]/25 hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-400">
            Not an admin?{" "}
            <a href="/login" className="font-bold text-[#00A654] hover:underline">
              Go to patient portal
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2">
          <span>&copy; 2026 GloPharm Ltd. All rights reserved.</span>
        </div>
      </div>

      {/* ── RIGHT: Brand panel ── */}
      <div className="hidden lg:flex w-1/2 bg-[#EEF4FF] border-l border-blue-100 flex-col justify-between p-12 xl:p-16 relative overflow-hidden select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-blue-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#1d68ff] animate-pulse" />
            <span className="text-xs font-bold text-neutral-800 tracking-tight">Admin Access Only</span>
          </div>
        </div>

        <div className="relative my-auto flex items-center justify-center py-8 z-10">
          <div className="max-w-md w-full space-y-4">
            {[
              { icon: "📦", label: "Manage Products", desc: "Create, edit and remove catalogue items" },
              { icon: "🧾", label: "Review Orders", desc: "Track and fulfil patient orders in real time" },
              { icon: "💊", label: "Prescriptions", desc: "Review uploaded patient prescriptions" },
              { icon: "📊", label: "Analytics", desc: "Sales stats and inventory insights" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4 bg-white/80 backdrop-blur rounded-2xl p-4 border border-blue-50 shadow-sm">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-bold text-neutral-900">{item.label}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="z-10 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-blue-100 shadow-sm text-center">
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
            GloPharm Admin Dashboard
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Restricted access — staff with <code className="bg-blue-50 px-1 rounded text-[#1d68ff]">is_staff</code> permission only.
          </p>
        </div>
      </div>
    </div>
  );
}
