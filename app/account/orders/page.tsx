"use client";

import { useState } from "react";
import Link from "next/link";

interface Order {
  id: string;
  date: string;
  status: "Delivered" | "Out for Delivery" | "Processing";
  itemsCount: number;
  total: number;
  items: {
    title: string;
    image: string;
    quantity: number;
    price: number;
  }[];
  trackingSteps: { title: string; time: string; completed: boolean }[];
}

const ORDERS_DATA: Order[] = [
  {
    id: "GLO-98421",
    date: "November 2, 2026",
    status: "Out for Delivery",
    itemsCount: 3,
    total: 18500,
    items: [
      {
        title: "Vitamin C 1000mg Effervescent",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80",
        quantity: 1,
        price: 4500,
      },
      {
        title: "Farm Fresh Organic Eggs (Crate)",
        image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=300&auto=format&fit=crop&q=80",
        quantity: 1,
        price: 4200,
      },
      {
        title: "Cod Liver Oil Omega-3",
        image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&auto=format&fit=crop&q=80",
        quantity: 2,
        price: 4900,
      },
    ],
    trackingSteps: [
      { title: "Order Confirmed & Paid", time: "10:15 AM", completed: true },
      { title: "Prescription & Produce Packed", time: "11:30 AM", completed: true },
      { title: "Dispatched with Courier", time: "01:45 PM", completed: true },
      { title: "Arrived at Destination", time: "Estimated 03:00 PM", completed: false },
    ],
  },
  {
    id: "GLO-98104",
    date: "October 26, 2026",
    status: "Delivered",
    itemsCount: 2,
    total: 10000,
    items: [
      {
        title: "Multivitamin Daily Formula (30 caps)",
        image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&auto=format&fit=crop&q=80",
        quantity: 1,
        price: 8500,
      },
      {
        title: "Pain Relief Paracetamol Extra",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80",
        quantity: 1,
        price: 1500,
      },
    ],
    trackingSteps: [
      { title: "Order Placed", time: "09:00 AM", completed: true },
      { title: "Verified by Pharmacist", time: "09:40 AM", completed: true },
      { title: "Out for Delivery", time: "11:00 AM", completed: true },
      { title: "Delivered to Customer", time: "01:10 PM", completed: true },
    ],
  },
  {
    id: "GLO-97652",
    date: "October 14, 2026",
    status: "Delivered",
    itemsCount: 1,
    total: 45000,
    items: [
      {
        title: "Blood Pressure Monitor (Digital)",
        image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=300&auto=format&fit=crop&q=80",
        quantity: 1,
        price: 45000,
      },
    ],
    trackingSteps: [
      { title: "Order Placed", time: "08:15 AM", completed: true },
      { title: "Packaged & QC Checked", time: "09:20 AM", completed: true },
      { title: "Courier En Route", time: "10:30 AM", completed: true },
      { title: "Delivered & Signed", time: "12:15 PM", completed: true },
    ],
  },
];

export default function OrdersPage() {
  const [filter, setFilter] = useState<"All" | "Out for Delivery" | "Delivered">("All");
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);

  const filteredOrders =
    filter === "All"
      ? ORDERS_DATA
      : ORDERS_DATA.filter((o) => o.status === filter);

  const formatNaira = (val: number) => "₦" + val.toLocaleString("en-NG");

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
        {(["All", "Out for Delivery", "Delivered"] as const).map((tab) => (
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
            {tab}
          </button>
        ))}
      </div>

      {/* ── ORDERS LIST ── */}
      <div className="space-y-5">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-7 shadow-xs hover:shadow-md transition-shadow"
          >
            {/* Top Bar of Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-neutral-100 gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm sm:text-base text-neutral-900">
                  #{order.id}
                </span>
                <span className="text-neutral-300">·</span>
                <span className="text-xs sm:text-sm text-neutral-500">{order.date}</span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                {order.status === "Out for Delivery" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0265CB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-[#0265CB] animate-ping" />
                    Out for Delivery
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A654] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Delivered
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
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-800 line-clamp-1 max-w-[160px]">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Qty: {item.quantity} · {formatNaira(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(order)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 hover:border-neutral-400 text-xs font-bold text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  Track Order
                </button>
                <Link
                  href="/cart"
                  className="px-4 py-2 rounded-xl bg-[#00A654] hover:bg-[#008f48] text-white text-xs font-bold transition-all shadow-xs"
                >
                  Buy Again
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── TRACKING MODAL ── */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Track Order #{trackingModalOrder.id}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Placed on {trackingModalOrder.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModalOrder(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stepper Timeline */}
            <div className="mt-6 space-y-5">
              {trackingModalOrder.trackingSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.completed
                          ? "bg-[#00A654] text-white"
                          : "border-2 border-neutral-300 text-neutral-400"
                      }`}
                    >
                      {step.completed ? "✓" : idx + 1}
                    </div>
                    {idx < trackingModalOrder.trackingSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-8 my-1 ${
                          step.completed ? "bg-[#00A654]" : "bg-neutral-200"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        step.completed ? "text-neutral-900" : "text-neutral-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-neutral-500">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setTrackingModalOrder(null)}
                className="px-5 py-2 rounded-full bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
