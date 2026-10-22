import mongoose, { Schema } from "mongoose";

const pageSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    titleBn: {
      type: String,
      default: "",
      trim: true,
    },
    template: {
      type: String,
      enum: ["default", "about", "legal", "contact"],
      default: "default",
    },
    content: {
      type: String,
      default: "",
    },
    contentBn: {
      type: String,
      default: "",
    },
    blocks: [
      {
        type: { type: String, required: true },
        content: { type: Schema.Types.Mixed, default: {} },
      },
    ],
    seo: {
      title: { type: String, default: "" },
      titleBn: { type: String, default: "" },
      description: { type: String, default: "" },
      descriptionBn: { type: String, default: "" },
      ogImage: { type: String, default: "" },
      noIndex: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export const Page =
  mongoose.models.Page ?? mongoose.model("Page", pageSchema);

export default Page;
