"use client";

import WishListCard from "../components/WishListCard";
import { useWishlistContext } from "../context/wishlistContext";

const WishListPage = () => {
  const { wishlist, removeFromWishlist } = useWishlistContext();

  return (
    <div className="container mx-auto flex flex-col items-center py-10 px-6">
      <h1 className="font-bold text-3xl mb-6 text-gray-800">Your Wishlist</h1>
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-lg p-6">
        {wishlist.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            Your wishlist is empty!
          </p>
        ) : (
          <div className="grid grid-cols-1">
            {wishlist.map((item) => (
              <WishListCard
                key={item.id}
                wishlist={item}
                removeFromWishlist={removeFromWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishListPage;
