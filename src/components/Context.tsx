import { createContext, createSignal, useContext } from "solid-js";
import useLocalStorage from "~/lib/localstorage";
import {
  CartItem,
  ShoppingCartProviderProps,
  ShoppingCartContext as shoppingCartContext,
} from "~/lib/types";
import { ShoppingCart } from "../components/ShoppingCart";

const ShoppingCartContext = createContext({} as shoppingCartContext);

export function useShoppingCart() {
  return useContext(ShoppingCartContext);
}

export function ShoppingCartProvider({ children }: ShoppingCartProviderProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>(
    "shopping-cart",
    []
  );

  const cartQuantity = cartItems().reduce(
    (quantity, item) => item.quantity + quantity,
    0
  );
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  function getItemQuantity(id: number) {
    return cartItems().find((item) => item.id === id)?.quantity || 0;
  }

  function increaseCartQuantity(id: number) {
    const items = () => {
      if (cartItems().find((item) => item.id === id) == null)
        return [...cartItems(), { id, quantity: 1 }];
      else
        return cartItems().map((item) => {
          if (item.id === id) return { ...item, quantity: item.quantity + 1 };
          else return item;
        });
    };
    setCartItems(items());
  }

  function decreaseCartQuantity(id: number) {
    const items = () => {
      if (cartItems().find((item) => item.id === id)?.quantity === 1)
        return cartItems().filter((item) => item.id !== id);
      else
        return cartItems().map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity - 1 };
          } else {
            return item;
          }
        });
    };
    setCartItems(items());
  }

  function removeFromCart(id: number) {
    setCartItems(cartItems().filter((item) => item.id !== id));
  }

  return (
    <ShoppingCartContext.Provider
      value={{
        getItemQuantity,
        increaseCartQuantity,
        decreaseCartQuantity,
        removeFromCart,
        openCart,
        closeCart,
        cartItems: cartItems(),
        cartQuantity,
      }}>
      {children}
      <ShoppingCart isOpen={isOpen()} />
    </ShoppingCartContext.Provider>
  );
}
