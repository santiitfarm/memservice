"use client";

import { useFetchSlidersQuery } from "../../../../../../store/slices/SliderApi";
import Error from "../../../error";
import BannerTitlte from "../BannerTitlte";
import SliderTable from "./SliderTable";

const Slider = ({ openModal }) => {
  const { data, isSuccess, isLoading, error } = useFetchSlidersQuery();

  const sliders = isSuccess ? (data?.slider || data?.sliders || []) : [];

  if (isLoading) {
    return (
      <div className="m-auto w-full py-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <Error />;
  }

  return (
    <div className="space-y-4">
      <BannerTitlte title="Hero Carousel Sliders" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Homepage Hero Sliders
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Pure image banner slider displayed beside categories on the storefront homepage.
          </p>
        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded-lg shadow-sm transition self-start sm:self-auto"
          onClick={() => openModal(null, "add")}
        >
          + Add Slider
        </button>
      </div>

      <SliderTable sliders={sliders} openModal={openModal} />
    </div>
  );
};

export default Slider;
