"use client";

import { useCartContext } from "@/app/context/cartContext";
import { useWishlistContext } from "@/app/context/wishlistContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PiHeartLight, PiShoppingCartSimple } from "react-icons/pi";

// import context
import { User } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

// data
const navigationRightIcon = [
  { icon: <PiHeartLight />, url: "/wishlist", count: 0 },
  { icon: <PiShoppingCartSimple />, url: "/cart", count: 0 },
  { icon: <User />, url: "/account" },
];

function MainNavigation({ menuData }) {
  const pathname = usePathname();
  const { cart } = useCartContext();
  const { wishlist } = useWishlistContext();
  const { data } = useSession();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Mark component as rendered on client
  }, []);

  navigationRightIcon[0].count = wishlist.length;
  navigationRightIcon[1].count = cart.length;

  return (
    <section className="relative flex items-center justify-between bg-sky-blue px-6 rounded-lg">
      {/* Main Navigation Left Info Section */}
      <div className="flex items-center gap-2">
        {menuData.map((info, ind) => (
          <div key={ind} className="relative group py-6">
            <Link
              className={`text-white font-semibold ${
                pathname === info?.url
                  ? " border-white shadow-md shadow-white"
                  : "border-transparent"
              } transition-all duration-300 group-hover:border-white group-hover:shadow-md group-hover:shadow-white rounded-full  border-t-2 p-2 px-4`}
              href={info?.url}
            >
              {info?.name}
            </Link>

            {/* {(info?.subBrandInfo || info?.subCategoryInfo) && (
              <div className="w-[1500px] hidden absolute left-0 top-[72px] bg-white text-deep-sea-blue shadow-lg p-6 rounded-lg  group-hover:inline-block z-50">
                <div className="w-full grid grid-cols-6 gap-4">
                  {info?.subBrandInfo &&
                    info?.subBrandInfo.map((item, subInd) => (
                      <Link
                        href={""}
                        key={subInd}
                        className="flex flex-col items-center border border-light-mist p-2 rounded-lg "
                      >
                        <div>
                          {item.image && (
                            <Image
                              src={item?.image}
                              width={400}
                              height={400}
                              alt={item.title}
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <span className="text-sm font-medium ">
                          {item?.title}
                        </span>
                      </Link>
                    ))}
                </div>

                <div className="w-full grid grid-cols-6 gap-6">
                  {info?.subCategoryInfo &&
                    info?.subCategoryInfo.map((item, subInd) => (
                      <Link
                        href={""}
                        key={subInd}
                        className="flex items-center"
                      >
                        <div>
                          {item.image && (
                            <Image
                              src={item?.image}
                              width={400}
                              height={400}
                              alt={item.title}
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {item?.title}
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            )} */}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-8">
        {navigationRightIcon.map((icon, ind) => (
          <Link
            className="text-white text-2xl relative inline-flex items-center gap-2"
            href={icon?.url}
            key={ind}
          >
            {ind === 2 && data?.user?.customer_name && (
              <span className="ml-2 text-xs text-soft-lavender">
                {data?.user?.customer_name}
              </span>
            )}
            {icon?.icon}

            {icon?.count > 0 && (
              <span className="absolute top-[-8px] right-[-8px] bg-white text-blue-500 text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {icon?.count}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default MainNavigation;
