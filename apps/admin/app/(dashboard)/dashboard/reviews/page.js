"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  ShieldCheck,
  RotateCcw,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  useFetchReviewsQuery,
  useUpdateReviewStatusMutation,
} from "@/store/slices/reviewsApi";

const REVIEW_TABS = [
  { id: "pending", label: "Pending Approval" },
  { id: "approved", label: "Approved Live" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All Reviews" },
];

export default function ReviewsModerationPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useFetchReviewsQuery({
    status: activeTab,
    limit: 50,
  });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateReviewStatusMutation();

  const reviews = data?.reviews || [];

  const handleModerate = async (reviewId, newStatus) => {
    try {
      await updateStatus({ id: reviewId, status: newStatus }).unwrap();
      toast.success(`Review ${newStatus} successfully!`);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to update review status");
    }
  };

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await updateStatus({ id: reviewToDelete._id, status: "deleted" }).unwrap();
      toast.success("Review deleted permanently");
      setReviewToDelete(null);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to delete review");
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-primary" />
            Product Reviews & Moderation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Moderate customer product ratings, verify purchase authenticity, and approve/reject before publishing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RotateCcw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border">
        {REVIEW_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-base font-bold text-foreground">
            Review Submissions ({reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-border space-y-3">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-8 w-1/4" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-destructive">
              Failed to load reviews: {error?.data?.message || error?.message || "Unknown error"}
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={MessageSquare}
                title="No reviews in this queue"
                description={`There are currently no ${activeTab} product reviews awaiting moderation.`}
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {reviews.map((r) => {
                const isPending = r.status === "pending";
                const isApproved = r.status === "approved";
                const isRejected = r.status === "rejected";

                return (
                  <div
                    key={r._id}
                    className="p-5 hover:bg-muted/20 transition-colors flex flex-col md:flex-row items-start justify-between gap-4"
                  >
                    {/* Left: Product & Customer info */}
                    <div className="space-y-3 flex-1">
                      {/* Product details */}
                      <div className="flex items-center gap-3">
                        <Image
                          src={r.product?.images?.[0] || "/placeholder.png"}
                          alt={r.product?.name || "Product"}
                          width={44}
                          height={44}
                          className="rounded-lg object-cover bg-muted border border-border h-11 w-11 shrink-0"
                        />
                        <div>
                          <Link
                            href={`/dashboard/products/${r.product?._id}`}
                            className="font-bold text-foreground text-sm hover:text-primary transition-colors"
                          >
                            {r.product?.name || "Unknown Product"}
                          </Link>
                          <div className="text-xs text-muted-foreground">
                            {r.product?.slug ? `/${r.product.slug}` : ""}
                          </div>
                        </div>
                      </div>

                      {/* Rating & Verified badge */}
                      <div className="flex items-center gap-2">
                        {renderStars(r.rating)}
                        <span className="font-bold text-xs text-foreground">{r.rating}/5</span>

                        {r.verifiedPurchase && (
                          <Badge variant="success" className="gap-1 text-[11px] py-0 px-2 h-5">
                            <ShieldCheck className="w-3 h-3" /> Verified Buyer
                          </Badge>
                        )}

                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>

                      {/* Review body */}
                      {r.title && (
                        <h4 className="font-semibold text-foreground text-xs">{r.title}</h4>
                      )}
                      <p className="text-xs text-foreground/90 bg-muted/30 p-3 rounded-lg border border-border/60">
                        {r.body}
                      </p>

                      {/* Customer info */}
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>Submitted by:</span>
                        <span className="font-semibold text-foreground">
                          {r.customer?.customer_name || "Customer"}
                        </span>
                        {r.customer?.phone_number && (
                          <span className="font-mono">({r.customer.phone_number})</span>
                        )}
                      </div>
                    </div>

                    {/* Right: Moderation Actions & Status */}
                    <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 shrink-0 pt-2 md:pt-0">
                      <div>
                        {isApproved && (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </Badge>
                        )}
                        {isPending && (
                          <Badge variant="warning" className="gap-1">
                            <Clock className="w-3.5 h-3.5" /> Pending Review
                          </Badge>
                        )}
                      </div>

                      {/* One-click Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        {!isApproved && (
                          <Button
                            size="sm"
                            onClick={() => handleModerate(r._id, "approved")}
                            disabled={isUpdating}
                            className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </Button>
                        )}

                        {!isRejected && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerate(r._id, "rejected")}
                            disabled={isUpdating}
                            className="h-8 gap-1 text-xs text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReviewToDelete(r)}
                          disabled={isUpdating}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(reviewToDelete)}
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        description="Are you sure you want to permanently delete this customer review? Rating stats for this product will be recalculated."
        confirmText="Delete Review"
        variant="danger"
      />
    </div>
  );
}
