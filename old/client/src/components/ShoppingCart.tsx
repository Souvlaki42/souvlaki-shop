import { Button, Offcanvas, Stack, Image } from "react-bootstrap";
import { useShoppingCart } from "../context/ShoppingCartContext";
import {
  formatCurrency,
  getDiscountedPrice,
} from "../utilities/formatCurrency";
import { CartItem } from "./CartItem";
import storeItems from "../data/items.json";
import { ShoppingCartProps } from "../utilities/types";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { OnApproveActions, OnApproveData } from "@paypal/paypal-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function ShoppingCart({ isOpen }: ShoppingCartProps) {
  const { closeCart, cartItems } = useShoppingCart();
  const navigate = useNavigate();

  function onStripeCheckout() {
    fetch("http://localhost:3000/checkout-with-stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cartItems: cartItems, storeItems: storeItems }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        return res.json().then((json) => Promise.reject(json));
      })
      .then(({ url }) => {
        window.location = url;
      })
      .catch((e) => console.error(e.error));
  }

  const totalAmount = cartItems.reduce((total, cartItem) => {
    const item = storeItems.find((i) => i.id === cartItem.id);
    return (
      total +
      getDiscountedPrice(item?.price || 0, item?.discount || 0) *
        cartItem.quantity
    );
  }, 0);

  function onPaypalCheckout() {
    return fetch("http://localhost:3000/checkout-with-paypal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cartItems: cartItems,
        storeItems: storeItems,
      }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        return res.json().then((json) => Promise.reject(json));
      })
      .then(({ id }) => {
        return id;
      })
      .catch((e) => console.error(e.error));
    
  }

  function onPaypalApprove(data: OnApproveData, actions: OnApproveActions) {
    return actions.order!.capture().then((details) => {
      navigate("/success");
    });
  }

  const [isStripeCheckoutButtonHover, setIsStripeCheckoutButtonHover] =
    useState(false);

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
          <div className="fw-bold fs-5 text-center">
            Total: {formatCurrency(totalAmount)}
          </div>
        </Stack>
        <Button
          onMouseEnter={() => setIsStripeCheckoutButtonHover(true)}
          onMouseLeave={() => setIsStripeCheckoutButtonHover(false)}
          variant="primary"
          className="ms-auto d-flex mt-3 rounded-pill text-light fs-5 w-100 mb-3"
          style={{
            height: "40px",
            backgroundColor: (isStripeCheckoutButtonHover ? "#f0b93a" : "#FFC439"),
            borderColor: (isStripeCheckoutButtonHover ? "#f0b93a" : "#FFC439"),
          }}
          onClick={() => onStripeCheckout()}
        >
          <Image src="/stripe.png" className="mx-auto" />
        </Button>
        <PayPalButtons
          fundingSource={"paypal"}
          style={{ shape: "pill", height: 40 }}
          createOrder={(data, actions) => onPaypalCheckout()}
          onApprove={(data, actions) => onPaypalApprove(data, actions)}
          onError={(err) => alert(err)}
        />
      </Offcanvas.Body>
    </Offcanvas>
  );
}
