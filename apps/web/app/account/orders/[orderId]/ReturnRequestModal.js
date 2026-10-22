"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { X, AlertCircle, CheckCircle2, RotateCcw, Upload, Loader2 } from "lucide-react";

export default function ReturnRequestModal({ isOpen, onClose, order, onSuccess }) {
  const { data: session } = useSession();

  const [selectedItems, setSelectedItems] = useState(() => {
    return (order?.items || []).map((item) => ({
      productId: item.product_id?._id || item.product_id || item._id,
      name: item.product_name || "Item",
      maxQty: item.quantity || 1,
      quantity: 1,
      selected: true,
    }));
  });

  const [reason, setReason] = useState("damaged");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const toggleItem = (index) => {
    setSelectedItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, selected: !it.selected } : it))
    );
  };

  const updateQuantity = (index, qty) => {
    setSelectedItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, quantity: Math.max(1, Math.min(it.maxQty, qty)) } : it))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const itemsToReturn = selectedItems
      .filter((it) => it.selected)
      .map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        reason,
      }));

    if (itemsToReturn.length === 0) {
      setErrorMsg("Please select at least one item to return.");
      return;
    }

    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/returns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          orderId: order._id,
          items: itemsToReturn,
          reason,
          notes: notes.trim(),
          images: imageUrl.trim() ? [imageUrl.trim()] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit return request.");
      }

      setSuccessMsg("Your return request has been submitted successfully. Our support team will review it.");
      if (onSuccess) onSuccess(data.returnRequest);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || "An error occurred while submitting your return.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Request Return / Refund</h3>
              <p className="text-xs text-muted-foreground font-mono">Order #{order.order_number}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Items Selector */}
          <div>
            <label className="block font-bold text-foreground mb-2">Select Items to Return:</label>
            <div className="space-y-2 border border-border rounded-xl p-3 bg-muted/30">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 py-1.5 border-b border-border/50 last:border-0">
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleItem(idx)}
                      className="rounded border-border text-primary focus:ring-primary/20"
                    />
                    <span className="font-medium text-foreground truncate">{item.name}</span>
                  </label>

                  {item.selected && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-muted-foreground">Qty:</span>
                      <select
                        value={item.quantity}
                        onChange={(e) => updateQuantity(idx, Number(e.target.value))}
                        className="py-1 px-2 rounded-lg border border-border bg-background text-foreground"
                      >
                        {Array.from({ length: item.maxQty }, (_, i) => i + 1).map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block font-bold text-foreground mb-1.5">Reason for Return *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20"
            >
              <option value="damaged">Item damaged or defective</option>
              <option value="wrong_item">Received wrong item / dosage</option>
              <option value="not_as_described">Not as described</option>
              <option value="expired">Near expiration or expired</option>
              <option value="other">Other issue</option>
            </select>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block font-bold text-foreground mb-1.5">Photo URL of Product (Optional):</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... photo link of received product"
              className="w-full py-2 px-3 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-foreground mb-1.5">Additional Details / Notes:</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the issue with the delivered medicine or package..."
              className="w-full py-2 px-3 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Boolean(successMsg)}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Submit Return Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
