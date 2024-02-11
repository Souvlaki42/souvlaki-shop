import { ZodObject, ZodRawShape } from "zod";
import { Currency } from "./types";

export function formatCurrency(number: number, currency_code: Currency = "usd") {
  const CURRENCY_FORMATTER = new Intl.NumberFormat(undefined, {
    currency: currency_code.toUpperCase(),
    style: "currency",
  });
  return CURRENCY_FORMATTER.format(number);
}

export function getDiscountedPrice(price: number, discount?: number) {
  return price - price * ((discount ?? 0) / 100);
}

export function removeMoreThanTwoDecimals(value: number) {
  return Math.trunc(value * 100) / 100;
}

export async function parseBody<T extends ZodRawShape>(
  validator: ZodObject<T>,
  request: Request
) {
  const rawBody = await new Response(request.body).json();
  return validator.parse(rawBody);
}

export async function jsonResponse(
  response: Record<string, unknown>,
  status: number = 200
) {
  return new Response(JSON.stringify(response), { status });
}

export const InvalidCartItemError = () =>
  new Error("Invalid cart item found.", {
    cause: "Cart item id was not found in the database.",
  });
