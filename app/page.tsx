"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import ProductCard, { Product } from "./components/ProductCard";
import Footer from "./components/Footer";
import LabResultSection from "./components/LabResultSection";
import ProductModal from "./components/ProductModal";

// Row 1 Products: Sliding from Right to Left (Marquee)
const marqueeProducts: Product[] = [
  {
    id: "m1",
    title: "Golden Morn Cereal (900g)",
    description: "Nutritious whole grain cereal fortified with vitamin A, iron, and minerals.",
    price: "3,500",
    currency: "₦",
    image: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=500&auto=format&fit=crop&q=80",
    initialQuantity: 0,
  },
  {
    id: "m2",
    title: "Fresh Whole Milk (1L)",
    description: "Pasteurized farm-fresh dairy milk rich in calcium, protein, and nutrients.",
    price: "1,800",
    currency: "₦",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80",
    initialQuantity: 1, // Demonstrating active in-cart state
  },
  {
    id: "m3",
    title: "Vitamin C 1000mg Effervescent",
    description: "High potency daily immune support drink tablets with orange flavor.",
    price: "4,500",
    currency: "₦",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80",
    initialQuantity: 0,
  },
  {
    id: "m4",
    title: "Crisp Green Apples (6 Pack)",
    description: "Hand-picked crunchy sweet apples freshly imported and packed for freshness.",
    price: "2,900",
    currency: "₦",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80",
    initialQuantity: 0,
  },
  {
    id: "m5",
    title: "Malted Chocolate Drink (500g)",
    description: "Enriched malted chocolate beverage packed with active energy vitamins.",
    price: "3,200",
    currency: "₦",
    image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500&auto=format&fit=crop&q=80",
    initialQuantity: 0,
  },
  {
    id: "m6",
    title: "Multivitamin Daily Formula",
    description: "Comprehensive 30-in-1 vital supplement for all-day energy and wellness.",
    price: "8,500",
    currency: "₦",
    image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=80",
    initialQuantity: 0,
  },
];

