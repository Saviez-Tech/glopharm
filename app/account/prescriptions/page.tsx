"use client";

import { useState, useEffect } from "react";

// ── Backend shapes ────────────────────────────────────────────────────────────

interface LabFile {
  id: number;
  file_url: string;
  original_name: string;
  uploaded_at: string;
}

interface PrescriptionItem {
  id: number;
  product_id: number;
  name: string;
  dosage_instructions: string;
  quantity: number;
  unit_price: string;
  line_total: string;
}

interface Prescription {
  doctor_name: string;
  doctor_note: string;
  issued_at: string;
  items: PrescriptionItem[];
  total: number;
  order_number: string | null;
  payment_status: string | null;
}

interface LabTest {
  reference: string;
  test_name: string;
  symptoms: string;
  status: string;
  status_label: string;
  created_at: string;
  reviewed_at: string | null;
  files: LabFile[];
  prescription: Prescription | null;
}

interface PaymentData {
  reference: string;
  amount: string;
  status: string;
  authorization_url?: string;
}

interface CheckoutResult {
  order: {
    order_number: string;
    customer_name: string;
    total: string;
  };
  payment: PaymentData;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatNaira = (val: string | number) =>
  "₦" + Number(val).toLocaleString("en-NG");

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const NIGERIAN_STATES = [
  "Akwa Ibom", "Lagos", "Abuja FCT", "Rivers", "Oyo", "Enugu",
  "Delta", "Kano", "Kaduna", "Ogun", "Edo", "Anambra",
  "Cross River", "Imo", "Abia", "Plateau",
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PrescriptionsPage() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "under_review" | "prescription_ready" | "completed">("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPrevPage] = useState<boolean>(false);

  // Upload modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testTitle, setTestTitle] = useState("");
  const [testSymptoms, setTestSymptoms] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");

  // Checkout modal (prescription)
  const [checkingOut, setCheckingOut] = useState<LabTest | null>(null);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
  const [shippingForm, setShippingForm] = useState({
    fullName: "", email: "", phone: "", address: "", city: "", state: "Lagos",
  });

  // Toast
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // ── Fetch lab tests (with pagination) ────────────────────────────────────
  const fetchTests = async (pageToLoad = currentPage) => {
    setLoading(true);
    setError("");
    try {
      const url = `/api/lab-tests${pageToLoad > 1 ? `?page=${pageToLoad}` : ""}`;
      const res = await fetch(url);
      if (res.status === 401) {
        window.location.href = "/login?callbackUrl=" + encodeURIComponent("/account/prescriptions");
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load lab tests");
      setTests(json.data?.results ?? []);
      setTotalCount(json.data?.count ?? 0);
      setHasNextPage(Boolean(json.data?.next));
      setHasPrevPage(Boolean(json.data?.previous));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load lab tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Upload lab test (Uploads to Cloudinary first, then submits) ───────────
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim()) {
      setUploadError("Please provide a test name or title.");
      return;
    }
    if (!attachedFile) {
      setUploadError("Please select a lab report or document to upload.");
      return;
    }

    setSubmitting(true);
    setUploadError("");

    try {
      // 1. Upload file to Cloudinary via our Next.js API route
      const uploadFormData = new FormData();
      uploadFormData.append("file", attachedFile);

      const uploadRes = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadJson.message || "Failed to upload file to Cloudinary.");
      }

      const fileUrl = uploadJson.data?.url;
      const fileName = uploadJson.data?.file_name || attachedFile.name;

      if (!fileUrl) {
        throw new Error("No URL returned from Cloudinary upload.");
      }

      // 2. Submit lab test to backend API with the Cloudinary URL
      const payload = {
        test_name: testTitle.trim(),
        file_url: fileUrl,
        file_name: fileName,
        symptoms: testSymptoms.trim(),
      };

      const res = await fetch("/api/lab-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to submit lab report");

      // Prepend new test to list & update total count
      setTests((prev) => [json.data, ...prev]);
      setTotalCount((prev) => prev + 1);
      setIsModalOpen(false);
      setTestTitle("");
      setTestSymptoms("");
      setAttachedFile(null);
      showToast("Test report uploaded to Cloudinary and submitted to doctor!");
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload and submit lab result");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Prescription checkout ────────────────────────────────────────────────
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkingOut) return;
    setCheckoutSubmitting(true);
    setCheckoutError("");

    try {
      const payload = {
        customer_name: shippingForm.fullName.trim(),
        customer_email: shippingForm.email.trim(),
        customer_phone: shippingForm.phone.trim(),
        shipping_address: shippingForm.address.trim(),
        shipping_city: shippingForm.city.trim(),
        shipping_state: shippingForm.state,
      };

      const res = await fetch(`/api/lab-tests/${checkingOut.reference}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Checkout failed");

      setCheckoutResult(json.data as CheckoutResult);
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const filteredTests = filter === "all" ? tests : tests.filter((t) => t.status === filter);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#00A654] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-medium text-xs sm:text-sm max-w-sm">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span>{toast}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Lab Tests &amp; Prescriptions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Upload test results, review doctor recommendations, and pay for your medication.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto px-6 py-2.5 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Upload Test Result</span>
        </button>
      </div>

      {/* Banner */}
      <div className="bg-emerald-50/80 rounded-2xl border border-emerald-200/60 px-4 py-3 flex items-center justify-between text-xs sm:text-sm text-neutral-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#00A654] shrink-0" />
          <span className="font-medium">Upload your lab test result — our doctor writes a verified prescription ready for 1-click checkout.</span>
        </div>
        <span className="hidden sm:inline-flex text-[10px] font-bold text-[#00A654] uppercase tracking-wider bg-white px-2.5 py-1 rounded-full shadow-xs shrink-0">
          Doctor Online
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-px overflow-x-auto">
        {[
          { key: "all", label: "All Tests" },
          { key: "prescription_ready", label: "Prescription Ready" },
          { key: "under_review", label: "Under Review" },
          { key: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              filter === tab.key
                ? "border-[#00A654] text-[#00A654]"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => <div key={i} className="h-40 bg-neutral-100 rounded-3xl" />)}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span>{error}</span>
          <button onClick={() => fetchTests(currentPage)} className="ml-auto text-xs font-bold underline">Retry</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredTests.length === 0 && (
        <div className="text-center py-16 text-neutral-400 text-sm">
          No lab tests found. Upload your first result above.
        </div>
      )}

      {/* Cards */}
      {!loading && !error && (
        <div className="space-y-5">
          {filteredTests.map((test) => (
            <div
              key={test.reference}
              className={`bg-white rounded-2xl sm:rounded-3xl border transition-all p-5 sm:p-7 shadow-xs ${
                test.status === "prescription_ready"
                  ? "border-[#00A654]/40 ring-1 ring-[#00A654]/20"
                  : "border-neutral-200/80"
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F8F9FA] flex items-center justify-center text-neutral-500 shrink-0 border border-neutral-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-neutral-400">#{test.reference}</span>
                      <span className="text-neutral-300">·</span>
                      <span className="text-xs text-neutral-500">{formatDate(test.created_at)}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 mt-0.5">{test.test_name}</h3>
                    {test.symptoms && (
                      <p className="text-xs text-neutral-400 mt-0.5 italic">{test.symptoms}</p>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="self-start sm:self-auto">
                  {test.status === "prescription_ready" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A654] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-[#00A654]" />
                      Prescription Ready
                    </span>
                  )}
                  {test.status === "under_review" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Under Review
                    </span>
                  )}
                  {test.status === "completed" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                      Completed &amp; Dispensed
                    </span>
                  )}
                  {!["prescription_ready", "under_review", "completed"].includes(test.status) && (
                    <span className="inline-flex items-center text-xs font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                      {test.status_label}
                    </span>
                  )}
                </div>
              </div>

              {/* Prescription Items (if ready) */}
              {test.prescription && test.status === "prescription_ready" && (
                <div className="pt-4 space-y-4">
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-600">
                    <span className="text-[#00A654] font-bold shrink-0">{test.prescription.doctor_name}:</span>
                    <span className="italic">{test.prescription.doctor_note}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {test.prescription.items.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl bg-[#F8F9FA] border border-neutral-200/70 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-neutral-900 line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-neutral-500">{item.dosage_instructions}</p>
                          <p className="text-[10px] text-neutral-400">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-xs font-bold text-neutral-900 shrink-0">{formatNaira(item.line_total)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-neutral-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-neutral-500">Prescription Total:</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                        {formatNaira(test.prescription.total)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setCheckingOut(test); setCheckoutResult(null); setCheckoutError(""); }}
                      className="px-7 py-3 rounded-full bg-[#00A654] hover:bg-[#008f48] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      </svg>
                      <span>Check Out &amp; Pay · {formatNaira(test.prescription.total)}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Under Review info */}
              {test.status === "under_review" && (
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Estimated prescription time: within 1–2 hours</span>
                  </span>
                  {test.files[0] && (
                    <a href={test.files[0].file_url} target="_blank" rel="noopener noreferrer"
                      className="font-mono text-[11px] text-[#0265CB] hover:underline truncate max-w-[140px]">
                      {test.files[0].original_name}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* ── Pagination Controls ── */}
          {(hasNextPage || hasPrevPage || totalCount > tests.length) && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-200">
              <div className="text-xs sm:text-sm text-neutral-500 font-medium">
                Page <span className="font-bold text-neutral-900">{currentPage}</span>
                {totalCount > 0 && (
                  <>
                    {" "}· <span className="font-semibold text-neutral-700">{totalCount}</span> total test records
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  type="button"
                  disabled={!hasPrevPage && currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                  <span>Previous</span>
                </button>

                {/* Active Page Indicator */}
                <span className="px-3.5 py-2 rounded-xl bg-emerald-50 text-[#00A654] font-bold text-xs sm:text-sm border border-emerald-100">
                  Page {currentPage}
                </span>

                {/* Next Button */}
                <button
                  type="button"
                  disabled={!hasNextPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-4 py-2.5 rounded-xl bg-[#00A654] hover:bg-[#008f48] text-white text-xs sm:text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Next</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Upload Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">Upload Medical Test Result</h3>
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Test Type / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Malaria & Typhoid, Full Blood Count"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 focus:border-[#00A654] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Attach Report File (PDF / Image)
                </label>
                <label className="border-2 border-dashed border-neutral-300 hover:border-[#00A654] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#FAF9F6]">
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) setAttachedFile(e.target.files[0]); }} />
                  <svg className="w-8 h-8 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-xs font-bold text-neutral-800">
                    {attachedFile ? attachedFile.name : "Select lab document or image"}
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-0.5">PDF, JPG, PNG up to 10MB</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Symptoms (Optional)
                </label>
                <textarea rows={2} placeholder="e.g. Mild fever and headache for 2 days..."
                  value={testSymptoms}
                  onChange={(e) => setTestSymptoms(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:border-[#00A654] outline-none resize-none" />
              </div>

              {uploadError && (
                <p className="text-xs text-red-600 font-medium">{uploadError}</p>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-800">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2.5 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2">
                  {submitting && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  <span>{submitting ? "Uploading to Cloudinary..." : "Send to Doctor"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Prescription Checkout Modal ── */}
      {checkingOut && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900">Complete Your Order</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Prescription #{checkingOut.reference} · {checkingOut.test_name}</p>
              </div>
              <button type="button" onClick={() => setCheckingOut(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer shrink-0">✕</button>
            </div>

            {/* Success state */}
            {checkoutResult ? (
              <div className="mt-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#00A654] flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-neutral-900">Order Placed!</h4>
                <p className="text-sm text-neutral-600">Order #{checkoutResult.order?.order_number}</p>

                {checkoutResult.payment?.authorization_url && (
                  <a
                    href={checkoutResult.payment.authorization_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-sm shadow-md transition-all"
                  >
                    <span>Pay Now via Paystack</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                )}
                <div>
                  <button onClick={() => setCheckingOut(null)}
                    className="text-xs font-bold text-neutral-500 hover:text-neutral-800 underline">Close</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <input type="text" required placeholder="e.g. Ada Okafor"
                      value={shippingForm.fullName}
                      onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                      className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-[#00A654] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Email *</label>
                    <input type="email" required placeholder="ada@example.com"
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                      className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-[#00A654] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Phone *</label>
                    <input type="tel" required placeholder="+2348012345678"
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                      className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-[#00A654] outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Street Address *</label>
                    <input type="text" required placeholder="12 Adeola Odeku Street"
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                      className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-[#00A654] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">City *</label>
                    <input type="text" required placeholder="Victoria Island"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                      className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-[#00A654] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">State *</label>
                    <select value={shippingForm.state}
                      onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                      className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-[#00A654] outline-none bg-white cursor-pointer">
                      {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Order summary */}
                {checkingOut.prescription && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm">
                    <div className="flex justify-between font-bold text-neutral-900">
                      <span>Prescription Total</span>
                      <span className="text-[#00A654]">{formatNaira(checkingOut.prescription.total)}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{checkingOut.prescription.items.length} item(s) · Payment via Paystack</p>
                  </div>
                )}

                {checkoutError && (
                  <p className="text-xs text-red-600 font-medium">{checkoutError}</p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={() => setCheckingOut(null)}
                    className="text-sm font-bold text-neutral-500 hover:text-neutral-800">Cancel</button>
                  <button type="submit" disabled={checkoutSubmitting}
                    className="px-7 py-3 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2">
                    {checkoutSubmitting ? (
                      <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg><span>Processing...</span></>
                    ) : (
                      <span>Place Order · {checkingOut.prescription ? formatNaira(checkingOut.prescription.total) : ""}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
