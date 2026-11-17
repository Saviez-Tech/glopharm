"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FlowStep = "request" | "verify" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<FlowStep>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // 60-second cooldown timer for Resend OTP
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setInfoMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP. Please check your email.");
      }

      setInfoMessage(data.message || `An OTP has been sent to ${cleanEmail}`);
      setCountdown(60); // Start 60s cooldown
      setStep("verify");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send OTP.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: cleanOtp,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid or expired OTP.");
      }

      setStep("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reset password.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#FBFBFA] flex flex-col justify-center items-center p-4 sm:p-6 antialiased font-sans selection:bg-[#00A654] selection:text-white">
      {/* Centralized Form Container */}
      <div className="w-full max-w-md mx-auto">
        {/* Brand Logo Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#00A654] flex items-center justify-center text-white font-extrabold shadow-sm group-hover:bg-[#008f48] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tight text-neutral-900">
              Glo<span className="text-[#00A654]">Pharm</span>
            </span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-neutral-200/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          {/* STEP 1: REQUEST OTP */}
          {step === "request" && (
            <div>
              <div className="mb-6 text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  Forgot Password?
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 mt-2">
                  Enter your registered email address and we&apos;ll send you an OTP to reset your password.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200/60 text-xs sm:text-sm text-red-600 flex items-center gap-2.5">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400/50 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                    required
                  />
                </div>

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
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <span>Request Password Reset OTP</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Already have an OTP shortcut */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => { setError(""); setStep("verify"); }}
                  className="text-xs font-semibold text-neutral-500 hover:text-[#00A654] transition-colors"
                >
                  Already have an OTP? Enter code
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ENTER OTP & NEW PASSWORD */}
          {step === "verify" && (
            <div>
              <div className="mb-6 text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  Enter OTP &amp; Reset
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 mt-2">
                  {email ? (
                    <>
                      We sent a one-time code to <span className="font-semibold text-neutral-800">{email}</span>.
                    </>
                  ) : (
                    "Enter the verification code sent to your email."
                  )}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200/60 text-xs sm:text-sm text-red-600 flex items-center gap-2.5">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {infoMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{infoMessage}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 39086206"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400/50 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all font-mono tracking-widest text-center"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-[#FBFBFA] px-4 py-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400/50 focus:bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                    required
                  />
                </div>

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
                        <span>Resetting Password...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </div>
              </form>

              {/* 1-Minute Countdown Resend Link */}
              <div className="mt-5 text-center">
                {countdown > 0 ? (
                  <p className="text-xs text-neutral-500">
                    Didn&apos;t receive code? Resend in{" "}
                    <span className="font-bold text-[#00A654] font-mono">
                      {formatTimer(countdown)}
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    disabled={isLoading}
                    className="text-xs font-bold text-[#00A654] hover:underline cursor-pointer transition-all"
                  >
                    Didn&apos;t receive code? Request again
                  </button>
                )}
              </div>

              {/* Back to change email */}
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => { setError(""); setInfoMessage(""); setStep("request"); }}
                  className="text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                >
                  ← Change email address
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === "success" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#00A654]/10 text-[#00A654] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                Password Reset Successfully!
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-2">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full py-3.5 rounded-xl bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-sm shadow-[0_4px_16px_rgba(0,166,84,0.3)] transition-all cursor-pointer"
                >
                  Proceed to Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
