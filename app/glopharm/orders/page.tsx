"use client";

import { useEffect, useMemo, useState, useCallback, useRef, Fragment } from "react";
import { useAdmin } from "../layout";

/* ─────────────────────────── Types ─────────────────────────── */

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  is_guest: boolean;
  user_id: number | null;
}

export interface OrderShipping {
  address: string;
  city: string;
  state: string;
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  product_image: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}

export interface OrderPayment {
  reference: string;
  amount: string;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export interface BackendOrder {
  order_number: string;
  created_at: string;
  status: "pending" | "processing" | "out_for_delivery" | "delivered" | "cancelled";
  status_label: string;
  payment_status: "paid" | "unpaid";
  payment_status_label: string;
  customer: OrderCustomer;
  shipping: OrderShipping;
  items: OrderItem[];
  subtotal: string;
  referral_discount: string;
  total: string;
  payments: OrderPayment[];
}

export interface OrderStats {
  period: {
    filter: string;
    value: string;
  };
  total_orders: number;
  total_amount_sold: string;
  orders_to_fulfil: number;
  awaiting_payment: number;
  by_status: {
    pending: number;
    processing: number;
    out_for_delivery: number;
    delivered: number;
    cancelled: number;
  };
}

const STATUS_TABS = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["key"];

const ALLOWED_STATUS_UPDATES = [
  { value: "processing", label: "Processing" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
];

/* ─────────────────────────── Helpers ─────────────────────────── */

const money = (val: string | number) => {
  const n = typeof val === "number" ? val : parseFloat(val || "0");
  return `₦${new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isNaN(n) ? 0 : n)}`;
};

const formatDate = (iso: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const esc = (s: string) =>
  String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] || c);

function printReceipt(o: BackendOrder) {
  const w = window.open("", "_blank", "width=840,height=620");
  if (!w) return;

  const rows = o.items
    .map(
      (it, i) =>
        `<tr><td>${i + 1}</td><td><b>${esc(it.product_name)}</b></td><td>${money(it.unit_price)}</td><td>x${it.quantity}</td><td>${money(it.line_total)}</td></tr>`
    )
    .join("");

  w.document.write(`<!doctype html><html><head><title>Order ${esc(o.order_number)}</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;padding:32px;font-size:13px;color:#111}
  h2{margin:0 0 4px} p{margin:0 0 16px;color:#555}
  table{width:100%;border-collapse:collapse;margin-top:16px} th,td{text-align:left;padding:10px 8px;border-bottom:1px solid #e5e7eb}
  th{font-size:11px;text-transform:uppercase;color:#6b7280;background:#f9fafb}
  .sum{margin:20px 0 0 auto;width:280px} .sum div{display:flex;justify-content:space-between;padding:4px 0}
  .total{font-weight:bold;border-top:1px solid #111;padding-top:8px;margin-top:4px}
</style></head><body>
  <h2>GloPharm Order #${esc(o.order_number)}</h2>
  <p>Customer: ${esc(o.customer?.name || "Guest")} (${esc(o.customer?.email || "")}) · ${formatDate(o.created_at)} · Status: <b>${esc(o.status_label)}</b></p>
  <p>Delivery Address: ${esc(o.shipping?.address || "")}, ${esc(o.shipping?.city || "")}, ${esc(o.shipping?.state || "")}</p>
  <table><thead><tr><th>#</th><th>Product</th><th>Unit Price</th><th>Qty</th><th>Line Total</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="sum">
    <div><span>Subtotal</span><span>${money(o.subtotal)}</span></div>
    <div><span>Discount</span><span>-${money(o.referral_discount)}</span></div>
    <div class="total"><span>Total</span><span>${money(o.total)}</span></div>
  </div>
</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

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

/* ─────────────────────────── Component ─────────────────────────── */

export default function AdminOrdersPage() {
  const { darkMode } = useAdmin();
  const { toasts, push: toast } = useToast();

  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState<OrderStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [period, setPeriod] = useState<"today" | "this_month" | "this_year">("today");

  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Status Update Modal state
  const [statusModalOrder, setStatusModalOrder] = useState<BackendOrder | null>(null);
  const [newStatus, setNewStatus] = useState("out_for_delivery");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  /* ── Fetch Stats ── */
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/gload/orders/stats?period=${period}`);
      if (res.status === 401) {
        window.location.href = "/glopharm/login?session_expired=1";
        return;
      }
      const json = await res.json();
      if (res.ok && json.data) {
        setStats(json.data as OrderStats);
      }
    } catch {
      // stats error fallback
    } finally {
      setStatsLoading(false);
    }
  }, [period]);

  /* ── Fetch Orders List ── */
  const fetchOrders = useCallback(async (p = page, q = search, status = activeTab) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(p),
        page_size: "20",
        _t: String(Date.now()),
      });

      if (q.trim()) params.set("search", q.trim());
      if (status !== "all") params.set("status", status);

      const res = await fetch(`/api/gload/orders?${params.toString()}`, { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/glopharm/login?session_expired=1";
        return;
      }
      const json = await res.json();

      if (!res.ok) {
        setError(json.message || "Failed to load orders.");
        return;
      }

      const results = json.data?.results ?? (Array.isArray(json.data) ? json.data : []);
      setOrders(results);
      setTotalCount(json.data?.count ?? results.length);
      setHasNext(Boolean(json.data?.next));
      setHasPrev(Boolean(json.data?.previous));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to load orders.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeTab]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchOrders(page, search, activeTab);
  }, [fetchOrders, page, search, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const toggleExpand = (orderNumber: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderNumber)) next.delete(orderNumber);
      else next.add(orderNumber);
      return next;
    });
  };

  /* ── Execute Status Change ── */
  const handleUpdateStatus = async () => {
    if (!statusModalOrder) return;

    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/gload/orders/${statusModalOrder.order_number}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to update order status.");
      }

      toast(`Order #${statusModalOrder.order_number} status updated to ${newStatus.replace(/_/g, " ")}!`);

      // Optimistically update order status in state
      setOrders((prev) =>
        prev.map((o) =>
          o.order_number === statusModalOrder.order_number
            ? {
              ...o,
              status: newStatus as BackendOrder["status"],
              status_label:
                ALLOWED_STATUS_UPDATES.find((s) => s.value === newStatus)?.label || newStatus,
            }
            : o
        )
      );

      setStatusModalOrder(null);
      setStatusNote("");
      fetchStats();
      fetchOrders(page, search, activeTab);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status.";
      toast(msg, "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / 20));

  const cardCls = darkMode ? "bg-[#383838] border-[#505050]" : "bg-white border-[#E8E8E8]";
  const textCls = darkMode ? "text-white" : "text-[#282828]";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Stack */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium text-white shadow-lg ${t.type === "success" ? "bg-[#282828]" : "bg-red-600"
              }`}
          >
            <span className={`h-2 w-2 rounded-full ${t.type === "success" ? "bg-[#E6FF96]" : "bg-red-200"}`} />
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── Status Update Modal ── */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${cardCls}`}>
            <h3 className={`text-base font-bold mb-1 ${textCls}`}>
              Update Status: #{statusModalOrder.order_number}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Current status: <span className="font-semibold capitalize">{statusModalOrder.status_label}</span>
            </p>

            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textCls}`}>Select New Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border outline-none ${darkMode ? "bg-[#505050] border-[#666] text-white" : "bg-white border-[#E8E8E8] text-[#282828]"
                    } focus:border-[#1d68ff]`}
                >
                  {ALLOWED_STATUS_UPDATES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Permitted transitions: Processing, Out for Delivery, Delivered.
                </p>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${textCls}`}>Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Rider has picked it up or Dispatched from pharmacy"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border outline-none ${darkMode ? "bg-[#505050] border-[#666] text-white" : "bg-white border-[#E8E8E8] text-[#282828]"
                    } focus:border-[#1d68ff]`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-[#E8E8E8]">
              <button
                type="button"
                onClick={() => setStatusModalOrder(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border ${darkMode ? "border-[#666] text-white hover:bg-[#505050]" : "border-[#E8E8E8] text-[#282828] hover:bg-gray-50"
                  }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={handleUpdateStatus}
                className="px-5 py-2 rounded-xl bg-[#1d68ff] hover:bg-[#1656d6] text-white text-xs font-semibold disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
              >
                {isUpdatingStatus ? "Updating..." : "Confirm Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BREADCRUMB & HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${textCls}`}>Manage Orders</h1>
          <nav className="mt-1 flex items-center gap-2 text-xs text-[#888888]">
            <span>Dashboard</span>
            <span>&gt;</span>
            <span className="font-medium text-[#1d68ff]">Orders</span>
          </nav>
        </div>

        {/* Period filter for stats */}
        <div className="flex items-center gap-2 text-xs">
          <span className={textCls}>Period:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className={`px-3 py-1.5 rounded-xl border text-xs outline-none font-medium cursor-pointer ${darkMode ? "bg-[#505050] border-[#666] text-white" : "bg-white border-[#E8E8E8] text-[#282828]"
              }`}
          >
            <option value="today">Today</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
          </select>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`rounded-2xl border p-5 animate-pulse h-28 ${cardCls}`} />
          ))
        ) : stats ? (
          <>
            <div className="rounded-2xl p-5 shadow-sm bg-[#1d68ff] text-white">
              <p className="text-sm font-semibold">
                Total Orders (
                {stats.period?.filter === "this_month"
                  ? "This Month"
                  : stats.period?.filter === "this_year"
                  ? "This Year"
                  : "Today"}
                )
              </p>
              <p className="mt-3 text-3xl font-bold">{stats.total_orders}</p>
              <p className="mt-1 text-[11px] text-white/80">Date: {stats.period.value}</p>
            </div>
            <div className={`rounded-2xl border p-5 shadow-sm ${cardCls}`}>
              <p className="text-sm font-semibold text-gray-500">Total Sold</p>
              <p className="mt-3 text-3xl font-bold text-[#1d68ff]">{money(stats.total_amount_sold)}</p>
              <p className="mt-1 text-[11px] text-gray-400">Successful sales in period</p>
            </div>
            <div className={`rounded-2xl border p-5 shadow-sm ${cardCls}`}>
              <p className="text-sm font-semibold text-gray-500">Orders to Fulfil</p>
              <p className="mt-3 text-3xl font-bold text-amber-500">{stats.orders_to_fulfil}</p>
              <p className="mt-1 text-[11px] text-gray-400">Processing or awaiting shipment</p>
            </div>
            <div className={`rounded-2xl border p-5 shadow-sm ${cardCls}`}>
              <p className="text-sm font-semibold text-gray-500">Awaiting Payment</p>
              <p className="mt-3 text-3xl font-bold text-red-500">{stats.awaiting_payment}</p>
              <p className="mt-1 text-[11px] text-gray-400">Pending checkout / transfers</p>
            </div>
          </>
        ) : (
          <p className="col-span-4 text-xs text-gray-500">Could not load order stats.</p>
        )}
      </div>

      {/* ── ORDERS TABLE CONTAINER ── */}
      <section className={`rounded-2xl border shadow-sm p-5 ${cardCls}`}>
        {/* Toolbar & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full max-w-sm">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order # or customer..."
              className={`w-full rounded-full border py-2 pl-4 pr-4 text-xs outline-none placeholder:text-gray-400 focus:border-[#1d68ff] ${darkMode ? "bg-[#505050] border-[#666] text-white" : "bg-white border-[#E8E8E8] text-[#282828]"
                }`}
            />
            <button
              type="submit"
              className="rounded-full bg-[#1d68ff] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1656d6] cursor-pointer"
            >
              Search
            </button>
          </form>

          <button
            onClick={() => {
              fetchStats();
              fetchOrders(page, search, activeTab);
              toast("Orders refreshed!");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className={`mt-4 flex overflow-x-auto rounded-xl border p-1 gap-1 ${darkMode ? "border-[#505050]" : "border-[#E8E8E8]"}`}>
          {STATUS_TABS.map((t) => {
            const count =
              t.key === "all"
                ? totalCount
                : stats?.by_status?.[t.key as keyof typeof stats.by_status] ?? 0;
            const active = activeTab === t.key;

            return (
              <button
                key={t.key}
                onClick={() => {
                  setActiveTab(t.key);
                  setPage(1);
                }}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${active ? "bg-blue-100 text-[#1d68ff]" : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {t.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className={`mt-4 overflow-x-auto rounded-xl border ${darkMode ? "border-[#505050]" : "border-[#E8E8E8]"}`}>
          <table className="w-full min-w-[800px] border-collapse">
            <thead className={darkMode ? "bg-[#505050]" : "bg-gray-100"}>
              <tr>
                <th className={`px-4 py-3.5 text-left text-xs font-semibold ${textCls}`}>Order #</th>
                <th className={`px-4 py-3.5 text-left text-xs font-semibold ${textCls}`}>Customer</th>
                <th className={`px-4 py-3.5 text-left text-xs font-semibold ${textCls}`}>Date</th>
                <th className={`px-4 py-3.5 text-left text-xs font-semibold ${textCls}`}>Total</th>
                <th className={`px-4 py-3.5 text-left text-xs font-semibold ${textCls}`}>Payment</th>
                <th className={`px-4 py-3.5 text-left text-xs font-semibold ${textCls}`}>Status</th>
                <th className={`px-4 py-3.5 text-left text-xs font-semibold ${textCls}`}>Actions</th>
              </tr>
            </thead>

            <tbody className={`divide-y ${darkMode ? "divide-[#505050]" : "divide-gray-100"}`}>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isExpanded = expandedOrders.has(o.order_number);
                  const isPaid = o.payment_status === "paid";
                  const paymentRef = o.payments?.[0]?.reference || "N/A";
                  const paidAtTime = o.payments?.[0]?.paid_at;

                  return (
                    <Fragment key={o.order_number}>
                      <tr
                        onClick={() => toggleExpand(o.order_number)}
                        className={`group cursor-pointer transition-colors ${isExpanded ? "bg-blue-50/60" : "hover:bg-gray-50/80"
                          }`}
                      >
                        {/* Order Number */}
                        <td className="px-4 py-3.5 text-xs font-bold text-[#1d68ff]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(o.order_number);
                            }}
                            className="hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                          >
                            <svg
                              className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90 text-[#1d68ff]" : "text-gray-400"}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <span>{o.order_number}</span>
                          </button>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3.5 text-xs">
                          <p className={`font-semibold ${textCls}`}>{o.customer?.name || "Guest User"}</p>
                          <p className="text-[11px] text-gray-400">{o.customer?.phone || o.customer?.email}</p>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(o.created_at)}
                        </td>

                        {/* Total */}
                        <td className={`px-4 py-3.5 text-xs font-bold whitespace-nowrap ${textCls}`}>
                          {money(o.total)}
                        </td>

                        {/* Payment */}
                        <td className="px-4 py-3.5 text-xs">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                              }`}
                          >
                            {o.payment_status_label || (isPaid ? "Paid" : "Unpaid")}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3.5 text-xs">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold capitalize ${getStatusBadge(
                              o.status
                            )}`}
                          >
                            {o.status_label || o.status.replace(/_/g, " ")}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-xs whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleExpand(o.order_number)}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${isExpanded
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              title={isExpanded ? "Collapse Order Details" : "Expand Order Details"}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                              </svg>
                              <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setStatusModalOrder(o);
                                setNewStatus(
                                  o.status === "pending" || o.status === "processing"
                                    ? "out_for_delivery"
                                    : "delivered"
                                );
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-[#1d68ff] hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            >
                              Update Status
                            </button>
                            <button
                              type="button"
                              onClick={() => printReceipt(o)}
                              className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
                              title="Print Invoice"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── EXPANDED FULL ORDER & CUSTOMER DETAILS ROW (Directly Below Order) ── */}
                      {isExpanded && (
                        <tr className="bg-[#f8fafd] border-y-2 border-blue-200">
                          <td colSpan={7} className="p-4 sm:p-6 space-y-4">
                            {/* Header inside expansion */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#1d68ff]" />
                                <span className="text-sm font-bold text-gray-900">
                                  Full Order &amp; Customer Information: #{o.order_number}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStatusModalOrder(o);
                                    setNewStatus(
                                      o.status === "pending" || o.status === "processing"
                                        ? "out_for_delivery"
                                        : "delivered"
                                    );
                                  }}
                                  className="px-3 py-1.5 text-xs font-semibold bg-[#1d68ff] text-white rounded-lg hover:bg-[#1656d6] transition-colors cursor-pointer"
                                >
                                  Update Status
                                </button>
                                <button
                                  type="button"
                                  onClick={() => printReceipt(o)}
                                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                  Print Receipt
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(o.order_number)}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                                  title="Close"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* 3 Information Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Customer Information Card */}
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 border-b border-gray-100 pb-2">
                                  <svg className="w-4 h-4 text-[#1d68ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span>Customer Details</span>
                                </div>
                                <div className="text-xs space-y-1.5 text-gray-700">
                                  <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Full Name</span>
                                    <span className="font-semibold text-gray-900 text-sm">{o.customer?.name || "Guest Customer"}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Email Address</span>
                                    {o.customer?.email ? (
                                      <a href={`mailto:${o.customer.email}`} className="text-[#1d68ff] hover:underline">
                                        {o.customer.email}
                                      </a>
                                    ) : (
                                      <span className="text-gray-400">Not provided</span>
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Phone Number</span>
                                    {o.customer?.phone ? (
                                      <a href={`tel:${o.customer.phone}`} className="text-gray-900 font-medium hover:text-[#1d68ff]">
                                        {o.customer.phone}
                                      </a>
                                    ) : (
                                      <span className="text-gray-400">Not provided</span>
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Account Type</span>
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                                      {o.customer?.is_guest ? "Guest Checkout" : `Registered User (#${o.customer?.user_id ?? "N/A"})`}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Shipping & Delivery Card */}
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 border-b border-gray-100 pb-2">
                                  <svg className="w-4 h-4 text-[#1d68ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>Shipping &amp; Delivery</span>
                                </div>
                                <div className="text-xs space-y-1.5 text-gray-700">
                                  <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Street Address</span>
                                    <span className="font-medium text-gray-900">{o.shipping?.address || "Address not specified"}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">City &amp; State</span>
                                    <span className="font-medium text-gray-900">
                                      {o.shipping?.city ? `${o.shipping.city}, ` : ""}
                                      {o.shipping?.state || "Nigeria"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Delivery Status</span>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${getStatusBadge(o.status)}`}>
                                      {o.status_label || o.status.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Payment & Financial Card */}
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 border-b border-gray-100 pb-2">
                                  <svg className="w-4 h-4 text-[#1d68ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                  <span>Payment &amp; Totals</span>
                                </div>
                                <div className="text-xs space-y-1.5 text-gray-700">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Payment Status:</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                      {o.payment_status_label || (isPaid ? "Paid" : "Unpaid")}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Subtotal:</span>
                                    <span className="font-semibold text-gray-800">{money(o.subtotal)}</span>
                                  </div>
                                  {parseFloat(o.referral_discount || "0") > 0 && (
                                    <div className="flex justify-between items-center text-red-600">
                                      <span>Referral Discount:</span>
                                      <span>-{money(o.referral_discount)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between items-center pt-1 border-t border-gray-100 font-bold text-sm text-gray-900">
                                    <span>Total Amount:</span>
                                    <span className="text-[#1d68ff]">{money(o.total)}</span>
                                  </div>
                                  {paymentRef !== "N/A" && (
                                    <div className="pt-1 text-[11px] text-gray-400">
                                      Ref: <span className="font-mono text-gray-600">{paymentRef}</span>
                                    </div>
                                  )}
                                  {paidAtTime && (
                                    <div className="text-[10px] text-gray-400">
                                      Paid at: {formatDate(paidAtTime)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Order Items Table inside expansion */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-800">
                                Purchased Items ({o.items?.length || 0})
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                      <th className="px-4 py-2">Item</th>
                                      <th className="px-4 py-2">Product ID</th>
                                      <th className="px-4 py-2">Unit Price</th>
                                      <th className="px-4 py-2">Quantity</th>
                                      <th className="px-4 py-2 text-right">Line Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {o.items?.map((it, idx) => (
                                      <tr key={`${it.product_id}-${idx}`} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-3">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                              src={it.product_image || "/placeholder.png"}
                                              alt={it.product_name}
                                              className="w-10 h-10 object-cover rounded-lg border bg-gray-50 shrink-0"
                                              onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/placeholder.png";
                                              }}
                                            />
                                            <span className="font-semibold text-gray-900">{it.product_name}</span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 font-mono text-[11px]">
                                          #{it.product_id}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                          {money(it.unit_price)}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-900">
                                          &times; {it.quantity}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-right text-gray-900">
                                          {money(it.line_total)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && totalCount > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
            <p>
              Page <span className="font-semibold text-[#1d68ff]">{page}</span> of {totalPages} &bull;{" "}
              {totalCount} total order{totalCount !== 1 ? "s" : ""}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev}
                className="rounded-md border border-[#E8E8E8] p-1.5 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                &larr; Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                className="rounded-md border border-[#E8E8E8] p-1.5 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
