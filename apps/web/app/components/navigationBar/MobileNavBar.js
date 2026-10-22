"use client";

import Link from "next/link";
import { House, ShoppingCart, Heart, Store, User } from "lucide-react";
import { useCartContext } from "@/app/context/cartContext";
import { useWishlistContext } from "@/app/context/wishlistContext";
import { usePathname } from "next/navigation";

export default function MobileNavBar() {
  const { cart = [] } = useCartContext();
  const { wishlist = [] } = useWishlistContext();
  const pathname = usePathname();

  const navItems = [
    { label: "Home", icon: House, url: "/" },
    { label: "Shop", icon: Store, url: "/shop" },
    {
      label: "Cart",
      icon: ShoppingCart,
      url: "/cart",
      badge: cart.length,
    },
    {
      label: "Wishlist",
      icon: Heart,
      url: "/wishlist",
      badge: wishlist.length,
    },
    { label: "Account", icon: User, url: "/account" },
  ];

  return (
    <nav className="container relative mx-auto flex justify-around items-center" aria-label="Mobile Bottom Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.url;

        return (
          <Link
            key={item.url}
            href={item.url}
            className={`relative flex flex-col items-center gap-1 p-1 transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.7} />
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-sunset-orange text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
