import { z } from "zod";

export interface BackendProduct {
  id: number;
  name: string;
  image: string;
  category: string;
  subcategory: string;
  original_price: string;
  price: string;
  stock: number;
}

export interface BackendProductDetail extends BackendProduct {
  image2?: string;
  image3?: string;
  image4?: string;
  description: string;
  created_at: string;
  updated_at: string;
  specifications?: {
    id: number;
    name: string;
    value: string;
  }[];
}

export interface PaginatedData<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BackendOrderItem {
  product_id: number;
  product_name: string;
  product_image: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}

export interface BackendOrder {
  order_number: string;
  status: string;
  status_label: string;
  payment_status: string;
  total: string;
  created_at: string;
  total_quantity: number;
  items: BackendOrderItem[];
}

export const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, "Full name is required"),
  customer_email: z.string().trim().email("Valid email is required"),
  customer_phone: z.string().trim().min(7, "Phone number is required"),
  shipping_address: z.string().trim().min(3, "Shipping address is required"),
  shipping_city: z.string().trim().min(2, "City is required"),
  shipping_state: z.string().trim().min(2, "State is required"),
  items: z
    .array(
      z.object({
        product_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Cart cannot be empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
