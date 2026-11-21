"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAdmin } from "../layout";

/* -------------------------------------------------------------------------- */
/*  Types matching backend API responses                                      */
/* -------------------------------------------------------------------------- */

interface LabTestStats {
  awaiting_review: number;
  awaiting_payment: {
    count: number;
    pending_amount: string;
  };
  dispensed: number;
  total_reports: number;
}

interface LabTestFile {
  id?: number;
  file_url: string;
  original_name: string;
  uploaded_at?: string;
}

interface PrescriptionItem {
  id?: number;
  product_id: number;
  name: string;
  dosage_instructions: string;
  quantity: number;
  unit_price: string | number;
  line_total: string | number;
  image?: string;
}

interface PrescriptionData {
  doctor_name: string;
  doctor_note: string;
  issued_at?: string;
  items: PrescriptionItem[];
  total?: number | string;
  order?: {
    order_number: string;
    status: string;
    payment_status: string;
  } | null;
}

interface LabTestItem {
  reference: string;
  test_name: string;
  patient: {
    id: number;
    name: string;
    initials: string;
    email: string;
    phone?: string;
  };
  created_at: string;
  file?: LabTestFile | null;
  status: string;
  status_label: string;
  action: string;
  action_label: string;
}

interface LabTestDetail extends LabTestItem {
  symptoms?: string;
  reviewed_at?: string | null;
  files?: LabTestFile[];
  prescription?: PrescriptionData | null;
}

interface CatalogProduct {
  id: number;
  name: string;
  price: string | number;
  image: string;
  category?: string;
}

/* -------------------------------- Constants ------------------------------- */

const DOCTORS = [
  { name: "Dr. Emmanuel Adeyemi", role: "Lead Clinical Pharmacologist" },
  { name: "Dr. Chioma Nwosu", role: "Consultant Physician" },
  { name: "Dr. menduzer", role: "Resident Physician" },
];

