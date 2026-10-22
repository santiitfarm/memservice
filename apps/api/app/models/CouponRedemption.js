import mongoose, { Schema } from "mongoose";

const couponRedemptionSchema = new Schema(
  {
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "CustomerProfile",
      default: null,
      index: true,
    },
    phone: {
      type: String,
      default: null,
      index: true,
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

couponRedemptionSchema.index({ coupon: 1, customer: 1 });
couponRedemptionSchema.index({ coupon: 1, phone: 1 });

export const CouponRedemption =
  mongoose.models.CouponRedemption ||
  mongoose.model("CouponRedemption", couponRedemptionSchema);

export default CouponRedemption;
