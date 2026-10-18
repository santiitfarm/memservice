"use client";
import Link from "next/link";
// import lucide icon
import { Heart, House, ShoppingCart, Store, User } from "lucide-react";
// context
import { useCartContext } from "@/app/context/cartContext";
import { useWishlistContext } from "@/app/context/wishlistContext";
import { usePathname } from "next/navigation";
// data
const mobileNavBarData = [
  { icon: <House size={24} strokeWidth={1.2} />, url: "/" },
  { icon: <User size={24} strokeWidth={1.2} />, url: "/account" },
  {
    icon: <ShoppingCart size={24} strokeWidth={1.2} />,
    url: "/cart",
    count: 0,
  },
  { icon: <Heart size={24} strokeWidth={1.2} />, url: "/wishlist", count: 0 },
  { icon: <Store size={24} strokeWidth={1.2} />, url: "/shop" },
];

function MobileNavBar() {
  const { cart } = useCartContext();
  const { wishlist } = useWishlistContext();
  const pathname = usePathname();
  mobileNavBarData[2].count = cart.length;
  mobileNavBarData[3].count = wishlist.length;

  return (
    <section className="container relative mx-auto flex justify-between items-center">
      {mobileNavBarData.map((nav, ind) => (
        <Link className="relative" href={nav?.url} key={ind}>
          {nav?.icon}
          {nav.count > 0 && (
            <span className="absolute top-[-8px] right-[-8px] bg-sunset-orange text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
              {nav.count}
            </span>
          )}
        </Link>
      ))}
    </section>
  );
}

export default MobileNavBar;
