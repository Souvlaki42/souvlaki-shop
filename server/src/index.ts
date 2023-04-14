import "dotenv/config";
import env from "./env";
import cors from "cors";
import express, { Request, Response } from "express";
const app = express();

app.use(express.json());
app.use(cors({ origin: env.CLIENT_URL }));

import Stripe from "stripe";

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

app.post("/checkout", async (req: Request, res: Response) => {
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
        quantity: item.quantity
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
