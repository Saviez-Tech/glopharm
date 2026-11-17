"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard, { Product } from "../components/ProductCard";
import ProductModal from "../components/ProductModal";

/* ── Types for the backend response ── */
interface BackendProduct {
  id: number;
  name: string;
  image: string;
  category: string;
  subcategory: string;
  original_price: string;
  price: string;
  stock: number;
}

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₦3,000", min: 0, max: 3000 },
  { label: "₦3,000 – ₦10,000", min: 3000, max: 10000 },
  { label: "₦10,000 – ₦30,000", min: 10000, max: 30000 },
  { label: "Above ₦30,000", min: 30000, max: Infinity },
];

/** Convert a backend product to the shape ProductCard expects */
function toCardProduct(bp: BackendProduct): Product {
  return {
    id: bp.id,
    title: bp.name,
    description: `${bp.category} · ${bp.subcategory}`,
    price: Number(bp.price).toLocaleString("en-NG"),
    currency: "₦",
    image: bp.image,
    initialQuantity: 0,
    category: bp.category,
    subcategory: bp.subcategory,
    stock: bp.stock,
    original_price: bp.original_price,
  };
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  /* ── State ── */
  const [backendProducts, setBackendProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPrevPage] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState(initialQ);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQ);
  const [sort, setSort] = useState<SortOption>("default");
  const [priceRange, setPriceRange] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  /* ── Debounce search input ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  /* ── Fetch products from our BFF route ── */
  const fetchProducts = useCallback(async (pageToLoad = currentPage) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) {
        params.set("q", debouncedSearch.trim());
      }
      if (pageToLoad > 1) {
        params.set("page", String(pageToLoad));
      }
      const url = `/api/ecommerce/products${params.toString() ? "?" + params.toString() : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load products.");
      }

      setBackendProducts(data.data?.results ?? []);
      setTotalCount(data.data?.count ?? 0);
      setHasNextPage(Boolean(data.data?.next));
      setHasPrevPage(Boolean(data.data?.previous));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load products.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 260, behavior: "smooth" });
  };

  /* ── Derive unique categories for filter tabs ── */
  const categories = useMemo(() => {
    const cats = new Set(backendProducts.map((p) => p.category));
    return ["All", ...Array.from(cats)];
  }, [backendProducts]);

  /* ── Convert, filter, sort ── */
  const displayed = useMemo(() => {
    let list = backendProducts;

    // Category filter
    if (categoryFilter !== "All") {
      list = list.filter((p) => p.category === categoryFilter);
    }

    // Price range
    const { min, max } = PRICE_RANGES[priceRange];
    if (min > 0 || max < Infinity) {
      list = list.filter((p) => {
        const n = Number(p.price);
        return n >= min && n <= max;
      });
    }

    // Sort
    if (sort === "price-asc") list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === "price-desc") list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === "name-asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list.map(toCardProduct);
  }, [backendProducts, categoryFilter, sort, priceRange]);

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

          {/* ── CATEGORY TABS (dynamic from backend) ── */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-5 sm:px-7 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all border-2 ${
                  categoryFilter === cat
                    ? "bg-[#00A654] border-[#00A654] text-white shadow-[0_4px_14px_rgba(0,166,84,0.3)]"
                    : "bg-white border-gray-200 text-gray-600 hover:border-[#00A654] hover:text-[#00A654]"
                }`}
              >
                {cat}
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
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
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-gray-200 focus:border-[#00A654] focus:outline-none text-xs sm:text-sm text-gray-700 bg-white cursor-pointer transition-colors"
          >
            {PRICE_RANGES.map((r, i) => (
              <option key={r.label} value={i}>{r.label}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-2 rounded-xl border border-gray-200 focus:border-[#00A654] focus:outline-none text-xs sm:text-sm text-gray-700 bg-white cursor-pointer transition-colors"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A–Z</option>
          </select>

          {/* Results count */}
          <span className="ml-auto text-xs text-gray-500 font-medium hidden sm:block">
            {totalCount > 0 ? (
              <>
                Showing <span className="font-bold text-gray-900">{displayed.length}</span> of{" "}
                <span className="font-bold text-gray-900">{totalCount}</span> goods
              </>
            ) : (
              `${displayed.length} products`
            )}
          </span>
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
        {loading ? (
          /* ── LOADING STATE ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-3.5 border border-gray-100 animate-pulse">
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-9 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* ── ERROR STATE ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to load products</h3>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              type="button"
              onClick={() => fetchProducts(currentPage)}
              className="px-6 py-2.5 bg-[#00A654] text-white rounded-full font-bold text-sm hover:bg-[#008f48] transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : displayed.length === 0 ? (
          /* ── EMPTY STATE ── */
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
              onClick={() => { setSearch(""); setCategoryFilter("All"); setPriceRange(0); setSort("default"); }}
              className="px-6 py-2.5 bg-[#00A654] text-white rounded-full font-bold text-sm hover:bg-[#008f48] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
              {displayed.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  colorScheme="green"
                  onProductClick={setSelectedProduct}
                />
              ))}
            </div>

            {/* ── PAGINATION CONTROLS ── */}
            {(hasNextPage || hasPrevPage || totalCount > backendProducts.length) && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200/80">
                <div className="text-xs sm:text-sm text-gray-500 font-medium">
                  Page <span className="font-bold text-gray-900">{currentPage}</span>
                  {totalCount > 0 && (
                    <>
                      {" "}· <span className="font-semibold text-gray-700">{totalCount}</span> total items
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Page Button */}
                  <button
                    type="button"
                    disabled={!hasPrevPage && currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    <span>Previous</span>
                  </button>

                  {/* Active Page Indicator */}
                  <span className="px-3.5 py-2 rounded-xl bg-emerald-50 text-[#00A654] font-bold text-xs sm:text-sm border border-emerald-100">
                    Page {currentPage}
                  </span>

                  {/* Next Page Button */}
                  <button
                    type="button"
                    disabled={!hasNextPage}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-4 py-2.5 rounded-xl bg-[#00A654] hover:bg-[#008f48] text-white text-xs sm:text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Next Page</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Product Detail Modal */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
