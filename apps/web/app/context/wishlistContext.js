"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";

const WishlistContext = createContext();

export const useWishlistContext = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [wishlist, setWishlist] = useState([]);
  const mergedRef = useRef(false);

  // Initialize wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedWishlist = localStorage.getItem("memserviceWishlist");
        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
      } catch (e) {}
    }
  }, []);

  // When user logs in, merge guest localStorage wishlist into server via POST /api/me/wishlist/merge
  useEffect(() => {
    const mergeWishlistOnLogin = async () => {
      if (status !== "authenticated" || !session?.accessToken || mergedRef.current) {
        return;
      }
      mergedRef.current = true;

      try {
        const localRaw = typeof window !== "undefined" ? localStorage.getItem("memserviceWishlist") : null;
        const localItems = localRaw ? JSON.parse(localRaw) : [];
        const productIds = localItems
          .map((item) => item._id || item.id)
          .filter(Boolean);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

        if (productIds.length > 0) {
          const res = await fetch(`${apiUrl}/api/me/wishlist/merge`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({ productIds }),
          });

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.wishlist)) {
              setWishlist(data.wishlist);
              if (typeof window !== "undefined") {
                localStorage.setItem("memserviceWishlist", JSON.stringify(data.wishlist));
              }
              return;
            }
          }
        }

        // If no guest items to merge, fetch server wishlist
        const getRes = await fetch(`${apiUrl}/api/me/wishlist`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        if (getRes.ok) {
          const getData = await getRes.json();
          if (Array.isArray(getData.wishlist)) {
            setWishlist(getData.wishlist);
            if (typeof window !== "undefined") {
              localStorage.setItem("memserviceWishlist", JSON.stringify(getData.wishlist));
            }
          }
        }
      } catch (err) {
        console.error("Wishlist sync error:", err);
      }
    };

    mergeWishlistOnLogin();
  }, [session, status]);

  const addToWishlist = async (product) => {
    const pid = product._id || product.id;
    if (!pid) return;

    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((p) => (p._id || p.id) === pid);
      if (exists) return prevWishlist;
      const updated = [...prevWishlist, product];
      if (typeof window !== "undefined") {
        localStorage.setItem("memserviceWishlist", JSON.stringify(updated));
      }
      return updated;
    });

    // If logged in, sync to server
    if (session?.accessToken) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        await fetch(`${apiUrl}/api/me/wishlist`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ productId: pid, action: "add" }),
        });
      } catch (e) {}
    }
  };

  const removeFromWishlist = async (productId) => {
    setWishlist((prevWishlist) => {
      const updated = prevWishlist.filter((product) => (product._id || product.id) !== productId);
      if (typeof window !== "undefined") {
        localStorage.setItem("memserviceWishlist", JSON.stringify(updated));
      }
      return updated;
    });

    // If logged in, sync to server
    if (session?.accessToken) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        await fetch(`${apiUrl}/api/me/wishlist`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ productId, action: "remove" }),
        });
      } catch (e) {}
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
