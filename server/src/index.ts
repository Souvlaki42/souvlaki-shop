import "dotenv/config";
import env from "./env";
import cors from "cors";
import express, { Request, Response } from "express";
const app = express();

app.use(express.json());
app.use(cors({ origin: env.CLIENT_URL }));

import Stripe from "stripe";
import paypal from "@paypal/checkout-server-sdk";
const paypalEnvironment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new paypalEnvironment(env.PAYPAL_CLIENT_ID, env.PAYPAL_CLIENT_SECRET)
);

const stripe = new Stripe(env.STRIPE_API_KEY, { apiVersion: "2022-11-15" });

app.listen(env.PORT);

function getDiscountedPrice(price: number, discount: number) {
  return price - price * (discount / 100);
}

type CartItem = {
  id: number;
  quantity: number;
};

type StoreItem = {
  id: number;
  name: string;
  price: number;
  imgUrl: string;
  discount: number;
};

app.post("/get-sensitive-info", (req: Request, res: Response) => {
  res.json({ paypal_client_id: env.PAYPAL_CLIENT_ID });
});

app.post("/checkout-with-stripe", async (req: Request, res: Response) => {
  try {
    const cartItems = req.body.cartItems;
    const storeItems = req.body.storeItems;

    const lineItems = cartItems.map((item: CartItem) => {
      const storeItem = storeItems.find((i: StoreItem) => i.id === item.id);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: storeItem.name,
          },
          unit_amount:
            getDiscountedPrice(storeItem.price, storeItem.discount) * 100,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${env.CLIENT_URL}/success`,
      cancel_url: `${env.CLIENT_URL}/store`,
      line_items: lineItems,
    });

    res.json({ url: session.url });
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
    else res.status(500).json({ error: "Unknown error" });
  }
});

function removeMoreThanTwoDecimals(value: number) {
  return Math.trunc(value * 100) / 100;
}

app.post("/checkout-with-paypal", async (req: Request, res: Response) => {
  try {
    const cartItems = req.body.cartItems;
    const storeItems = req.body.storeItems;

    const totalAmount = cartItems.reduce(
      (total: string, cartItem: CartItem) => {
        const item = storeItems.find((i: StoreItem) => i.id === cartItem.id);
        return (
          total +
          removeMoreThanTwoDecimals(
            getDiscountedPrice(item?.price || 0, item?.discount || 0) *
              cartItem.quantity
          )
        );
      },
      0
    );

    const lineItems = cartItems.map((item: CartItem) => {
      const storeItem = storeItems.find((i: StoreItem) => i.id === item.id);
      return {
        name: storeItem.name,
        unit_amount: {
          currency_code: "USD",
          value: removeMoreThanTwoDecimals(
            getDiscountedPrice(storeItem.price, storeItem.discount)
          ),
        },
        quantity: item.quantity,
      };
    });

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: removeMoreThanTwoDecimals(
              parseFloat(totalAmount)
            ).toString(),
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: removeMoreThanTwoDecimals(
                  parseFloat(totalAmount)
                ).toString(),
              },
              discount: {
                currency_code: "USD",
                value: "0.00",
              },
              handling: {
                currency_code: "USD",
                value: "0.00",
              },
              insurance: {
                currency_code: "USD",
                value: "0.00",
              },
              shipping: {
                currency_code: "USD",
                value: "0.00",
              },
              shipping_discount: {
                currency_code: "USD",
                value: "0.00",
              },
              tax_total: {
                currency_code: "USD",
                value: "0.00",
              },
            },
          },
          items: lineItems,
        },
      ],
    });

    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
    else res.status(500).json({ error: "Unknown error" });
  }
});
