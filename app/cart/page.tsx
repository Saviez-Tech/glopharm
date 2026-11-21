"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "@/lib/context/CartContext";

interface BackendOrderItem {
  product_id: number;
  product_name: string;
  product_image: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}

interface PlacedOrderData {
  order_number: string;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  subtotal: string;
  referral_discount?: string;
  total: string;
  created_at?: string;
  items: BackendOrderItem[];
}

interface PaymentData {
  reference: string;
  amount: string;
  status: string;
  authorization_url?: string;
}

const NIGERIAN_STATES = [
  "Akwa Ibom",
  "Lagos",
  "Abuja FCT",
  "Rivers",
  "Oyo",
  "Enugu",
  "Delta",
  "Kano",
  "Kaduna",
  "Ogun",
  "Edo",
  "Anambra",
  "Cross River",
  "Imo",
  "Abia",
  "Plateau",
];

export default function CartPage() {
  const {
    items,
    savedItems,
    updateQuantity: handleUpdateQty,
    removeItem: handleRemove,
    saveForLater: handleSaveForLater,
    moveToCart: handleMoveToCart,
    removeSaved: handleRemoveSaved,
    clearCart,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Order & payment response states
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<PlacedOrderData | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentData | null>(null);

  // Form states — empty by default, populated from authenticated user profile if logged in
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  // Auto-populate shipping details if user is logged in, else leave empty
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const res = await fetch("/api/auth/profile");
        if (!res.ok) return;
        const json = await res.json();
        const user = json.data;
        if (user) {
          setShippingForm((prev) => ({
            fullName: prev.fullName || user.name || user.full_name || "",
            email: prev.email || user.email || "",
            phone: prev.phone || user.phone_number || user.phone || "",
            address: prev.address || user.address || "",
            city: prev.city || user.city || "",
            state: prev.state || user.state || "",
          }));
        }
      } catch {
        // Guest user: leave empty
      }
    }
    loadUserProfile();
  }, []);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "transfer">("paystack");

  // Validate shipping details before proceeding to payment
  const handleValidateShipping = () => {
    const errors: Record<string, string> = {};
    if (!shippingForm.fullName.trim()) errors.fullName = "Full name is required";
    if (!shippingForm.email.trim() || !shippingForm.email.includes("@"))
      errors.email = "Valid email address is required";
    if (!shippingForm.phone.trim()) errors.phone = "Phone number is required";
    if (!shippingForm.address.trim()) errors.address = "Street delivery address is required";
    if (!shippingForm.city.trim()) errors.city = "City is required";
    if (!shippingForm.state.trim()) errors.state = "State is required";

    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      setCurrentStep(3);
    }
  };

  // Real Order Placement API call
  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    // Guard: ensure every item has a valid backend product_id
    const hasInvalidItems = items.some((item) => {
      const isNumericId =
        (typeof item.productId === "number" && item.productId > 0) ||
        (typeof item.id === "string" && /^\d+$/.test(item.id) && parseInt(item.id, 10) > 0);
      return !isNumericId;
    });

    if (hasInvalidItems) {
      setCheckoutError(
        "Some items in your cart are demo products and cannot be ordered. Please add real products from our catalog."
      );
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError("");

    try {
      // Build the exact required payload
      const payload = {
        customer_name: shippingForm.fullName.trim(),
        customer_email: shippingForm.email.trim(),
        customer_phone: shippingForm.phone.trim(),
        shipping_address: shippingForm.address.trim(),
        shipping_city: shippingForm.city.trim(),
        shipping_state: shippingForm.state.trim(),
        items: items.map((item) => {
          // Use only real numeric productId from the backend; string IDs (e.g. "m1", "g3")
          // are local fallback items and cannot be ordered — the backend requires a valid integer.
          const pid =
            typeof item.productId === "number" && item.productId > 0
              ? item.productId
              : typeof item.id === "string" && /^\d+$/.test(item.id)
              ? parseInt(item.id, 10)
              : null;
          return {
            product_id: pid ?? 0, // Will be caught by zod schema (must be positive)
            quantity: Math.max(1, item.quantity),
          };
        }),
      };

      const res = await fetch("/api/ecommerce/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => null);

      if (res.ok && resData?.data) {
        // ── SUCCESS: use the real backend response ──
        const orderData: PlacedOrderData = resData.data.order;
        const paymentRes: PaymentData = resData.data.payment;

        setConfirmedOrder(orderData);
        setPaymentInfo(paymentRes);
        clearCart();
        setOrderPlaced(true);
      } else {
        // ── API returned an error ── show it to the user, do NOT fake success
        const errMsg =
          resData?.message ||
          resData?.detail ||
          `Checkout failed (${res.status}). Please try again.`;
        setCheckoutError(errMsg);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Network error. Please check your connection.";
      setCheckoutError(msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Promo Engine
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError("Please enter a valid coupon or promo code");
      return;
    }

    if (code === "BUCKKSROB10" || code === "BRB10") {
      setAppliedDiscount(0.1);
      setPromoSuccess("10% discount applied successfully!");
    } else if (code === "GLO20") {
      setAppliedDiscount(0.2);
      setPromoSuccess("20% VIP discount applied successfully!");
    } else {
      setPromoError("Invalid code. Try 'BUCKKSROB10' for 10% off!");
    }
  };

  // Calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedDiscount ? subtotal * appliedDiscount : 0;
  const shippingFee = 0; // Free delivery
  const estimatedTax = subtotal > 0 ? Math.round((subtotal - discountAmount) * 0.05) : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingFee + estimatedTax);

  const formatNaira = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return "₦" + num.toLocaleString("en-NG");
  };

  return (
    <div className="min-h-screen bg-[#fcfcf9] text-neutral-900 flex flex-col font-sans selection:bg-[#00A654] selection:text-white relative">
      {/* Decorative grocery doodle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- Bag --%3E%3Cpath d='M20 35 h24 v30 a4 4 0 0 1 -4 4 h-16 a4 4 0 0 1 -4 -4 Z'/%3E%3Cpath d='M26 35 a6 6 0 0 1 12 0'/%3E%3C!-- Apple / Fruit --%3E%3Ccircle cx='85' cy='30' r='12'/%3E%3Cpath d='M85 18 c0 -4 4 -6 6 -6'/%3E%3Cpath d='M85 18 c2 1 5 1 7 -1'/%3E%3C!-- Carrot --%3E%3Cpath d='M25 95 l18 -18 a6 6 0 0 0 -8 -8 l-18 18 a3 3 0 0 0 8 8'/%3E%3Cpath d='M39 65 l5 -5'/%3E%3Cpath d='M42 68 l5 -3'/%3E%3C!-- Shopping Cart / Basket --%3E%3Cpath d='M80 80 h22 l-3 18 h-16 Z'/%3E%3Cpath d='M86 80 a5 5 0 0 1 10 0'/%3E%3Ccircle cx='85' cy='103' r='2' fill='%23000'/%3E%3Ccircle cx='97' cy='103' r='2' fill='%23000'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Main Cart Canvas */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Header Section: Title + Stepper */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-neutral-200/60">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-neutral-900 tracking-tight">
              {currentStep === 1 && "Your Cart"}
              {currentStep === 2 && "Shipping Details"}
              {currentStep === 3 && "Payment & Review"}
            </h1>
            <p className="text-sm sm:text-base text-neutral-500 font-medium mt-1">
              {orderPlaced
                ? "Order Completed"
                : items.length === 0
                ? "0 items"
                : `${itemCount} item${itemCount === 1 ? "" : "s"} in your cart`}
            </p>
          </div>

          {/* Stepper with Brand Green (#00A654) */}
          {!orderPlaced && (
            <div className="flex items-center gap-3 sm:gap-4 self-start md:self-auto">
              {/* Step 1: Cart */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 group cursor-pointer focus:outline-none"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                    currentStep === 1
                      ? "bg-[#00A654] text-white shadow-sm ring-4 ring-[#00A654]/15"
                      : currentStep > 1
                      ? "bg-[#00A654] text-white"
                      : "border-2 border-neutral-300 text-neutral-500"
                  }`}
                >
                  {currentStep > 1 ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : (
                    "1"
                  )}
                </div>
                <span
                  className={`text-xs sm:text-sm font-bold transition-colors ${
                    currentStep === 1 ? "text-neutral-900" : "text-neutral-500 group-hover:text-neutral-800"
                  }`}
                >
                  Cart
                </span>
              </button>

              <div
                className={`w-8 sm:w-12 h-[2px] transition-colors ${
                  currentStep >= 2 ? "bg-[#00A654]" : "bg-neutral-300"
                }`}
              />

              {/* Step 2: Shipping */}
              <button
                type="button"
                onClick={() => items.length > 0 && setCurrentStep(2)}
                disabled={items.length === 0}
                className={`flex items-center gap-2 group focus:outline-none ${
                  items.length > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                    currentStep === 2
                      ? "bg-[#00A654] text-white shadow-sm ring-4 ring-[#00A654]/15"
                      : currentStep > 2
                      ? "bg-[#00A654] text-white"
                      : "border-2 border-neutral-300 text-neutral-400"
                  }`}
                >
                  {currentStep > 2 ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : (
                    "2"
                  )}
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium transition-colors ${
                    currentStep === 2 ? "text-neutral-900 font-bold" : "text-neutral-400"
                  }`}
                >
                  Shipping
                </span>
              </button>

              <div
                className={`w-8 sm:w-12 h-[2px] transition-colors ${
                  currentStep >= 3 ? "bg-[#00A654]" : "bg-neutral-300"
                }`}
              />

              {/* Step 3: Payment */}
              <button
                type="button"
                onClick={() => items.length > 0 && handleValidateShipping()}
                disabled={items.length === 0}
                className={`flex items-center gap-2 group focus:outline-none ${
                  items.length > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                    currentStep === 3
                      ? "bg-[#00A654] text-white shadow-sm ring-4 ring-[#00A654]/15"
                      : "border-2 border-neutral-300 text-neutral-400"
                  }`}
                >
                  3
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium transition-colors ${
                    currentStep === 3 ? "text-neutral-900 font-bold" : "text-neutral-400"
                  }`}
                >
                  Payment
                </span>
              </button>
            </div>
          )}
        </div>

        {/* ── ORDER PLACED & PAYSTACK PAYMENT SCREEN ── */}
        {orderPlaced && confirmedOrder ? (
          <div className="mt-10 max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-10 text-center border border-neutral-200/90 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#00A654] flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-[#00A654] border border-emerald-200 mb-2">
                Order Created Successfully
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900">
                Order #{confirmedOrder.order_number}
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base mt-2 max-w-lg mx-auto">
                Thank you, <span className="font-semibold text-neutral-900">{confirmedOrder.customer_name}</span>. Complete your payment below to confirm dispatch.
              </p>

              {/* Paystack Payment Card */}
              {paymentInfo?.authorization_url && (
                <div className="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-[#00A654] text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#00A654] bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                          Payment Pending
                        </span>
                        <span className="text-xs text-neutral-500 font-mono">
                          Ref: {paymentInfo.reference}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                        Pay with Paystack (Cards, Transfer &amp; USSD)
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                        Amount to Pay:{" "}
                        <span className="font-extrabold text-neutral-900 text-sm sm:text-base">
                          {formatNaira(paymentInfo.amount || confirmedOrder.total)}
                        </span>
                      </p>
                    </div>

                    <a
                      href={paymentInfo.authorization_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all shrink-0 active:scale-95 cursor-pointer"
                    >
                      <span>Pay Now via Paystack</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}

              {/* Order Summary Details */}
              <div className="mt-6 border-t border-neutral-100 pt-6 text-left">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                  Delivery Destination
                </h4>
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs sm:text-sm space-y-1">
                  <p className="font-bold text-neutral-900">{confirmedOrder.customer_name} ({confirmedOrder.customer_phone})</p>
                  <p className="text-neutral-600">{confirmedOrder.shipping_address}, {confirmedOrder.shipping_city}, {confirmedOrder.shipping_state}</p>
                  <p className="text-neutral-500">{confirmedOrder.customer_email}</p>
                </div>

                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-6 mb-3">
                  Ordered Items ({confirmedOrder.items.length})
                </h4>
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden bg-white">
                  {confirmedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-10 h-10 object-contain rounded-lg border border-neutral-100 bg-neutral-50 p-1"
                        />
                        <div>
                          <p className="font-bold text-neutral-900">{item.product_name}</p>
                          <p className="text-neutral-500 text-xs">Qty: {item.quantity} × {formatNaira(item.unit_price)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-neutral-900">{formatNaira(item.line_total)}</span>
                    </div>
                  ))}
                  <div className="p-3.5 bg-neutral-50 flex items-center justify-between font-bold text-neutral-900">
                    <span>Total Amount</span>
                    <span className="text-base text-[#00A654]">{formatNaira(confirmedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/products"
                  className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-sm transition-all shadow-md"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/account/orders"
                  className="w-full sm:w-auto px-7 py-3 rounded-full border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold text-sm transition-all"
                >
                  View My Orders
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Main 2-Column Content */
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Cart Items List or Stepper Steps */}
            <div className="lg:col-span-8">
              {/* STEP 1: CART LIST */}
              {currentStep === 1 && (
                <>
                  {items.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 shadow-xs">
                      <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-neutral-900">Your cart is currently empty</h3>
                      <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
                        Explore our catalogue of farm-fresh groceries and certified pharmaceuticals.
                      </p>
                      <div className="mt-6">
                        <Link
                          href="/products"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                        >
                          <span>Explore All Products</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_6px_20px_rgba(0,0,0,0.04)]"
                        >
                          <div className="flex flex-col sm:flex-row gap-5 items-start justify-between">
                            {/* Left: Thumbnail & Details */}
                            <div className="flex items-start gap-4 sm:gap-5 w-full sm:w-auto">
                              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F6F5F0] border border-neutral-100 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-contain mix-blend-multiply transition-transform hover:scale-105 duration-300"
                                />
                              </div>

                              <div className="flex-1">
                                <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight leading-snug">
                                  {item.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 leading-relaxed">
                                  {item.specs}
                                </p>
                                <p className="text-[11px] sm:text-xs text-neutral-400 font-mono mt-0.5">
                                  {item.sku}
                                </p>

                                {/* Stock Badge */}
                                <div className="mt-2.5">
                                  {item.stockStatus === "in_stock" ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00A654] bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                      </svg>
                                      {item.stockText}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                      {item.stockText}
                                    </span>
                                  )}
                                </div>

                                {/* Controls Row */}
                                <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-5">
                                  <div className="inline-flex items-center border border-neutral-300 rounded-full px-2.5 py-1 bg-white shadow-2xs">
                                    <button
                                      type="button"
                                      aria-label="Decrease quantity"
                                      onClick={() => handleUpdateQty(item.id, -1)}
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer text-sm font-semibold"
                                    >
                                      –
                                    </button>
                                    <span className="w-7 text-center font-bold text-xs sm:text-sm text-neutral-900 select-none">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      aria-label="Increase quantity"
                                      onClick={() => handleUpdateQty(item.id, 1)}
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer text-sm font-semibold"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemove(item.id)}
                                    className="text-xs font-semibold text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                                  >
                                    Remove
                                  </button>

                                  <span className="text-neutral-200">|</span>

                                  <button
                                    type="button"
                                    onClick={() => handleSaveForLater(item.id)}
                                    className="text-xs font-semibold text-neutral-500 hover:text-[#00A654] transition-colors cursor-pointer"
                                  >
                                    Save for later
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Right: Price */}
                            <div className="sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                              <span className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                                {formatNaira(item.price * item.quantity)}
                              </span>
                              {item.quantity > 1 && (
                                <p className="text-xs text-neutral-400 mt-0.5">
                                  {formatNaira(item.price)} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Saved for Later list */}
                  {savedItems.length > 0 && (
                    <div className="mt-10 pt-8 border-t border-neutral-200/60">
                      <h3 className="text-xl font-serif font-bold text-neutral-900 mb-4">
                        Saved for Later ({savedItems.length})
                      </h3>
                      <div className="space-y-3">
                        {savedItems.map((sItem) => (
                          <div
                            key={sItem.id}
                            className="bg-white rounded-2xl border border-neutral-200/80 p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <img src={sItem.image} alt={sItem.title} className="w-12 h-12 object-contain" />
                              <div>
                                <h4 className="font-bold text-neutral-900 text-sm">{sItem.title}</h4>
                                <p className="text-xs text-neutral-500">{formatNaira(sItem.price)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleMoveToCart(sItem.id)}
                                className="text-xs font-bold text-[#00A654] hover:underline cursor-pointer"
                              >
                                Move to Cart
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSaved(sItem.id)}
                                className="text-xs text-neutral-400 hover:text-red-500 cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* STEP 2: SHIPPING ADDRESS */}
              {currentStep === 2 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900">
                        Delivery Address
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                        Provide your delivery destination below.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#0265CB] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      Standard &amp; Express Delivery
                    </span>
                  </div>

                  {/* Shipping Fee Notice */}
                  <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 text-amber-950">
                    <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    <div className="text-xs leading-relaxed">
                      <p className="font-bold text-amber-900">Notice regarding delivery costs:</p>
                      <p className="mt-0.5 text-amber-800">
                        Shipping is not free. Delivery fees are determined by the weight and dimensions of your packaged items and your delivery location. The exact shipping fee will be calculated and communicated to you after your goods are packaged.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter recipient's full name"
                        value={shippingForm.fullName}
                        onChange={(e) => {
                          setShippingForm({ ...shippingForm, fullName: e.target.value });
                          if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: "" });
                        }}
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-neutral-800 outline-none transition-all ${
                          formErrors.fullName
                            ? "border-red-500 bg-red-50/20"
                            : "border-neutral-300/80 bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15"
                        }`}
                      />
                      {formErrors.fullName && (
                        <p className="text-[11px] text-red-500 mt-1">{formErrors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={shippingForm.email}
                        onChange={(e) => {
                          setShippingForm({ ...shippingForm, email: e.target.value });
                          if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                        }}
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-neutral-800 outline-none transition-all ${
                          formErrors.email
                            ? "border-red-500 bg-red-50/20"
                            : "border-neutral-300/80 bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15"
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-[11px] text-red-500 mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Phone Number (SMS tracking) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 08169728780 or +2348169728780"
                        value={shippingForm.phone}
                        onChange={(e) => {
                          setShippingForm({ ...shippingForm, phone: e.target.value });
                          if (formErrors.phone) setFormErrors({ ...formErrors, phone: "" });
                        }}
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-neutral-800 outline-none transition-all ${
                          formErrors.phone
                            ? "border-red-500 bg-red-50/20"
                            : "border-neutral-300/80 bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15"
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-[11px] text-red-500 mt-1">{formErrors.phone}</p>
                      )}
                    </div>

                    {/* Street Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter street delivery address"
                        value={shippingForm.address}
                        onChange={(e) => {
                          setShippingForm({ ...shippingForm, address: e.target.value });
                          if (formErrors.address) setFormErrors({ ...formErrors, address: "" });
                        }}
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-neutral-800 outline-none transition-all ${
                          formErrors.address
                            ? "border-red-500 bg-red-50/20"
                            : "border-neutral-300/80 bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15"
                        }`}
                      />
                      {formErrors.address && (
                        <p className="text-[11px] text-red-500 mt-1">{formErrors.address}</p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter delivery city"
                        value={shippingForm.city}
                        onChange={(e) => {
                          setShippingForm({ ...shippingForm, city: e.target.value });
                          if (formErrors.city) setFormErrors({ ...formErrors, city: "" });
                        }}
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-neutral-800 outline-none transition-all ${
                          formErrors.city
                            ? "border-red-500 bg-red-50/20"
                            : "border-neutral-300/80 bg-white focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15"
                        }`}
                      />
                      {formErrors.city && (
                        <p className="text-[11px] text-red-500 mt-1">{formErrors.city}</p>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={shippingForm.state}
                        onChange={(e) => {
                          setShippingForm({ ...shippingForm, state: e.target.value });
                          if (formErrors.state) setFormErrors({ ...formErrors, state: "" });
                        }}
                        className="w-full rounded-xl border border-neutral-300/80 px-4 py-2.5 text-sm text-neutral-800 focus:border-[#00A654] outline-none bg-white cursor-pointer"
                      >
                        {NIGERIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {formErrors.state && (
                        <p className="text-[11px] text-red-500 mt-1">{formErrors.state}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-sm font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                    >
                      ← Back to Cart
                    </button>
                    <button
                      type="button"
                      onClick={handleValidateShipping}
                      className="px-7 py-3 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Continue to Payment</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT & REVIEW */}
              {currentStep === 3 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-6">
                  {/* Shipping Destination Summary Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5EC] border border-[#ECE5D8] flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00A654] bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                          Shipment Destination
                        </span>
                      </div>
                      <p className="text-sm font-bold text-neutral-900">
                        {shippingForm.fullName} · {shippingForm.phone}
                      </p>
                      <p className="text-xs text-neutral-700 mt-0.5">
                        {shippingForm.address}, {shippingForm.city}, {shippingForm.state}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">{shippingForm.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-[#00A654] hover:underline cursor-pointer py-1 px-2.5 rounded-lg hover:bg-emerald-50"
                    >
                      Change
                    </button>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 mb-4">
                      Payment Method
                    </h2>

                    <div className="p-4 rounded-2xl border-2 border-[#00A654] bg-emerald-50/40 shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#00A654] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          ✓
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-neutral-900">Paystack Secure Checkout</p>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#00A654] text-white px-2 py-0.5 rounded-full">
                              Instant
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 mt-0.5">
                            Pay securely with your Debit Card (Visa, Mastercard, Verve), Bank Transfer, or USSD
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-neutral-700 shrink-0">
                        <svg className="w-6 h-6 text-[#00A654]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Order Review List */}
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">
                      Review Items ({itemCount})
                    </h3>
                    <div className="divide-y divide-neutral-100 border border-neutral-200/90 rounded-2xl overflow-hidden bg-neutral-50/50">
                      {items.map((it) => (
                        <div key={it.id} className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-3">
                            <img src={it.image} alt={it.title} className="w-10 h-10 object-contain rounded-lg border border-neutral-200 bg-white p-1" />
                            <div>
                              <p className="font-bold text-neutral-900">{it.title}</p>
                              <p className="text-neutral-500 text-xs">Qty: {it.quantity}</p>
                            </div>
                          </div>
                          <span className="font-bold text-neutral-900">{formatNaira(it.price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {checkoutError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                      {checkoutError}
                    </div>
                  )}

                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-sm font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                    >
                      ← Back to Shipping
                    </button>
                    <button
                      type="button"
                      disabled={isCheckingOut || items.length === 0}
                      onClick={handlePlaceOrder}
                      className="px-7 py-3 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isCheckingOut ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Processing Order...</span>
                        </>
                      ) : (
                        <span>Place Order · {formatNaira(total)}</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="lg:col-span-4 sticky top-28">
              <div className="bg-[#FAF5EC]/85 backdrop-blur-sm rounded-3xl border border-[#ECE5D8] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 tracking-tight">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-3.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</span>
                    <span className="font-semibold text-neutral-900">{formatNaira(subtotal)}</span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex items-center justify-between text-[#00A654] font-medium">
                      <span>Promo Discount ({(appliedDiscount * 100).toFixed(0)}%)</span>
                      <span className="font-bold">-{formatNaira(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1 py-1 text-xs sm:text-sm">
                    <div className="flex items-center justify-between text-neutral-700">
                      <span className="font-medium">Shipping</span>
                      <span className="font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                        Calculated after packaging
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      Shipping fee is calculated and communicated to you after packaging your goods.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Estimated Tax (5%)</span>
                    <span className="font-semibold text-neutral-900">{formatNaira(estimatedTax)}</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="mt-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (try BRB10)"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoError("");
                        setPromoSuccess("");
                      }}
                      className="flex-1 bg-white rounded-full border border-neutral-300/80 px-4 py-2.5 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#00A654] focus:ring-1 focus:ring-[#00A654]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {promoError && (
                    <p className="text-[11px] text-red-500 font-medium mt-1.5 pl-3">{promoError}</p>
                  )}
                  {promoSuccess && (
                    <p className="text-[11px] text-[#00A654] font-semibold mt-1.5 pl-3">{promoSuccess}</p>
                  )}
                </form>

                {/* Divider Line */}
                <div className="border-t border-neutral-300/70 my-6 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-bold text-neutral-900">Total</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                      {formatNaira(total)}
                    </span>
                  </div>
                </div>

                {/* Main Action Button */}
                <button
                  type="button"
                  disabled={items.length === 0 || isCheckingOut}
                  onClick={() => {
                    if (currentStep === 1) setCurrentStep(2);
                    else if (currentStep === 2) handleValidateShipping();
                    else if (currentStep === 3) handlePlaceOrder();
                  }}
                  className={`w-full py-3.5 sm:py-4 px-6 rounded-full font-bold text-sm sm:text-base text-white transition-all shadow-[0_6px_20px_rgba(0,166,84,0.28)] flex items-center justify-center gap-2 cursor-pointer ${
                    items.length === 0 || isCheckingOut
                      ? "bg-neutral-300 cursor-not-allowed shadow-none"
                      : "bg-[#00A654] hover:bg-[#008f48] active:scale-[0.99]"
                  }`}
                >
                  <span>
                    {currentStep === 1 && "Proceed to Checkout"}
                    {currentStep === 2 && "Continue to Payment"}
                    {currentStep === 3 && (isCheckingOut ? "Processing..." : `Pay ${formatNaira(total)}`)}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>

                {/* Trust Badges */}
                <div className="mt-6 space-y-2.5 pt-4 border-t border-neutral-200/60">
                  <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                    <svg className="w-4 h-4 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                    <span>Secure Paystack &amp; SSL Encrypted Checkout</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                    <svg className="w-4 h-4 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-1.5-4.875L18.75 4.5H15m4.5 9.75H15M3.375 14.25H15M3.375 14.25h1.125m10.5 0v-4.5m0 0V4.5M15 9.75h3.75" />
                    </svg>
                    <span>Careful, temperature-monitored packaging</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                    <svg className="w-4 h-4 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span>NAFDAC verified pharmaceuticals &amp; farm produce</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
