"use client";

import { useMemo, useState } from "react";

/* ----------------------------- Types & data ----------------------------- */

type Product = {
    id: string;
    title: string;
    description: string;
    price: string;
    currency: string;
    image: string;
    initialQuantity: number;
};

type Category = "Supplements" | "Medicines" | "Devices" | "First Aid";

const MEDICAL_PRODUCTS: Product[] = [
    { id: "m1", title: "Vitamin C 1000mg Effervescent", description: "High potency daily immune support drink tablets with orange flavour.", price: "4,500", currency: "₦", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
    { id: "m2", title: "Multivitamin Daily Formula (30 caps)", description: "Comprehensive 30-in-1 vital supplement for all-day energy and wellness.", price: "8,500", currency: "₦", image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
    { id: "m3", title: "Cod Liver Oil Omega-3 (90 Caps)", description: "Premium deep-sea fish oil for heart, joint, and brain health.", price: "9,800", currency: "₦", image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
    { id: "m4", title: "Pain Relief Paracetamol Extra", description: "Fast-acting effective relief from headaches, body aches, and fever.", price: "1,500", currency: "₦", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
    { id: "m5", title: "Antiseptic Disinfectant Liquid (500ml)", description: "Hospital-grade antiseptic for personal hygiene and wound care.", price: "2,800", currency: "₦", image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
    { id: "m6", title: "Blood Pressure Monitor (Digital)", description: "Clinically validated automatic upper-arm blood pressure monitor with memory.", price: "45,000", currency: "₦", image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
    { id: "m7", title: "Zinc & Vitamin D3 Combo (60 tabs)", description: "Immune boosting mineral combo for daily wellness and bone strength.", price: "6,200", currency: "₦", image: "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
    { id: "m8", title: "First Aid Kit — Complete Set", description: "Comprehensive 50-piece first aid kit for home and office emergencies.", price: "18,000", currency: "₦", image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
    { id: "m9", title: "Hand Sanitizer Gel 70% (500ml)", description: "WHO-formula alcohol-based sanitizer that kills 99.9% of germs.", price: "2,200", currency: "₦", image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
    { id: "m10", title: "Glucometer Blood Sugar Test Kit", description: "Accurate digital blood glucose monitor with 25 test strips included.", price: "22,000", currency: "₦", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
    { id: "m11", title: "Probiotics Daily (30 capsules)", description: "Multi-strain probiotic formula for gut health and immune support.", price: "11,500", currency: "₦", image: "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
    { id: "m12", title: "Thermometer Digital Infrared", description: "Non-contact forehead thermometer with 1-second reading and fever alert.", price: "14,000", currency: "₦", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
];

/* Demo-only metadata (your sample data has no category / stock / date). */
const CATEGORY_BY_ID: Record<string, Category> = {
    m1: "Supplements", m2: "Supplements", m3: "Supplements", m7: "Supplements", m11: "Supplements",
    m4: "Medicines", m5: "Medicines", m9: "Medicines",
    m6: "Devices", m10: "Devices", m12: "Devices",
    m8: "First Aid",
};
const DEMO_STOCK: Record<string, number> = {
    m1: 234, m2: 0, m3: 120, m4: 480, m5: 0, m6: 18, m7: 96, m8: 0, m9: 310, m10: 42, m11: 0, m12: 27,
};

const TABS = ["All", "Supplements", "Medicines", "Devices", "First Aid"] as const;
type Tab = (typeof TABS)[number];
type SortKey = "title" | "price" | "qty" | "date";

type Row = Product & {
    category: Category;
    qty: number;
    date: string;
    priceNum: number;
};

const PAGE_SIZE = 8;

const toRows = (products: Product[]): Row[] =>
    products.map((p, i) => ({
        ...p,
        category: CATEGORY_BY_ID[p.id] ?? "Medicines",
        qty: DEMO_STOCK[p.id] ?? p.initialQuantity,
        date: `04/${String(10 + i).padStart(2, "0")}/26 at 8:25 PM`,
        priceNum: Number(p.price.replace(/,/g, "")),
    }));

/* -------------------------------- Icons --------------------------------- */

const Svg = ({ children, className = "h-4 w-4" }: { children: React.ReactNode; className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        {children}
    </svg>
);
const SearchIcon = () => (<Svg><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>);
const FilterIcon = () => (<Svg><path d="M4 6h16M7 12h10M10 18h4" /></Svg>);
const ExportIcon = () => (<Svg><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" /></Svg>);
const PlusIcon = () => (<Svg><path d="M12 5v14M5 12h14" /></Svg>);
const EyeIcon = () => (<Svg><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Svg>);
const EditIcon = () => (<Svg><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Svg>);
const TrashIcon = () => (<Svg><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" /></Svg>);
const ChevronLeft = () => (<Svg><path d="m15 18-6-6 6-6" /></Svg>);
const ChevronRight = () => (<Svg><path d="m9 18 6-6-6-6" /></Svg>);
const CaretRight = () => (<svg viewBox="0 0 8 10" className="h-2.5 w-2 fill-current"><path d="M0 0l8 5-8 5z" /></svg>);

const SortIcon = ({ active, dir }: { active: boolean; dir: "asc" | "desc" }) => (
    <span className="ml-1.5 inline-flex flex-col gap-[2px]">
        <svg viewBox="0 0 8 5" className={`h-[5px] w-2 ${active && dir === "asc" ? "fill-gray-800" : "fill-gray-400"}`}><path d="M4 0l4 5H0z" /></svg>
        <svg viewBox="0 0 8 5" className={`h-[5px] w-2 ${active && dir === "desc" ? "fill-gray-800" : "fill-gray-400"}`}><path d="M4 5 0 0h8z" /></svg>
    </span>
);

/* ------------------------------- Component ------------------------------ */

export default function ProductPage() {
    const [rows, setRows] = useState<Row[]>(() => toRows(MEDICAL_PRODUCTS));
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState<Tab>("All");
    const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" } | null>(null);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const tabCount = (t: Tab) => (t === "All" ? rows.length : rows.filter((r) => r.category === t).length);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = rows.filter(
            (r) =>
                (tab === "All" || r.category === tab) &&
                (!q || r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q))
        );
        if (sort) {
            const { key, dir } = sort;
            list = [...list].sort((a, b) => {
                const av = key === "price" ? a.priceNum : key === "qty" ? a.qty : key === "date" ? a.date : a.title;
                const bv = key === "price" ? b.priceNum : key === "qty" ? b.qty : key === "date" ? b.date : b.title;
                const res = av < bv ? -1 : av > bv ? 1 : 0;
                return dir === "asc" ? res : -res;
            });
        }
        return list;
    }, [rows, query, tab, sort]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    const visible = filtered.slice(start, start + PAGE_SIZE);
    const allVisibleSelected = visible.length > 0 && visible.every((r) => selected.has(r.id));

    const toggleSort = (key: SortKey) =>
        setSort((s) => (s?.key === key ? (s.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" }));

    const toggleRow = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const toggleAllVisible = () =>
        setSelected((prev) => {
            const next = new Set(prev);
            visible.forEach((r) => (allVisibleSelected ? next.delete(r.id) : next.add(r.id)));
            return next;
        });

    const deleteRow = (id: string) => {
        setRows((prev) => prev.filter((r) => r.id !== id));
        setSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const Th = ({ label, sortKey, className = "" }: { label: string; sortKey?: SortKey; className?: string }) => (
        <th className={`px-4 py-3.5 text-left text-xs font-semibold text-gray-700 ${className}`}>
            {sortKey ? (
                <button onClick={() => toggleSort(sortKey)} className="inline-flex items-center hover:text-gray-900">
                    {label}
                    <SortIcon active={sort?.key === sortKey} dir={sort?.dir ?? "asc"} />
                </button>
            ) : (
                label
            )}
        </th>
    );

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            {/* Page title + breadcrumb */}
            <h1 className="text-2xl font-semibold text-gray-900">Product</h1>
            <nav className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <span>Dashboard</span>
                <CaretRight />
                <span>Product</span>
                <CaretRight />
                <span className="font-medium text-blue-600">{tab === "All" ? "All Products" : tab}</span>
            </nav>

            {/* Stat cards */}
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-sm">
                    <p className="text-sm font-semibold">Total Products</p>
                    <p className="mt-4 text-3xl font-semibold">{rows.length}</p>
                    <p className="mt-1 text-[11px] text-white/80">Across all categories</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800">In Stock</p>
                    <p className="mt-4 text-3xl font-semibold text-blue-600">{rows.filter(r => r.qty > 0).length}</p>
                    <p className="mt-1 text-[11px] text-gray-500">Products available</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800">Out of Stock</p>
                    <p className="mt-4 text-3xl font-semibold text-blue-600">{rows.filter(r => r.qty === 0).length}</p>
                    <p className="mt-1 text-[11px] text-gray-500">Need restocking</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800">Catalog Value</p>
                    <p className="mt-4 text-3xl font-semibold text-blue-600">₦{rows.reduce((s, r) => s + r.priceNum * r.qty, 0).toLocaleString()}</p>
                    <p className="mt-1 text-[11px] text-gray-500">Total inventory value</p>
                </div>
            </div>

            {/* Card */}
            <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative w-full max-w-sm">
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search for id, name product"
                            className="w-full rounded-full border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                            <SearchIcon />
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50">
                            Filter <FilterIcon />
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50">
                            Export <ExportIcon />
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">
                            New Product <PlusIcon />
                        </button>
                    </div>
                </div>

                {/* Category tabs */}
                <div className="mt-4 flex overflow-x-auto rounded-xl border border-gray-200 p-1">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            onClick={() => {
                                setTab(t);
                                setPage(1);
                            }}
                            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tab === t ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {t} ({tabCount(t)})
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full min-w-[820px] border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="w-12 px-4 py-3.5">
                                    <input
                                        type="checkbox"
                                        checked={allVisibleSelected}
                                        onChange={toggleAllVisible}
                                        aria-label="Select all"
                                        className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                                    />
                                </th>
                                <Th label="Product" sortKey="title" />
                                <Th label="Price" sortKey="price" />
                                <Th label="Category" />
                                <Th label="QTY" sortKey="qty" />
                                <Th label="Date" sortKey="date" />
                                <Th label="Status" />
                                <Th label="Action" />
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {visible.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                                        No products found.
                                    </td>
                                </tr>
                            )}

                            {visible.map((r) => {
                                const inStock = r.qty > 0;
                                return (
                                    <tr key={r.id} className="hover:bg-gray-50/70">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selected.has(r.id)}
                                                onChange={() => toggleRow(r.id)}
                                                aria-label={`Select ${r.title}`}
                                                className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                                            />
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={r.image}
                                                    alt={r.title}
                                                    className="h-10 w-10 shrink-0 rounded-md border border-gray-200 bg-gray-50 object-cover"
                                                />
                                                <div className="min-w-0">
                                                    <a href="#" className="text-[11px] font-medium uppercase text-blue-600 hover:underline">
                                                        {r.id}
                                                    </a>
                                                    <p className="max-w-[240px] truncate text-xs font-medium text-gray-800" title={r.description}>
                                                        {r.title}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-700">
                                            {r.currency}
                                            {r.price}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-700">{r.category}</td>
                                        <td className="px-4 py-3 text-xs text-gray-700">{r.qty}</td>
                                        <td className="px-4 py-3 text-xs leading-snug text-gray-700">{r.date}</td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-medium ${inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                                                    }`}
                                            >
                                                {inStock ? "Available" : "Out of Stock"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3.5 text-gray-600">
                                                <button aria-label="View" className="hover:text-blue-600"><EyeIcon /></button>
                                                <button aria-label="Edit" className="hover:text-blue-600"><EditIcon /></button>
                                                <button aria-label="Delete" onClick={() => deleteRow(r.id)} className="hover:text-red-600">
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer / pagination */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
                    <p>
                        <span className="font-semibold text-blue-600">
                            {filtered.length === 0 ? 0 : start + 1} - {Math.min(start + PAGE_SIZE, filtered.length)}
                        </span>{" "}
                        of {filtered.length} Items
                    </p>

                    <div className="flex items-center gap-2">
                        <span>The page on</span>
                        <select
                            value={safePage}
                            onChange={(e) => setPage(Number(e.target.value))}
                            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                        >
                            {Array.from({ length: totalPages }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => setPage(Math.max(1, safePage - 1))}
                            disabled={safePage === 1}
                            aria-label="Previous page"
                            className="rounded-md border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft />
                        </button>
                        <button
                            onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                            disabled={safePage === totalPages}
                            aria-label="Next page"
                            className="rounded-md border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight />
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}