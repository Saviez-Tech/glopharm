"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to account after simulated login
      router.push("/account");
    }, 800);
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
            <span className="text-xl font-black tracking-tight text-neutral-900">
              Glo<span className="text-[#00A654]">Pharm</span>
            </span>
          </Link>
        </div>

        {/* Center: Main Form */}
        <div className="my-10 lg:my-0">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Welcome
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-medium">
              Get started for a seamless shopping experience
            </p>
          </div>

          {/* Social Login Buttons (Google & Facebook) */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs sm:text-sm font-bold text-neutral-800 transition-all shadow-2xs cursor-pointer"
            >
              {/* Google G SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs sm:text-sm font-bold text-neutral-800 transition-all shadow-2xs cursor-pointer"
            >
              {/* Facebook Logo SVG */}
              <svg className="w-4 h-4 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="w-full border-t border-neutral-200" />
            <span className="bg-white px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-widest absolute">
              OR
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="johndoe@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400/50 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-3 pr-11 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400/50 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  aria-label="Toggle password visibility"
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

              <div className="flex justify-end mt-2">
                <Link
                  href="/account"
                  className="text-xs font-semibold text-neutral-500 hover:text-[#00A654] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Primary Login Button (GloPharm Brand Green #00A654 as requested) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#00A654] hover:bg-[#008f48] active:scale-[0.99] text-white font-bold text-sm shadow-[0_4px_16px_rgba(0,166,84,0.3)] hover:shadow-[0_6px_22px_rgba(0,166,84,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Register */}
          <p className="text-xs sm:text-sm text-neutral-600 text-center mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-[#00A654] hover:text-[#008f48] transition-colors underline decoration-2 underline-offset-4"
            >
              Register
            </Link>
          </p>
        </div>

        {/* Bottom copyright */}
        <p className="text-[11px] text-neutral-400 text-center lg:text-left">
          &copy; 2026 GloPharm Technologies Ltd. All rights reserved.
        </p>
      </div>

      {/* ── RIGHT COLUMN: BRAND PREVIEW & TESTIMONIAL CARD (Matches Reference Layout) ── */}
      <div className="hidden lg:flex w-1/2 bg-[#F6F8F6] p-12 xl:p-16 flex-col justify-center items-center relative overflow-hidden border-l border-neutral-200/80">
        {/* Subtle decorative circles */}
        <div className="absolute top-12 right-12 w-96 h-96 rounded-full bg-[#00A654]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 left-12 w-96 h-96 rounded-full bg-[#0265CB]/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full space-y-8">
          {/* Main Card (Browser / Review Frame from Reference Image) */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-neutral-100 relative">
            {/* Browser top dots */}
            <div className="flex items-center gap-1.5 pb-4 border-b border-neutral-100 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#00A654]" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono text-neutral-400 ml-2">glopharm.ng/store</span>
            </div>

            {/* Product Image Preview */}
            <div className="w-full h-52 rounded-2xl bg-[#F8F9FA] overflow-hidden flex items-center justify-center p-3">
              <img
                src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80"
                alt="Health & Farm Produce"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1 mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
                </svg>
              ))}
            </div>

            {/* Testimonial Quote from image */}
            <p className="text-xs text-neutral-700 font-medium mt-2 leading-relaxed">
              &quot;Got fresh farm groceries and genuine prescription medications delivered in 2 hours. The service is so reliable, I LOVE IT.&quot;
            </p>

            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px]">
              <span className="font-bold text-neutral-900">Verified Patient</span>
              <span className="text-[#00A654] font-bold">100% Authentic</span>
            </div>
          </div>

          {/* Floating Brand Badge (Matches 'Believe in yourself' badge in reference) */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-neutral-200/80 -mt-6 ml-6 max-w-[280px]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00A654] text-white flex items-center justify-center font-black text-xs shrink-0">
                GP
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">GloPharm Certified</p>
                <p className="text-[10px] text-neutral-500">Fast cold-chain delivery</p>
              </div>
            </div>
          </div>

          {/* Bottom Heading & Subtitle */}
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
