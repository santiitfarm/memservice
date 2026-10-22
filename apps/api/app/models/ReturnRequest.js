import mongoose, { Schema } from "mongoose";

const returnItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantSku: {
      type: String,
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const returnHistorySchema = new Schema(
  {
    status: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const returnRequestSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "CustomerProfile",
      required: true,
      index: true,
    },
    items: {
      type: [returnItemSchema],
      required: true,
      validate: [(v) => Array.isArray(v) && v.length > 0, "At least one item is required"],
    },
    reason: {
      type: String,
      enum: ["damaged", "wrong_item", "not_as_described", "expired", "other"],
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: [
        "requested",
        "approved",
        "rejected",
        "received",
        "refunded",
        "closed",
      ],
      default: "requested",
      index: true,
    },
    refund: {
      method: { type: String, default: "" }, // bkash, nagad, bank, store_credit, cash
      amount: { type: Number, default: 0 },
      reference: { type: String, default: "" },
      processedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      processedAt: { type: Date, default: null },
    },
    history: {
      type: [returnHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

returnRequestSchema.index({ customer: 1, createdAt: -1 });
returnRequestSchema.index({ order: 1, status: 1 });

export const ReturnRequest =
  mongoose.models.ReturnRequest ||
  mongoose.model("ReturnRequest", returnRequestSchema);

export default ReturnRequest;
