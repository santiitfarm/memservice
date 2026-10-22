"use client";

import { useCartContext } from "@/app/context/cartContext";
import { useWishlistContext } from "@/app/context/wishlistContext";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { PiHeartLight, PiShoppingCartSimple } from "react-icons/pi";
import { User, LogOut, Package, ChevronDown, LogIn } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function MainNavigation({ menus = {} }) {
  const pathname = usePathname();
  const { cart = [] } = useCartContext();
  const { wishlist = [] } = useWishlistContext();
  const { data: session } = useSession();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountRef = useRef(null);

  // Close account dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter out any dead hardcoded items like Blog, Elements, Features
  const rawItems = menus?.header || [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: "Consultation", url: "/consultation/doctor" },
    { name: "Offers", url: "/offer" },
  ];

  const deadNames = ["blog", "elements", "features"];
  const navItems = rawItems.filter(
    (item) => !deadNames.includes(item?.name?.trim().toLowerCase())
  );

  const cartCount = cart.length;
  const wishlistCount = wishlist.length;
  const user = session?.user;

  return (
    <section className="relative flex items-center justify-between bg-primary text-primary-foreground px-6 rounded-xl shadow-md">
      {/* Navigation Links */}
      <nav className="flex items-center gap-1 py-1" aria-label="Main Navigation">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={idx}
              href={item.url || "/"}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/90 hover:bg-white/15 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Right Icons: Wishlist, Cart, Account Dropdown */}
      <div className="flex items-center gap-6 py-2">
        {/* Wishlist Link */}
        <Link
          href="/wishlist"
          aria-label="Wishlist"
          className="relative text-white hover:text-white/80 transition-colors p-1"
        >
          <PiHeartLight className="text-2xl" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[11px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow-sm">
              {wishlistCount}
            </span>
          )}
        </Link>

        {/* Cart Link */}
        <Link
          href="/cart"
          aria-label="Shopping Cart"
          className="relative text-white hover:text-white/80 transition-colors p-1"
        >
          <PiShoppingCartSimple className="text-2xl" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white text-[11px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow-sm">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Account Dropdown */}
        <div ref={accountRef} className="relative">
          {user ? (
            <div>
              <button
                type="button"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
                aria-expanded={accountMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs">
                  {user.customer_name ? user.customer_name.charAt(0).toUpperCase() : <User size={14} />}
                </div>
                <span className="max-w-[120px] truncate">
                  {user.customer_name || "Account"}
                </span>
                <ChevronDown size={14} className={`transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Account Dropdown Menu */}
              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-card text-card-foreground border border-border shadow-2xl py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-border/60">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {user.customer_name || "Customer"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user.phone_number || user.email || ""}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/account"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <User size={15} className="text-primary" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/account"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Package size={15} className="text-primary" />
                      <span>My Orders</span>
                    </Link>
                  </div>

                  <div className="border-t border-border/60 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/account/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
            >
              <LogIn size={15} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
