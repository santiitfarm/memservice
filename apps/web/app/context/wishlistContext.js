"use client";

import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

export const useWishlistContext = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    if (typeof window !== "undefined") {
      const savedWishlist = localStorage.getItem("memserviceWishlist");
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    }
    return [];
  });

  const addToWishlist = (product) => {
    setWishlist((prevWishlist) => [...prevWishlist, product]);
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prevWishlist) =>
      prevWishlist.filter((product) => product.id !== productId)
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("memserviceWishlist", JSON.stringify(wishlist));
    }
  }, [wishlist]);

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
