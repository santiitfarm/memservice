import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiExternalLink, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useDeleteSliderMutation } from "../../../../../../store/slices/SliderApi";
import DeleteConfirmationModal from "../DeleteModal";

const SliderTable = ({ sliders, openModal }) => {
  const [
    deleteSlider,
    { isLoading: isDeleting, isSuccess: isDeleted, error, isError },
  ] = useDeleteSliderMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState(null);

  const handleDelete = () => {
    deleteSlider({ sliderId: selectedSlider._id });
    setShowModal(false);
  };

  const openDeleteModal = (slider) => {
    setSelectedSlider(slider);
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setSelectedSlider(null);
  };

  useEffect(() => {
    if (isDeleted) {
      toast.success("Slider deleted successfully.");
    } else if (isError) {
      toast.error(error?.message || "Failed to delete the slider.");
    }
  }, [isDeleted, isError, error]);

  if (!sliders || sliders.length === 0) {
    return (
      <div className="mt-6 p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No custom slider banners uploaded yet. The storefront is currently displaying the default fallback slides. Click &quot;Add Slider&quot; to upload your first banner!
        </p>
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <DeleteConfirmationModal
          onClose={closeDeleteModal}
          onDelete={handleDelete}
          item={selectedSlider}
          type="slider"
          message={`Are you sure you want to delete the slider "${selectedSlider?.title || "Banner"}"?`}
        />
      )}
      <div className="mt-6 space-y-4">
        {/* Table Section */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3.5">Banner Image</th>
                  <th className="px-5 py-3.5">Title / Alt</th>
                  <th className="px-5 py-3.5">Redirect Link</th>
                  <th className="px-4 py-3.5 text-center">Order</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sliders.map((slider) => {
                  const targetLink = slider.link || "/shop";
                  const isActive = (slider.status || "active") === "active";

                  return (
                    <tr
                      key={slider._id}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* Image Thumbnail */}
                      <td className="px-5 py-3.5">
                        <div className="relative w-36 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                          {slider.image ? (
                            <Image
                              src={slider.image}
                              fill
                              alt={slider.title || "Banner"}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title / Alt */}
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-gray-100">
                        {slider.title || "Banner"}
                      </td>

                      {/* Redirect Link */}
                      <td className="px-5 py-3.5">
                        <a
                          href={targetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs max-w-xs truncate"
                        >
                          <span className="truncate">{targetLink}</span>
                          <FiExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      </td>

                      {/* Order */}
                      <td className="px-4 py-3.5 text-center font-mono text-xs text-gray-700 dark:text-gray-300">
                        <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 font-semibold">
                          {slider.order ?? 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openModal(slider, "edit")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(slider)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default SliderTable;
