"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  ADD YOUR OWN MAP IMAGE: save it as public/images/customer-map.png          */
/*  (or change MAP_IMAGE below). A placeholder shows until it exists.          */
/* -------------------------------------------------------------------------- */
const MAP_IMAGE = "/images/customer-map.png";
const CURRENCY = "₦";

/* ------------------------------ Sample data ------------------------------ */

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
];

/* Demo sales numbers + status for the "Product Popular" table. */
const SALES: Record<string, { sales: number; status: "Success" | "Pending" | "Failed" }> = {
  m1: { sales: 3000, status: "Success" },
  m2: { sales: 2311, status: "Success" },
  m4: { sales: 2111, status: "Success" },
  m6: { sales: 1661, status: "Success" },
  m3: { sales: 1420, status: "Pending" },
  m5: { sales: 980, status: "Success" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const AVG_SALE = [175, 205, 240, 255, 300, 325, 339.091888, 285, 335, 330, 390, 430].map((n) => n * 1_000_000);
const AVG_ITEM = [150, 185, 155, 170, 215, 250, 211.411223, 205, 300, 335, 390, 340].map((n) => n * 1_000_000);
const CHART_MAX = 500_000_000;

const KPIS = [
  { label: "Total Customer", value: "5.000", trend: 1.5, up: true },
  { label: "Total Transactions", value: "12.000", trend: 3.6, up: true },
  { label: "Total Product", value: "5.000", trend: 1.5, up: false },
];

const GROWTH = [
  { label: "East Java", pct: 50, color: "bg-lime-400" },
  { label: "Kalimantan", pct: 50, color: "bg-blue-500" },
  { label: "Bali", pct: 65, color: "bg-blue-900" },
];

const fmt = (n: number) => new Intl.NumberFormat("en-NG").format(Math.round(n));

/* -------------------------------- Helpers -------------------------------- */

const CARD = "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm";

/** Smooth SVG path through points (Catmull-Rom → cubic Bézier). */
function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/* -------------------------------- Icons ---------------------------------- */

const ArrowUpRight = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

const Trend = ({ up, value, light = false }: { up: boolean; value: number; light?: boolean }) => (
  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${light ? "text-lime-300" : up ? "text-green-600" : "text-red-600"}`}>
    <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${up ? "" : "rotate-90"}`} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3 17 6-6 4 4 8-8M15 7h6v6" />
    </svg>
    {value}%
  </span>
);

const SortCaret = () => (
  <span className="ml-1.5 inline-flex flex-col gap-[2px] align-middle">
    <svg viewBox="0 0 8 5" className="h-[5px] w-2 fill-gray-400"><path d="M4 0l4 5H0z" /></svg>
    <svg viewBox="0 0 8 5" className="h-[5px] w-2 fill-gray-400"><path d="M4 5 0 0h8z" /></svg>
  </span>
);

const FilterCaret = () => (
  <svg viewBox="0 0 24 24" className="ml-1.5 inline h-3 w-3 text-gray-400" fill="currentColor" aria-hidden>
    <path d="M3 4h18l-7 8v7l-4 2v-9Z" />
  </svg>
);

function CardTitle({ children, action }: { children: ReactNode; action?: boolean }) {
  return (
    <div className="flex items-start justify-between">
      <h3 className="text-sm font-semibold leading-snug text-gray-800">{children}</h3>
      {action && (
        <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-800 hover:text-blue-600">
          Show All <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------ Sub-sections ------------------------------ */

function SalesTarget() {
  const progress = 231_032_444;
  const target = 500_000_000;
  const pct = Math.min(100, (progress / target) * 100);

  return (
    <div className={CARD}>
      <CardTitle>Sales Target</CardTitle>
      <div className="mt-4 flex items-end justify-between text-[11px] text-gray-500">
        <div>
          <p>In Progress</p>
          <p className="mt-0.5 text-sm font-semibold text-gray-900">
            {CURRENCY}
            {fmt(progress)}
          </p>
        </div>
        <div className="text-right">
          <p>Sales Target</p>
          <p className="mt-0.5 text-sm font-semibold text-gray-900">
            {CURRENCY}
            {fmt(target)}
          </p>
        </div>
      </div>

      <div className="relative mt-3 h-3.5 rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
        <span
          className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gray-300 shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SalesChart() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(6);

  const W = 600;
  const H = 220;
  const toPts = (data: number[]): [number, number][] =>
    data.map((v, i) => [(i / (data.length - 1)) * W, H - 12 - (v / CHART_MAX) * (H - 24)]);

  const greenPts = useMemo(() => toPts(AVG_SALE), []);
  const bluePts = useMemo(() => toPts(AVG_ITEM), []);

  const onMove = (clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - left) / width));
    setHover(Math.round(ratio * (MONTHS.length - 1)));
  };

  const xPct = hover === null ? 0 : (hover / (MONTHS.length - 1)) * 100;
  const tipLeft = Math.min(86, Math.max(14, xPct));

  return (
    <div className={CARD}>
      <CardTitle action>Your Sales this year</CardTitle>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] text-gray-600">
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-sm bg-lime-400" /> Average Sale Value
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-sm bg-blue-600" /> Average item persale
        </span>
      </div>

      <div
        ref={wrapRef}
        className="relative mt-4 h-56 cursor-crosshair"
        onMouseMove={(e) => onMove(e.clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onMouseLeave={() => setHover(6)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <path d={smoothPath(greenPts)} fill="none" stroke="#a3e635" strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={smoothPath(bluePts)} fill="none" stroke="#2563eb" strokeWidth={3} strokeDasharray="7 6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>

        {hover !== null && (
          <>
            <div className="absolute bottom-0 top-14 w-0.5 bg-blue-600" style={{ left: `${xPct}%` }} />
            <div className="absolute top-0 flex -translate-x-1/2 gap-2 whitespace-nowrap" style={{ left: `${tipLeft}%` }}>
              <div className="rounded-md border border-dashed border-blue-600 bg-white px-2 py-1 shadow-sm">
                <p className="text-[8px] text-gray-500">Average item persale</p>
                <p className="text-[11px] font-semibold text-gray-900">
                  {CURRENCY} {fmt(AVG_ITEM[hover])}
                </p>
              </div>
              <div className="rounded-md bg-lime-400 px-2 py-1 shadow-sm">
                <p className="text-[8px] text-gray-700">Average year value</p>
                <p className="text-[11px] font-semibold text-gray-900">
                  {CURRENCY} {fmt(AVG_SALE[hover])}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-gray-500">
        {MONTHS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

function KpiCards() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Highlighted revenue card */}
      <div className="flex min-h-[130px] flex-col justify-between rounded-2xl bg-blue-600 p-5 text-white shadow-sm">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold">Total Revenue</h3>
          <ArrowUpRight />
        </div>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-semibold tracking-tight">
            {CURRENCY}81.000
          </p>
          <div className="text-right">
            <Trend up value={10.6} light />
            <p className="text-[10px] text-white/80">From last week</p>
          </div>
        </div>
      </div>

      {KPIS.map((k) => (
        <div key={k.label} className="flex min-h-[130px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-gray-800">{k.label}</h3>
            <ArrowUpRight className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-semibold tracking-tight text-blue-600">{k.value}</p>
            <div className="text-right">
              <Trend up={k.up} value={k.trend} />
              <p className="text-[10px] text-gray-500">From last week</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PromoBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-700 p-6 text-white shadow-sm">
      <svg viewBox="0 0 100 100" className="absolute -right-6 -top-6 h-32 w-32 text-white/20" fill="currentColor" aria-hidden>
        <path d="M50 3 93 27v46L50 97 7 73V27Z" />
      </svg>
      <svg viewBox="0 0 100 100" className="absolute -bottom-12 right-10 h-40 w-40 text-white/10" fill="currentColor" aria-hidden>
        <path d="M50 3 93 27v46L50 97 7 73V27Z" />
      </svg>

      <div className="relative max-w-sm">
        <h3 className="text-2xl font-semibold">Increase your sales</h3>
        <p className="mt-2 text-[11px] leading-relaxed text-white/85">
          Discover the Proven Methods to Skyrocket Your Sales! Unleash the Potential of Your Business and Achieve Remarkable Growth.
          Whether you&apos;re a seasoned entrepreneur or just starting out.
        </p>
        <button className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50">
          Learn More
        </button>
      </div>
    </div>
  );
}

function CustomerGrowth() {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`${CARD} flex flex-col`}>
      <CardTitle action>
        Customer Growth
        <br />3 Province
      </CardTitle>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-gray-700">
        {GROWTH.map((g) => (
          <span key={g.label} className="flex items-center gap-1.5">
            <i className={`h-2.5 w-2.5 rounded-full ${g.color}`} />
            {g.label} (<b>{g.pct}%</b>)
          </span>
        ))}
      </div>

      <div className="mt-4 flex-1 overflow-hidden rounded-xl bg-gray-100">
        {!failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={MAP_IMAGE}
            alt="Customer growth map"
            onError={() => setFailed(true)}
            className="h-full min-h-[190px] w-full object-cover"
          />
        ) : (
          <div className="flex h-full min-h-[190px] flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 text-center text-xs text-gray-500">
            <span className="font-semibold text-gray-600">Add your map image</span>
            <span className="px-4">
              Save it as <code className="rounded bg-gray-200 px-1">public/images/customer-map.png</code>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductPopular() {
  const rows = MEDICAL_PRODUCTS.filter((p) => SALES[p.id])
    .map((p) => ({ ...p, ...SALES[p.id] }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4);

  const statusStyle = {
    Success: "bg-green-200 text-green-800",
    Pending: "bg-yellow-100 text-yellow-700",
    Failed: "bg-red-100 text-red-600",
  } as const;

  return (
    <div className={CARD}>
      <CardTitle action>Product Popular</CardTitle>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[520px] border-collapse">
          <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-3">Product <SortCaret /></th>
              <th className="px-4 py-3">Price <SortCaret /></th>
              <th className="px-4 py-3">Sales <FilterCaret /></th>
              <th className="px-4 py-3">Status <FilterCaret /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/70">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.image} alt={r.title} className="h-10 w-10 shrink-0 rounded-md border border-gray-200 object-cover" />
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase text-gray-500">{r.id}</p>
                      <p className="max-w-[200px] truncate text-xs font-medium text-gray-800" title={r.description}>
                        {r.title}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-gray-800">
                  {r.currency}
                  {r.price}
                </td>
                <td className="px-4 py-3 text-xs font-medium text-gray-800">{r.sales}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-md px-3 py-1 text-[11px] font-medium ${statusStyle[r.status]}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------- Page --------------------------------- */

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-xs text-gray-500">Dashboard</p>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Left: target + chart */}
        <div className="space-y-4 xl:col-span-7">
          <SalesTarget />
          <SalesChart />
        </div>

        {/* Right: KPI cards + banner */}
        <div className="space-y-4 xl:col-span-5">
          <KpiCards />
          <PromoBanner />
        </div>

        {/* Bottom row */}
        <div className="xl:col-span-4">
          <CustomerGrowth />
        </div>
        <div className="xl:col-span-8">
          <ProductPopular />
        </div>
      </div>
    </div>
  );
}