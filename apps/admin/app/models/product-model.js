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
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    slugHistory: {
      type: [String],
      default: [],
    },
    manufacturer_name: { type: String, required: true },
    products_type: { type: String, required: true },
    generic_name: { type: String, required: true },
    strength: { type: String, required: true },
    pack_size: { type: Array, required: true },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: Brand },
    color: { type: Array, required: true },
    regular_price: { type: Number, default: 0 },
    discount_price: { type: Number, default: 0 },
    purchase_price: { type: Number, default: 0 },

    short_description: { type: String },
    product_features: { type: Array },
    additional_info: { type: String },
    specificationsHtml: { type: String },
    specificationsHtmlBangla: { type: String },
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
    lowStockThreshold: { type: Number, default: 5 },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    variants: [
      {
        sku: { type: String, sparse: true },
        label: { type: String },
        attributes: {
          packSize: { type: String },
          color: { type: String },
          strength: { type: String },
        },
        regularPrice: { type: Number, default: 0 },
        discountPrice: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
        image: { type: String },
        status: {
          type: String,
          enum: ["active", "inactive"],
          default: "active",
        },
      },
    ],
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
