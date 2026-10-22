import mongoose, { Schema } from "mongoose";

const dataRequestSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "CustomerProfile",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["export", "delete"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected"],
      default: "pending",
      index: true,
    },
    downloadUrl: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

dataRequestSchema.index({ customer: 1, createdAt: -1 });

export const DataRequest =
  mongoose.models.DataRequest ||
  mongoose.model("DataRequest", dataRequestSchema);

export default DataRequest;
