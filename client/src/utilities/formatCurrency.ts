const CURRENCY_FORMATTER = new Intl.NumberFormat(undefined,
    { currency: "USD", style: "currency" }
);

export function formatCurrency(number: number) {
    return CURRENCY_FORMATTER.format(number);
}

export function getDiscountedPrice(price: number, discount: number) {
    return price - (price * (discount / 100));
}