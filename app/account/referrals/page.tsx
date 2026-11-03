"use client";

import { useState } from "react";
import Link from "next/link";

interface ReferredUser {
  id: string;
  name: string;
  email: string;
  date: string;
  status: "Completed Order" | "Order in Progress" | "Registered";
  pointsEarned: number;
}

interface PurchasePoint {
  orderId: string;
  date: string;
  orderTotal: number;
  pointsEarned: number;
  itemsSummary: string;
}

const REFERRED_FRIENDS: ReferredUser[] = [
  {
    id: "REF-101",
    name: "Chidinma Eze",
    email: "chidinma.eze@gmail.com",
    date: "November 1, 2026",
    status: "Completed Order",
    pointsEarned: 500,
  },
  {
    id: "REF-102",
    name: "Tunde Balogun",
    email: "t.balogun@yahoo.com",
    date: "October 29, 2026",
    status: "Completed Order",
    pointsEarned: 500,
  },
  {
    id: "REF-103",
    name: "Blessing Okon",
    email: "blessing.okon@outlook.com",
    date: "October 24, 2026",
    status: "Completed Order",
    pointsEarned: 500,
  },
  {
    id: "REF-104",
    name: "Dr. Victor Ibe",
    email: "victor.ibe@healthnet.ng",
    date: "Yesterday",
    status: "Order in Progress",
    pointsEarned: 0,
  },
  {
    id: "REF-105",
    name: "Kelechi Nnamdi",
    email: "kelechi.n@gmail.com",
    date: "Today, 08:30 AM",
    status: "Registered",
    pointsEarned: 0,
  },
];

const PURCHASE_POINTS_HISTORY: PurchasePoint[] = [
  {
    orderId: "GLO-98421",
    date: "November 2, 2026",
    orderTotal: 18500,
    pointsEarned: 185,
    itemsSummary: "Vitamin C, Organic Eggs, Cod Liver Oil",
  },
  {
    orderId: "GLO-98104",
    date: "October 26, 2026",
    orderTotal: 10000,
    pointsEarned: 100,
    itemsSummary: "Multivitamin Daily, Paracetamol Extra",
  },
  {
    orderId: "GLO-97652",
    date: "October 14, 2026",
    orderTotal: 45000,
    pointsEarned: 450,
    itemsSummary: "Digital Blood Pressure Monitor",
  },
  {
    orderId: "GLO-96890",
    date: "September 28, 2026",
    orderTotal: 21500,
    pointsEarned: 215,
    itemsSummary: "Organic Groceries, Greek Yoghurt, Honey",
  },
];

