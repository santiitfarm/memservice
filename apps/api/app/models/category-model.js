import mongoose, { Schema } from "mongoose";
import { Brand } from "./brand-model";

const categorySchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    categoryImg: {
      type: String,
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