// Next Two Rows: 8 Static Products (2 Rows x 4 Columns)
const gridProducts: Product[] = [
  {
    id: "g1",
    title: "Farm Fresh Organic Eggs (Crate)",
    description: "Freshly collected high-protein free-range eggs from verified local poultry.",
    price: "4,200",
    currency: "₦",
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500&auto=format&fit=crop&q=80",
    initialQuantity: 0,
  },
  {
    id: "g2",
    title: "Pain Relief Paracetamol Extra",
    description: "Fast-acting effective relief from headaches, body aches, and fever symptoms.",
    price: "1,500",
    currency: "₦",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80",
    initialQuantity: 0,
  },
  {
    id: "g3",
    title: "Golden Corn Flakes (500g)",
    description: "Crispy roasted whole corn flakes packed with essential B vitamins.",
    price: "2,600",
    currency: "₦",
    image: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=500&auto=format&fit=crop&q=80",
    initialQuantity: 0,
  },
  {
    id: "g4",
    title: "Fresh Tomatoes & Bell Peppers",
    description: "Farm-fresh ripe red tomatoes and bell peppers washed and ready for cooking.",
    price: "3,000",
    currency: "₦",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80",
    initialQuantity: 0,
  },
  {
    id: "g5",
    title: "Cod Liver Oil Omega-3 (90 Caps)",
    description: "Premium pure deep-sea fish oil for heart, joint, and brain health.",
    price: "9,800",
    currency: "₦",
    image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=80",
    initialQuantity: 0,
  },
  {
    id: "g6",
    title: "Pure Wildflower Raw Honey (500g)",
    description: "100% pure unfiltered raw organic honey bottled without preservatives.",
    price: "5,400",
    currency: "₦",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80",
    initialQuantity: 0,
  },
  {
    id: "g7",
    title: "Whole Grain Rolled Oats (1kg)",
    description: "100% natural wholegrain oats that help lower cholesterol and fuel your morning.",
    price: "3,800",
    currency: "₦",
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500&auto=format&fit=crop&q=80",
    initialQuantity: 0,
  },
  {
    id: "g8",
    title: "Antiseptic Disinfectant Liquid",
    description: "Hospital-grade antiseptic for personal hygiene and first aid wound care.",
    price: "2,800",
    currency: "₦",
    image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&auto=format&fit=crop&q=80",
    initialQuantity: 0,
  },
];

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <main className="min-h-screen bg-[#fcfcf9] text-gray-900 relative flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      {/* Decorative grocery doodle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- Bag --%3E%3Cpath d='M20 35 h24 v30 a4 4 0 0 1 -4 4 h-16 a4 4 0 0 1 -4 -4 Z'/%3E%3Cpath d='M26 35 a6 6 0 0 1 12 0'/%3E%3C!-- Apple / Fruit --%3E%3Ccircle cx='85' cy='30' r='12'/%3E%3Cpath d='M85 18 c0 -4 4 -6 6 -6'/%3E%3Cpath d='M85 18 c2 1 5 1 7 -1'/%3E%3C!-- Carrot --%3E%3Cpath d='M25 95 l18 -18 a6 6 0 0 0 -8 -8 l-18 18 a3 3 0 0 0 8 8'/%3E%3Cpath d='M39 65 l5 -5'/%3E%3Cpath d='M42 68 l5 -3'/%3E%3C!-- Shopping Cart / Basket --%3E%3Cpath d='M80 80 h22 l-3 18 h-16 Z'/%3E%3Cpath d='M86 80 a5 5 0 0 1 10 0'/%3E%3Ccircle cx='85' cy='103' r='2' fill='%23000'/%3E%3Ccircle cx='97' cy='103' r='2' fill='%23000'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* 1. HERO SECTION */}
      <section className="relative mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 lg:px-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[560px]">

          {/* Left Column: Text & Hero Content */}
          <div className="flex flex-col items-start gap-6 lg:gap-7 z-10 max-w-xl">

            {/* Pill Tag */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-gray-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
              <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-[#00A654]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-800 tracking-tight">
                The Best Online Grocery Store
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold text-neutral-900 tracking-tight leading-[1.12]">
              Your One-Stop Shop <br />
              for <span className="text-[#00A654]">Quality Groceries</span>
            </h1>

            {/* Subtitle / Paragraph */}
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <a
                href="#shop"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#00A654] hover:bg-[#008f48] text-white font-semibold text-base rounded-full shadow-[0_4px_16px_rgba(0,166,84,0.3)] hover:shadow-[0_6px_22px_rgba(0,166,84,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Shop Now</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>

              <a
                href="#products"
                className="text-neutral-900 hover:text-[#00A654] font-semibold text-base underline underline-offset-8 decoration-2 decoration-neutral-900 hover:decoration-[#00A654] transition-colors"
              >
                View All Products
              </a>
            </div>

          </div>

          {/* Right Column: Hero Image with Floating Badges */}
          <div className="relative w-full h-full min-h-[460px] lg:min-h-[580px] flex items-center justify-center">
            <img
              src="/images/hero.png"
              alt="Doctor and Grocery Shopper"
              className="relative z-10 max-h-[560px] w-auto object-contain select-none"
            />

            {/* Floating Badge 1: Secure Payment (Brand Blue #0265CB) */}
            <div className="absolute top-10 right-4 sm:right-10 z-20 flex items-center gap-2.5 px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="w-7 h-7 rounded-full bg-[#0265CB] flex items-center justify-center text-white shadow-sm">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-neutral-800">
                Secure Payment
              </span>
              <div className="absolute -bottom-2 -left-2 text-amber-400 opacity-70">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0l2.5 8.5H23l-7 5.5 2.5 8.5-6.5-5-6.5 5 2.5-8.5-7-5.5h8.5z" />
                </svg>
              </div>
            </div>

            {/* Floating Badge 2: Fast Delivery (Brand Green #00A654) */}
            <div className="absolute bottom-12 left-2 sm:left-8 z-20 flex items-center gap-2.5 px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="w-7 h-7 rounded-full bg-[#00A654] flex items-center justify-center text-white shadow-sm">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                  <path d="M15 18H9" />
                  <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                  <circle cx="17" cy="18.5" r="2.5" />
                  <circle cx="7" cy="18.5" r="2.5" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-neutral-800">
                Fast Delivery
              </span>
              <div className="absolute -bottom-2 -right-1 text-amber-400 opacity-70">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0l2.5 8.5H23l-7 5.5 2.5 8.5-6.5-5-6.5 5 2.5-8.5-7-5.5h8.5z" />
                </svg>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. DEMARCATION BAND BETWEEN HERO AND PRODUCTS */}
      <div className="relative w-full z-20 my-6">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          {/* Demarcation Card with Trust Badges */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.04)] border border-gray-100/90 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center">
            
            {/* Perk 1: Express Delivery (Brand Green #00A654) */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00A654] flex items-center justify-center shrink-0 group-hover:bg-[#00A654] group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.125C14.25 3.504 13.746 3 13.125 3H4.875c-.621 0-1.125.504-1.125 1.125v10.125c0 .621.504 1.125 1.125 1.125h9.75" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                  Fast Delivery
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Same-day across Nigeria
                </p>
              </div>
            </div>

            {/* Perk 2: 100% Certified Products (Brand Blue #0265CB) */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0265CB] flex items-center justify-center shrink-0 group-hover:bg-[#0265CB] group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                  100% Authentic
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Certified meds &amp; food
                </p>
              </div>
            </div>

            {/* Perk 3: Secure Payments (Brand Green #00A654) */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00A654] flex items-center justify-center shrink-0 group-hover:bg-[#00A654] group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                  Safe Payment
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Cards, Transfer &amp; COD
                </p>
              </div>
            </div>

            {/* Perk 4: 24/7 Expert Support (Brand Blue #0265CB) */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0265CB] flex items-center justify-center shrink-0 group-hover:bg-[#0265CB] group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.667-3.091c-.568-.009-1.135-.028-1.7-.058A8.006 8.006 0 0 1 6 8.511V7.5a6 6 0 0 1 12 0v1.011Z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                  Health &amp; Grocery Help
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Direct pharmacist support
                </p>
              </div>
            </div>

          </div>

          {/* Divider line with clean center accent */}
          <div className="relative flex items-center justify-center mt-10 mb-4">
            <div className="w-full border-t border-gray-200/80" />
            <div className="absolute px-4 bg-[#fcfcf9] text-xs font-bold uppercase tracking-widest text-[#00A654] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00A654]" />
              <span>Explore Our Shelves</span>
              <span className="w-2 h-2 rounded-full bg-[#0265CB]" />
            </div>
          </div>

        </div>
      </div>

      {/* PRODUCT CATALOG AREA WITH DEDICATED CONTRASTING BACKGROUND & REDUCED MARGINS */}
      <div className="w-full bg-[#edf4ee] border-t border-emerald-900/10 pt-10 pb-16 relative">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marqueeScroll {
            0% {
              transform: translate3d(0, 0, 0);
            }
            100% {
              transform: translate3d(-50%, 0, 0);
            }
          }
          .animate-marquee-track {
            display: flex;
            width: max-content;
            animation: marqueeScroll 25s linear infinite;
            will-change: transform;
          }
          .animate-marquee-track:hover {
            animation-play-state: paused;
          }
        `}} />

        {/* Unified container for both Row 1 and Rows 2-3: Aligns boundaries and reduces side margins */}
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* 3. ROW 1: ANIMATED CONTINUOUS SLIDER (STARTING & STOPPING AT PRODUCT GRID BOUNDS) */}
          <section className="relative w-full py-2 z-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00A654]" />
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                  Hot Deals &amp; Daily Trending
                </h2>
              </div>
              <span className="text-xs font-medium text-gray-500 hidden sm:inline-block">
                Auto-scrolling • Hover to pause
              </span>
            </div>

            {/* Marquee Window: Contained within the exact product bounds */}
            <div className="relative w-full overflow-hidden rounded-2xl py-2">
              {/* Left edge shadow fade */}
              <div className="absolute left-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-r from-[#edf4ee] to-transparent z-20 pointer-events-none" />
              {/* Right edge shadow fade */}
              <div className="absolute right-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-l from-[#edf4ee] to-transparent z-20 pointer-events-none" />

              {/* Seamless Infinite Loop moving from Right to Left */}
              <div className="animate-marquee-track flex gap-4 sm:gap-6 items-stretch">
                {[...marqueeProducts, ...marqueeProducts].map((product, idx) => (
                  <ProductCard
                    key={`marquee-${product.id}-${idx}`}
                    product={product}
                    colorScheme="green"
                    className="w-[230px] sm:w-[290px] shrink-0"
                    onProductClick={setSelectedProduct}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* 4. NEXT TWO ROWS: 8 NORMAL STATIC GRID PRODUCTS (2 PER ROW ON MOBILE) */}
          <section id="products" className="relative w-full pt-10 z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00A654] mb-1">
                  <span>All Categories</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  Quality Groceries &amp; Health Essentials
                </h2>
              </div>
              
              <a
                href="#all"
                className="text-sm font-bold text-[#00A654] hover:underline underline-offset-4 flex items-center gap-1.5"
              >
                <span>Browse Full Catalog</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </a>
            </div>

            {/* Normal Grid (2 Rows of 4 on desktop = 8 Cards, 2 per row on mobile) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {gridProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  colorScheme="green"
                  onProductClick={setSelectedProduct}
                />
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* Lab Result Upload CTA Section — before footer */}
      <LabResultSection />

      {/* Footer matching reference design with floating newsletter */}
      <Footer />

      {/* Product Detail Modal */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </main>
  );
}
