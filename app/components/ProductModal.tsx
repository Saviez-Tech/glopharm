"use client";

import React, { useState, useEffect } from "react";
import { Product } from "./ProductCard";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "info" | "reviews">("description");
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  // Reset state when product changes
  useEffect(() => {
    setQuantity(1);
    setSelectedThumb(0);
    setIsAdded(false);
    setActiveTab("description");
  }, [product]);

  // Lock body scroll while open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [product]);

  if (!product) return null;

  // Generate mock thumbnail variants (same image with different crop params)
  const thumbs = [
    product.image,
    product.image.replace("w=500", "w=500").replace("fit=crop", "fit=crop&crop=entropy"),
    product.image.replace("q=80", "q=60"),
    product.image.replace("auto=format", "auto=compress"),
  ];

  const discountPct = 30;
  const rawPrice = typeof product.price === "string"
    ? parseFloat(product.price.replace(/,/g, ""))
    : product.price;
  const originalPrice = Math.round(rawPrice / (1 - discountPct / 100));
  const currency = product.currency ?? "₦";

  const formatPrice = (n: number) =>
    n.toLocaleString("en-NG", { minimumFractionDigits: 0 });

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal Panel */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">

          {/* ── TOP SECTION: Image + Details ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            {/* LEFT: Image Gallery */}
            <div className="bg-[#f3f5f7] p-6 sm:p-10 flex flex-col gap-4 items-center justify-center min-h-[280px] sm:min-h-[420px]">
              {/* Discount badge */}
              <div className="self-start">
                <span className="inline-flex items-center px-2.5 py-1 bg-red-500 text-white text-xs font-black rounded-full shadow">
                  -{discountPct}%
                </span>
              </div>

              {/* Main Image */}
              <div className="flex-1 flex items-center justify-center w-full">
                <img
                  src={thumbs[selectedThumb]}
                  alt={product.title}
                  className="max-h-52 sm:max-h-72 w-auto object-contain select-none transition-all duration-300"
                />
              </div>

              {/* Thumbnail Strip */}
              <div className="flex items-center gap-2.5 mt-2">
                {thumbs.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedThumb(i)}
                    className={`w-14 h-14 rounded-xl bg-white border-2 flex items-center justify-center overflow-hidden transition-all ${selectedThumb === i
                        ? "border-[#00A654] shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Product Details */}
            <div className="p-6 sm:p-8 flex flex-col gap-4">

              {/* Category pill */}
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#00A654]">
                GloPharm Store
              </span>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-snug">
                {product.title}
              </h2>

              {/* Star Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= 4 ? "text-[#F8C519]" : "text-gray-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-900">4.0</span>
                <span className="text-xs text-gray-400">· 124 reviews</span>
              </div>

              {/* Price block */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-gray-900">
                  {currency}{typeof product.price === "string" ? product.price : formatPrice(rawPrice)}
                </span>
                <span className="text-sm font-semibold text-gray-400 line-through">
                  {currency}{formatPrice(originalPrice)}
                </span>
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  Save {discountPct}%
                </span>
              </div>

              {/* Short description */}
              <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                {product.description}
              </p>

              {/* Quantity + Add to cart */}
              <div className="flex items-center gap-3 pt-2">
                {/* Quantity stepper */}
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-extrabold text-gray-900 text-sm select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors font-bold text-lg"
                  >
                    +
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isAdded
                      ? "bg-[#00A654] text-white"
                      : "bg-[#0265CB] hover:bg-[#0254aa] text-white shadow-[0_4px_14px_rgba(2,101,203,0.35)]"
                    }`}
                >
                  {isAdded ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>

                {/* Wishlist */}
                <button
                  type="button"
                  aria-label="Add to wishlist"
                  className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </button>
              </div>



            </div>
          </div>

          {/* ── BOTTOM SECTION: Tabs ── */}
          <div className="border-t border-gray-100 px-6 sm:px-8 pb-8">

            {/* Tab Headers */}
            <div className="flex gap-0 border-b border-gray-100 mt-2">
              {(["description", "info", "reviews"] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3.5 text-xs sm:text-sm font-bold capitalize tracking-wide transition-all border-b-2 -mb-px ${activeTab === tab
                      ? "border-[#00A654] text-[#00A654]"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                    }`}
                >
                  {tab === "info" ? "Additional Info" : tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="pt-6 text-sm text-gray-600 leading-relaxed">
              {activeTab === "description" && (
                <div className="flex flex-col gap-3">
                  <p>{product.description}</p>
                  <p>
                    This product is carefully sourced and quality-checked by GloPharm&apos;s certified team. It meets
                    all NAFDAC standards and is stored under optimal conditions to ensure maximum freshness and efficacy
                    when it reaches your doorstep.
                  </p>
                  <ul className="list-disc list-inside text-gray-500 flex flex-col gap-1.5 mt-1">
                    <li>100% authentic and certified product</li>
                    <li>Stored in temperature-controlled facilities</li>
                    <li>Tamper-evident sealed packaging</li>
                    <li>Expiry date printed on every unit</li>
                  </ul>
                </div>
              )}

              {activeTab === "info" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    ["Weight", "Varies by unit"],
                    ["Origin", "Nigeria / Imported"],
                    ["Category", "Grocery & Wellness"],
                    ["Storage", "Cool & dry place"],
                    ["Shelf life", "12 – 24 months"],
                    ["Certification", "NAFDAC Approved"],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="flex flex-col gap-5">
                  {[
                    { name: "Chidi A.", rating: 5, date: "Oct 2026", text: "Excellent quality product, delivered the same day. Will definitely order again from GloPharm!" },
                    { name: "Ngozi O.", rating: 4, date: "Sep 2026", text: "Good value for money and packaging was intact. The product matched the description perfectly." },
                    { name: "Emeka D.", rating: 4, date: "Aug 2026", text: "Fast delivery and authentic product. My go-to for all health and grocery needs in Lagos." },
                  ].map((r) => (
                    <div key={r.name} className="flex gap-3 pb-5 border-b border-gray-100 last:border-0">
                      <div className="w-9 h-9 rounded-full bg-[#00A654]/10 flex items-center justify-center text-[#00A654] font-black text-sm shrink-0">
                        {r.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-gray-900 text-sm">{r.name}</span>
                          <span className="text-[11px] text-gray-400">{r.date}</span>
                        </div>
                        <div className="flex gap-0.5 my-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <svg key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-[#F8C519]" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{r.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
