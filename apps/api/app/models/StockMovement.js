import mongoose, { Schema } from "mongoose";

const stockMovementSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variantSku: {
      type: String,
      default: null,
      index: true,
    },
    delta: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      enum: ["order", "cancel", "return", "adjustment", "restock"],
      required: true,
      index: true,
    },
    reference: {
      type: String, // e.g. order number, return ID, or staff note
      default: "",
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    at: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

stockMovementSchema.index({ product: 1, at: -1 });

export const StockMovement =
  mongoose.models.StockMovement ||
  mongoose.model("StockMovement", stockMovementSchema);

export default StockMovement;
