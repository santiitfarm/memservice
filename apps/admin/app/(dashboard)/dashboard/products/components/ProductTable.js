import { useState } from "react";
import Link from "next/link";
import { Edit2, Trash2, Eye } from "lucide-react";
import { FullscreenIcon } from "lucide-react";
import Image from "next/image";

export default function ProductsTable({ data }) {
  return (
    <div className="overflow-y-auto h-[80vh]">
      <table className="min-w-full bg-white dark:bg-gray-900 dark:text-gray-400">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Manufacturer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              stock
            </th>

            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data?.map((product) => (
            <tr key={product._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <Image
                  src={product.images[0]}
                  width={50}
                  height={50}
                  alt={product.name}
                  className="h-12 w-12 object-cover rounded-md"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {product.manufacturer_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ৳{product.regular_price}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {product.category?.categoryName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>

              <td className="px-6 py-4 whitespace-nowrap text-center">
                <Link
                  href={`/dashboard/products/${product._id}`}
                  className="flex items-center gap-2"
                >
                  <FullscreenIcon className="w-5 h-5 text-blue-600 cursor-pointer" />
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
