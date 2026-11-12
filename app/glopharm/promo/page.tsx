"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type DiscountType = "percentage" | "fixed";
type PromoStatus = "active" | "scheduled" | "paused" | "expired" | "used_up";

interface PromoCode {
    id: string;
    code: string;
    description: string;
    type: DiscountType;
    value: number; // % or ₦ amount
    maxDiscount?: number; // cap, percentage codes only
    minOrder: number; // 0 = no minimum
    usageLimit?: number; // total redemptions, undefined = unlimited
    perCustomerLimit: number;
    used: number;
    startDate: string; // yyyy-mm-dd
    endDate?: string; // yyyy-mm-dd, undefined = never expires
    appliesTo: string[]; // [] = all products
    firstOrderOnly: boolean;
    active: boolean; // manual pause switch
}

/* ------------------------------ Sample data ------------------------------ */

const CATEGORIES = ["Supplements", "Medicines", "Devices", "First Aid"];

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysFromNow = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return toISO(d);
};
const fmtDate = (s: string) =>
    new Date(`${s}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const naira = (n: number) => "₦" + n.toLocaleString("en-NG");

/** Dates are relative to today so the sample always shows a mix of statuses. */
const buildSeed = (): PromoCode[] => [
    {
        id: "p1", code: "WELCOME10", description: "10% off a customer's first order",
        type: "percentage", value: 10, maxDiscount: 5000, minOrder: 5000, usageLimit: 500, perCustomerLimit: 1, used: 214,
        startDate: daysFromNow(-60), endDate: undefined, appliesTo: [], firstOrderOnly: true, active: true,
    },
    {
        id: "p2", code: "HEALTH2K", description: "₦2,000 off orders over ₦15,000",
        type: "fixed", value: 2000, minOrder: 15000, usageLimit: 300, perCustomerLimit: 2, used: 96,
        startDate: daysFromNow(-20), endDate: daysFromNow(5), appliesTo: [], firstOrderOnly: false, active: true,
    },
    {
        id: "p3", code: "BLACKFRIDAY25", description: "Black Friday — 25% off supplements",
        type: "percentage", value: 25, maxDiscount: 10000, minOrder: 10000, usageLimit: 1000, perCustomerLimit: 1, used: 0,
        startDate: daysFromNow(23), endDate: daysFromNow(26), appliesTo: ["Supplements"], firstOrderOnly: false, active: true,
    },
    {
        id: "p4", code: "VIP5000", description: "₦5,000 off for VIP customers",
        type: "fixed", value: 5000, minOrder: 25000, usageLimit: 100, perCustomerLimit: 1, used: 100,
        startDate: daysFromNow(-45), endDate: daysFromNow(30), appliesTo: [], firstOrderOnly: false, active: true,
    },
    {
        id: "p5", code: "STAFF20", description: "Staff discount on all medicines",
        type: "percentage", value: 20, maxDiscount: undefined, minOrder: 0, usageLimit: undefined, perCustomerLimit: 5, used: 38,
        startDate: daysFromNow(-90), endDate: undefined, appliesTo: ["Medicines"], firstOrderOnly: false, active: false,
    },
    {
        id: "p6", code: "SUMMER15", description: "Summer wellness sale",
        type: "percentage", value: 15, maxDiscount: 7500, minOrder: 8000, usageLimit: 400, perCustomerLimit: 1, used: 331,
        startDate: daysFromNow(-120), endDate: daysFromNow(-30), appliesTo: [], firstOrderOnly: false, active: true,
    },
];

/* --------------------------------- Status --------------------------------- */

function getStatus(p: PromoCode): PromoStatus {
    const today = toISO(new Date());
    if (p.endDate && today > p.endDate) return "expired";
    if (p.usageLimit && p.used >= p.usageLimit) return "used_up";
    if (!p.active) return "paused";
    if (today < p.startDate) return "scheduled";
    return "active";
}

const STATUS_LABEL: Record<PromoStatus, string> = {
    active: "Active",
    scheduled: "Scheduled",
    paused: "Paused",
    expired: "Expired",
    used_up: "Used up",
};
const STATUS_STYLE: Record<PromoStatus, string> = {
    active: "bg-green-200 text-green-800",
    scheduled: "bg-blue-100 text-blue-700",
    paused: "bg-yellow-100 text-yellow-700",
    expired: "bg-gray-200 text-gray-600",
    used_up: "bg-orange-200 text-orange-700",
};

const TABS = [
    { key: "all", label: "All Codes" },
    { key: "active", label: "Active" },
    { key: "scheduled", label: "Scheduled" },
    { key: "paused", label: "Paused" },
    { key: "ended", label: "Ended" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const matchesTab = (s: PromoStatus, tab: TabKey) =>
    tab === "all" ? true : tab === "ended" ? s === "expired" || s === "used_up" : s === tab;

/* --------------------------------- Icons ---------------------------------- */

const Svg = ({ children, className = "h-4 w-4" }: { children: ReactNode; className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        {children}
    </svg>
);
const SearchIcon = () => (<Svg><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>);
const PlusIcon = () => (<Svg><path d="M12 5v14M5 12h14" /></Svg>);
const EditIcon = () => (<Svg><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Svg>);
const TrashIcon = () => (<Svg><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" /></Svg>);
const PauseIcon = () => (<Svg><path d="M8 5v14M16 5v14" /></Svg>);
const PlayIcon = () => (<Svg><path d="M7 4.5v15l12-7.5Z" /></Svg>);
const CopyIcon = () => (<Svg className="h-3.5 w-3.5"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></Svg>);
const CheckIcon = () => (<Svg><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>);
const CloseIcon = () => (<Svg><path d="M6 6l12 12M18 6 6 18" /></Svg>);
const CaretRight = () => (<svg viewBox="0 0 8 10" className="h-2.5 w-2 fill-current" aria-hidden><path d="M0 0l8 5-8 5z" /></svg>);

const Badge = ({ status }: { status: PromoStatus }) => (
    <span className={`inline-block whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLE[status]}`}>
        {STATUS_LABEL[status]}
    </span>
);

const INPUT =
    "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50";

/* -------------------------------------------------------------------------- */
/*  Create / edit modal                                                        */
/* -------------------------------------------------------------------------- */

interface FormState {
    code: string;
    description: string;
    type: DiscountType;
    value: string;
    maxDiscount: string;
    minOrder: string;
    usageLimit: string;
    perCustomerLimit: string;
    startDate: string;
    endDate: string;
    scope: "all" | "categories";
    categories: string[];
    firstOrderOnly: boolean;
    active: boolean;
}
type Errors = Partial<Record<keyof FormState, string>>;

const toForm = (p: PromoCode | null): FormState =>
    p
        ? {
            code: p.code,
            description: p.description,
            type: p.type,
            value: String(p.value),
            maxDiscount: p.maxDiscount ? String(p.maxDiscount) : "",
            minOrder: p.minOrder ? String(p.minOrder) : "",
            usageLimit: p.usageLimit ? String(p.usageLimit) : "",
            perCustomerLimit: String(p.perCustomerLimit),
            startDate: p.startDate,
            endDate: p.endDate ?? "",
            scope: p.appliesTo.length ? "categories" : "all",
            categories: p.appliesTo,
            firstOrderOnly: p.firstOrderOnly,
            active: p.active,
        }
        : {
            code: "",
            description: "",
            type: "percentage",
            value: "",
            maxDiscount: "",
            minOrder: "",
            usageLimit: "",
            perCustomerLimit: "1",
            startDate: toISO(new Date()),
            endDate: "",
            scope: "all",
            categories: [],
            firstOrderOnly: false,
            active: true,
        };

const randomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const tail = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `SAVE${tail}`;
};

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-900">
                {label} {hint && <span className="font-normal text-gray-400">({hint})</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
        </div>
    );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-300"}`}
        >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-1"}`} />
        </button>
    );
}

