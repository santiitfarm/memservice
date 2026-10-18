import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    color: {
      type: String,
    },
    manufacturer: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

const orderSchema = new Schema(
  {
    order_number: { type: String, unique: true, required: true },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "CustomerProfile",
      required: true,
    },
    items: [productSchema],
    total_amount: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shipping_details: {
      address: { type: String, required: true },
      shipping_charge: { type: String, default: "0" },
      shipping_method: { type: String },
    },
    payment_info: {
      method: { type: String },
      status: {
        type: String,
        enum: ["paid", "unpaid", "partially-paid"],
        default: "unpaid",
      },
      amount: { type: String, required: true },
      transaction_id: { type: String },
      transaction_number: { type: String },
      transaction_amount: { type: String },
      transaction_status: { type: String },
    },
    tracking_number: { type: String },
    shipping_date: { type: Date },
    delivery_date: { type: Date },
    requires_tracking: { type: Boolean, default: false },
    requires_payment_receipt: { type: Boolean, default: false },
    requiresAttention: { type: Boolean, default: false },
    requiresRefund: { type: Boolean, default: false },
    paymentID: { type: String },
  },
  {
    timestamps: true,
  }
);
orderSchema.index({ createdAt: -1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

// analytics for monthly sales report

export const Order =
  mongoose.models.Order ?? mongoose.model("Order", orderSchema);
