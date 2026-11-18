"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useAdmin } from "../layout";
import { BackendProduct } from "@/lib/validations/ecommerce";

/* ─────────────────────────── Types ─────────────────────────── */

interface Specification {
  name: string;
  value: string;
}

interface ProductStats {
  total_products: number;
  in_stock: number;
  out_of_stock: number;
  catalog_value: string;
}

type FormData = {
  name: string;
  image: string;
  image2: string;
  image3: string;
  image4: string;
  category: string;
  subcategory: string;
  description: string;
  original_price: string;
  price: string;
  stock: number;
  specifications: Specification[];
};

const EMPTY_FORM: FormData = {
  name: "",
  image: "",
  image2: "",
  image3: "",
  image4: "",
  category: "medicine",
  subcategory: "",
  description: "",
  original_price: "",
  price: "",
  stock: 0,
  specifications: [{ name: "", value: "" }],
};

/* ─────────────────────────── Icons ─────────────────────────── */

const Svg = ({
  children,
  className = "h-4 w-4",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
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
  <Svg><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>
);
const PlusIcon = () => (
  <Svg><path d="M12 5v14M5 12h14" /></Svg>
);
const EditIcon = () => (
  <Svg><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Svg>
);
const TrashIcon = () => (
  <Svg><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" /></Svg>
);
const ChevronLeft = () => (
  <Svg><path d="m15 18-6-6 6-6" /></Svg>
);
const ChevronRight = () => (
  <Svg><path d="m9 18 6-6-6-6" /></Svg>
);
const XIcon = () => (
  <Svg><path d="M18 6 6 18M6 6l12 12" /></Svg>
);
const CaretRight = () => (
  <svg viewBox="0 0 8 10" className="h-2.5 w-2 fill-current">
    <path d="M0 0l8 5-8 5z" />
  </svg>
);

/* ─────────────────────────── Toast ─────────────────────────── */

type ToastType = "success" | "error";
interface ToastItem { id: number; msg: string; type: ToastType }

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const push = useCallback((msg: string, type: ToastType = "success") => {
    const id = ++counter.current;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium text-white shadow-lg ${t.type === "success" ? "bg-[#282828]" : "bg-red-600"}`}>
          <span className={`h-2 w-2 rounded-full shrink-0 ${t.type === "success" ? "bg-[#E6FF96]" : "bg-red-200"}`} />
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── Product Modal ─────────────────────── */

interface ProductModalProps {
  darkMode: boolean;
  mode: "create" | "edit";
  initial: FormData;
  id?: number;
  loadingDetails?: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
}

function ProductModal({ darkMode, mode, initial, id, loadingDetails, onClose, onSave }: ProductModalProps) {
  const [form, setForm] = useState<FormData>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  type StrKey = keyof Omit<FormData, "specifications" | "stock">;

  const field = (key: StrKey) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  const addSpec = () =>
    setForm((p) => ({ ...p, specifications: [...p.specifications, { name: "", value: "" }] }));

  const removeSpec = (i: number) =>
    setForm((p) => ({ ...p, specifications: p.specifications.filter((_, idx) => idx !== i) }));

  const updateSpec = (i: number, k: "name" | "value", v: string) =>
    setForm((p) => {
      const specs = [...p.specifications];
      specs[i] = { ...specs[i], [k]: v };
      return { ...p, specifications: specs };
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  const base = darkMode
    ? "bg-[#505050] border-[#666] text-white placeholder-[#B8B8B8]"
    : "bg-white border-[#E8E8E8] text-[#282828] placeholder-[#B8B8B8]";
  const inputCls = `w-full px-3 py-2.5 text-xs rounded-xl border outline-none transition-all focus:border-[#1d68ff] ${base}`;
  const labelCls = `block text-xs font-medium mb-1 ${darkMode ? "text-white" : "text-[#282828]"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl ${darkMode ? "bg-[#282828] border-[#505050]" : "bg-white border-[#E8E8E8]"}`}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-[#282828]"}`}>
              {mode === "create" ? "Add New Product" : `Edit Product ${id ? `#${id}` : ""}`}
            </h2>
            {id && (
              <Link
                href={`/glopharm/products/new?edit=${id}`}
                className="text-xs text-[#1d68ff] font-medium hover:underline flex items-center gap-1"
                onClick={onClose}
              >
                <span>Full Page Editor &rarr;</span>
              </Link>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer"><XIcon /></button>
        </div>

        {loadingDetails && (
          <div className="mb-4 p-2.5 rounded-xl bg-blue-50 text-[#1d68ff] text-xs font-medium flex items-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading full product details...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className={labelCls}>Product Name *</label>
            <input required placeholder="e.g. Samsung Galaxy A55 5G or Paracetamol" className={inputCls} {...field("name")} />
          </div>

          {/* Category + Subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Category *</label>
              <input required placeholder="e.g. medicine" className={inputCls} {...field("category")} />
            </div>
            <div>
              <label className={labelCls}>Subcategory</label>
              <input placeholder="e.g. sub, pain relief" className={inputCls} {...field("subcategory")} />
            </div>
          </div>

          {/* Price + Original Price + Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Price (₦) *</label>
              <input required placeholder="420000.00" className={inputCls} {...field("price")} />
            </div>
            <div>
              <label className={labelCls}>Original Price (₦)</label>
              <input placeholder="450000.00" className={inputCls} {...field("original_price")} />
            </div>
            <div>
              <label className={labelCls}>Stock Quantity *</label>
              <input
                required type="number" min={0} placeholder="25"
                value={form.stock}
                onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                className={inputCls}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea rows={3} placeholder="Detailed product description..." className={inputCls} {...field("description")} />
          </div>

          {/* Images */}
          <div>
            <label className={labelCls}>Image URLs (Image 1 is Primary)</label>
            <div className="grid grid-cols-2 gap-3">
              {(["image", "image2", "image3", "image4"] as const).map((k, i) => (
                <input key={k} placeholder={`Image ${i + 1} URL`} className={inputCls} {...field(k)} />
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls}>Specifications</label>
              <button type="button" onClick={addSpec} className="text-xs font-medium text-[#1d68ff] hover:underline flex items-center gap-1 cursor-pointer">
                <PlusIcon /> Add Row
              </button>
            </div>
            <div className="space-y-2">
              {form.specifications.map((spec, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    placeholder="Name (e.g. Brand)" value={spec.name}
                    onChange={(e) => updateSpec(i, "name", e.target.value)}
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none focus:border-[#1d68ff] ${base}`}
                  />
                  <input
                    placeholder="Value (e.g. Samsung)" value={spec.value}
                    onChange={(e) => updateSpec(i, "value", e.target.value)}
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none focus:border-[#1d68ff] ${base}`}
                  />
                  <button type="button" onClick={() => removeSpec(i)} className="text-gray-400 hover:text-red-500 shrink-0 cursor-pointer">
                    <XIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex justify-end gap-3 pt-2 border-t ${darkMode ? "border-[#505050]" : "border-[#E8E8E8]"}`}>
            <button type="button" onClick={onClose} className={`px-5 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${darkMode ? "border-[#505050] text-white hover:bg-[#505050]" : "border-[#E8E8E8] text-[#282828] hover:bg-gray-50"}`}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-[#1d68ff] hover:bg-[#1656d6] text-white text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
              {saving ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────── Delete Confirm ─────────────────────── */

function DeleteModal({ darkMode, name, onCancel, onConfirm, loading }: {
  darkMode: boolean; name: string;
  onCancel: () => void; onConfirm: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${darkMode ? "bg-[#282828] border-[#505050]" : "bg-white border-[#E8E8E8]"}`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto mb-4 text-red-600">
          <TrashIcon />
        </div>
        <h3 className={`text-sm font-bold text-center mb-1 ${darkMode ? "text-white" : "text-[#282828]"}`}>Delete Product?</h3>
        <p className="text-xs text-gray-500 text-center mb-5">&ldquo;{name}&rdquo; will be permanently deleted. This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${darkMode ? "border-[#505050] text-white hover:bg-[#505050]" : "border-[#E8E8E8] text-[#282828] hover:bg-gray-50"}`}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer">
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Stat Card ─────────────────────── */

function StatCard({ label, value, sub, blue }: { label: string; value: string | number; sub: string; blue?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 shadow-sm ${blue ? "bg-[#1d68ff] text-white" : "bg-white border border-[#E8E8E8] text-[#282828]"}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className={`mt-4 text-3xl font-semibold ${blue ? "" : "text-[#1d68ff]"}`}>{value}</p>
      <p className={`mt-1 text-[11px] ${blue ? "text-white/80" : "text-gray-500"}`}>{sub}</p>
    </div>
  );
}

/* ─────────────────────── Category Tab ─────────────────────── */

function CategoryTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${active ? "bg-blue-100 text-[#1d68ff]" : "text-gray-600 hover:bg-gray-50"}`}
    >
      {label}
    </button>
  );
}

/* ─────────────────────── Main Page ─────────────────────── */

export default function AdminProductsPage() {
  const { darkMode } = useAdmin();

  /* ── product list state (using public endpoint) ── */
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  /* ── stats ── */
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  /* ── modals ── */
  const [modal, setModal] = useState<{ mode: "create" | "edit"; data: FormData; id?: number } | null>(null);
  const [modalLoadingDetails, setModalLoadingDetails] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BackendProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toasts, push: toast } = useToast();

  /* ── derived categories from loaded products ── */
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(cats)];
  }, [products]);

  /* ── filtered by category tab (client-side) ── */
  const displayed = useMemo(() => {
    if (categoryFilter === "All") return products;
    return products.filter((p) => p.category === categoryFilter);
  }, [products, categoryFilter]);

  /* ── fetch stats from admin endpoint ── */
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/gload/products/stats");
      if (res.status === 401) {
        window.location.href = "/glopharm/login?session_expired=1";
        return;
      }
      const json = await res.json();
      if (json?.data) setStats(json.data as ProductStats);
    } catch { /* non-critical */ }
    finally { setStatsLoading(false); }
  }, []);

  /* ── fetch products from the SAME public endpoint as /products page ── */
  const fetchProducts = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (p > 1) params.set("page", String(p));
      params.set("_t", String(Date.now()));

      const url = `/api/ecommerce/products?${params.toString()}`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) { setError(json?.message ?? "Failed to load products."); return; }

      const results = json.data?.results ?? (Array.isArray(json.data) ? json.data : []);
      setProducts(results);
      setTotalCount(json.data?.count ?? results.length);
      setHasNext(Boolean(json.data?.next));
      setHasPrev(Boolean(json.data?.previous));
    } catch { setError("Unable to connect to server."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchProducts(page, search); }, [fetchProducts, page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setCategoryFilter("All");
    setSearch(searchInput);
  };

  /* ── handle edit click with full detail fetching ── */
  const handleEditClick = async (p: BackendProduct) => {
    // Open immediately with what we have from table row
    setModal({
      mode: "edit",
      id: p.id,
      data: {
        name: p.name,
        image: p.image || "",
        image2: "",
        image3: "",
        image4: "",
        category: p.category || "medicine",
        subcategory: p.subcategory || "",
        description: "",
        original_price: p.original_price || p.price,
        price: p.price,
        stock: p.stock,
        specifications: [{ name: "", value: "" }],
      },
    });

    // Fetch full details (images 2-4, description, specs)
    setModalLoadingDetails(true);
    try {
      const res = await fetch(`/api/ecommerce/products/${p.id}`);
      const json = await res.json();
      if (res.ok && json.data) {
        const d = json.data;
        setModal((prev) => {
          if (!prev || prev.id !== p.id) return prev;
          return {
            ...prev,
            data: {
              name: d.name || p.name,
              image: d.image || p.image || "",
              image2: d.image2 || "",
              image3: d.image3 || "",
              image4: d.image4 || "",
              category: d.category || p.category || "medicine",
              subcategory: d.subcategory || p.subcategory || "",
              description: d.description || "",
              original_price: d.original_price || p.original_price || p.price,
              price: d.price || p.price,
              stock: typeof d.stock === "number" ? d.stock : p.stock,
              specifications:
                Array.isArray(d.specifications) && d.specifications.length > 0
                  ? d.specifications.map((s: { name: string; value: string }) => ({
                      name: s.name,
                      value: s.value,
                    }))
                  : [{ name: "", value: "" }],
            },
          };
        });
      }
    } catch {
      // Keep row data if detail fetch fails
    } finally {
      setModalLoadingDetails(false);
    }
  };

  /* ── create / edit via admin endpoint ── */
  const handleSave = async (data: FormData) => {
    const isEdit = modal?.mode === "edit" && modal.id !== undefined;
    const url = isEdit ? `/api/gload/products/${modal!.id}` : "/api/gload/products";
    const method = isEdit ? "PATCH" : "POST";

    const payload = {
      ...data,
      category: data.category.toLowerCase().trim(),
      specifications: data.specifications.filter((s) => s.name.trim() && s.value.trim()),
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) {
      window.location.href = "/glopharm/login?session_expired=1";
      return;
    }
    const json = await res.json();

    if (!res.ok) { toast(json?.message ?? "Failed to save product.", "error"); return; }

    toast(isEdit ? "Product updated successfully!" : "Product created successfully!");
    setModal(null);

    // Optimistically update products table immediately
    if (isEdit && modal?.id) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === modal.id
            ? {
                ...item,
                name: payload.name,
                image: payload.image || item.image,
                category: payload.category,
                subcategory: payload.subcategory,
                price: payload.price,
                original_price: payload.original_price,
                stock: payload.stock,
              }
            : item
        )
      );
    } else if (json.data && typeof json.data === "object" && "id" in json.data) {
      setProducts((prev) => [json.data as BackendProduct, ...prev]);
    }

    fetchStats();
    fetchProducts(page, search);
  };

  /* ── delete via admin endpoint ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/gload/products/${deleteTarget.id}`, { method: "DELETE" });
      if (res.status === 401) {
        window.location.href = "/glopharm/login?session_expired=1";
        return;
      }
      const json = await res.json();
      if (!res.ok) { toast(json?.message ?? "Failed to delete.", "error"); return; }
      toast("Product deleted!");
      setDeleteTarget(null);
      const nextPage = products.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      fetchStats();
      fetchProducts(nextPage, search);
    } finally { setDeleting(false); }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / 10));
  const card = darkMode ? "bg-[#383838] border-[#505050]" : "bg-white border-[#E8E8E8]";
  const txt = darkMode ? "text-white" : "text-[#282828]";
  const subTxt = darkMode ? "text-[#B8B8B8]" : "text-[#888888]";

  return (
    <>
      <ToastStack toasts={toasts} />

      {modal && (
        <ProductModal
          darkMode={darkMode}
          mode={modal.mode}
          id={modal.id}
          initial={modal.data}
          loadingDetails={modalLoadingDetails}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          darkMode={darkMode}
          name={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}

      <div className="space-y-6">
        {/* Breadcrumb */}
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${txt}`}>Products</h1>
          <nav className={`mt-1 flex items-center gap-2 text-xs ${subTxt}`}>
            <span>Dashboard</span><CaretRight />
            <span className="font-medium text-[#1d68ff]">Products</span>
          </nav>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`rounded-2xl border p-5 animate-pulse h-28 ${card}`} />
              ))
            : stats
            ? <>
                <StatCard blue label="Total Products" value={stats.total_products} sub="Across all categories" />
                <StatCard label="In Stock" value={stats.in_stock} sub="Products available" />
                <StatCard label="Out of Stock" value={stats.out_of_stock} sub="Need restocking" />
                <StatCard
                  label="Catalog Value"
                  value={`₦${Number(stats.catalog_value).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                  sub="Total inventory value"
                />
              </>
            : <p className="col-span-4 text-xs text-gray-500">Could not load stats.</p>
          }
        </div>

        {/* Table card */}
        <section className={`rounded-2xl border shadow-sm p-5 ${card}`}>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
              <div className="relative flex-1">
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products…"
                  className={`w-full rounded-full border py-2 pl-4 pr-10 text-xs outline-none placeholder:text-gray-400 focus:border-[#1d68ff] focus:ring-2 focus:ring-blue-100 ${darkMode ? "bg-[#505050] border-[#666] text-white" : "bg-white border-[#E8E8E8] text-[#282828]"}`}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </span>
              </div>
              <button type="submit" className="rounded-full bg-[#1d68ff] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1656d6] cursor-pointer">
                Search
              </button>
            </form>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setModal({ mode: "create", data: EMPTY_FORM })}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Quick Add
              </button>
              <Link
                href="/glopharm/products/new"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1d68ff] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#1656d6] cursor-pointer"
              >
                <PlusIcon /> Add Product
              </Link>
            </div>
          </div>

          {/* Category tabs */}
          {!loading && categories.length > 1 && (
            <div className={`mt-4 flex overflow-x-auto rounded-xl border p-1 gap-1 ${darkMode ? "border-[#505050]" : "border-[#E8E8E8]"}`}>
              {categories.map((cat) => (
                <CategoryTab
                  key={cat}
                  label={cat}
                  active={categoryFilter === cat}
                  onClick={() => setCategoryFilter(cat)}
                />
              ))}
            </div>
          )}

          {/* Table */}
          <div className={`mt-4 overflow-x-auto rounded-xl border ${darkMode ? "border-[#505050]" : "border-[#E8E8E8]"}`}>
            <table className="w-full min-w-[700px] border-collapse">
              <thead className={darkMode ? "bg-[#505050]" : "bg-gray-100"}>
                <tr>
                  {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                    <th key={h} className={`px-4 py-3.5 text-left text-xs font-semibold ${txt}`}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody className={`divide-y ${darkMode ? "divide-[#505050]" : "divide-gray-100"}`}>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-red-500">{error}</td>
                  </tr>
                ) : displayed.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                      No products found.{" "}
                      <Link href="/glopharm/products/new" className="text-[#1d68ff] underline">
                        Add the first one
                      </Link>
                    </td>
                  </tr>
                ) : (
                  displayed.map((p) => {
                    const inStock = p.stock > 0;
                    return (
                      <tr key={p.id} className={`transition-colors ${darkMode ? "hover:bg-[#505050]/50" : "hover:bg-gray-50/70"}`}>
                        {/* Product */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.image || "/placeholder.png"}
                              alt={p.name}
                              className="h-10 w-10 shrink-0 rounded-lg border border-gray-200 bg-gray-50 object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
                            />
                            <div className="min-w-0">
                              <p className={`max-w-[180px] truncate text-xs font-semibold ${txt}`} title={p.name}>{p.name}</p>
                              <p className="text-[11px] text-gray-400">{p.subcategory}</p>
                            </div>
                          </div>
                        </td>
                        {/* Category */}
                        <td className={`px-4 py-3 text-xs capitalize ${txt}`}>{p.category}</td>
                        {/* Price */}
                        <td className={`px-4 py-3 text-xs whitespace-nowrap ${txt}`}>
                          ₦{Number(p.price).toLocaleString("en-NG")}
                          {p.original_price && Number(p.original_price) > Number(p.price) && (
                            <span className="ml-1 text-gray-400 line-through text-[10px]">
                              ₦{Number(p.original_price).toLocaleString("en-NG")}
                            </span>
                          )}
                        </td>
                        {/* Stock */}
                        <td className={`px-4 py-3 text-xs ${txt}`}>{p.stock}</td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-medium ${inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                            {inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 text-gray-500">
                            <button
                              aria-label="Edit product"
                              onClick={() => handleEditClick(p)}
                              className="hover:text-[#1d68ff] transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <EditIcon />
                            </button>
                            <button
                              aria-label="Delete product"
                              onClick={() => setDeleteTarget(p)}
                              className="hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && !error && totalCount > 0 && (
            <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 text-xs ${subTxt}`}>
              <p>
                Page <span className="font-semibold text-[#1d68ff]">{page}</span> of {totalPages}
                {" "}&bull; {totalCount} product{totalCount !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrev}
                  aria-label="Previous page"
                  className="rounded-md border border-[#E8E8E8] p-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  if (pg < 1 || pg > totalPages) return null;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`min-w-[28px] rounded-md border px-2 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                        pg === page
                          ? "border-[#1d68ff] bg-[#1d68ff] text-white"
                          : darkMode ? "border-[#505050] hover:bg-[#505050]" : "border-[#E8E8E8] hover:bg-gray-50"
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext}
                  aria-label="Next page"
                  className="rounded-md border border-[#E8E8E8] p-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
