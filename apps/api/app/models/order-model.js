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
      zoneKey: { type: String },
      zoneLabel: { type: String },
      charge: { type: Number },
      eta: { type: String },
      district: { type: String },
      area: { type: String },
    },
    payment_info: {
      method: { type: String },
      provider: { type: String },
      status: {
        type: String,
        enum: ["paid", "unpaid", "partially-paid", "pending"],
        default: "unpaid",
      },
      amount: { type: String, required: true },
      transaction_id: { type: String },
      transaction_number: { type: String },
      transaction_amount: { type: String },
      transaction_status: { type: String },
    },
    payment_url: { type: String },
    tracking_number: { type: String },
    shipping_date: { type: Date },
    delivery_date: { type: Date },
    requires_tracking: { type: Boolean, default: false },
    requires_payment_receipt: { type: Boolean, default: false },
    requiresAttention: { type: Boolean, default: false },
    requiresRefund: { type: Boolean, default: false },
    paymentID: { type: String },
    shipment: {
      provider: { type: String },
      consignmentId: { type: String },
      trackingCode: { type: String },
      trackingUrl: { type: String },
      status: {
        type: String,
        enum: ["pending", "picked_up", "in_transit", "delivered", "returned", "cancelled"],
        default: "pending",
      },
      fee: { type: Number, default: 0 },
      bookedAt: { type: Date },
      bookedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      history: [
        {
          status: { type: String },
          message: { type: String },
          timestamp: { type: Date, default: Date.now },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);
orderSchema.index({ createdAt: -1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

// analytics for monthly sales report

export const Order =
  mongoose.models.Order ?? mongoose.model("Order", orderSchema);
