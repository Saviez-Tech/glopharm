"use client";

import { Suspense } from "react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/* -------------------------------------------------------------------------- */
/*  Types — same shape as the customer-side TestItem, plus patient info and    */
/*  an optional fileUrl for previewing the uploaded report.                    */
/* -------------------------------------------------------------------------- */

type LabStatus = "reviewing" | "ready" | "completed";

interface PrescribedDrug {
    name: string;
    dosage: string;
    quantity: number;
    price: number;
    image: string;
}

interface LabSubmission {
    id: string;
    title: string;
    date: string;
    fileName: string;
    /** URL of the uploaded report (image or PDF). Without it a placeholder is shown. */
    fileUrl?: string;
    status: LabStatus;
    patient: { name: string; email: string; phone: string; age?: number; gender?: string };
    patientNotes?: string;
    doctor?: { name: string; role: string; notes: string };
    drugs?: PrescribedDrug[];
    totalCost?: number;
}

/* ------------------------------ Sample data ------------------------------ */

const DOCTORS = [
    { name: "Dr. Emmanuel Adeyemi", role: "Lead Clinical Pharmacologist" },
    { name: "Dr. Chioma Nwosu", role: "Consultant Physician" },
];

const IMG_A = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80";
const IMG_B = "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=200&auto=format&fit=crop&q=80";
const IMG_C = "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=200&auto=format&fit=crop&q=80";
const IMG_D = "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=200&auto=format&fit=crop&q=80";

/** Medicines the admin can add to a prescription. Replace with your product API. */
const CATALOG: { name: string; price: number; image: string; dosage: string }[] = [
    { name: "Artemether / Lumefantrine 80/480mg (ACT)", price: 4800, image: IMG_A, dosage: "1 tablet twice daily for 3 days with a meal" },
    { name: "Vitamin C 1000mg Effervescent (30 tabs)", price: 4500, image: IMG_A, dosage: "1 tablet dissolved in water daily" },
    { name: "Paracetamol Extra Relief (20 tabs)", price: 1500, image: IMG_B, dosage: "2 tablets as needed for fever/headache" },
    { name: "Multivitamin Daily Formula (30 caps)", price: 8500, image: IMG_B, dosage: "1 capsule daily after breakfast" },
    { name: "Cod Liver Oil Omega-3 (90 caps)", price: 9800, image: IMG_B, dosage: "1 capsule twice daily with meals" },
    { name: "Zinc & Vitamin D3 Combo (60 tabs)", price: 6200, image: IMG_C, dosage: "1 tablet daily with food" },
    { name: "Probiotics Daily (30 capsules)", price: 11500, image: IMG_C, dosage: "1 capsule daily" },
    { name: "Antiseptic Disinfectant Liquid (500ml)", price: 2800, image: IMG_D, dosage: "Apply as directed to the affected area" },
];

