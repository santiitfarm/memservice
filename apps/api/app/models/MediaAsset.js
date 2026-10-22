import mongoose, { Schema } from "mongoose";

const mediaAssetSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    mimeType: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    folder: {
      type: String,
      default: "general",
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export const MediaAsset =
  mongoose.models.MediaAsset ??
  mongoose.model("MediaAsset", mediaAssetSchema);

export default MediaAsset;
