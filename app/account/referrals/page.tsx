"use client";

import { useState, useEffect } from "react";

// ── Backend shapes ────────────────────────────────────────────────────────────

interface ReferralSummary {
  balance_points: number;
  balance_value: string;
  from_referrals: { points: number; friends_purchased: number };
  purchase_cashback: { points: number; orders: number };
  friends_invited: number;
  referral_code: string;
  referral_link: string;
  program: {
    friend_discount: string;
    referrer_reward_points: number;
    referrer_reward_value: string;
    point_value_naira: string;
    redeem_at: string;
  };
}

interface ReferredFriend {
  name: string;
  email: string;
  joined_at: string;
  status: string;
  status_label: string;
  points_earned: number;
}

interface CashbackEntry {
  order_number: string;
  order_total: string;
  points: number;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatNaira = (val: string | number) =>
  "₦" + Number(val).toLocaleString("en-NG");

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReferralsPage() {
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [friends, setFriends] = useState<ReferredFriend[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [cashback, setCashback] = useState<CashbackEntry[]>([]);
  const [cashbackCount, setCashbackCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"referrals" | "purchases">("referrals");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [redeemToast, setRedeemToast] = useState("");

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError("");
      try {
        const [sumRes, friendsRes, cashbackRes] = await Promise.all([
          fetch("/api/referrals/summary"),
          fetch("/api/referrals/friends"),
          fetch("/api/referrals/cashback"),
        ]);

        const [sumJson, friendsJson, cashbackJson] = await Promise.all([
          sumRes.json(),
          friendsRes.json(),
          cashbackRes.json(),
        ]);

        if (sumRes.status === 401 || friendsRes.status === 401 || cashbackRes.status === 401) {
          window.location.href = "/login?callback=" + encodeURIComponent("/account/referrals");
          return;
        }

        if (!sumRes.ok) throw new Error(sumJson.message || "Failed to load summary");

        setSummary(sumJson.data as ReferralSummary);
        setFriends(friendsJson.data?.results ?? []);
        setFriendsCount(friendsJson.data?.count ?? 0);
        setCashback(cashbackJson.data?.results ?? []);
        setCashbackCount(cashbackJson.data?.count ?? 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load referral data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const handleCopyCode = () => {
    if (!summary) return;
    navigator.clipboard?.writeText(summary.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    if (!summary) return;
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/ref/${summary.referral_code}`
        : summary.referral_link;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRedeem = () => {
    if (!summary) return;
    const redeemAt = summary.program.redeem_at;
    const pts = summary.balance_points;
    const val = formatNaira(summary.balance_value);
    const msg =
      redeemAt === "office"
        ? `Visit our office to redeem your ${pts.toLocaleString()} points (worth ${val}).`
        : `Redeem your ${pts.toLocaleString()} points (worth ${val}) at checkout.`;
    setRedeemToast(msg);
    setTimeout(() => setRedeemToast(""), 5000);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-neutral-100 rounded-2xl w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-neutral-100 rounded-2xl" />
          ))}
        </div>
        <div className="h-40 bg-neutral-100 rounded-3xl" />
        <div className="h-64 bg-neutral-100 rounded-3xl" />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error || !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-neutral-700">{error || "Could not load referral data."}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 rounded-full bg-[#00A654] text-white text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { program } = summary;
  const balanceValue = formatNaira(summary.balance_value);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Redeem Toast ── */}
      {redeemToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#00A654] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-medium text-xs sm:text-sm max-w-sm">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span>{redeemToast}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Referrals &amp; Reward Points
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Invite friends to Buckksrob and earn points on every referral and purchase you make.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRedeem}
          disabled={summary.balance_points === 0}
          className="self-start sm:self-auto px-6 py-2.5 rounded-full bg-[#00A654] hover:bg-[#008f48] disabled:bg-neutral-200 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>Redeem {summary.balance_points.toLocaleString()} Points</span>
        </button>
      </div>

      {/* ── 4 Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Balance */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-4 sm:p-5 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">Total Balance</span>
          <p className="text-xl sm:text-3xl font-extrabold text-[#00A654] mt-1">
            {summary.balance_points.toLocaleString()}{" "}
            <span className="text-xs sm:text-sm font-semibold text-neutral-500">pts</span>
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">Worth {balanceValue}</p>
        </div>

        {/* From Referrals */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-4 sm:p-5 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">From Referrals</span>
          <p className="text-xl sm:text-3xl font-extrabold text-neutral-900 mt-1">
            {summary.from_referrals.points.toLocaleString()}{" "}
            <span className="text-xs sm:text-sm font-semibold text-neutral-500">pts</span>
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">
            {summary.from_referrals.friends_purchased} friend{summary.from_referrals.friends_purchased !== 1 ? "s" : ""} purchased
          </p>
        </div>

        {/* Purchase Cashback */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-4 sm:p-5 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">Purchase Cashback</span>
          <p className="text-xl sm:text-3xl font-extrabold text-[#0265CB] mt-1">
            {summary.purchase_cashback.points.toLocaleString()}{" "}
            <span className="text-xs sm:text-sm font-semibold text-neutral-500">pts</span>
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">
            From {summary.purchase_cashback.orders} store order{summary.purchase_cashback.orders !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Friends Invited */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-4 sm:p-5 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">Friends Invited</span>
          <p className="text-xl sm:text-3xl font-extrabold text-neutral-900 mt-1">
            {summary.friends_invited}{" "}
            <span className="text-xs sm:text-sm font-semibold text-neutral-500">people</span>
          </p>
          <p className="text-[11px] text-[#00A654] font-bold mt-0.5">
            +{program.referrer_reward_points} pts per order
          </p>
        </div>
      </div>

      {/* ── Referral Code & Link + Program Info ── */}
      <div className="bg-[#FAF7F0] border border-[#EBE3D3] rounded-3xl p-5 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-[#00A654] uppercase tracking-wider">
            Share Your Link &amp; Code
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mt-0.5">
            Give {formatNaira(program.friend_discount)}, Get {program.referrer_reward_points} Points ({formatNaira(program.referrer_reward_value)})
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl">
            When a friend signs up with your code, they get {formatNaira(program.friend_discount)} off their first purchase,
            and you earn {program.referrer_reward_points} reward points (worth {formatNaira(program.referrer_reward_value)}) as soon as they order.
            1 pt = {formatNaira(program.point_value_naira)} · Redeem at: <span className="font-semibold capitalize">{program.redeem_at}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Code */}
          <div className="bg-white rounded-2xl p-4 border border-neutral-200 flex items-center justify-between gap-3 shadow-xs">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Your Referral Code</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-neutral-900">{summary.referral_code}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-all cursor-pointer shrink-0"
            >
              {copiedCode ? "Copied!" : "Copy Code"}
            </button>
          </div>

          {/* Link */}
          <div className="bg-white rounded-2xl p-4 border border-neutral-200 flex items-center justify-between gap-3 shadow-xs">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Your Referral Link</span>
              <span className="text-xs sm:text-sm text-neutral-700 truncate block font-mono">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/ref/${summary.referral_code}`
                  : summary.referral_link}
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

      {/* ── Tabs ── */}
      <div className="space-y-4">
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
            Referred Friends ({friendsCount})
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
            Purchase Cashback ({cashbackCount})
          </button>
        </div>

        {/* Tab 1: Referred Friends */}
        {activeTab === "referrals" && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs">
            {friends.length === 0 ? (
              <div className="p-10 text-center text-sm text-neutral-400">
                No referred friends yet. Share your code to get started!
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {friends.map((friend, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#00A654] font-bold text-xs flex items-center justify-center shrink-0">
                        {initials(friend.name)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900">{friend.name}</h4>
                        <p className="text-xs text-neutral-400">
                          {friend.email} · Joined {formatDate(friend.joined_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                      <div>
                        {friend.status === "account_created" && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                            {friend.status_label}
                          </span>
                        )}
                        {friend.status === "order_placed" && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0265CB] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                            {friend.status_label}
                          </span>
                        )}
                        {friend.status === "order_delivered" && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A654] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            {friend.status_label}
                          </span>
                        )}
                        {!["account_created", "order_placed", "order_delivered"].includes(friend.status) && (
                          <span className="inline-flex items-center text-xs font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                            {friend.status_label || friend.status}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        {friend.points_earned > 0 ? (
                          <span className="text-sm sm:text-base font-extrabold text-[#00A654]">
                            +{friend.points_earned} pts
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400">Pending order</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Purchase Cashback */}
        {activeTab === "purchases" && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs">
            <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 text-xs text-neutral-700 flex items-center justify-between">
              <span className="font-semibold">
                Cashback: {program.referrer_reward_points} pts = {formatNaira(program.referrer_reward_value)} · 1 pt = {formatNaira(program.point_value_naira)}
              </span>
              <span className="text-neutral-500 hidden sm:inline">Automatically credited upon delivery</span>
            </div>

            {cashback.length === 0 ? (
              <div className="p-10 text-center text-sm text-neutral-400">
                No cashback history yet. Place an order to earn points!
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {cashback.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-neutral-900">
                          Order #{item.order_number}
                        </span>
                        <span className="text-neutral-300">·</span>
                        <span className="text-xs text-neutral-400">{formatDate(item.created_at)}</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                        Order Total: {formatNaira(item.order_total)}
                      </p>
                    </div>

                    <div className="text-right self-start sm:self-auto">
                      <span className="text-sm sm:text-base font-extrabold text-[#0265CB]">
                        +{item.points} pts
                      </span>
                      <span className="block text-[10px] text-neutral-400">Credited to Balance</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
