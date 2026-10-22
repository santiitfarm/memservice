"use client";
import { useEffect, useState } from "react";

function DesInfoReviews({
  specificationsHtml,
  specificationsHtmlBangla,
  additionalInfo = {},
  productId,
  slug,
}) {
  const [activeTab, setActiveTab] = useState("description");
  const [language, setLanguage] = useState("en");

  // Reviews state
  const [reviewsData, setReviewsData] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState({});

  const description = {
    en: specificationsHtml ?? "<p>No English description provided.</p>",
    bn: specificationsHtmlBangla ?? "<p>বাংলায় কোন বর্ণনা প্রদান করা হয়নি।</p>",
  };

  const additional = [
    { label: "Manufacturer", value: additionalInfo.manufacturer },
    { label: "Product Type", value: additionalInfo.productType },
    { label: "Milliliters / Strength", value: additionalInfo.mililiter },
  ].filter((item) => item.value);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "reviews" && !reviewsData && (slug || productId)) {
      loadReviews();
    }
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const identifier = slug || productId;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/products/${identifier}/reviews`
      );
      const data = await res.json();
      if (data.success) {
        setReviewsData(data);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (helpfulVoted[reviewId]) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/reviews/${reviewId}/helpful`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.success) {
        setHelpfulVoted((prev) => ({ ...prev, [reviewId]: true }));
        setReviewsData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            reviews: prev.reviews.map((r) =>
              r._id === reviewId ? { ...r, helpfulCount: data.helpfulCount } : r
            ),
          };
        });
      }
    } catch (err) {
      console.error("Helpful vote error:", err);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "bn" : "en"));
  };

  const totalReviewsCount = reviewsData?.total || 0;

  return (
    <section className="mt-8">
      {/* Tabs and Toggle Button */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-3 gap-3">
        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={() => handleTabChange("description")}
            className={`px-3 py-2 rounded-md font-semibold text-sm transition-colors ${
              activeTab === "description"
                ? "bg-light-mist text-sky-blue"
                : "text-gray-600 hover:text-sky-blue"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => handleTabChange("additional")}
            className={`px-3 py-2 rounded-md font-semibold text-sm transition-colors ${
              activeTab === "additional"
                ? "bg-light-mist text-sky-blue"
                : "text-gray-600 hover:text-sky-blue"
            }`}
          >
            Additional information
          </button>
          <button
            onClick={() => handleTabChange("reviews")}
            className={`px-3 py-2 rounded-md font-semibold text-sm transition-colors ${
              activeTab === "reviews"
                ? "bg-light-mist text-sky-blue"
                : "text-gray-600 hover:text-sky-blue"
            }`}
          >
            Reviews {totalReviewsCount > 0 ? `(${totalReviewsCount})` : ""}
          </button>
        </div>

        {/* Toggle Language Button (only for description tab) */}
        {activeTab === "description" && (
          <button
            onClick={toggleLanguage}
            className="bg-light-mist px-3 py-1.5 rounded-md text-xs sm:text-sm hover:text-sky-blue transition-all"
          >
            {language === "en" ? "বাংলা দেখুন" : "Switch to English"}
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {/* Description Tab */}
        {activeTab === "description" && (
          <div
            className="text-sm text-gray-700 leading-relaxed space-y-3 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: description[language] }}
          />
        )}

        {/* Additional Information Tab */}
        {activeTab === "additional" && (
          <table className="w-full text-left border border-gray-200 rounded-md font-medium text-gray-700">
            <tbody>
              {additional.map(({ label, value }, index) => (
                <tr key={index} className="border-b last:border-b-0 text-sm">
                  <td className="px-4 py-2.5 bg-light-mist w-4/12 sm:w-3/12 font-semibold">
                    {label}
                  </td>
                  <td className="px-4 py-2.5">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {reviewsLoading && !reviewsData ? (
              <p className="text-gray-500 text-sm py-4">Loading verified reviews...</p>
            ) : reviewsData?.reviews?.length > 0 ? (
              <>
                {/* Review Rating Summary */}
                <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-xl bg-light-mist/60 border border-gray-200">
                  <div className="flex flex-col items-center justify-center sm:border-r border-gray-300 sm:pr-8">
                    <span className="text-4xl font-bold text-gray-900">
                      {reviewsData.summary.averageRating}
                    </span>
                    <div className="flex text-amber-400 text-lg my-1">
                      {"★".repeat(Math.round(reviewsData.summary.averageRating))}
                      {"☆".repeat(5 - Math.round(reviewsData.summary.averageRating))}
                    </div>
                    <span className="text-xs text-gray-500">
                      Based on {reviewsData.total} verified reviews
                    </span>
                  </div>

                  {/* Distribution bars */}
                  <div className="flex-1 space-y-1.5 text-xs text-gray-600">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviewsData.summary.distribution[star] || 0;
                      const pct = reviewsData.total > 0 ? (count / reviewsData.total) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="w-8">{star} ★</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-gray-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviewsData.reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="border border-gray-100 rounded-lg p-4 bg-white shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-sm">
                            {rev.customer?.customer_name || "Verified Customer"}
                          </span>
                          {rev.verifiedPurchase && (
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex text-amber-400 text-xs">
                        {"★".repeat(rev.rating)}
                        {"☆".repeat(5 - rev.rating)}
                      </div>

                      {rev.title && (
                        <h4 className="font-semibold text-sm text-gray-900">{rev.title}</h4>
                      )}

                      <div
                        className="text-xs text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: rev.body }}
                      />

                      <div className="flex items-center justify-between pt-2 text-xs text-gray-400 border-t border-gray-50">
                        <button
                          onClick={() => handleHelpful(rev._id)}
                          disabled={helpfulVoted[rev._id]}
                          className="hover:text-sky-blue flex items-center gap-1 transition-colors"
                        >
                          👍 Helpful ({rev.helpfulCount || 0})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 space-y-2">
                <p className="text-base font-medium">No reviews yet for this product.</p>
                <p className="text-xs text-gray-400">
                  Customers who purchase this medicine can submit verified reviews.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default DesInfoReviews;
