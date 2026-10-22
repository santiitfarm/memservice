import mongoose, { Schema } from "mongoose";

const sliderSchema = new Schema(
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
      default: "home_main",
      index: true,
    },
  },
  { timestamps: true }
);

export const Slider =
  mongoose.models.Slider ?? mongoose.model("Slider", sliderSchema);

export default Slider;
