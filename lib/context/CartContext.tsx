"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/app/components/ProductCard";

export interface CartItem {
  id: string;
  productId?: number | string;
  title: string;
  specs: string;
  sku: string;
  price: number;
  quantity: number;
  stockStatus: "in_stock" | "low_stock";
  stockText: string;
  image: string;
}

// No default items — cart starts empty; real items come from localStorage or user actions
const DEFAULT_CART_ITEMS: CartItem[] = [];

interface CartContextType {
  items: CartItem[];
  savedItems: CartItem[];
  totalCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  setItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  removeSaved: (id: string) => void;
  clearCart: () => void;
  getItemQuantity: (id: string | number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "glopharm_cart_items_v1";
const SAVED_STORAGE_KEY = "glopharm_saved_items_v1";

function parsePrice(val: number | string): number {
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(DEFAULT_CART_ITEMS);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
      const storedSaved = localStorage.getItem(SAVED_STORAGE_KEY);
      if (storedSaved) {
        setSavedItems(JSON.parse(storedSaved));
      }
    } catch {
      // Ignore parse errors and use default
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or disabled
    }
  }, [items, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedItems));
    } catch {
      // Storage full or disabled
    }
  }, [savedItems, isInitialized]);

  const addItem = useCallback((product: Product, qty = 1) => {
    const pId = String(product.id);
    const numericPrice = parsePrice(product.price);

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === pId || item.productId === product.id
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qty,
        };
        return next;
      }

      const newItem: CartItem = {
        id: pId,
        productId: product.id,
        title: product.title,
        specs: product.description || "General Healthcare & Grocery",
        sku: `SKU: GP-${String(product.id).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)}`,
        price: numericPrice,
        quantity: Math.max(1, qty),
        stockStatus: (product.stock !== undefined && product.stock <= 5) ? "low_stock" : "in_stock",
        stockText: (product.stock !== undefined && product.stock <= 5) ? `Only ${product.stock} left` : "In Stock",
        image: product.image,
      };

      return [newItem, ...prev];
    });
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id || String(item.productId) === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const setItemQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id || String(item.productId) === id) {
            return quantity > 0 ? { ...item, quantity } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id && String(item.productId) !== id));
  }, []);

  const saveForLater = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id || String(item.productId) === id);
      if (target) {
        setSavedItems((s) => [target, ...s.filter((x) => x.id !== target.id)]);
        return prev.filter((item) => item.id !== target.id);
      }
      return prev;
    });
  }, []);

  const moveToCart = useCallback((id: string) => {
    setSavedItems((prev) => {
      const target = prev.find((item) => item.id === id || String(item.productId) === id);
      if (target) {
        setItems((c) => [target, ...c.filter((x) => x.id !== target.id)]);
        return prev.filter((item) => item.id !== target.id);
      }
      return prev;
    });
  }, []);

  const removeSaved = useCallback((id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id && String(item.productId) !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback((id: string | number): number => {
    const strId = String(id);
    const item = items.find((i) => i.id === strId || String(i.productId) === strId);
    return item ? item.quantity : 0;
  }, [items]);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        savedItems,
        totalCount,
        subtotal,
        addItem,
        updateQuantity,
        setItemQuantity,
        removeItem,
        saveForLater,
        moveToCart,
        removeSaved,
        clearCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
