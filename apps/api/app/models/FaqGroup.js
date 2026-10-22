import mongoose, { Schema } from "mongoose";

const faqGroupSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

export const FaqGroup =
  mongoose.models.FaqGroup ?? mongoose.model("FaqGroup", faqGroupSchema);

export default FaqGroup;
