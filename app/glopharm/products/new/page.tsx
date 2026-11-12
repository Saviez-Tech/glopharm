"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdmin } from "../../layout";

export default function AddNewProductPage() {
  const router = useRouter();
  const { darkMode } = useAdmin();

  // Form Fields matching screenshot
  const [sku, setSku] = useState("021231");
  const [productName, setProductName] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState("Available");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName) {
      showToast("Please enter a product name");
      return;
    }
    showToast(`Product "${productName}" saved successfully!`);
    setTimeout(() => {
      router.push("/glopharm");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#282828] text-[#FFFFFF] px-4 py-2.5 rounded-xl shadow-xl border border-[#E8E8E8] text-xs flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#E6FF96]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── BREADCRUMBS & TITLE (Matches Screenshot Exact Layout) ── */}
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
          Product
        </h1>
        <div className="text-xs text-[#888888] font-normal mt-0.5 flex items-center gap-1.5">
          <Link href="/glopharm" className="hover:text-[#282828] transition-colors">
            Dashboard
          </Link>
          <span>&gt;</span>
          <Link href="/glopharm" className="hover:text-[#282828] transition-colors">
            Product
          </Link>
          <span>&gt;</span>
          <Link href="/glopharm" className="hover:text-[#282828] transition-colors">
            Sneakers
          </Link>
          <span>&gt;</span>
          <span className="text-[#1d68ff] font-medium">Add Product</span>
        </div>
      </div>

      {/* Back button */}
      <div>
        <Link
          href="/glopharm"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#888888] hover:text-[#1d68ff] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Product List</span>
        </Link>
      </div>

      {/* ── ADD PRODUCT TWO-CARD GRID (Matches Image 2 Exactly) ── */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT CARD: PRODUCT INFORMATION */}
        <div
          className={`lg:col-span-7 p-6 sm:p-8 rounded-2xl border transition-all ${
            darkMode ? "bg-[#383838] border-[#505050]" : "bg-[#FFFFFF] border-[#E8E8E8] shadow-2xs"
          }`}
        >
          <div className="mb-6">
            <h2 className={`text-base font-bold ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
              Product Information
            </h2>
            <p className="text-xs text-[#888888] mt-1 font-normal">
              Lorem ipsum dolor sit amet consectetur. Non ac nulla aliquam aenean in velit mattis.
            </p>
          </div>

          <div className="space-y-4">
            {/* SKU */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Input no SKU"
                className={`w-full px-4 py-3 text-xs rounded-xl border outline-none transition-all ${
                  darkMode
                    ? "bg-[#505050] border-[#666666] text-[#FFFFFF] placeholder-[#B8B8B8]"
                    : "bg-[#FFFFFF] border-[#E8E8E8] text-[#282828] placeholder-[#B8B8B8]"
                } focus:border-[#8CB8FA]`}
              />
            </div>

            {/* Product Name */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Input product name"
                required
                className={`w-full px-4 py-3 text-xs rounded-xl border outline-none transition-all ${
                  darkMode
                    ? "bg-[#505050] border-[#666666] text-[#FFFFFF] placeholder-[#B8B8B8]"
                    : "bg-[#FFFFFF] border-[#E8E8E8] text-[#282828] placeholder-[#B8B8B8]"
                } focus:border-[#8CB8FA]`}
              />
            </div>

            {/* Size & Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                  Size
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="Input Price"
                  className={`w-full px-4 py-3 text-xs rounded-xl border outline-none transition-all ${
                    darkMode
                      ? "bg-[#505050] border-[#666666] text-[#FFFFFF] placeholder-[#B8B8B8]"
                      : "bg-[#FFFFFF] border-[#E8E8E8] text-[#282828] placeholder-[#B8B8B8]"
                  } focus:border-[#8CB8FA]`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                  Color
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Color"
                  className={`w-full px-4 py-3 text-xs rounded-xl border outline-none transition-all ${
                    darkMode
                      ? "bg-[#505050] border-[#666666] text-[#FFFFFF] placeholder-[#B8B8B8]"
                      : "bg-[#FFFFFF] border-[#E8E8E8] text-[#282828] placeholder-[#B8B8B8]"
                  } focus:border-[#8CB8FA]`}
                />
              </div>
            </div>

            {/* Product Category & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                  Product Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-3 text-xs rounded-xl border outline-none transition-all ${
                    darkMode
                      ? "bg-[#505050] border-[#666666] text-[#FFFFFF]"
                      : "bg-[#FFFFFF] border-[#E8E8E8] text-[#282828]"
                  } focus:border-[#8CB8FA]`}
                >
                  <option value="">Select product category</option>
                  <option value="Sneakers">Sneakers</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Supplements">Supplements</option>
                  <option value="Jacket">Jacket</option>
                  <option value="T-Shirt">T-Shirt</option>
                  <option value="Bag">Bag</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                  Price
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Input Price"
                  className={`w-full px-4 py-3 text-xs rounded-xl border outline-none transition-all ${
                    darkMode
                      ? "bg-[#505050] border-[#666666] text-[#FFFFFF] placeholder-[#B8B8B8]"
                      : "bg-[#FFFFFF] border-[#E8E8E8] text-[#282828] placeholder-[#B8B8B8]"
                  } focus:border-[#8CB8FA]`}
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                Quantity
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Input stock"
                className={`w-full px-4 py-3 text-xs rounded-xl border outline-none transition-all ${
                  darkMode
                    ? "bg-[#505050] border-[#666666] text-[#FFFFFF] placeholder-[#B8B8B8]"
                    : "bg-[#FFFFFF] border-[#E8E8E8] text-[#282828] placeholder-[#B8B8B8]"
                } focus:border-[#8CB8FA]`}
              />
            </div>

            {/* Status Product */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                Status Product
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full px-4 py-3 text-xs rounded-xl border outline-none transition-all ${
                  darkMode
                    ? "bg-[#505050] border-[#666666] text-[#FFFFFF]"
                    : "bg-[#FFFFFF] border-[#E8E8E8] text-[#282828]"
                } focus:border-[#8CB8FA]`}
              >
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: IMAGE PRODUCT */}
        <div
          className={`lg:col-span-5 p-6 sm:p-8 rounded-2xl border flex flex-col justify-between transition-all ${
            darkMode ? "bg-[#383838] border-[#505050]" : "bg-[#FFFFFF] border-[#E8E8E8] shadow-2xs"
          }`}
        >
          <div>
            <div className="mb-5">
              <h2 className={`text-base font-bold ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                Image Product
              </h2>
              <p className="text-[11px] text-[#1d68ff] font-medium mt-1">
                Note : Format photos SVG, PNG, or JPG (Max size 4mb)
              </p>
            </div>

            {/* 4 Photo Upload Slots in 2x2 grid matching screenshot */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  onClick={() => showToast(`Selected Photo slot ${num}`)}
                  className="h-28 rounded-2xl border-2 border-dashed border-[#8CB8FA] bg-[#C6DBFD]/15 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:border-[#1d68ff] transition-all group"
                >
                  <svg className="w-6 h-6 text-[#8CB8FA] group-hover:text-[#1d68ff] transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-xs font-medium ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                    Photo {num}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Right: Save Product Button */}
          <div className="flex items-center justify-end pt-4 border-t border-[#E8E8E8]">
            <button
              type="submit"
              className="px-7 py-3 rounded-xl bg-[#1d68ff] hover:bg-[#1656d6] text-[#FFFFFF] text-xs font-semibold tracking-wide shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              Save Product
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

