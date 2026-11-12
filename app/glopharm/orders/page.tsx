"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

/* ------------------------------- Types & data ------------------------------ */

type Product = {
    id: string;
    title: string;
    description: string;
    price: string;
    currency: string;
    image: string;
    initialQuantity: number;
};

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

type Payment = "Paid" | "Unpaid";
type OrderStatus = "Pending" | "Shipping" | "Completed" | "Cancelled";

type LineItem = {
    sku: string;
    name: string;
    price: number;
    qty: number;
    disc: number; // percent
    total: number;
};

type Order = {
    orderId: string;
    product: Product; // first product, used for the thumbnail
    customer: string;
    priceNum: number; // order total
    ts: number;
    payment: Payment;
    status: OrderStatus;
    items: LineItem[];
    subtotal: number;
    shipping: number;
    discount: number;
};

/* Demo-only order data built from the sample products. */
const CUSTOMERS = ["Leslie Alexander", "Esther Howard", "Cameron Williamson", "Jenny Wilson", "Robert Fox", "Kristin Watson"];
const PAYMENTS: Payment[] = ["Paid", "Unpaid", "Paid", "Paid", "Unpaid", "Paid", "Unpaid", "Paid", "Paid", "Unpaid", "Paid", "Unpaid"];

const SHIPPING_FEE = 1500;
const DISCOUNTS = [5, 0, 10];
const PAID_STATUSES: OrderStatus[] = ["Shipping", "Completed", "Pending"];

const buildOrders = (): Order[] =>
    MEDICAL_PRODUCTS.map((p, i) => {
        const payment = PAYMENTS[i % PAYMENTS.length];
        const status: OrderStatus = payment === "Unpaid" ? "Cancelled" : PAID_STATUSES[i % PAID_STATUSES.length];

        // 1–3 line items per order (the first is always the order's own product)
        const items: LineItem[] = Array.from({ length: (i % 3) + 1 }, (_, k) => {
            const idx = (i + k * 5) % MEDICAL_PRODUCTS.length;
            const prod = MEDICAL_PRODUCTS[idx];
            const price = Number(prod.price.replace(/,/g, ""));
            const qty = (k % 2) + 1;
            const disc = DISCOUNTS[(i + k) % DISCOUNTS.length];
            return { sku: `#${6548 + idx}`, name: prod.title, price, qty, disc, total: price * qty * (1 - disc / 100) };
        });

        const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
        const discount = items.reduce((s, it) => s + it.price * it.qty * (it.disc / 100), 0);

        return {
            orderId: `0212${31 + i}`,
            product: p,
            customer: CUSTOMERS[i % CUSTOMERS.length],
            priceNum: subtotal - discount + SHIPPING_FEE,
            ts: new Date(2026, 9, 20 + i).getTime(),
            payment,
            status,
            items,
            subtotal,
            shipping: SHIPPING_FEE,
            discount,
        };
    });

const TABS = ["All Orders", "Shipping", "Completed", "Cancel"] as const;
type Tab = (typeof TABS)[number];
const TAB_STATUS: Record<Exclude<Tab, "All Orders">, OrderStatus> = {
    Shipping: "Shipping",
    Completed: "Completed",
    Cancel: "Cancelled",
};

type SortKey = "orderId" | "customer" | "priceNum" | "ts";
const PAGE_SIZE = 8;

const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
const money = (n: number) =>
    `₦${new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
const fmtPrice = (o: Order) => money(o.priceNum);

const esc = (s: string) =>
    s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

/** Opens a clean print window with just this order's details. */
function printOrder(o: Order) {
    const w = window.open("", "_blank", "width=860,height=640");
    if (!w) return;
    const rows = o.items
        .map(
            (it, i) =>
                `<tr><td>${i + 1}</td><td>${esc(it.sku)}</td><td><b>${esc(it.name)}</b></td><td>${money(it.price)}</td><td>x${it.qty}</td><td>${it.disc}%</td><td>${money(it.total)}</td></tr>`
        )
        .join("");
    w.document.write(`<!doctype html><html><head><title>Order ${esc(o.orderId)}</title>
