"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const Pagination = ({
  totalItems,
  itemsPerPage,
  totalPages: totalPagesProp,
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const totalPages = totalPagesProp || Math.ceil(totalItems / itemsPerPage);

  const params = new URLSearchParams(searchParams);
  const initialPage = parseInt(params.get("page")) || 1;

  const [currentPage, setCurrentPage] = useState(initialPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (pageNumber === 1) {
      router.push(pathname);
    } else {
      params.set("page", pageNumber);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  return (
    <div className="flex justify-end my-10 gap-2">
      <button
        onClick={handlePrevious}
        className={`w-8 h-8 flex items-center justify-center rounded-full ${
          currentPage === 1
            ? "cursor-not-allowed text-gray-400"
            : "bg-gray-100 text-black"
        }`}
        disabled={currentPage === 1}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-chevron-left"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${
              currentPage === page
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-black"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={handleNext}
        className={`w-8 h-8 flex items-center justify-center rounded-full ${
          currentPage === totalPages
            ? "cursor-not-allowed text-gray-400"
            : "bg-gray-100 text-black"
        }`}
        disabled={currentPage === totalPages}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-chevron-right"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
