import mongoose, { Schema } from "mongoose";

const integrationSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["email", "payment", "courier", "tracking", "auth", "media"],
      index: true,
    },
    enabled: {
      type: Boolean,
      default: false,
      index: true,
    },
    mode: {
      type: String,
      enum: ["sandbox", "live"],
      default: "sandbox",
    },
    // Non-sensitive configuration (e.g. merchantId, baseUrl, pixelId, senderEmail)
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
    // AES-256-GCM encrypted secrets map: { [secretKey]: { iv: string, tag: string, data: string } }
    secrets: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["configured", "unconfigured", "error"],
      default: "unconfigured",
      index: true,
    },
    lastTestedAt: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
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

export const Integration =
  mongoose.models.Integration ??
  mongoose.model("Integration", integrationSchema);

export default Integration;
