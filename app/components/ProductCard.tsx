"use client";

import React, { useState } from "react";
import { useCart } from "@/lib/context/CartContext";

export interface Product {
  id: string | number;
  title: string;
  description: string;
  price: number | string;
  image: string;
  currency?: string;
  initialQuantity?: number;
  category?: string;
  subcategory?: string;
  stock?: number;
  original_price?: string | number;
  specifications?: { id?: number; name: string; value: string }[];
  image2?: string;
  image3?: string;
  image4?: string;
}

interface ProductCardProps {
  product: Product;
  colorScheme?: "green" | "blue";
  className?: string;
  onProductClick?: (product: Product) => void;
}

export default function ProductCard({
  product,
  colorScheme = "green",
  className = "",
  onProductClick,
}: ProductCardProps) {
  const { getItemQuantity, addItem, updateQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  const [isFavorite, setIsFavorite] = useState(false);

  const primaryBtnClass =
    colorScheme === "blue"
      ? "bg-[#0265CB] hover:bg-[#0256ad] text-white"
      : "bg-[#00A654] hover:bg-[#008f48] text-white";

  const handleAddToCart = () => {
    addItem(product, 1);
  };

  const handleIncrement = () => {
    updateQuantity(String(product.id), 1);
  };

  const handleDecrement = () => {
    updateQuantity(String(product.id), -1);
  };

  return (
    <div
      className={`bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] transition-all duration-300 flex flex-col justify-between group ${className}`}
    >
      {/* Top: Product Image Box — click to open detail modal */}
      <div
        className="relative w-full aspect-[4/3] rounded-lg sm:rounded-xl bg-[#f3f4f6] flex items-center justify-center p-2 sm:p-3 overflow-hidden cursor-pointer"
        onClick={() => onProductClick?.(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onProductClick?.(product)}
        aria-label={`View details for ${product.title}`}
      >
        {/* Star / Wishlist Button (Top Right) — stop propagation so it doesn't open modal */}
        <button
          type="button"
          aria-label="Add to favorites"
          onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-gray-500 hover:text-amber-500 transition-colors shadow-xs"
        >
          <svg
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform active:scale-125 ${
              isFavorite ? "fill-amber-400 text-amber-400" : "fill-none text-gray-600"
            }`}
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        </button>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.title}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 select-none"
        />
      </div>

      {/* Middle: Details & Price */}
      <div className="flex flex-col flex-1 pt-2 sm:pt-2.5 pb-1 sm:pb-2">
        <h3 className="font-bold text-gray-900 text-xs sm:text-sm tracking-tight leading-snug line-clamp-1">
          {product.title}
        </h3>

        <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 line-clamp-1 leading-relaxed">
          {product.description}
        </p>

        {/* Price (Centered) */}
        <div className="text-center mt-1.5 sm:mt-2 pt-0.5">
          <span className="font-extrabold text-gray-900 text-xs sm:text-base tracking-tight">
            {product.currency || "₦"}
            {typeof product.price === "number"
              ? product.price.toLocaleString("en-NG", { minimumFractionDigits: 0 })
              : String(product.price).replace(/^[₦$]\s*/, "")}
          </span>
        </div>
      </div>

      {/* Bottom Action Area: Either "Add to cart" button OR [-] quantity [+] controls */}
      <div className="mt-1 sm:mt-1.5 h-8 sm:h-9 flex items-center justify-center">
        {quantity === 0 ? (
          // Default State: Full width rounded "Add to cart" button
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full h-full rounded-lg sm:rounded-xl font-bold text-xs tracking-wide transition-all shadow-xs active:scale-98 ${primaryBtnClass}`}
          >
            Add to cart
          </button>
        ) : (
          // In Cart State: [-] count [+] controls matching reference card 2
          <div className="w-full h-full flex items-center justify-between gap-1.5 sm:gap-2">
            {/* Minus Button */}
            <button
              type="button"
              onClick={handleDecrement}
              aria-label="Decrease quantity"
              className={`w-8 sm:w-11 h-full rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all shadow-xs active:scale-95 ${primaryBtnClass}`}
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              </svg>
            </button>

            {/* Quantity Number */}
            <span className="font-extrabold text-gray-900 text-xs sm:text-sm select-none px-1 text-center flex-1">
              {quantity}
            </span>

            {/* Plus Button */}
            <button
              type="button"
              onClick={handleIncrement}
              aria-label="Increase quantity"
              className={`w-8 sm:w-11 h-full rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all shadow-xs active:scale-95 ${primaryBtnClass}`}
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
