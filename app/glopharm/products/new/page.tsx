"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdmin } from "../../layout";

interface Specification {
  name: string;
  value: string;
}

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { darkMode } = useAdmin();

  const editId = searchParams.get("edit") || searchParams.get("id");
  const isEdit = Boolean(editId);

  // Form Fields matching backend schema
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("medicine");
  const [subcategory, setSubcategory] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState<number | "">(0);
  const [description, setDescription] = useState("");

  // Images 1 - 4
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");
  const [image4, setImage4] = useState("");

  // Specifications
  const [specifications, setSpecifications] = useState<Specification[]>([
    { name: "", value: "" },
  ]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fileInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Pre-fill form if editing
  useEffect(() => {
    if (!editId) return;

    async function loadProductDetails() {
      setIsLoadingDetails(true);
      try {
        const res = await fetch(`/api/ecommerce/products/${editId}`);
        const json = await res.json();
        if (!res.ok) {
          showToast(json.message || "Failed to load product details", "error");
          return;
        }

        const data = json.data;
        if (data) {
          setProductName(data.name || "");
          setCategory(data.category || "medicine");
          setSubcategory(data.subcategory || "");
          setPrice(data.price || "");
          setOriginalPrice(data.original_price || "");
          setStock(typeof data.stock === "number" ? data.stock : 0);
          setDescription(data.description || "");
          setImage1(data.image || "");
          setImage2(data.image2 || "");
          setImage3(data.image3 || "");
          setImage4(data.image4 || "");

          if (Array.isArray(data.specifications) && data.specifications.length > 0) {
            setSpecifications(
              data.specifications.map((s: { name: string; value: string }) => ({
                name: s.name,
                value: s.value,
              }))
            );
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error fetching product details";
        showToast(msg, "error");
      } finally {
        setIsLoadingDetails(false);
      }
    }

    loadProductDetails();
  }, [editId]);

  // Specification helpers
  const addSpecRow = () => {
    setSpecifications((prev) => [...prev, { name: "", value: "" }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSpecRow = (index: number, key: "name" | "value", val: string) => {
    setSpecifications((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: val };
      return updated;
    });
  };

  // Image setter helper
  const setImageSlot = (slot: number, url: string) => {
    if (slot === 1) setImage1(url);
    if (slot === 2) setImage2(url);
    if (slot === 3) setImage3(url);
    if (slot === 4) setImage4(url);
  };

  const getImageSlot = (slot: number) => {
    if (slot === 1) return image1;
    if (slot === 2) return image2;
    if (slot === 3) return image3;
    if (slot === 4) return image4;
    return "";
  };

  // Cloudinary image file upload handler
  const handleFileUpload = async (slot: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlot(slot);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to upload image.");
      }

      const uploadedUrl = json.data?.url;
      if (uploadedUrl) {
        setImageSlot(slot, uploadedUrl);
        showToast(`Image ${slot} uploaded successfully!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed. You can paste a direct URL instead.";
      showToast(msg, "error");
    } finally {
      setUploadingSlot(null);
    }
  };

  // Submit create or update
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      showToast("Please enter a product name.", "error");
      return;
    }
    if (!category.trim()) {
      showToast("Please enter or select a category.", "error");
      return;
    }
    if (!price || isNaN(Number(price))) {
      showToast("Please enter a valid price.", "error");
      return;
    }

    const cleanedSpecs = specifications.filter(
      (s) => s.name.trim().length > 0 && s.value.trim().length > 0
    );

    const payload = {
      name: productName.trim(),
      image: image1.trim(),
      image2: image2.trim(),
      image3: image3.trim(),
      image4: image4.trim(),
      category: category.trim().toLowerCase(),
      subcategory: subcategory.trim(),
      description: description.trim(),
      original_price: originalPrice ? String(originalPrice).trim() : String(price).trim(),
      price: String(price).trim(),
      stock: typeof stock === "number" ? stock : Number(stock) || 0,
      specifications: cleanedSpecs,
    };

    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/gload/products/${editId}` : "/api/gload/products";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        window.location.href = "/glopharm/login?session_expired=1";
        return;
      }

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || `Failed to ${isEdit ? "update" : "create"} product.`);
      }

      showToast(`Product "${productName}" ${isEdit ? "updated" : "created"} successfully!`);
      setTimeout(() => {
        router.push("/glopharm/products");
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save product.";
      showToast(msg, "error");
      setIsSubmitting(false);
    }
  };

  const cardStyle = darkMode
    ? "bg-[#383838] border-[#505050]"
    : "bg-[#FFFFFF] border-[#E8E8E8] shadow-2xs";

  const inputStyle = `w-full px-4 py-3 text-xs rounded-xl border outline-none transition-all ${
    darkMode
      ? "bg-[#505050] border-[#666666] text-[#FFFFFF] placeholder-[#B8B8B8]"
      : "bg-[#FFFFFF] border-[#E8E8E8] text-[#282828] placeholder-[#B8B8B8]"
  } focus:border-[#8CB8FA]`;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-xl border text-xs flex items-center gap-2 animate-bounce ${
            toastMessage.type === "success"
              ? "bg-[#282828] text-[#FFFFFF] border-[#E8E8E8]"
              : "bg-red-600 text-white border-red-700"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              toastMessage.type === "success" ? "bg-[#E6FF96]" : "bg-white"
            }`}
          />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── BREADCRUMBS & TITLE ── */}
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
          {isEdit ? "Edit Product" : "Add Product"}
        </h1>
        <div className="text-xs text-[#888888] font-normal mt-0.5 flex items-center gap-1.5">
          <Link href="/glopharm" className="hover:text-[#282828] transition-colors">
            Dashboard
          </Link>
          <span>&gt;</span>
          <Link href="/glopharm/products" className="hover:text-[#282828] transition-colors">
            Product
          </Link>
          <span>&gt;</span>
          <span className="text-[#1d68ff] font-medium">{isEdit ? `Edit #${editId}` : "New Product"}</span>
        </div>
      </div>

      {/* Back button */}
      <div>
        <Link
          href="/glopharm/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#888888] hover:text-[#1d68ff] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Product List</span>
        </Link>
      </div>

      {isLoadingDetails && (
        <div className="p-4 rounded-xl bg-blue-50 text-[#1d68ff] text-xs font-medium flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading product details for editing...
        </div>
      )}

      {/* ── FORM GRID ── */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT CARD: PRODUCT INFORMATION */}
        <div className={`lg:col-span-7 p-6 sm:p-8 rounded-2xl border transition-all ${cardStyle}`}>
          <div className="mb-6">
            <h2 className={`text-base font-bold ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
              Product Information
            </h2>
            <p className="text-xs text-[#888888] mt-1 font-normal">
              Enter the main details, pricing, inventory stock, and technical specifications for this product.
            </p>
          </div>

          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                Product Name *
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Paracetamol 500mg or Samsung Galaxy A55 5G"
                required
                className={inputStyle}
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                  Category *
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. medicine, supplements, groceries"
                  required
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                  Subcategory
                </label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. pain relief, tablets, electronics"
                  className={inputStyle}
                />
              </div>
            </div>

            {/* Price & Original Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                  Sale Price (₦) *
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 420000.00 or 1500"
                  required
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                  Original / Strikethrough Price (₦)
                </label>
                <input
                  type="text"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="e.g. 450000.00"
                  className={inputStyle}
                />
              </div>
            </div>

            {/* Stock Quantity */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                Stock Quantity *
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Available stock quantity"
                required
                className={inputStyle}
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the product, dosage, benefits or specs..."
                className={inputStyle}
              />
            </div>

            {/* ── SPECIFICATIONS LIST ── */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className={`block text-xs font-medium ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                  Specifications (e.g. Brand, Dosage, Model, Storage)
                </label>
                <button
                  type="button"
                  onClick={addSpecRow}
                  className="text-xs font-semibold text-[#1d68ff] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  + Add Row
                </button>
              </div>

              <div className="space-y-2">
                {specifications.map((spec, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Name (e.g. Brand)"
                      value={spec.name}
                      onChange={(e) => updateSpecRow(i, "name", e.target.value)}
                      className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none ${
                        darkMode
                          ? "bg-[#505050] border-[#666] text-white"
                          : "bg-[#FFFFFF] border-[#E8E8E8] text-[#282828]"
                      } focus:border-[#8CB8FA]`}
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. GlaxoSmithKline)"
                      value={spec.value}
                      onChange={(e) => updateSpecRow(i, "value", e.target.value)}
                      className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none ${
                        darkMode
                          ? "bg-[#505050] border-[#666] text-white"
                          : "bg-[#FFFFFF] border-[#E8E8E8] text-[#282828]"
                      } focus:border-[#8CB8FA]`}
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecRow(i)}
                      className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                      title="Remove row"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: IMAGE PRODUCT */}
        <div className={`lg:col-span-5 p-6 sm:p-8 rounded-2xl border flex flex-col justify-between transition-all ${cardStyle}`}>
          <div>
            <div className="mb-5">
              <h2 className={`text-base font-bold ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                Product Photos
              </h2>
              <p className="text-[11px] text-[#1d68ff] font-medium mt-1">
                Upload image files or paste direct URLs below. Format: PNG, JPG, WEBP.
              </p>
            </div>

            {/* 4 Photo Upload Slots in 2x2 grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[1, 2, 3, 4].map((num) => {
                const currentImg = getImageSlot(num);
                const isUploading = uploadingSlot === num;

                return (
                  <div
                    key={num}
                    className="relative group rounded-2xl border-2 border-dashed border-[#8CB8FA] bg-[#C6DBFD]/15 flex flex-col items-center justify-center p-2 text-center h-32 overflow-hidden transition-all hover:border-[#1d68ff]"
                  >
                    <input
                      ref={(el) => {
                        fileInputRefs[num - 1].current = el;
                      }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(num, e)}
                      className="hidden"
                    />

                    {currentImg ? (
                      <div className="relative w-full h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentImg}
                          alt={`Slot ${num}`}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.png";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setImageSlot(num, "")}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 cursor-pointer"
                          title="Remove image"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRefs[num - 1].current?.click()}
                        className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-1 text-[#1d68ff] text-xs">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span>Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <svg
                              className="w-6 h-6 text-[#8CB8FA] group-hover:text-[#1d68ff] transition-colors mb-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth="1.8"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className={`text-[11px] font-medium ${darkMode ? "text-[#FFFFFF]" : "text-[#282828]"}`}>
                              Upload Photo {num}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Direct Image URL Inputs */}
            <div className="space-y-2 mb-6">
              <label className={`block text-[11px] font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Or Paste Image URLs:
              </label>
              {[
                { label: "Main Image URL *", val: image1, set: setImage1 },
                { label: "Image 2 URL", val: image2, set: setImage2 },
                { label: "Image 3 URL", val: image3, set: setImage3 },
                { label: "Image 4 URL", val: image4, set: setImage4 },
              ].map((item, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={item.label}
                  value={item.val}
                  onChange={(e) => item.set(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${
                    darkMode
                      ? "bg-[#505050] border-[#666] text-white"
                      : "bg-[#FFFFFF] border-[#E8E8E8] text-[#282828]"
                  } focus:border-[#8CB8FA]`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Right: Save Product Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E8E8]">
            <Link
              href="/glopharm/products"
              className={`px-5 py-3 rounded-xl text-xs font-semibold border ${
                darkMode ? "border-[#505050] text-white hover:bg-[#505050]" : "border-[#E8E8E8] text-[#282828] hover:bg-gray-50"
              }`}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 rounded-xl bg-[#1d68ff] hover:bg-[#1656d6] text-[#FFFFFF] text-xs font-semibold tracking-wide shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? "Update Product" : "Save Product"}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function AddNewProductPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-500">Loading product editor...</div>}>
      <ProductFormContent />
    </Suspense>
  );
}
