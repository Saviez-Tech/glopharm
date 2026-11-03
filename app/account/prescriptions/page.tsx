"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PrescribedDrug {
  name: string;
  dosage: string;
  quantity: number;
  price: number;
  image: string;
}

interface TestItem {
  id: string;
  title: string;
  date: string;
  fileName: string;
  status: "ready" | "reviewing" | "completed";
  doctor?: {
    name: string;
    role: string;
    notes: string;
  };
  drugs?: PrescribedDrug[];
  totalCost?: number;
}

const TESTS_DATA: TestItem[] = [
  {
    id: "LAB-041",
    title: "Malaria & Typhoid Panel",
    date: "Today, 09:30 AM",
    fileName: "malaria_lab_scan.pdf",
    status: "ready",
    doctor: {
      name: "Dr. Emmanuel Adeyemi",
      role: "Lead Clinical Pharmacologist",
      notes: "Moderate Plasmodium falciparum (+2) detected. Artemisinin-based therapy (ACT), immune support, and analgesic prescribed for 3 days.",
    },
    drugs: [
      {
        name: "Artemether / Lumefantrine 80/480mg (ACT)",
        dosage: "1 tablet twice daily for 3 days with a meal",
        quantity: 1,
        price: 4800,
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80",
      },
      {
        name: "Vitamin C 1000mg Effervescent (30 tabs)",
        dosage: "1 tablet dissolved in water daily",
        quantity: 1,
        price: 4500,
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80",
      },
      {
        name: "Paracetamol Extra Relief (20 tabs)",
        dosage: "2 tablets as needed for fever/headache",
        quantity: 1,
        price: 1500,
        image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=200&auto=format&fit=crop&q=80",
      },
    ],
    totalCost: 10800,
  },
  {
    id: "LAB-039",
    title: "Fasting Blood Glucose & Lipid Panel",
    date: "Today, 10:15 AM",
    fileName: "lipid_glucose_nov.pdf",
    status: "reviewing",
    doctor: {
      name: "Dr. Chioma Nwosu",
      role: "Consultant Physician",
      notes: "Currently analyzing lab metrics. Your prescription will be issued shortly.",
    },
  },
  {
    id: "LAB-022",
    title: "Comprehensive Wellness Blood Panel",
    date: "Oct 18, 2026",
    fileName: "wellness_scan.pdf",
    status: "completed",
    doctor: {
      name: "Dr. Emmanuel Adeyemi",
      role: "Lead Clinical Pharmacologist",
      notes: "Prescription completed and delivered to your Victoria Island address.",
    },
    totalCost: 8500,
  },
];

