import { JSX } from "solid-js";
import type Stripe from "stripe";
import { z } from "zod";
import { cartItemValidator, rawProductValidator, storeItemValidator } from "./validators";

export type CartItem = z.infer<typeof cartItemValidator>;

export type StoreItem = z.infer<typeof storeItemValidator>;

export type RawProduct = z.infer<typeof rawProductValidator>;

export type Currency = "usd" | "eur";

export type PaymentMethod =
  Stripe.Checkout.SessionCreateParams.PaymentMethodType;

export type StripeLineItem = {
  price_data: {
    currency: Currency;
    product_data: {
      name: string;
    };
    unit_amount: number;
  };
  quantity: number;
};

export type PaypalLineItem = {
  name: string;
  unit_amount: {
    currency_code: Currency;
    value: string;
  };
  quantity: string;
  category: "DIGITAL_GOODS" | "PHYSICAL_GOODS" | "DONATION";
};

export type ShoppingCartProviderProps = {
  children: JSX.Element;
};

export type ShoppingCartContext = {
  openCart: () => void;
  closeCart: () => void;
  getItemQuantity: (id: number) => number;
  increaseCartQuantity: (id: number) => void;
  decreaseCartQuantity: (id: number) => void;
  removeFromCart: (id: number) => void;
  cartQuantity: number;
  cartItems: CartItem[];
};
