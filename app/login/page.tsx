"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback =
    searchParams.get("callback") ||
    searchParams.get("callbackUrl") ||
    searchParams.get("next") ||
    searchParams.get("redirect") ||
    "/account";
  const callbackUrl = rawCallback.startsWith("/") ? rawCallback : `/${rawCallback}`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // If already authenticated, redirect to callback destination
  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.data?.authenticated) {
            window.location.assign(callbackUrl);
          }
        }
      } catch {
        // stay on login page
      }
    }
    checkExistingAuth();
  }, [callbackUrl]);

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
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      // Perform a full navigation so new cookies are sent with request headers
      window.location.assign(callbackUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in. Please try again.";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row antialiased font-sans selection:bg-[#00A654] selection:text-white">
      {/* ── LEFT COLUMN: LOGIN FORM (Matches Reference Layout) ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-24 max-w-2xl mx-auto lg:mx-0">
        {/* Top: Logo */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#00A654] flex items-center justify-center text-white font-extrabold shadow-sm group-hover:bg-[#008f48] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-neutral-900 leading-none">
                Glo<span className="text-[#00A654]">Pharm</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase mt-0.5">
                Health &amp; Groceries
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Main Form */}
        <div className="my-8 sm:my-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              Sign in to manage your health orders, prescriptions, and pharmacy deliveries.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200/80 text-red-700 text-xs sm:text-sm flex items-start gap-3 animate-shake">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
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
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-[#FBFBFA] pl-11 pr-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-[#00A654] hover:text-[#008f48] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
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
                  className="w-full rounded-2xl border border-neutral-200 bg-[#FBFBFA] pl-11 pr-12 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
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

            {/* Remember Me */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-[#00A654] border-neutral-300 focus:ring-[#00A654] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs font-semibold text-neutral-600 select-none">
                  Keep me signed in on this device
                </span>
              </label>
            </div>

            {/* Sign In CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#00A654]/25 hover:shadow-xl hover:shadow-[#00A654]/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                    <span>Sign In</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sign Up Redirect */}
          <div className="mt-6 text-center text-xs sm:text-sm text-neutral-500">
            Don&apos;t have a GloPharm account yet?{" "}
            <Link
              href="/register"
              className="font-bold text-[#00A654] hover:text-[#008f48] underline underline-offset-4 decoration-2 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2">
          <span>&copy; {new Date().getFullYear()} GloPharm Ltd. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-neutral-700 transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-neutral-700 transition-colors">Terms</Link>
            <Link href="/" className="hover:text-neutral-700 transition-colors">Help</Link>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: HERO CAROUSEL / BRAND BANNER ── */}
      <div className="hidden lg:flex w-1/2 bg-[#FAF5EC] border-l border-[#ECE5D8] flex-col justify-between p-12 xl:p-16 relative overflow-hidden select-none">
        {/* Decorative background circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-between z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-[#ECE5D8] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#00A654] animate-pulse" />
            <span className="text-xs font-bold text-neutral-800 tracking-tight">
              NAFDAC Certified Pharmacy
            </span>
          </div>

          <div className="text-xs font-semibold text-neutral-500">
            24/7 Verified Support
          </div>
        </div>

        {/* Center: Hero Product / Visual Mock */}
        <div className="relative my-auto flex items-center justify-center py-8 z-10">
          <div className="relative max-w-md w-full">
            <div className="relative mx-auto w-72 h-80 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#ECE5D8] p-6 flex flex-col items-center justify-center group hover:scale-[1.02] transition-transform duration-300">
              <div className="w-48 h-48 rounded-2xl bg-[#F6F5F0] flex items-center justify-center p-4 overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80"
                  alt="Vitamin C Effervescent"
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>

              <div className="text-center w-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00A654]">
                  Best Seller
                </span>
                <h3 className="font-bold text-neutral-900 text-sm mt-0.5 truncate">
                  Immunity Boost &amp; Wellness
                </h3>
                <p className="text-xs font-semibold text-neutral-400 mt-0.5">
                  Same-day delivery across Nigeria
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial Card */}
        <div className="z-10 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#ECE5D8] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00A654] text-white flex items-center justify-center font-black text-xs shrink-0">
              GP
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">GloPharm Certified</p>
              <p className="text-[10px] text-neutral-500">Fast cold-chain delivery</p>
            </div>
          </div>

          <div className="text-center pt-2">
            <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
              Start Shopping &amp; Living Healthy
            </h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Access verified doctors, upload diagnostic lab results, and earn cashback reward points on every order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginForm />
    </Suspense>
  );
}
