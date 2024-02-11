import { cache } from "@solidjs/router";
import { z } from "zod";
import { StoreItem } from "./types";
import { rawProductValidator } from "./validators";

const fetchProducts = async (): Promise<StoreItem[]> => {
  "use server";
  const response = await fetch(
    "https://dummyjson.com/products?limit=0&select=id,title,price,thumbnail,discountPercentage"
  );
  const data = await response.json();
  const rawProducts = z.array(rawProductValidator).parse(data.products);
  return rawProducts.map((product) => {
    const { id, discountPercentage, price, thumbnail, title } = product;
    return {
      id,
      name: title,
      price,
      imgUrl: thumbnail,
      discount: discountPercentage,
    };
  });
};

export const getProducts = cache(fetchProducts, "products");
