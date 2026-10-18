"use client";
import { createContext, useContext, useEffect, useReducer } from "react";
import reducer from "./reducer/cartReducer";

const CartContext = createContext();

const getLocationCartData = () => {
  if (typeof window === "undefined") return [];
  let newCartData = localStorage.getItem("memservice");
  return newCartData ? JSON.parse(newCartData) : [];
};

const initialState = {
  cart: getLocationCartData(),
  total_item: "",
  shopping_free: "",
  total_price: "",
};

const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addToCart = (product) => {
    const {
      stock,
      id,
      title,
      image,
      purchase_price,
      discount,
      regular_price,
      quantity,
      manufacturer_name,
      name,
      generic_name,
    } = product;

    dispatch({
      type: "ADD_TO_CART",
      payload: {
        stock,
        id,
        title,
        image,
        purchase_price,
        discount,
        regular_price,
        quantity,
        manufacturer_name,
        name,
        generic_name,
      },
    });
  };

  const setDecrement = (id) => {
    dispatch({ type: "SET_DECREMENT", payload: id });
  };

  const setIncrement = (id) => {
    dispatch({ type: "SET_INCREMENT", payload: id });
  };

  const removeCart = (id) => {
    dispatch({ type: "REMOVE_CART", payload: id });
  };

  useEffect(() => {
    dispatch({ type: "CART_TOTAL-ITEM" });

    dispatch({ type: "CART_TOTAL_PRICE" });

    localStorage.setItem("memservice", JSON.stringify(state.cart));
  }, [state.cart]);

  return (
    <CartContext.Provider
      value={{ ...state, addToCart, removeCart, setDecrement, setIncrement }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCartContext = () => {
  return useContext(CartContext);
};

export { CartProvider, useCartContext };