const TABS = [
  { key: "all", label: "All Tests" },
  { key: "under_review", label: "Awaiting Review" },
  { key: "awaiting_payment", label: "Awaiting Payment" },
  { key: "completed", label: "Completed" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const naira = (val: string | number | undefined) => {
  const n = typeof val === "number" ? val : parseFloat(String(val || "0"));
  return (
    "₦" +
    new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(isNaN(n) ? 0 : n)
  );
};

const formatDate = (isoStr: string) => {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
};

const initials = (name: string, fallback = "ME") => {
  if (!name) return fallback;
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/* --------------------------------- Icons ---------------------------------- */

const Svg = ({ children, className = "h-4 w-4" }: { children: ReactNode; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    {children}
  </svg>
);

const SearchIcon = () => (
  <Svg>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

const CloseIcon = () => (
  <Svg>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

const FileIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <Svg className={className}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Svg>
);

const TrashIcon = () => (
  <Svg>
    <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" />
  </Svg>
);

const CheckIcon = () => (
  <Svg>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

const CaretRight = () => (
  <svg viewBox="0 0 8 10" className="h-2.5 w-2 fill-current" aria-hidden>
    <path d="M0 0l8 5-8 5z" />
  </svg>
);

const Badge = ({ status, label }: { status: string; label?: string }) => {
  const norm = status?.toLowerCase() || "";
  let style = "bg-gray-100 text-gray-700";
  let display = label || status;

  if (norm.includes("review")) {
    style = "bg-yellow-100 text-yellow-800 border border-yellow-200";
    display = display || "Awaiting Review";
  } else if (norm.includes("payment") || norm === "ready") {
    style = "bg-blue-100 text-blue-800 border border-blue-200";
    display = display || "Awaiting Payment";
  } else if (norm.includes("complete") || norm.includes("dispens") || norm === "delivered") {
    style = "bg-green-100 text-green-800 border border-green-200";
    display = display || "Completed";
  }

  return (
    <span className={`inline-block whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-semibold ${style}`}>
      {display}
    </span>
  );
};

const INPUT =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500";

/* -------------------------------------------------------------------------- */
/*  Report Preview Component                                                  */
/* -------------------------------------------------------------------------- */

function ReportPreview({ file }: { file?: LabTestFile | null }) {
  if (!file || !file.file_url) {
    return (
      <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
        <FileIcon className="h-8 w-8 text-gray-400 mb-1" />
        <p className="font-medium text-gray-700">No document attached</p>
      </div>
    );
  }

  const src = file.file_url;
  const fileName = file.original_name || "lab_report.pdf";
  const isPdf = /\.pdf($|\?)/i.test(src) || /\.pdf$/i.test(fileName);
  const isImage = /\.(png|jpe?g|webp|gif|svg)($|\?)/i.test(src) || /\.(png|jpe?g|webp|gif|svg)$/i.test(fileName);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={fileName} className="max-h-96 w-full bg-white object-contain" />
      ) : isPdf ? (
        <iframe src={src} title={fileName} className="h-96 w-full bg-white" />
      ) : (
        <div className="flex h-40 flex-col items-center justify-center gap-2 px-4 text-center text-xs text-gray-500">
          <FileIcon className="h-9 w-9 text-gray-400" />
          <p className="font-semibold text-gray-700">{fileName}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-2.5 text-xs">
        <span className="flex min-w-0 items-center gap-2 text-gray-600">
          <FileIcon className="h-4 w-4 shrink-0 text-blue-600" />
          <span className="truncate font-medium">{fileName}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3 font-semibold text-blue-600">
          <a href={src} target="_blank" rel="noreferrer" className="hover:underline">
            View Full
          </a>
          <a href={src} download={fileName} target="_blank" rel="noreferrer" className="hover:underline">
            Download
          </a>
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Review Drawer (View detail, symptoms, and Prescribe)                     */
/* -------------------------------------------------------------------------- */

interface PrescribeFormItem {
  product_id: number;
  name: string;
  dosage_instructions: string;
  quantity: number;
  unit_price: number;
  image?: string;
}

function ReviewDrawer({
  reference,
  onClose,
  onPrescriptionSuccess,
}: {
  reference: string;
  onClose: () => void;
  onPrescriptionSuccess: () => void;
}) {
  const [detail, setDetail] = useState<LabTestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prescribe form states
  const [doctorName, setDoctorName] = useState(DOCTORS[0].name);
  const [customDoctor, setCustomDoctor] = useState("");
  const [notes, setNotes] = useState("");
  const [prescribedItems, setPrescribedItems] = useState<PrescribeFormItem[]>([]);

  // Fetch full details of the lab test
  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/gload/lab-tests/${reference}/`);
      if (res.status === 401) {
        window.location.href = "/glopharm/login?session_expired=1";
        return;
      }
      const json = await res.json();
      if (json?.data) {
        const d: LabTestDetail = json.data;
        setDetail(d);

        // Prepopulate if prescription already exists
        if (d.prescription) {
          setDoctorName(d.prescription.doctor_name || DOCTORS[0].name);
          setNotes(d.prescription.doctor_note || "");
          if (Array.isArray(d.prescription.items)) {
            setPrescribedItems(
              d.prescription.items.map((it) => ({
                product_id: it.product_id,
                name: it.name,
                dosage_instructions: it.dosage_instructions || "",
                quantity: it.quantity || 1,
                unit_price: Number(it.unit_price) || 0,
                image: it.image,
              }))
            );
          }
        }
      } else {
        setError(json?.message || "Failed to load lab test details");
      }
    } catch {
      setError("Failed to connect to lab test service");
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Drug Catalog & Search (loaded dynamically from store products)
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [medQuery, setMedQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchingMed, setSearchingMed] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch product catalog for prescribing medicines
  const loadDrugs = useCallback(async (query = "") => {
    setSearchingMed(true);
    try {
      const q = query.trim();
      let found: CatalogProduct[] = [];

      // 1. Try ecommerce products endpoint with ?q=
      try {
        const url = q
          ? `/api/ecommerce/products?q=${encodeURIComponent(q)}`
          : "/api/ecommerce/products?page=1&page_size=100";
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const results = json?.data?.results || (Array.isArray(json?.data) ? json.data : []);
          if (Array.isArray(results) && results.length > 0) {
            found = results.map((p: { id: number; name: string; price?: string | number; original_price?: string | number; image?: string; category?: string }) => ({
              id: p.id,
              name: p.name,
              price: Number(p.price) || Number(p.original_price) || 0,
              image: p.image || "",
              category: p.category || "",
            }));
          }
        }
      } catch {
        // ignore and fallback
      }

      // 2. Try admin manage products endpoint if still empty
      if (found.length === 0) {
        try {
          const url = q
            ? `/api/gload/products?search=${encodeURIComponent(q)}`
            : "/api/gload/products?page=1";
          const res = await fetch(url);
          if (res.ok) {
            const json = await res.json();
            const results = json?.data?.results || (Array.isArray(json?.data) ? json.data : []);
            if (Array.isArray(results) && results.length > 0) {
              found = results.map((p: { id: number; name: string; price?: string | number; image?: string; category?: string }) => ({
                id: p.id,
                name: p.name,
                price: Number(p.price) || 0,
                image: p.image || "",
                category: p.category || "",
              }));
            }
          }
        } catch {
          // ignore and fallback
        }
      }

      setCatalog((prev) => {
        const map = new Map<number, CatalogProduct>();
        found.forEach((item) => map.set(item.id, item));
        prev.forEach((item) => {
          if (!map.has(item.id)) map.set(item.id, item);
        });
        return Array.from(map.values());
      });
    } finally {
      setSearchingMed(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDrugs();
  }, [loadDrugs]);

  // Debounced search when medQuery changes
  useEffect(() => {
    if (!medQuery.trim()) return;
    const timer = setTimeout(() => {
      loadDrugs(medQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [medQuery, loadDrugs]);

  const totalCalculated = prescribedItems.reduce(
    (sum, it) => sum + (Number(it.unit_price) || 0) * (it.quantity || 1),
    0
  );

  const isCompleted =
    detail?.status?.toLowerCase().includes("complete") ||
    detail?.status?.toLowerCase().includes("dispens");

  const filteredMedicines = useMemo(() => {
    const q = medQuery.trim().toLowerCase();
    const unprescribed = catalog.filter(
      (c) => !prescribedItems.some((d) => d.product_id === c.id)
    );
    if (!q) return unprescribed.slice(0, 20);
    return unprescribed
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.category && c.category.toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [catalog, medQuery, prescribedItems]);

  const addDrugFromCatalog = (c: CatalogProduct) => {
    setPrescribedItems((prev) => [
      ...prev,
      {
        product_id: c.id,
        name: c.name,
        dosage_instructions: "1 tablet twice daily after meals",
        quantity: 1,
        unit_price: Number(c.price) || 0,
        image: c.image,
      },
    ]);
    setMedQuery("");
    setPickerOpen(false);
    setError("");
  };

  const addCustomDrug = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const customId = Math.floor(100000 + Math.random() * 900000);
    setPrescribedItems((prev) => [
      ...prev,
      {
        product_id: customId,
        name: trimmed,
        dosage_instructions: "1 tablet twice daily after meals",
        quantity: 1,
        unit_price: 2000,
      },
    ]);
    setMedQuery("");
    setPickerOpen(false);
    setError("");
  };

  const patchDrug = (index: number, patch: Partial<PrescribeFormItem>) => {
    setPrescribedItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  };

  const removeDrug = (index: number) => {
    setPrescribedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handlePrescribeSubmit = async () => {
    setError("");
    const doc = doctorName === "custom" ? customDoctor.trim() : doctorName;
    if (!doc) {
      setError("Please specify the prescribing doctor's name.");
      return;
    }
    if (!notes.trim()) {
      setError("Please enter the clinical doctor's note for the patient.");
      return;
    }
    if (prescribedItems.length === 0) {
      setError("Please add at least one medication to the prescription.");
      return;
    }
    for (const item of prescribedItems) {
      if (!item.dosage_instructions.trim()) {
        setError(`Please provide dosage instructions for ${item.name}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        doctor_name: doc,
        doctor_note: notes.trim(),
        items: prescribedItems.map((item) => ({
          product_id: item.product_id,
          dosage_instructions: item.dosage_instructions.trim(),
          quantity: item.quantity,
        })),
      };

      const res = await fetch(`/api/gload/lab-tests/${reference}/prescription/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        window.location.href = "/glopharm/login?session_expired=1";
        return;
      }

      const resData = await res.json();
      if (!res.ok) {
        setError(resData.message || resData.detail || "Failed to issue prescription.");
        setSubmitting(false);
        return;
      }

      onPrescriptionSuccess();
      await fetchDetail();
    } catch {
      setError("An unexpected network error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  // Primary file: either detail.file or detail.files[0]
  const primaryFile =
    detail?.file || (detail?.files && detail.files.length > 0 ? detail.files[0] : null);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Lab test ${reference}`}
        className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-6 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wider text-blue-600 uppercase">
              #{reference} {detail?.created_at ? `· ${formatDate(detail.created_at)}` : ""}
            </p>
            <h2 className="mt-0.5 truncate text-lg font-bold text-gray-900">
              {detail?.test_name || "Lab Test Details"}
            </h2>
            {detail && (
              <div className="mt-1.5 flex items-center gap-2">
                <Badge status={detail.status} label={detail.status_label} />
                {detail.reviewed_at && (
                  <span className="text-[11px] text-gray-500">
                    Reviewed: {formatDate(detail.reviewed_at)}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-gray-500">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p>Loading lab test details...</p>
            </div>
          ) : !detail ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              {error || "Unable to load lab test details."}
            </div>
          ) : (
            <>
              {/* Patient Card */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Patient Information
                </h3>
                <div className="flex items-center gap-3.5 rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {detail.patient.initials || initials(detail.patient.name)}
                  </span>
                  <div className="min-w-0 text-xs flex-1">
                    <p className="text-sm font-bold text-gray-900">{detail.patient.name}</p>
                    <p className="truncate text-gray-600">{detail.patient.email}</p>
                    {detail.patient.phone && (
                      <p className="text-gray-500 font-mono mt-0.5">{detail.patient.phone}</p>
                    )}
                  </div>
                </div>

                {/* Patient Symptoms */}
                <div className="mt-3 rounded-xl bg-gray-50 border border-gray-200/70 p-3.5 text-xs text-gray-700">
                  <p className="mb-1 font-semibold text-gray-800">Reported Symptoms</p>
                  <p className="italic text-gray-600">
                    {detail.symptoms?.trim() || "No symptoms reported by patient."}
                  </p>
                </div>
              </section>

              {/* Lab Report File */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Uploaded Lab Report
                </h3>
                <ReportPreview file={primaryFile} />

                {/* Multiple files if present */}
                {detail.files && detail.files.length > 1 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase">
                      Additional Documents ({detail.files.length})
                    </p>
                    {detail.files.map((f, idx) => (
                      <a
                        key={f.id || idx}
                        href={f.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <FileIcon className="h-4 w-4 text-blue-600 shrink-0" />
                          <span className="truncate">{f.original_name || `File ${idx + 1}`}</span>
                        </span>
                        <span className="text-blue-600 font-semibold shrink-0">Open</span>
                      </a>
                    ))}
                  </div>
                )}
              </section>

              {/* Existing Prescription Summary (if available) */}
              {detail.prescription && (
                <section className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      Current Prescription on File
                    </h3>
                    {detail.prescription.order && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                        Order #{detail.prescription.order.order_number} ({detail.prescription.order.status})
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-semibold text-gray-900">
                    Doctor: {detail.prescription.doctor_name}
                  </p>
                  <p className="mt-1 text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-blue-100 italic">
                    &ldquo;{detail.prescription.doctor_note}&rdquo;
                  </p>
                </section>
              )}

              {/* Prescription Form / Medication List */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    {detail.prescription ? "Prescription Medications" : "Create Prescription"}
                  </h3>
                  {isCompleted && (
                    <span className="text-[11px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      Dispensed
                    </span>
                  )}
                </div>

                {/* Prescribing Doctor Selector */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-800">
                    Prescribing Doctor
                  </label>
                  <select
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    disabled={isCompleted}
                    className={INPUT}
                  >
                    {DOCTORS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} — {d.role}
                      </option>
                    ))}
                    <option value="custom">Other / Custom Doctor Name...</option>
                  </select>
                  {doctorName === "custom" && (
                    <input
                      type="text"
                      placeholder="Enter doctor's full name"
                      value={customDoctor}
                      onChange={(e) => setCustomDoctor(e.target.value)}
                      className={`${INPUT} mt-2`}
                    />
                  )}
                </div>

                {/* Doctor Note */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-800">
                    Doctor&apos;s Clinical Note (Sent to patient)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    disabled={isCompleted}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setError("");
                    }}
                    placeholder="e.g. Moderate Plasmodium falciparum (+2) detected. ACT, immune support and analgesic prescribed for 3 days."
                    className={`${INPUT} resize-none`}
                  />
                </div>

                {/* Medications Adder */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-800">
                      Prescribed Medications
                    </label>
                    <span className="text-[11px] text-gray-500">
                      {prescribedItems.length} item(s) selected
                    </span>
                  </div>

                  {!isCompleted && (
                    <div ref={pickerRef} className="relative">
                      <input
                        value={medQuery}
                        onChange={(e) => {
                          setMedQuery(e.target.value);
                          setPickerOpen(true);
                        }}
                        onFocus={() => setPickerOpen(true)}
                        placeholder="Search medicines catalog to add (e.g. Paracetamol, ACT)..."
                        className={`${INPUT} pr-10`}
                      />
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {searchingMed ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        ) : (
                          <SearchIcon />
                        )}
                      </span>

                      {pickerOpen && (
                        <div
                          className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-2xl"
                        >
                          <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-gray-400 uppercase">
                            <span>Store Products Catalog</span>
                            {searchingMed && <span className="text-blue-600 lowercase font-normal">searching...</span>}
                          </div>

                          {filteredMedicines.length === 0 ? (
                            <div className="px-3 py-3 text-center text-xs text-gray-500">
                              No matching products in catalog.
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {filteredMedicines.map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => addDrugFromCatalog(c)}
                                  className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-blue-50 transition cursor-pointer"
                                >
                                  {c.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={c.image}
                                      alt=""
                                      className="h-8 w-8 shrink-0 rounded-md border border-gray-200 object-cover"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">
                                      RX
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold text-gray-800">
                                      {c.name}
                                    </p>
                                    {c.category && (
                                      <p className="text-[10px] text-gray-400 capitalize">
                                        {c.category}
                                      </p>
                                    )}
                                  </div>
                                  <span className="shrink-0 text-xs font-bold text-gray-700">
                                    {naira(c.price)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          {medQuery.trim() && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <button
                                type="button"
                                onClick={() => addCustomDrug(medQuery)}
                                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50/70 p-2.5 text-left text-xs font-semibold text-blue-700 hover:bg-blue-100/80 transition cursor-pointer"
                              >
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-[11px] font-bold">
                                  +
                                </span>
                                <span className="truncate">
                                  Add &ldquo;{medQuery.trim()}&rdquo; as custom medication
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Medicines List */}
                  <ul className="mt-3 space-y-2.5">
                    {prescribedItems.length === 0 ? (
                      <li className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-4 py-8 text-center text-xs text-gray-500">
                        No medications prescribed yet. Search above to add items.
                      </li>
                    ) : (
                      prescribedItems.map((item, idx) => (
                        <li
                          key={item.product_id || idx}
                          className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image}
                                alt=""
                                className="h-10 w-10 shrink-0 rounded-md border border-gray-200 object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 shrink-0 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
                                RX
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {naira(item.unit_price)} each · Subtotal:{" "}
                                <span className="font-semibold text-gray-800">
                                  {naira(Number(item.unit_price) * item.quantity)}
                                </span>
                              </p>
                            </div>

                            {!isCompleted && (
                              <button
                                type="button"
                                onClick={() => removeDrug(idx)}
                                aria-label={`Remove ${item.name}`}
                                className="shrink-0 text-gray-400 hover:text-red-600 p-1 transition"
                              >
                                <TrashIcon />
                              </button>
                            )}
                          </div>

                          {/* Dosage & Quantity controls */}
                          <div className="mt-2.5 flex items-center gap-2">
                            <input
                              value={item.dosage_instructions}
                              disabled={isCompleted}
                              onChange={(e) =>
                                patchDrug(idx, { dosage_instructions: e.target.value })
                              }
                              placeholder="Dosage instructions (e.g. 1 tablet twice daily)"
                              className={INPUT}
                            />
                            <div className="flex shrink-0 items-center rounded-lg border border-gray-300 bg-white">
                              <button
                                type="button"
                                disabled={isCompleted || item.quantity <= 1}
                                onClick={() =>
                                  patchDrug(idx, { quantity: Math.max(1, item.quantity - 1) })
                                }
                                className="px-2.5 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                              >
                                −
                              </button>
                              <span className="w-7 text-center text-xs font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={isCompleted}
                                onClick={() => patchDrug(idx, { quantity: item.quantity + 1 })}
                                className="px-2.5 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white px-6 py-4">
          {error && (
            <p role="alert" className="mb-3 rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-600 border border-red-200">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                Prescription Total
              </p>
              <p className="text-xl font-bold text-gray-900">{naira(totalCalculated)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                {isCompleted ? "Close" : "Cancel"}
              </button>

              {!isCompleted && (
                <button
                  onClick={handlePrescribeSubmit}
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition cursor-pointer flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Issuing...
                    </>
                  ) : detail?.prescription ? (
                    "Update Prescription"
                  ) : (
                    "Issue Prescription"
                  )}
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
/*  Main Page Component                                                       */
/* -------------------------------------------------------------------------- */

export default function LabTestsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading Lab Tests…</div>}>
      <LabTestsPageInner />
    </Suspense>
  );
}

function LabTestsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // API Data States
  const [stats, setStats] = useState<LabTestStats | null>(null);
  const [tests, setTests] = useState<LabTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Tab active state from URL (?status=under_review)
  const statusParam = searchParams.get("status") || "all";
  const tab: TabKey = TABS.some((t) => t.key === statusParam) ? (statusParam as TabKey) : "all";

  const setTab = (t: TabKey) => {
    router.replace(t === "all" ? pathname : `${pathname}?status=${t}`, { scroll: false });
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/gload/lab-tests/stats");
      if (res.status === 401) {
        window.location.href = "/glopharm/login?session_expired=1";
        return;
      }
      const json = await res.json();
      if (json?.data) {
        setStats(json.data);
      }
    } catch {
      // non-critical
    }
  }, []);

  // Fetch Tests list
  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (tab !== "all") {
        qs.set("status", tab);
      }
      if (query.trim()) {
        qs.set("search", query.trim());
      }

      const res = await fetch(`/api/gload/lab-tests?${qs.toString()}`);
      if (res.status === 401) {
        window.location.href = "/glopharm/login?session_expired=1";
        return;
      }
      const json = await res.json();
      const results = json?.data?.results || json?.results || [];
      setTests(Array.isArray(results) ? results : []);
    } catch {
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [tab, query]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // Client-side filter fallback in case backend does partial filtering
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests.filter((t) => {
      // status match
      const s = t.status?.toLowerCase() || "";
      let matchesTab = true;
      if (tab === "under_review") {
        matchesTab = s.includes("review");
      } else if (tab === "awaiting_payment") {
        matchesTab = s.includes("payment") || s === "ready";
      } else if (tab === "completed") {
        matchesTab = s.includes("complete") || s.includes("dispens");
      }

      if (!matchesTab) return false;
      if (!q) return true;

      return (
        t.reference?.toLowerCase().includes(q) ||
        t.test_name?.toLowerCase().includes(q) ||
        t.patient?.name?.toLowerCase().includes(q) ||
        t.patient?.email?.toLowerCase().includes(q)
      );
    });
  }, [tests, tab, query]);

  const counts = {
    all: stats?.total_reports ?? tests.length,
    under_review: stats?.awaiting_review ?? tests.filter((t) => t.status?.includes("review")).length,
    awaiting_payment:
      stats?.awaiting_payment?.count ??
      tests.filter((t) => t.status?.includes("payment") || t.status === "ready").length,
    completed: stats?.dispensed ?? tests.filter((t) => t.status?.includes("complete")).length,
  };

  const pendingAmount = stats?.awaiting_payment?.pending_amount || "0.00";

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed right-6 top-6 z-[60] flex items-center gap-2.5 rounded-xl bg-green-600 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-fade-in"
        >
          <CheckIcon />
          {toast}
        </div>
      )}

      {/* Title & Breadcrumbs */}
      <h1 className="text-2xl font-bold text-gray-900">Lab Tests & Prescriptions</h1>
      <nav className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span>Dashboard</span>
        <CaretRight />
        <span>Lab Tests</span>
        <CaretRight />
        <span className="font-semibold text-blue-600">
          {TABS.find((t) => t.key === tab)?.label || "All Tests"}
        </span>
      </nav>

      {/* Stats Cards */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Awaiting Review */}
        <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
            Awaiting Review
          </p>
          <p className="mt-3 text-3xl font-extrabold">{counts.under_review}</p>
          <p className="mt-1 text-[11px] text-white/80">Require clinical review & prescription</p>
        </div>

        {/* Awaiting Payment */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Awaiting Payment
          </p>
          <p className="mt-3 text-3xl font-extrabold text-blue-600">{counts.awaiting_payment}</p>
          <p className="mt-1 text-[11px] text-gray-500">{naira(pendingAmount)} pending checkout</p>
        </div>

        {/* Dispensed */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Dispensed
          </p>
          <p className="mt-3 text-3xl font-extrabold text-green-600">{counts.completed}</p>
          <p className="mt-1 text-[11px] text-gray-500">Paid and dispensed orders</p>
        </div>

        {/* Total Reports */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Total Reports
          </p>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">{counts.all}</p>
          <p className="mt-1 text-[11px] text-gray-500">Uploaded patient records</p>
        </div>
      </div>

      {/* Main Section */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ref (e.g. LAB-002), patient, test..."
            className="w-full rounded-full border border-gray-300 bg-white py-2 pl-4 pr-10 text-xs text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex overflow-x-auto rounded-xl border border-gray-200 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
                tab === t.key
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {t.label} ({counts[t.key]})
            </button>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="mt-4 hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
          <table className="w-full min-w-[820px] border-collapse">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3.5">Reference & Test</th>
                <th className="px-4 py-3.5">Patient</th>
                <th className="px-4 py-3.5">Uploaded</th>
                <th className="px-4 py-3.5">Report Document</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      Loading lab records...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                    No lab tests found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.reference} className="hover:bg-gray-50/70 transition">
                    {/* Ref & Test */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSelectedRef(item.reference)}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        #{item.reference}
                      </button>
                      <p className="max-w-[240px] truncate text-xs font-medium text-gray-900">
                        {item.test_name}
                      </p>
                    </td>

                    {/* Patient */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                          {item.patient.initials || initials(item.patient.name)}
                        </span>
                        <div className="min-w-0 text-xs">
                          <p className="font-semibold text-gray-900">{item.patient.name}</p>
                          <p className="truncate text-gray-500">{item.patient.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-gray-600">
                      {formatDate(item.created_at)}
                    </td>

                    {/* Document */}
                    <td className="px-4 py-3.5">
                      {item.file ? (
                        <a
                          href={item.file.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex max-w-[180px] items-center gap-1.5 text-xs text-blue-600 hover:underline"
                        >
                          <FileIcon className="h-4 w-4 shrink-0 text-gray-500" />
                          <span className="truncate">{item.file.original_name || "Document"}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 italic">None</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <Badge status={item.status} label={item.status_label} />
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedRef(item.reference)}
                        className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-bold cursor-pointer transition ${
                          item.status?.toLowerCase().includes("review")
                            ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                            : "border border-gray-300 text-gray-800 hover:bg-gray-100"
                        }`}
                      >
                        {item.action_label ||
                          (item.status?.toLowerCase().includes("review")
                            ? "Review & Prescribe"
                            : "View Details")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <ul className="mt-4 space-y-3 md:hidden">
          {loading ? (
            <li className="py-10 text-center text-sm text-gray-500">Loading lab tests...</li>
          ) : filtered.length === 0 ? (
            <li className="py-10 text-center text-sm text-gray-500">No lab tests found.</li>
          ) : (
            filtered.map((item) => (
              <li
                key={item.reference}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-blue-600">#{item.reference}</p>
                    <p className="truncate text-sm font-bold text-gray-900">{item.test_name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {item.patient.name} · {formatDate(item.created_at)}
                    </p>
                  </div>
                  <Badge status={item.status} label={item.status_label} />
                </div>
                <button
                  onClick={() => setSelectedRef(item.reference)}
                  className={`mt-3 w-full rounded-lg px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                    item.status?.toLowerCase().includes("review")
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-gray-300 text-gray-800"
                  }`}
                >
                  {item.action_label ||
                    (item.status?.toLowerCase().includes("review")
                      ? "Review & Prescribe"
                      : "View Details")}
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* Review & Prescribe Drawer */}
      {selectedRef && (
        <ReviewDrawer
          key={selectedRef}
          reference={selectedRef}
          onClose={() => setSelectedRef(null)}
          onPrescriptionSuccess={() => {
            showToast(`Prescription for #${selectedRef} issued successfully.`);
            fetchStats();
            fetchTests();
          }}
        />
      )}
    </div>
  );
}
