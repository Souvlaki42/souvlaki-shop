import { ReactNode } from "react";

export type CartItem = {
  id: number;
  quantity: number;
};

export type CartItemProps = {} & CartItem;

export type ShoppingCartProps = {
  isOpen: boolean;
};

export type StoreItem = {
  id: number;
  name: string;
  price: number;
  imgUrl: string;
  discount: number;
};

export type StoreItemProps = {} & StoreItem;

export type ShoppingCartProviderProps = {
  children: ReactNode;
};

export type ShoppingCartContext = {
  openCart: () => void;
  closeCart: () => void;
  getItemQuantity: (id: number) => number;
  increaseCartQuantity: (id: number) => void;
  decreaseCartQuantity: (id: number) => void;
  removeFromCart: (id: number) => void;
  cartQuantity: number;
  cartItems: CartItem[];
};