<style>
  body{font-family:system-ui,sans-serif;padding:32px;font-size:13px;color:#111}
  h2{margin:0 0 4px} p{margin:0 0 16px;color:#555}
  table{width:100%;border-collapse:collapse} th,td{text-align:left;padding:10px 8px;border-bottom:1px solid #dbe4ff}
  th{font-size:11px;text-transform:uppercase;color:#666}
  .sum{margin:16px 0 0 auto;width:280px} .sum div{display:flex;justify-content:space-between;padding:4px 0}
  .red{color:#dc2626}
</style></head><body>
  <h2>Order #${esc(o.orderId)}</h2>
  <p>${esc(o.customer)} · ${fmtDate(o.ts)} · ${o.status}</p>
  <table><thead><tr><th>#</th><th>SKU</th><th>Name</th><th>Price</th><th>Qty</th><th>Disc.</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="sum">
    <div><span>Subtotal</span><span>${money(o.subtotal)}</span></div>
    <div><span>Shipping</span><span>${money(o.shipping)}</span></div>
    <div class="red"><span>Discount</span><span>${money(o.discount)}</span></div>
    <div><b>Total</b><b>${money(o.priceNum)}</b></div>
  </div>
</body></html>`);
    w.document.close();
    w.focus();
    w.print();
}

/* --------------------------------- Icons ---------------------------------- */

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
const ChevronDown = () => (<Svg><path d="m6 9 6 6 6-6" /></Svg>);
const ChevronUp = () => (<Svg><path d="m18 15-6-6-6 6" /></Svg>);
const CaretRight = () => (<svg viewBox="0 0 8 10" className="h-2.5 w-2 fill-current" aria-hidden><path d="M0 0l8 5-8 5z" /></svg>);

const SortCaret = ({ active, dir }: { active: boolean; dir: "asc" | "desc" }) => (
    <span className="ml-1.5 inline-flex flex-col gap-[2px]">
        <svg viewBox="0 0 8 5" className={`h-[5px] w-2 ${active && dir === "asc" ? "fill-gray-800" : "fill-gray-400"}`}><path d="M4 0l4 5H0z" /></svg>
        <svg viewBox="0 0 8 5" className={`h-[5px] w-2 ${active && dir === "desc" ? "fill-gray-800" : "fill-gray-400"}`}><path d="M4 5 0 0h8z" /></svg>
    </span>
);

const FilterCaret = () => (
    <svg viewBox="0 0 24 24" className="ml-1.5 inline h-3 w-3 text-gray-400" fill="currentColor" aria-hidden>
        <path d="M3 4h18l-7 8v7l-4 2v-9Z" />
    </svg>
);

/* --------------------------------- Badges --------------------------------- */

const PAYMENT_STYLE: Record<Payment, string> = {
    Paid: "bg-lime-200 text-lime-800",
    Unpaid: "bg-yellow-100 text-yellow-700",
};
/** The 4 delivery statuses offered in the Edit dropdown. */
const STATUS_OPTIONS: OrderStatus[] = ["Pending", "Shipping", "Completed", "Cancelled"];

const STATUS_STYLE: Record<OrderStatus, string> = {
    Pending: "bg-sky-100 text-sky-700",
    Shipping: "bg-purple-200 text-purple-700",
    Completed: "bg-green-200 text-green-800",
    Cancelled: "bg-orange-200 text-orange-700",
};

const Badge = ({ className, children }: { className: string; children: React.ReactNode }) => (
    <span className={`inline-block whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-medium ${className}`}>{children}</span>
);

function Actions({
    viewing,
    editing,
    onView,
    onEdit,
    onDelete,
}: {
    viewing: boolean;
    editing: boolean;
    onView: () => void;
    onEdit: (rect: DOMRect) => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex items-center gap-3.5 text-gray-600">
            <button
                aria-label="View order details"
                aria-pressed={viewing}
                onClick={onView}
                className={`hover:text-blue-600 ${viewing ? "text-blue-600" : ""}`}
            >
                <EyeIcon />
            </button>
            <button
                aria-label="Change delivery status"
                aria-haspopup="menu"
                aria-expanded={editing}
                onClick={(e) => onEdit(e.currentTarget.getBoundingClientRect())}
                className={`hover:text-blue-600 ${editing ? "text-blue-600" : ""}`}
            >
                <EditIcon />
            </button>
            <button aria-label="Delete" onClick={onDelete} className="hover:text-red-600"><TrashIcon /></button>
        </div>
    );
}

const DETAIL_COLS = "grid grid-cols-[28px_90px_minmax(160px,1.6fr)_1fr_56px_56px_1fr_72px] gap-x-2";

function OrderDetails({ o }: { o: Order }) {
    return (
        <div className="overflow-x-auto bg-gray-50/70">
            <div className="min-w-[640px] px-4 text-xs sm:px-6">
                {/* Header */}
                <div className={`${DETAIL_COLS} items-center border-b border-blue-100 py-2.5 text-[10px] font-medium uppercase tracking-wide text-gray-500`}>
                    <span>#</span>
                    <span>SKU</span>
                    <span>Name</span>
                    <span>Price</span>
                    <span>Qty</span>
                    <span>Disc.</span>
                    <span>Total</span>
                    <button
                        onClick={() => printOrder(o)}
                        className="flex items-center justify-end gap-1 uppercase text-gray-500 hover:text-blue-600"
                    >
                        <Svg className="h-3.5 w-3.5">
                            <path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z" />
                        </Svg>
                        Print
                    </button>
                </div>

                {/* Line items */}
                {o.items.map((it, idx) => (
                    <div key={`${it.sku}-${idx}`} className={`${DETAIL_COLS} items-center border-b border-blue-100 py-3.5 text-gray-800`}>
                        <span className="text-gray-500">{idx + 1}</span>
                        <span className="text-gray-600">{it.sku}</span>
                        <span className="truncate pr-2 font-semibold" title={it.name}>{it.name}</span>
                        <span>{money(it.price)}</span>
                        <span>x{it.qty}</span>
                        <span className={it.disc > 0 ? "text-red-500" : "text-gray-400"}>{it.disc}%</span>
                        <span>{money(it.total)}</span>
                        <button aria-label="More options" className="justify-self-end pr-3 text-base font-bold leading-none tracking-widest text-gray-800 hover:text-blue-600">
                            •••
                        </button>
                    </div>
                ))}

                {/* Summary */}
                <div className="pb-4 pt-3 text-gray-800">
                    <div className={`${DETAIL_COLS} py-1.5`}>
                        <span className="col-span-2 col-start-5 text-gray-500">Subtotal</span>
                        <span className="col-start-7">{money(o.subtotal)}</span>
                    </div>
                    <div className={`${DETAIL_COLS} py-1.5`}>
                        <span className="col-span-2 col-start-5 text-gray-500">Shipping</span>
                        <span className="col-start-7">{money(o.shipping)}</span>
                    </div>
                    <div className={`${DETAIL_COLS} py-1.5`}>
                        <span className="col-span-2 col-start-5 text-gray-500">Discount</span>
                        <span className="col-start-7 text-red-500">{money(o.discount)}</span>
                    </div>
                    <div className={`${DETAIL_COLS} py-1.5`}>
                        <span className="col-span-2 col-start-5 text-gray-500">Total</span>
                        <span className="col-start-7 font-bold">{money(o.priceNum)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrderCell({ o }: { o: Order }) {
    return (
        <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={o.product.image} alt={o.product.title} className="h-10 w-10 shrink-0 rounded-md border border-gray-200 bg-gray-50 object-cover" />
            <div className="min-w-0">
                <a href="#" className="text-[11px] font-medium text-blue-600 hover:underline">{o.orderId}</a>
                <p className="max-w-[220px] truncate text-xs font-medium text-gray-800" title={o.product.description}>
                    {o.product.title}
                </p>
            </div>
        </div>
    );
}

/* ---------------------------------- Page ---------------------------------- */

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>(buildOrders);
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState<Tab>("All Orders");
    const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" } | null>(null);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [open, setOpen] = useState<Set<string>>(new Set()); // expanded rows (mobile)
    const [viewing, setViewing] = useState<Set<string>>(new Set()); // rows showing order details
    const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null); // status dropdown

    // Close the status dropdown on scroll / resize / Escape
    useEffect(() => {
        if (!menu) return;
        const close = () => setMenu(null);
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
            window.removeEventListener("keydown", onKey);
        };
    }, [menu]);

    const openMenu = (id: string, rect: DOMRect) => {
        const W = 192;
        const H = 210;
        const x = Math.max(8, Math.min(rect.right - W, window.innerWidth - W - 8));
        const below = rect.bottom + 6;
        const y = below + H > window.innerHeight ? Math.max(8, rect.top - H - 6) : below;
        setMenu({ id, x, y });
    };

    const changeStatus = (id: string, status: OrderStatus) => {
        setOrders((prev) => prev.map((o) => (o.orderId === id ? { ...o, status } : o)));
        setMenu(null);
    };

    const menuOrder = menu ? orders.find((o) => o.orderId === menu.id) : undefined;

    const tabCount = (t: Tab) =>
        t === "All Orders" ? orders.length : orders.filter((o) => o.status === TAB_STATUS[t]).length;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = orders.filter(
            (o) =>
                (tab === "All Orders" || o.status === TAB_STATUS[tab]) &&
                (!q ||
                    o.orderId.includes(q) ||
                    o.product.title.toLowerCase().includes(q) ||
                    o.customer.toLowerCase().includes(q))
        );
        if (sort) {
            const { key, dir } = sort;
            list = [...list].sort((a, b) => {
                const av = a[key];
                const bv = b[key];
                const res = av < bv ? -1 : av > bv ? 1 : 0;
                return dir === "asc" ? res : -res;
            });
        }
        return list;
    }, [orders, query, tab, sort]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    const visible = filtered.slice(start, start + PAGE_SIZE);
    const allSelected = visible.length > 0 && visible.every((o) => selected.has(o.orderId));

    const toggleSort = (key: SortKey) =>
        setSort((s) => (s?.key === key ? (s.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" }));

    const toggleIn = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) =>
        setter((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const toggleAll = () =>
        setSelected((prev) => {
            const next = new Set(prev);
            visible.forEach((o) => (allSelected ? next.delete(o.orderId) : next.add(o.orderId)));
            return next;
        });

    const deleteOrder = (id: string) => {
        setOrders((prev) => prev.filter((o) => o.orderId !== id));
        setSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const SortTh = ({ label, k }: { label: string; k: SortKey }) => (
        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700">
            <button onClick={() => toggleSort(k)} className="inline-flex items-center hover:text-gray-900">
                {label}
                <SortCaret active={sort?.key === k} dir={sort?.dir ?? "asc"} />
            </button>
        </th>
    );

    const tabLabel = tab === "All Orders" ? "All Orders" : tab;

    return (
        <div className="p-6">
            {/* Title + breadcrumb */}
            <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
            <nav className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>Dashboard</span>
                <CaretRight />
                <span>Orders</span>
                <CaretRight />
                <span className="font-medium text-blue-600">{tabLabel}</span>
            </nav>

            <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative hidden w-full max-w-sm md:block">
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search for iid, name product"
                            className="w-full rounded-full border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                            <SearchIcon />
                        </span>
                    </div>

                    {/* Tabs shown above the buttons on mobile */}
                    <div className="order-first w-full md:hidden">
                        <TabBar tab={tab} setTab={(t) => { setTab(t); setPage(1); }} count={tabCount} />
                    </div>

                    <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
                        <div className="flex items-center gap-3">
                            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50">
                                Filter <FilterIcon />
                            </button>
                            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50">
                                Export <ExportIcon />
                            </button>
                        </div>
                        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">
                            New Order <PlusIcon />
                        </button>
                    </div>
                </div>

                {/* Tabs (desktop) */}
                <div className="mt-4 hidden md:block">
                    <TabBar tab={tab} setTab={(t) => { setTab(t); setPage(1); }} count={tabCount} />
                </div>

                {/* ------------------------- Desktop table ------------------------- */}
                <div className="mt-4 hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
                    <table className="w-full min-w-[860px] border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="w-12 px-4 py-3.5">
                                    <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" className="h-4 w-4 rounded border-gray-300 accent-blue-600" />
                                </th>
                                <SortTh label="Orders" k="orderId" />
                                <SortTh label="Customer" k="customer" />
                                <SortTh label="Price" k="priceNum" />
                                <SortTh label="Date" k="ts" />
                                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700">Payment <FilterCaret /></th>
                                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700">Status <FilterCaret /></th>
                                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700">Action <FilterCaret /></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {visible.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">No orders found.</td>
                                </tr>
                            )}
                            {visible.map((o) => (
                                <Fragment key={o.orderId}>
                                    <tr className="hover:bg-gray-50/70">
                                        <td className="px-4 py-3">
                                            <input type="checkbox" checked={selected.has(o.orderId)} onChange={() => toggleIn(setSelected, o.orderId)} aria-label={`Select order ${o.orderId}`} className="h-4 w-4 rounded border-gray-300 accent-blue-600" />
                                        </td>
                                        <td className="px-4 py-3"><OrderCell o={o} /></td>
                                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-700">{o.customer}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-700">{fmtPrice(o)}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-700">{fmtDate(o.ts)}</td>
                                        <td className="px-4 py-3"><Badge className={PAYMENT_STYLE[o.payment]}>{o.payment}</Badge></td>
                                        <td className="px-4 py-3"><Badge className={STATUS_STYLE[o.status]}>{o.status}</Badge></td>
                                        <td className="px-4 py-3">
                                            <Actions
                                                viewing={viewing.has(o.orderId)}
                                                editing={menu?.id === o.orderId}
                                                onView={() => toggleIn(setViewing, o.orderId)}
                                                onEdit={(rect) => openMenu(o.orderId, rect)}
                                                onDelete={() => deleteOrder(o.orderId)}
                                            />
                                        </td>
                                    </tr>
                                    {viewing.has(o.orderId) && (
                                        <tr>
                                            <td colSpan={8} className="p-0">
                                                <OrderDetails o={o} />
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ------------------------- Mobile expandable list ------------------------- */}
                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 md:hidden">
                    <div className="flex items-center bg-gray-100 px-4 py-3 text-xs font-semibold text-gray-700">
                        <button onClick={() => toggleSort("orderId")} className="inline-flex items-center">
                            Order <SortCaret active={sort?.key === "orderId"} dir={sort?.dir ?? "asc"} />
                        </button>
                    </div>

                    {visible.length === 0 && <p className="px-4 py-10 text-center text-sm text-gray-500">No orders found.</p>}

                    <ul className="divide-y divide-gray-100">
                        {visible.map((o) => {
                            const isOpen = open.has(o.orderId);
                            return (
                                <li key={o.orderId} className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" checked={selected.has(o.orderId)} onChange={() => toggleIn(setSelected, o.orderId)} aria-label={`Select order ${o.orderId}`} className="h-4 w-4 shrink-0 rounded border-gray-300 accent-blue-600" />
                                        <div className="min-w-0 flex-1"><OrderCell o={o} /></div>
                                        <button
                                            onClick={() => toggleIn(setOpen, o.orderId)}
                                            aria-expanded={isOpen}
                                            aria-label={isOpen ? "Collapse" : "Expand"}
                                            className="rounded-md border border-gray-300 p-1 text-gray-700"
                                        >
                                            {isOpen ? <ChevronUp /> : <ChevronDown />}
                                        </button>
                                    </div>

                                    {isOpen && (
                                        <dl className="mt-3 grid grid-cols-[80px_1fr] items-center gap-y-3 pl-7 text-xs">
                                            <dt className="text-gray-500">Customer</dt><dd className="text-gray-800">{o.customer}</dd>
                                            <dt className="text-gray-500">Price</dt><dd className="text-gray-800">{fmtPrice(o)}</dd>
                                            <dt className="text-gray-500">Date</dt><dd className="text-gray-800">{fmtDate(o.ts)}</dd>
                                            <dt className="text-gray-500">Payment</dt><dd><Badge className={PAYMENT_STYLE[o.payment]}>{o.payment}</Badge></dd>
                                            <dt className="text-gray-500">Status</dt><dd><Badge className={STATUS_STYLE[o.status]}>{o.status}</Badge></dd>
                                            <dt className="text-gray-500">Action</dt>
                                            <dd>
                                                <Actions
                                                    viewing={viewing.has(o.orderId)}
                                                    editing={menu?.id === o.orderId}
                                                    onView={() => toggleIn(setViewing, o.orderId)}
                                                    onEdit={(rect) => openMenu(o.orderId, rect)}
                                                    onDelete={() => deleteOrder(o.orderId)}
                                                />
                                            </dd>
                                        </dl>
                                    )}

                                    {viewing.has(o.orderId) && (
                                        <div className="-mx-4 mt-3 border-t border-blue-100">
                                            <OrderDetails o={o} />
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Pagination */}
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
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
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

            {/* Delivery-status dropdown (fixed so it is never clipped by the table) */}
            {menu && menuOrder && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} />
                    <div
                        role="menu"
                        aria-label="Delivery status"
                        className="fixed z-50 w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
                        style={{ left: menu.x, top: menu.y }}
                    >
                        <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                            Delivery status
                        </p>
                        {STATUS_OPTIONS.map((s) => {
                            const active = menuOrder.status === s;
                            return (
                                <button
                                    key={s}
                                    role="menuitemradio"
                                    aria-checked={active}
                                    onClick={() => changeStatus(menuOrder.orderId, s)}
                                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left hover:bg-gray-50 ${active ? "bg-gray-50" : ""
                                        }`}
                                >
                                    <Badge className={STATUS_STYLE[s]}>{s}</Badge>
                                    {active && (
                                        <Svg className="h-4 w-4 text-blue-600">
                                            <path d="m5 12.5 4.5 4.5L19 7.5" />
                                        </Svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

/* ------------------------------ Tab bar (shared) ------------------------------ */

function TabBar({
    tab,
    setTab,
    count,
}: {
    tab: Tab;
    setTab: (t: Tab) => void;
    count: (t: Tab) => number;
}) {
    return (
        <div className="flex rounded-xl border border-gray-200 p-1">
            {TABS.map((t) => (
                <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex flex-1 flex-col items-center justify-center rounded-lg px-2 py-1.5 text-[11px] font-semibold leading-tight transition-colors md:flex-row md:gap-1 md:px-4 md:py-2 md:text-xs ${tab === t ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <span>{t}</span>
                    <span>({count(t)})</span>
                </button>
            ))}
        </div>
    );
}