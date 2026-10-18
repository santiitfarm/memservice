// import { CircleX } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import AddToCartButton from "./productCart/columnsCart/AddToCartButton";

// const WishListCard = ({ wishlist, removeFromWishlist }) => {
//   return (
//     <div className="p-3 hover:bg-sky-50 rounded-md flex lg:flex-row justify-between relative border mb-2">
//       <div className="flex gap-3 ">
//         <div className="group overflow-hidden flex flex-col items-center rounded-lg w-full">
//           <Image
//             src={wishlist?.image}
//             alt="Main image"
//             height={70}
//             width={70}
//             className="rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-110"
//           />
//           <span className="px-1 py-[2px] bg-green-600 rounded-full mt-2 text-xs  text-white font-semibold">
//             {wishlist?.stock?.length === 0 ? "Out of Stock" : "In Stock"}
//           </span>
//         </div>
//         <div className="flex items-center">
//           <div>
//             <Link
//               href={`/product/${wishlist?.id}`}
//               className="text-xl font-semibold hover:underline"
//             >
//               {wishlist?.title}
//             </Link>{" "}
//           </div>
//           <div className="ml-2">
//             <span className="text-[#15a9e3] text-base">
//               {wishlist?.discount}
//             </span>{" "}
//             <del className="text-base">{wishlist?.oldPrice}</del>{" "}
//             <span className="text-sm">{wishlist?.brand}</span>
//           </div>
//         </div>
//       </div>
//       <div className="w-full flex justify-end items-center relative">
//         <CircleX
//           onClick={() => removeFromWishlist(wishlist?.id)}
//           className="absolute -right-1 -top-2 cursor-pointer"
//         />
//         <div className="w-36">
//           <AddToCartButton
//             productData={wishlist}
//             removeFromWishlist={removeFromWishlist}
//             wishlist="wishlist"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WishListCard;
import { CircleX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./productCart/columnsCart/AddToCartButton";

const WishListCard = ({ wishlist, removeFromWishlist }) => {
  return (
    <div className="p-4 hover:bg-gray-50 rounded-lg shadow-sm transition-all duration-300 border border-gray-200 mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex  items-start sm:items-center gap-4 sm:w-auto">
          <div className="relative group overflow-hidden rounded-lg flex items-center justify-center">
            <Image
              src={wishlist?.image}
              alt="Product image"
              height={80}
              width={80}
              className="rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
          </div>
          <div className="flex flex-col min-w-fit ">
            <Link
              href={`/product/${wishlist?.id}`}
              className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-300"
            >
              {wishlist?.title}
            </Link>
            <div className="mt-1 space-x-2 w-full">
              <span className="text-blue-600 font-medium">
                {wishlist?.discount}
              </span>
              <del className="text-gray-400">{wishlist?.oldPrice}</del>
            </div>
            <span className="text-sm text-gray-600">{wishlist?.brand}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-36">
            <AddToCartButton
              productData={wishlist}
              removeFromWishlist={removeFromWishlist}
              wishlist="wishlist"
            />
          </div>
          <button
            onClick={() => removeFromWishlist(wishlist?.id)}
            className="text-gray-400 hover:text-red-500 transition-colors duration-300"
            aria-label="Remove from wishlist"
          >
            <CircleX className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishListCard;
