import mongoose, { Schema } from "mongoose";
import { Brand } from "./brand-model";

const categorySchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    categoryNameBn: {
      type: String,
      default: "",
    },
    categoryImg: {
      type: String,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    descriptionBn: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    brandList: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: Brand,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);
categorySchema.index({ categoryName: "text", createdAt: -1 });

const Category =
  mongoose.models.Category ?? mongoose.model("Category", categorySchema);
export default Category;
