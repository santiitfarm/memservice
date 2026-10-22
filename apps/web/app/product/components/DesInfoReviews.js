"use client";

import { useEffect, useState } from "react";
import { Star, CheckCircle, ThumbsUp, Send, Loader2, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function DesInfoReviews({
  specificationsHtml,
  specificationsHtmlBangla,
  additionalInfo = {},
  productId,
  slug,
}) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("description");
  const [language, setLanguage] = useState("en");

  // Reviews state
  const [reviewsData, setReviewsData] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState({});

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const description = {
    en: specificationsHtml || "<p>No English description available for this product.</p>",
    bn: specificationsHtmlBangla || "<p>এই পণ্যের জন্য বাংলায় কোনো বর্ণনা পাওয়া যায়নি।</p>",
  };

  const additional = [
    { label: "Manufacturer", value: additionalInfo.manufacturer },
    { label: "Product Type", value: additionalInfo.productType },
    { label: "Strength", value: additionalInfo.mililiter },
  ].filter((item) => Boolean(item.value));

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const identifier = slug || productId;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/products/${identifier}/reviews`);
      const data = await res.json();
      if (data?.success) {
        setReviewsData(data);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "reviews" && !reviewsData) {
      loadReviews();
    }
  };

  const handleHelpful = async (reviewId) => {
    if (helpfulVoted[reviewId]) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/reviews/${reviewId}/helpful`, { method: "POST" });
      const data = await res.json();
      if (data?.success) {
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewBody.trim()) {
      toast.error("Please enter a review description");
      return;
    }

    setSubmittingReview(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({
          product: productId || slug,
          rating: reviewRating,
          title: reviewTitle.trim(),
          body: reviewBody.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      toast.success("Thank you! Your review has been submitted and is pending moderation.");
      setReviewTitle("");
      setReviewBody("");
      setReviewRating(5);
    } catch (err) {
      toast.error(err.message || "Submission failed. Please make sure you are logged in.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const totalReviewsCount = reviewsData?.total || 0;

  return (
    <section className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border pb-3 gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleTabChange("description")}
            className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
              activeTab === "description"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("specifications")}
            className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
              activeTab === "specifications"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Specifications
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("reviews")}
            className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
              activeTab === "reviews"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Customer Reviews {totalReviewsCount > 0 ? `(${totalReviewsCount})` : ""}
          </button>
        </div>

        {activeTab === "description" && (
          <button
            type="button"
            onClick={() => setLanguage((prev) => (prev === "en" ? "bn" : "en"))}
            className="px-3 py-1.5 rounded-lg border border-border bg-muted/60 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            {language === "en" ? "বাংলায় দেখুন" : "Switch to English"}
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="pt-6">
        {/* 1. Description Tab */}
        {activeTab === "description" && (
          <div
            className="text-xs sm:text-sm leading-relaxed text-foreground space-y-3 prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: description[language] }}
          />
        )}

        {/* 2. Specifications Tab */}
        {activeTab === "specifications" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <tbody>
                  {additional.map(({ label, value }, idx) => (
                    <tr key={idx} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 bg-muted/40 font-semibold w-1/3 text-foreground">
                        {label}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Customer Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-8">
            {reviewsLoading && !reviewsData ? (
              <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading reviews...</span>
              </div>
            ) : (
              <>
                {/* Rating Distribution Box */}
                {reviewsData?.summary && (
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-muted/30 border border-border">
                    <div className="flex flex-col items-center justify-center sm:pr-8 sm:border-r border-border text-center">
                      <span className="text-4xl sm:text-5xl font-black text-foreground">
                        {reviewsData.summary.averageRating || "5.0"}
                      </span>
                      <div className="flex items-center text-amber-500 my-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < Math.round(reviewsData.summary.averageRating || 5)
                                ? "fill-amber-500 text-amber-500"
                                : "text-muted-foreground/30"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Based on {reviewsData.total} reviews
                      </span>
                    </div>

                    {/* 5-to-1 Star Distribution bars */}
                    <div className="flex-1 w-full space-y-1.5 text-xs text-muted-foreground">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviewsData.summary.distribution?.[star] || 0;
                        const pct = reviewsData.total > 0 ? (count / reviewsData.total) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="w-10 text-foreground font-medium">{star} ★</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-6 text-right font-medium">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Approved Reviews List */}
                <div className="space-y-4">
                  {reviewsData?.reviews?.length > 0 ? (
                    reviewsData.reviews.map((rev) => (
                      <div
                        key={rev._id}
                        className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs sm:text-sm text-foreground">
                              {rev.customer?.customer_name || "Verified Customer"}
                            </span>
                            {rev.verifiedPurchase && (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <CheckCircle size={10} /> Verified Purchase
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(rev.createdAt).toLocaleDateString("en-GB")}
                          </span>
                        </div>

                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={i < rev.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}
                            />
                          ))}
                        </div>

                        {rev.title && (
                          <h4 className="font-bold text-xs sm:text-sm text-foreground">
                            {rev.title}
                          </h4>
                        )}

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {rev.body}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                          <button
                            type="button"
                            onClick={() => handleHelpful(rev._id)}
                            disabled={helpfulVoted[rev._id]}
                            className={`flex items-center gap-1.5 transition-colors ${
                              helpfulVoted[rev._id]
                                ? "text-primary font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <ThumbsUp size={13} />
                            <span>Helpful ({rev.helpfulCount || 0})</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-xs text-muted-foreground">
                      No customer reviews yet. Be the first to review this product!
                    </p>
                  )}
                </div>

                {/* Review Submit Form for Verified Buyers / Customers */}
                <div className="rounded-2xl border border-border bg-muted/20 p-5 sm:p-6 space-y-4">
                  <h4 className="font-bold text-sm sm:text-base text-foreground">
                    Write a Review
                  </h4>

                  {session ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {/* Rating selection */}
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                          Your Rating:
                        </label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setReviewRating(s)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                size={22}
                                className={
                                  s <= reviewRating
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-muted-foreground/40"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Title */}
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Review Headline (Optional):
                        </label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="e.g. Highly effective and authentic medicine"
                          className="w-full h-10 px-3.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      {/* Review Body */}
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Review Details:
                        </label>
                        <textarea
                          rows={3}
                          value={reviewBody}
                          onChange={(e) => setReviewBody(e.target.value)}
                          placeholder="Share your experience with this product, its packaging, and effectiveness..."
                          required
                          className="w-full p-3.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {submittingReview ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        <span>Submit Review</span>
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Please log in to your customer account to write a verified review.
                      </p>
                      <Link
                        href="/account/login"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        <LogIn size={14} />
                        <span>Sign In to Review</span>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
