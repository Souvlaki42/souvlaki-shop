import Stripe from "stripe";
import { z } from "zod";
import { env } from "~/lib/env";
import {
  CartItem,
  Currency,
  PaymentMethod,
  StoreItem,
  StripeLineItem,
} from "~/lib/types";
import {
  InvalidCartItemError,
  getDiscountedPrice,
  jsonResponse,
  parseBody,
} from "~/lib/utils";
import { cartItemValidator, storeItemValidator } from "~/lib/validators";

const bodyValidator = z.object({
  cartItems: z.array(cartItemValidator),
  storeItems: z.array(storeItemValidator),
});

const getLineItems = (
  cartItems: CartItem[],
  storeItems: StoreItem[],
  currency: Currency = "usd"
): StripeLineItem[] => {
  return cartItems.map((item) => {
    const storeItem = storeItems.find((i) => i.id === item.id);
    if (!storeItem) throw InvalidCartItemError();
    const { name, price, discount } = storeItem;
    const unit_amount = getDiscountedPrice(price, discount) * 100;
    const quantity = item.quantity;

    return {
      price_data: {
        currency,
        product_data: { name, unit_amount },
        unit_amount,
      },
      quantity,
    };
  });
};

const createSession = async (
  stripe: Stripe,
  line_items: StripeLineItem[],
  payment_method_types?: PaymentMethod[]
): Promise<Stripe.Response<Stripe.Checkout.Session>> => {
  return stripe.checkout.sessions.create({
    payment_method_types,
    mode: "payment",
    success_url: `${env.CLIENT_URL}/success`,
    cancel_url: `${env.CLIENT_URL}/store`,
    line_items,
  });
};

export const POST = async ({ request }: { request: Request }) => {
  try {
    const { cartItems, storeItems } = await parseBody(bodyValidator, request);
    const stripe = new Stripe(env.STRIPE_API_KEY);
    const lineItems = getLineItems(cartItems, storeItems);
    const { url } = await createSession(stripe, lineItems, ["card"]);
    return jsonResponse({ url }, 201);
  } catch (error) {
    if (error instanceof Error)
      return jsonResponse({ message: error.message }, 500);
    return jsonResponse({ error: "Unknown error." }, 500);
  }
};
