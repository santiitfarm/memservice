import mongoose, { Schema } from "mongoose";


const brandSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    slug: { type: String, trim: true, lowercase: true, index: true },
    description: { type: String, default: "" },
    logo: String,
    order: { type: Number, default: 0, index: true },
    featured: { type: Boolean, default: false, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
    },
    product: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);
brandSchema.index({ title: "text", createdAt: -1 });

export const Brand =
  mongoose.models.Brand ?? mongoose.model("Brand", brandSchema);
