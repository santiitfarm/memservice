import mongoose, { Schema } from "mongoose";

const sliderSchema = new Schema([
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    image: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    regular_price: { type: Number },
    discount_price: { type: Number },
  },
]);

export const Slider =
  mongoose.models.Slider ?? mongoose.model("Slider", sliderSchema);
