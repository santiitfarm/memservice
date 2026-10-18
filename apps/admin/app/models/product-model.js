import mongoose from "mongoose";

import { Brand } from "./brand-model";

const productsSchema = new mongoose.Schema(
  {
    is_new: { type: Boolean, default: true },
    is_trending: { type: Boolean, default: false },
    is_offer: { type: Boolean, default: false },
    top_seller: { type: Boolean, default: false },
    best_seller: { type: Boolean, default: false },

    name: { type: String, required: true },
    manufacturer_name: { type: String, required: true },
    products_type: { type: String, required: true },
    generic_name: { type: String, required: true },
    strength: { type: String, required: true },
    pack_size: { type: Array, required: true },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: Brand },
    color: { type: Array, required: true },
    regular_price: { type: String, required: true },
    discount_price: { type: String, required: true },
    purchase_price: { type: String, required: true },

    short_description: { type: String },
    product_features: { type: Array },
    additional_info: { type: String },
    specificationsHtml: { type: String },
    special_tag: { type: String },
    tags: { type: Array, required: true },
    images: Array,
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },

    stock: { type: Number, required: true },
    sold_out: { type: Number, default: 0 },
    reviews: { type: Array },
  },
  {
    timestamps: true,
  }
);

productsSchema.index({
  name: "text",
  createdAt: -1,
  model: "text",
  brand: "text",
});
const Product =
  mongoose.models.Product || mongoose.model("Product", productsSchema);

export default Product;