export default function ReferralsPage() {
  const [activeTab, setActiveTab] = useState<"referrals" | "purchases">("referrals");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const referralCode = "GLO-AMAKA-26";
  const referralLink = "https://glopharm.ng/ref/GLO-AMAKA-26";

  const totalPoints = 2450;
  const referralPoints = 1500;
  const purchasePoints = 950;
  const storeCreditValue = totalPoints * 5; // ₦12,250 (1 pt = ₦5)

  const formatNaira = (val: number) => "₦" + val.toLocaleString("en-NG");

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRedeem = () => {
    setRedeemSuccess(true);
    setTimeout(() => setRedeemSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Toast Notification */}
      {redeemSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-[#00A654] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in font-medium text-xs sm:text-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span>Points redeemed! {formatNaira(storeCreditValue)} added to your store balance.</span>
        </div>
      )}

      {/* ── HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Referrals &amp; Reward Points
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Invite friends to GloPharm and earn points on every referral and purchase you make.
          </p>
        </div>

        {/* Redeem Button */}
        <button
          type="button"
          onClick={handleRedeem}
          className="self-start sm:self-auto px-6 py-2.5 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>Redeem {totalPoints.toLocaleString()} Points</span>
        </button>
      </div>

      {/* ── 4 STATS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Points */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-4 sm:p-5 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
            Total Balance
          </span>
          <p className="text-xl sm:text-3xl font-extrabold text-[#00A654] mt-1">
            {totalPoints.toLocaleString()} <span className="text-xs sm:text-sm font-semibold text-neutral-500">pts</span>
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">
            Worth {formatNaira(storeCreditValue)}
          </p>
        </div>

        {/* Referral Points */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-4 sm:p-5 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
            From Referrals
          </span>
          <p className="text-xl sm:text-3xl font-extrabold text-neutral-900 mt-1">
            {referralPoints.toLocaleString()} <span className="text-xs sm:text-sm font-semibold text-neutral-500">pts</span>
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">
            3 friends purchased
          </p>
        </div>

        {/* Purchase Cashback Points */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-4 sm:p-5 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
            Purchase Cashback
          </span>
          <p className="text-xl sm:text-3xl font-extrabold text-[#0265CB] mt-1">
            {purchasePoints.toLocaleString()} <span className="text-xs sm:text-sm font-semibold text-neutral-500">pts</span>
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">
            From 4 store orders
          </p>
        </div>

        {/* Friends Invited */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-4 sm:p-5 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
            Friends Invited
          </span>
          <p className="text-xl sm:text-3xl font-extrabold text-neutral-900 mt-1">
            {REFERRED_FRIENDS.length} <span className="text-xs sm:text-sm font-semibold text-neutral-500">people</span>
          </p>
          <p className="text-[11px] text-[#00A654] font-bold mt-0.5">
            +500 pts per order
          </p>
        </div>
      </div>

      {/* ── REFERRAL CODE & LINK CARD ── */}
      <div className="bg-[#FAF7F0] border border-[#EBE3D3] rounded-3xl p-5 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-[#00A654] uppercase tracking-wider">
            Share Your Link &amp; Code
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mt-0.5">
            Give ₦1,000, Get 500 Points (₦2,500)
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl">
            When a friend signs up with your code, they get ₦1,000 discount on their first purchase, and you earn 500 reward points as soon as it delivers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Code Box */}
          <div className="bg-white rounded-2xl p-4 border border-neutral-200 flex items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Your Referral Code
              </span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-neutral-900">
                {referralCode}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-all cursor-pointer shrink-0"
            >
              {copiedCode ? "Copied!" : "Copy Code"}
            </button>
          </div>

          {/* Link Box */}
          <div className="bg-white rounded-2xl p-4 border border-neutral-200 flex items-center justify-between gap-3 shadow-2xs">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Your Referral Link
              </span>
              <span className="text-xs sm:text-sm text-neutral-700 truncate block font-mono">
                {referralLink}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-xs transition-all cursor-pointer shrink-0 shadow-xs"
            >
              {copiedLink ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>

      {/* ── TWO TABS: REFERRED FRIENDS VS PURCHASE REWARDS ── */}
      <div className="space-y-4">
        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-px">
          <button
            type="button"
            onClick={() => setActiveTab("referrals")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === "referrals"
                ? "border-[#00A654] text-[#00A654]"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Referred Friends ({REFERRED_FRIENDS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("purchases")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === "purchases"
                ? "border-[#00A654] text-[#00A654]"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Purchase Cashback Points ({PURCHASE_POINTS_HISTORY.length})
          </button>
        </div>

        {/* Tab 1: Referred Friends Table/Cards */}
        {activeTab === "referrals" && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs">
            <div className="divide-y divide-neutral-100">
              {REFERRED_FRIENDS.map((friend) => (
                <div
                  key={friend.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFAFA] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#00A654] font-bold text-xs flex items-center justify-center shrink-0">
                      {friend.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">{friend.name}</h4>
                      <p className="text-xs text-neutral-400">{friend.email} · Joined {friend.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <div>
                      {friend.status === "Completed Order" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A654] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          First Order Delivered
                        </span>
                      )}
                      {friend.status === "Order in Progress" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0265CB] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                          Order Processing
                        </span>
                      )}
                      {friend.status === "Registered" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                          Account Created
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      {friend.pointsEarned > 0 ? (
                        <span className="text-sm sm:text-base font-extrabold text-[#00A654]">
                          +{friend.pointsEarned} pts
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">Pending order</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Purchase Points History */}
        {activeTab === "purchases" && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs">
            <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 text-xs text-neutral-700 flex items-center justify-between">
              <span className="font-semibold">Cashback Rule: Earn 10 points for every ₦1,000 spent</span>
              <span className="text-neutral-500 hidden sm:inline">Automatically credited upon delivery</span>
            </div>

            <div className="divide-y divide-neutral-100">
              {PURCHASE_POINTS_HISTORY.map((item) => (
                <div
                  key={item.orderId}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFAFA] transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-neutral-900">
                        Order #{item.orderId}
                      </span>
                      <span className="text-neutral-300">·</span>
                      <span className="text-xs text-neutral-400">{item.date}</span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-0.5">{item.itemsSummary}</p>
                    <p className="text-[11px] text-neutral-400 font-medium">Order Total: {formatNaira(item.orderTotal)}</p>
                  </div>

                  <div className="text-right self-start sm:self-auto">
                    <span className="text-sm sm:text-base font-extrabold text-[#0265CB]">
                      +{item.pointsEarned} pts
                    </span>
                    <span className="block text-[10px] text-neutral-400">Credited to Balance</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
