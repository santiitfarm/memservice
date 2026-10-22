import mongoose, { Schema } from "mongoose";

const deliveryZoneSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    charge: {
      type: Number,
      required: true,
      min: 0,
    },
    freeAbove: {
      type: Number,
      default: null,
    },
    eta: {
      type: String,
      default: "24-48 Hours",
    },
    etaDaysMin: {
      type: Number,
      default: 1,
    },
    etaDaysMax: {
      type: Number,
      default: 3,
    },
    codAvailable: {
      type: Boolean,
      default: true,
    },
    allowedPaymentMethods: {
      type: [String],
      default: ["cod", "bkash", "nagad", "sslcommerz"],
    },
    districts: {
      type: [String],
      default: [],
    },
    areas: {
      type: [String],
      default: [],
    },
    minOrder: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const DeliveryZone =
  mongoose.models.DeliveryZone ??
  mongoose.model("DeliveryZone", deliveryZoneSchema);

export default DeliveryZone;
