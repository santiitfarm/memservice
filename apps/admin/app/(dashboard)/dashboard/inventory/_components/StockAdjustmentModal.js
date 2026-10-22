"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useAdjustStockMutation } from "@/store/slices/stockApi";

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  item, // { productId, productName, variantSku, variantLabel, currentStock }
}) {
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("restock");
  const [reference, setReference] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [adjustStock, { isLoading }] = useAdjustStockMutation();

  useEffect(() => {
    if (isOpen) {
      setDelta("");
      setReason("restock");
      setReference("");
      setErrorMsg("");
    }
  }, [isOpen, item]);

  if (!item) return null;

  const currentStock = Number(item.currentStock || 0);
  const numericDelta = Number(delta) || 0;
  const newStock = currentStock + numericDelta;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!delta || numericDelta === 0) {
      setErrorMsg("Please enter a non-zero adjustment delta (+ or -).");
      return;
    }

    if (newStock < 0) {
      setErrorMsg(`Adjustment would result in negative stock (${newStock}). Current is ${currentStock}.`);
      return;
    }

    try {
      const res = await adjustStock({
        productId: item.productId,
        variantSku: item.variantSku || undefined,
        delta: numericDelta,
        reason,
        reference: reference.trim(),
      }).unwrap();

      toast.success(res?.message || "Stock adjusted successfully");
      onClose();
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to adjust stock";
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Stock Adjustment"
      description="Adjust inventory quantity and log an audit movement record."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Info Box */}
        <div className="rounded-lg bg-muted/50 p-3 border border-border space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Target Item
          </div>
          <div className="font-semibold text-foreground text-sm">
            {item.productName}
          </div>
          {item.variantSku && (
            <div className="text-xs text-muted-foreground">
              Variant: <span className="font-medium text-foreground">{item.variantLabel || item.variantSku}</span>{" "}
              (SKU: <span className="font-mono text-primary">{item.variantSku}</span>)
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
            <span className="text-muted-foreground">Current Stock:</span>
            <span className="font-bold text-foreground text-sm">{currentStock}</span>
          </div>
        </div>

        {/* Delta Input */}
        <div>
          <Input
            label="Stock Delta (+ / -)"
            type="number"
            value={delta}
            onChange={(e) => {
              setDelta(e.target.value);
              setErrorMsg("");
            }}
            placeholder="e.g. +10, -3"
            helperText="Enter positive number to add stock, negative to subtract."
            required
            autoFocus
          />
        </div>

        {/* New Stock Calculation Preview */}
        {delta !== "" && !isNaN(numericDelta) && (
          <div
            className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
              newStock < 0
                ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
            }`}
          >
            <span>Resulting Stock:</span>
            <span className="font-bold text-sm">
              {currentStock} {numericDelta >= 0 ? `+ ${numericDelta}` : `- ${Math.abs(numericDelta)}`} = {newStock}
            </span>
          </div>
        )}

        {/* Reason Select */}
        <div>
          <Select
            label="Reason for Adjustment"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          >
            <option value="restock">Restock (Received from Supplier)</option>
            <option value="adjustment">Inventory Audit / Discrepancy</option>
            <option value="damaged">Damaged / Expired / Written Off</option>
            <option value="return">Customer Return</option>
          </Select>
        </div>

        {/* Note / Reference Input */}
        <div>
          <Input
            label="Reference / Note (Optional)"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. PO #9872, shelf breakage, physical audit"
          />
        </div>

        {errorMsg && (
          <p className="text-xs text-destructive font-medium bg-destructive/10 p-2 rounded-md">
            {errorMsg}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!delta || numericDelta === 0 || newStock < 0}
          >
            Confirm Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