const SEED: LabSubmission[] = [
    {
        id: "LAB-044",
        title: "Urinalysis & Kidney Function",
        date: "Today, 11:05 AM",
        fileName: "urinalysis_kft.pdf",
        status: "reviewing",
        patient: { name: "Ngozi Eze", email: "ngozi.eze@example.com", phone: "+234 803 555 0192", age: 41, gender: "Female" },
        patientNotes: "Burning sensation when urinating for 3 days, lower back pain.",
    },
    {
        id: "LAB-043",
        title: "Full Blood Count (FBC)",
        date: "Today, 10:40 AM",
        fileName: "fbc_report.png",
        status: "reviewing",
        patient: { name: "Tunde Bakare", email: "tunde.b@example.com", phone: "+234 802 555 0147", age: 29, gender: "Male" },
        patientNotes: "Feeling tired often, occasional dizziness.",
    },
    {
        id: "LAB-041",
        title: "Malaria & Typhoid Panel",
        date: "Today, 09:30 AM",
        fileName: "malaria_lab_scan.pdf",
        status: "ready",
        patient: { name: "Adaeze Okafor", email: "adaeze.o@example.com", phone: "+234 806 555 0118", age: 34, gender: "Female" },
        patientNotes: "Fever and headache for 2 days, body aches.",
        doctor: {
            name: "Dr. Emmanuel Adeyemi",
            role: "Lead Clinical Pharmacologist",
            notes:
                "Moderate Plasmodium falciparum (+2) detected. Artemisinin-based therapy (ACT), immune support, and analgesic prescribed for 3 days.",
        },
        drugs: [
            { name: "Artemether / Lumefantrine 80/480mg (ACT)", dosage: "1 tablet twice daily for 3 days with a meal", quantity: 1, price: 4800, image: IMG_A },
            { name: "Vitamin C 1000mg Effervescent (30 tabs)", dosage: "1 tablet dissolved in water daily", quantity: 1, price: 4500, image: IMG_A },
            { name: "Paracetamol Extra Relief (20 tabs)", dosage: "2 tablets as needed for fever/headache", quantity: 1, price: 1500, image: IMG_B },
        ],
        totalCost: 10800,
    },
    {
        id: "LAB-039",
        title: "Fasting Blood Glucose & Lipid Panel",
        date: "Today, 10:15 AM",
        fileName: "lipid_glucose_nov.pdf",
        status: "reviewing",
        patient: { name: "Ibrahim Musa", email: "ibrahim.m@example.com", phone: "+234 809 555 0163", age: 52, gender: "Male" },
        patientNotes: "Routine check. Family history of diabetes.",
    },
    {
        id: "LAB-022",
        title: "Comprehensive Wellness Blood Panel",
        date: "Oct 18, 2026",
        fileName: "wellness_scan.pdf",
        status: "completed",
        patient: { name: "Folake Adebayo", email: "folake.a@example.com", phone: "+234 805 555 0175", age: 37, gender: "Female" },
        doctor: {
            name: "Dr. Emmanuel Adeyemi",
            role: "Lead Clinical Pharmacologist",
            notes: "Prescription completed and delivered to the patient's Victoria Island address.",
        },
        drugs: [{ name: "Multivitamin Daily Formula (30 caps)", dosage: "1 capsule daily after breakfast", quantity: 1, price: 8500, image: IMG_B }],
        totalCost: 8500,
    },
];

