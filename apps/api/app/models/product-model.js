import mongoose, { Schema } from "mongoose";

const productsSchema = new mongoose.Schema(
  {
    is_new: { type: Boolean, default: false },
    is_trending: { type: Boolean, default: false },
    is_offer: { type: Boolean, default: false },
    top_seller: { type: Boolean, default: false },
    best_seller: { type: Boolean, default: false },

    name: { type: String, required: false },
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
      index: true,
    },

    stock: { type: Number, required: false, default: 0 },
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
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    reviews: { type: Array },
  },
  {
    timestamps: true,
  }
);

// Compound text index for catalog search
productsSchema.index(
  {
    name: "text",
    generic_name: "text",
    manufacturer_name: "text",
    tags: "text",
    slug: "text",
  },
  {
    weights: {
      name: 10,
      slug: 8,
      generic_name: 6,
      manufacturer_name: 4,
      tags: 2,
    },
    name: "product_text_search",
  }
);

// Filtering and sorting indexes
productsSchema.index({ status: 1, createdAt: -1 });
productsSchema.index({ status: 1, category: 1 });
productsSchema.index({ status: 1, brand: 1 });
productsSchema.index({ status: 1, discount_price: 1, regular_price: 1 });

const Product =
  mongoose.models.Product || mongoose.model("Product", productsSchema);

export default Product;
