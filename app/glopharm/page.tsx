"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAdmin } from "./layout";

const CURRENCY = "₦";
const CARD = "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm";

const fmtMoney = (val: string | number) => {
  const n = typeof val === "number" ? val : parseFloat(val || "0");
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(isNaN(n) ? 0 : n);
};

/* ─────────────────────────── Types ─────────────────────────── */

interface DashboardStats {
  total_revenue: {
    value: string;
    change_percent: number | null;
    trend: string;
  };
  total_customers: {
    value: number;
    change_percent: number | null;
    trend: string;
  };
  total_transactions: {
    value: number;
    change_percent: number | null;
    trend: string;
  };
  total_products: {
    value: number;
    change_percent: number | null;
    trend: string;
  };
}

interface ChartPoint {
  date: string;
  label: string;
  revenue: string;
  transactions: number;
}

interface RevenueChartData {
  range: string;
  total_revenue: string;
  total_transactions: number;
  points: ChartPoint[];
}

interface PopularProduct {
  id: number;
  name: string;
  image: string;
  price: string;
  sales: number;
  stock: number;
  status: "success" | "danger" | "warning" | string;
  status_label: string;
}

/* ─────────────────────────── Helpers ─────────────────────────── */

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

const ArrowUpRight = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

const TrendBadge = ({ trend, val }: { trend: string; val: number | null }) => {
  const isUp = trend === "up" || (val !== null && val > 0);
  const isFlat = trend === "flat" || val === null;

  if (isFlat) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400">
        &mdash; Steady
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${isUp ? "text-green-600" : "text-red-600"}`}>
      <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${isUp ? "" : "rotate-90"}`} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 17 6-6 4 4 8-8M15 7h6v6" />
      </svg>
      {val !== null ? `${Math.abs(val)}%` : ""}
    </span>
  );
};

/* ─────────────────────────── Sub-Components ─────────────────────────── */

