import { useDeleteBannerMutation } from "@/store/slices/bannerApi";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "../DeleteModal";

const BannerTable = ({ banners, openModal }) => {
  const [
    deleteBanner,
    { isLoading: isDeleting, isSuccess: isDeleted, error, isError },
  ] = useDeleteBannerMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  const handleDelete = () => {
    deleteBanner({ bannerId: selectedBanner._id });
    setShowModal(false);
  };

  const openDeleteModal = (banner) => {
    setSelectedBanner(banner);
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setSelectedBanner(null);
  };

  useEffect(() => {
    if (isDeleted) {
      toast.success("Banner deleted successfully.");
    } else if (isError) {
      toast.error(error?.message || "Failed to delete the Banner.");
    }
  }, [isDeleted, isError, error]);

  if (!banners || banners.length === 0) {
    return (
      <div className="mt-6">
        <p className="text-gray-500 dark:text-gray-300 text-center">
          No Banners found.
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
          item={selectedBanner}
          type="Banner"
          message={`Are you sure you want to delete the Banner "${selectedBanner?.title}"?`}
        />
      )}
      <div className="mt-6 space-y-8 dark:bg-gray-900">
        <div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <h2 className="text-xl font-semibold dark:text-white p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              Banners
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Image
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {banners.map((banner) => (
                    <tr
                      key={banner._id.$oid}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                        {banner.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {banner.description}
                      </td>
                      <td className="px-4 py-3">
                        <Image
                          src={banner.image}
                          width={300}
                          alt={banner.title}
                          height={300}
                          className="h-16 w-24 object-cover rounded dark:bg-gray-800"
                        />
                      </td>
                      <td className="text-sm text-gray-500 dark:text-gray-300">
                        <button
                          onClick={() => openModal(banner, "edit")}
                          className="bg-blue-500 dark:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(banner)}
                          className="bg-red-500 dark:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BannerTable;
