import mongoose, { Schema } from "mongoose";

const bannerSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    image: { type: String, required: true },
    imageDesktop: { type: String },
    imageMobile: { type: String },
    alt: { type: String, default: "" },
    title: { type: String, required: true },
    description: { type: String },
    regular_price: { type: Number },
    discount_price: { type: Number },
    link: { type: String, default: "" },
    order: { type: Number, default: 0, index: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    placement: {
      type: String,
      default: "home_middle",
      index: true,
    },
  },
  { timestamps: true }
);

export const Banner =
  mongoose.models.Banner ?? mongoose.model("Banner", bannerSchema);

export default Banner;
