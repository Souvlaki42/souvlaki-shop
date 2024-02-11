import { z } from "zod";

export const cartItemValidator = z.object({
  id: z.number(),
  quantity: z.number(),
});

export const storeItemValidator = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  imgUrl: z.string(),
  discount: z.number(),
});

export const rawProductValidator = z.object({
  discountPercentage: z.number(),
  id: z.number(),
  price: z.number(),
  thumbnail: z.string(),
  title: z.string(),
});
