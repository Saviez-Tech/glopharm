"use client";

import React, { useState } from "react";

export interface Product {
  id: string | number;
  title: string;
  description: string;
  price: number | string;
  image: string;
  currency?: string;
  initialQuantity?: number;
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
  const [quantity, setQuantity] = useState(product.initialQuantity || 0);
  const [isFavorite, setIsFavorite] = useState(false);

  const primaryBtnClass =
    colorScheme === "blue"
      ? "bg-[#0265CB] hover:bg-[#0256ad] text-white"
      : "bg-[#00A654] hover:bg-[#008f48] text-white";

  const handleAddToCart = () => {
    setQuantity(1);
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 0));
  };

  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-[28px] p-3 sm:p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between group ${className}`}
    >
      {/* Top: Product Image Box — click to open detail modal */}
      <div
        className="relative w-full aspect-[4/3] rounded-xl sm:rounded-[22px] bg-[#f3f4f6] flex items-center justify-center p-2.5 sm:p-4 overflow-hidden cursor-pointer"
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
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-gray-500 hover:text-amber-500 transition-colors shadow-xs"
        >
          <svg
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform active:scale-125 ${
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
      <div className="flex flex-col flex-1 pt-2.5 sm:pt-4 pb-2 sm:pb-3">
        <h3 className="font-bold text-gray-900 text-xs sm:text-base tracking-tight leading-snug line-clamp-1">
          {product.title}
        </h3>

        <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price (Centered) */}
        <div className="text-center mt-2 sm:mt-3 pt-0.5">
          <span className="font-extrabold text-gray-900 text-sm sm:text-lg tracking-tight">
            {typeof product.price === "number"
              ? `${product.price.toFixed(2)}${product.currency || "$"}`
              : `${product.price}${product.currency || "$"}`}
          </span>
        </div>
      </div>

      {/* Bottom Action Area: Either "Add to cart" button OR [-] quantity [+] controls */}
      <div className="mt-1.5 sm:mt-2 h-9 sm:h-12 flex items-center justify-center">
        {quantity === 0 ? (
          // Default State: Full width rounded "Add to cart" button
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full h-full rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm active:scale-98 ${primaryBtnClass}`}
          >
            Add to cart
          </button>
        ) : (
          // In Cart State: [-] count [+] controls matching reference card 2
          <div className="w-full h-full flex items-center justify-between gap-1.5 sm:gap-3">
            {/* Minus Button */}
            <button
              type="button"
              onClick={handleDecrement}
              aria-label="Decrease quantity"
              className={`w-9 sm:w-16 h-full rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg flex items-center justify-center transition-all shadow-sm active:scale-95 ${primaryBtnClass}`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              </svg>
            </button>

            {/* Quantity Number */}
            <span className="font-extrabold text-gray-900 text-xs sm:text-base select-none px-1 text-center flex-1">
              {quantity}
            </span>

            {/* Plus Button */}
            <button
              type="button"
              onClick={handleIncrement}
              aria-label="Increase quantity"
              className={`w-9 sm:w-16 h-full rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg flex items-center justify-center transition-all shadow-sm active:scale-95 ${primaryBtnClass}`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
