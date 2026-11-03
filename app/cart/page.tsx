"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface CartItem {
  id: string;
  title: string;
  specs: string;
  sku: string;
  price: number;
  quantity: number;
  stockStatus: "in_stock" | "low_stock";
  stockText: string;
  image: string;
}

const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: "cart-1",
    title: "Vitamin C 1000mg Effervescent",
    specs: "Orange Flavor · 30 Effervescent Tablets",
    sku: "SKU: GP-VITC-1000",
    price: 4500,
    quantity: 1,
    stockStatus: "in_stock",
    stockText: "In Stock",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cart-2",
    title: "Farm Fresh Organic Eggs (Crate)",
    specs: "30 Large Free-Range Eggs · Grade A",
    sku: "SKU: GP-EGG-FR30",
    price: 4200,
    quantity: 1,
    stockStatus: "in_stock",
    stockText: "In Stock",
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cart-3",
    title: "Cod Liver Oil Omega-3",
    specs: "90 Softgels · High Potency EPA/DHA",
    sku: "SKU: GP-OMEGA-090",
    price: 9800,
    quantity: 2,
    stockStatus: "low_stock",
    stockText: "Only 3 left",
    image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=80",
  },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Form states for checkout demo (sample text rendered as faint placeholders)
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "wallets">("card");

  // Quantity updates
  const handleUpdateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove item
  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Save for later
  const handleSaveForLater = (id: string) => {
    const itemToSave = items.find((item) => item.id === id);
    if (itemToSave) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSavedItems((prev) => [...prev, itemToSave]);
    }
  };

  // Move back to cart
  const handleMoveToCart = (id: string) => {
    const itemToRestore = savedItems.find((item) => item.id === id);
    if (itemToRestore) {
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
      setItems((prev) => [...prev, itemToRestore]);
    }
  };

  // Remove from saved
  const handleRemoveSaved = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Apply promo
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError("Please enter a valid coupon or promo code");
      return;
    }

    if (code === "GLOPHARM10" || code === "GLO10") {
      setAppliedDiscount(0.1); // 10%
      setPromoSuccess("10% discount applied successfully!");
    } else if (code === "GLO20") {
      setAppliedDiscount(0.2); // 20%
      setPromoSuccess("20% VIP discount applied successfully!");
    } else {
      setPromoError("Invalid code. Try 'GLOPHARM10' for 10% off!");
    }
  };

  // Calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedDiscount ? subtotal * appliedDiscount : 0;
  const shippingFee = subtotal > 0 ? 0 : 0; // Free shipping
  const estimatedTax = subtotal > 0 ? Math.round((subtotal - discountAmount) * 0.05) : 0; // 5% tax
  const total = Math.max(0, subtotal - discountAmount + shippingFee + estimatedTax);

  const formatNaira = (val: number) => "₦" + val.toLocaleString("en-NG");

  return (
    <div className="min-h-screen bg-[#fcfcf9] text-neutral-900 flex flex-col font-sans selection:bg-[#00A654] selection:text-white relative">
      {/* Decorative grocery doodle background pattern from Hero Section */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- Bag --%3E%3Cpath d='M20 35 h24 v30 a4 4 0 0 1 -4 4 h-16 a4 4 0 0 1 -4 -4 Z'/%3E%3Cpath d='M26 35 a6 6 0 0 1 12 0'/%3E%3C!-- Apple / Fruit --%3E%3Ccircle cx='85' cy='30' r='12'/%3E%3Cpath d='M85 18 c0 -4 4 -6 6 -6'/%3E%3Cpath d='M85 18 c2 1 5 1 7 -1'/%3E%3C!-- Carrot --%3E%3Cpath d='M25 95 l18 -18 a6 6 0 0 0 -8 -8 l-18 18 a3 3 0 0 0 8 8'/%3E%3Cpath d='M39 65 l5 -5'/%3E%3Cpath d='M42 68 l5 -3'/%3E%3C!-- Shopping Cart / Basket --%3E%3Cpath d='M80 80 h22 l-3 18 h-16 Z'/%3E%3Cpath d='M86 80 a5 5 0 0 1 10 0'/%3E%3Ccircle cx='85' cy='103' r='2' fill='%23000'/%3E%3Ccircle cx='97' cy='103' r='2' fill='%23000'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Glopharm Shared Navbar */}
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
              {items.length === 0 ? "0 items" : `${itemCount} item${itemCount === 1 ? "" : "s"}`}
            </p>
          </div>

          {/* Stepper with Brand Green (#00A654) */}
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

            {/* Line connector */}
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

            {/* Line connector */}
            <div
              className={`w-8 sm:w-12 h-[2px] transition-colors ${
                currentStep >= 3 ? "bg-[#00A654]" : "bg-neutral-300"
              }`}
            />

            {/* Step 3: Payment */}
            <button
              type="button"
              onClick={() => items.length > 0 && setCurrentStep(3)}
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
        </div>

        {/* Order Placed Success Screen */}
        {orderPlaced ? (
          <div className="mt-12 bg-white rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto border border-neutral-200/80 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#00A654] flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900">
              Thank You for Your Order!
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base mt-2 max-w-md mx-auto">
              Your order <span className="font-mono font-bold text-neutral-800">#GLO-98421</span> has been placed
              successfully. We have dispatched a confirmation SMS and receipt to your email.
            </p>

            <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/products"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-sm transition-all shadow-md"
              >
                Continue Shopping
              </a>
              <button
                type="button"
                onClick={() => {
                  setOrderPlaced(false);
                  setCurrentStep(1);
                  setItems(INITIAL_CART_ITEMS);
                }}
                className="w-full sm:w-auto px-7 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold text-sm transition-all"
              >
                Reset Demo Cart
              </button>
            </div>
          </div>
        ) : (
          /* Main 2-Column Content */
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Cart Items List or Stepper Steps */}
            <div className="lg:col-span-8">
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
                        <a
                          href="/products"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-sm shadow-md transition-all"
                        >
                          <span>Explore All Products</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                          </svg>
                        </a>
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
                              {/* Product Thumbnail Container */}
                              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F6F5F0] border border-neutral-100 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-contain mix-blend-multiply transition-transform hover:scale-105 duration-300"
                                />
                              </div>

                              {/* Details */}
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

                                {/* Controls Row: Quantity + Remove + Save for later */}
                                <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-5">
                                  {/* Quantity pill */}
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

                                  {/* Remove Link */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemove(item.id)}
                                    className="text-xs sm:text-sm text-neutral-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
                                  >
                                    Remove
                                  </button>

                                  {/* Save for later Link */}
                                  <button
                                    type="button"
                                    onClick={() => handleSaveForLater(item.id)}
                                    className="text-xs sm:text-sm text-neutral-500 hover:text-[#0265CB] font-medium transition-colors cursor-pointer"
                                  >
                                    Save for later
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Right: Price */}
                            <div className="text-right sm:self-start w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-neutral-100 flex sm:flex-col justify-between items-center sm:items-end">
                              <span className="text-xs text-neutral-400 sm:hidden">Total Price</span>
                              <div className="text-right">
                                <span className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight">
                                  {formatNaira(item.price * item.quantity)}
                                </span>
                                {item.quantity > 1 && (
                                  <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                                    {formatNaira(item.price)} each
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Saved for Later Section */}
                  {savedItems.length > 0 && (
                    <div className="mt-10 pt-8 border-t border-neutral-200">
                      <h3 className="text-xl font-serif font-bold text-neutral-900 mb-4">
                        Saved for Later ({savedItems.length})
                      </h3>
                      <div className="space-y-4">
                        {savedItems.map((sItem) => (
                          <div
                            key={sItem.id}
                            className="bg-white/80 rounded-2xl border border-neutral-200/70 p-4 sm:p-5 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl bg-[#F6F5F0] p-1.5 shrink-0 overflow-hidden">
                                <img
                                  src={sItem.image}
                                  alt={sItem.title}
                                  className="w-full h-full object-contain mix-blend-multiply"
                                />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-neutral-900">{sItem.title}</h4>
                                <p className="text-xs text-neutral-500">{formatNaira(sItem.price)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleMoveToCart(sItem.id)}
                                className="px-3.5 py-1.5 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white text-xs font-bold transition-all shadow-xs"
                              >
                                Move to Cart
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSaved(sItem.id)}
                                className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Continue Shopping Link */}
                  <div className="mt-8">
                    <a
                      href="/products"
                      className="inline-flex items-center gap-2 text-sm font-bold text-neutral-900 hover:text-[#00A654] transition-colors group"
                    >
                      <span className="transition-transform group-hover:-translate-x-1">←</span>
                      <span>Continue Shopping</span>
                    </a>
                  </div>
                </>
              )}

              {/* Step 2: Shipping Form */}
              {currentStep === 2 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 mb-6">
                    Delivery Address
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Amaka Okafor"
                        value={shippingForm.fullName}
                        onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                        className="w-full rounded-xl border border-neutral-300/80 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400/40 placeholder:font-light focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. amaka.okafor@example.com"
                        value={shippingForm.email}
                        onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                        className="w-full rounded-xl border border-neutral-300/80 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400/40 placeholder:font-light focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Phone Number (SMS Updates)
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +234 803 123 4567"
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        className="w-full rounded-xl border border-neutral-300/80 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400/40 placeholder:font-light focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Street Address
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 14 Victoria Island Boulevard, Lagos"
                        value={shippingForm.address}
                        onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                        className="w-full rounded-xl border border-neutral-300/80 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400/40 placeholder:font-light focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        City / State
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lagos State"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                        className="w-full rounded-xl border border-neutral-300/80 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400/40 placeholder:font-light focus:border-[#00A654] focus:ring-2 focus:ring-[#00A654]/15 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Delivery Speed
                      </label>
                      <select className="w-full rounded-xl border border-neutral-300/80 px-4 py-2.5 text-sm text-neutral-800 focus:border-[#00A654] outline-none bg-white">
                        <option>Standard Delivery (Free · 2-4 Hours)</option>
                        <option>Express Priority (₦1,500 · Within 1 Hour)</option>
                      </select>
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
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2.5 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white text-sm font-bold shadow-md transition-all cursor-pointer"
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Selection */}
              {currentStep === 3 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 mb-6">
                    Choose Payment Method
                  </h2>

                  <div className="space-y-3">
                    {/* Option 1: Card */}
                    <label
                      onClick={() => setPaymentMethod("card")}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "card"
                          ? "border-[#00A654] bg-emerald-50/40"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          className="w-4 h-4 text-[#00A654] focus:ring-[#00A654]"
                        />
                        <div>
                          <p className="text-sm font-bold text-neutral-900">Debit / Credit Card</p>
                          <p className="text-xs text-neutral-500">Paystack / Flutterwave secured (Visa, Mastercard, Verve)</p>
                        </div>
                      </div>
                      {/* Real SVG Card Icon */}
                      <div className="flex items-center gap-1.5 text-neutral-500">
                        <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                      </div>
                    </label>

                    {/* Option 2: Bank Transfer */}
                    <label
                      onClick={() => setPaymentMethod("transfer")}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "transfer"
                          ? "border-[#00A654] bg-emerald-50/40"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "transfer"}
                          onChange={() => setPaymentMethod("transfer")}
                          className="w-4 h-4 text-[#00A654] focus:ring-[#00A654]"
                        />
                        <div>
                          <p className="text-sm font-bold text-neutral-900">Instant Bank Transfer</p>
                          <p className="text-xs text-neutral-500">Auto-generated dynamic virtual bank account</p>
                        </div>
                      </div>
                      {/* Real SVG Bank Pillars Icon */}
                      <div className="text-neutral-600">
                        <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5m-15 10.5V10.5M3 21h18M1.5 10.5h21" />
                        </svg>
                      </div>
                    </label>

                    {/* Option 3: Apple Pay / Google Pay */}
                    <label
                      onClick={() => setPaymentMethod("wallets")}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "wallets"
                          ? "border-[#00A654] bg-emerald-50/40"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "wallets"}
                          onChange={() => setPaymentMethod("wallets")}
                          className="w-4 h-4 text-[#00A654] focus:ring-[#00A654]"
                        />
                        <div>
                          <p className="text-sm font-bold text-neutral-900">Apple Pay / Google Pay</p>
                          <p className="text-xs text-neutral-500">Fast, 1-tap checkout with Face ID, Touch ID, or Google Wallet</p>
                        </div>
                      </div>
                      {/* Real SVG Brand Logos: Apple Pay & Google Pay */}
                      <div className="flex items-center gap-2">
                        {/* Apple Pay SVG */}
                        <div className="flex items-center gap-1 bg-black text-white px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
                            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.07-7.8-8.08-12.31-15.03-6.23-9.63-11.08-20.91-14.54-33.84-3.46-12.92-5.19-24.81-5.19-35.65 0-15.11 3.84-27.42 11.53-36.93 7.69-9.51 17.51-14.35 29.47-14.53 4.8 0 10.37 1.34 16.71 4.02 6.34 2.68 10.42 4.08 12.24 4.19 1.58-.11 5.9-1.59 12.96-4.43 7.06-2.85 12.87-4.14 17.43-3.88 13.5.76 24.36 5.86 32.58 15.31-11.75 7.15-17.47 16.9-17.16 29.25.32 9.87 4.19 18.06 11.61 24.58 7.42 6.52 16.14 10.23 26.16 11.13-2.18 6.54-4.7 13.1-7.57 19.68zM119.22 31.85c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.96-10.45 19.98-12.18.22 1.52.33 2.93.33 4.24 0 7.39-2.76 14.39-8.28 21.01-5.52 6.62-12.28 10.66-20.28 12.12-.22-1.52-.33-2.93-.33-4.52z" />
                          </svg>
                          <span>Pay</span>
                        </div>

                        {/* Google Pay SVG */}
                        <div className="flex items-center gap-1 bg-white border border-neutral-300 px-2 py-1 rounded-md text-xs font-semibold shadow-2xs">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z" />
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z" />
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                          </svg>
                          <span className="text-neutral-700">Pay</span>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-sm font-bold text-neutral-600 hover:text-neutral-900"
                    >
                      ← Back to Shipping
                    </button>
                    <button
                      type="button"
                      disabled={isCheckingOut}
                      onClick={() => {
                        setIsCheckingOut(true);
                        setTimeout(() => {
                          setIsCheckingOut(false);
                          setOrderPlaced(true);
                        }, 1200);
                      }}
                      className="px-7 py-3 rounded-full bg-[#00A654] hover:bg-[#008f48] text-white text-sm font-bold shadow-md transition-all flex items-center gap-2"
                    >
                      {isCheckingOut ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>Place Order · {formatNaira(total)}</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary Card (Matching the Reference Layout & Glopharm Color Palette) */}
            <div className="lg:col-span-4 sticky top-28">
              <div className="bg-[#FAF5EC]/85 backdrop-blur-sm rounded-3xl border border-[#ECE5D8] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                {/* Header */}
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 tracking-tight">
                  Order Summary
                </h2>

                {/* Breakdown */}
                <div className="mt-6 space-y-3.5 text-xs sm:text-sm">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>
                      Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})
                    </span>
                    <span className="font-semibold text-neutral-900">{formatNaira(subtotal)}</span>
                  </div>

                  {/* Discount row if promo applied */}
                  {appliedDiscount && (
                    <div className="flex items-center justify-between text-[#00A654] font-medium">
                      <span>Promo Discount ({(appliedDiscount * 100).toFixed(0)}%)</span>
                      <span className="font-bold">-{formatNaira(discountAmount)}</span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span className="font-bold text-[#00A654]">
                      {shippingFee === 0 ? "Free" : formatNaira(shippingFee)}
                    </span>
                  </div>

                  {/* Estimated Tax */}
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Estimated Tax (5%)</span>
                    <span className="font-semibold text-neutral-900">{formatNaira(estimatedTax)}</span>
                  </div>
                </div>

                {/* Promo Code Input & Button (Pill layout matching reference) */}
                <form onSubmit={handleApplyPromo} className="mt-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (try GLO10)"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoError("");
                        setPromoSuccess("");
                      }}
                      className="flex-1 bg-white rounded-full border border-neutral-300/80 px-4 py-2.5 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#00A654] focus:ring-1 focus:ring-[#00A654]"
                    />
                    {/* Apply button: Clean dark / brand button */}
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

                {/* Big Proceed to Checkout Button - Glopharm Brand Green (#00A654) */}
                <button
                  type="button"
                  disabled={items.length === 0}
                  onClick={() => {
                    if (currentStep === 1) setCurrentStep(2);
                    else if (currentStep === 2) setCurrentStep(3);
                    else if (currentStep === 3) {
                      setIsCheckingOut(true);
                      setTimeout(() => {
                        setIsCheckingOut(false);
                        setOrderPlaced(true);
                      }, 1000);
                    }
                  }}
                  className={`w-full py-3.5 sm:py-4 px-6 rounded-full font-bold text-sm sm:text-base text-white transition-all shadow-[0_6px_20px_rgba(0,166,84,0.28)] flex items-center justify-center gap-2 cursor-pointer ${
                    items.length === 0
                      ? "bg-neutral-300 cursor-not-allowed shadow-none"
                      : "bg-[#00A654] hover:bg-[#008f48] active:scale-[0.99]"
                  }`}
                >
                  <span>
                    {currentStep === 1 && "Proceed to Checkout"}
                    {currentStep === 2 && "Continue to Payment"}
                    {currentStep === 3 && `Pay ${formatNaira(total)}`}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>

                {/* Trust Badges & Assurances (Matching Reference Image) */}
                <div className="mt-6 space-y-2.5 pt-4 border-t border-neutral-200/60">
                  <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                    {/* Shield outline icon */}
                    <svg className="w-4 h-4 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                    <span>Secure checkout, encrypted payment</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                    {/* Free delivery icon */}
                    <svg className="w-4 h-4 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-1.5-4.875L18.75 4.5H15m4.5 9.75H15M3.375 14.25H15M3.375 14.25h1.125m10.5 0v-4.5m0 0V4.5M15 9.75h3.75" />
                    </svg>
                    <span>Free temperature-controlled delivery on this order</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                    {/* Pharmacist Guarantee */}
                    <svg className="w-4 h-4 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span>100% genuine farm produce & pharmacy certified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
