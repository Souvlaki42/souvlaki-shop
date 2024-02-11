import paypal from "@paypal/checkout-server-sdk";
import { z } from "zod";
import { env } from "~/lib/env";
import { CartItem, Currency, PaypalLineItem, StoreItem } from "~/lib/types";
import {
  InvalidCartItemError,
  getDiscountedPrice,
  jsonResponse,
  parseBody,
  removeMoreThanTwoDecimals,
} from "~/lib/utils";
import { cartItemValidator, storeItemValidator } from "~/lib/validators";

const bodyValidator = z.object({
  cartItems: z.array(cartItemValidator),
  storeItems: z.array(storeItemValidator),
});

const getTotalAmount = (
  cartItems: CartItem[],
  storeItems: StoreItem[],
  currency: Currency = "usd"
): number => {
  return cartItems.reduce((total: number, item: CartItem) => {
    const storeItem = storeItems.find((i) => i.id === item.id);
    if (!storeItem) throw InvalidCartItemError();
    const { name, price, discount } = storeItem;
    const quantity = item.quantity;
    return (
      total +
      removeMoreThanTwoDecimals(getDiscountedPrice(price, discount) * quantity)
    );
  }, 0);
};

const getLineItems = (
  cartItems: CartItem[],
  storeItems: StoreItem[],
  currency_code: Currency = "usd"
): PaypalLineItem[] => {
  return cartItems.map((item) => {
    const storeItem = storeItems.find((i) => i.id === item.id);
    if (!storeItem) throw InvalidCartItemError();
    const { name, price, discount } = storeItem;
    const value = removeMoreThanTwoDecimals(
      getDiscountedPrice(price, discount)
    ).toString();
    const quantity = item.quantity.toString();

    return {
      name,
      unit_amount: { currency_code, value },
      quantity,
      category: "PHYSICAL_GOODS",
    };
  });
};

const createRequest = (
  totalAmount: number,
  lineItems: PaypalLineItem[],
  currency_code: Currency = "usd"
): paypal.orders.OrdersCreateRequest => {
  const zero = "0.00";
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code,
          value: removeMoreThanTwoDecimals(totalAmount).toString(),
          breakdown: {
            item_total: {
              currency_code,
              value: removeMoreThanTwoDecimals(totalAmount).toString(),
            },
            discount: { currency_code, value: zero },
            handling: { currency_code, value: zero },
            insurance: { currency_code, value: zero },
            shipping: { currency_code, value: zero },
            shipping_discount: { currency_code, value: zero },
            tax_total: { currency_code, value: zero },
          },
        },
        items: lineItems,
      },
    ],
  });

  return request;
};

export const POST = async ({ request }: { request: Request }) => {
  try {
    const { cartItems, storeItems } = await parseBody(bodyValidator, request);
    const lineItems = getLineItems(cartItems, storeItems);
    const totalAmount = getTotalAmount(cartItems, storeItems);
    const paymentRequest = createRequest(totalAmount, lineItems);
    const environment =
      env.NODE_ENV === "production"
        ? paypal.core.LiveEnvironment
        : paypal.core.SandboxEnvironment;
    const client = new paypal.core.PayPalHttpClient(
      new environment(env.PAYPAL_CLIENT_ID, env.PAYPAL_CLIENT_SECRET)
    );
    const { result } = await client.execute(paymentRequest);
    return jsonResponse({ id: result.id }, 201);
  } catch (error) {
    if (error instanceof Error)
      return jsonResponse({ message: error.message }, 500);
    return jsonResponse({ error: "Unknown error." }, 500);
  }
};