function SalesTarget({ totalRevenue }: { totalRevenue: number }) {
  const target = 1_000_000;
  const pct = Math.min(100, Math.max(2, (totalRevenue / target) * 100));

  return (
    <div className={CARD}>
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold leading-snug text-gray-800">Sales Target</h3>
        <span className="text-[11px] font-medium text-gray-400">Monthly goal</span>
      </div>

      <div className="mt-4 flex items-end justify-between text-[11px] text-gray-500">
        <div>
          <p>Current Revenue</p>
          <p className="mt-0.5 text-sm font-semibold text-gray-900">
            {CURRENCY}{fmtMoney(totalRevenue)}
          </p>
        </div>
        <div className="text-right">
          <p>Target Goal</p>
          <p className="mt-0.5 text-sm font-semibold text-gray-900">
            {CURRENCY}{fmtMoney(target)}
          </p>
        </div>
      </div>

      <div className="relative mt-3 h-3.5 rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        <span
          className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RevenueChartCard({
  chartData,
  chartRange,
  chartDate,
  onRangeChange,
  onDateChange,
  loading,
  error,
}: {
  chartData: RevenueChartData | null;
  chartRange: string;
  chartDate: string;
  onRangeChange: (r: string) => void;
  onDateChange: (d: string) => void;
  loading: boolean;
  error?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const points = chartData?.points || [];
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const W = 600;
  const H = 220;

  const maxRevenue = useMemo(() => {
    if (!points.length) return 10000;
    const maxVal = Math.max(...points.map((p) => parseFloat(p.revenue || "0")));
    return maxVal > 0 ? maxVal * 1.25 : 10000;
  }, [points]);

  const pts: [number, number][] = useMemo(() => {
    if (!points.length) return [];
    if (points.length === 1) {
      const rev = parseFloat(points[0].revenue || "0");
      const y = maxRevenue > 0 ? H - 16 - (rev / maxRevenue) * (H - 32) : H - 20;
      return [[0, y], [W, y]];
    }
    return points.map((p, i) => {
      const rev = parseFloat(p.revenue || "0");
      const x = (i / (points.length - 1)) * W;
      const y = H - 16 - (rev / maxRevenue) * (H - 32);
      return [x, isNaN(y) ? H - 20 : y];
    });
  }, [points, maxRevenue]);

  const linePath = useMemo(() => smoothPath(pts), [pts]);

  const onMove = (clientX: number) => {
    const el = wrapRef.current;
    if (!el || points.length === 0) return;
    const { left, width } = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - left) / width));
    setHoverIndex(Math.round(ratio * (points.length - 1)));
  };

  const xPct = hoverIndex === null || !points.length ? 0 : (hoverIndex / Math.max(1, points.length - 1)) * 100;
  const tipLeft = Math.min(84, Math.max(16, xPct));
  const activePt = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div className={CARD}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold leading-snug text-gray-800">Revenue Performance</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Total in period: <span className="font-bold text-[#1d68ff]">{CURRENCY}{fmtMoney(chartData?.total_revenue || 0)}</span> &bull; {chartData?.total_transactions || 0} transactions
            {chartDate && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Filtered: {chartDate}
              </span>
            )}
          </p>
        </div>

        {/* Range and Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Specific Date input */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200 text-xs">
            <label htmlFor="rev-date-picker" className="text-[11px] font-medium text-gray-500">
              Date:
            </label>
            <input
              id="rev-date-picker"
              type="date"
              value={chartDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="text-xs bg-transparent text-gray-700 outline-none cursor-pointer"
            />
            {chartDate && (
              <button
                type="button"
                onClick={() => onDateChange("")}
                className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer ml-1"
                title="Clear date and return to range"
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Range filter buttons - clicking any range automatically replaces/clears the date */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-[11px] font-semibold">
            {[
              { key: "week", label: "Week" },
              { key: "month", label: "Month" },
              { key: "year", label: "Year" },
            ].map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => onRangeChange(r.key)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${!chartDate && chartRange === r.key
                    ? "bg-white text-[#1d68ff] shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="relative mt-4 h-56 cursor-crosshair"
        onMouseMove={(e) => onMove(e.clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            Loading revenue data...
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-xs text-red-500">
            {error}
          </div>
        ) : points.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No transaction points in this period.
          </div>
        ) : (
          <>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
              <path d={linePath} fill="none" stroke="#1d68ff" strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              {/* Dots */}
              {pts.map(([x, y], idx) => (
                <circle key={idx} cx={x} cy={y} r={idx === hoverIndex ? 5 : 3.5} fill={idx === hoverIndex ? "#84cc16" : "#1d68ff"} stroke="#fff" strokeWidth={2} />
              ))}
            </svg>

            {activePt && (
              <>
                <div className="absolute bottom-0 top-10 w-0.5 bg-[#1d68ff]" style={{ left: `${xPct}%` }} />
                <div className="absolute top-0 flex -translate-x-1/2 gap-2 whitespace-nowrap z-10" style={{ left: `${tipLeft}%` }}>
                  <div className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 shadow-md">
                    <p className="text-[9px] text-gray-500">{activePt.date} ({activePt.label})</p>
                    <p className="text-xs font-bold text-gray-900">
                      {CURRENCY}{fmtMoney(activePt.revenue)}
                    </p>
                    <p className="text-[10px] text-[#1d68ff]">
                      {activePt.transactions} sale{activePt.transactions !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Axis labels */}
      <div className="mt-3 flex justify-between text-[10px] text-gray-400 overflow-x-hidden">
        {points.map((p, i) => (
          <span key={i} className="truncate px-1 text-center" style={{ width: `${100 / Math.max(1, points.length)}%` }}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function KpiCards({ stats }: { stats: DashboardStats | null }) {
  const rev = stats?.total_revenue?.value || "0.00";
  const cust = stats?.total_customers?.value ?? 0;
  const trans = stats?.total_transactions?.value ?? 0;
  const prod = stats?.total_products?.value ?? 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Total Revenue */}
      <div className="flex min-h-[130px] flex-col justify-between rounded-2xl bg-[#1d68ff] p-5 text-white shadow-sm">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold">Total Revenue</h3>
          <ArrowUpRight className="text-white/80" />
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight">
            {CURRENCY}{fmtMoney(rev)}
          </p>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-lime-300">
              {stats?.total_revenue?.trend === "flat" ? "Live Sales" : stats?.total_revenue?.trend}
            </span>
            <p className="text-[10px] text-white/80">Overall store revenue</p>
          </div>
        </div>
      </div>

      {/* Total Customers */}
      <div className="flex min-h-[130px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Total Customers</h3>
          <ArrowUpRight className="h-4 w-4 text-gray-500" />
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d68ff]">{cust}</p>
          <div className="text-right">
            <TrendBadge trend={stats?.total_customers?.trend || "flat"} val={stats?.total_customers?.change_percent ?? null} />
            <p className="text-[10px] text-gray-400">Registered users</p>
          </div>
        </div>
      </div>

      {/* Total Transactions */}
      <div className="flex min-h-[130px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Total Transactions</h3>
          <ArrowUpRight className="h-4 w-4 text-gray-500" />
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d68ff]">{trans}</p>
          <div className="text-right">
            <TrendBadge trend={stats?.total_transactions?.trend || "flat"} val={stats?.total_transactions?.change_percent ?? null} />
            <p className="text-[10px] text-gray-400">Completed payments</p>
          </div>
        </div>
      </div>

      {/* Total Products */}
      <div className="flex min-h-[130px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Total Products</h3>
          <ArrowUpRight className="h-4 w-4 text-gray-500" />
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d68ff]">{prod}</p>
          <div className="text-right">
            <TrendBadge trend={stats?.total_products?.trend || "flat"} val={stats?.total_products?.change_percent ?? null} />
            <p className="text-[10px] text-gray-400">In catalog</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PopularProductsTable({ products, loading }: { products: PopularProduct[]; loading: boolean }) {
  return (
    <div className={CARD}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold leading-snug text-gray-800">Popular Products</h3>
          <p className="text-xs text-gray-500 mt-0.5">Top-selling items in inventory</p>
        </div>
        <Link href="/glopharm/products" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1d68ff] hover:underline">
          View All <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[500px] border-collapse">
          <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Sales</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No popular product data recorded yet.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isOut = p.stock === 0 || p.status === "danger";

                return (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.image || "/placeholder.png"}
                          alt={p.name}
                          className="h-10 w-10 shrink-0 rounded-lg border border-gray-200 object-cover bg-gray-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.png";
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase text-gray-400">ID #{p.id}</p>
                          <p className="max-w-[200px] truncate text-xs font-semibold text-gray-800" title={p.name}>
                            {p.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-800">
                      {CURRENCY}{fmtMoney(p.price)}
                    </td>

                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {p.sales} sold
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {p.stock}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isOut ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
                          }`}
                      >
                        {p.status_label || (isOut ? "Out of Stock" : "In Stock")}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Dashboard Page ─────────────────────────── */

export default function DashboardPage() {
  const { darkMode } = useAdmin();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);

  const [chartRange, setChartRange] = useState("week");
  const [chartDate, setChartDate] = useState("");
  const [chartData, setChartData] = useState<RevenueChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState("");

  const handleRangeChange = (newRange: string) => {
    setChartDate(""); // Clear date filter when switching back to a range
    setChartRange(newRange);
  };

  const handleDateChange = (newDate: string) => {
    setChartDate(newDate); // Setting date replaces range filter
  };

  // Fetch Dashboard Stats
  useEffect(() => {
    async function loadStats() {
      setStatsLoading(true);
      try {
        const res = await fetch("/api/gload/dashboard/stats", { cache: "no-store" });
        if (res.status === 401) {
          window.location.href = "/glopharm/login?session_expired=1";
          return;
        }
        const json = await res.json();
        if (res.ok && json.data) {
          setStats(json.data as DashboardStats);
        }
      } catch {
        // stats error
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
  }, []);

  // Fetch Popular Products
  useEffect(() => {
    async function loadPopular() {
      setPopularLoading(true);
      try {
        const res = await fetch("/api/gload/dashboard/popular-products", { cache: "no-store" });
        if (res.status === 401) {
          window.location.href = "/glopharm/login?session_expired=1";
          return;
        }
        const json = await res.json();
        if (res.ok && json.data) {
          const results = json.data.results || (Array.isArray(json.data) ? json.data : []);
          setPopularProducts(results);
        }
      } catch {
        // popular error
      } finally {
        setPopularLoading(false);
      }
    }
    loadPopular();
  }, []);

  // Fetch Revenue Chart with Range Filter or Date Filter
  useEffect(() => {
    async function loadChart() {
      setChartLoading(true);
      setChartError("");
      try {
        const url = chartDate
          ? `/api/gload/dashboard/revenue-chart?date=${encodeURIComponent(chartDate)}`
          : `/api/gload/dashboard/revenue-chart?range=${encodeURIComponent(chartRange)}`;
        const res = await fetch(url, { cache: "no-store" });
        if (res.status === 401) {
          window.location.href = "/glopharm/login?session_expired=1";
          return;
        }
        const json = await res.json();
        if (!res.ok) {
          setChartError(json?.message || "Failed to load revenue chart for selected period.");
          return;
        }
        if (json.data) {
          setChartData(json.data as RevenueChartData);
        }
      } catch {
        setChartError("Failed to connect to revenue service.");
      } finally {
        setChartLoading(false);
      }
    }
    loadChart();
  }, [chartRange, chartDate]);

  const totalRevNum = parseFloat(stats?.total_revenue?.value || "0") || 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Live overview of Buckksrob sales, customer orders, and inventory.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 items-start">
        {/* Left: Target + Interactive Revenue Chart */}
        <div className="space-y-4 xl:col-span-7">
          <SalesTarget totalRevenue={totalRevNum} />
          <RevenueChartCard
            chartData={chartData}
            chartRange={chartRange}
            chartDate={chartDate}
            onRangeChange={handleRangeChange}
            onDateChange={handleDateChange}
            loading={chartLoading}
            error={chartError}
          />
        </div>

        {/* Right: 4 KPI Cards + Quick Banner */}
        <div className="space-y-4 xl:col-span-5">
          <KpiCards stats={stats} />

          {/* Quick Actions / Store summary banner */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 p-6 text-white shadow-sm">
            <h3 className="text-xl font-bold">Buckksrob Store Operations</h3>
            <p className="mt-1.5 text-xs text-white/80 leading-relaxed">
              Fulfill customer prescription and grocery deliveries, review incoming payments, and keep catalog stock updated.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href="/glopharm/orders"
                className="px-4 py-2 rounded-xl bg-white text-[#1d68ff] font-semibold text-xs shadow-sm hover:bg-blue-50 transition-colors"
              >
                Manage Orders &rarr;
              </Link>
              <Link
                href="/glopharm/products/new"
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs transition-colors backdrop-blur-sm"
              >
                + Add Product
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom row: Popular products */}
        <div className="xl:col-span-12">
          <PopularProductsTable products={popularProducts} loading={popularLoading} />
        </div>
      </div>
    </div>
  );
}
