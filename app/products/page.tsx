"use client";

import { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard, { Product } from "../components/ProductCard";
import ProductModal from "../components/ProductModal";

/* ── FULL PRODUCT CATALOGUE ── */
const GROCERY_PRODUCTS: Product[] = [
  { id: "g1", title: "Farm Fresh Organic Eggs (Crate)", description: "High-protein free-range eggs from verified local poultry farms.", price: "4,200", currency: "₦", image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "g2", title: "Crisp Green Apples (6 Pack)", description: "Hand-picked crunchy sweet apples freshly imported for maximum freshness.", price: "2,900", currency: "₦", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "g3", title: "Golden Morn Cereal (900g)", description: "Nutritious whole grain cereal fortified with vitamin A, iron and minerals.", price: "3,500", currency: "₦", image: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "g4", title: "Fresh Whole Milk (1L)", description: "Pasteurized farm-fresh dairy milk rich in calcium, protein and nutrients.", price: "1,800", currency: "₦", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "g5", title: "Pure Wildflower Raw Honey (500g)", description: "100% pure unfiltered raw organic honey bottled without preservatives.", price: "5,400", currency: "₦", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "g6", title: "Fresh Tomatoes & Bell Peppers", description: "Farm-fresh ripe tomatoes and bell peppers, washed and ready for cooking.", price: "3,000", currency: "₦", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "g7", title: "Whole Grain Rolled Oats (1kg)", description: "100% natural wholegrain oats that help lower cholesterol and fuel your morning.", price: "3,800", currency: "₦", image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "g8", title: "Malted Chocolate Drink (500g)", description: "Enriched malted chocolate beverage packed with active energy vitamins.", price: "3,200", currency: "₦", image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "g9", title: "Golden Corn Flakes (500g)", description: "Crispy roasted whole corn flakes packed with essential B vitamins.", price: "2,600", currency: "₦", image: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "g10", title: "Extra Virgin Olive Oil (750ml)", description: "Cold-pressed premium grade olive oil for cooking and dressings.", price: "8,200", currency: "₦", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "g11", title: "Basmati Rice Premium (5kg)", description: "Long-grain aromatic basmati rice with fluffy texture after cooking.", price: "12,500", currency: "₦", image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "g12", title: "Natural Greek Yoghurt (500g)", description: "Thick creamy probiotic-rich Greek-style yoghurt with live cultures.", price: "3,900", currency: "₦", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
];

const MEDICAL_PRODUCTS: Product[] = [
  { id: "m1", title: "Vitamin C 1000mg Effervescent", description: "High potency daily immune support drink tablets with orange flavour.", price: "4,500", currency: "₦", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "m2", title: "Multivitamin Daily Formula (30 caps)", description: "Comprehensive 30-in-1 vital supplement for all-day energy and wellness.", price: "8,500", currency: "₦", image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "m3", title: "Cod Liver Oil Omega-3 (90 Caps)", description: "Premium deep-sea fish oil for heart, joint, and brain health.", price: "9,800", currency: "₦", image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "m4", title: "Pain Relief Paracetamol Extra", description: "Fast-acting effective relief from headaches, body aches, and fever.", price: "1,500", currency: "₦", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "m5", title: "Antiseptic Disinfectant Liquid (500ml)", description: "Hospital-grade antiseptic for personal hygiene and wound care.", price: "2,800", currency: "₦", image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "m6", title: "Blood Pressure Monitor (Digital)", description: "Clinically validated automatic upper-arm blood pressure monitor with memory.", price: "45,000", currency: "₦", image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "m7", title: "Zinc & Vitamin D3 Combo (60 tabs)", description: "Immune boosting mineral combo for daily wellness and bone strength.", price: "6,200", currency: "₦", image: "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "m8", title: "First Aid Kit — Complete Set", description: "Comprehensive 50-piece first aid kit for home and office emergencies.", price: "18,000", currency: "₦", image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "m9", title: "Hand Sanitizer Gel 70% (500ml)", description: "WHO-formula alcohol-based sanitizer that kills 99.9% of germs.", price: "2,200", currency: "₦", image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "m10", title: "Glucometer Blood Sugar Test Kit", description: "Accurate digital blood glucose monitor with 25 test strips included.", price: "22,000", currency: "₦", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "m11", title: "Probiotics Daily (30 capsules)", description: "Multi-strain probiotic formula for gut health and immune support.", price: "11,500", currency: "₦", image: "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
  { id: "m12", title: "Thermometer Digital Infrared", description: "Non-contact forehead thermometer with 1-second reading and fever alert.", price: "14,000", currency: "₦", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80", initialQuantity: 0 },
];

type CategoryTab = "groceries" | "medical";
type FilterTab = "all" | "latest" | "bestsellers" | "featured";
type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

const FEATURED_IDS = new Set(["g1", "g5", "g10", "m2", "m6", "m10"]);
const BESTSELLER_IDS = new Set(["g3", "g4", "g7", "m1", "m4", "m9"]);
const LATEST_IDS = new Set(["g9", "g10", "g11", "g12", "m10", "m11", "m12"]);

const priceNum = (p: Product) =>
  parseFloat(String(p.price).replace(/,/g, ""));

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₦3,000", min: 0, max: 3000 },
  { label: "₦3,000 – ₦10,000", min: 3000, max: 10000 },
  { label: "₦10,000 – ₦30,000", min: 10000, max: 30000 },
  { label: "Above ₦30,000", min: 30000, max: Infinity },
];

export default function ProductsPage() {
  const [categoryTab, setCategoryTab] = useState<CategoryTab>("groceries");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("default");
  const [priceRange, setPriceRange] = useState(0); // index into PRICE_RANGES
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const baseProducts = categoryTab === "groceries" ? GROCERY_PRODUCTS : MEDICAL_PRODUCTS;

  const displayed = useMemo(() => {
    let list = [...baseProducts];

    // Filter tab
    if (filterTab === "featured") list = list.filter(p => FEATURED_IDS.has(String(p.id)));
    else if (filterTab === "bestsellers") list = list.filter(p => BESTSELLER_IDS.has(String(p.id)));
    else if (filterTab === "latest") list = list.filter(p => LATEST_IDS.has(String(p.id)));

    // Price range
    const { min, max } = PRICE_RANGES[priceRange];
    if (min > 0 || max < Infinity) {
      list = list.filter(p => { const n = priceNum(p); return n >= min && n <= max; });
    }

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === "price-asc") list.sort((a, b) => priceNum(a) - priceNum(b));
    else if (sort === "price-desc") list.sort((a, b) => priceNum(b) - priceNum(a));
    else if (sort === "name-asc") list.sort((a, b) => a.title.localeCompare(b.title));

    return list;
  }, [baseProducts, filterTab, search, sort, priceRange]);

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All Products" },
    { key: "latest", label: "Latest Products" },
    { key: "bestsellers", label: "Best Sellers" },
    { key: "featured", label: "Featured" },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcf9] flex flex-col">
      <Navbar />

      {/* ── PAGE HEADER ── */}
      <div className="w-full bg-white border-b border-gray-100 py-10 sm:py-14 text-center">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#00A654] mb-3">
            <span className="w-8 h-px bg-[#00A654]" />
            Our Products
            <span className="w-8 h-px bg-[#00A654]" />
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
            Our Products Collections
          </h1>
          <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Browse our full range of fresh groceries and certified pharmaceutical products — all delivered across Nigeria.
          </p>

          {/* ── CATEGORY TABS (Groceries / Medical) ── */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {([
              { key: "groceries" as CategoryTab, label: "Groceries", icon: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" },
              { key: "medical" as CategoryTab, label: "Medical & Pharmacy", icon: "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21a48.25 48.25 0 0 1-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" },
            ]).map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setCategoryTab(tab.key); setFilterTab("all"); setSearch(""); }}
                className={`px-5 sm:px-7 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all border-2 ${
                  categoryTab === tab.key
                    ? "bg-[#00A654] border-[#00A654] text-white shadow-[0_4px_14px_rgba(0,166,84,0.3)]"
                    : "bg-white border-gray-200 text-gray-600 hover:border-[#00A654] hover:text-[#00A654]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── FILTER PILL TABS ── */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {filterTabs.map(ft => (
              <button
                key={ft.key}
                type="button"
                onClick={() => setFilterTab(ft.key)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
                  filterTab === ft.key
                    ? "bg-[#00A654] border-[#00A654] text-white"
                    : "bg-transparent border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
                }`}
              >
                {ft.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TOOLBAR: Search + Sort + Price ── */}
      <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-3 flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${categoryTab === "groceries" ? "groceries" : "medical products"}...`}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#00A654] focus:outline-none text-sm text-gray-800 placeholder-gray-400 bg-white transition-colors"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Price range */}
          <select
            value={priceRange}
            onChange={e => setPriceRange(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-gray-200 focus:border-[#00A654] focus:outline-none text-xs sm:text-sm text-gray-700 bg-white cursor-pointer transition-colors"
          >
            {PRICE_RANGES.map((r, i) => (
              <option key={r.label} value={i}>{r.label}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="px-3 py-2 rounded-xl border border-gray-200 focus:border-[#00A654] focus:outline-none text-xs sm:text-sm text-gray-700 bg-white cursor-pointer transition-colors"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A–Z</option>
          </select>

          {/* Results count */}
          <span className="ml-auto text-xs text-gray-400 font-medium hidden sm:block">
            {displayed.length} product{displayed.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-500 text-sm mb-6">Try adjusting your search or filters.</p>
            <button
              type="button"
              onClick={() => { setSearch(""); setFilterTab("all"); setPriceRange(0); setSort("default"); }}
              className="px-6 py-2.5 bg-[#00A654] text-white rounded-full font-bold text-sm hover:bg-[#008f48] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            {displayed.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                colorScheme="green"
                onProductClick={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Product Detail Modal */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
