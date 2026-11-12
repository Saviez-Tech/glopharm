"use client";

import React, { useState } from "react";
import Link from "next/link";

const SETTINGS_HREF = "/glopharm/settings";

// TODO: point this at your real endpoint.
// Expected: POST { currentPassword, newPassword } -> 2xx on success, { message } on error.
const CHANGE_PASSWORD_ENDPOINT = "/api/admin/change-password";

type FieldKey = "current" | "next" | "confirm";

function EyeIcon({ off }: { off: boolean }) {
    return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" aria-hidden>
            {off ? (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.8 9.8 0 0112 5c4.5 0 8.3 3 9.5 7a10.5 10.5 0 01-2.7 4.3M6.6 6.6A10.5 10.5 0 002.5 12c1.2 4 5 7 9.5 7 1.6 0 3.1-.4 4.4-1"
                />
            ) : (
                <>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.5 12C3.7 8 7.5 5 12 5s8.3 3 9.5 7c-1.2 4-5 7-9.5 7s-8.3-3-9.5-7z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </>
            )}
        </svg>
    );
}

export default function ChangePasswordPage() {
    const [values, setValues] = useState({ current: "", next: "", confirm: "" });
    const [show, setShow] = useState<Record<FieldKey, boolean>>({ current: false, next: false, confirm: false });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const rules = [
        { label: "At least 8 characters", ok: values.next.length >= 8 },
        { label: "One uppercase letter", ok: /[A-Z]/.test(values.next) },
        { label: "One number", ok: /\d/.test(values.next) },
        { label: "Different from current password", ok: values.next !== "" && values.next !== values.current },
    ];
    const allRulesOk = rules.every((r) => r.ok);
    const matches = values.next !== "" && values.next === values.confirm;
    const canSubmit = values.current !== "" && allRulesOk && matches && !submitting;

    const setField = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues((v) => ({ ...v, [key]: e.target.value }));
        setError(null);
        setSuccess(false);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(CHANGE_PASSWORD_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: values.current, newPassword: values.next }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || "Could not change password. Please try again.");
            }
            setSuccess(true);
            setValues({ current: "", next: "", confirm: "" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    }

    const field = (key: FieldKey, label: string, autoComplete: string) => (
        <div>
            <label htmlFor={key} className="mb-1.5 block text-xs font-medium text-[#282828]">
                {label}
            </label>
            <div className="relative">
                <input
                    id={key}
                    type={show[key] ? "text" : "password"}
                    value={values[key]}
                    onChange={setField(key)}
                    autoComplete={autoComplete}
                    required
                    className="w-full rounded-xl border border-[#E8E8E8] bg-white px-3 py-2.5 pr-10 text-sm text-[#282828] outline-none transition-colors placeholder:text-[#B8B8B8] focus:border-[#1d68ff] focus:ring-2 focus:ring-[#1d68ff]/20"
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
                    aria-label={show[key] ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-[#888888] hover:text-[#282828]"
                >
                    <EyeIcon off={show[key]} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="mx-auto w-full max-w-xl px-4 py-8">
            <Link href={SETTINGS_HREF} className="mb-4 inline-flex items-center gap-1 text-xs text-[#888888] hover:text-[#282828]">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Account &amp; Settings
            </Link>

            <div className="rounded-2xl border border-[#E8E8E8] bg-white p-6 shadow-sm">
                <h1 className="text-lg font-bold text-[#282828]">Change Password</h1>
                <p className="mt-1 text-xs text-[#888888]">Use a strong password you don&apos;t use anywhere else.</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                    {field("current", "Current password", "current-password")}
                    {field("next", "New password", "new-password")}

                    <ul className="space-y-1 rounded-xl bg-[#F5F5F5] p-3 text-xs">
                        {rules.map((r) => (
                            <li key={r.label} className={`flex items-center gap-2 ${r.ok ? "text-emerald-600" : "text-[#888888]"}`}>
                                <span aria-hidden>{r.ok ? "✓" : "○"}</span>
                                {r.label}
                            </li>
                        ))}
                    </ul>

                    {field("confirm", "Confirm new password", "new-password")}
                    {values.confirm !== "" && !matches && <p className="text-xs text-red-600">Passwords do not match.</p>}

                    {error && (
                        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                            Your password has been updated.
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link href={SETTINGS_HREF} className="rounded-xl px-4 py-2.5 text-xs font-medium text-[#888888] hover:bg-[#F5F5F5]">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="rounded-xl bg-[#1d68ff] px-4 py-2.5 text-xs font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}