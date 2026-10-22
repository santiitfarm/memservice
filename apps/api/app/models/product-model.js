import mongoose, { Schema } from "mongoose";

const productsSchema = new mongoose.Schema(
  {
    is_new: { type: Boolean, default: false },
    is_trending: { type: Boolean, default: false },
    is_offer: { type: Boolean, default: false },
    top_seller: { type: Boolean, default: false },
    best_seller: { type: Boolean, default: false },

    name: { type: String, required: false },
    manufacturer_name: { type: String, required: false },
    products_type: { type: String, required: false },
    generic_name: { type: String, required: false },
    strength: { type: String, required: false },
    pack_size: { type: Array, required: false },

    category: { type: Schema.Types.ObjectId, ref: "Category" },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    color: { type: Array, required: false },
    regular_price: { type: Number, default: 0 },
    discount_price: { type: Number, default: 0 },
    purchase_price: { type: Number, default: 0 },

    short_description: { type: String },
    product_features: { type: Array },
    additional_info: { type: String },
    specificationsHtml: { type: String },
    specificationsHtmlBangla: { type: String },
    special_tag: { type: String },
    tags: { type: Array, required: false },
    images: Array,
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },

    stock: { type: Number, required: false },
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
});
const Product =
  mongoose.models.Product || mongoose.model("Product", productsSchema);

export default Product;
