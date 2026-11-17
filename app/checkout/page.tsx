import { redirect } from "next/navigation";

/**
 * /checkout → redirect to /cart
 * The full checkout flow lives inside the cart page (steps 1 → 2 → 3).
 */
export default function CheckoutPage() {
  redirect("/cart");
}