function PromoModal({
    promo,
    existingCodes,
    onClose,
    onSave,
}: {
    promo: PromoCode | null; // null = creating
    existingCodes: { id: string; code: string }[];
    onClose: () => void;
    onSave: (data: Omit<PromoCode, "id" | "used"> & { id?: string; used?: number }) => void;
}) {
    const [f, setF] = useState<FormState>(() => toForm(promo));
    const [errors, setErrors] = useState<Errors>({});

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setF((prev) => ({ ...prev, [key]: value }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const toggleCategory = (c: string) =>
        set("categories", f.categories.includes(c) ? f.categories.filter((x) => x !== c) : [...f.categories, c]);

    const validate = (): Errors => {
        const e: Errors = {};
        const code = f.code.trim().toUpperCase();
        if (!code) e.code = "Enter a code or generate one.";
        else if (!/^[A-Z0-9_-]{3,20}$/.test(code)) e.code = "3–20 characters: letters, numbers, - or _.";
        else if (existingCodes.some((c) => c.code === code && c.id !== promo?.id)) e.code = "This code already exists.";

        const value = Number(f.value);
        if (!f.value || Number.isNaN(value) || value <= 0) e.value = "Enter a discount greater than 0.";
        else if (f.type === "percentage" && value > 100) e.value = "A percentage can't be more than 100.";

        if (f.maxDiscount && (Number.isNaN(Number(f.maxDiscount)) || Number(f.maxDiscount) <= 0)) e.maxDiscount = "Enter a valid amount.";
        if (f.minOrder && (Number.isNaN(Number(f.minOrder)) || Number(f.minOrder) < 0)) e.minOrder = "Enter a valid amount.";

        if (f.usageLimit) {
            const n = Number(f.usageLimit);
            if (!Number.isInteger(n) || n < 1) e.usageLimit = "Enter a whole number of 1 or more.";
            else if (promo && n < promo.used) e.usageLimit = `Can't be below the ${promo.used} redemptions already used.`;
        }
        const per = Number(f.perCustomerLimit);
        if (!Number.isInteger(per) || per < 1) e.perCustomerLimit = "Enter a whole number of 1 or more.";

        if (!f.startDate) e.startDate = "Choose a start date.";
        if (f.endDate && f.startDate && f.endDate < f.startDate) e.endDate = "End date can't be before the start date.";
        if (f.scope === "categories" && f.categories.length === 0) e.categories = "Select at least one category.";
        return e;
    };

    const submit = (ev: React.FormEvent) => {
        ev.preventDefault();
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) return;

        onSave({
            id: promo?.id,
            used: promo?.used,
            code: f.code.trim().toUpperCase(),
            description: f.description.trim(),
            type: f.type,
            value: Number(f.value),
            maxDiscount: f.type === "percentage" && f.maxDiscount ? Number(f.maxDiscount) : undefined,
            minOrder: f.minOrder ? Number(f.minOrder) : 0,
            usageLimit: f.usageLimit ? Number(f.usageLimit) : undefined,
            perCustomerLimit: Number(f.perCustomerLimit),
            startDate: f.startDate,
            endDate: f.endDate || undefined,
            appliesTo: f.scope === "categories" ? f.categories : [],
            firstOrderOnly: f.firstOrderOnly,
            active: f.active,
        });
    };

    // Plain-language preview of what the customer gets
    const preview = (() => {
        const v = Number(f.value);
        if (!v) return "Fill in the discount to see a preview.";
        const amount = f.type === "percentage" ? `${v}% off` : `${naira(v)} off`;
        const min = f.minOrder ? ` orders over ${naira(Number(f.minOrder))}` : " any order";
        const cap = f.type === "percentage" && f.maxDiscount ? `, up to ${naira(Number(f.maxDiscount))}` : "";
        const scope = f.scope === "categories" && f.categories.length ? ` on ${f.categories.join(", ")}` : "";
        const first = f.firstOrderOnly ? " (first order only)" : "";
        return `Customers get ${amount}${min}${scope}${cap}${first}.`;
    })();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <form
                onSubmit={submit}
                noValidate
                role="dialog"
                aria-modal="true"
                aria-label={promo ? "Edit promo code" : "New promo code"}
                className="relative flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">{promo ? `Edit ${promo.code}` : "New Promo Code"}</h2>
                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-md border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-50">
                        <CloseIcon />
                    </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                    {/* Code */}
                    <Field label="Promo code" error={errors.code}>
                        <div className="flex gap-2">
                            <input
                                value={f.code}
                                onChange={(e) => set("code", e.target.value.toUpperCase())}
                                placeholder="e.g. WELCOME10"
                                className={`${INPUT} font-mono uppercase tracking-wide`}
                            />
                            <button type="button" onClick={() => set("code", randomCode())} className="shrink-0 rounded-lg border border-gray-300 px-3.5 text-xs font-semibold text-gray-800 hover:bg-gray-50">
                                Generate
                            </button>
                        </div>
                    </Field>

                    <Field label="Description" hint="internal note">
                        <input value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. 10% off a customer's first order" className={INPUT} />
                    </Field>

                    {/* Discount */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Discount type">
                            <div className="flex rounded-lg border border-gray-300 p-1">
                                {(["percentage", "fixed"] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => set("type", t)}
                                        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${f.type === t ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
                                    >
                                        {t === "percentage" ? "Percentage (%)" : "Fixed (₦)"}
                                    </button>
                                ))}
                            </div>
                        </Field>

                        <Field label={f.type === "percentage" ? "Discount (%)" : "Discount amount (₦)"} error={errors.value}>
                            <input inputMode="decimal" value={f.value} onChange={(e) => set("value", e.target.value)} placeholder={f.type === "percentage" ? "e.g. 10" : "e.g. 2000"} className={INPUT} />
                        </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Minimum order (₦)" hint="optional" error={errors.minOrder}>
                            <input inputMode="numeric" value={f.minOrder} onChange={(e) => set("minOrder", e.target.value)} placeholder="No minimum" className={INPUT} />
                        </Field>
                        {f.type === "percentage" && (
                            <Field label="Max discount (₦)" hint="optional cap" error={errors.maxDiscount}>
                                <input inputMode="numeric" value={f.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)} placeholder="No cap" className={INPUT} />
                            </Field>
                        )}
                    </div>

                    {/* Limits */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Total usage limit" hint="optional" error={errors.usageLimit}>
                            <input inputMode="numeric" value={f.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} placeholder="Unlimited" className={INPUT} />
                        </Field>
                        <Field label="Uses per customer" error={errors.perCustomerLimit}>
                            <input inputMode="numeric" value={f.perCustomerLimit} onChange={(e) => set("perCustomerLimit", e.target.value)} className={INPUT} />
                        </Field>
                    </div>

                    {/* Dates */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Start date" error={errors.startDate}>
                            <input type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="End date" hint="blank = never expires" error={errors.endDate}>
                            <input type="date" value={f.endDate} min={f.startDate} onChange={(e) => set("endDate", e.target.value)} className={INPUT} />
                        </Field>
                    </div>

                    {/* Scope */}
                    <Field label="Applies to" error={errors.categories}>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-800">
                            <label className="flex cursor-pointer items-center gap-2">
                                <input type="radio" name="scope" checked={f.scope === "all"} onChange={() => set("scope", "all")} className="accent-blue-600" />
                                All products
                            </label>
                            <label className="flex cursor-pointer items-center gap-2">
                                <input type="radio" name="scope" checked={f.scope === "categories"} onChange={() => set("scope", "categories")} className="accent-blue-600" />
                                Selected categories
                            </label>
                        </div>
                        {f.scope === "categories" && (
                            <div className="mt-2.5 flex flex-wrap gap-2">
                                {CATEGORIES.map((c) => {
                                    const on = f.categories.includes(c);
                                    return (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => toggleCategory(c)}
                                            aria-pressed={on}
                                            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${on ? "border-blue-600 bg-blue-100 text-blue-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                                        >
                                            {c}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </Field>

                    {/* Switches */}
                    <div className="space-y-3 rounded-xl border border-gray-200 p-3.5">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-900">First order only</p>
                                <p className="text-[11px] text-gray-500">Only customers who have never ordered can use it.</p>
                            </div>
                            <Switch checked={f.firstOrderOnly} onChange={(v) => set("firstOrderOnly", v)} label="First order only" />
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
                            <div>
                                <p className="text-xs font-semibold text-gray-900">Active</p>
                                <p className="text-[11px] text-gray-500">Turn off to pause the code without deleting it.</p>
                            </div>
                            <Switch checked={f.active} onChange={(v) => set("active", v)} label="Active" />
                        </div>
                    </div>

                    <p className="rounded-lg bg-blue-50 px-3.5 py-2.5 text-xs text-blue-800">{preview}</p>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4">
                    <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-800 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">
                        {promo ? "Save Changes" : "Create Promo Code"}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Small display helpers                                                      */
/* -------------------------------------------------------------------------- */

function DiscountCell({ p }: { p: PromoCode }) {
    return (
        <div>
            <p className="text-xs font-semibold text-gray-900">{p.type === "percentage" ? `${p.value}%` : naira(p.value)} off</p>
            <p className="text-[11px] text-gray-500">
                {p.type === "percentage" && p.maxDiscount ? `up to ${naira(p.maxDiscount)}` : p.type === "percentage" ? "no cap" : "flat amount"}
            </p>
        </div>
    );
}

function UsageCell({ p }: { p: PromoCode }) {
    const pct = p.usageLimit ? Math.min(100, (p.used / p.usageLimit) * 100) : 0;
    return (
        <div className="min-w-[110px]">
            <p className="text-xs text-gray-800">
                <span className="font-semibold">{p.used}</span>
                {p.usageLimit ? ` / ${p.usageLimit}` : " used"}
            </p>
            {p.usageLimit ? (
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div className={`h-full rounded-full ${pct >= 100 ? "bg-orange-500" : "bg-blue-600"}`} style={{ width: `${pct}%` }} />
                </div>
            ) : (
                <p className="text-[11px] text-gray-500">Unlimited</p>
            )}
        </div>
    );
}

const validity = (p: PromoCode) => (p.endDate ? `${fmtDate(p.startDate)} – ${fmtDate(p.endDate)}` : `From ${fmtDate(p.startDate)}`);
const scopeText = (p: PromoCode) => (p.appliesTo.length ? p.appliesTo.join(", ") : "All products");

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function PromoCodesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [promos, setPromos] = useState<PromoCode[]>(buildSeed);
    const [query, setQuery] = useState("");
    const [modal, setModal] = useState<{ promo: PromoCode | null } | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    // Active tab lives in the URL (?status=active)
    const statusParam = searchParams.get("status");
    const tab: TabKey = TABS.some((t) => t.key === statusParam) ? (statusParam as TabKey) : "all";
    const setTab = (t: TabKey) => router.replace(t === "all" ? pathname : `${pathname}?status=${t}`, { scroll: false });

    const withStatus = useMemo(() => promos.map((p) => ({ p, status: getStatus(p) })), [promos]);

    const counts = useMemo(() => {
        const c = {} as Record<TabKey, number>;
        TABS.forEach((t) => (c[t.key] = withStatus.filter((x) => matchesTab(x.status, t.key)).length));
        return c;
    }, [withStatus]);

    const totalRedemptions = promos.reduce((s, p) => s + p.used, 0);
    const soon = daysFromNow(7);
    const endingSoon = withStatus.filter((x) => x.status === "active" && x.p.endDate && x.p.endDate <= soon).length;

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        return withStatus.filter(
            (x) => matchesTab(x.status, tab) && (!q || x.p.code.toLowerCase().includes(q) || x.p.description.toLowerCase().includes(q))
        );
    }, [withStatus, tab, query]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    /* ---- actions (replace the TODOs with real API calls) ---- */
    const handleSave = (data: Omit<PromoCode, "id" | "used"> & { id?: string; used?: number }) => {
        if (data.id) {
            // TODO: await fetch(`/api/promo-codes/${data.id}`, { method: "PUT", body: JSON.stringify(data) });
            setPromos((prev) => prev.map((p) => (p.id === data.id ? ({ ...p, ...data } as PromoCode) : p)));
            showToast(`${data.code} updated.`);
        } else {
            // TODO: await fetch("/api/promo-codes", { method: "POST", body: JSON.stringify(data) });
            setPromos((prev) => [{ ...data, id: `p${Date.now()}`, used: 0 } as PromoCode, ...prev]);
            showToast(`${data.code} created.`);
        }
        setModal(null);
    };

    const togglePause = (p: PromoCode) => {
        // TODO: await fetch(`/api/promo-codes/${p.id}`, { method: "PATCH", body: JSON.stringify({ active: !p.active }) });
        setPromos((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)));
        showToast(p.active ? `${p.code} paused.` : `${p.code} resumed.`);
    };

    const remove = (p: PromoCode) => {
        if (!window.confirm(`Delete ${p.code}? Customers will no longer be able to use it.`)) return;
        // TODO: await fetch(`/api/promo-codes/${p.id}`, { method: "DELETE" });
        setPromos((prev) => prev.filter((x) => x.id !== p.id));
        showToast(`${p.code} deleted.`);
    };

    const copy = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            showToast(`${code} copied to clipboard.`);
        } catch {
            showToast("Couldn't copy — select the code manually.");
        }
    };

    const RowActions = ({ p, status }: { p: PromoCode; status: PromoStatus }) => {
        const ended = status === "expired" || status === "used_up";
        return (
            <div className="flex items-center gap-3.5 text-gray-600">
                <button aria-label={`Edit ${p.code}`} title="Edit" onClick={() => setModal({ promo: p })} className="hover:text-blue-600"><EditIcon /></button>
                {!ended && (
                    <button
                        aria-label={p.active ? `Pause ${p.code}` : `Resume ${p.code}`}
                        title={p.active ? "Pause" : "Resume"}
                        onClick={() => togglePause(p)}
                        className="hover:text-blue-600"
                    >
                        {p.active ? <PauseIcon /> : <PlayIcon />}
                    </button>
                )}
                <button aria-label={`Delete ${p.code}`} title="Delete" onClick={() => remove(p)} className="hover:text-red-600"><TrashIcon /></button>
            </div>
        );
    };

    const CodeChip = ({ code }: { code: string }) => (
        <button
            onClick={() => copy(code)}
            title="Copy code"
            className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-blue-400 bg-blue-50 px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-blue-700 hover:bg-blue-100"
        >
            {code}
            <CopyIcon />
        </button>
    );

    const tabLabel = TABS.find((t) => t.key === tab)?.label ?? "All Codes";

    return (
        <div className="p-6">
            {/* Toast */}
            {toast && (
                <div role="status" className="fixed right-6 top-6 z-[60] flex items-center gap-2.5 rounded-xl bg-green-600 px-4 py-3 text-xs font-medium text-white shadow-xl">
                    <CheckIcon />
                    {toast}
                </div>
            )}

            {/* Title + breadcrumb */}
            <h1 className="text-2xl font-semibold text-gray-900">Promo Codes</h1>
            <nav className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>Dashboard</span>
                <CaretRight />
                <span>Promo Codes</span>
                <CaretRight />
                <span className="font-medium text-blue-600">{tabLabel}</span>
            </nav>

            {/* Stat cards */}
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-sm">
                    <p className="text-sm font-semibold">Active Codes</p>
                    <p className="mt-4 text-3xl font-semibold">{counts.active}</p>
                    <p className="mt-1 text-[11px] text-white/80">Usable right now</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800">Total Redemptions</p>
                    <p className="mt-4 text-3xl font-semibold text-blue-600">{totalRedemptions.toLocaleString()}</p>
                    <p className="mt-1 text-[11px] text-gray-500">Across all codes</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800">Scheduled</p>
                    <p className="mt-4 text-3xl font-semibold text-blue-600">{counts.scheduled}</p>
                    <p className="mt-1 text-[11px] text-gray-500">Starting soon</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800">Ending Soon</p>
                    <p className="mt-4 text-3xl font-semibold text-blue-600">{endingSoon}</p>
                    <p className="mt-1 text-[11px] text-gray-500">Within 7 days</p>
                </div>
            </div>

            <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative w-full max-w-sm">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for code, description"
                            className="w-full rounded-full border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                            <SearchIcon />
                        </span>
                    </div>

                    <button
                        onClick={() => setModal({ promo: null })}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                        New Promo Code <PlusIcon />
                    </button>
                </div>

                {/* Tabs */}
                <div className="mt-4 flex overflow-x-auto rounded-xl border border-gray-200 p-1">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tab === t.key ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {t.label} ({counts[t.key]})
                        </button>
                    ))}
                </div>

                {/* Desktop table */}
                <div className="mt-4 hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
                    <table className="w-full min-w-[900px] border-collapse">
                        <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
                            <tr>
                                <th className="px-4 py-3.5">Code</th>
                                <th className="px-4 py-3.5">Discount</th>
                                <th className="px-4 py-3.5">Min. order</th>
                                <th className="px-4 py-3.5">Usage</th>
                                <th className="px-4 py-3.5">Validity</th>
                                <th className="px-4 py-3.5">Status</th>
                                <th className="px-4 py-3.5">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.length === 0 && (
                                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">No promo codes found.</td></tr>
                            )}
                            {rows.map(({ p, status }) => (
                                <tr key={p.id} className="hover:bg-gray-50/70">
                                    <td className="px-4 py-3">
                                        <CodeChip code={p.code} />
                                        <p className="mt-1 max-w-[220px] truncate text-[11px] text-gray-500" title={p.description}>
                                            {p.description || scopeText(p)}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3"><DiscountCell p={p} /></td>
                                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-700">{p.minOrder ? naira(p.minOrder) : "—"}</td>
                                    <td className="px-4 py-3"><UsageCell p={p} /></td>
                                    <td className="px-4 py-3 text-xs leading-snug text-gray-700">
                                        {validity(p)}
                                        <p className="text-[11px] text-gray-500">{scopeText(p)}{p.firstOrderOnly ? " · First order" : ""}</p>
                                    </td>
                                    <td className="px-4 py-3"><Badge status={status} /></td>
                                    <td className="px-4 py-3"><RowActions p={p} status={status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <ul className="mt-4 space-y-3 md:hidden">
                    {rows.length === 0 && <li className="py-10 text-center text-sm text-gray-500">No promo codes found.</li>}
                    {rows.map(({ p, status }) => (
                        <li key={p.id} className="rounded-xl border border-gray-200 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <CodeChip code={p.code} />
                                <Badge status={status} />
                            </div>
                            {p.description && <p className="mt-2 text-xs text-gray-600">{p.description}</p>}

                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <DiscountCell p={p} />
                                <UsageCell p={p} />
                            </div>
                            <p className="mt-3 text-[11px] text-gray-500">
                                {validity(p)} · {scopeText(p)}
                                {p.minOrder ? ` · Min ${naira(p.minOrder)}` : ""}
                            </p>

                            <div className="mt-3 border-t border-gray-100 pt-3">
                                <RowActions p={p} status={status} />
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* key resets the form for each code */}
            {modal && (
                <PromoModal
                    key={modal.promo?.id ?? "new"}
                    promo={modal.promo}
                    existingCodes={promos.map((p) => ({ id: p.id, code: p.code }))}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}