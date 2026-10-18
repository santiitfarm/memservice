import mongoose, { Schema } from "mongoose";

const bannerSchema = new Schema([
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    image: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    regular_price: { type: Number },
    discount_price: { type: Number },
  },
]);

export const Banner =
  mongoose.models.Banner ?? mongoose.model("Banner", bannerSchema);