export default function PrescriptionsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestItem[]>(TESTS_DATA);
  const [filter, setFilter] = useState<"all" | "ready" | "reviewing" | "completed">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Form
  const [testTitle, setTestTitle] = useState("");
  const [testNotes, setTestNotes] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const formatNaira = (val: number) => "₦" + val.toLocaleString("en-NG");

  const filteredTests =
    filter === "all" ? tests : tests.filter((t) => t.status === filter);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim()) return;

    const newTest: TestItem = {
      id: `LAB-${Math.floor(100 + Math.random() * 900)}`,
      title: testTitle.trim(),
      date: "Just now",
      fileName: attachedFile ? attachedFile.name : "lab_report_scan.pdf",
      status: "reviewing",
      doctor: {
        name: "Dr. Chioma Nwosu",
        role: "Assigned Reviewer",
        notes: "Your test report has been assigned to our doctor for diagnostic review.",
      },
    };

    setTests([newTest, ...tests]);
    setIsModalOpen(false);
    setTestTitle("");
    setTestNotes("");
    setAttachedFile(null);
    setToastMessage("Test report uploaded! The doctor will issue your prescription shortly.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePay = (item: TestItem) => {
    router.push("/cart");
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#00A654] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in font-medium text-xs sm:text-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Lab Tests &amp; Prescriptions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Upload test results, review doctor recommendations, and pay for your medication.
          </p>
        </div>

        {/* Upload Button */}
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

      {/* ── CLEAN RESPONSIVE BANNER ── */}
      <div className="bg-emerald-50/80 rounded-2xl border border-emerald-200/60 px-4 py-3 flex items-center justify-between text-xs sm:text-sm text-neutral-800 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#00A654] shrink-0" />
          <span className="font-medium text-xs sm:text-sm text-neutral-800">
            Upload your lab test result &mdash; our doctor writes a verified prescription ready for 1-click checkout.
          </span>
        </div>
        <span className="hidden sm:inline-flex text-[10px] font-bold text-[#00A654] uppercase tracking-wider bg-white px-2.5 py-1 rounded-full shadow-2xs shrink-0">
          Doctor Online
        </span>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-px overflow-x-auto">
        {[
          { key: "all", label: "All Tests" },
          { key: "ready", label: "Prescription Ready" },
          { key: "reviewing", label: "Under Review" },
          { key: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key as any)}
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

      {/* ── CLEAN CARDS LIST ── */}
      <div className="space-y-5">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className={`bg-white rounded-2xl sm:rounded-3xl border transition-all p-5 sm:p-7 shadow-xs ${
              test.status === "ready"
                ? "border-[#00A654]/40 ring-1 ring-[#00A654]/20"
                : "border-neutral-200/80"
            }`}
          >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F9FA] flex items-center justify-center text-neutral-500 shrink-0 border border-neutral-100">
                  <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-neutral-400">#{test.id}</span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-xs text-neutral-500">{test.date}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 mt-0.5">
                    {test.title}
                  </h3>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-auto">
                {test.status === "ready" && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A654] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-[#00A654]" />
                    Prescription Ready
                  </span>
                )}
                {test.status === "reviewing" && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Doctor Reviewing
                  </span>
                )}
                {test.status === "completed" && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                    Completed &amp; Dispensed
                  </span>
                )}
              </div>
            </div>

            {/* Doctor Note Snippet */}
            {test.doctor && (
              <div className="py-4 text-xs sm:text-sm text-neutral-600 flex items-start gap-2.5">
                <span className="text-[#00A654] font-bold shrink-0">{test.doctor.name}:</span>
                <span className="text-neutral-700 italic">{test.doctor.notes}</span>
              </div>
            )}

            {/* If Prescription is Ready: Medication list + Check Out Button */}
            {test.status === "ready" && test.drugs && (
              <div className="pt-3 border-t border-neutral-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {test.drugs.map((drug, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#F8F9FA] border border-neutral-200/70 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-white p-1 shrink-0 border border-neutral-100 overflow-hidden">
                          <img
                            src={drug.image}
                            alt=""
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900 line-clamp-1">
                            {drug.name}
                          </p>
                          <p className="text-[10px] text-neutral-500 line-clamp-1">{drug.dosage}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-neutral-900 shrink-0">
                        {formatNaira(drug.price)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Checkout Action Row */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-neutral-500">Prescription Total:</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                      {formatNaira(test.totalCost || 0)}
                    </span>
                  </div>

                  {/* CHECK OUT & PAY BUTTON */}
                  <button
                    type="button"
                    onClick={() => handlePay(test)}
                    className="px-7 py-3 rounded-full bg-[#00A654] hover:bg-[#008f48] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                    </svg>
                    <span>Check Out &amp; Pay · {formatNaira(test.totalCost || 0)}</span>
                  </button>
                </div>
              </div>
            )}

            {/* If Under Review */}
            {test.status === "reviewing" && (
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Estimated prescription time: within 1–2 hours</span>
                </span>
                <span className="text-neutral-400 font-mono text-[11px]">{test.fileName}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── CLEAN UPLOAD MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                Upload Medical Test Result
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
              >
                ✕
              </button>
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
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-xs sm:text-sm text-neutral-900 focus:border-[#00A654] outline-none"
                  required
                />
              </div>

              {/* Drag & Drop File Zone */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Attach Report File (PDF / Image)
                </label>
                <label className="border-2 border-dashed border-neutral-300 hover:border-[#00A654] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#FAF9F6]">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAttachedFile(e.target.files[0]);
                      }
                    }}
                  />
                  <svg className="w-8 h-8 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-xs font-bold text-neutral-800">
                    {attachedFile ? attachedFile.name : "Select lab document or image"}
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-0.5">
                    PDF, JPG, PNG up to 10MB
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Symptoms or Doctor Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Mild fever and headache for 2 days..."
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2 text-xs sm:text-sm text-neutral-900 focus:border-[#00A654] outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  Send to Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
