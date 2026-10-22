"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Switch from "@/components/ui/Switch";
import Badge from "@/components/ui/Badge";
import { useAddDeliveryZoneMutation, useUpdateDeliveryZoneMutation } from "@/store/slices/deliveryApi";
import { X, Plus } from "lucide-react";

const COMMON_DISTRICTS = [
  "Dhaka", "Gazipur", "Narayanganj", "Chittagong", "Cox's Bazar", "Sylhet",
  "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh", "Cumilla",
  "Bogura", "Jessore", "Kushtia", "Faridpur", "Tangail", "Noakhali"
];

const AVAILABLE_PAYMENTS = [
  { id: "cod", label: "Cash on Delivery" },
  { id: "bkash", label: "bKash" },
  { id: "nagad", label: "Nagad" },
  { id: "sslcommerz", label: "SSLCommerz" },
  { id: "aamarpay", label: "aamarPay" },
  { id: "shurjopay", label: "ShurjoPay" },
  { id: "manual_mfs", label: "Manual MFS" },
];

export default function ZoneFormModal({ isOpen, onClose, zone }) {
  const isEdit = Boolean(zone?._id);

  const [formData, setFormData] = useState({
    key: "",
    label: "",
    description: "",
    charge: 60,
    freeAbove: "",
    eta: "24-48 Hours",
    minOrder: 0,
    codAvailable: true,
    allowedPaymentMethods: ["cod", "bkash", "nagad", "sslcommerz"],
    districts: [],
    status: "active",
    isDefault: false,
    order: 0,
  });

  const [districtInput, setDistrictInput] = useState("");
  const [addZone, { isLoading: isAdding }] = useAddDeliveryZoneMutation();
  const [updateZone, { isLoading: isUpdating }] = useUpdateDeliveryZoneMutation();

  const isLoading = isAdding || isUpdating;

  useEffect(() => {
    if (zone && isEdit) {
      setFormData({
        key: zone.key || "",
        label: zone.label || "",
        description: zone.description || "",
        charge: zone.charge ?? 60,
        freeAbove: zone.freeAbove != null ? zone.freeAbove : "",
        eta: zone.eta || "24-48 Hours",
        minOrder: zone.minOrder ?? 0,
        codAvailable: Boolean(zone.codAvailable),
        allowedPaymentMethods: zone.allowedPaymentMethods || ["cod", "bkash", "nagad", "sslcommerz"],
        districts: zone.districts || [],
        status: zone.status || "active",
        isDefault: Boolean(zone.isDefault),
        order: zone.order ?? 0,
      });
    } else {
      setFormData({
        key: "",
        label: "",
        description: "",
        charge: 60,
        freeAbove: "",
        eta: "24-48 Hours",
        minOrder: 0,
        codAvailable: true,
        allowedPaymentMethods: ["cod", "bkash", "nagad", "sslcommerz"],
        districts: [],
        status: "active",
        isDefault: false,
        order: 0,
      });
    }
    setDistrictInput("");
  }, [zone, isEdit, isOpen]);

  const handleAddDistrict = (name) => {
    const val = name.trim();
    if (!val) return;
    if (!formData.districts.includes(val)) {
      setFormData((prev) => ({ ...prev, districts: [...prev.districts, val] }));
    }
    setDistrictInput("");
  };

  const handleRemoveDistrict = (item) => {
    setFormData((prev) => ({
      ...prev,
      districts: prev.districts.filter((d) => d !== item),
    }));
  };

  const togglePaymentMethod = (pmId) => {
    setFormData((prev) => {
      const exists = prev.allowedPaymentMethods.includes(pmId);
      return {
        ...prev,
        allowedPaymentMethods: exists
          ? prev.allowedPaymentMethods.filter((p) => p !== pmId)
          : [...prev.allowedPaymentMethods, pmId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.label || !formData.key) {
      toast.error("Zone label and key are required");
      return;
    }

    const payload = {
      ...formData,
      charge: Number(formData.charge),
      freeAbove: formData.freeAbove ? Number(formData.freeAbove) : null,
      minOrder: Number(formData.minOrder) || 0,
      order: Number(formData.order) || 0,
    };

    try {
      if (isEdit) {
        await updateZone({ id: zone._id, ...payload }).unwrap();
        toast.success("Delivery zone updated successfully");
      } else {
        await addZone(payload).unwrap();
        toast.success("Delivery zone created successfully");
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to save delivery zone");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Delivery Zone" : "Add Delivery Zone"}
      description="Configure shipping charges, free shipping threshold, ETA and coverage areas."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Label and Key */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Zone Label"
            value={formData.label}
            onChange={(e) => {
              const label = e.target.value;
              setFormData((prev) => ({
                ...prev,
                label,
                key: isEdit ? prev.key : label.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
              }));
            }}
            placeholder="e.g. Inside Dhaka"
            required
          />
          <Input
            label="Zone Key (Unique Slug)"
            value={formData.key}
            onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, "") }))}
            placeholder="e.g. inside_dhaka"
            disabled={isEdit}
            required
          />
        </div>

        {/* Charge and Free Shipping Threshold */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Delivery Charge (৳ BDT)"
            type="number"
            min="0"
            value={formData.charge}
            onChange={(e) => setFormData((prev) => ({ ...prev, charge: e.target.value }))}
            placeholder="60"
            required
          />
          <Input
            label="Free Shipping Above (৳ BDT)"
            type="number"
            min="0"
            value={formData.freeAbove}
            onChange={(e) => setFormData((prev) => ({ ...prev, freeAbove: e.target.value }))}
            placeholder="e.g. 2000 (leave blank for none)"
          />
        </div>

        {/* ETA and Min Order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Estimated Delivery Time"
            value={formData.eta}
            onChange={(e) => setFormData((prev) => ({ ...prev, eta: e.target.value }))}
            placeholder="e.g. 24-48 Hours"
            required
          />
          <Input
            label="Minimum Order Value (৳ BDT)"
            type="number"
            min="0"
            value={formData.minOrder}
            onChange={(e) => setFormData((prev) => ({ ...prev, minOrder: e.target.value }))}
            placeholder="0"
          />
        </div>

        {/* Status and Default Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/30">
          <Switch
            label="Active Zone"
            description="Customers can select this zone"
            checked={formData.status === "active"}
            onChange={(checked) =>
              setFormData((prev) => ({ ...prev, status: checked ? "active" : "inactive" }))
            }
          />
          <Switch
            label="Default Zone"
            description="Pre-selected on checkout"
            checked={formData.isDefault}
            onChange={(checked) => setFormData((prev) => ({ ...prev, isDefault: checked }))}
          />
        </div>

        <div className="p-3 rounded-lg border border-border bg-muted/30">
          <Switch
            label="Cash on Delivery (COD)"
            description="Allow cash on delivery payment in this zone"
            checked={formData.codAvailable}
            onChange={(checked) => setFormData((prev) => ({ ...prev, codAvailable: checked }))}
          />
        </div>

        {/* Allowed Payment Methods */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Allowed Payment Methods
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_PAYMENTS.map((pm) => {
              const selected = formData.allowedPaymentMethods.includes(pm.id);
              return (
                <button
                  type="button"
                  key={pm.id}
                  onClick={() => togglePaymentMethod(pm.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {pm.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Districts Coverage Picker */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            District Coverage ({formData.districts.length} selected)
          </label>
          <div className="flex gap-2">
            <Input
              value={districtInput}
              onChange={(e) => setDistrictInput(e.target.value)}
              placeholder="Type district name (e.g. Dhaka)..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddDistrict(districtInput);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddDistrict(districtInput)}
              disabled={!districtInput.trim()}
              className="gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          {/* Quick preset district pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground self-center mr-1">Presets:</span>
            {COMMON_DISTRICTS.map((dist) => {
              const has = formData.districts.includes(dist);
              return (
                <button
                  type="button"
                  key={dist}
                  onClick={() => (has ? handleRemoveDistrict(dist) : handleAddDistrict(dist))}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                    has
                      ? "bg-primary/20 text-primary border-primary/40 font-medium"
                      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {dist}
                </button>
              );
            })}
          </div>

          {/* Selected district badges */}
          {formData.districts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-card border border-border mt-2">
              {formData.districts.map((d) => (
                <Badge key={d} variant="secondary" className="gap-1 text-xs">
                  {d}
                  <button
                    type="button"
                    onClick={() => handleRemoveDistrict(d)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? "Update Zone" : "Create Zone"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
