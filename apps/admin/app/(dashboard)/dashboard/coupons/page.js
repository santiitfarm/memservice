"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Percent,
  DollarSign,
  Truck,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Switch from "@/components/ui/Switch";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  useFetchCouponsQuery,
  useAddCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from "@/store/slices/couponsApi";

export default function CouponsAdminPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useFetchCouponsQuery();
  const [addCoupon, { isLoading: isAdding }] = useAddCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);

  const coupons = data?.coupons || [];

  const handleDelete = async () => {
    if (!couponToDelete) return;
    try {
      await deleteCoupon(couponToDelete._id).unwrap();
      toast.success("Coupon deleted successfully");
      setCouponToDelete(null);
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to delete coupon");
    }
  };

  const handleToggleStatus = async (coupon, active) => {
    try {
      await updateCoupon({
        id: coupon._id,
        status: active ? "active" : "inactive",
      }).unwrap();
      toast.success(`Coupon "${coupon.code}" marked as ${active ? "active" : "inactive"}`);
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to update status");
    }
  };

  const getTypeBadge = (type, value) => {
    switch (type) {
      case "percent":
        return (
          <Badge variant="purple" className="gap-1 font-semibold">
            <Percent className="w-3 h-3" /> {value}% Off
          </Badge>
        );
      case "free_shipping":
        return (
          <Badge variant="info" className="gap-1 font-semibold">
            <Truck className="w-3 h-3" /> Free Shipping
          </Badge>
        );
      case "fixed":
      default:
        return (
          <Badge variant="success" className="gap-1 font-semibold">
            ৳{value} Flat Off
          </Badge>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="w-7 h-7 text-primary" />
            Coupons & Discount Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create promotional coupon codes, percentage or flat discounts, usage caps, and validity dates.
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
          <Button
            size="sm"
            onClick={() => {
              setSelectedCoupon(null);
              setIsModalOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Coupon
          </Button>
        </div>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-base font-bold text-foreground">
            All Coupons ({coupons.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-destructive">
              Failed to load coupons: {error?.data?.error || error?.message || "Unknown error"}
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Tag}
                title="No coupons created yet"
                description="Create promotional coupons to run discount marketing campaigns for your store."
                action={
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedCoupon(null);
                      setIsModalOpen(true);
                    }}
                  >
                    Create First Coupon
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Discount Type & Value</th>
                    <th className="py-3 px-4">Min Spend / Max Cap</th>
                    <th className="py-3 px-4">Usage Count</th>
                    <th className="py-3 px-4">Validity Range</th>
                    <th className="py-3 px-4 text-center">Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {coupons.map((coupon) => {
                    const isActive = coupon.status === "active";
                    const hasEnded = coupon.endsAt && new Date(coupon.endsAt) < new Date();

                    return (
                      <tr key={coupon._id} className="hover:bg-muted/30 transition-colors">
                        {/* Code */}
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-bold bg-muted/80 px-2.5 py-1 rounded-md text-foreground tracking-wider">
                            {coupon.code}
                          </span>
                        </td>

                        {/* Type & Value */}
                        <td className="py-3 px-4">
                          {getTypeBadge(coupon.type, coupon.value)}
                        </td>

                        {/* Min spend & Max discount */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <div>Min Spend: <span className="font-semibold text-foreground">৳{coupon.minSubtotal || 0}</span></div>
                            {coupon.type === "percent" && coupon.maxDiscount > 0 && (
                              <div className="text-[11px] text-muted-foreground">
                                Max Cap: ৳{coupon.maxDiscount}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Usage */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-foreground">
                            {coupon.usedCount || 0}
                          </span>
                          <span className="text-muted-foreground">
                            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " (unlimited)"}
                          </span>
                        </td>

                        {/* Validity */}
                        <td className="py-3 px-4 text-muted-foreground">
                          {coupon.endsAt ? (
                            <div className="space-y-0.5">
                              <span className={hasEnded ? "text-destructive font-semibold" : ""}>
                                Ends: {new Date(coupon.endsAt).toLocaleDateString()}
                              </span>
                              {hasEnded && <Badge variant="destructive" className="ml-1 text-[10px]">Expired</Badge>}
                            </div>
                          ) : (
                            <span>No Expiry</span>
                          )}
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={isActive}
                              onChange={(checked) => handleToggleStatus(coupon, checked)}
                            />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCoupon(coupon);
                                setIsModalOpen(true);
                              }}
                              className="h-8 w-8 p-0"
                              title="Edit Coupon"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCouponToDelete(coupon)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <CouponFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          coupon={selectedCoupon}
          onSaved={() => {
            setIsModalOpen(false);
            refetch();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(couponToDelete)}
        onClose={() => setCouponToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        description={`Are you sure you want to delete coupon code "${couponToDelete?.code}"? Customers will no longer be able to redeem it.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
      />
    </div>
  );
}

function CouponFormModal({ isOpen, onClose, coupon, onSaved }) {
  const isEdit = Boolean(coupon?._id);
  const [addCoupon, { isLoading: isAdding }] = useAddCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const isLoading = isAdding || isUpdating;

  const [code, setCode] = useState(coupon?.code || "");
  const [type, setType] = useState(coupon?.type || "percent");
  const [value, setValue] = useState(coupon?.value ?? 10);
  const [maxDiscount, setMaxDiscount] = useState(coupon?.maxDiscount ?? 0);
  const [minSubtotal, setMinSubtotal] = useState(coupon?.minSubtotal ?? 0);
  const [usageLimit, setUsageLimit] = useState(coupon?.usageLimit ?? "");
  const [endsAt, setEndsAt] = useState(
    coupon?.endsAt ? new Date(coupon.endsAt).toISOString().split("T")[0] : ""
  );
  const [status, setStatus] = useState(coupon?.status || "active");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || value == null) {
      toast.error("Code and discount value are required");
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      maxDiscount: Number(maxDiscount) || 0,
      minSubtotal: Number(minSubtotal) || 0,
      usageLimit: usageLimit !== "" ? Number(usageLimit) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      status,
    };

    try {
      if (isEdit) {
        await updateCoupon({ id: coupon._id, ...payload }).unwrap();
        toast.success("Coupon updated successfully");
      } else {
        await addCoupon(payload).unwrap();
        toast.success("Coupon created successfully");
      }
      onSaved();
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to save coupon");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Coupon" : "Create New Coupon"}
      description="Configure discount rules, threshold restrictions, and expiry."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Coupon Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
            placeholder="e.g. SUMMER20"
            required
            autoFocus
          />
          <Select
            label="Discount Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="percent">Percentage Discount (%)</option>
            <option value="fixed">Fixed Amount Off (৳)</option>
            <option value="free_shipping">Free Shipping</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={type === "percent" ? "Discount Percentage (%)" : "Discount Amount (৳ BDT)"}
            type="number"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={type === "free_shipping"}
            required
          />
          <Input
            label="Max Discount Cap (৳ BDT)"
            type="number"
            min="0"
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            placeholder="0 = no cap"
            disabled={type !== "percent"}
            helperText="Applies only to % discounts"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Minimum Subtotal (৳ BDT)"
            type="number"
            min="0"
            value={minSubtotal}
            onChange={(e) => setMinSubtotal(e.target.value)}
            placeholder="0"
          />
          <Input
            label="Total Usage Limit"
            type="number"
            min="1"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="Unlimited"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Expiration Date"
            type="date"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
          <div className="pt-6">
            <Switch
              label="Active Status"
              checked={status === "active"}
              onChange={(checked) => setStatus(checked ? "active" : "inactive")}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? "Update Coupon" : "Create Coupon"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