const TABS = [
    { key: "all", label: "All Tests" },
    { key: "reviewing", label: "Awaiting Review" },
    { key: "ready", label: "Prescribed" },
    { key: "completed", label: "Completed" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const STATUS_LABEL: Record<LabStatus, string> = {
    reviewing: "Awaiting Review",
    ready: "Prescribed",
    completed: "Completed",
};
const STATUS_STYLE: Record<LabStatus, string> = {
    reviewing: "bg-yellow-100 text-yellow-700",
    ready: "bg-blue-100 text-blue-700",
    completed: "bg-green-200 text-green-800",
};

const naira = (n: number) => "₦" + n.toLocaleString("en-NG");
const initials = (name: string) =>
    name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

/* --------------------------------- Icons ---------------------------------- */

const Svg = ({ children, className = "h-4 w-4" }: { children: ReactNode; className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        {children}
    </svg>
);
const SearchIcon = () => (<Svg><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>);
const CloseIcon = () => (<Svg><path d="M6 6l12 12M18 6 6 18" /></Svg>);
const FileIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <Svg className={className}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></Svg>
);
const TrashIcon = () => (<Svg><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" /></Svg>);
const CheckIcon = () => (<Svg><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>);
const CaretRight = () => (<svg viewBox="0 0 8 10" className="h-2.5 w-2 fill-current" aria-hidden><path d="M0 0l8 5-8 5z" /></svg>);

const Badge = ({ status }: { status: LabStatus }) => (
    <span className={`inline-block whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLE[status]}`}>
        {STATUS_LABEL[status]}
    </span>
);

const INPUT =
    "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500";

/* -------------------------------------------------------------------------- */
/*  Review drawer — read the report, then prescribe                            */
/* -------------------------------------------------------------------------- */

function ReportPreview({ item }: { item: LabSubmission }) {
    const src = item.fileUrl;
    const isPdf = /\.pdf($|\?)/i.test(src ?? item.fileName);
    const isImage = /\.(png|jpe?g|webp|gif|svg)($|\?)/i.test(src ?? item.fileName);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            {src && isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={item.fileName} className="max-h-96 w-full bg-white object-contain" />
            ) : src && isPdf ? (
                <iframe src={src} title={item.fileName} className="h-96 w-full bg-white" />
            ) : (
                <div className="flex h-44 flex-col items-center justify-center gap-2 px-4 text-center text-xs text-gray-500">
                    <FileIcon className="h-9 w-9 text-gray-400" />
                    <p className="font-semibold text-gray-700">{item.fileName}</p>
                    <p>
                        Preview unavailable — set <code className="rounded bg-gray-200 px-1">fileUrl</code> on the submission to show the report here.
                    </p>
                </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-2.5 text-xs">
                <span className="flex min-w-0 items-center gap-2 text-gray-600">
                    <FileIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.fileName}</span>
                </span>
                {src && (
                    <span className="flex shrink-0 items-center gap-3 font-semibold text-blue-600">
                        <a href={src} target="_blank" rel="noreferrer" className="hover:underline">Open</a>
                        <a href={src} download={item.fileName} className="hover:underline">Download</a>
                    </span>
                )}
            </div>
        </div>
    );
}

function ReviewDrawer({
    item,
    onClose,
    onSave,
    onComplete,
}: {
    item: LabSubmission;
    onClose: () => void;
    onSave: (updated: LabSubmission) => void;
    onComplete: (updated: LabSubmission) => void;
}) {
    const readOnly = item.status === "completed";

    const [doctorName, setDoctorName] = useState(item.doctor?.name ?? DOCTORS[0].name);
    const [notes, setNotes] = useState(item.status === "reviewing" ? "" : item.doctor?.notes ?? "");
    const [drugs, setDrugs] = useState<PrescribedDrug[]>(item.drugs ?? []);
    const [medQuery, setMedQuery] = useState("");
    const [pickerOpen, setPickerOpen] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const total = drugs.reduce((s, d) => s + d.price * d.quantity, 0);

    const results = CATALOG.filter(
        (c) => !drugs.some((d) => d.name === c.name) && c.name.toLowerCase().includes(medQuery.trim().toLowerCase())
    ).slice(0, 6);

    const addDrug = (c: (typeof CATALOG)[number]) => {
        setDrugs((prev) => [...prev, { name: c.name, dosage: c.dosage, quantity: 1, price: c.price, image: c.image }]);
        setMedQuery("");
        setError("");
    };
    const patchDrug = (i: number, patch: Partial<PrescribedDrug>) =>
        setDrugs((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
    const removeDrug = (i: number) => setDrugs((prev) => prev.filter((_, idx) => idx !== i));

    const build = (): LabSubmission | null => {
        if (!notes.trim()) return setError("Write the doctor's notes for the patient."), null;
        if (drugs.length === 0) return setError("Add at least one medicine to the prescription."), null;
        if (drugs.some((d) => !d.dosage.trim())) return setError("Every medicine needs dosage instructions."), null;

        const doc = DOCTORS.find((d) => d.name === doctorName) ?? DOCTORS[0];
        return {
            ...item,
            status: "ready",
            doctor: { name: doc.name, role: doc.role, notes: notes.trim() },
            drugs,
            totalCost: total,
        };
    };

    const send = () => {
        const updated = build();
        if (updated) onSave(updated);
    };

    const dispense = () => {
        const updated = build();
        if (!updated) return;
        if (window.confirm("Mark this prescription as paid, dispensed and delivered?")) {
            onComplete({ ...updated, status: "completed" });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <aside role="dialog" aria-modal="true" aria-label={`Lab test ${item.id}`} className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
                    <div className="min-w-0">
                        <p className="text-[11px] font-medium text-gray-500">
                            #{item.id} · {item.date}
                        </p>
                        <h2 className="mt-0.5 truncate text-lg font-semibold text-gray-900">{item.title}</h2>
                        <div className="mt-1.5"><Badge status={item.status} /></div>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="rounded-md border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-50">
                        <CloseIcon />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 space-y-6 overflow-y-auto p-5">
                    {/* Patient */}
                    <section>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Patient</h3>
                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                {initials(item.patient.name)}
                            </span>
                            <div className="min-w-0 text-xs">
                                <p className="text-sm font-semibold text-gray-900">{item.patient.name}</p>
                                <p className="truncate text-gray-500">
                                    {[item.patient.gender, item.patient.age ? `${item.patient.age} yrs` : null].filter(Boolean).join(" · ")}
                                </p>
                                <p className="truncate text-gray-500">
                                    {item.patient.email} · {item.patient.phone}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
                            <p className="mb-1 font-semibold text-gray-800">Symptoms / notes from patient</p>
                            <p className="italic">{item.patientNotes?.trim() || "No notes provided."}</p>
                        </div>
                    </section>

                    {/* Report */}
                    <section>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Lab report</h3>
                        <ReportPreview item={item} />
                    </section>

                    {/* Prescription */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {readOnly ? "Prescription (dispensed)" : "Prescription"}
                        </h3>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-gray-900">Prescribing doctor</label>
                            <select value={doctorName} onChange={(e) => setDoctorName(e.target.value)} disabled={readOnly} className={INPUT}>
                                {DOCTORS.map((d) => (
                                    <option key={d.name} value={d.name}>
                                        {d.name} — {d.role}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-gray-900">Doctor&apos;s notes (shown to the patient)</label>
                            <textarea
                                rows={3}
                                value={notes}
                                disabled={readOnly}
                                onChange={(e) => {
                                    setNotes(e.target.value);
                                    setError("");
                                }}
                                placeholder="e.g. Moderate Plasmodium falciparum (+2) detected. ACT, immune support and analgesic prescribed for 3 days."
                                className={`${INPUT} resize-none`}
                            />
                        </div>

                        {/* Medicines */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-gray-900">Medicines</label>

                            {!readOnly && (
                                <div className="relative">
                                    <input
                                        value={medQuery}
                                        onChange={(e) => setMedQuery(e.target.value)}
                                        onFocus={() => setPickerOpen(true)}
                                        onBlur={() => setPickerOpen(false)}
                                        placeholder="Search medicine to add…"
                                        className={`${INPUT} pr-10`}
                                    />
                                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                        <SearchIcon />
                                    </span>

                                    {pickerOpen && (
                                        <ul
                                            onMouseDown={(e) => e.preventDefault()}
                                            className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
                                        >
                                            {results.length === 0 && <li className="px-3 py-3 text-xs text-gray-500">No matching medicines.</li>}
                                            {results.map((c) => (
                                                <li key={c.name}>
                                                    <button type="button" onClick={() => addDrug(c)} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-gray-50">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={c.image} alt="" className="h-8 w-8 shrink-0 rounded-md border border-gray-200 object-cover" />
                                                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-800">{c.name}</span>
                                                        <span className="shrink-0 text-xs font-semibold text-gray-700">{naira(c.price)}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <ul className="mt-3 space-y-2.5">
                                {drugs.length === 0 && (
                                    <li className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-xs text-gray-500">
                                        No medicines added yet.
                                    </li>
                                )}
                                {drugs.map((d, i) => (
                                    <li key={d.name} className="rounded-xl border border-gray-200 p-3">
                                        <div className="flex items-start gap-3">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={d.image} alt="" className="h-10 w-10 shrink-0 rounded-md border border-gray-200 object-cover" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-semibold text-gray-900">{d.name}</p>
                                                <p className="text-[11px] text-gray-500">{naira(d.price)} each</p>
                                            </div>
                                            <p className="shrink-0 text-xs font-semibold text-gray-900">{naira(d.price * d.quantity)}</p>
                                            {!readOnly && (
                                                <button type="button" onClick={() => removeDrug(i)} aria-label={`Remove ${d.name}`} className="shrink-0 text-gray-500 hover:text-red-600">
                                                    <TrashIcon />
                                                </button>
                                            )}
                                        </div>

                                        <div className="mt-2.5 flex items-center gap-2">
                                            <input
                                                value={d.dosage}
                                                disabled={readOnly}
                                                onChange={(e) => {
                                                    patchDrug(i, { dosage: e.target.value });
                                                    setError("");
                                                }}
                                                placeholder="Dosage instructions"
                                                className={INPUT}
                                            />
                                            <div className="flex shrink-0 items-center rounded-lg border border-gray-300">
                                                <button type="button" disabled={readOnly || d.quantity <= 1} onClick={() => patchDrug(i, { quantity: d.quantity - 1 })} className="px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40" aria-label="Decrease quantity">−</button>
                                                <span className="w-6 text-center text-xs font-semibold">{d.quantity}</span>
                                                <button type="button" disabled={readOnly} onClick={() => patchDrug(i, { quantity: d.quantity + 1 })} className="px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40" aria-label="Increase quantity">+</button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-white px-5 py-4">
                    {error && <p role="alert" className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] text-gray-500">Prescription total</p>
                            <p className="text-xl font-semibold text-gray-900">{naira(total)}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-800 hover:bg-gray-50">
                                {readOnly ? "Close" : "Cancel"}
                            </button>

                            {item.status === "ready" && (
                                <button onClick={dispense} className="inline-flex items-center gap-1.5 rounded-lg border border-green-600 px-4 py-2.5 text-xs font-semibold text-green-700 hover:bg-green-50">
                                    <CheckIcon /> Mark as Dispensed
                                </button>
                            )}

                            {!readOnly && (
                                <button onClick={send} className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">
                                    {item.status === "ready" ? "Update Prescription" : "Send Prescription"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function LabTestsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}>
            <LabTestsPageInner />
        </Suspense>
    );
}

function LabTestsPageInner() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [items, setItems] = useState<LabSubmission[]>(SEED);
    const [query, setQuery] = useState("");
    const [openId, setOpenId] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    // Active tab lives in the URL (?status=reviewing) so the sidebar can link to it
    const statusParam = searchParams.get("status");
    const tab: TabKey = TABS.some((t) => t.key === statusParam) ? (statusParam as TabKey) : "all";
    const setTab = (t: TabKey) =>
        router.replace(t === "all" ? pathname : `${pathname}?status=${t}`, { scroll: false });

    const counts = {
        all: items.length,
        reviewing: items.filter((i) => i.status === "reviewing").length,
        ready: items.filter((i) => i.status === "ready").length,
        completed: items.filter((i) => i.status === "completed").length,
    };
    const pendingValue = items.filter((i) => i.status === "ready").reduce((s, i) => s + (i.totalCost ?? 0), 0);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return items.filter(
            (i) =>
                (tab === "all" || i.status === tab) &&
                (!q || i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q) || i.patient.name.toLowerCase().includes(q))
        );
    }, [items, query, tab]);

    const openItem = items.find((i) => i.id === openId) ?? null;

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };

    const replace = (updated: LabSubmission) => setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));

    const handleSave = async (updated: LabSubmission) => {
        // TODO: await fetch(`/api/lab-tests/${updated.id}/prescription`, { method: "PUT", body: JSON.stringify(updated) });
        const wasReady = items.find((i) => i.id === updated.id)?.status === "ready";
        replace(updated);
        setOpenId(null);
        showToast(wasReady ? `Prescription for #${updated.id} updated.` : `Prescription sent — ${updated.patient.name} can now check out.`);
    };

    const handleComplete = async (updated: LabSubmission) => {
        // TODO: await fetch(`/api/lab-tests/${updated.id}/complete`, { method: "POST" });
        replace(updated);
        setOpenId(null);
        showToast(`#${updated.id} marked as dispensed.`);
    };

    const tabLabel = TABS.find((t) => t.key === tab)?.label ?? "All Tests";

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
            <h1 className="text-2xl font-semibold text-gray-900">Lab Tests</h1>
            <nav className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>Dashboard</span>
                <CaretRight />
                <span>Lab Tests</span>
                <CaretRight />
                <span className="font-medium text-blue-600">{tabLabel}</span>
            </nav>

            {/* Stat cards */}
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-sm">
                    <p className="text-sm font-semibold">Awaiting Review</p>
                    <p className="mt-4 text-3xl font-semibold">{counts.reviewing}</p>
                    <p className="mt-1 text-[11px] text-white/80">Need a prescription</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800">Awaiting Payment</p>
                    <p className="mt-4 text-3xl font-semibold text-blue-600">{counts.ready}</p>
                    <p className="mt-1 text-[11px] text-gray-500">{naira(pendingValue)} pending</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800">Dispensed</p>
                    <p className="mt-4 text-3xl font-semibold text-blue-600">{counts.completed}</p>
                    <p className="mt-1 text-[11px] text-gray-500">Completed prescriptions</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800">Total Reports</p>
                    <p className="mt-4 text-3xl font-semibold text-blue-600">{counts.all}</p>
                    <p className="mt-1 text-[11px] text-gray-500">Uploaded by patients</p>
                </div>
            </div>

            <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                {/* Search */}
                <div className="relative w-full max-w-sm">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for id, patient, test"
                        className="w-full rounded-full border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                        <SearchIcon />
                    </span>
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
                    <table className="w-full min-w-[820px] border-collapse">
                        <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
                            <tr>
                                <th className="px-4 py-3.5">Test</th>
                                <th className="px-4 py-3.5">Patient</th>
                                <th className="px-4 py-3.5">Uploaded</th>
                                <th className="px-4 py-3.5">Report</th>
                                <th className="px-4 py-3.5">Status</th>
                                <th className="px-4 py-3.5">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">No lab tests found.</td></tr>
                            )}
                            {filtered.map((i) => (
                                <tr key={i.id} className="hover:bg-gray-50/70">
                                    <td className="px-4 py-3">
                                        <button onClick={() => setOpenId(i.id)} className="text-[11px] font-medium text-blue-600 hover:underline">#{i.id}</button>
                                        <p className="max-w-[240px] truncate text-xs font-medium text-gray-800">{i.title}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-semibold text-blue-700">{initials(i.patient.name)}</span>
                                            <span className="text-xs text-gray-800">{i.patient.name}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-700">{i.date}</td>
                                    <td className="px-4 py-3">
                                        <span className="flex max-w-[170px] items-center gap-1.5 text-xs text-gray-600">
                                            <FileIcon className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{i.fileName}</span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3"><Badge status={i.status} /></td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setOpenId(i.id)}
                                            className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold ${i.status === "reviewing"
                                                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                                                    : "border border-gray-300 text-gray-800 hover:bg-gray-50"
                                                }`}
                                        >
                                            {i.status === "reviewing" ? "Review & Prescribe" : i.status === "ready" ? "View / Edit" : "View"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <ul className="mt-4 space-y-3 md:hidden">
                    {filtered.length === 0 && <li className="py-10 text-center text-sm text-gray-500">No lab tests found.</li>}
                    {filtered.map((i) => (
                        <li key={i.id} className="rounded-xl border border-gray-200 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-medium text-blue-600">#{i.id}</p>
                                    <p className="truncate text-sm font-semibold text-gray-900">{i.title}</p>
                                    <p className="mt-0.5 text-xs text-gray-500">{i.patient.name} · {i.date}</p>
                                </div>
                                <Badge status={i.status} />
                            </div>
                            <button
                                onClick={() => setOpenId(i.id)}
                                className={`mt-3 w-full rounded-lg px-3.5 py-2.5 text-xs font-semibold ${i.status === "reviewing" ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-800"
                                    }`}
                            >
                                {i.status === "reviewing" ? "Review & Prescribe" : i.status === "ready" ? "View / Edit" : "View"}
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            {/* key resets the form whenever a different test is opened */}
            {openItem && (
                <ReviewDrawer
                    key={openItem.id}
                    item={openItem}
                    onClose={() => setOpenId(null)}
                    onSave={handleSave}
                    onComplete={handleComplete}
                />
            )}
        </div>
    );
}