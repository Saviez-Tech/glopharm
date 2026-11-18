"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── Types matching the backend response ── */
interface OrderItem {
  product_id: number;
  product_name: string;
  product_image: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}

interface Order {
  order_number: string;
  status: string;
  status_label: string;
  payment_status: string;
  total: string;
  created_at: string;
  total_quantity: number;
  items: OrderItem[];
}

type FilterTab = "All" | "pending" | "delivered";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterTab>("All");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ecommerce/orders");
      const data = await res.json();

      if (res.status === 401) {
        window.location.href = "/login?callback=" + encodeURIComponent("/account/orders");
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to load orders.");
      }

      setOrders(data.data?.results ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load orders.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((o) => o.status === filter);

  const formatNaira = (val: string | number) =>
    "₦" + Number(val).toLocaleString("en-NG");

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const getStatusBadge = (status: string, label: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A654] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            {label || "Delivered"}
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {label || "Pending"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0265CB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-[#0265CB] animate-ping" />
            {label || status}
          </span>
        );
    }
  };

  /* ── LOADING STATE ── */
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">My Orders</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">Loading your orders…</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-7 animate-pulse">
              <div className="h-5 bg-neutral-200 rounded w-1/3 mb-4" />
              <div className="h-4 bg-neutral-100 rounded w-2/3 mb-2" />
              <div className="h-4 bg-neutral-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── ERROR STATE ── */
  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">My Orders</h1>
        </div>
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center">
          <p className="text-red-600 font-semibold text-sm">{error}</p>
          <button
            type="button"
            onClick={fetchOrders}
            className="mt-4 px-5 py-2 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-xs transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Track recent deliveries, view past purchases, and download receipts.
          </p>
        </div>

        <Link
          href="/products"
          className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Order More Products</span>
        </Link>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-px">
        {(["All", "pending", "delivered"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              filter === tab
                ? "border-[#00A654] text-[#00A654]"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {tab === "All" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── EMPTY STATE ── */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
          <p className="text-gray-500 text-sm mb-6">Start shopping to see your orders here.</p>
          <Link
            href="/products"
            className="px-6 py-2.5 bg-[#00A654] text-white rounded-full font-bold text-sm hover:bg-[#008f48] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}

      {/* ── ORDERS LIST ── */}
      <div className="space-y-5">
        {filteredOrders.map((order) => (
          <div
            key={order.order_number}
            className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-7 shadow-xs hover:shadow-md transition-shadow"
          >
            {/* Top Bar of Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-neutral-100 gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm sm:text-base text-neutral-900">
                  #{order.order_number}
                </span>
                <span className="text-neutral-300">·</span>
                <span className="text-xs sm:text-sm text-neutral-500">{formatDate(order.created_at)}</span>
              </div>

              {/* Status Badge + Total */}
              <div className="flex items-center gap-3">
                {getStatusBadge(order.status, order.status_label)}
                {order.payment_status && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    order.payment_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}>
                    {order.payment_status.toUpperCase()}
                  </span>
                )}
                <span className="font-extrabold text-neutral-900 text-sm sm:text-base">
                  {formatNaira(order.total)}
                </span>
              </div>
            </div>

            {/* Items Thumbnails Row */}
            <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-[#F8F9FA] rounded-2xl p-2 border border-neutral-100 pr-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-neutral-100">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-800 line-clamp-1 max-w-[160px]">
                        {item.product_name}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Qty: {item.quantity} · {formatNaira(item.unit_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <Link
                  href="/products"
                  className="px-4 py-2 rounded-xl bg-[#00A654] hover:bg-[#008f48] text-white text-xs font-bold transition-all shadow-xs"
                >
                  Buy Again
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
