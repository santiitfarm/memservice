import mongoose, { Schema } from "mongoose";


const brandSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    logo: String,
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    status: {
      type: String,
      defaultValue: "active",
      enum: ["active", "inactive"],
    },
    product: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);
brandSchema.index({ title: "text", createdAt: -1 });

export const Brand =
  mongoose.models.Brand ?? mongoose.model("Brand", brandSchema);
