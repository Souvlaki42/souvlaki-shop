import { Button, Offcanvas, Stack } from "react-bootstrap";
import { useShoppingCart } from "../context/ShoppingCartContext";
import {
  formatCurrency,
  getDiscountedPrice,
} from "../utilities/formatCurrency";
import { CartItem } from "./CartItem";
import storeItems from "../data/items.json";
import { ShoppingCartProps } from "../utilities/types";

export function ShoppingCart({ isOpen }: ShoppingCartProps) {
  const { closeCart, cartItems } = useShoppingCart();

  function onCheckout() {
    fetch("http://localhost:3000/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cartItems: cartItems, storeItems: storeItems }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        return res.json().then(json => Promise.reject(json));
      })
      .then(({url}) => {
        window.location = url;
      })
      .catch((e) => console.error(e.error));
  }

  return (
    <Offcanvas show={isOpen} onHide={closeCart} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Cart</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Stack gap={3}>
          {cartItems.map((item) => (
            <CartItem key={item.id} {...item} />
          ))}
          <div className="ms-auto fw-bold fs-5">
            Total:{" "}
            {formatCurrency(
              cartItems.reduce((total, cartItem) => {
                const item = storeItems.find((i) => i.id === cartItem.id);
                return total + getDiscountedPrice(item?.price || 0, item?.discount || 0) * cartItem.quantity;
              }, 0)
            )}
          </div>
        </Stack>
        <Button
          variant="primary"
          className="ms-auto d-flex mt-3"
          onClick={() => onCheckout()}
        >
          Checkout
        </Button>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
